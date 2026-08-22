from fastapi import APIRouter, Depends, HTTPException, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, OTPRequest, OTPVerify, RefreshRequest, TokenResponse
from app.services.email_service import send_email
from app.services.otp_service import check_otp_rate_limit, generate_otp, store_otp, verify_otp
from app.utils.logging import get_logger
from app.utils.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = get_logger(__name__)

_GENERIC_LOGIN_ERROR = "Incorrect email or password"


@router.post("/otp/request", status_code=status.HTTP_204_NO_CONTENT)
def request_otp(payload: OTPRequest, db: Session = Depends(get_db)) -> None:
    if not check_otp_rate_limit(payload.email, db=db):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Please try again later.",
        )

    code = generate_otp()
    store_otp(payload.email, code, db=db)
    send_email(
        to=payload.email,
        subject="Your CivicGuard verification code",
        body=f"<p>Your CivicGuard verification code is <strong>{code}</strong>. "
        f"It expires in 10 minutes.</p>",
    )


@router.post("/otp/verify", response_model=TokenResponse)
def verify_otp_and_login(payload: OTPVerify, db: Session = Depends(get_db)) -> TokenResponse:
    if not verify_otp(payload.email, payload.code, db=db):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired code")

    user = db.query(User).filter(User.email == payload.email).first()
    if user is None:
        user = User(email=payload.email, role="citizen")
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token(str(user.id))
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == payload.email).first()

    # Same error whether the email doesn't exist or the password is wrong -
    # never leak which one it was.
    if user is None or user.password_hash is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=_GENERIC_LOGIN_ERROR)

    access_token = create_access_token(str(user.id), user.role)
    refresh_token = create_refresh_token(str(user.id))
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        claims = decode_token(payload.refresh_token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    if claims.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    user = db.get(User, claims.get("sub"))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

    access_token = create_access_token(str(user.id), user.role)
    return TokenResponse(access_token=access_token)
