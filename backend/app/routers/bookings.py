import io
import random
import string
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fpdf import FPDF
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_roles, get_current_user
from app.models import User, UserRole, TruckRoute, Booking, RouteStatus, BookingStatus, AuditLog
from app.schemas import BookingCreate, BookingOut

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


def generate_booking_ref() -> str:
    return "BK-" + "".join(random.choices(string.digits + string.ascii_uppercase, k=8))


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.shipper)),
):
    """
    FR-17, FR-18, FR-20, FR-21: Reserve cargo space on a matched truck.
    Generates a unique Booking ID, deducts booked weight from available
    capacity, and prevents overbooking (BR: truck capacity shall never
    become negative; a "Completed" route no longer accepts bookings).
    """
    route = db.query(TruckRoute).filter(TruckRoute.id == payload.route_id).with_for_update().first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    if route.status != RouteStatus.active:
        raise HTTPException(status_code=400, detail="This route is no longer accepting bookings")
    if payload.cargo_weight_kg > route.available_capacity_kg:
        raise HTTPException(status_code=400, detail="Insufficient available capacity on this route")

    ref = generate_booking_ref()
    while db.query(Booking).filter(Booking.booking_ref == ref).first():
        ref = generate_booking_ref()

    cost = round(payload.cargo_weight_kg * route.rate_per_kg, 2)

    booking = Booking(
        booking_ref=ref,
        route_id=route.id,
        shipper_id=current_user.id,
        pickup_location=payload.pickup_location,
        delivery_location=payload.delivery_location,
        cargo_weight_kg=payload.cargo_weight_kg,
        cargo_volume_cbm=payload.cargo_volume_cbm,
        cost=cost,
        status=BookingStatus.confirmed,
    )

    # FR-18: deduct booked cargo weight from available capacity (never negative).
    route.available_capacity_kg = round(route.available_capacity_kg - payload.cargo_weight_kg, 3)
    if route.available_capacity_kg <= 0:
        route.available_capacity_kg = 0

    db.add(booking)
    db.add(AuditLog(user_id=current_user.id, action="BOOKING_CREATED", details=f"Booking {ref} on route {route.route_code}"))
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/my", response_model=List[BookingOut])
def my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.shipper)),
):
    """FR-19: Maintain booking history for Shippers."""
    return (
        db.query(Booking)
        .filter(Booking.shipper_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )


@router.get("/provider", response_model=List[BookingOut])
def provider_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.truck_provider)),
):
    """FR-19: Maintain booking history for Truck Providers, across their routes."""
    return (
        db.query(Booking)
        .join(TruckRoute, Booking.route_id == TruckRoute.id)
        .filter(TruckRoute.provider_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    is_owner_shipper = current_user.role == UserRole.shipper and booking.shipper_id == current_user.id
    is_owner_provider = current_user.role == UserRole.truck_provider and booking.route.provider_id == current_user.id
    is_admin = current_user.role == UserRole.admin
    if not (is_owner_shipper or is_owner_provider or is_admin):
        raise HTTPException(status_code=403, detail="You do not have access to this booking")

    return booking


@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.shipper, UserRole.admin)),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).with_for_update().first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role == UserRole.shipper and booking.shipper_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this booking")
    if booking.status in (BookingStatus.delivered, BookingStatus.cancelled):
        raise HTTPException(status_code=400, detail=f"Cannot cancel a booking that is already {booking.status.value}")

    route = booking.route
    route.available_capacity_kg = min(
        route.total_capacity_kg, round(route.available_capacity_kg + booking.cargo_weight_kg, 3)
    )
    booking.status = BookingStatus.cancelled

    db.add(AuditLog(user_id=current_user.id, action="BOOKING_CANCELLED", details=f"Booking {booking.booking_ref} cancelled"))
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/{booking_id}/invoice")
def download_invoice(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and download a PDF invoice for a booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    route = booking.route
    shipper = db.query(User).filter(User.id == booking.shipper_id).first()
    provider = db.query(User).filter(User.id == route.provider_id).first()

    # Access check: shipper, provider, assigned driver, or admin
    is_shipper = current_user.role == UserRole.shipper and booking.shipper_id == current_user.id
    is_provider = current_user.role == UserRole.truck_provider and route.provider_id == current_user.id
    is_driver = current_user.role == UserRole.driver and route.driver_id == current_user.id
    is_admin = current_user.role == UserRole.admin
    if not (is_shipper or is_provider or is_driver or is_admin):
        raise HTTPException(status_code=403, detail="You do not have access to this invoice")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Header
    pdf.set_font("Helvetica", "B", 20)
    pdf.cell(0, 12, "RouteShare", ln=True, align="C")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, "AI-Based Empty-Return Truck Sharing Platform", ln=True, align="C")
    pdf.ln(5)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)

    # Invoice title
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "FREIGHT INVOICE", ln=True, align="C")
    pdf.ln(3)

    # Booking info
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(0, 8, f"Booking Reference: {booking.booking_ref}", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 7, f"Date: {booking.created_at.strftime('%d %b %Y, %I:%M %p')}", ln=True)
    pdf.cell(0, 7, f"Status: {booking.status.value.replace('_', ' ').title()}", ln=True)
    pdf.ln(5)

    # Route info
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Route Details", ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 7, f"Route Code: {route.route_code}", ln=True)
    pdf.cell(0, 7, f"Origin: {route.source_city}", ln=True)
    pdf.cell(0, 7, f"Destination: {route.destination_city}", ln=True)
    if route.intermediate_hubs:
        pdf.cell(0, 7, f"Via: {route.intermediate_hubs}", ln=True)
    pdf.cell(0, 7, f"Return Date: {route.return_date.strftime('%d %b %Y')}", ln=True)
    pdf.ln(5)

    # Shipment info
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Shipment Details", ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 7, f"Pickup Location: {booking.pickup_location}", ln=True)
    pdf.cell(0, 7, f"Delivery Location: {booking.delivery_location}", ln=True)
    pdf.cell(0, 7, f"Cargo Weight: {booking.cargo_weight_kg} kg", ln=True)
    if booking.cargo_volume_cbm:
        pdf.cell(0, 7, f"Cargo Volume: {booking.cargo_volume_cbm} CBM", ln=True)
    pdf.ln(5)

    # Cost breakdown
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Cost Breakdown", ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(95, 7, "Description", border=1, align="C")
    pdf.cell(30, 7, "Weight (kg)", border=1, align="C")
    pdf.cell(30, 7, "Rate/kg", border=1, align="C")
    pdf.cell(35, 7, "Amount", border=1, align="C")
    pdf.ln()
    pdf.cell(95, 7, f"{booking.pickup_location} to {booking.delivery_location}", border=1)
    pdf.cell(30, 7, f"{booking.cargo_weight_kg}", border=1, align="C")
    pdf.cell(30, 7, f"Rs.{route.rate_per_kg}", border=1, align="C")
    pdf.cell(35, 7, f"Rs.{booking.cost}", border=1, align="C")
    pdf.ln()
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(155, 8, "Total Amount:", align="R")
    pdf.cell(35, 8, f"Rs.{booking.cost}", border=1, align="C")
    pdf.ln(8)

    # Parties
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Parties", ln=True)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 7, f"Shipper: {shipper.full_name} ({shipper.email})", ln=True)
    pdf.cell(0, 7, f"Provider: {provider.full_name} ({provider.email})", ln=True)
    if provider.company_name:
        pdf.cell(0, 7, f"Company: {provider.company_name}", ln=True)
    if route.driver:
        driver_details = f"Driver: {route.driver.full_name}"
        if route.driver.phone:
            driver_details += f" (Ph: {route.driver.phone})"
        if route.driver.license_number:
            driver_details += f" | DL: {route.driver.license_number}"
        if route.driver.vehicle_number:
            driver_details += f" | Vehicle: {route.driver.vehicle_number}"
        pdf.cell(0, 7, driver_details, ln=True)
    pdf.ln(5)

    # Timestamps
    if booking.picked_up_at:
        pdf.cell(0, 7, f"Picked up at: {booking.picked_up_at.strftime('%d %b %Y, %I:%M %p')}", ln=True)
    if booking.delivered_at:
        pdf.cell(0, 7, f"Delivered at: {booking.delivered_at.strftime('%d %b %Y, %I:%M %p')}", ln=True)
    pdf.ln(10)

    # Footer
    pdf.set_font("Helvetica", "I", 9)
    pdf.cell(0, 6, "This is a system-generated invoice from RouteShare.", ln=True, align="C")
    pdf.cell(0, 6, "Thank you for using RouteShare!", ln=True, align="C")

    pdf_bytes = pdf.output()
    buffer = io.BytesIO(pdf_bytes)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{booking.booking_ref}.pdf"},
    )
