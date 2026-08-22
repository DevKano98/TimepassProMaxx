"""
check_nsfw(image_url) -> bool

Calls a Hugging Face Inference API image-classification model to flag NSFW
content, rather than self-hosting anything (section 0).
"""
import httpx
from fastapi import HTTPException, status

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

_HF_NSFW_MODEL = "Falconsai/nsfw_image_detection"
_HF_API_URL = f"https://router.huggingface.co/hf-inference/models/{_HF_NSFW_MODEL}"
_NSFW_LABEL = "nsfw"
_NSFW_SCORE_THRESHOLD = 0.7


def check_nsfw(image_url: str) -> bool:
    """Returns True if the image should be flagged/held for moderation."""
    try:
        image_bytes = httpx.get(image_url, timeout=15.0).content
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


        for prediction in predictions:
            label = str(prediction.get("label", "")).lower()
            score = float(prediction.get("score", 0.0))
            if label == _NSFW_LABEL and score >= _NSFW_SCORE_THRESHOLD:
                return True
        return False

    except Exception as exc:
        logger.exception("HF NSFW moderation request failed for %s", image_url)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Moderation service unavailable: {exc}",
        ) from exc
