"""get_forecast(lat, lng) -> rainfall data, via the free Open-Meteo API."""
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)


def get_forecast(lat: float, lng: float) -> dict[str, Any]:
    try:
        response = httpx.get(
            settings.OPEN_METEO_URL,
            params={
                "latitude": lat,
                "longitude": lng,
                "hourly": "precipitation",
                "daily": "precipitation_sum",
                "timezone": "auto",
            },
            timeout=10.0,
        )
        response.raise_for_status()
        return response.json()
    except Exception as exc:
        logger.exception("Open-Meteo request failed for (%s, %s)", lat, lng)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Weather service unavailable: {exc}",
        ) from exc
