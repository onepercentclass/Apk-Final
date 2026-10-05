"""Entry point FastAPI. Jalankan: uvicorn app.main:app --reload"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models  # noqa: F401  (daftarkan tabel)
from .config import settings
from .database import Base, SessionLocal, engine
from .models import User
from .routers import auth, coach, dashboard, fasilitas, jadwal, kelas_program, laporan, member, pengaturan, transaksi
from .security import hash_password


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    # Buat akun owner (tier 0) pertama kali
    with SessionLocal() as db:
        if not db.query(User).filter(User.username == settings.OWNER_USERNAME).first():
            db.add(User(
                username=settings.OWNER_USERNAME,
                password_hash=hash_password(settings.OWNER_PASSWORD),
                name=settings.OWNER_NAME,
                role="Owner",
                tier=0,
            ))
            db.commit()
    yield


app = FastAPI(title="Haylen - AquaFlow Swimming School API", version="1.0.0", lifespan=lifespan)

origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"])

# Semua endpoint di bawah /api  ->  https://n6sport.id/api/...
for r in (auth, dashboard, member, kelas_program, coach, jadwal, transaksi, laporan, fasilitas, pengaturan):
    app.include_router(r.router, prefix="/api")


@app.get("/api/health", tags=["system"])
def health():
    return {"status": "ok"}
