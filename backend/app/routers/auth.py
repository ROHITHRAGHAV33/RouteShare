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
