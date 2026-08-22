"""
Tests for /api/reports/*. ml_client is mocked throughout so these tests
don't require a live ml-service instance (per section 3's requirement).
"""
from unittest.mock import patch


_FAKE_DETECTION = {
    "category": "pothole",
    "confidence": 0.82,
    "bounding_box": [10.0, 10.0, 50.0, 50.0],
    "status": "ai_processed",
}

_MOCK_TARGETS = [
    "app.routers.reports.ml_client.detect_hazard",
    "app.routers.reports.check_nsfw",
    "app.routers.reports.blur_sensitive_regions",
]


def _submit_report(client, headers=None, latitude=19.2183, longitude=72.9781):
    with patch("app.routers.reports.ml_client.detect_hazard", return_value=_FAKE_DETECTION), \
         patch("app.routers.reports.check_nsfw", return_value=False), \
         patch("app.routers.reports.blur_sensitive_regions", side_effect=lambda url: url):
        return client.post(
            "/api/reports",
            json={
                "image_url": "https://example.com/pothole.jpg",
                "description": "Big pothole outside the market",
                "latitude": latitude,
                "longitude": longitude,
            },
            headers=headers or {"X-Device-Id": "device-abc-123"},
        )


def test_submit_report_creates_incident(client):
    response = _submit_report(client)

    assert response.status_code == 201
    body = response.json()
    assert body["ai_category"] == "pothole"
    assert body["confidence"] == 0.82
    assert body["status"] == "ai_processed"
    assert body["incident_id"] is not None


def test_submit_report_requires_device_id_when_anonymous(client):
    with patch("app.routers.reports.ml_client.detect_hazard", return_value=_FAKE_DETECTION), \
         patch("app.routers.reports.check_nsfw", return_value=False), \
         patch("app.routers.reports.blur_sensitive_regions", side_effect=lambda url: url):
        response = client.post(
            "/api/reports",
            json={
                "image_url": "https://example.com/pothole.jpg",
                "latitude": 19.2183,
                "longitude": 72.9781,
            },
        )
    assert response.status_code == 400


def test_anonymous_daily_limit_blocks_fourth_report(client):
    device_id = "device-limit-test"
    for _ in range(3):
        response = _submit_report(client, headers={"X-Device-Id": device_id})
        assert response.status_code == 201

    fourth_response = _submit_report(client, headers={"X-Device-Id": device_id})

    assert fourth_response.status_code == 403
    body = fourth_response.json()
    assert body["detail"]["error"] == "anonymous_limit_exceeded"


def test_ml_service_unreachable_falls_back_gracefully(client):
    import httpx

    with patch(
        "app.routers.reports.ml_client.detect_hazard",
        return_value={"category": None, "confidence": None, "bounding_box": None, "status": "pending_ai_review"},
    ), patch("app.routers.reports.check_nsfw", return_value=False), patch(
        "app.routers.reports.blur_sensitive_regions", side_effect=lambda url: url
    ):
        response = client.post(
            "/api/reports",
            json={
                "image_url": "https://example.com/pothole.jpg",
                "latitude": 19.2183,
                "longitude": 72.9781,
            },
            headers={"X-Device-Id": "device-ml-down"},
        )

    assert response.status_code == 201
    body = response.json()
    assert body["status"] == "pending_ai_review"
    assert body["ai_category"] is None
    assert body["incident_id"] is None


def test_nearby_incidents_returns_created_incident(client):
    submit_response = _submit_report(client, latitude=19.2183, longitude=72.9781)
    assert submit_response.status_code == 201

    nearby_response = client.get(
        "/api/reports/nearby",
        params={"latitude": 19.2183, "longitude": 72.9781, "radius": 1000},
    )

    assert nearby_response.status_code == 200
    incidents = nearby_response.json()
    assert len(incidents) == 1
    assert incidents[0]["category"] == "pothole"
    assert incidents[0]["distance_meters"] is not None


def test_nearby_incidents_excludes_far_away_reports(client):
    _submit_report(client, latitude=19.2183, longitude=72.9781)

    # Roughly 100km+ away - well outside any reasonable radius.
    nearby_response = client.get(
        "/api/reports/nearby",
        params={"latitude": 28.6139, "longitude": 77.2090, "radius": 1000},
    )

    assert nearby_response.status_code == 200
    assert nearby_response.json() == []
