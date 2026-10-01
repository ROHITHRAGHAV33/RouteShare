import re
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models import UserRole, RouteStatus, BookingStatus


# ---------- Auth / Users ----------

class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: str = Field(..., min_length=7, max_length=20)
    password: str = Field(..., min_length=8, max_length=128)
    role: UserRole
    company_name: Optional[str] = Field(None, max_length=150)
    license_number: Optional[str] = Field(None, max_length=50)
    experience_years: Optional[int] = Field(0, ge=0, le=60)
    vehicle_number: Optional[str] = Field(None, max_length=30)
    vehicle_type: Optional[str] = Field(None, max_length=50)
    base_city: Optional[str] = Field(None, max_length=100)
    emergency_contact: Optional[str] = Field(None, max_length=30)
    affiliated_provider_id: Optional[str] = None

    @field_validator("role")
    @classmethod
    def restrict_public_roles(cls, v: UserRole) -> UserRole:
        # Admin accounts must not be self-registered via the public endpoint.
        if v == UserRole.admin:
            raise ValueError("Admin accounts cannot be created via public registration")
        return v

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v

    @field_validator("phone")
    @classmethod
    def phone_format(cls, v: str) -> str:
        if not re.fullmatch(r"\+?[0-9\-\s]{7,20}", v):
            raise ValueError("Invalid phone number format")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    role: UserRole
    company_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    license_number: Optional[str] = None
    experience_years: Optional[int] = 0
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    base_city: Optional[str] = None
    emergency_contact: Optional[str] = None
    availability_status: Optional[str] = None
    affiliated_provider_id: Optional[str] = None
    affiliated_provider_name: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Driver Details ----------

class ProviderBriefOut(BaseModel):
    id: str
    full_name: str
    company_name: Optional[str] = None
    email: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class DriverProfileUpdate(BaseModel):
    license_number: Optional[str] = Field(None, max_length=50)
    experience_years: Optional[int] = Field(0, ge=0, le=60)
    vehicle_number: Optional[str] = Field(None, max_length=30)
    vehicle_type: Optional[str] = Field(None, max_length=50)
    base_city: Optional[str] = Field(None, max_length=100)
    emergency_contact: Optional[str] = Field(None, max_length=30)
    affiliated_provider_id: Optional[str] = None
    availability_status: Optional[str] = Field("available", max_length=20)
    phone: Optional[str] = None


class DriverDetailsOut(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    license_number: Optional[str] = None
    experience_years: int = 0
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    base_city: Optional[str] = None
    emergency_contact: Optional[str] = None
    affiliated_provider_id: Optional[str] = None
    affiliated_provider_name: Optional[str] = None
    affiliated_provider_email: Optional[str] = None
    affiliated_provider_phone: Optional[str] = None
    availability_status: str = "available"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DriverInfoOut(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    license_number: Optional[str] = None
    experience_years: Optional[int] = 0
    vehicle_number: Optional[str] = None
    vehicle_type: Optional[str] = None
    base_city: Optional[str] = None
    availability_status: Optional[str] = "available"

    class Config:
        from_attributes = True


class ShipperInfoOut(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    company_name: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Vehicles ----------
class VehicleCreate(BaseModel):
    vehicle_number: str = Field(..., min_length=2, max_length=20)
    vehicle_type: str = Field(..., min_length=2, max_length=50)
    capacity_kg: float = Field(..., gt=0)

class VehicleOut(BaseModel):
    id: str
    provider_id: str
    vehicle_number: str
    vehicle_type: str
    capacity_kg: float
    is_active: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ---------- Truck Routes ----------

class TruckRouteCreate(BaseModel):
    source_city: str = Field(..., min_length=2, max_length=100)
    destination_city: str = Field(..., min_length=2, max_length=100)
    intermediate_hubs: Optional[str] = Field(None, max_length=255)
    return_date: datetime
    total_capacity_kg: float = Field(..., gt=0)
    rate_per_kg: float = Field(..., gt=0)
    vehicle_id: Optional[str] = None

    @field_validator("destination_city")
    @classmethod
    def different_cities(cls, v, info):
        source = info.data.get("source_city")
        if source and v.strip().lower() == source.strip().lower():
            raise ValueError("Source and destination cities must be different")
        return v


class TruckRouteUpdate(BaseModel):
    source_city: Optional[str] = Field(None, min_length=2, max_length=100)
    destination_city: Optional[str] = Field(None, min_length=2, max_length=100)
    intermediate_hubs: Optional[str] = Field(None, max_length=255)
    return_date: Optional[datetime] = None
    total_capacity_kg: Optional[float] = Field(None, gt=0)
    rate_per_kg: Optional[float] = Field(None, gt=0)
    status: Optional[RouteStatus] = None


class TruckRouteOut(BaseModel):
    id: str
    route_code: str
    provider_id: str
    driver_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    source_city: str
    destination_city: str
    intermediate_hubs: Optional[str] = None
    return_date: datetime
    total_capacity_kg: float
    available_capacity_kg: float
    rate_per_kg: float
    status: RouteStatus
    created_at: datetime
    driver: Optional[DriverInfoOut] = None
    vehicle: Optional[VehicleOut] = None
    provider: Optional[ProviderBriefOut] = None

    class Config:
        from_attributes = True


class DriverAssign(BaseModel):
    driver_id: str


# ---------- Search ----------

class SearchResult(BaseModel):
    route: TruckRouteOut
    provider_name: str
    estimated_cost_for_query: Optional[float] = None


# ---------- Bookings ----------

class BookingCreate(BaseModel):
    route_id: str
    pickup_location: str = Field(..., min_length=2, max_length=100)
    delivery_location: str = Field(..., min_length=2, max_length=100)
    cargo_weight_kg: float = Field(..., gt=0)
    cargo_volume_cbm: Optional[float] = Field(None, gt=0)


class BookingOut(BaseModel):
    id: str
    booking_ref: str
    route_id: str
    shipper_id: str
    pickup_location: str
    delivery_location: str
    cargo_weight_kg: float
    cargo_volume_cbm: Optional[float] = None
    cost: float
    status: BookingStatus
    picked_up_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    created_at: datetime
    route: Optional[TruckRouteOut] = None
    shipper: Optional[ShipperInfoOut] = None

    class Config:
        from_attributes = True


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


# ---------- Admin / Reports ----------

class ReportSummary(BaseModel):
    total_users: int
    total_providers: int
    total_shippers: int
    total_drivers: int
    total_routes: int
    active_routes: int
    completed_routes: int
    total_bookings: int
    total_revenue: float
    average_capacity_utilization_pct: float


class PaginatedResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    page_size: int
