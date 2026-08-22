"""
notify_user(user_id, title, message) fans out across every channel the user
has registered:

  - FCM (Android push) if a fcm_token DeviceToken row exists
  - Web Push (VAPID) if a web_push_subscription DeviceToken row exists
  - Email, always, as the durable copy

A user may have zero, one, or both token types across their DeviceToken rows.
Each channel is attempted independently and a missing/failing channel never
raises - it's logged and the function moves on to the next channel.
"""
import json

import firebase_admin
from firebase_admin import credentials, messaging
from pywebpush import WebPushException, webpush
from sqlalchemy.orm import Session

from app.config import settings
from app.models import DeviceToken, User
from app.services.email_service import send_email
from app.utils.logging import get_logger

logger = get_logger(__name__)

_firebase_app: firebase_admin.App | None = None


import os

def _get_firebase_app() -> firebase_admin.App:
    global _firebase_app
    if _firebase_app is None:
        raw_val = settings.FIREBASE_SERVICE_ACCOUNT_JSON.strip()
        try:
            service_account_info = json.loads(raw_val)
            cred = credentials.Certificate(service_account_info)
        except (json.JSONDecodeError, ValueError):
            file_path = raw_val
            if not os.path.isabs(file_path):
                candidate = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", file_path))
                if os.path.exists(candidate):
                    file_path = candidate
            cred = credentials.Certificate(file_path)
        _firebase_app = firebase_admin.initialize_app(cred)
    return _firebase_app



def _send_fcm(fcm_token: str, title: str, message: str) -> None:
    try:
        _get_firebase_app()
        msg = messaging.Message(
            notification=messaging.Notification(title=title, body=message),
            token=fcm_token,
        )
        messaging.send(msg)
    except Exception:
        logger.exception("FCM send failed for token ending in ...%s", fcm_token[-6:])


def _send_web_push(subscription_info: dict, title: str, message: str) -> None:
    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps({"title": title, "body": message}),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": f"mailto:{settings.VAPID_ADMIN_EMAIL}"},
        )
    except WebPushException:
        logger.exception("Web push send failed")


def notify_user(db: Session, user_id: str, title: str, message: str) -> None:
    user = db.get(User, user_id)
    if user is None:
        logger.warning("notify_user called for unknown user_id=%s", user_id)
        return

    device_tokens = db.query(DeviceToken).filter(DeviceToken.user_id == user_id).all()

    for token in device_tokens:
        if token.fcm_token:
            _send_fcm(token.fcm_token, title, message)
        if token.web_push_subscription:
            _send_web_push(token.web_push_subscription, title, message)

    if user.email:
        try:
            send_email(to=user.email, subject=title, body=f"<p>{message}</p>")
        except Exception:
            # send_email already logs; email is the durable copy but should
            # never take down a notification fan-out that otherwise succeeded.
            logger.exception("Durable email copy failed for user_id=%s", user_id)
