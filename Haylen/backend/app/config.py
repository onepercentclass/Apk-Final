"""Pengaturan aplikasi (dibaca dari .env)."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/haylen"
    SECRET_KEY: str = "dev-secret-ubah-di-produksi"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720
    CORS_ORIGINS: str = "*"
    OWNER_USERNAME: str = "owner"
    OWNER_PASSWORD: str = "owner123"
    OWNER_NAME: str = "Budi Santoso"


settings = Settings()
