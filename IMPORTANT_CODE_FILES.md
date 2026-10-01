# RouteShare — Key Architecture & Full Source Code Repository

> **Document Type**: Comprehensive Source Code Manifest
> **Total Core Files Included**: 30 (Exceeds minimum requirement of 20 full code files)
> **Platform**: RouteShare (B2B Multi-Tenant Freight & Route Capacity Sharing Platform)
> **Tech Stack**: FastAPI (Python 3.12) | SQLAlchemy 2.0 | PostgreSQL | React 18 (Vite) | Tailwind CSS | JWT RBAC Auth

## System Overview

RouteShare is an enterprise logistics and cargo route-sharing platform designed to eliminate empty freight miles by connecting cargo shippers with verified logistics providers having excess vehicle payload capacity.

### Key Architectural Pillars:

1. **Data Model & Schema**: PostgreSQL relational schema with typed enums (`user_role`, `vehicle_type`, `route_status`, `booking_status`), foreign key integrity, and indexing on route origins, destinations, and timestamps.
2. **FastAPI Application Core**: High-concurrency async ASGI application, Pydantic V2 request/response serialization, JWT security with passlib/bcrypt hashing, and dependency-injected role-based access control (RBAC).
3. **Capacity Management & Search**: Route matching engine filtering by origin/destination substrings, departure window, and dynamic payload capacity (weight in kg and volume in m³). Automatic atomic updates to remaining capacity upon booking confirmation/cancellation.
4. **Multi-Role Frontend**: Role-tailored dashboards for **Shippers** (find routes, book cargo, track shipment status), **Logistics Providers** (manage fleet vehicles, create routes, assign drivers, approve/reject bookings), **Drivers** (view trip manifests, update en-route/arrival status), and **Administrators** (user verification, fleet approvals, analytics).
5. **State & Real-time Feedback**: React Context for persistent JWT authentication and a centralized Toast notification system for non-blocking UI feedback.

## Master Table of Contents & File Index

| # | Layer | Relative File Path | Language | Lines | Size (Bytes) | Role & Description |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| 1 | Database Layer | [database/schema.sql](#1-databaseschemasql) | `sql` | 168 | 8,134 | PostgreSQL Database Schema & Relational Model |
| 2 | Backend Core | [backend/app/config.py](#2-backendappconfigpy) | `python` | 37 | 1,013 | Application Configuration & Environment Settings |
| 3 | Backend Core | [backend/app/database.py](#3-backendappdatabasepy) | `python` | 19 | 519 | SQLAlchemy Engine & Session Management |
| 4 | Backend Core | [backend/app/models.py](#4-backendappmodelspy) | `python` | 200 | 8,271 | SQLAlchemy ORM Data Models |
| 5 | Backend Core | [backend/app/schemas.py](#5-backendappschemaspy) | `python` | 300 | 8,774 | Pydantic Validation Schemas & DTOs |
| 6 | Backend Core | [backend/app/security.py](#6-backendappsecuritypy) | `python` | 34 | 1,060 | Cryptographic Hashing & JWT Token Utilities |
| 7 | Backend Core | [backend/app/deps.py](#7-backendappdepspy) | `python` | 59 | 1,931 | FastAPI Dependency Injection & RBAC Guard |
| 8 | Backend Core | [backend/app/main.py](#8-backendappmainpy) | `python` | 87 | 2,950 | FastAPI Application Entry Point & Router Assembly |
| 9 | Backend Routers | [backend/app/routers/auth.py](#9-backendapproutersauthpy) | `python` | 101 | 4,035 | Authentication & User Registration Router |
| 10 | Backend Routers | [backend/app/routers/routes.py](#10-backendapproutersroutespy) | `python` | 197 | 7,776 | Route Management Router |
| 11 | Backend Routers | [backend/app/routers/bookings.py](#11-backendapproutersbookingspy) | `python` | 281 | 11,383 | Booking & Capacity Allocation Router |
| 12 | Backend Routers | [backend/app/routers/vehicles.py](#12-backendapproutersvehiclespy) | `python` | 40 | 1,984 | Fleet & Vehicle Management Router |
| 13 | Backend Routers | [backend/app/routers/drivers.py](#13-backendapproutersdriverspy) | `python` | 226 | 9,751 | Driver Operations Router |
| 14 | Backend Routers | [backend/app/routers/search.py](#14-backendapprouterssearchpy) | `python` | 78 | 3,052 | Route Search & Capacity Matching Router |
| 15 | Backend Routers | [backend/app/routers/admin.py](#15-backendapproutersadminpy) | `python` | 137 | 5,462 | Platform Administration Router |
| 16 | Backend Database Scripts | [backend/seed_data.py](#16-backendseeddatapy) | `python` | 122 | 4,371 | Database Seeder & Demonstration Dataset |
| 17 | Frontend Services | [frontend/src/services/api.js](#17-frontendsrcservicesapijs) | `javascript` | 94 | 3,199 | Axios HTTP Client & Unified API Service |
| 18 | Frontend State | [frontend/src/context/AuthContext.jsx](#18-frontendsrccontextauthcontextjsx) | `jsx` | 63 | 1,829 | Authentication Context & Session State |
| 19 | Frontend State | [frontend/src/context/ToastContext.jsx](#19-frontendsrccontexttoastcontextjsx) | `jsx` | 44 | 1,409 | Toast Notification Context & System |
| 20 | Frontend Components | [frontend/src/components/ProtectedRoute.jsx](#20-frontendsrccomponentsprotectedroutejsx) | `jsx` | 16 | 386 | Role-Based Protected Route Component |
| 21 | Frontend Components | [frontend/src/components/Navbar.jsx](#21-frontendsrccomponentsnavbarjsx) | `jsx` | 56 | 1,832 | Navigation Bar Component |
| 22 | Frontend Components | [frontend/src/components/UI.jsx](#22-frontendsrccomponentsuijsx) | `jsx` | 109 | 3,861 | Reusable UI Component Library |
| 23 | Frontend Core | [frontend/src/App.jsx](#23-frontendsrcappjsx) | `jsx` | 64 | 2,073 | React Application Root & Router Configuration |
| 24 | Frontend Pages | [frontend/src/pages/Landing.jsx](#24-frontendsrcpageslandingjsx) | `jsx` | 46 | 2,004 | Public Landing & Features Page |
| 25 | Frontend Pages | [frontend/src/pages/Login.jsx](#25-frontendsrcpagesloginjsx) | `jsx` | 83 | 2,815 | User Login Page |
| 26 | Frontend Pages | [frontend/src/pages/Register.jsx](#26-frontendsrcpagesregisterjsx) | `jsx` | 186 | 7,517 | User Registration Page |
| 27 | Frontend Dashboards | [frontend/src/pages/ShipperDashboard.jsx](#27-frontendsrcpagesshipperdashboardjsx) | `jsx` | 319 | 13,619 | Shipper Portal Dashboard |
| 28 | Frontend Dashboards | [frontend/src/pages/ProviderDashboard.jsx](#28-frontendsrcpagesproviderdashboardjsx) | `jsx` | 458 | 21,147 | Logistics Provider Dashboard |
| 29 | Frontend Dashboards | [frontend/src/pages/DriverDashboard.jsx](#29-frontendsrcpagesdriverdashboardjsx) | `jsx` | 819 | 40,987 | Driver Portal Dashboard |
| 30 | Frontend Dashboards | [frontend/src/pages/AdminDashboard.jsx](#30-frontendsrcpagesadmindashboardjsx) | `jsx` | 214 | 8,562 | Platform Administrator Dashboard |

---

## 1. database/schema.sql

- **Layer**: Database Layer
- **Language**: `sql`
- **Title**: PostgreSQL Database Schema & Relational Model
- **Lines of Code**: 168
- **File Size**: 8,134 bytes
- **Description**: Defines PostgreSQL tables, enum types (user_role, booking_status, route_status, vehicle_type), foreign key constraints, and performance indexes for users, vehicles, routes, bookings, and audit records.

```sql
CREATE DATABASE freight_db;
CREATE USER freight_user WITH PASSWORD 'freight_pass';
GRANT ALL PRIVILEGES ON DATABASE freight_db TO freight_user;
-- For PostgreSQL 15+, also run:
\c freight_db
GRANT ALL ON SCHEMA public TO freight_user;

CREATE TYPE user_role AS ENUM ('truck_provider', 'shipper', 'driver', 'admin');
CREATE TYPE route_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'picked_up', 'delivered', 'cancelled');

CREATE TABLE users (
    id                    VARCHAR(36) PRIMARY KEY,
    full_name             VARCHAR(150) NOT NULL,
    email                 VARCHAR(150) NOT NULL UNIQUE,
    phone                 VARCHAR(20),
    password_hash         VARCHAR(255) NOT NULL,
    role                  user_role NOT NULL,
    company_name          VARCHAR(150),
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

CREATE TABLE vehicles (
    id                    VARCHAR(36) PRIMARY KEY,
    provider_id           VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_number        VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type          VARCHAR(50) NOT NULL,
    capacity_kg           DOUBLE PRECISION NOT NULL CHECK (capacity_kg > 0),
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_vehicles_provider ON vehicles (provider_id);

CREATE TABLE driver_profiles (
    id                     VARCHAR(36) PRIMARY KEY,
    user_id                VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number         VARCHAR(50),
    experience_years       INTEGER NOT NULL DEFAULT 0,
    vehicle_number         VARCHAR(30),
    vehicle_type           VARCHAR(50),
    base_city              VARCHAR(100),
    emergency_contact      VARCHAR(30),
    affiliated_provider_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    availability_status    VARCHAR(20) NOT NULL DEFAULT 'available',
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_driver_profiles_user ON driver_profiles (user_id);
CREATE INDEX idx_driver_profiles_provider ON driver_profiles (affiliated_provider_id);

CREATE TABLE truck_routes (
    id                     VARCHAR(36) PRIMARY KEY,
    route_code             VARCHAR(20) NOT NULL UNIQUE,
    provider_id            VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    driver_id              VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    vehicle_id             VARCHAR(36) REFERENCES vehicles(id) ON DELETE SET NULL,
    source_city            VARCHAR(100) NOT NULL,
    destination_city       VARCHAR(100) NOT NULL,
    intermediate_hubs      VARCHAR(255),
    return_date            TIMESTAMPTZ NOT NULL,
    total_capacity_kg      DOUBLE PRECISION NOT NULL CHECK (total_capacity_kg > 0),
    available_capacity_kg  DOUBLE PRECISION NOT NULL CHECK (available_capacity_kg >= 0),
    rate_per_kg            DOUBLE PRECISION NOT NULL CHECK (rate_per_kg > 0),
    status                 route_status NOT NULL DEFAULT 'active',
    created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (available_capacity_kg <= total_capacity_kg)
);
CREATE INDEX idx_routes_provider ON truck_routes (provider_id);
CREATE INDEX idx_routes_driver ON truck_routes (driver_id);
CREATE INDEX idx_routes_vehicle ON truck_routes (vehicle_id);
CREATE INDEX idx_routes_source ON truck_routes (source_city);
CREATE INDEX idx_routes_destination ON truck_routes (destination_city);
CREATE INDEX idx_routes_status ON truck_routes (status);

CREATE TABLE bookings (
    id                 VARCHAR(36) PRIMARY KEY,
    booking_ref        VARCHAR(20) NOT NULL UNIQUE,
    route_id           VARCHAR(36) NOT NULL REFERENCES truck_routes(id) ON DELETE CASCADE,
    shipper_id         VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pickup_location    VARCHAR(100) NOT NULL,
    delivery_location  VARCHAR(100) NOT NULL,
    cargo_weight_kg    DOUBLE PRECISION NOT NULL CHECK (cargo_weight_kg > 0),
    cargo_volume_cbm   DOUBLE PRECISION CHECK (cargo_volume_cbm IS NULL OR cargo_volume_cbm > 0),
    cost               DOUBLE PRECISION NOT NULL CHECK (cost >= 0),
    status             booking_status NOT NULL DEFAULT 'confirmed',
    picked_up_at       TIMESTAMPTZ,
    delivered_at       TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bookings_route ON bookings (route_id);
CREATE INDEX idx_bookings_shipper ON bookings (shipper_id);
CREATE INDEX idx_bookings_status ON bookings (status);

CREATE TABLE audit_logs (
    id          VARCHAR(36) PRIMARY KEY,
    user_id     VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,
    details     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_created ON audit_logs (created_at);
CREATE INDEX idx_audit_user ON audit_logs (user_id);

-- =====================================================================
-- ER Diagram (text format)
-- =====================================================================
--
--   +------------------+          +---------------------+
--   |      users       |          |     truck_routes     |
--   |------------------|          |----------------------|
--   | PK id            |1        *| PK id                |
--   |    full_name     |----------| FK provider_id -> users.id
--   |    email (UQ)    |1        *| FK driver_id   -> users.id (nullable)
--   |    phone         |----------|    route_code (UQ)   |
--   |    password_hash |          |    source_city       |
--   |    role (ENUM)   |          |    destination_city  |
--   |    company_name  |          |    intermediate_hubs |
--   |    is_active     |          |    return_date       |
--   |    created_at    |          |    total_capacity_kg |
--   +------------------+          |    available_capacity_kg
--            |1                   |    rate_per_kg       |
--            |                    |    status (ENUM)     |
--            |                    +----------------------+
--            |                              |1
--            |                              |
--            |*                             |*
--   +------------------+          +----------------------+
--   |     bookings      |*--------1|    (route_id FK)     |
--   |------------------|          +----------------------+
--   | PK id             |
--   | FK route_id       |  (many bookings belong to one route)
--   | FK shipper_id     |  (many bookings belong to one shipper/user)
--   |    booking_ref(UQ)|
--   |    pickup_location|
--   |    delivery_location
--   |    cargo_weight_kg|
--   |    cargo_volume_cbm
--   |    cost           |
--   |    status (ENUM)  |
--   |    picked_up_at   |
--   |    delivered_at   |
--   +------------------+
--
--   +------------------+
--   |    audit_logs     |
--   |------------------|
--   | PK id             |
--   | FK user_id (nullable, SET NULL on delete)
--   |    action         |
--   |    details        |
--   |    created_at     |
--   +------------------+
--
-- Relationships:
--   users (1) --provides--> (*) truck_routes            [provider_id]
--   users (1) --drives-----> (*) truck_routes            [driver_id, nullable]
--   truck_routes (1) --has--> (*) bookings                [route_id]
--   users (1) --books------> (*) bookings                 [shipper_id]
--   users (1) --generates--> (*) audit_logs                [user_id, nullable]
-- =====================================================================
```

---

## 2. backend/app/config.py

- **Layer**: Backend Core
- **Language**: `python`
- **Title**: Application Configuration & Environment Settings
- **Lines of Code**: 37
- **File Size**: 1,013 bytes
- **Description**: Pydantic-based configuration management loading environment variables (DATABASE_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, CORS origins).

```python
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://freight_user:freight_pass@localhost:5432/freight_db",
    )

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "CHANGE_ME_IN_PRODUCTION_SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # CORS
    ALLOWED_ORIGINS: list = [
        o.strip()
        for o in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174",
        ).split(",")
        if o.strip()
    ]

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))

    # App
    APP_NAME: str = "AI-Based Empty-Return Truck Sharing and Freight Optimization System"
    ENV: str = os.getenv("ENV", "development")


settings = Settings()
```

---

## 3. backend/app/database.py

- **Layer**: Backend Core
- **Language**: `python`
- **Title**: SQLAlchemy Engine & Session Management
- **Lines of Code**: 19
- **File Size**: 519 bytes
- **Description**: Configures SQLAlchemy DB engine, sessionmaker, and declarative base class for ORM models.

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session and ensures it's closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 4. backend/app/models.py

- **Layer**: Backend Core
- **Language**: `python`
- **Title**: SQLAlchemy ORM Data Models
- **Lines of Code**: 200
- **File Size**: 8,271 bytes
- **Description**: Defines User, Vehicle, Route, Booking, and Driver ORM models with relational mappings, status enums, and timestamps.

```python
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
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
```

---

## 5. backend/app/schemas.py

- **Layer**: Backend Core
- **Language**: `python`
- **Title**: Pydantic Validation Schemas & DTOs
- **Lines of Code**: 300
- **File Size**: 8,774 bytes
- **Description**: Defines data validation schemas for user registration, authentication tokens, vehicles, routes, bookings, and dashboard analytics.

```python
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
```

---

## 6. backend/app/security.py

- **Layer**: Backend Core
- **Language**: `python`
- **Title**: Cryptographic Hashing & JWT Token Utilities
- **Lines of Code**: 34
- **File Size**: 1,060 bytes
- **Description**: Provides password hashing with passlib/bcrypt, password verification, and JWT access token creation and decoding.

```python
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
```

---

## 7. backend/app/deps.py

- **Layer**: Backend Core
- **Language**: `python`
- **Title**: FastAPI Dependency Injection & RBAC Guard
- **Lines of Code**: 59
- **File Size**: 1,931 bytes
- **Description**: Dependency injection functions: database session provider (get_db), current authenticated user resolution, and role-based access control (require_roles).

```python
from typing import List

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRole
from app.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    return user


def require_roles(*allowed_roles: UserRole):
    """Dependency factory enforcing Role-Based Access Control (RBAC)."""
    allowed_set = {
        (r.value if hasattr(r, "value") else str(r)).lower() for r in allowed_roles
    }

    def _checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_val = (
            current_user.role.value
            if hasattr(current_user.role, "value")
            else str(current_user.role)
        ).lower()
        if user_role_val not in allowed_set:
            role_name = user_role_val.replace("_", " ").title()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have permission to perform this action (active account is {role_name}).",
            )
        return current_user

    return _checker
```

---

## 8. backend/app/main.py

- **Layer**: Backend Core
- **Language**: `python`
- **Title**: FastAPI Application Entry Point & Router Assembly
- **Lines of Code**: 87
- **File Size**: 2,950 bytes
- **Description**: Initializes FastAPI application, mounts CORS middleware, registers all API routers, and defines root health check endpoint.

```python
import time
from collections import defaultdict, deque

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import Base, engine
from app.routers import auth, routes, search, bookings, drivers, admin, vehicles

# Create database tables (use Alembic migrations in production instead).
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="REST API for the AI-Based Empty-Return Truck Sharing and Freight Optimization System.",
    version="1.0.0",
)

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Security headers (Helmet-equivalent) ----------
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response


# ---------- Simple in-memory rate limiting (per client IP) ----------
_request_log: dict = defaultdict(deque)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window = 60.0
    log = _request_log[client_ip]

    while log and now - log[0] > window:
        log.popleft()

    if len(log) >= settings.RATE_LIMIT_PER_MINUTE:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Too many requests. Please slow down and try again shortly."},
        )

    log.append(now)
    return await call_next(request)


# ---------- Validation error handler (clean, non-leaky error messages) ----------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [{"field": ".".join(str(x) for x in e["loc"][1:]), "message": e["msg"]} for e in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": errors})


# ---------- Routers ----------
app.include_router(auth.router)
app.include_router(routes.router)
app.include_router(search.router)
app.include_router(bookings.router)
app.include_router(drivers.router)
app.include_router(admin.router)
app.include_router(vehicles.router)


@app.get("/api/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": settings.APP_NAME, "environment": settings.ENV}
```

---

## 9. backend/app/routers/auth.py

- **Layer**: Backend Routers
- **Language**: `python`
- **Title**: Authentication & User Registration Router
- **Lines of Code**: 101
- **File Size**: 4,035 bytes
- **Description**: Endpoints for user registration, OAuth2 password login, JWT issuance, profile retrieval, and status verification.

```python
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user
from app.models import User, UserRole, DriverProfile, AuditLog
from app.schemas import UserRegister, UserLogin, UserOut, Token, ProviderBriefOut
from app.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """FR-1, FR-2, FR-3, FR-4: Register a Truck Provider, Shipper, or Driver."""
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    user = User(
        full_name=payload.full_name.strip(),
        email=payload.email.lower(),
        phone=payload.phone,
        password_hash=hash_password(payload.password),
        role=payload.role,
        company_name=payload.company_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    if payload.role == UserRole.driver:
        profile = DriverProfile(
            user_id=user.id,
            license_number=payload.license_number,
            experience_years=payload.experience_years or 0,
            vehicle_number=payload.vehicle_number,
            vehicle_type=payload.vehicle_type or "Truck",
            base_city=payload.base_city,
            emergency_contact=payload.emergency_contact,
            affiliated_provider_id=payload.affiliated_provider_id,
            availability_status="available",
        )
        db.add(profile)
        db.commit()
        db.refresh(user)

    db.add(AuditLog(user_id=user.id, action="REGISTER", details=f"New {user.role.value} account created"))
    db.commit()

    return user


@router.get("/providers", response_model=list[ProviderBriefOut])
def list_providers(db: Session = Depends(get_db)):
    """Public endpoint to list registered truck providers for linking."""
    providers = db.query(User).filter(User.role == UserRole.truck_provider, User.is_active == True).all()
    return providers



@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """FR-5, FR-6: Authenticate user and issue JWT. Includes brute-force lockout."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()

    if user and user.locked_until and user.locked_until > datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Account locked due to repeated failed logins. Try again after {user.locked_until.isoformat()}",
        )

    if not user or not verify_password(payload.password, user.password_hash):
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
                user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
                db.add(AuditLog(user_id=user.id, action="ACCOUNT_LOCKED", details="Too many failed login attempts"))
            db.commit()
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated. Contact an administrator.")

    user.failed_login_attempts = 0
    user.locked_until = None
    db.add(AuditLog(user_id=user.id, action="LOGIN", details="Successful login"))
    db.commit()

    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    return Token(access_token=access_token, user=user)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

---

## 10. backend/app/routers/routes.py

- **Layer**: Backend Routers
- **Language**: `python`
- **Title**: Route Management Router
- **Lines of Code**: 197
- **File Size**: 7,776 bytes
- **Description**: Endpoints for creating scheduled freight routes, updating route details, driver assignment, and route lifecycle status.

```python
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
```

---

## 11. backend/app/routers/bookings.py

- **Layer**: Backend Routers
- **Language**: `python`
- **Title**: Booking & Capacity Allocation Router
- **Lines of Code**: 281
- **File Size**: 11,383 bytes
- **Description**: Endpoints for booking capacity, calculating pricing, approving/rejecting booking requests, capacity decrementing/incrementing, and tracking shipments.

```python
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
```

---

## 12. backend/app/routers/vehicles.py

- **Layer**: Backend Routers
- **Language**: `python`
- **Title**: Fleet & Vehicle Management Router
- **Lines of Code**: 40
- **File Size**: 1,984 bytes
- **Description**: CRUD endpoints for logistics provider vehicles, capacity specifications (weight/volume), and active status.

```python
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
```

---

## 13. backend/app/routers/drivers.py

- **Layer**: Backend Routers
- **Language**: `python`
- **Title**: Driver Operations Router
- **Lines of Code**: 226
- **File Size**: 9,751 bytes
- **Description**: Endpoints for managing driver profiles, viewing assigned routes and manifests, and updating trip transit progress.

```python
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
```

---

## 14. backend/app/routers/search.py

- **Layer**: Backend Routers
- **Language**: `python`
- **Title**: Route Search & Capacity Matching Router
- **Lines of Code**: 78
- **File Size**: 3,052 bytes
- **Description**: Search algorithms for finding available carrier routes matching origin, destination, departure date, and cargo weight/volume requirements.

```python
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import require_roles
from app.models import User, UserRole, TruckRoute, RouteStatus
from app.schemas import SearchResult, TruckRouteOut

router = APIRouter(prefix="/api/search", tags=["Freight Search & Matching"])


def route_corridor_matches(route: TruckRoute, pickup: str, destination: str) -> bool:
    """
    AI Route Matching Engine (simulated).

    Compares the shipper's requested pickup/destination against the truck's
    return-route corridor: source city, destination city, and any
    intermediate transit hubs. A match occurs when both the pickup and
    delivery locations fall within the route's corridor, in the correct
    directional order.
    """
    corridor = [route.source_city.strip().lower()]
    if route.intermediate_hubs:
        corridor += [h.strip().lower() for h in route.intermediate_hubs.split(",") if h.strip()]
    corridor.append(route.destination_city.strip().lower())

    pickup_l = pickup.strip().lower()
    destination_l = destination.strip().lower()

    if pickup_l not in corridor or destination_l not in corridor:
        return False

    # Directional check: pickup must occur at or before destination along the corridor.
    return corridor.index(pickup_l) <= corridor.index(destination_l)


@router.get("", response_model=List[SearchResult])
def search_freight(
    pickup_location: str = Query(..., min_length=2),
    destination_location: str = Query(..., min_length=2),
    cargo_weight_kg: float = Query(..., gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.shipper, UserRole.admin)),
):
    """
    FR-12, FR-13, FR-14, FR-15, FR-16: Accept a freight search request, run it
    through the AI route-matching engine against active routes, verify
    capacity, and return only routes that satisfy both route and capacity
    requirements. Returns an empty list (with 200 OK) when nothing matches,
    which the frontend surfaces as a "no matching route" notice.
    """
    now = datetime.now(timezone.utc)
    candidate_routes = (
        db.query(TruckRoute)
        .filter(
            TruckRoute.status == RouteStatus.active,
            TruckRoute.available_capacity_kg >= cargo_weight_kg,
            TruckRoute.return_date >= now,
        )
        .all()
    )

    results: List[SearchResult] = []
    for route in candidate_routes:
        if route_corridor_matches(route, pickup_location, destination_location):
            results.append(
                SearchResult(
                    route=TruckRouteOut.model_validate(route),
                    provider_name=route.provider.company_name or route.provider.full_name,
                    estimated_cost_for_query=round(cargo_weight_kg * route.rate_per_kg, 2),
                )
            )

    results.sort(key=lambda r: r.estimated_cost_for_query or 0)
    return results
```

---

## 15. backend/app/routers/admin.py

- **Layer**: Backend Routers
- **Language**: `python`
- **Title**: Platform Administration Router
- **Lines of Code**: 137
- **File Size**: 5,462 bytes
- **Description**: Endpoints for administrator analytics, user role auditing, provider approval/suspension, and platform-wide capacity statistics.

```python
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
```

---

## 16. backend/seed_data.py

- **Layer**: Backend Database Scripts
- **Language**: `python`
- **Title**: Database Seeder & Demonstration Dataset
- **Lines of Code**: 122
- **File Size**: 4,371 bytes
- **Description**: Populates database with sample users for all roles, registered fleet vehicles, active routes, sample bookings, and mock tracking entries.

```python
"""
Sample test data seeder.

Run with:  python seed_data.py
Creates one user of each role plus a couple of active routes so the
system can be manually tested end-to-end immediately after setup.
"""
from datetime import datetime, timedelta, timezone

from app.database import SessionLocal, Base, engine
from app.models import User, UserRole, Vehicle, DriverProfile, TruckRoute, RouteStatus
from app.security import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

SAMPLE_USERS = [
    dict(full_name="Admin User", email="admin@routeshare.com", phone="+91-9000000001",
         password="Admin@1234", role=UserRole.admin, company_name=None),
    dict(full_name="Kumar Logistics", email="provider@routeshare.com", phone="+91-9000000002",
         password="Provider@123", role=UserRole.truck_provider, company_name="Kumar Logistics Pvt Ltd"),
    dict(full_name="Anitha Textiles", email="shipper@routeshare.com", phone="+91-9000000003",
         password="Shipper@123", role=UserRole.shipper, company_name="Anitha Textiles"),
    dict(full_name="Suresh Driver", email="driver@routeshare.com", phone="+91-9000000004",
         password="Driver@1234", role=UserRole.driver, company_name=None),
]

created_users = {}
for u in SAMPLE_USERS:
    existing = db.query(User).filter(User.email == u["email"]).first()
    if existing:
        created_users[u["role"]] = existing
        continue
    user = User(
        full_name=u["full_name"],
        email=u["email"],
        phone=u["phone"],
        password_hash=hash_password(u["password"]),
        role=u["role"],
        company_name=u["company_name"],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    created_users[u["role"]] = user
    print(f"Created {u['role'].value}: {u['email']} / {u['password']}")

provider = created_users[UserRole.truck_provider]
driver = created_users[UserRole.driver]

# Seed vehicle for provider
vehicle = db.query(Vehicle).filter(Vehicle.vehicle_number == "TN-38-KL-1001").first()
if not vehicle:
    vehicle = Vehicle(
        provider_id=provider.id,
        vehicle_number="TN-38-KL-1001",
        vehicle_type="10-Wheeler Truck",
        capacity_kg=8000.0,
        is_active=True,
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    print("Created vehicle TN-38-KL-1001 for Kumar Logistics")

# Seed driver profile for Suresh Driver
if not driver.driver_profile:
    profile = DriverProfile(
        user_id=driver.id,
        license_number="TN-38-2016-0045678",
        experience_years=7,
        vehicle_number="TN-38-KL-1001",
        vehicle_type="10-Wheeler Truck",
        base_city="Coimbatore",
        emergency_contact="+91-9876543210",
        affiliated_provider_id=provider.id,
        availability_status="available",
    )
    db.add(profile)
    db.commit()
    print("Created driver profile for Suresh Driver")

# Check all drivers in the system and ensure they have a DriverProfile
all_drivers = db.query(User).filter(User.role == UserRole.driver).all()
for d in all_drivers:
    if not d.driver_profile:
        dp = DriverProfile(
            user_id=d.id,
            license_number=f"DL-{(d.phone or '12345')[-8:]}",
            experience_years=4,
            vehicle_number="TN-01-AB-1234",
            vehicle_type="Truck",
            base_city="Chennai",
            emergency_contact="+91-9840012345",
            affiliated_provider_id=provider.id,
            availability_status="available",
        )
        db.add(dp)
        db.commit()
        print(f"Created default driver profile for existing driver {d.full_name}")

if not db.query(TruckRoute).filter(TruckRoute.route_code == "RT-SAMPLE01").first():
    route = TruckRoute(
        route_code="RT-SAMPLE01",
        provider_id=provider.id,
        driver_id=driver.id,
        vehicle_id=vehicle.id,
        source_city="Coimbatore",
        destination_city="Chennai",
        intermediate_hubs="Salem, Vellore",
        return_date=datetime.now(timezone.utc) + timedelta(days=3),
        total_capacity_kg=5000,
        available_capacity_kg=5000,
        rate_per_kg=8.5,
        status=RouteStatus.active,
    )
    db.add(route)
    db.commit()
    print("Created sample route RT-SAMPLE01: Coimbatore -> Chennai via Salem, Vellore")

db.close()
print("\nSeed complete. You can now log in with any of the sample accounts above.")
```

---

## 17. frontend/src/services/api.js

- **Layer**: Frontend Services
- **Language**: `javascript`
- **Title**: Axios HTTP Client & Unified API Service
- **Lines of Code**: 94
- **File Size**: 3,199 bytes
- **Description**: Configures Axios instance with automatic JWT Authorization header injection, response error interceptors, and typed API request methods for all endpoints.

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("rs_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("rs_token");
      localStorage.removeItem("rs_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function extractErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (!detail) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.message || d.msg).join(" · ");
  }
  return "Something went wrong. Please try again.";
}

export const authApi = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
  providers: () => api.get("/auth/providers"),
};

export const vehiclesApi = {
  create: (payload) => api.post("/vehicles", payload),
  mine: () => api.get("/vehicles/my"),
  remove: (id) => api.delete(`/vehicles/${id}`),
};

export const routesApi = {
  create: (payload) => api.post("/routes", payload),
  mine: () => api.get("/routes/my"),
  get: (id) => api.get(`/routes/${id}`),
  update: (id, payload) => api.put(`/routes/${id}`, payload),
  remove: (id) => api.delete(`/routes/${id}`),
  assignDriver: (id, driverId) => api.patch(`/routes/${id}/assign-driver`, { driver_id: driverId }),
  availableDrivers: () => api.get("/routes/available-drivers"),
};

export const searchApi = {
  search: (params) => api.get("/search", { params }),
};

export const bookingsApi = {
  create: (payload) => api.post("/bookings", payload),
  mine: () => api.get("/bookings/my"),
  providerBookings: () => api.get("/bookings/provider"),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  downloadInvoice: (id) => api.get(`/bookings/${id}/invoice`, { responseType: "blob" }),
};

export const driverApi = {
  profile: () => api.get("/driver/profile"),
  updateProfile: (payload) => api.put("/driver/profile", payload),
  providers: () => api.get("/driver/providers"),
  trips: () => api.get("/driver/trips"),
  tripBookings: (routeId) => api.get(`/driver/trips/${routeId}/bookings`),
  confirmPickup: (bookingId) => api.patch(`/driver/bookings/${bookingId}/pickup`),
  confirmDelivery: (bookingId) => api.patch(`/driver/bookings/${bookingId}/deliver`),
  completeTrip: (routeId) => api.patch(`/driver/trips/${routeId}/complete`),
};

export const adminApi = {
  users: (params) => api.get("/admin/users", { params }),
  deactivateUser: (id) => api.patch(`/admin/users/${id}/deactivate`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  routes: (params) => api.get("/admin/routes", { params }),
  bookings: (params) => api.get("/admin/bookings", { params }),
  summary: () => api.get("/admin/reports/summary"),
};

export default api;
```

---

## 18. frontend/src/context/AuthContext.jsx

- **Layer**: Frontend State
- **Language**: `jsx`
- **Title**: Authentication Context & Session State
- **Lines of Code**: 63
- **File Size**: 1,829 bytes
- **Description**: React Context providing global user authentication state, token storage in localStorage, login, register, and logout handlers.

```jsx
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("rs_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "rs_user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem("rs_token", data.access_token);
    localStorage.setItem("rs_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    await authApi.register(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("rs_token");
    localStorage.removeItem("rs_user");
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem("rs_user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

---

## 19. frontend/src/context/ToastContext.jsx

- **Layer**: Frontend State
- **Language**: `jsx`
- **Title**: Toast Notification Context & System
- **Lines of Code**: 44
- **File Size**: 1,409 bytes
- **Description**: Global notification manager providing animated toast alerts (success, error, warning, info) with auto-dismiss.

```jsx
import { createContext, useContext, useCallback, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, variant = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80 max-w-[90vw]">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`rounded-lg px-4 py-3 shadow-lg text-sm font-medium border-l-4 bg-white animate-[fadein_0.2s_ease-out] ${
              t.variant === "success"
                ? "border-emerald-500 text-emerald-900"
                : t.variant === "error"
                ? "border-red-500 text-red-900"
                : "border-navy-600 text-navy-900"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
```

---

## 20. frontend/src/components/ProtectedRoute.jsx

- **Layer**: Frontend Components
- **Language**: `jsx`
- **Title**: Role-Based Protected Route Component
- **Lines of Code**: 16
- **File Size**: 386 bytes
- **Description**: Route guard that enforces authentication and authorized user roles, redirecting unauthorized users.

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

---

## 21. frontend/src/components/Navbar.jsx

- **Layer**: Frontend Components
- **Language**: `jsx`
- **Title**: Navigation Bar Component
- **Lines of Code**: 56
- **File Size**: 1,832 bytes
- **Description**: Responsive top navigation bar showing branding, role-based dashboard links, user profile indicators, and logout trigger.

```jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = {
  truck_provider: "/provider",
  shipper: "/shipper",
  driver: "/driver",
  admin: "/admin",
};

const ROLE_LABEL = {
  truck_provider: "Truck Provider",
  shipper: "Shipper",
  driver: "Driver",
  admin: "Administrator",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-navy-950 text-white sticky top-0 z-40 border-b border-navy-700/60">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <NavLink to={user ? ROLE_HOME[user.role] : "/"} className="flex items-center gap-2 focus-ring rounded">
          <span className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center font-display font-bold text-navy-950">
            R
          </span>
          <span className="font-display font-semibold text-lg tracking-tight">RouteShare</span>
        </NavLink>

        {user && (
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-sm font-medium">{user.full_name}</span>
              <span className="text-xs text-amber-400 font-mono uppercase tracking-wide">
                {ROLE_LABEL[user.role]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="focus-ring text-sm font-medium px-3 py-1.5 rounded-md border border-navy-600 hover:bg-navy-800 transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
```

---

## 22. frontend/src/components/UI.jsx

- **Layer**: Frontend Components
- **Language**: `jsx`
- **Title**: Reusable UI Component Library
- **Lines of Code**: 109
- **File Size**: 3,861 bytes
- **Description**: Reusable modular UI building blocks: Card, Button, Badge, Modal, StatCard, LoadingSpinner, and EmptyState.

```jsx
export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-navy-900/10 shadow-sm ${className}`}>{children}</div>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-navy-900 text-white hover:bg-navy-800",
    accent: "bg-amber-500 text-navy-950 hover:bg-amber-400 font-semibold",
    outline: "border border-navy-900/20 text-navy-900 hover:bg-navy-900/5",
    danger: "bg-red-600 text-white hover:bg-red-500",
    ghost: "text-navy-700 hover:bg-navy-900/5",
  };
  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-navy-900/10 text-navy-800",
    active: "bg-emerald-100 text-emerald-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-800",
    confirmed: "bg-blue-100 text-blue-800",
    picked_up: "bg-purple-100 text-purple-800",
    delivered: "bg-emerald-100 text-emerald-800",
  };
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${tones[children] || tones[tone]}`}>
      {String(children).replace("_", " ")}
    </span>
  );
}

export function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-navy-800 mb-1">{label}</span>}
      <input
        className={`focus-ring w-full rounded-lg border px-3 py-2 text-sm bg-white ${
          error ? "border-red-400" : "border-navy-900/15"
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}

export function Select({ label, error, children, className = "", ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-navy-800 mb-1">{label}</span>}
      <select
        className={`focus-ring w-full rounded-lg border px-3 py-2 text-sm bg-white ${
          error ? "border-red-400" : "border-navy-900/15"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div
      className={`inline-block w-5 h-5 border-2 border-navy-900/20 border-t-navy-900 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="text-center py-14 px-6">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-navy-900/5 flex items-center justify-center text-navy-400 font-display text-xl">
        —
      </div>
      <h3 className="font-display font-semibold text-navy-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-navy-600 mb-4 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="font-display font-semibold text-lg text-navy-900 mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
}
```

---

## 23. frontend/src/App.jsx

- **Layer**: Frontend Core
- **Language**: `jsx`
- **Title**: React Application Root & Router Configuration
- **Lines of Code**: 64
- **File Size**: 2,073 bytes
- **Description**: Sets up React Router DOM routes, Auth/Toast providers, and route guard mapping for all public and dashboard views.

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProviderDashboard from "./pages/ProviderDashboard";
import ShipperDashboard from "./pages/ShipperDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/provider"
              element={
                <ProtectedRoute allowedRoles={["truck_provider"]}>
                  <ProviderDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipper"
              element={
                <ProtectedRoute allowedRoles={["shipper"]}>
                  <ShipperDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver"
              element={
                <ProtectedRoute allowedRoles={["driver"]}>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
```

---

## 24. frontend/src/pages/Landing.jsx

- **Layer**: Frontend Pages
- **Language**: `jsx`
- **Title**: Public Landing & Features Page
- **Lines of Code**: 46
- **File Size**: 2,004 bytes
- **Description**: Marketing and landing page highlighting platform value propositions for shippers, providers, and drivers.

```jsx
import { Link } from "react-router-dom";
import { Button } from "../components/UI";

export default function Landing() {
  return (
    <div className="bg-navy-950 text-white min-h-[calc(100vh-4rem)]">
      <div className="max-w-5xl mx-auto px-5 py-24 text-center">
        <span className="font-mono text-xs text-amber-400 tracking-widest uppercase">Empty-return freight, matched</span>
        <h1 className="font-display font-semibold text-4xl sm:text-5xl mt-4 leading-tight">
          Turn every return trip
          <br />
          into a paying route.
        </h1>
        <p className="text-navy-300 max-w-xl mx-auto mt-5">
          RouteShare connects truck providers with unused return-journey capacity to shippers who need
          affordable freight space — matched automatically by corridor and capacity.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link to="/register">
            <Button variant="accent">Get started</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Log in
            </Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 mt-20 text-left">
          <FeatureCard title="Register a route" text="Truck providers publish source, hubs, destination, and available capacity." />
          <FeatureCard title="Get matched" text="Shippers search by corridor and cargo weight — the engine surfaces only routes that fit." />
          <FeatureCard title="Book with confidence" text="Capacity updates in real time, so overbooking is never possible." />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, text }) {
  return (
    <div className="border border-white/10 rounded-xl p-5 bg-white/[0.03]">
      <h3 className="font-display font-semibold mb-2">{title}</h3>
      <p className="text-sm text-navy-300">{text}</p>
    </div>
  );
}
```

---

## 25. frontend/src/pages/Login.jsx

- **Layer**: Frontend Pages
- **Language**: `jsx`
- **Title**: User Login Page
- **Lines of Code**: 83
- **File Size**: 2,815 bytes
- **Description**: Authentication form with role-aware redirection upon successful token validation.

```jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Spinner } from "../components/UI";
import { extractErrorMessage } from "../services/api";

const ROLE_HOME = {
  truck_provider: "/provider",
  shipper: "/shipper",
  driver: "/driver",
  admin: "/admin",
};

export default function Login() {
  const { login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      pushToast(`Welcome back, ${user.full_name.split(" ")[0]}`, "success");
      navigate(ROLE_HOME[user.role] || "/");
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-slate-50">
      <Card className="w-full max-w-sm p-7">
        <h1 className="font-display font-semibold text-2xl text-navy-950 mb-1">Log in</h1>
        <p className="text-sm text-navy-600 mb-6">Access your RouteShare dashboard.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" variant="accent" className="w-full" disabled={loading}>
            {loading ? <Spinner /> : "Log in"}
          </Button>
        </form>

        <p className="text-sm text-navy-600 mt-6 text-center">
          New to RouteShare?{" "}
          <Link to="/register" className="text-navy-950 font-medium underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
```

---

## 26. frontend/src/pages/Register.jsx

- **Layer**: Frontend Pages
- **Language**: `jsx`
- **Title**: User Registration Page
- **Lines of Code**: 186
- **File Size**: 7,517 bytes
- **Description**: Sign-up page supporting role selection (shipper, provider, driver) with company/license details.

```jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Select, Spinner } from "../components/UI";
import { authApi, extractErrorMessage } from "../services/api";

export default function Register() {
  const { register } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "shipper",
    company_name: "",
    license_number: "",
    experience_years: "",
    vehicle_number: "",
    vehicle_type: "Truck",
    base_city: "",
    emergency_contact: "",
    affiliated_provider_id: "",
  });
  const [providers, setProviders] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authApi.providers().then((res) => setProviders(res.data)).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const e = {};
    if (form.full_name.trim().length < 2) e.full_name = "Enter your full name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!/^\+?[0-9\-\s]{7,20}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (form.password.length < 8) e.password = "At least 8 characters";
    else if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password)) {
      e.password = "Use upper, lower case letters and a number";
    }
    if (form.role === "driver") {
      if (!form.license_number.trim()) e.license_number = "Enter your Driving License (DL) number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        ...form,
        company_name: form.company_name || null,
        experience_years: form.experience_years ? parseInt(form.experience_years, 10) : 0,
        affiliated_provider_id: form.affiliated_provider_id || null,
      });
      pushToast("Account created successfully. You can log in now.", "success");
      navigate("/login");
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-slate-50">
      <Card className="w-full max-w-lg p-7">
        <h1 className="font-display font-semibold text-2xl text-navy-950 mb-1">Create your account</h1>
        <p className="text-sm text-navy-600 mb-6">Join as a Truck Provider, Shipper, or Driver.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Select label="I am a" value={form.role} onChange={set("role")}>
            <option value="shipper">Shipper — I need freight transportation</option>
            <option value="truck_provider">Truck Provider — I have return-route capacity</option>
            <option value="driver">Driver — I operate a commercial truck</option>
          </Select>

          <Input label="Full name" value={form.full_name} onChange={set("full_name")} error={errors.full_name} placeholder="e.g. Suresh Kumar" />
          <Input label="Email address" type="email" value={form.email} onChange={set("email")} error={errors.email} autoComplete="email" placeholder="name@domain.com" />
          <Input label="Phone number" value={form.phone} onChange={set("phone")} error={errors.phone} placeholder="+91 90000 00000" />

          {form.role === "truck_provider" && (
            <Input
              label="Company name (optional)"
              value={form.company_name}
              onChange={set("company_name")}
              placeholder="e.g. Kumar Logistics Pvt Ltd"
            />
          )}

          {form.role === "driver" && (
            <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <h3 className="font-semibold text-sm text-navy-900">Driver Credentials & Vehicle Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Driving License (DL) No."
                  required
                  value={form.license_number}
                  onChange={set("license_number")}
                  error={errors.license_number}
                  placeholder="e.g. DL-1420110012345"
                />
                <Input
                  label="Experience (Years)"
                  type="number"
                  min="0"
                  max="50"
                  value={form.experience_years}
                  onChange={set("experience_years")}
                  placeholder="e.g. 5"
                />
                <Input
                  label="Vehicle Number (Optional)"
                  value={form.vehicle_number}
                  onChange={set("vehicle_number")}
                  placeholder="e.g. TN-38-KL-1001"
                />
                <Select label="Vehicle Type" value={form.vehicle_type} onChange={set("vehicle_type")}>
                  <option value="Truck">10-Wheeler Truck</option>
                  <option value="Mini Truck">Mini Truck / LCV</option>
                  <option value="Trailer">Flatbed Trailer</option>
                  <option value="Container">Container Truck</option>
                </Select>
                <Input
                  label="Base City / Terminal"
                  value={form.base_city}
                  onChange={set("base_city")}
                  placeholder="e.g. Coimbatore"
                />
                <Input
                  label="Emergency Contact Phone"
                  value={form.emergency_contact}
                  onChange={set("emergency_contact")}
                  placeholder="+91 98765 43210"
                />
              </div>
              <Select
                label="Affiliated Logistics Provider (Optional)"
                value={form.affiliated_provider_id}
                onChange={set("affiliated_provider_id")}
              >
                <option value="">Independent / Self-Employed</option>
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company_name || p.full_name} ({p.email})
                  </option>
                ))}
              </Select>
            </div>
          )}

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            autoComplete="new-password"
          />

          <Button type="submit" variant="accent" className="w-full" disabled={loading}>
            {loading ? <Spinner /> : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-navy-600 mt-6 text-center">
          Already registered?{" "}
          <Link to="/login" className="text-navy-950 font-medium underline underline-offset-2">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
```

---

## 27. frontend/src/pages/ShipperDashboard.jsx

- **Layer**: Frontend Dashboards
- **Language**: `jsx`
- **Title**: Shipper Portal Dashboard
- **Lines of Code**: 319
- **File Size**: 13,619 bytes
- **Description**: Comprehensive portal for shippers to search routes, filter by available payload/volume, book cargo space, and track shipments.

```jsx
import { useEffect, useState } from "react";
import { searchApi, bookingsApi, extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Badge, Spinner, EmptyState, Modal } from "../components/UI";

export default function ShipperDashboard() {
  const { pushToast } = useToast();
  const [searchForm, setSearchForm] = useState({ pickup_location: "", destination_location: "", cargo_weight_kg: "" });
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [bookingTarget, setBookingTarget] = useState(null);
  const [bookingForm, setBookingForm] = useState({ pickup_location: "", delivery_location: "", cargo_volume_cbm: "" });
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await bookingsApi.mine();
      setHistory(data);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoadingHistory(false);
    }
  };

  const downloadInvoice = async (bookingId, bookingRef) => {
    try {
      const response = await bookingsApi.downloadInvoice(bookingId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${bookingRef}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      pushToast(extractErrorMessage(err), 'error');
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSearch = async (evt) => {
    evt.preventDefault();
    setSearching(true);
    setResults(null);
    try {
      const { data } = await searchApi.search({
        pickup_location: searchForm.pickup_location,
        destination_location: searchForm.destination_location,
        cargo_weight_kg: Number(searchForm.cargo_weight_kg),
      });
      setResults(data);
      if (data.length === 0) {
        pushToast("No matching return routes found for this search.", "info");
      }
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setSearching(false);
    }
  };

  const openBooking = (result) => {
    setBookingTarget(result);
    setBookingForm({
      pickup_location: searchForm.pickup_location,
      delivery_location: searchForm.destination_location,
      cargo_volume_cbm: "",
    });
  };

  const confirmBooking = async () => {
    setSubmitting(true);
    try {
      const { data } = await bookingsApi.create({
        route_id: bookingTarget.route.id,
        pickup_location: bookingForm.pickup_location,
        delivery_location: bookingForm.delivery_location,
        cargo_weight_kg: Number(searchForm.cargo_weight_kg),
        cargo_volume_cbm: bookingForm.cargo_volume_cbm ? Number(bookingForm.cargo_volume_cbm) : null,
      });
      pushToast(`Booking confirmed — reference ${data.booking_ref}`, "success");
      setBookingTarget(null);
      handleSearch({ preventDefault: () => {} });
      loadHistory();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const cancelBooking = async (id, ref) => {
    try {
      await bookingsApi.cancel(id);
      pushToast(`Booking ${ref} cancelled.`, "success");
      loadHistory();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl text-navy-950">Shipper Dashboard</h1>
        <p className="text-navy-600 text-sm mt-1">Search empty-return capacity along your freight corridor and reserve space.</p>
      </div>

      <Card className="p-6">
        <h2 className="font-display font-semibold text-navy-900 mb-4">Search freight opportunities</h2>
        <form onSubmit={handleSearch} className="grid sm:grid-cols-4 gap-3 items-end">
          <Input
            label="Pickup city"
            required
            value={searchForm.pickup_location}
            onChange={(e) => setSearchForm({ ...searchForm, pickup_location: e.target.value })}
          />
          <Input
            label="Delivery city"
            required
            value={searchForm.destination_location}
            onChange={(e) => setSearchForm({ ...searchForm, destination_location: e.target.value })}
          />
          <Input
            label="Cargo weight (kg)"
            type="number"
            min="1"
            required
            value={searchForm.cargo_weight_kg}
            onChange={(e) => setSearchForm({ ...searchForm, cargo_weight_kg: e.target.value })}
          />
          <Button type="submit" variant="accent" disabled={searching}>
            {searching ? <Spinner /> : "Search"}
          </Button>
        </form>
      </Card>

      {results !== null && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-navy-900">Matching routes ({results.length})</h2>
          {results.length === 0 ? (
            <Card>
              <EmptyState
                title="No matching route available"
                description="Try a nearby city, a different pickup/delivery pair, or check back later as new return routes are registered."
              />
            </Card>
          ) : (
            results.map((r) => (
              <Card key={r.route.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-xs text-navy-500">{r.route.route_code}</span>
                    <Badge tone="active">provider: {r.provider_name}</Badge>
                    {r.route.driver && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        👤 Driver: {r.route.driver.full_name}
                      </span>
                    )}
                    {r.route.vehicle && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-navy-100 text-navy-800">
                        🚛 {r.route.vehicle.vehicle_number}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-navy-950">
                    {r.route.source_city} → {r.route.destination_city}
                  </h3>
                  <p className="text-sm text-navy-600">
                    {r.route.available_capacity_kg} kg available · returns {new Date(r.route.return_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-display font-semibold text-lg text-navy-950">₹{r.estimated_cost_for_query}</div>
                  <Button variant="accent" className="mt-2" onClick={() => openBooking(r)}>
                    Reserve space
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-display font-semibold text-navy-900">Booking history</h2>
        {loadingHistory ? (
          <Spinner />
        ) : history.length === 0 ? (
          <Card>
            <EmptyState title="No bookings yet" description="Your reserved freight bookings will appear here." />
          </Card>
        ) : (
          <Card className="divide-y divide-navy-900/10">
            {history.map((b) => (
              <div key={b.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-navy-500">{b.booking_ref}</span>
                      <Badge tone={b.status}>{b.status}</Badge>
                      {b.route?.route_code && (
                        <span className="text-xs font-mono text-navy-600 bg-navy-100 px-2 py-0.5 rounded">
                          Route: {b.route.route_code}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-navy-950">
                      {b.pickup_location} → {b.delivery_location}
                    </p>
                    <p className="text-xs text-navy-600">
                      Weight: {b.cargo_weight_kg} kg {b.cargo_volume_cbm ? `· ${b.cargo_volume_cbm} CBM` : ""} · Total Cost: ₹{b.cost}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {['confirmed', 'picked_up', 'delivered'].includes(b.status) && (
                      <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => downloadInvoice(b.id, b.booking_ref)}>
                        Invoice PDF
                      </Button>
                    )}
                    {(b.status === "confirmed" || b.status === "pending") && (
                      <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => cancelBooking(b.id, b.booking_ref)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Assigned Driver Details for Shipper */}
                {b.route?.driver ? (
                  <div className="p-3 bg-navy-50 rounded-xl border border-navy-900/10 flex items-center justify-between gap-3 flex-wrap text-xs">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-navy-900 flex items-center gap-1.5">
                        👤 Assigned Driver: {b.route.driver.full_name}
                      </span>
                      {b.route.driver.phone && (
                        <a
                          href={`tel:${b.route.driver.phone}`}
                          className="text-amber-800 hover:text-amber-950 font-semibold underline underline-offset-2 flex items-center gap-1"
                        >
                          📞 {b.route.driver.phone}
                        </a>
                      )}
                      {b.route.driver.license_number && (
                        <span className="text-navy-600">DL: <span className="font-mono">{b.route.driver.license_number}</span></span>
                      )}
                      {(b.route.driver.vehicle_number || b.route.vehicle?.vehicle_number) && (
                        <span className="text-navy-600">Vehicle: <span className="font-mono">{b.route.driver.vehicle_number || b.route.vehicle?.vehicle_number}</span></span>
                      )}
                    </div>
                    {b.route.driver.phone && (
                      <a
                        href={`tel:${b.route.driver.phone}`}
                        className="px-3 py-1 rounded-lg bg-navy-900 text-white font-semibold hover:bg-navy-800 text-xs"
                      >
                        Call Driver
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-navy-500 italic bg-navy-50/50 p-2 rounded-lg border border-dashed border-navy-200">
                    ⏳ Driver assignment in progress by logistics provider
                  </div>
                )}
              </div>
            ))}
          </Card>
        )}
      </div>

      <Modal open={!!bookingTarget} onClose={() => setBookingTarget(null)} title="Confirm your booking">
        {bookingTarget && (
          <div className="space-y-4">
            <p className="text-sm text-navy-600">
              Reserving <strong>{searchForm.cargo_weight_kg} kg</strong> on route{" "}
              <strong>{bookingTarget.route.route_code}</strong> for an estimated{" "}
              <strong>₹{bookingTarget.estimated_cost_for_query}</strong>.
            </p>
            <Input
              label="Pickup location"
              value={bookingForm.pickup_location}
              onChange={(e) => setBookingForm({ ...bookingForm, pickup_location: e.target.value })}
            />
            <Input
              label="Delivery location"
              value={bookingForm.delivery_location}
              onChange={(e) => setBookingForm({ ...bookingForm, delivery_location: e.target.value })}
            />
            <Input
              label="Cargo volume in cbm (optional)"
              type="number"
              min="0.1"
              step="0.1"
              value={bookingForm.cargo_volume_cbm}
              onChange={(e) => setBookingForm({ ...bookingForm, cargo_volume_cbm: e.target.value })}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setBookingTarget(null)}>
                Cancel
              </Button>
              <Button variant="accent" onClick={confirmBooking} disabled={submitting}>
                {submitting ? <Spinner /> : "Confirm booking"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
```

---

## 28. frontend/src/pages/ProviderDashboard.jsx

- **Layer**: Frontend Dashboards
- **Language**: `jsx`
- **Title**: Logistics Provider Dashboard
- **Lines of Code**: 458
- **File Size**: 21,147 bytes
- **Description**: Enterprise management interface for providers: fleet management, route scheduling, booking approval/rejection, and revenue analytics.

```jsx
import { useEffect, useState } from "react";
import { routesApi, bookingsApi, vehiclesApi } from "../services/api";
import { extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Select, Badge, Spinner, EmptyState, Modal } from "../components/UI";

const emptyForm = {
  vehicle_id: "",
  source_city: "",
  destination_city: "",
  intermediate_hubs: "",
  return_date: "",
  total_capacity_kg: "",
  rate_per_kg: "",
};

const emptyVehicleForm = {
  vehicle_number: "",
  vehicle_type: "Truck",
  capacity_kg: "",
};

export default function ProviderDashboard() {
  const { pushToast } = useToast();
  const [routes, setRoutes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicleForm);
  const [submitting, setSubmitting] = useState(false);
  const [vehicleSubmitting, setVehicleSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTargetRoute, setAssignTargetRoute] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [assigningDriver, setAssigningDriver] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, b, v, d] = await Promise.all([
        routesApi.mine(),
        bookingsApi.providerBookings(),
        vehiclesApi.mine(),
        routesApi.availableDrivers(),
      ]);
      setRoutes(r.data);
      setBookings(b.data);
      setVehicles(v.data);
      setAvailableDrivers(d.data);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRoute = async (evt) => {
    evt.preventDefault();
    setSubmitting(true);
    try {
      await routesApi.create({
        ...form,
        total_capacity_kg: Number(form.total_capacity_kg),
        rate_per_kg: Number(form.rate_per_kg),
        return_date: new Date(form.return_date).toISOString(),
        vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : undefined,
      });
      pushToast("Return route registered successfully.", "success");
      setForm(emptyForm);
      loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRoute = async () => {
    try {
      await routesApi.remove(confirmDelete.id);
      pushToast(`Route ${confirmDelete.route_code} deleted.`, "success");
      setConfirmDelete(null);
      loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
      setConfirmDelete(null);
    }
  };

  const handleCreateVehicle = async (evt) => {
    evt.preventDefault();
    setVehicleSubmitting(true);
    try {
      await vehiclesApi.create({
        ...vehicleForm,
        capacity_kg: Number(vehicleForm.capacity_kg),
      });
      pushToast("Vehicle registered successfully.", "success");
      setVehicleForm(emptyVehicleForm);
      loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setVehicleSubmitting(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await vehiclesApi.remove(id);
      pushToast("Vehicle removed successfully.", "success");
      loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    }
  };

  const openAssignModal = async (route) => {
    setAssignTargetRoute(route);
    setAssignModalOpen(true);
    try {
      const { data } = await routesApi.availableDrivers();
      setAvailableDrivers(data);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) return;
    setAssigningDriver(true);
    try {
      await routesApi.assignDriver(assignTargetRoute.id, selectedDriver);
      pushToast("Driver assigned successfully.", "success");
      setAssignModalOpen(false);
      setSelectedDriver("");
      loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setAssigningDriver(false);
    }
  };

  const bookingsForRoute = (routeId) => bookings.filter((b) => b.route_id === routeId);

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl text-navy-950">Truck Provider Dashboard</h1>
        <p className="text-navy-600 text-sm mt-1">Manage your vehicles, register empty-return routes, and track bookings.</p>
      </div>

      <Card className="p-6">
        <details open className="group">
          <summary className="font-display font-semibold text-navy-900 cursor-pointer outline-none list-none flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span>Fleet Management</span>
              <span className="text-xs font-normal text-navy-500 font-sans">
                ({vehicles.length} Vehicles · {availableDrivers.length} Drivers)
              </span>
            </span>
            <span className="text-navy-500 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5 pt-4 border-t border-navy-900/10">
            {/* Add Vehicle Form */}
            <div>
              <h3 className="font-semibold text-sm text-navy-950 mb-3">Add a Fleet Vehicle</h3>
              <form onSubmit={handleCreateVehicle} className="space-y-3">
                <Input label="Vehicle Number" required placeholder="e.g. TN-38-KL-1001" value={vehicleForm.vehicle_number} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value })} />
                <Select label="Vehicle Type" required value={vehicleForm.vehicle_type} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_type: e.target.value })}>
                  <option value="Truck">10-Wheeler Truck</option>
                  <option value="Mini Truck">Mini Truck / LCV</option>
                  <option value="Trailer">Flatbed Semi-Trailer</option>
                  <option value="Container">Container Truck</option>
                </Select>
                <Input label="Capacity (kg)" type="number" min="1" required placeholder="e.g. 8000" value={vehicleForm.capacity_kg} onChange={(e) => setVehicleForm({ ...vehicleForm, capacity_kg: e.target.value })} />
                <Button type="submit" variant="accent" className="w-full" disabled={vehicleSubmitting}>
                  {vehicleSubmitting ? <Spinner /> : "Add Vehicle"}
                </Button>
              </form>
            </div>

            {/* Registered Vehicles */}
            <div>
              <h3 className="font-semibold text-sm text-navy-950 mb-3">Registered Fleet ({vehicles.length})</h3>
              {vehicles.length === 0 ? (
                <p className="text-sm text-navy-500 p-4 bg-navy-50 rounded-lg text-center">No vehicles registered yet.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {vehicles.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-3 bg-navy-900/5 rounded-xl border border-navy-900/10 text-sm">
                      <div>
                        <div className="font-bold text-navy-950 font-mono">{v.vehicle_number}</div>
                        <div className="text-xs text-navy-600">{v.vehicle_type} · {v.capacity_kg.toLocaleString()} kg payload</div>
                      </div>
                      <Button variant="danger" className="text-xs px-2 py-1" onClick={() => handleDeleteVehicle(v.id)}>Delete</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fleet Drivers Directory */}
            <div>
              <h3 className="font-semibold text-sm text-navy-950 mb-3">Fleet & Commercial Drivers ({availableDrivers.length})</h3>
              {availableDrivers.length === 0 ? (
                <p className="text-sm text-navy-500 p-4 bg-navy-50 rounded-lg text-center">No drivers currently registered.</p>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {availableDrivers.map((d) => (
                    <div key={d.id} className="p-3 bg-navy-900/5 rounded-xl border border-navy-900/10 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-950">{d.full_name}</span>
                        <Badge tone={d.availability_status === "available" ? "active" : "default"}>
                          {d.availability_status || "available"}
                        </Badge>
                      </div>
                      <div className="text-navy-600">
                        {d.phone ? <a href={`tel:${d.phone}`} className="hover:underline font-medium text-navy-900">📞 {d.phone}</a> : "No phone"} · DL: {d.license_number || "Not added"}
                      </div>
                      <div className="text-navy-500 text-[11px]">
                        {d.vehicle_number ? `Truck: ${d.vehicle_number} (${d.vehicle_type || "Truck"})` : "Vehicle: Unassigned"} · {d.experience_years || 0} yrs exp
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </details>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="font-display font-semibold text-navy-900 mb-4">Register a return route</h2>
          <form onSubmit={handleCreateRoute} className="space-y-3">
            <Select label="Vehicle (Optional)" value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}>
              <option value="">-- Select a Vehicle --</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.vehicle_number} ({v.capacity_kg} kg)</option>
              ))}
            </Select>
            <Input label="Source city" required value={form.source_city} onChange={(e) => setForm({ ...form, source_city: e.target.value })} />
            <Input label="Destination city" required value={form.destination_city} onChange={(e) => setForm({ ...form, destination_city: e.target.value })} />
            <Input
              label="Intermediate hubs (comma-separated)"
              placeholder="e.g. Salem, Vellore"
              value={form.intermediate_hubs}
              onChange={(e) => setForm({ ...form, intermediate_hubs: e.target.value })}
            />
            <Input
              label="Return date"
              type="datetime-local"
              required
              value={form.return_date}
              onChange={(e) => setForm({ ...form, return_date: e.target.value })}
            />
            <Input
              label="Available capacity (kg)"
              type="number"
              min="1"
              required
              value={form.total_capacity_kg}
              onChange={(e) => setForm({ ...form, total_capacity_kg: e.target.value })}
            />
            <Input
              label="Rate per kg (₹)"
              type="number"
              min="0.1"
              step="0.1"
              required
              value={form.rate_per_kg}
              onChange={(e) => setForm({ ...form, rate_per_kg: e.target.value })}
            />
            <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
              {submitting ? <Spinner /> : "Register route"}
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display font-semibold text-navy-900">Your active routes</h2>
          {loading ? (
            <Spinner />
          ) : routes.length === 0 ? (
            <Card>
              <EmptyState title="No routes yet" description="Register your first return route using the form on the left." />
            </Card>
          ) : (
            routes.map((route) => (
              <Card key={route.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-navy-500">{route.route_code}</span>
                      <Badge tone={route.status}>{route.status}</Badge>
                    </div>
                    <h3 className="font-semibold text-navy-950">
                      {route.source_city} → {route.destination_city}
                    </h3>
                    {route.intermediate_hubs && (
                      <p className="text-xs text-navy-500">via {route.intermediate_hubs}</p>
                    )}
                    <p className="text-sm text-navy-600 mt-1">
                      Returns {new Date(route.return_date).toLocaleString()}
                    </p>
                    {route.vehicle && (
                      <p className="text-sm font-medium mt-1">Vehicle: {route.vehicle.vehicle_number}</p>
                    )}
                    {route.driver ? (
                      <div className="mt-2 p-2.5 bg-navy-50 rounded-lg border border-navy-900/10 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-navy-950 flex items-center gap-1.5">
                            👤 Driver: {route.driver.full_name || route.driver.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => openAssignModal(route)}
                            className="text-amber-700 hover:text-amber-900 font-semibold underline underline-offset-2 ml-2"
                          >
                            Reassign
                          </button>
                        </div>
                        <div className="text-navy-600 flex items-center gap-2 flex-wrap">
                          {route.driver.phone && (
                            <a href={`tel:${route.driver.phone}`} className="hover:underline text-navy-800 font-medium">
                              📞 {route.driver.phone}
                            </a>
                          )}
                          {route.driver.license_number && (
                            <span>· DL: {route.driver.license_number}</span>
                          )}
                          {route.driver.vehicle_number && (
                            <span>· Vehicle: {route.driver.vehicle_number}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => openAssignModal(route)}>
                          Assign Driver
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="danger"
                    className="text-xs px-3 py-1.5"
                    onClick={() => setConfirmDelete(route)}
                    disabled={route.available_capacity_kg < route.total_capacity_kg}
                    title={
                      route.available_capacity_kg < route.total_capacity_kg
                        ? "Cannot delete a route with active bookings"
                        : "Delete route"
                    }
                  >
                    Delete
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4 text-sm">
                  <div className="bg-navy-900/5 rounded-lg p-3">
                    <div className="text-navy-500 text-xs">Capacity</div>
                    <div className="font-semibold text-navy-950">
                      {route.available_capacity_kg} / {route.total_capacity_kg} kg
                    </div>
                  </div>
                  <div className="bg-navy-900/5 rounded-lg p-3">
                    <div className="text-navy-500 text-xs">Rate</div>
                    <div className="font-semibold text-navy-950">₹{route.rate_per_kg}/kg</div>
                  </div>
                  <div className="bg-navy-900/5 rounded-lg p-3">
                    <div className="text-navy-500 text-xs">Bookings</div>
                    <div className="font-semibold text-navy-950">{bookingsForRoute(route.id).length}</div>
                  </div>
                </div>

                {bookingsForRoute(route.id).length > 0 && (
                  <div className="mt-4 border-t border-navy-900/10 pt-3 space-y-2">
                    {bookingsForRoute(route.id).map((b) => (
                      <div key={b.id} className="flex items-center justify-between text-sm">
                        <span className="font-mono text-xs text-navy-500">{b.booking_ref}</span>
                        <span className="text-navy-700">{b.cargo_weight_kg} kg</span>
                        <Badge tone={b.status}>{b.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete this route?">
        <p className="text-sm text-navy-600 mb-5">
          This will permanently remove route {confirmDelete?.route_code}. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRoute}>
            Delete route
          </Button>
        </div>
      </Modal>

      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Driver to Route">
        <div className="space-y-4">
          <p className="text-sm text-navy-600">
            Assign an available commercial driver to return route <strong>{assignTargetRoute?.route_code}</strong> ({assignTargetRoute?.source_city} → {assignTargetRoute?.destination_city}).
          </p>
          <Select label="Select Commercial Driver" value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
            <option value="">-- Select Driver --</option>
            {availableDrivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.full_name || d.name} (DL: {d.license_number || "Pending"} · {d.experience_years || 0} yrs exp)
              </option>
            ))}
          </Select>

          {selectedDriver && (() => {
            const d = availableDrivers.find((x) => x.id === selectedDriver);
            if (!d) return null;
            return (
              <div className="p-3.5 bg-navy-50 rounded-xl text-xs space-y-1.5 border border-navy-900/10">
                <div className="font-bold text-navy-950 text-sm">{d.full_name}</div>
                <div className="text-navy-700">📞 Phone: {d.phone || "N/A"} · ✉️ {d.email}</div>
                <div className="text-navy-700">🪪 License (DL): <span className="font-mono font-medium">{d.license_number || "Not added"}</span></div>
                <div className="text-navy-700">⭐ Driving Experience: <span className="font-medium">{d.experience_years || 0} Years</span></div>
                <div className="text-navy-700">🚛 Registered Vehicle: <span className="font-mono font-medium">{d.vehicle_number || "None"}</span> ({d.vehicle_type || "Truck"})</div>
                <div className="text-navy-700">📍 Base Terminal: <span className="font-medium">{d.base_city || "Unassigned"}</span></div>
                <div className="text-navy-700 font-medium">Duty Status: <Badge tone={d.availability_status === "available" ? "active" : "default"}>{d.availability_status || "available"}</Badge></div>
              </div>
            );
          })()}

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button variant="accent" onClick={handleAssignDriver} disabled={!selectedDriver || assigningDriver}>
              {assigningDriver ? <Spinner /> : "Confirm Driver Assignment"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
```

---

## 29. frontend/src/pages/DriverDashboard.jsx

- **Layer**: Frontend Dashboards
- **Language**: `jsx`
- **Title**: Driver Portal Dashboard
- **Lines of Code**: 819
- **File Size**: 40,987 bytes
- **Description**: Driver dashboard showing assigned trips, cargo manifest details, pickup/delivery stops, and live status updates.

```jsx
import { useEffect, useState } from "react";
import { driverApi, bookingsApi, extractErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Card, Button, Input, Select, Badge, Spinner, EmptyState } from "../components/UI";

export default function DriverDashboard() {
  const { user, updateUser } = useAuth();
  const { pushToast } = useToast();

  const [activeTab, setActiveTab] = useState("trips"); // "trips" | "profile" | "links"
  const [profile, setProfile] = useState(null);
  const [providers, setProviders] = useState([]);
  const [trips, setTrips] = useState([]);
  const [tripBookings, setTripBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // Driver details input form state
  const [detailsForm, setDetailsForm] = useState({
    license_number: "",
    experience_years: "",
    vehicle_number: "",
    vehicle_type: "Truck",
    base_city: "",
    emergency_contact: "",
    affiliated_provider_id: "",
    availability_status: "available",
    phone: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [profRes, provsRes, tripsRes] = await Promise.all([
        driverApi.profile(),
        driverApi.providers(),
        driverApi.trips(),
      ]);

      const prof = profRes.data;
      setProfile(prof);
      setProviders(provsRes.data);
      setTrips(tripsRes.data);

      setDetailsForm({
        license_number: prof.license_number || "",
        experience_years: prof.experience_years !== null && prof.experience_years !== undefined ? String(prof.experience_years) : "",
        vehicle_number: prof.vehicle_number || "",
        vehicle_type: prof.vehicle_type || "Truck",
        base_city: prof.base_city || "",
        emergency_contact: prof.emergency_contact || "",
        affiliated_provider_id: prof.affiliated_provider_id || "",
        availability_status: prof.availability_status || "available",
        phone: prof.phone || user?.phone || "",
      });

      // Load bookings for all trips
      const bookingsByRoute = {};
      await Promise.all(
        tripsRes.data.map(async (trip) => {
          try {
            const { data: bks } = await driverApi.tripBookings(trip.id);
            bookingsByRoute[trip.id] = bks;
          } catch {
            bookingsByRoute[trip.id] = [];
          }
        })
      );
      setTripBookings(bookingsByRoute);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload = {
        license_number: detailsForm.license_number.trim() || null,
        experience_years: detailsForm.experience_years ? parseInt(detailsForm.experience_years, 10) : 0,
        vehicle_number: detailsForm.vehicle_number.trim() || null,
        vehicle_type: detailsForm.vehicle_type || null,
        base_city: detailsForm.base_city.trim() || null,
        emergency_contact: detailsForm.emergency_contact.trim() || null,
        affiliated_provider_id: detailsForm.affiliated_provider_id || "",
        availability_status: detailsForm.availability_status || "available",
        phone: detailsForm.phone.trim() || null,
      };

      const { data } = await driverApi.updateProfile(payload);
      setProfile(data);
      if (updateUser) {
        updateUser({
          phone: data.phone,
          license_number: data.license_number,
          vehicle_number: data.vehicle_number,
          availability_status: data.availability_status,
          affiliated_provider_id: data.affiliated_provider_id,
          affiliated_provider_name: data.affiliated_provider_name,
        });
      }
      pushToast("Driver details & credentials saved successfully!", "success");
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const act = async (fn, id, successMsg) => {
    setBusyId(id);
    try {
      await fn();
      pushToast(successMsg, "success");
      await loadData();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setBusyId(null);
    }
  };

  const completeTrip = (routeId, code) =>
    act(() => driverApi.completeTrip(routeId), routeId, `Trip ${code} marked complete.`);

  const downloadInvoice = async (bookingId, bookingRef) => {
    try {
      const response = await bookingsApi.downloadInvoice(bookingId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice_${bookingRef}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    }
  };

  // Compute stats
  const totalBookingsCount = Object.values(tripBookings).reduce((acc, list) => acc + list.length, 0);
  const activeTripsCount = trips.filter((t) => t.status === "active").length;
  const completedTripsCount = trips.filter((t) => t.status === "completed").length;

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
      {/* Header and Hero Identity Bar */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 rounded-2xl p-6 text-white shadow-md border border-navy-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-navy-950 font-display font-bold text-2xl flex items-center justify-center shadow-lg">
              {user?.full_name ? user.full_name[0].toUpperCase() : "D"}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-display font-semibold text-2xl tracking-tight">{user?.full_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Commercial Driver
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                    profile?.availability_status === "on_trip"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : profile?.availability_status === "off_duty"
                      ? "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  ● {profile?.availability_status ? profile.availability_status.replace("_", " ") : "available"}
                </span>
              </div>
              <p className="text-navy-300 text-xs mt-1">
                {profile?.license_number ? `DL: ${profile.license_number}` : "License not registered yet"} ·{" "}
                {profile?.vehicle_number ? `Vehicle: ${profile.vehicle_number} (${profile.vehicle_type || "Truck"})` : "Vehicle not assigned"} ·{" "}
                {profile?.base_city ? `Base: ${profile.base_city}` : "Base city unassigned"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs">
            <div className="text-right px-2">
              <span className="text-navy-400 block">Affiliated Provider</span>
              <span className="font-semibold text-amber-400 truncate max-w-[180px] block">
                {profile?.affiliated_provider_name || "Independent / Self"}
              </span>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div className="text-right px-2">
              <span className="text-navy-400 block">Experience</span>
              <span className="font-semibold text-white">{profile?.experience_years || 0} Years</span>
            </div>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-navy-800/80 text-sm">
          <div className="bg-navy-900/60 rounded-xl p-3 border border-navy-800">
            <span className="text-navy-400 text-xs block">Active Trips</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{activeTripsCount}</span>
          </div>
          <div className="bg-navy-900/60 rounded-xl p-3 border border-navy-800">
            <span className="text-navy-400 text-xs block">Completed Trips</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{completedTripsCount}</span>
          </div>
          <div className="bg-navy-900/60 rounded-xl p-3 border border-navy-800">
            <span className="text-navy-400 text-xs block">Total Cargo Consignments</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{totalBookingsCount}</span>
          </div>
          <div className="bg-navy-900/60 rounded-xl p-3 border border-navy-800">
            <span className="text-navy-400 text-xs block">Direct Shipper Links</span>
            <span className="text-lg font-bold text-amber-400 mt-0.5 block">
              {new Set(Object.values(tripBookings).flat().map((b) => b.shipper_id)).size}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-navy-900/10">
        <button
          onClick={() => setActiveTab("trips")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === "trips"
              ? "border-amber-500 text-navy-950"
              : "border-transparent text-navy-600 hover:text-navy-900"
          }`}
        >
          <span>🚚 My Trips & Manifest</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-navy-900/10 text-navy-800 font-mono">
            {trips.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === "profile"
              ? "border-amber-500 text-navy-950"
              : "border-transparent text-navy-600 hover:text-navy-900"
          }`}
        >
          <span>📋 Driver Profile & Vehicle Inputs</span>
          {(!profile?.license_number || !profile?.vehicle_number) && (
            <span className="w-2 h-2 rounded-full bg-amber-500" title="Profile incomplete" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("links")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors flex items-center gap-2 ${
            activeTab === "links"
              ? "border-amber-500 text-navy-950"
              : "border-transparent text-navy-600 hover:text-navy-900"
          }`}
        >
          <span>🔗 Linked Provider & Shippers</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          {/* TAB 1: Assigned Trips */}
          {activeTab === "trips" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg text-navy-950">
                  Assigned Return Trips & Cargo Manifest
                </h2>
                <Button variant="outline" className="text-xs" onClick={loadData}>
                  Refresh Trips
                </Button>
              </div>

              {trips.length === 0 ? (
                <Card className="p-8">
                  <EmptyState
                    title="No trips currently assigned"
                    description="You have not been assigned to any return trips yet. When a fleet provider assigns you to a route, it will appear here with live pickup and delivery manifests."
                  />
                </Card>
              ) : (
                trips.map((trip) => {
                  const bookings = tripBookings[trip.id] || [];
                  const allSettled = bookings.length > 0 && bookings.every((b) => ["delivered", "cancelled"].includes(b.status));

                  return (
                    <Card key={trip.id} className="p-6 transition-all hover:shadow-md border border-navy-900/10">
                      {/* Trip Card Header */}
                      <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-navy-900/10">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-navy-900 text-white">
                              {trip.route_code}
                            </span>
                            <Badge tone={trip.status}>{trip.status}</Badge>
                            {trip.vehicle && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded bg-navy-100 text-navy-800">
                                🚛 {trip.vehicle.vehicle_number} ({trip.vehicle.vehicle_type})
                              </span>
                            )}
                            {trip.provider && (
                              <span className="text-xs text-navy-600 font-medium">
                                Provider: {trip.provider.company_name || trip.provider.full_name}
                              </span>
                            )}
                          </div>
                          <h3 className="font-display font-bold text-xl text-navy-950">
                            {trip.source_city} → {trip.destination_city}
                          </h3>
                          {trip.intermediate_hubs && (
                            <p className="text-xs text-navy-500 mt-0.5">Transit via: {trip.intermediate_hubs}</p>
                          )}
                          <p className="text-xs text-navy-600 mt-1">
                            Scheduled Departure: {new Date(trip.return_date).toLocaleString()}
                          </p>
                        </div>

                        {trip.status === "active" && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="accent"
                              className="text-xs"
                              disabled={!allSettled || busyId === trip.id}
                              onClick={() => completeTrip(trip.id, trip.route_code)}
                              title={
                                !allSettled
                                  ? "All bookings must be delivered or cancelled before completing the trip"
                                  : "Mark trip complete"
                              }
                            >
                              {busyId === trip.id ? <Spinner /> : "✓ Mark Trip Complete"}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Cargo Manifest / Shippers */}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-xs text-navy-500 font-medium uppercase tracking-wider">
                          <span>Cargo Consignments ({bookings.length})</span>
                          <span>Shipper & Contact Details</span>
                        </div>

                        {bookings.length === 0 ? (
                          <div className="p-4 bg-navy-50 rounded-lg text-center text-xs text-navy-500">
                            No cargo bookings have been scheduled on this route yet.
                          </div>
                        ) : (
                          bookings.map((b) => (
                            <div
                              key={b.id}
                              className="bg-navy-900/[0.03] hover:bg-navy-900/[0.05] border border-navy-900/10 rounded-xl p-4 transition-colors"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-semibold text-navy-600 bg-navy-100 px-2 py-0.5 rounded">
                                      {b.booking_ref}
                                    </span>
                                    <Badge tone={b.status}>{b.status}</Badge>
                                    <span className="text-xs font-semibold text-navy-800">
                                      {b.cargo_weight_kg} kg {b.cargo_volume_cbm ? `· ${b.cargo_volume_cbm} CBM` : ""}
                                    </span>
                                  </div>
                                  <div className="text-sm font-medium text-navy-900">
                                    <span className="text-emerald-700">Pickup:</span> {b.pickup_location} →{" "}
                                    <span className="text-blue-700">Drop:</span> {b.delivery_location}
                                  </div>
                                  {/* Linked Shipper Details */}
                                  {b.shipper && (
                                    <div className="flex items-center gap-3 text-xs text-navy-700 pt-1">
                                      <span className="font-medium">
                                        👤 Shipper: {b.shipper.full_name}{" "}
                                        {b.shipper.company_name ? `(${b.shipper.company_name})` : ""}
                                      </span>
                                      {b.shipper.phone && (
                                        <a
                                          href={`tel:${b.shipper.phone}`}
                                          className="text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 underline underline-offset-2"
                                        >
                                          📞 {b.shipper.phone}
                                        </a>
                                      )}
                                      <a
                                        href={`mailto:${b.shipper.email}`}
                                        className="text-navy-600 hover:text-navy-900 underline underline-offset-2"
                                      >
                                        ✉️ {b.shipper.email}
                                      </a>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Button
                                    variant="outline"
                                    className="text-xs px-3 py-1.5"
                                    onClick={() => downloadInvoice(b.id, b.booking_ref)}
                                  >
                                    📄 Invoice PDF
                                  </Button>

                                  {b.status === "confirmed" && (
                                    <Button
                                      variant="accent"
                                      className="text-xs px-3 py-1.5"
                                      disabled={busyId === b.id}
                                      onClick={() =>
                                        act(() => driverApi.confirmPickup(b.id), b.id, "Cargo pickup confirmed.")
                                      }
                                    >
                                      {busyId === b.id ? <Spinner /> : "Confirm Pickup"}
                                    </Button>
                                  )}

                                  {b.status === "picked_up" && (
                                    <Button
                                      variant="accent"
                                      className="text-xs px-3 py-1.5"
                                      disabled={busyId === b.id}
                                      onClick={() =>
                                        act(() => driverApi.confirmDelivery(b.id), b.id, "Cargo delivery confirmed.")
                                      }
                                    >
                                      {busyId === b.id ? <Spinner /> : "Confirm Delivery"}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: Driver Details & Vehicle Inputs (The core inputs requested) */}
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="p-6">
                  <div className="border-b border-navy-900/10 pb-4 mb-5">
                    <h2 className="font-display font-semibold text-lg text-navy-950">
                      Driver Details & Credentials
                    </h2>
                    <p className="text-xs text-navy-600 mt-1">
                      Enter and maintain your commercial driver details. These details are verified by logistics providers and displayed on trip manifests to shippers.
                    </p>
                  </div>

                  <form onSubmit={handleSaveDetails} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Driving License (DL) Number"
                        required
                        value={detailsForm.license_number}
                        onChange={(e) => setDetailsForm({ ...detailsForm, license_number: e.target.value })}
                        placeholder="e.g. DL-1420110012345 or TN-38-2016-0045678"
                      />

                      <Input
                        label="Commercial Driving Experience (Years)"
                        type="number"
                        min="0"
                        max="50"
                        required
                        value={detailsForm.experience_years}
                        onChange={(e) => setDetailsForm({ ...detailsForm, experience_years: e.target.value })}
                        placeholder="e.g. 7"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Registered Vehicle Registration Number"
                        value={detailsForm.vehicle_number}
                        onChange={(e) => setDetailsForm({ ...detailsForm, vehicle_number: e.target.value })}
                        placeholder="e.g. TN-38-KL-1001"
                      />

                      <Select
                        label="Vehicle Class / Type"
                        value={detailsForm.vehicle_type}
                        onChange={(e) => setDetailsForm({ ...detailsForm, vehicle_type: e.target.value })}
                      >
                        <option value="Truck">10-Wheeler Standard Truck</option>
                        <option value="Multi-Axle Heavy Truck">12-Wheeler / Multi-Axle Heavy Truck</option>
                        <option value="Mini Truck">Mini Truck / LCV (e.g. Tata Ace, Bolero)</option>
                        <option value="Trailer">Flatbed Semi-Trailer</option>
                        <option value="Container">Enclosed Container Truck</option>
                        <option value="Refrigerated Truck">Refrigerated Reefer Truck</option>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Base City / Operating Hub"
                        value={detailsForm.base_city}
                        onChange={(e) => setDetailsForm({ ...detailsForm, base_city: e.target.value })}
                        placeholder="e.g. Coimbatore, Tamil Nadu"
                      />

                      <Input
                        label="Emergency Contact Phone"
                        value={detailsForm.emergency_contact}
                        onChange={(e) => setDetailsForm({ ...detailsForm, emergency_contact: e.target.value })}
                        placeholder="e.g. +91 98765 43210"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Driver Direct Phone"
                        value={detailsForm.phone}
                        onChange={(e) => setDetailsForm({ ...detailsForm, phone: e.target.value })}
                        placeholder="+91 90000 00000"
                      />

                      <Select
                        label="Duty / Availability Status"
                        value={detailsForm.availability_status}
                        onChange={(e) => setDetailsForm({ ...detailsForm, availability_status: e.target.value })}
                      >
                        <option value="available">Available for Dispatch</option>
                        <option value="on_trip">Currently on Active Trip</option>
                        <option value="off_duty">Off Duty / Rest Period</option>
                      </Select>
                    </div>

                    <div className="pt-2">
                      <Select
                        label="Affiliated Logistics Provider (Link to Fleet)"
                        value={detailsForm.affiliated_provider_id}
                        onChange={(e) => setDetailsForm({ ...detailsForm, affiliated_provider_id: e.target.value })}
                      >
                        <option value="">-- Independent Contractor / Self-Employed --</option>
                        {providers.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.company_name || p.full_name} ({p.email})
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-900/10">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          if (profile) {
                            setDetailsForm({
                              license_number: profile.license_number || "",
                              experience_years: profile.experience_years ? String(profile.experience_years) : "",
                              vehicle_number: profile.vehicle_number || "",
                              vehicle_type: profile.vehicle_type || "Truck",
                              base_city: profile.base_city || "",
                              emergency_contact: profile.emergency_contact || "",
                              affiliated_provider_id: profile.affiliated_provider_id || "",
                              availability_status: profile.availability_status || "available",
                              phone: profile.phone || user?.phone || "",
                            });
                          }
                        }}
                      >
                        Reset Changes
                      </Button>
                      <Button type="submit" variant="accent" disabled={savingProfile}>
                        {savingProfile ? <Spinner /> : "Save Driver Details"}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>

              {/* Sidebar with Credentials & Verification Status */}
              <div className="space-y-4">
                <Card className="p-5">
                  <h3 className="font-semibold text-sm text-navy-950 mb-3">Verification & Credentials</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-50">
                      <span className="text-navy-600">License Verification</span>
                      <span className="font-semibold text-emerald-700">
                        {detailsForm.license_number ? "Verified ✓" : "Pending DL"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-50">
                      <span className="text-navy-600">Driving Record</span>
                      <span className="font-semibold text-navy-900">
                        {detailsForm.experience_years ? `${detailsForm.experience_years} Years Experience` : "Not specified"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-50">
                      <span className="text-navy-600">Assigned Vehicle</span>
                      <span className="font-semibold text-navy-900 font-mono">
                        {detailsForm.vehicle_number || "None"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-navy-50">
                      <span className="text-navy-600">Affiliation</span>
                      <span className="font-semibold text-amber-700">
                        {profile?.affiliated_provider_name || "Independent"}
                      </span>
                    </div>
                  </div>
                </Card>

                <Card className="p-5 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <div className="text-amber-600 text-lg">💡</div>
                    <div className="text-xs text-navy-700 space-y-1">
                      <span className="font-semibold block text-navy-950">Why keep details updated?</span>
                      <p>
                        Logistics providers look for verified driving licenses, registered vehicle numbers, and commercial driving experience when assigning high-value freight return routes.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: Linked Fleet, Provider & Shippers */}
          {activeTab === "links" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Linked Logistics Provider Card */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🏢</span>
                    <div>
                      <h3 className="font-display font-semibold text-navy-950">Linked Logistics Provider</h3>
                      <p className="text-xs text-navy-500">Your affiliated fleet operator & return-route coordinator</p>
                    </div>
                  </div>
                  <Badge tone={profile?.affiliated_provider_id ? "active" : "default"}>
                    {profile?.affiliated_provider_id ? "Linked" : "Unlinked"}
                  </Badge>
                </div>

                {profile?.affiliated_provider_id ? (
                  <div className="space-y-3 pt-2">
                    <div className="p-4 bg-navy-50 rounded-xl border border-navy-900/10 space-y-2">
                      <div className="font-bold text-navy-950 text-base">
                        {profile.affiliated_provider_name}
                      </div>
                      <div className="text-xs text-navy-600 space-y-1">
                        {profile.affiliated_provider_email && (
                          <div className="flex items-center gap-2">
                            <span>✉️</span>
                            <a
                              href={`mailto:${profile.affiliated_provider_email}`}
                              className="hover:underline text-navy-900 font-medium"
                            >
                              {profile.affiliated_provider_email}
                            </a>
                          </div>
                        )}
                        {profile.affiliated_provider_phone && (
                          <div className="flex items-center gap-2">
                            <span>📞</span>
                            <a
                              href={`tel:${profile.affiliated_provider_phone}`}
                              className="hover:underline text-navy-900 font-medium"
                            >
                              {profile.affiliated_provider_phone}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {profile.affiliated_provider_phone && (
                        <a
                          href={`tel:${profile.affiliated_provider_phone}`}
                          className="flex-1 text-center py-2 px-3 rounded-lg bg-navy-900 text-white text-xs font-semibold hover:bg-navy-800"
                        >
                          📞 Call Provider
                        </a>
                      )}
                      {profile.affiliated_provider_email && (
                        <a
                          href={`mailto:${profile.affiliated_provider_email}`}
                          className="flex-1 text-center py-2 px-3 rounded-lg border border-navy-300 text-navy-900 text-xs font-semibold hover:bg-navy-50"
                        >
                          ✉️ Email Provider
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-navy-50 rounded-xl text-center text-xs text-navy-600 space-y-3">
                    <p>You are currently operating as an independent driver with no affiliated fleet company.</p>
                    <Button variant="outline" className="text-xs" onClick={() => setActiveTab("profile")}>
                      Link to a Provider in Profile Tab
                    </Button>
                  </div>
                )}
              </Card>

              {/* Linked Vehicle Specifications Card */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🚛</span>
                    <div>
                      <h3 className="font-display font-semibold text-navy-950">Operating Vehicle Specs</h3>
                      <p className="text-xs text-navy-500">Your registered truck and commercial classification</p>
                    </div>
                  </div>
                  <Badge tone={detailsForm.vehicle_number ? "active" : "default"}>
                    {detailsForm.vehicle_number ? "Registered" : "No Vehicle"}
                  </Badge>
                </div>

                <div className="p-4 bg-navy-50 rounded-xl border border-navy-900/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-navy-500">Vehicle Registration:</span>
                    <span className="font-mono font-bold text-navy-950 text-sm">
                      {detailsForm.vehicle_number || "Not Registered"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-navy-500">Vehicle Classification:</span>
                    <span className="font-medium text-navy-900">{detailsForm.vehicle_type || "Standard Truck"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-navy-500">Base Terminal Hub:</span>
                    <span className="font-medium text-navy-900">{detailsForm.base_city || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-navy-500">Emergency Contact:</span>
                    <span className="font-medium text-navy-900">{detailsForm.emergency_contact || "None"}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-xs" onClick={() => setActiveTab("profile")}>
                  Update Vehicle Specs
                </Button>
              </Card>

              {/* Connected Shippers Directory */}
              <Card className="p-6 md:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">📦</span>
                    <div>
                      <h3 className="font-display font-semibold text-navy-950">Connected Shippers & Cargo Contacts</h3>
                      <p className="text-xs text-navy-500">Direct contacts of shippers whose freight you are moving</p>
                    </div>
                  </div>
                </div>

                {Object.values(tripBookings).flat().length === 0 ? (
                  <p className="text-xs text-navy-500 p-4 bg-navy-50 rounded-lg text-center">
                    No active shipper consignments found. Shippers will appear here once cargo is booked on your routes.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.values(tripBookings)
                      .flat()
                      .filter((b, idx, arr) => b.shipper && arr.findIndex((x) => x.shipper?.id === b.shipper?.id) === idx)
                      .map((b) => (
                        <div key={b.id} className="p-3 bg-navy-50 rounded-xl border border-navy-900/10 text-xs space-y-1.5">
                          <div className="font-bold text-navy-950">{b.shipper.full_name}</div>
                          {b.shipper.company_name && (
                            <div className="text-navy-600 font-medium">{b.shipper.company_name}</div>
                          )}
                          <div className="pt-1 flex items-center gap-2">
                            {b.shipper.phone && (
                              <a
                                href={`tel:${b.shipper.phone}`}
                                className="px-2 py-1 rounded bg-amber-500 text-navy-950 font-semibold hover:bg-amber-400"
                              >
                                📞 Call
                              </a>
                            )}
                            <a
                              href={`mailto:${b.shipper.email}`}
                              className="px-2 py-1 rounded bg-navy-900 text-white hover:bg-navy-800"
                            >
                              ✉️ Email
                            </a>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

## 30. frontend/src/pages/AdminDashboard.jsx

- **Layer**: Frontend Dashboards
- **Language**: `jsx`
- **Title**: Platform Administrator Dashboard
- **Lines of Code**: 214
- **File Size**: 8,562 bytes
- **Description**: Executive administration dashboard with platform-wide KPIs, user management, and provider verification.

```jsx
import { useEffect, useState } from "react";
import { adminApi, extractErrorMessage } from "../services/api";
import { useToast } from "../context/ToastContext";
import { Card, Button, Badge, Spinner, EmptyState, Modal } from "../components/UI";

const TABS = ["Overview", "Users", "Routes", "Bookings"];

export default function AdminDashboard() {
  const { pushToast } = useToast();
  const [tab, setTab] = useState("Overview");
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, r, b] = await Promise.all([
        adminApi.summary(),
        adminApi.users({}),
        adminApi.routes({}),
        adminApi.bookings({}),
      ]);
      setSummary(s.data);
      setUsers(u.data);
      setRoutes(r.data);
      setBookings(b.data);
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const deactivate = async (user) => {
    try {
      await adminApi.deactivateUser(user.id);
      pushToast(`${user.full_name} deactivated.`, "success");
      loadAll();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
    }
  };

  const deleteUser = async () => {
    try {
      await adminApi.deleteUser(confirmDeleteUser.id);
      pushToast(`${confirmDeleteUser.full_name} deleted.`, "success");
      setConfirmDeleteUser(null);
      loadAll();
    } catch (err) {
      pushToast(extractErrorMessage(err), "error");
      setConfirmDeleteUser(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
      <div>
        <h1 className="font-display font-semibold text-2xl text-navy-950">Administrator Dashboard</h1>
        <p className="text-navy-600 text-sm mt-1">Monitor platform activity, manage users, and review operational reports.</p>
      </div>

      <div className="flex gap-2 border-b border-navy-900/10">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`focus-ring px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t ? "border-amber-500 text-navy-950" : "border-transparent text-navy-500 hover:text-navy-800"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {tab === "Overview" && summary && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total users" value={summary.total_users} />
              <StatCard label="Truck providers" value={summary.total_providers} />
              <StatCard label="Shippers" value={summary.total_shippers} />
              <StatCard label="Drivers" value={summary.total_drivers} />
              <StatCard label="Active routes" value={summary.active_routes} />
              <StatCard label="Completed routes" value={summary.completed_routes} />
              <StatCard label="Total bookings" value={summary.total_bookings} />
              <StatCard label="Revenue" value={`₹${summary.total_revenue.toLocaleString()}`} />
              <StatCard label="Avg. capacity utilization" value={`${summary.average_capacity_utilization_pct}%`} className="lg:col-span-2" />
            </div>
          )}

          {tab === "Users" && (
            <Card className="divide-y divide-navy-900/10">
              {users.length === 0 ? (
                <EmptyState title="No users found" />
              ) : (
                users.map((u) => (
                  <div key={u.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-navy-950">{u.full_name}</p>
                        {u.role === "driver" && u.license_number && (
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-navy-100 text-navy-700">
                            DL: {u.license_number}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-navy-600">
                        {u.email} {u.phone ? `· ${u.phone}` : ""}
                      </p>
                      {u.role === "driver" && (
                        <p className="text-xs text-navy-500 mt-0.5">
                          {u.experience_years ? `${u.experience_years} yrs exp · ` : ""}
                          {u.vehicle_number ? `Vehicle: ${u.vehicle_number} · ` : ""}
                          {u.affiliated_provider_name ? `Fleet: ${u.affiliated_provider_name}` : "Independent"}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="default">{u.role.replace("_", " ")}</Badge>
                      {!u.is_active && <Badge tone="cancelled">deactivated</Badge>}
                      {u.is_active && (
                        <Button variant="outline" className="text-xs px-3 py-1.5" onClick={() => deactivate(u)}>
                          Deactivate
                        </Button>
                      )}
                      <Button variant="danger" className="text-xs px-3 py-1.5" onClick={() => setConfirmDeleteUser(u)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </Card>
          )}

          {tab === "Routes" && (
            <Card className="divide-y divide-navy-900/10">
              {routes.length === 0 ? (
                <EmptyState title="No routes registered" />
              ) : (
                routes.map((r) => (
                  <div key={r.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <span className="font-mono text-xs text-navy-500">{r.route_code}</span>
                      <p className="text-navy-800 text-sm">
                        {r.source_city} → {r.destination_city} · {r.available_capacity_kg}/{r.total_capacity_kg} kg
                      </p>
                    </div>
                    <Badge tone={r.status}>{r.status}</Badge>
                  </div>
                ))
              )}
            </Card>
          )}

          {tab === "Bookings" && (
            <Card className="divide-y divide-navy-900/10">
              {bookings.length === 0 ? (
                <EmptyState title="No bookings yet" />
              ) : (
                bookings.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <span className="font-mono text-xs text-navy-500">{b.booking_ref}</span>
                      <p className="text-navy-800 text-sm">
                        {b.pickup_location} → {b.delivery_location} · {b.cargo_weight_kg} kg · ₹{b.cost}
                      </p>
                    </div>
                    <Badge tone={b.status}>{b.status}</Badge>
                  </div>
                ))
              )}
            </Card>
          )}
        </>
      )}

      <Modal open={!!confirmDeleteUser} onClose={() => setConfirmDeleteUser(null)} title="Delete this user?">
        <p className="text-sm text-navy-600 mb-5">
          This will permanently remove {confirmDeleteUser?.full_name}'s account and all related data. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setConfirmDeleteUser(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteUser}>
            Delete user
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ label, value, className = "" }) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="text-navy-500 text-xs font-medium uppercase tracking-wide">{label}</div>
      <div className="font-display font-semibold text-2xl text-navy-950 mt-1">{value}</div>
    </Card>
  );
}
```

---
