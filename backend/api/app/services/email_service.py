"""Email delivery via Resend."""
import resend
from fastapi import HTTPException, status

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

resend.api_key = settings.RESEND_API_KEY

_DEFAULT_FROM = "CivicGuard <onboarding@resend.dev>"



def send_email(to: str, subject: str, body: str, from_address: str = _DEFAULT_FROM) -> None:
    try:
        resend.Emails.send(
            {
                "from": from_address,
                "to": [to],
                "subject": subject,
                "html": body,
            }
        )
    except Exception as exc:
        logger.exception("Resend email send failed for %s", to)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to send email: {exc}",
        ) from exc
