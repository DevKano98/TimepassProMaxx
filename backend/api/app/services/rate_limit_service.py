"""
check_anonymous_limit(device_id, ip_address) -> bool

Counts today's (server UTC date) Report rows matching this device_id AND
ip_address combo. Returns False (blocked) once the count reaches
settings.ANON_REPORT_DAILY_LIMIT (default 3), per section 4.
"""
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Report


def check_anonymous_limit(db: Session, device_id: str, ip_address: str) -> bool:
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    count = db.execute(
        select(func.count())
        .select_from(Report)
        .where(
            Report.device_id == device_id,
            Report.ip_address == ip_address,
            Report.created_at >= today_start,
        )
    ).scalar_one()

    return count < settings.ANON_REPORT_DAILY_LIMIT
