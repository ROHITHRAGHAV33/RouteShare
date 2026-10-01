from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.deps import require_roles
from app.models import User, UserRole, TruckRoute, Booking, RouteStatus, BookingStatus, AuditLog
from app.schemas import UserOut, TruckRouteOut, BookingOut, ReportSummary

router = APIRouter(prefix="/api/admin", tags=["Administration"])


@router.get("/users", response_model=List[UserOut])
def list_users(
    role: Optional[UserRole] = None,
    search: Optional[str] = Query(None, description="Search by name or email"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        like = f"%{search}%"
        query = query.filter((User.full_name.ilike(like)) | (User.email.ilike(like)))
    return query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()


@router.patch("/users/{user_id}/deactivate", response_model=UserOut)
def deactivate_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.add(AuditLog(user_id=current_user.id, action="USER_DEACTIVATED", details=f"User {user.email} deactivated"))
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    """BR: Only Administrators shall have permission to delete user accounts."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    db.add(AuditLog(user_id=current_user.id, action="USER_DELETED", details=f"User {user.email} deleted"))
    db.delete(user)
    db.commit()
    return None


@router.get("/routes", response_model=List[TruckRouteOut])
def all_routes(
    status_filter: Optional[RouteStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    query = db.query(TruckRoute)
    if status_filter:
        query = query.filter(TruckRoute.status == status_filter)
    return query.order_by(TruckRoute.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()


@router.get("/bookings", response_model=List[BookingOut])
def all_bookings(
    status_filter: Optional[BookingStatus] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    query = db.query(Booking)
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    return query.order_by(Booking.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()


@router.get("/reports/summary", response_model=ReportSummary)
def report_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.admin)),
):
    """Route utilization, booking trends, vehicle occupancy, and revenue statistics."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_providers = db.query(func.count(User.id)).filter(User.role == UserRole.truck_provider).scalar() or 0
    total_shippers = db.query(func.count(User.id)).filter(User.role == UserRole.shipper).scalar() or 0
    total_drivers = db.query(func.count(User.id)).filter(User.role == UserRole.driver).scalar() or 0

    total_routes = db.query(func.count(TruckRoute.id)).scalar() or 0
    active_routes = db.query(func.count(TruckRoute.id)).filter(TruckRoute.status == RouteStatus.active).scalar() or 0
    completed_routes = db.query(func.count(TruckRoute.id)).filter(TruckRoute.status == RouteStatus.completed).scalar() or 0

    total_bookings = db.query(func.count(Booking.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(Booking.cost), 0.0)).filter(
        Booking.status != BookingStatus.cancelled
    ).scalar() or 0.0

    routes = db.query(TruckRoute).all()
    if routes:
        utilization = sum(
            (r.total_capacity_kg - r.available_capacity_kg) / r.total_capacity_kg
            for r in routes
            if r.total_capacity_kg > 0
        ) / len(routes) * 100
    else:
        utilization = 0.0

    return ReportSummary(
        total_users=total_users,
        total_providers=total_providers,
        total_shippers=total_shippers,
        total_drivers=total_drivers,
        total_routes=total_routes,
        active_routes=active_routes,
        completed_routes=completed_routes,
        total_bookings=total_bookings,
        total_revenue=round(total_revenue, 2),
        average_capacity_utilization_pct=round(utilization, 2),
    )
