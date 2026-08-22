"""
Centralized configuration for the CivicGuard API service.

Every environment variable the api/ service depends on is declared here and
nowhere else. Import `settings` from this module instead of calling
os.getenv() directly anywhere else in the codebase.
"""
import os
from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = os.path.join(os.path.dirname(__file__), "..", ".env")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(_ENV_FILE, ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


    # --- Database ---
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/civicguard"

    # --- Cloudinary (image storage) ---
    CLOUDINARY_CLOUD_NAME: str = "dev-cloud"
    CLOUDINARY_API_KEY: str = "dev-api-key"
    CLOUDINARY_API_SECRET: str = "dev-api-secret"

    # --- Resend (email) ---
    RESEND_API_KEY: str = "dev-resend-key"

    # --- Firebase Cloud Messaging (Android push) ---
    FIREBASE_SERVICE_ACCOUNT_JSON: str = "{}"

    # --- Web Push / VAPID ---
    VAPID_PUBLIC_KEY: str = "dev-vapid-public"
    VAPID_PRIVATE_KEY: str = "dev-vapid-private"
    VAPID_ADMIN_EMAIL: str = "admin@civicguard.gov"

    # --- Hugging Face Inference API ---
    HUGGINGFACE_API_TOKEN: str = "dev-hf-token"

    # --- Groq (LLM ticket generation) ---
    GROQ_API_KEY: str = "dev-groq-key"
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    # --- Geocoding / Routing / Weather ---
    NOMINATIM_URL: str = "https://nominatim.openstreetmap.org/search"
    ORS_API_KEY: str = "dev-ors-key"
    OPEN_METEO_URL: str = "https://api.open-meteo.com/v1/forecast"

    # --- Anonymous reporting rate limit ---
    ANON_REPORT_DAILY_LIMIT: int = 3

    # --- Auth / JWT ---
    JWT_SECRET_KEY: str = "civicguard-dev-super-secret-key-32-chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # --- Internal service-to-service auth ---
    INTERNAL_API_KEY: str = "civicguard-dev-internal-api-key"

    # --- ml-service ---
    ML_SERVICE_URL: str = "http://localhost:8001"
    ML_SERVICE_TIMEOUT_SECONDS: float = 15.0

    # --- CORS ---
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    FIELD_APP_ORIGIN: str = "http://localhost:3001"

    # --- OTP ---
    OTP_EXPIRE_MINUTES: int = 10
    OTP_MAX_REQUESTS_PER_HOUR: int = 5

    # --- Server ---
    PORT: int = 8000



@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
