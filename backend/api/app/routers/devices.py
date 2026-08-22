from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import DeviceToken, User
from app.schemas import DeviceOut, DeviceRegister

router = APIRouter(prefix="/api/devices", tags=["devices"])


@router.post("/register", response_model=DeviceOut, status_code=status.HTTP_201_CREATED)
def register_device(
    payload: DeviceRegister,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DeviceToken:
    existing = None
    if payload.fcm_token:
        existing = (
            db.query(DeviceToken)
            .filter(DeviceToken.user_id == current_user.id, DeviceToken.fcm_token == payload.fcm_token)
            .first()
        )
    elif payload.web_push_subscription:
        endpoint = payload.web_push_subscription.get("endpoint")
        existing = (
            db.query(DeviceToken)
            .filter(
                DeviceToken.user_id == current_user.id,
                DeviceToken.web_push_subscription["endpoint"].astext == endpoint,
            )
            .first()
        )

    if existing:
        existing.fcm_token = payload.fcm_token
        existing.web_push_subscription = payload.web_push_subscription
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    device = DeviceToken(
        user_id=current_user.id,
        fcm_token=payload.fcm_token,
        web_push_subscription=payload.web_push_subscription,
    )
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_device(
    device_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    device = db.get(DeviceToken, device_id)
    if device is None or device.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    db.delete(device)
    db.commit()
