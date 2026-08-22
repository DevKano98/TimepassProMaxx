"""
OTP generation/storage/verification for citizen login backed by the database.
"""
import random
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models import OTPCode
from app.utils.logging import get_logger

logger = get_logger(__name__)


def generate_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


def check_otp_rate_limit(email: str, db: Optional[Session] = None) -> bool:
    """Returns True if this email has not exceeded settings.OTP_MAX_REQUESTS_PER_HOUR in the past hour."""
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        count = db.execute(
            select(func.count())
            .select_from(OTPCode)
            .where(OTPCode.email == email, OTPCode.created_at >= one_hour_ago)
        ).scalar_one()
        return count < settings.OTP_MAX_REQUESTS_PER_HOUR
    finally:
        if close_db:
            db.close()


def store_otp(email: str, code: str, db: Optional[Session] = None) -> None:
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
        
        # Clean up existing codes for this email
        db.query(OTPCode).filter(OTPCode.email == email).delete()
        
        otp_entry = OTPCode(email=email, code=code, expires_at=expires_at, created_at=now)
        db.add(otp_entry)
        db.commit()
    finally:
        if close_db:
            db.close()


def verify_otp(email: str, code: str, db: Optional[Session] = None) -> bool:
    close_db = False
    if db is None:
        db = SessionLocal()
        close_db = True

    try:
        now = datetime.now(timezone.utc)
        entry = (
            db.query(OTPCode)
            .filter(OTPCode.email == email)
            .order_by(OTPCode.created_at.desc())
            .first()
        )
        if entry is None:
            return False

        if now > entry.expires_at:
            db.delete(entry)
            db.commit()
            return False

        if entry.code != code:
            return False

        db.delete(entry)
        db.commit()
        return True
    finally:
        if close_db:
            db.close()
