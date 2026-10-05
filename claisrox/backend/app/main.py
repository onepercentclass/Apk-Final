from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (mendaftarkan tabel ke Base.metadata)
from app.config import get_settings
from app.database import Base, engine
from app.resources import RESOURCES
from app.routers import auth, finance, snapshot
from app.routers.crud import build_crud_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)      # untuk produksi, ganti dengan migrasi Alembic
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Claisrox API", version="1.0.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth.router, prefix=settings.api_prefix)
    app.include_router(snapshot.router, prefix=settings.api_prefix)
    app.include_router(finance.router, prefix=settings.api_prefix)
    for res in RESOURCES:
        app.include_router(build_crud_router(res), prefix=settings.api_prefix)

    @app.get(f"{settings.api_prefix}/health", tags=["health"])
    def health():
        return {"status": "ok"}

    return app


app = create_app()
