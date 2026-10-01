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

