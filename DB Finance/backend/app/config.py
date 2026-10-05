"""Pengaturan dari environment / file .env."""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://claisrox:claisrox@localhost:5432/claisrox"
    jwt_secret: str
    jwt_expire_minutes: int = 720
    owner_username: str = "owner"
    owner_password: str
    owner_name: str = "Owner"
    tiers_dir: Path = Path("../claisrox/js/access/tiers")
    cors_origins: str = "http://localhost:8766"

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
