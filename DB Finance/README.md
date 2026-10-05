# Claisrox (DB Track)

Hasil pemecahan `FinTrack.html` menjadi proyek modular. Tampilan dan fitur tidak diubah.

```
claisrox/            frontend (statis)
  index.html
  css/               UI, satu file per fungsi (tokens, base, layout, components, lists, forms,
                     overlay, charts, home, budget, bills, cards, accounts, settings, utilities)
  js/
    main.js          titik masuk
    config.js        USE_API, API_BASE, CURRENT_TIER
    access/          access.js + tiers/tier0..3.json
    core/            store, nav, events, utils, calc, seed, theme, katalog, ikon
    menu/            satu file per menu sidebar: beranda, transaksi, anggaran, rekening,
                     laporan, investasi, tagihan, tujuan, pengaturan  (+ index.js = registry)
    ui/              charts, components, modal, form, toast, tooltip
    export/          csv, pdf, backup, dialog, download
    services/        api, endpoints, mappers, storage
  assets/img/        logo.png, favicon.png
backend/             FastAPI + PostgreSQL
```

## Menjalankan frontend

Memakai ES module, jadi **tidak bisa dibuka dengan klik dua kali** (`file://`). Jalankan lewat server statis:

```
cd claisrox
python3 -m http.server 8766        # lalu buka http://localhost:8766
```

Data tersimpan di localStorage (`USE_API = false` di `js/config.js`).

## Akses per tier

`js/access/tiers/tier0.json` ... `tier3.json` masing-masing berisi `access`: daftar id menu.
**Tier N mendapat key miliknya ditambah semua key tier di atasnya (N+1, N+2, ...)**, jadi tier 0 = semua.

Id menu: `home tx budget accounts report invest bills goals settings`.

Pembagian awal hanyalah contoh; ubah bebas:
tier0 = accounts, invest, settings · tier1 = budget, report, bills, goals · tier2 = tx · tier3 = home.

Saat ini pengguna aktif = tier 0 (`CURRENT_TIER` di `config.js`). Menu yang tidak diizinkan
disembunyikan dari sidebar/navigasi bawah dan ditolak di `go()`.

## Mengaktifkan API

1. Jalankan backend (di bawah).
2. Di `js/config.js` ubah `USE_API = true`. `API_BASE` default `https://n6sport.id/api`.
3. Aplikasi memanggil `GET /access/me` dan `GET /state`, lalu `PUT /state` setiap data berubah.
   Token diambil dari `localStorage['claisrox-token']` (didapat dari `POST /auth/login`).
   **Belum ada halaman login** karena menambahnya mengubah UI.

## Backend

```
cd backend
cp .env.example .env               # isi JWT_SECRET dan OWNER_PASSWORD
docker compose up --build          # API di :8000, dokumentasi di /docs
```

Tanpa Docker: `pip install -r requirements.txt` lalu `uvicorn app.main:app` (butuh PostgreSQL).
Akun owner (tier 0) dibuat otomatis dari `.env`. Tabel dibuat otomatis saat start.
Backend membaca file tier yang sama dengan frontend (`TIERS_DIR`), jadi aturan akses hanya ada di satu tempat.
Di belakang Nginx: `location /api/ { proxy_pass http://127.0.0.1:8000/; }`.

Endpoint: `POST /auth/login`, `GET /access/me`, `GET|PUT /state`, dan `GET|PUT` untuk
`/profile /accounts /transactions /budgets /bills /goals /investments` (tiap bagian dibatasi key akses menunya).
