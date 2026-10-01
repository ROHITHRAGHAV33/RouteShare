from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_roles
from app.models import User, UserRole, DriverProfile, TruckRoute, Booking, RouteStatus, BookingStatus, AuditLog
from app.schemas import TruckRouteOut, BookingOut, DriverProfileUpdate, DriverDetailsOut, ProviderBriefOut

router = APIRouter(prefix="/api/driver", tags=["Driver Management"])


def _build_driver_details(driver: User, profile: DriverProfile) -> DriverDetailsOut:
    provider = profile.affiliated_provider if profile else None
    return DriverDetailsOut(
        id=driver.id,
        full_name=driver.full_name,
        email=driver.email,
        phone=driver.phone,
        license_number=profile.license_number if profile else None,
        experience_years=profile.experience_years if profile else 0,
        vehicle_number=profile.vehicle_number if profile else None,
        vehicle_type=profile.vehicle_type if profile else None,
        base_city=profile.base_city if profile else None,
        emergency_contact=profile.emergency_contact if profile else None,
        affiliated_provider_id=profile.affiliated_provider_id if profile else None,
        affiliated_provider_name=(provider.company_name or provider.full_name) if provider else None,
        affiliated_provider_email=provider.email if provider else None,
        affiliated_provider_phone=provider.phone if provider else None,
        availability_status=profile.availability_status if profile else "available",
        created_at=profile.created_at if profile else driver.created_at,
        updated_at=profile.updated_at if profile else driver.updated_at,
    )


@router.get("/profile", response_model=DriverDetailsOut)
def get_driver_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.driver)),
):
    """Retrieve full driver profile, vehicle details, and affiliated provider details."""
    profile = current_user.driver_profile
    if not profile:
        profile = DriverProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return _build_driver_details(current_user, profile)


@router.put("/profile", response_model=DriverDetailsOut)
def update_driver_profile(
    payload: DriverProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.driver)),
):
    """Update driver license, experience, vehicle number, location, emergency contact, and affiliated provider."""
    profile = current_user.driver_profile
    if not profile:
        profile = DriverProfile(user_id=current_user.id)
        db.add(profile)

    if payload.phone:
        current_user.phone = payload.phone.strip()

    if payload.license_number is not None:
        profile.license_number = payload.license_number.strip()
    if payload.experience_years is not None:
        profile.experience_years = payload.experience_years
    if payload.vehicle_number is not None:
        profile.vehicle_number = payload.vehicle_number.strip().upper()
    if payload.vehicle_type is not None:
        profile.vehicle_type = payload.vehicle_type.strip()
    if payload.base_city is not None:
        profile.base_city = payload.base_city.strip()
    if payload.emergency_contact is not None:
        profile.emergency_contact = payload.emergency_contact.strip()
    if payload.availability_status is not None:
        profile.availability_status = payload.availability_status.strip().lower()

    if payload.affiliated_provider_id is not None:
        if payload.affiliated_provider_id == "":
            profile.affiliated_provider_id = None
        else:
            provider = db.query(User).filter(User.id == payload.affiliated_provider_id, User.role == UserRole.truck_provider).first()
            if not provider:
                raise HTTPException(status_code=404, detail="Selected truck provider not found")
            profile.affiliated_provider_id = provider.id

    db.add(AuditLog(user_id=current_user.id, action="DRIVER_PROFILE_UPDATED", details=f"Driver {current_user.email} updated profile details"))
    db.commit()
    db.refresh(profile)
    db.refresh(current_user)

    return _build_driver_details(current_user, profile)


@router.get("/providers", response_model=List[ProviderBriefOut])
def get_providers_for_driver(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.driver)),
):
    """List all registered logistics providers so the driver can link to their preferred provider."""
    return db.query(User).filter(User.role == UserRole.truck_provider, User.is_active == True).all()


@router.get("/trips", response_model=List[TruckRouteOut])
def assigned_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.driver)),
):
    """FR-23: The system shall display all assigned trips."""
    return (
        db.query(TruckRoute)
        .filter(TruckRoute.driver_id == current_user.id)
        .order_by(TruckRoute.return_date.asc())
        .all()
    )


@router.get("/trips/{route_id}/bookings", response_model=List[BookingOut])
def trip_bookings(
    route_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.driver)),
):
    route = db.query(TruckRoute).filter(TruckRoute.id == route_id, TruckRoute.driver_id == current_user.id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Trip not found or not assigned to you")
    return route.bookings


def _assert_one_active_trip(db: Session, driver_id: str, exclude_route_id: str):
    """BR: A driver may be assigned to multiple trips but only one active trip at a time."""
    active = (
        db.query(TruckRoute)
        .join(Booking, Booking.route_id == TruckRoute.id)
        .filter(
            TruckRoute.driver_id == driver_id,
            TruckRoute.id != exclude_route_id,
            Booking.status == BookingStatus.picked_up,
        )
        .first()
    )
    if active:
        raise HTTPException(
            status_code=400,
            detail="You already have an active trip in progress. Complete it before starting another.",
        )


@router.patch("/bookings/{booking_id}/pickup", response_model=BookingOut)
def confirm_pickup(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.driver)),
):
    """FR-25: The system shall allow drivers to confirm cargo pickup."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.route.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="This trip is not assigned to you")
    if booking.status != BookingStatus.confirmed:
        raise HTTPException(status_code=400, detail=f"Cannot pick up a booking with status {booking.status.value}")

    _assert_one_active_trip(db, current_user.id, booking.route_id)

    booking.status = BookingStatus.picked_up
    booking.picked_up_at = datetime.now(timezone.utc)
    db.add(AuditLog(user_id=current_user.id, action="CARGO_PICKED_UP", details=f"Booking {booking.booking_ref}"))
    db.commit()
    db.refresh(booking)
    return booking


@router.patch("/bookings/{booking_id}/deliver", response_model=BookingOut)
def confirm_delivery(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.driver)),
):
    """FR-26, FR-27, FR-28: Confirm cargo delivery, notify shipper, record completion time."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.route.driver_id != current_user.id:
        raise HTTPException(status_code=403, detail="This trip is not assigned to you")
    if booking.status != BookingStatus.picked_up:
        raise HTTPException(status_code=400, detail="Cargo must be picked up before it can be marked delivered")

    booking.status = BookingStatus.delivered
    booking.delivered_at = datetime.now(timezone.utc)

    # FR-27: notify shipper of status change (in-app notification record via audit log;
    # an SMTP/SMS integration point for production deployment).
    db.add(AuditLog(user_id=current_user.id, action="CARGO_DELIVERED", details=f"Booking {booking.booking_ref}"))
    db.commit()
    db.refresh(booking)
    return booking


@router.patch("/trips/{route_id}/complete", response_model=TruckRouteOut)
def complete_trip(
    route_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.driver)),
):
    """FR-28: Report route completion once all bookings on the trip are delivered."""
    route = db.query(TruckRoute).filter(TruckRoute.id == route_id, TruckRoute.driver_id == current_user.id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Trip not found or not assigned to you")

    undelivered = [b for b in route.bookings if b.status not in (BookingStatus.delivered, BookingStatus.cancelled)]
    if undelivered:
        raise HTTPException(status_code=400, detail="All bookings must be delivered or cancelled before completing the trip")

    route.status = RouteStatus.completed
    if current_user.driver_profile:
        current_user.driver_profile.availability_status = "available"
    db.add(AuditLog(user_id=current_user.id, action="ROUTE_COMPLETED", details=f"Route {route.route_code}"))
    db.commit()
    db.refresh(route)
    return route
