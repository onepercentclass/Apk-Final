# Claisrox — struktur modular

```
claisrox/                  ← frontend statis (buka index.html atau serve folder ini)
├── index.html             markup + urutan load CSS/JS saja
├── assets/                logo.png, logo-mark.png (gambar lain taruh di sini)
├── css/                   SEMUA konfigurasi UI
│   ├── theme.css          token warna dark/light
│   ├── base.css           reset, body, scrollbar
│   ├── layout.css         .app, .main, .content, grid, .view
│   ├── sidebar.css  topbar.css  buttons.css  cards.css  tables.css
│   ├── charts.css  forms.css  modal.css  toast.css  dashboard.css
│   ├── print.css          @media print halaman utama
│   ├── responsive.css     breakpoint
│   └── print/             stylesheet jendela cetak (resi, laporan, lembar produksi)
└── js/
    ├── core/              config, endpoints, api, access (tier), storage, nav, ui, utils, print, app
    └── menu/              1 file per menu sidebar:
        beranda  produk  bahan-baku  resep  produksi  supplier
        customer  penjualan  pembelian  online  laporan  keuangan

backend/                   FastAPI + PostgreSQL
├── app/tiers/tier_0..3.json   hak akses menu per tier
├── app/routers/               auth, crud (pabrik per menu), finance, snapshot
├── app/resources.py           registri koleksi ↔ menu ↔ model ↔ schema
├── scripts/create_user.py     buat user (owner = tier 0)
└── docker-compose.yml  Dockerfile  requirements.txt  .env.example
```

## Aturan struktur
- Satu file JS = satu menu sidebar. Logika lintas-menu ada di `js/core/`.
- Tidak ada CSS/gaya di dalam JS atau base64 di dalam HTML; gaya cetak ada di `css/print/`.
- Skrip klasik (bukan ES module) agar `onclick="..."` dan buka lewat `file://` tetap jalan seperti aslinya.
- Menu baru: tambah entri di `NAV` (`js/core/nav.js`), `<div class="view" id="view-xxx">` di `index.html`, file `js/menu/xxx.js`, kunci `xxx` di tier JSON.

## Mode data
`js/core/config.js` → `APP_CONFIG.api.enabled`
- `false` (default sekarang): data di localStorage, sesi = owner tier 0 (semua menu).
- `true`: sesi dari `GET /auth/me`, data dari `GET /snapshot`, perubahan dikirim `PUT /snapshot` (debounce).
  Base URL: `https://n6sport.id/api`. Token JWT dibaca dari localStorage `claisrox_token_v1`
  (belum ada layar login, karena UI tidak boleh berubah; dapatkan token via `POST /auth/login`).

## Tier
| Tier | Peran | Menu |
|---|---|---|
| 0 | Owner | `*` (semua, termasuk menu baru) |
| 1 | Manager | semua kecuali keuangan |
| 2 | Staf Produksi & Gudang | dashboard, produk, bahan-baku, resep, produksi, supplier, pembelian |
| 3 | Kasir & Toko Online | dashboard, produk, customer, penjualan, online |

Tier 1–3 hanyalah usulan awal — ubah bebas di `backend/app/tiers/*.json`. Pemegang `dashboard`/`laporan` boleh membaca semua koleksi (mereka merangkum semuanya), tetapi hanya boleh menulis koleksi menu miliknya.

## Menjalankan backend
```bash
cd backend
cp .env.example .env            # isi JWT_SECRET
docker compose up -d --build
docker compose exec api python -m scripts.create_user owner --name "Pemilik Claisrox" --tier 0
# dokumentasi interaktif: http://localhost:8000/docs   (endpoint di bawah /api)
```
Tanpa Docker: `pip install -r requirements.txt && uvicorn app.main:app --reload` (butuh PostgreSQL).
Nginx: `location /api/ { proxy_pass http://127.0.0.1:8000; }` (tanpa trailing slash, prefix `/api` ikut diteruskan).

## Endpoint
`POST /api/auth/login` · `GET /api/auth/me` · `GET|PUT /api/snapshot` · `GET|PUT /api/keuangan` ·
CRUD (`GET/POST /x`, `GET/PUT/DELETE /x/{id}`) untuk `/produk /bahan-baku /supplier /customer /penjualan /pembelian /resep /produksi /online` · `GET /api/health`

Catatan: item transaksi & bahan resep disimpan sebagai JSONB di baris induknya. Tabel dibuat otomatis saat start; untuk produksi gunakan migrasi Alembic.
