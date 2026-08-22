"""Configuration for the ml-service (YOLO-only) microservice."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    YOLO_WEIGHTS_PATH: str = "./models/best.pt"
    CONFIDENCE_THRESHOLD: float = 0.25
    ALLOW_DUMMY_MODEL: bool = False
    PORT: int = 8001



@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
