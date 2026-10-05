# N6 Split5 Backend

FastAPI + PostgreSQL backend for the five N6 dashboards (owner, admin, head coach, coach, client).

## Prerequisites

- PostgreSQL 15+
- Python 3.11+ (venv recommended)

## Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure
copy .env.example .env
# edit .env with your DATABASE_URL and SECRET_KEY
```

## Database

```bash
# Create the role and database
psql -U postgres
  CREATE USER n6 WITH PASSWORD 'n6';
  CREATE DATABASE n6 OWNER n6;
  \q

# Bootstrap schema + first two accounts (owner + admin)
python -m app.seed
```

The seed script creates the tables and inserts:
- `owner` / `owner`  → tier 0 (owner, reaches everything)
- `admin` / `admin`  → tier 1 (admin)

Change the passwords before using outside localhost.

## Running

```bash
# Development (auto-reload)
uvicorn app.main:app --reload --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API lives at `/api/v1` (configurable via `API_PREFIX`). OpenAPI docs at `/docs`.

## Access Control

The rule, implemented identically on both sides of the wire:

> **A user at tier T may use any feature whose tier is >= T.**

- Tier 0 (owner): implicit all-access, no JSON file.
- Tier 1 (admin): `backend/tiers/tier-1-admin.json`
- Tier 2 (headcoach): `backend/tiers/tier-2-headcoach.json`
- Tier 3 (coach): `backend/tiers/tier-3-coach.json`
- Tier 4 (client): `backend/tiers/tier-4-client.json`

Every mutating route calls `require(domain, action)` which raises 403 when the token's tier doesn't include that action. The frontend hides menu items via the same matrix (mirrored into `js/core/tiers.js` at build time) so the browser and the server never disagree.

## API Surface (matches `js/core/api.js`)

| Group | Routes | Tier actions |
|-------|--------|--------------|
| auth | POST /login, /refresh, /logout, PUT /password, GET /me, GET /tiers | – |
| accounts | GET/POST/PATCH/DELETE /accounts, PUT /accounts/{id}/tier | accounts.view, create, update, archive |
| clients | GET/POST /clients, GET /clients/export, GET/PATCH/DELETE /clients/{id}, POST /clients/{id}/archive, POST /clients/{id}/enrollments | clients.view, create, update, archive, export |
| schedules | GET/PUT /schedules/coach, GET/PUT /schedules/clients/{id}, GET/PUT /schedules/coach/requests, PUT /schedules/coach/requests/{id}, DELETE /schedules/coach/requests/{id} | client_schedule.view/manage, coach_schedule.view/manage/requests |
| pricing | GET/PUT /pricing | pricing.view/manage |
| programs | GET/POST /programs, GET/PATCH /programs/{id}, POST /programs/{id}/publish | programs.view/manage/publish |
| commissions | GET /commissions/summary, PUT /commissions/{id}, POST /commissions/{id}/recalculate, POST /commissions/{id}/payout, DELETE /commissions/{id}/{period} | commissions.view |
| finance | GET /finance/summary, GET /finance/monthly, GET/POST/DELETE /finance/expenses | finance.view |
| tickets | GET /tickets, GET /tickets/{id}/replies, POST /tickets/{id}/reply, POST /tickets/{id}/close | tickets.view, reply, close |
| messages | GET /messages, POST /messages, POST /messages/broadcast, POST /messages/{id}/read, POST /messages/read-all | messages.view, send |
| attendance | GET/POST /attendance, DELETE /attendance/{id} | attendance.view, manage |
| monitoring | GET /monitoring/clients, GET /monitoring/summary, GET /monitoring/flags, GET /monitoring/commission-check | monitoring.view |
| corrections | GET/POST /corrections, POST /corrections/{id}/resolve | corrections.view, manage |
| athletes | GET/PUT/DELETE /athletes/{client_id} | athletes.view, manage |
| reports | GET/POST /reports/monthly, GET /reports/preview, GET /reports/clients/{id}/summary | reports.view, generate |
| portal | GET/PATCH /portal/me, GET /portal/reports, GET /portal/reports/summary, GET /portal/me/summary, GET/POST /portal/messages, POST /portal/messages/read, GET /portal/unread | (self-scoped, no `require()`; allowed by tier-4 `endpoints.allow` list) |

## Frontend Integration

The dashboards ship with **API disabled** (`js/core/env.js: API_ENABLED = false`). They read and write `localStorage`, and `js/core/api.js` describes the exact surface above. When you are ready:

1. Set `API_ENABLED = true` in `js/core/env.js` (or via your build).
2. Set `CORS_ORIGINS` in `.env` to include your dashboard origin.
3. The frontend's `createApiRepository()` will drive the live API instead of `localStorage`.

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app, CORS, /health, optional static mount
│   ├── api/
│   │   ├── deps.py             # Principal, require(), ensure_client_scope, PeriodQuery
│   │   └── v1/
│   │       ├── router.py       # Mounts all endpoint routers (literal paths first)
│   │       └── endpoints/      # One module per sidebar menu
│   ├── core/
│   │   ├── config.py           # pydantic-settings, reads backend/.env
│   │   ├── security.py         # bcrypt, HS256 access/refresh tokens
│   │   ├── tiers.py            # Loads backend/tiers/*.json → access matrix
│   │   ├── period.py           # YYYY-MM arithmetic (bounds, shift, series)
│   │   └── metrics.py          # Money & roster sums (single source of truth)
│   ├── db/
│   │   ├── session.py          # Sync SQLAlchemy 2.0 engine + SessionLocal
│   │   ├── models.py           # All ORM models (one group per menu)
│   │   └── base.py             # DeclarativeBase + TimestampMixin
│   ├── schemas/                # One module per resource group
│   └── seed.py                 # create_all + owner/admin bootstrap
├── tiers/
│   ├── tier-1-admin.json
│   ├── tier-2-headcoach.json
│   ├── tier-3-coach.json
│   └── tier-4-client.json
├── requirements.txt
└── .env.example
```

## Notes

- **No Alembic yet**: `Base.metadata.create_all` covers the initial schema. When you need migrations, add `alembic init migrations` and `alembic revision --autogenerate`.
- **Synchronous engine**: `psycopg` 3 over sync SQLAlchemy 2.0. Endpoints are plain `def`; FastAPI runs them in its threadpool. An async engine would buy nothing here and would make every dependency twice as verbose.
- **Frontend mount**: `SERVE_FRONTEND=true` in `.env` serves `index.html` from `FRONTEND_DIR` (default `..`). Off by default — the dashboards run from any static host while the API is off.
- **Tier 0 has no JSON file**: owner is the implicit all-access case. `core/tiers.py` enforces this; `AccountCreate` rejects tier 0 so an owner can only be created by bootstrap.

## License

Internal — N6 Split5.