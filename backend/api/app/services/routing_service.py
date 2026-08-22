"""get_route(from_coords, to_coords) -> route data, via OpenRouteService's free developer quota."""
from typing import Any

import httpx
from fastapi import HTTPException, status

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

_ORS_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car"


def get_route(from_coords: tuple[float, float], to_coords: tuple[float, float]) -> dict[str, Any]:
    """
    from_coords / to_coords are (latitude, longitude) tuples. ORS expects
    [longitude, latitude] pairs.
    """
    from_lat, from_lng = from_coords
    to_lat, to_lng = to_coords

    try:
        response = httpx.get(
            _ORS_DIRECTIONS_URL,
            headers={
                "Authorization": settings.ORS_API_KEY,
                "Accept": "application/json, application/geo+json",
            },
            params={
                "start": f"{from_lng},{from_lat}",
                "end": f"{to_lng},{to_lat}",
            },
            timeout=25.0,
        )
        response.raise_for_status()
        return response.json()

    except Exception as exc:
        logger.exception("OpenRouteService routing request failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Routing service unavailable: {exc}",
        ) from exc
