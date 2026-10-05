"""
Engine and session.

Synchronous SQLAlchemy 2.0 over psycopg 3. Endpoints are plain ``def`` so
FastAPI runs them in its worker threadpool; an async engine would buy nothing
here and would make every dependency twice as verbose.

Override the URL through DATABASE_URL, normally in backend/.env:

    postgresql+psycopg://n6:n6@localhost:5432/n6
"""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from ..core.config import settings

engine: Engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_pre_ping=True,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_recycle=settings.DB_POOL_RECYCLE,
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=Session,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency. Rolls back on error, always closes."""
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def dispose_engine() -> None:
    engine.dispose()