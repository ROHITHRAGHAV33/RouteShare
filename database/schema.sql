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
