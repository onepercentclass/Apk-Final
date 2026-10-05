"""Titik masuk API Claisrox."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from . import models
from .config import get_settings
from .database import Base, SessionLocal, engine
from .routers import auth, resources, state
from .security import hash_password
from .services.access import max_tier


def ensure_owner() -> None:
    s = get_settings()
    with SessionLocal() as db:
        if db.scalar(select(models.User).where(models.User.username == s.owner_username)):
            return
        db.add(models.User(username=s.owner_username, password_hash=hash_password(s.owner_password),
                           name=s.owner_name, tier=0))
        db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    max_tier()  # gagal cepat bila folder tier salah
    Base.metadata.create_all(engine)
    ensure_owner()
    yield


app = FastAPI(title="Claisrox API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_list,
    allow_methods=["GET", "PUT", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(state.router)
for r in resources.routers:
    app.include_router(r)


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok"}
