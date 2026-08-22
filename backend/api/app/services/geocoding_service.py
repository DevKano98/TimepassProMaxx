"""reverse_geocode(lat, lng) -> ward_name, via the free Nominatim API."""
import httpx
from fastapi import HTTPException, status

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

_HEADERS = {"User-Agent": "CivicGuard/1.0 (civic-issue-reporting-platform)"}


def reverse_geocode(lat: float, lng: float) -> str | None:
    reverse_url = settings.NOMINATIM_URL.replace("/search", "/reverse")
    try:
        response = httpx.get(
            reverse_url,
            params={"lat": lat, "lon": lng, "format": "jsonv2"},
            headers=_HEADERS,
            timeout=10.0,
        )
        response.raise_for_status()
        data = response.json()
        address = data.get("address", {})
        ward = (
            address.get("suburb")
            or address.get("neighbourhood")
            or address.get("city_district")
            or address.get("village")
            or address.get("town")
        )
        return ward
    except Exception as exc:
        logger.exception("Nominatim reverse geocoding failed for (%s, %s)", lat, lng)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Geocoding service unavailable: {exc}",
        ) from exc
