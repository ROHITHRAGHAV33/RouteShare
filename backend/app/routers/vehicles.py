from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.deps import require_roles
from app.models import User, UserRole, Vehicle, AuditLog
from app.schemas import VehicleCreate, VehicleOut

router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])

@router.post("", response_model=VehicleOut, status_code=201)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.truck_provider))):
    existing = db.query(Vehicle).filter(Vehicle.vehicle_number == payload.vehicle_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="A vehicle with this number is already registered")
    vehicle = Vehicle(
        provider_id=current_user.id,
        vehicle_number=payload.vehicle_number.strip().upper(),
        vehicle_type=payload.vehicle_type.strip(),
        capacity_kg=payload.capacity_kg,
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    db.add(AuditLog(user_id=current_user.id, action="VEHICLE_REGISTERED", details=f"Vehicle {vehicle.vehicle_number}"))
    db.commit()
    return vehicle

@router.get("/my", response_model=List[VehicleOut])
def my_vehicles(db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.truck_provider))):
    return db.query(Vehicle).filter(Vehicle.provider_id == current_user.id, Vehicle.is_active == True).order_by(Vehicle.created_at.desc()).all()

@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(vehicle_id: str, db: Session = Depends(get_db), current_user: User = Depends(require_roles(UserRole.truck_provider))):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.provider_id == current_user.id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    vehicle.is_active = False
    db.commit()
    return None
