"""
Application settings.

Everything is overridable through the environment or a ``backend/.env`` file.
Copy ``.env.example`` to ``.env`` and edit it; nothing here has a hard-coded
secret, so the app refuses to start in production without one.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/app/core/config.py -> backend/app/core -> backend/app -> backend
BACKEND_DIR = Path(__file__).resolve().parents[2]
# backend/ -> n6/
PROJECT_DIR = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---------------------------------------------------------------- general
    APP_NAME: str = "N6 API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    VERSION: str = "1.0.0"

    # ------------------------------------------------------------------ paths
    # Where backend/tiers/*.json lives. One JSON file per tier above owner.
    TIERS_DIR: Path = BACKEND_DIR / "tiers"
    # The split frontend, served optionally from this process.
    FRONTEND_DIR: Path = PROJECT_DIR
    SERVE_FRONTEND: bool = False

    # ------------------------------------------------------------------- api
    # The frontend calls https://n6sport.id/api + API_PREFIX + '/' + path.
    # Mount this router with the same prefix or the two drift apart.
    API_PREFIX: str = "/api/v1"
    ROOT_PATH: str = ""
    CORS_ORIGINS: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:8777",
            "http://127.0.0.1:8777",
            "https://n6sport.id",
        ]
    )

    # -------------------------------------------------------------- database
    # PostgreSQL. Example:
    #   postgresql+psycopg://n6:n6@localhost:5432/n6
    DATABASE_URL: str = "postgresql+psycopg://n6:n6@localhost:5432/n6"
    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_RECYCLE: int = 1800

    # --------------------------------------------------------------- security
    # Generate with: python -c "import secrets; print(secrets.token_urlsafe(48))"
    SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 12
    REFRESH_TOKEN_EXPIRE_DAYS: int = 14

    # ------------------------------------------------------------------ misc
    LOG_LEVEL: str = "INFO"
    # Default seeded account, used only by `python -m app.seed`.
    SEED_OWNER_USERNAME: str = "owner"
    SEED_OWNER_PASSWORD: str = "owner"
    SEED_ADMIN_USERNAME: str = "admin"
    SEED_ADMIN_PASSWORD: str = "admin"

    @field_validator("API_PREFIX")
    @classmethod
    def _strip_prefix(cls, v: str) -> str:
        v = "/" + v.strip("/")
        return "" if v == "/" else v

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.CORS_ORIGINS if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in {"production", "prod"}


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()
    if settings.is_production and len(settings.SECRET_KEY) < 32:
        raise RuntimeError(
            "SECRET_KEY must be set to at least 32 characters in production. "
            "Generate one with: python -c 'import secrets; print(secrets.token_urlsafe(48))'"
        )
    return settings


settings = get_settings()