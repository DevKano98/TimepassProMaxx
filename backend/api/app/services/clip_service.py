"""
Duplicate-detection helper: get_image_similarity(url1, url2) -> float.

Per section 0, CLIP is NOT self-hosted. This calls the free Hugging Face
Inference API's feature-extraction endpoint for a CLIP model to get an
embedding for each image, then computes cosine similarity locally (cheap -
no reason to make the API do that part).
"""
import math

import httpx
from fastapi import HTTPException, status

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

_HF_CLIP_MODEL = "sentence-transformers/clip-ViT-B-32"
_HF_API_URL = f"https://api-inference.huggingface.co/models/{_HF_CLIP_MODEL}"


def _get_image_embedding(image_url: str) -> list[float]:
    try:
        image_bytes = httpx.get(image_url, timeout=15.0).content
        response = httpx.post(
            _HF_API_URL,
            headers={"Authorization": f"Bearer {settings.HUGGINGFACE_API_TOKEN}"},
            content=image_bytes,
            timeout=30.0,
        )
        response.raise_for_status()
        embedding = response.json()
        # Some HF feature-extraction models nest the vector; unwrap defensively.
        while isinstance(embedding, list) and embedding and isinstance(embedding[0], list):
            embedding = embedding[0]
        return embedding
    except Exception as exc:
        logger.warning("HF CLIP embedding request skipped/failed for %s: %s", image_url, exc)
        return []



def _cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) != len(b) or not a:
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def get_image_similarity(url1: str, url2: str) -> float:
    embedding1 = _get_image_embedding(url1)
    embedding2 = _get_image_embedding(url2)
    return _cosine_similarity(embedding1, embedding2)
