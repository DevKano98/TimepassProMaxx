"""
Client for the ml-service's /detect endpoint.

Per section 0, api/ calls ml-service/ synchronously over plain HTTP - no
queue. If ml-service is unreachable or slow (e.g. asleep on Render's free
tier), this must never crash the report submission: it returns a fallback
result instead.
"""
from typing import Optional, TypedDict

import httpx

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


class Detection(TypedDict):
    category: str
    confidence: float
    bounding_box: list[float]


class HazardDetectionResult(TypedDict):
    category: Optional[str]
    confidence: Optional[float]
    bounding_box: Optional[list[float]]
    status: str


def _get_ml_service_url() -> str:
    raw = (settings.ML_SERVICE_URL or "https://civicguard-ml.onrender.com").strip().rstrip("/")
    if not raw.startswith("http://") and not raw.startswith("https://"):
        if ":" in raw:
            raw = f"http://{raw}"
        else:
            raw = f"https://{raw}"
    return raw


def detect_hazard(image_url: str) -> HazardDetectionResult:
    """
    Calls ml-service's POST /detect with the report image and returns the
    single highest-confidence detection, or a pending_ai_review fallback if
    the service can't be reached in time or returns no detections.
    """
    url = f"{_get_ml_service_url()}/detect"
    try:
        response = httpx.post(
            url,
            json={"image_url": image_url},
            timeout=settings.ML_SERVICE_TIMEOUT_SECONDS,
        )

        response.raise_for_status()
        payload = response.json()
        detections: list[Detection] = payload.get("detections", [])

        if not detections:
            return {
                "category": None,
                "confidence": None,
                "bounding_box": None,
                "status": "pending_ai_review",
            }

        best = max(detections, key=lambda d: d["confidence"])
        return {
            "category": best["category"],
            "confidence": best["confidence"],
            "bounding_box": best["bounding_box"],
            "status": "ai_processed",
        }

    except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPStatusError, httpx.RequestError) as exc:
        logger.warning("ml-service unreachable or errored (%s); falling back to pending_ai_review", exc)
        return {
            "category": None,
            "confidence": None,
            "bounding_box": None,
            "status": "pending_ai_review",
        }
