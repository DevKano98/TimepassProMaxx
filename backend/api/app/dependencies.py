"""
Shared FastAPI dependencies:

- get_current_user: decodes the bearer JWT, loads the User row, 401 if invalid/expired/missing.
- get_optional_current_user: same, but returns None instead of raising when no token is present
  (used by endpoints like POST /api/reports that accept both authenticated and anonymous calls).
- require_role: dependency factory, 403 if the current user's role isn't in the allowed set.
- check_anonymous_rate_limit: used only on POST /api/reports when no auth token is present.
"""
from typing import Optional
from uuid import UUID

from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.services.rate_limit_service import check_anonymous_limit
from app.utils.security import decode_token

_bearer_scheme = HTTPBearer(auto_error=False)


def _load_user_from_token(token: str, db: Session) -> User:
    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    if payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user = db.get(User, UUID(user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return _load_user_from_token(credentials.credentials, db)


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if credentials is None:
        return None
    return _load_user_from_token(credentials.credentials, db)


def require_role(*roles: str):
    """Dependency factory: raises 403 if current_user.role is not in `roles`."""

    def _dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return current_user

    return _dependency


def check_anonymous_rate_limit(
    request: Request,
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: Session = Depends(get_db),
) -> tuple[str, str]:
    """
    Enforced only when no auth token is present on POST /api/reports.
    Returns (device_id, ip_address) so the caller can stamp them onto the new Report row.
    """
    ip_address = request.client.host if request.client else "unknown"
    allowed = check_anonymous_limit(db=db, device_id=x_device_id, ip_address=ip_address)
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "anonymous_limit_exceeded",
                "message": "Daily anonymous report limit reached. Please verify with OTP to continue.",
            },
        )
    return x_device_id, ip_address
