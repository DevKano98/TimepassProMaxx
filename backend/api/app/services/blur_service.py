"""
blur_sensitive_regions(image_url) -> new_image_url

1. Calls a Hugging Face Inference API object-detection model to find
   faces/license plates (not self-hosted, per section 0).
2. Downloads the source image and applies Gaussian blur to each detected box
   with OpenCV.
3. Re-uploads the blurred image to Cloudinary and returns the new URL.
"""
import io

import cv2
import httpx
import numpy as np
from fastapi import HTTPException, status
from PIL import Image

from app.config import settings
from app.services.cloudinary_service import upload_image
from app.utils.logging import get_logger

logger = get_logger(__name__)

_HF_DETECTION_MODEL = "facebook/detr-resnet-50"
_HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{_HF_DETECTION_MODEL}"
_MIN_DETECTION_SCORE = 0.5


def _detect_sensitive_boxes(image_bytes: bytes) -> list[tuple[int, int, int, int]]:
    try:
        response = httpx.post(
            _HF_API_URL,
            headers={
                "Authorization": f"Bearer {settings.HUGGINGFACE_API_TOKEN}",
                "Content-Type": "image/jpeg",
            },
            content=image_bytes,
            timeout=30.0,
        )
        response.raise_for_status()
        predictions = response.json()

    except Exception as exc:
        logger.exception("HF face/plate detection request failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Blur service unavailable: {exc}",
        ) from exc

    boxes: list[tuple[int, int, int, int]] = []
    for prediction in predictions:
        if float(prediction.get("score", 0.0)) < _MIN_DETECTION_SCORE:
            continue
        box = prediction.get("box", {})
        try:
            xmin, ymin, xmax, ymax = int(box["xmin"]), int(box["ymin"]), int(box["xmax"]), int(box["ymax"])
        except (KeyError, TypeError, ValueError):
            continue
        boxes.append((xmin, ymin, xmax, ymax))
    return boxes


def blur_sensitive_regions(image_url: str) -> str:
    try:
        image_bytes = httpx.get(image_url, timeout=15.0).content
    except Exception as exc:
        logger.exception("Failed to download source image for blurring: %s", image_url)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not download image for blurring: {exc}",
        ) from exc

    boxes = _detect_sensitive_boxes(image_bytes)
    if not boxes:
        # Nothing to blur - the original image is fine as-is.
        return image_url

    pil_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    cv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

    height, width = cv_image.shape[:2]
    for xmin, ymin, xmax, ymax in boxes:
        xmin, ymin = max(0, xmin), max(0, ymin)
        xmax, ymax = min(width, xmax), min(height, ymax)
        if xmax <= xmin or ymax <= ymin:
            continue
        region = cv_image[ymin:ymax, xmin:xmax]
        blurred_region = cv2.GaussianBlur(region, (51, 51), 0)
        cv_image[ymin:ymax, xmin:xmax] = blurred_region

    success, encoded = cv2.imencode(".jpg", cv_image)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to encode blurred image",
        )

    return upload_image(encoded.tobytes(), folder="civicguard/blurred")
