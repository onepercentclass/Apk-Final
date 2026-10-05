from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://claisrox:claisrox@localhost:5432/claisrox"
    jwt_secret: str = "ganti-dengan-secret-acak-minimal-32-karakter"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 12
    api_prefix: str = "/api"
    cors_origins: list[str] = ["http://localhost:5500", "http://127.0.0.1:5500"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
