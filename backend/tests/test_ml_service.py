"""
Tests for ml-service's /detect and /health endpoints.

The real best.pt weights file is not present in CI (section 3), so these
tests mock HazardDetector.detect() and only assert the response *shape* -
they never assert exact detection values, since those depend on real
weights.
"""
import os
import sys
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

import importlib.util

ML_SERVICE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml-service"))

def load_ml_module(module_name: str, relative_path: str):
    file_path = os.path.join(ML_SERVICE_DIR, relative_path)
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = mod
    spec.loader.exec_module(mod)
    return mod

ml_config_mod = load_ml_module("app.config", "app/config.py")
ml_detector_mod = load_ml_module("app.detector", "app/detector.py")
ml_main_mod = load_ml_module("ml_main", "app/main.py")



@pytest.fixture
def ml_client_app():
    with patch.object(ml_detector_mod.HazardDetector, "__init__", return_value=None):
        with TestClient(ml_main_mod.app) as test_client:
            yield test_client



def test_health_endpoint_returns_ok_without_loading_model(ml_client_app):
    response = ml_client_app.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_detect_returns_expected_shape_with_detections(ml_client_app):
    fake_detections = [
        {"category": "pothole", "confidence": 0.91, "bounding_box": [10.0, 20.0, 100.0, 120.0]}
    ]
    with patch.object(ml_detector_mod.HazardDetector, "detect", return_value=fake_detections):
        response = ml_client_app.post(
            "/detect", json={"image_url": "https://example.com/fixture.jpg"}
        )

    assert response.status_code == 200
    body = response.json()
    assert "detections" in body
    assert isinstance(body["detections"], list)
    detection = body["detections"][0]
    assert set(detection.keys()) == {"category", "confidence", "bounding_box"}
    assert isinstance(detection["category"], str)
    assert isinstance(detection["confidence"], float)
    assert isinstance(detection["bounding_box"], list)
    assert len(detection["bounding_box"]) == 4


def test_detect_returns_empty_list_when_nothing_clears_threshold(ml_client_app):
    with patch.object(ml_detector_mod.HazardDetector, "detect", return_value=[]):
        response = ml_client_app.post(
            "/detect", json={"image_url": "https://example.com/fixture.jpg"}
        )

    assert response.status_code == 200
    assert response.json() == {"detections": []}


def test_detect_returns_502_on_detection_failure(ml_client_app):
    with patch.object(ml_detector_mod.HazardDetector, "detect", side_effect=RuntimeError("boom")):
        response = ml_client_app.post(
            "/detect", json={"image_url": "https://example.com/fixture.jpg"}
        )

    assert response.status_code == 502


def test_missing_model_raises_runtime_error_when_dummy_disabled():
    """Test B: When allow_dummy is False, missing or invalid weights MUST raise RuntimeError."""
    with pytest.raises(RuntimeError) as exc_info:
        ml_detector_mod.HazardDetector(
            weights_path="invalid_path_to_model.pt",
            confidence_threshold=0.25,
            allow_dummy=False,
        )
    assert "Failed to load YOLO model" in str(exc_info.value) or "invalid_path" in str(exc_info.value)


def test_missing_model_allows_fallback_when_dummy_enabled():
    """Test B (dev fallback): When allow_dummy is True, missing model enters dummy mode gracefully."""
    detector = ml_detector_mod.HazardDetector(
        weights_path="invalid_path_to_model.pt",
        confidence_threshold=0.25,
        allow_dummy=True,
    )
    assert detector._is_dummy is True
    detections = detector.detect("https://example.com/dummy.jpg")
    assert len(detections) > 0
    assert detections[0]["category"] == "pothole"


def test_real_model_loading_and_classes():
    """Test A: Real trained best.pt loads and reports the 4 hazard classes."""
    real_weights = os.path.join(ML_SERVICE_DIR, "models", "best.pt")
    if not os.path.exists(real_weights) or os.path.getsize(real_weights) < 1000000:
        pytest.skip("Real model best.pt not present on disk")

    detector = ml_detector_mod.HazardDetector(
        weights_path=real_weights,
        confidence_threshold=0.25,
        allow_dummy=False,
    )
    assert detector._is_dummy is False
    assert detector._model is not None
    assert detector._model.names[0] == "pothole"
    assert detector._model.names[1] == "flooded_road"
    assert detector._model.names[2] == "garbage_pile"
    assert detector._model.names[3] == "damaged_road"


