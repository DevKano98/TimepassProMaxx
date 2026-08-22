from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models import Incident, User
from app.schemas import AnalyticsSummary

router = APIRouter(prefix="/api/admin/analytics", tags=["admin-analytics"])

# An incident is "delayed" if it's still open and older than this SLA window.
_DELAY_THRESHOLD_HOURS = 72
_OPEN_STATUSES = ("under_review", "confirmed", "assigned", "dispatched", "in_progress")


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(
    current_user: User = Depends(require_role("admin", "control_room", "department_officer")),
    db: Session = Depends(get_db),
) -> AnalyticsSummary:
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    total_incidents = db.execute(select(func.count()).select_from(Incident)).scalar_one()

    critical_incidents = db.execute(
        select(func.count()).select_from(Incident).where(Incident.severity == "critical")
    ).scalar_one()

    resolved_today = db.execute(
        select(func.count())
        .select_from(Incident)
        .where(Incident.status == "resolved", Incident.resolved_at >= today_start)
    ).scalar_one()

    # Computed in Python (rather than a DB-specific INTERVAL literal) so this
    # works identically against Postgres in prod and SQLite in tests.
    delay_cutoff = now - timedelta(hours=_DELAY_THRESHOLD_HOURS)

    delayed_incidents = db.execute(
        select(func.count())
        .select_from(Incident)
        .where(Incident.status.in_(_OPEN_STATUSES), Incident.created_at < delay_cutoff)
    ).scalar_one()

    avg_resolution_seconds = db.execute(
        select(
            func.avg(
                func.extract("epoch", Incident.resolved_at - Incident.created_at)
            )
        ).where(Incident.status == "resolved", Incident.resolved_at.isnot(None))
    ).scalar_one()

    average_resolution_hours = (
        round(avg_resolution_seconds / 3600, 2) if avg_resolution_seconds is not None else None
    )

    return AnalyticsSummary(
        total_incidents=total_incidents,
        critical_incidents=critical_incidents,
        resolved_today=resolved_today,
        delayed_incidents=delayed_incidents,
        average_resolution_hours=average_resolution_hours,
    )
