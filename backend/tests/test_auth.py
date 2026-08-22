"""
Tests for /api/auth/*: OTP request/verify, official login, and invalid-token
rejection on a protected route.
"""
from unittest.mock import patch

from app.services import otp_service


def test_otp_request_sends_email(client):
    with patch("app.routers.auth.send_email") as mock_send_email:
        response = client.post("/api/auth/otp/request", json={"email": "citizen@example.com"})

    assert response.status_code == 204
    mock_send_email.assert_called_once()
    assert mock_send_email.call_args.kwargs["to"] == "citizen@example.com"


def test_otp_verify_creates_citizen_and_returns_token(client, db_session):
    email = "newcitizen@example.com"
    code = otp_service.generate_otp()
    otp_service.store_otp(email, code, db=db_session)

    response = client.post("/api/auth/otp/verify", json={"email": email, "code": code})

    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


def test_otp_verify_rejects_wrong_code(client, db_session):
    email = "citizen2@example.com"
    otp_service.store_otp(email, otp_service.generate_otp(), db=db_session)

    response = client.post("/api/auth/otp/verify", json={"email": email, "code": "000000"})

    assert response.status_code == 401



def test_login_rejects_unknown_email_with_generic_message(client):
    response = client.post(
        "/api/auth/login", json={"email": "doesnotexist@example.com", "password": "whatever"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_succeeds_for_official_with_correct_password(client, db_session):
    from app.models import User
    from app.utils.security import hash_password

    user = User(
        email="official@example.com",
        role="admin",
        password_hash=hash_password("correct-horse-battery-staple"),
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/auth/login",
        json={"email": "official@example.com", "password": "correct-horse-battery-staple"},
    )

    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_rejects_wrong_password_with_same_generic_message(client, db_session):
    from app.models import User
    from app.utils.security import hash_password

    user = User(
        email="official2@example.com",
        role="admin",
        password_hash=hash_password("correct-password"),
    )
    db_session.add(user)
    db_session.commit()

    response = client.post(
        "/api/auth/login",
        json={"email": "official2@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_protected_route_rejects_missing_token(client):
    response = client.get("/api/my-reports")
    assert response.status_code == 401


def test_protected_route_rejects_invalid_token(client):
    response = client.get(
        "/api/my-reports", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert response.status_code == 401


def test_admin_route_rejects_wrong_role(client, db_session):
    from app.models import User
    from app.utils.security import create_access_token

    user = User(email="citizen3@example.com", role="citizen")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(str(user.id), user.role)
    response = client.get(
        "/api/admin/incidents", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
