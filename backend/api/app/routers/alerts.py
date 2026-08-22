from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models import Alert, DeviceToken, User
from app.schemas import AlertCreate, AlertOut
from app.services.notification_service import notify_user

router = APIRouter(tags=["alerts"])


@router.get("/api/alerts", response_model=list[AlertOut])
def list_active_alerts(db: Session = Depends(get_db)) -> list[Alert]:
    now = datetime.now(timezone.utc)
    return db.query(Alert).filter(Alert.valid_until > now).order_by(Alert.created_at.desc()).all()


@router.post(
    "/api/admin/alerts",
    response_model=AlertOut,
    status_code=status.HTTP_201_CREATED,
)
def create_alert(
    payload: AlertCreate,
    current_user: User = Depends(require_role("admin", "control_room")),
    db: Session = Depends(get_db),
) -> Alert:
    alert = Alert(
        title=payload.title,
        message=payload.message,
        area=payload.area,
        severity=payload.severity,
        valid_until=payload.valid_until,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Broadcast to every user who has at least one registered device or an email,
    # i.e. everyone - notify_user already handles missing channels gracefully.
    affected_users = db.query(User).join(DeviceToken, isouter=True).filter(
        (DeviceToken.id.isnot(None)) | (User.email.isnot(None))
    ).distinct()

    for user in affected_users:
        notify_user(db, str(user.id), alert.title, alert.message)

    return alert
