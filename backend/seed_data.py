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
