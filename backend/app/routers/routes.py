import random
import string
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user, require_roles
from app.models import User, UserRole, TruckRoute, RouteStatus, AuditLog
from app.schemas import TruckRouteCreate, TruckRouteUpdate, TruckRouteOut, DriverAssign

router = APIRouter(prefix="/api/routes", tags=["Truck Routes"])


def generate_route_code() -> str:
    return "RT-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


@router.post("", response_model=TruckRouteOut, status_code=201)
def create_route(
    payload: TruckRouteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.truck_provider)),
):
    """FR-7, FR-8, FR-9: Truck Provider registers a return route with capacity."""
    code = generate_route_code()
    while db.query(TruckRoute).filter(TruckRoute.route_code == code).first():
        code = generate_route_code()

    vehicle_id = None
    if payload.vehicle_id:
        from app.models import Vehicle
        vehicle = db.query(Vehicle).filter(Vehicle.id == payload.vehicle_id, Vehicle.provider_id == current_user.id).first()
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found or does not belong to you")
        vehicle_id = vehicle.id

    route = TruckRoute(
        route_code=code,
        provider_id=current_user.id,
        vehicle_id=vehicle_id,
        source_city=payload.source_city.strip(),
        destination_city=payload.destination_city.strip(),
        intermediate_hubs=payload.intermediate_hubs,
        return_date=payload.return_date,
        total_capacity_kg=payload.total_capacity_kg,
        available_capacity_kg=payload.total_capacity_kg,
        rate_per_kg=payload.rate_per_kg,
        status=RouteStatus.active,
    )
    db.add(route)
    db.commit()
    db.refresh(route)

    db.add(AuditLog(user_id=current_user.id, action="ROUTE_CREATED", details=f"Route {code} created"))
    db.commit()
    return route


@router.get("/my", response_model=List[TruckRouteOut])
def my_routes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.truck_provider)),
):
    """FR-11: Display all active routes in the provider dashboard."""
    return (
        db.query(TruckRoute)
        .filter(TruckRoute.provider_id == current_user.id)
        .order_by(TruckRoute.created_at.desc())
        .all()
    )


@router.get("/available-drivers", response_model=list)
def list_drivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.truck_provider, UserRole.admin)),
):
    drivers = db.query(User).filter(User.role == UserRole.driver, User.is_active == True).all()
    results = []
    for d in drivers:
        prof = d.driver_profile
        aff_name = (
            (prof.affiliated_provider.company_name or prof.affiliated_provider.full_name)
            if (prof and prof.affiliated_provider)
            else None
        )
        results.append({
            "id": d.id,
            "full_name": d.full_name,
            "name": d.full_name,
            "email": d.email,
            "phone": d.phone,
            "license_number": prof.license_number if prof else None,
            "experience_years": prof.experience_years if prof else 0,
            "vehicle_number": prof.vehicle_number if prof else None,
            "vehicle_type": prof.vehicle_type if prof else None,
            "base_city": prof.base_city if prof else None,
            "emergency_contact": prof.emergency_contact if prof else None,
            "availability_status": prof.availability_status if prof else "available",
            "affiliated_provider_id": prof.affiliated_provider_id if prof else None,
            "affiliated_provider_name": aff_name,
        })
    return results


@router.get("/{route_id}", response_model=TruckRouteOut)
def get_route(route_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    route = db.query(TruckRoute).filter(TruckRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route


@router.put("/{route_id}", response_model=TruckRouteOut)
def update_route(
    route_id: str,
    payload: TruckRouteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.truck_provider, UserRole.admin)),
):
    """FR-10: Providers may edit registered routes before departure."""
    route = db.query(TruckRoute).filter(TruckRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    if current_user.role == UserRole.truck_provider and route.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this route")
    if route.status == RouteStatus.completed:
        raise HTTPException(status_code=400, detail="Completed routes cannot be modified")

    data = payload.model_dump(exclude_unset=True)
    capacity_delta = None
    if "total_capacity_kg" in data:
        booked = route.total_capacity_kg - route.available_capacity_kg
        if data["total_capacity_kg"] < booked:
            raise HTTPException(
                status_code=400,
                detail="New capacity cannot be less than already-booked cargo weight",
            )
        capacity_delta = data["total_capacity_kg"] - route.total_capacity_kg

    for field, value in data.items():
        setattr(route, field, value)

    if capacity_delta is not None:
        route.available_capacity_kg += capacity_delta

    db.commit()
    db.refresh(route)
    return route


@router.delete("/{route_id}", status_code=204)
def delete_route(
    route_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.truck_provider, UserRole.admin)),
):
    """FR-10: Providers may delete registered routes before departure."""
    route = db.query(TruckRoute).filter(TruckRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    if current_user.role == UserRole.truck_provider and route.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this route")
    if route.available_capacity_kg < route.total_capacity_kg:
        raise HTTPException(status_code=400, detail="Cannot delete a route with active bookings")

    db.delete(route)
    db.commit()
    return None


@router.patch("/{route_id}/assign-driver", response_model=TruckRouteOut)
def assign_driver(
    route_id: str,
    payload: DriverAssign,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.truck_provider, UserRole.admin)),
):
    route = db.query(TruckRoute).filter(TruckRoute.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    if current_user.role == UserRole.truck_provider and route.provider_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this route")

    driver = db.query(User).filter(User.id == payload.driver_id, User.role == UserRole.driver).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    route.driver_id = driver.id
    if driver.driver_profile:
        driver.driver_profile.availability_status = "on_trip"
    db.add(AuditLog(user_id=current_user.id, action="DRIVER_ASSIGNED", details=f"Driver {driver.full_name} assigned to route {route.route_code}"))
    db.commit()
    db.refresh(route)
    return route
