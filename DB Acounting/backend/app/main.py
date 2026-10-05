"""Entry point FastAPI. Dipetakan ke prefix /api agar cocok dengan
API_CONFIG.BASE_URL frontend (https://n6sport.id/api)."""
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth as auth_router
from .routers import companies as companies_router
from .routers import reports as reports_router
from .routers import transactions as trx_router

load_dotenv()

app = FastAPI(title="DB Accounting API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5500"), "https://n6sport.id"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"ok": True, "service": "db-accounting"}


app.include_router(auth_router.router, prefix="/api")
app.include_router(companies_router.router, prefix="/api")
app.include_router(trx_router.router, prefix="/api")
app.include_router(reports_router.router, prefix="/api")
