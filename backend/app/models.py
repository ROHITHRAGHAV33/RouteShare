import enum
import uuid

from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    truck_provider = "truck_provider"
    shipper = "shipper"
    driver = "driver"
    admin = "admin"


class RouteStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    picked_up = "picked_up"
    delivered = "delivered"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, index=True)
    company_name = Column(String(150), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    routes = relationship("TruckRoute", back_populates="provider", foreign_keys="TruckRoute.provider_id")
    driven_routes = relationship("TruckRoute", back_populates="driver", foreign_keys="TruckRoute.driver_id")
    bookings = relationship("Booking", back_populates="shipper", foreign_keys="Booking.shipper_id")
    driver_profile = relationship("DriverProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="DriverProfile.user_id")

    @property
    def license_number(self):
        return self.driver_profile.license_number if self.driver_profile else None

    @property
    def experience_years(self):
        return self.driver_profile.experience_years if self.driver_profile else 0

    @property
    def vehicle_number(self):
        return self.driver_profile.vehicle_number if self.driver_profile else None

    @property
    def vehicle_type(self):
        return self.driver_profile.vehicle_type if self.driver_profile else None

    @property
    def base_city(self):
        return self.driver_profile.base_city if self.driver_profile else None

    @property
    def emergency_contact(self):
        return self.driver_profile.emergency_contact if self.driver_profile else None

    @property
    def availability_status(self):
        return self.driver_profile.availability_status if self.driver_profile else "available"

    @property
    def affiliated_provider_id(self):
        return self.driver_profile.affiliated_provider_id if self.driver_profile else None

    @property
    def affiliated_provider_name(self):
        if self.driver_profile and self.driver_profile.affiliated_provider:
            return self.driver_profile.affiliated_provider.company_name or self.driver_profile.affiliated_provider.full_name
        return None


class DriverProfile(Base):
    __tablename__ = "driver_profiles"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    license_number = Column(String(50), nullable=True)
    experience_years = Column(Integer, default=0, nullable=False)
    vehicle_number = Column(String(30), nullable=True)
    vehicle_type = Column(String(50), nullable=True)
    base_city = Column(String(100), nullable=True)
    emergency_contact = Column(String(30), nullable=True)
    affiliated_provider_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    availability_status = Column(String(20), default="available", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="driver_profile", foreign_keys=[user_id])
    affiliated_provider = relationship("User", foreign_keys=[affiliated_provider_id])



class Vehicle(Base):
    __tablename__ = "vehicles"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    provider_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    vehicle_number = Column(String(20), unique=True, nullable=False)
    vehicle_type = Column(String(50), nullable=False)  # Truck, Mini Truck, Trailer
    capacity_kg = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    provider = relationship("User", backref="vehicles")
    routes = relationship("TruckRoute", back_populates="vehicle")


class TruckRoute(Base):
    __tablename__ = "truck_routes"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    route_code = Column(String(20), unique=True, nullable=False, index=True)
    provider_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    driver_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id"), nullable=True, index=True)

    source_city = Column(String(100), nullable=False, index=True)
    destination_city = Column(String(100), nullable=False, index=True)
    intermediate_hubs = Column(String(255), nullable=True)  # comma-separated
    return_date = Column(DateTime(timezone=True), nullable=False)

    total_capacity_kg = Column(Float, nullable=False)
    available_capacity_kg = Column(Float, nullable=False)
    rate_per_kg = Column(Float, nullable=False)

    status = Column(Enum(RouteStatus), default=RouteStatus.active, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    provider = relationship("User", back_populates="routes", foreign_keys=[provider_id])
    driver = relationship("User", back_populates="driven_routes", foreign_keys=[driver_id])
    vehicle = relationship("Vehicle", back_populates="routes")
    bookings = relationship("Booking", back_populates="route", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    booking_ref = Column(String(20), unique=True, nullable=False, index=True)
    route_id = Column(String(36), ForeignKey("truck_routes.id"), nullable=False, index=True)
    shipper_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)

    pickup_location = Column(String(100), nullable=False)
    delivery_location = Column(String(100), nullable=False)
    cargo_weight_kg = Column(Float, nullable=False)
    cargo_volume_cbm = Column(Float, nullable=True)

    cost = Column(Float, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.confirmed, nullable=False, index=True)

    picked_up_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    route = relationship("TruckRoute", back_populates="bookings")
    shipper = relationship("User", back_populates="bookings", foreign_keys=[shipper_id])


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
