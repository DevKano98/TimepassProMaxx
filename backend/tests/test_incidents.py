"""
Tests for /api/admin/incidents/*: verify/reject/assign/dispatch flow and
status transitions.
"""
from unittest.mock import patch

import pytest


@pytest.fixture
def admin_headers(db_session):
    from app.models import User
    from app.utils.security import create_access_token

    user = User(email="admin@example.com", role="admin")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    token = create_access_token(str(user.id), user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def sample_incident(db_session):
    from app.models import Incident

    incident = Incident(
        category="pothole",
        location="SRID=4326;POINT(72.9781 19.2183)",
        confidence=0.8,
    )
    db_session.add(incident)
    db_session.commit()
    db_session.refresh(incident)
    return incident


@pytest.fixture
def sample_department(db_session):
    from app.models import Department

    department = Department(name="Roads & Public Works", contact_email="roads@example.com")
    db_session.add(department)
    db_session.commit()
    db_session.refresh(department)
    return department


@pytest.fixture
def sample_team(db_session, sample_department):
    from app.models import Team

    team = Team(name="Team Alpha", department_id=sample_department.id, status="available")
    db_session.add(team)
    db_session.commit()
    db_session.refresh(team)
    return team


def test_verify_incident(client, admin_headers, sample_incident):
    response = client.post(
        f"/api/admin/incidents/{sample_incident.id}/verify", headers=admin_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "confirmed"


def test_reject_incident(client, admin_headers, sample_incident):
    response = client.post(
        f"/api/admin/incidents/{sample_incident.id}/reject", headers=admin_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "rejected"


def test_assign_incident_to_department(client, admin_headers, sample_incident, sample_department):
    response = client.post(
        f"/api/admin/incidents/{sample_incident.id}/assign",
        headers=admin_headers,
        json={"department_id": str(sample_department.id)},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "assigned"
    assert body["department_id"] == str(sample_department.id)


def test_dispatch_incident_creates_ticket(client, admin_headers, sample_incident, sample_team):
    fake_ticket_data = {
        "title": "Pothole repair",
        "summary": "A pothole was reported and needs repair.",
        "recommended_action": "Send a road crew to patch the pothole.",
        "department": "Roads & Public Works",
        "public_alert": "We are aware of a pothole in your area.",
    }
    with patch("app.routers.admin_incidents.generate_ticket", return_value=fake_ticket_data):
        response = client.post(
            f"/api/admin/incidents/{sample_incident.id}/dispatch",
            headers=admin_headers,
            json={"team_id": str(sample_team.id)},
        )

    assert response.status_code == 200
    assert response.json()["status"] == "dispatched"


def test_status_transition_to_resolved_sets_resolved_at(client, admin_headers, sample_incident):
    response = client.patch(
        f"/api/admin/incidents/{sample_incident.id}/status",
        headers=admin_headers,
        json={"status": "resolved"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "resolved"
    assert body["resolved_at"] is not None


def test_verify_nonexistent_incident_returns_404(client, admin_headers):
    import uuid

    response = client.post(
        f"/api/admin/incidents/{uuid.uuid4()}/verify", headers=admin_headers
    )
    assert response.status_code == 404


def test_admin_incidents_list_filters_by_status(client, admin_headers, sample_incident):
    client.post(f"/api/admin/incidents/{sample_incident.id}/verify", headers=admin_headers)

    response = client.get(
        "/api/admin/incidents", headers=admin_headers, params={"status": "confirmed"}
    )
    assert response.status_code == 200
    incidents = response.json()
    assert len(incidents) == 1
    assert incidents[0]["id"] == str(sample_incident.id)
