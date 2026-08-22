"""
HazardDetector wraps ultralytics.YOLO for the four hazard classes this model
was trained on.

CLASSES must stay exactly ["pothole", "flooded_road", "garbage_pile",
"damaged_road"] in this order (section 1) - it must match the index order the
model was trained with. Do not reorder or rename these.
"""
import io
try:
    from typing_extensions import TypedDict
except ImportError:
    from typing import TypedDict


import httpx
from PIL import Image

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

from app.config import settings
from app.utils.logging import get_logger


logger = get_logger(__name__)

CLASSES = ["pothole", "flooded_road", "garbage_pile", "damaged_road"]


class Detection(TypedDict):
    category: str
    confidence: float
    bounding_box: list[float]


class HazardDetector:
    def __init__(self, weights_path: str, confidence_threshold: float, allow_dummy: bool = False) -> None:
        logger.info("Loading YOLO11s weights from %s", weights_path)
        self._confidence_threshold = confidence_threshold
        self._is_dummy = False
        self._allow_dummy = allow_dummy

        if YOLO is None:
            if not allow_dummy:
                raise RuntimeError(
                    "ultralytics package is not installed and ALLOW_DUMMY_MODEL is false. "
                    "Cannot initialize HazardDetector without ultralytics."
                )
            logger.warning("ultralytics package not installed; operating in dummy fallback mode")
            self._model = None
            self._is_dummy = True
            return

        try:
            self._model = YOLO(weights_path)
            logger.info("YOLO model loaded successfully from %s", weights_path)
        except Exception as exc:
            if not allow_dummy:
                logger.error("Failed to load YOLO weights from %s: %s", weights_path, exc)
                raise RuntimeError(f"Failed to load YOLO model from {weights_path}: {exc}") from exc
            logger.warning(
                "Could not load YOLO weights from %s (%s); operating in dummy fallback mode",
                weights_path,
                exc,
            )
            self._model = None
            self._is_dummy = True



    def _download_image(self, image_url: str) -> Image.Image:
        response = httpx.get(image_url, timeout=15.0)
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content)).convert("RGB")

    def detect(self, image_url: str) -> list[Detection]:
        if self._is_dummy or self._model is None:
            # Fallback for dummy/mock model testing
            return [
                {
                    "category": "pothole",
                    "confidence": 0.88,
                    "bounding_box": [10.0, 20.0, 100.0, 120.0],
                }
            ]

        image = self._download_image(image_url)
        results = self._model.predict(
            source=image,
            conf=self._confidence_threshold,
            verbose=False,
        )

        detections: list[Detection] = []
        if not results:
            return detections

        result = results[0]
        if result.boxes is None:
            return detections

        for box in result.boxes:
            class_index = int(box.cls.item())
            confidence = float(box.conf.item())
            xyxy = box.xyxy[0].tolist()

            if class_index < 0 or class_index >= len(CLASSES):
                logger.warning("Model returned out-of-range class index %d; skipping", class_index)
                continue

            detections.append(
                {
                    "category": CLASSES[class_index],
                    "confidence": confidence,
                    "bounding_box": [float(v) for v in xyxy],
                }
            )

        return detections
