"""Thin wrapper around the Cloudinary Python SDK for image storage."""
import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, status

from app.config import settings
from app.utils.logging import get_logger

logger = get_logger(__name__)

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_image(file_bytes: bytes, folder: str = "civicguard") -> str:
    """Uploads raw image bytes to Cloudinary and returns the resulting secure URL."""
    try:
        result = cloudinary.uploader.upload(file_bytes, folder=folder, resource_type="image")
        return result["secure_url"]
    except Exception as exc:  # Cloudinary SDK raises various error types
        logger.exception("Cloudinary upload failed")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Image upload failed: {exc}",
        ) from exc
