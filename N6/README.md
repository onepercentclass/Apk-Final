# N6 Split5 — Single HTML → Modular Project

This is the modular `n6/` project, split from five single-file dashboards:
`admin.html`, `owner.html`, `headcoach.html`, `coach.html`, `client.html`.

## Structure

```
n6/
├── index.html              # Single entry point, role via ?role=owner|admin|headcoach|coach|client
├── css/
│   ├── owner/ORDER.txt     # Cascade order per role
│   ├── admin/ORDER.txt
│   ├── headcoach/ORDER.txt
│   ├── coach/ORDER.txt
│   └── client/ORDER.txt
├── js/
│   ├── app.js              # Bootstrap: role → CSS → view → tier gate → role bundle
│   ├── core/               # Shared logic (config, env, utils, dom, events, registry, storage, api, access, router, tiers, bundles)
│   ├── views/              # Markup modules per role
│   ├── shared/             # Deduplicated modules (coach-requests, n6-monthly-pdf-reports)
│   └── dist/               # Rebuilt role bundles (owner.js, admin.js, ...)
├── assets/
│   ├── img/                # 10 PNGs extracted from base64
│   └── README.md
└── backend/                # FastAPI + PostgreSQL (see backend/README.md)
```

## Build

**JANGAN edit `js/dist/*.js` manual.** Source of truth adalah `js/modules/<role>/*.js`.
Setelah mengubah file di `modules/`, rebuild dengan:

```bash
# Rebuild semua role
./tools/build.sh

# Rebuild satu role saja
./tools/build.sh --role owner

# Cek saja tanpa menulis (untuk CI/pre-commit)
./tools/build.sh --check
```

Build script (`tools/build.sh`) adalah port Linux dari `tools/build.ps1`.
Output harus byte-identical. Jika `--check` gagal, berarti ada fragment yang
diubah tanpa update `manifest.js` — perbaiki manifest sebelum commit.

## Quick Start (Frontend Only, API Disabled)

```bash
# Serve the static frontend
cd n6
python -m http.server 8777
# Open http://localhost:8777/?role=owner   (or admin|headcoach|coach|client)
```

The dashboards read/write `localStorage` — no backend required.

## With the Backend Enabled

```bash
# Terminal 1: backend
cd n6/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# edit .env (DATABASE_URL, SECRET_KEY)
psql -U postgres -c "CREATE USER n6 WITH PASSWORD 'n6'; CREATE DATABASE n6 OWNER n6;"
python -m app.seed
uvicorn app.main:app --reload --port 8000

# Terminal 2: frontend (with CORS allowed)
cd n6
# edit js/core/env.js: API_ENABLED = true
python -m http.server 8777
# Open http://localhost:8777/?role=owner
```

## Role Access (Tier Ladder)

| Tier | Role | JSON file | Reaches |
|------|------|-----------|---------|
| 0 | owner | (none, implicit all) | Everything |
| 1 | admin | tier-1-admin.json | Menus ≥ 1 |
| 2 | head coach | tier-2-headcoach.json | Menus ≥ 2 |
| 3 | coach | tier-3-coach.json | Menus ≥ 3 |
| 4 | client | tier-4-client.json | Menus ≥ 4 |

Rule: **a user at tier T may use any feature whose tier is >= T**.

Both the frontend (`js/core/access.js`) and the backend (`app/api/deps.py` → `core/tiers.py`) implement this matrix from the same `backend/tiers/*.json` files (mirrored into `js/core/tiers.js` at build time).

## The Split (How We Got Here)

The five original HTML files were mixed cp1252/UTF-8 declared as UTF-8. We:

1. **Normalised encoding** (`tools/archive/split-2026-10/00-normalize.ps1`) → real UTF-8. The only intentional deviation from "don't change anything" — documented here.
2. **Split CSS** at banner comments → `css/<role>/*.css` + `ORDER.txt`.
3. **Split JS** at line-anchored top-level declarations + `^\}\)\(\);` → per-menu fragments with `/*__N6_UNIT__*/` sentinel and `//__N6_BODY__` marker.
4. **Deduped** `coach-requests.js` and `n6-monthly-pdf-reports.js` (byte-identical in owner+admin) → `js/shared/`.
5. **Extracted** 10 base64 logos → `assets/img/*.png`.
6. **Unioned** all external `<script src>` CDN tags into `index.html` (jsPDF 2.5.1, AutoTable 3.8.2, Chart.js 4.4.0, html2canvas 1.4.1).
7. **Generated** `js/core/tiers.js` mirror of `backend/tiers/*.json`, `js/core/bundles.js` for CSS cascade, `js/core/access.js` (frontend gate, UX only; server enforces).
8. **Built** `js/dist/<role>.js` by concatenating fragments inside the original IIFE wrapper (`tools/build.ps1 -Check` reports `build ok` — byte-identical round-trip verified).
9. **Verified** browser DOM tree walk of `#n6-app` matches all 5 originals — zero content differences; 0 console errors.

## Build Tool (Provenance)

The splitter scripts are archived in `tools/archive/split-2026-10/` for traceability. The delivered build tool is `tools/build.sh` (Linux) / `tools/build.ps1` (Windows):

```bash
cd n6/js/tools
powershell -NoProfile -ExecutionPolicy Bypass -File build.ps1 -Check
# → "build ok"
```

It concatenates fragments → `js/dist/<role>.js` inside the original IIFE wrapper and validates exact byte match.

## Environment

```bash
# n6/.env.example (frontend only)
cp n6/.env.example n6/.env
# edit if needed — currently just API_BASE for when you flip the switch
```

```bash
# backend/.env.example
cp backend/.env.example backend/.env
# REQUIRED: DATABASE_URL, SECRET_KEY
```

## License

Internal — N6 Split5.