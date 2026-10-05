"""
The FastAPI application.

    uvicorn app.main:app --reload            # from backend/
    uvicorn app.main:app --app-dir backend  # from n6/

Three things this file does beyond wiring:

* ``/health`` answers before a database is touched, so a load balancer can tell
  "the process is up" from "the database is reachable".
* The tier matrix is validated at startup, not on the first request. A typo in
  backend/tiers/*.json should stop the deployment, not surface as a 403 nobody
  can explain an hour later.
* The frontend is mounted only when SERVE_FRONTEND is on. Off by default: while
  the API is disabled the dashboards run from localStorage against any static
  host, and nothing about them needs this process.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .api.v1.router import api_router
from .core.config import settings
from .core.security import TokenError
from .core.tiers import load_tiers
from .db.session import dispose_engine, engine

logger = logging.getLogger("n6")

DESCRIPTION = """
Backend for the N6 Split5 dashboards.

**Not in use yet.** The five dashboards ship with the API switched off and read
and write `localStorage`; `js/core/api.js` describes the surface below and
`js/core/api.js::createApiRepository` is what will drive it once
`API_ENABLED` is turned on in `js/core/env.js`.

The access rule is one sentence, implemented twice and never allowed to drift:

> a user at tier T may use any feature whose tier is >= T

Tier 0 is owner and reaches everything, so it has no tier file. Tiers 1-4 are
described by `backend/tiers/*.json`, which are the same files mirrored into
`js/core/tiers.js` at build time.
"""

TAGS = [
    {"name": "auth", "description": "Sign in, refresh, change password."},
    {"name": "accounts", "description": "User administration. Owner only."},
    {"name": "clients", "description": "Menu: Klien."},
    {"name": "schedules", "description": "Menus: Jadwal Klien, Jadwal Coach."},
    {"name": "pricing", "description": "Menu: Harga & Program."},
    {"name": "programs", "description": "Training programmes the head coach builds."},
    {"name": "commissions", "description": "Menu: Performa & Komisi. Owner only."},
    {"name": "finance", "description": "Menu: Keuangan. Owner only."},
    {"name": "tickets", "description": "Menu: Tiket & Keluhan."},
    {"name": "messages", "description": "Menu: Pesan."},
    {"name": "attendance", "description": "Menu: Absensi."},
    {"name": "monitoring", "description": "Head coach roster and flags."},
    {"name": "corrections", "description": "Menu: Koreksi."},
    {"name": "athletes", "description": "Menu: Atlet Binaan."},
    {"name": "reports", "description": "Menu: Laporan."},
    {"name": "portal", "description": "The client-facing view. Self-scoped."},
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup and shutdown.

    The engine is not created here - importing app.db.session already made it -
    but the pool is opened lazily by the first query, so startup stays cheap
    and a bad DATABASE_URL is reported by /health rather than by a traceback
    during import.
    """
    try:
        matrix = load_tiers(refresh=True)
    except RuntimeError as exc:
        # Refuse to serve rather than serve a broken access matrix. A dashboard
        # that answers 403 for the wrong reason is worse than one that is down.
        raise RuntimeError(f"access matrix is invalid: {exc}") from exc

    logger.info(
        "tier matrix loaded: %s",
        ", ".join(f"t{tier}={tier.role}" for tier, t in sorted(matrix.items())),
    )
    if engine is not None:
        logger.info("database engine: %s", engine.url.render_as_string(hide_password=True))

    yield

    dispose_engine()
    logger.info("database engine disposed")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description=DESCRIPTION,
    openapi_tags=TAGS,
    lifespan=lifespan,
    root_path=settings.ROOT_PATH,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------- handlers
@app.exception_handler(TokenError)
async def token_error_handler(request: Request, exc: TokenError) -> JSONResponse:
    """
    A bad token is a 401 with a reason the browser can show.

    Raised inside dependencies, so without this it would surface as a 500 and
    look like a server fault rather than a stale login.
    """
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": str(exc)},
        headers={"WWW-Authenticate": "Bearer"},
    )


# ---------------------------------------------------------------------- routes
@app.get("/health", tags=["meta"], summary="Liveness, with a database check")
def health() -> dict:
    """
    ``ok`` is true only when the database answered.

    Reported separately from the HTTP status on purpose: a load balancer should
    take the instance out of rotation on a failed database, but the 200 tells
    an operator that the process itself is alive and the fault is downstream.
    """
    database = "down"
    try:
        with engine.connect() as connection:
            connection.exec_driver_sql("SELECT 1")
        database = "up"
    except Exception as exc:  # pragma: no cover - depends on a live database
        logger.warning("health check: database unreachable (%s)", exc)

    return {
        "status": "ok" if database == "up" else "degraded",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": database,
    }


@app.get("/", include_in_schema=False)
def root() -> dict:
    """Where to go next. The dashboard itself is a static file, not a route."""
    return {
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "api": settings.API_PREFIX,
        "docs": "/docs",
        "health": "/health",
        "frontend_served": settings.SERVE_FRONTEND,
    }


app.include_router(api_router, prefix=settings.API_PREFIX)


# ------------------------------------------------------- optional static mount
# Mounted last, on the root path, and only when asked for. index.html is served
# explicitly rather than as a directory index so that a refresh on
# /?role=coach still reaches the app instead of 404ing.
if settings.SERVE_FRONTEND and settings.FRONTEND_DIR.is_dir():
    # html=True serves index.html for a directory request, so / reaches the
    # dashboard even though the route above claims that path - the mount is
    # registered last and therefore only sees what the API router left over.
    app.mount("/", StaticFiles(directory=settings.FRONTEND_DIR, html=True), name="n6")
    logger.info("serving the split frontend from %s", settings.FRONTEND_DIR)