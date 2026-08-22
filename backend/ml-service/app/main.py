"""
ml-service: a minimal FastAPI microservice wrapping a pre-trained YOLO11
hazard detector. Exactly two routes, per section 3:

  GET /health  - no model call, instant response
  POST /detect - runs YOLO inference on the given image URL

The model is loaded exactly once via a FastAPI lifespan event (not per
request, not at import time before the app object exists).
"""
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel

from app.config import settings
from app.detector import Detection, HazardDetector
from app.utils.logging import get_logger

logger = get_logger(__name__)

_detector_holder: dict[str, HazardDetector] = {}


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    _detector_holder["detector"] = HazardDetector(
        weights_path=settings.YOLO_WEIGHTS_PATH,
        confidence_threshold=settings.CONFIDENCE_THRESHOLD,
        allow_dummy=settings.ALLOW_DUMMY_MODEL,
    )
    yield
    _detector_holder.clear()



app = FastAPI(title="CivicGuard ML Service", version="1.0.0", lifespan=lifespan)


class DetectRequest(BaseModel):
    image_url: str


class DetectResponse(BaseModel):
    detections: list[Detection]


@app.get("/health")
def health() -> dict[str, str]:
    """No model call, instant response - backs Render's health check."""
    return {"status": "ok"}


@app.post("/detect", response_model=DetectResponse)
def detect(payload: DetectRequest) -> DetectResponse:
    detector = _detector_holder.get("detector")
    if detector is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded yet",
        )

    try:
        detections = detector.detect(payload.image_url)
    except Exception as exc:
        logger.exception("Detection failed for image_url=%s", payload.image_url)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to run detection: {exc}",
        ) from exc

    # If nothing clears the confidence threshold, this is just an empty list,
    # not an error (section 3).
    return DetectResponse(detections=detections)
