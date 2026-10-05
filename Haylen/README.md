# Haylen — AquaFlow Swimming School

Struktur:

```
Haylen/            Frontend (buka lewat web server statis)
  index.html
  css/             variables, layout, components, dashboard, pages, responsive
  js/              config, icons, storage, api, access, ui, crud + 1 file per menu sidebar + app.js
  assets/          gambar
backend/           FastAPI + PostgreSQL
  app/             main, config, database, models, security, access, crud_factory, routers/
  tiers/           tier0.json (Owner), tier1.json (Admin), tier2.json (Coach), tier3.json (cadangan)
```

## Menjalankan frontend

```bash
cd Haylen
python3 -m http.server 8080
# buka http://localhost:8080
```

Saat ini data memakai **localStorage** (`USE_API: false` di `Haylen/js/config.js`) dan tier aktif = **0 (Owner)**.

Untuk memakai server: ubah `USE_API: true`, pastikan `API_BASE` benar (`https://n6sport.id/api`).
Reset data lokal: jalankan `Haylen.storage.reset()` di console browser.

## Menjalankan backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # isi DATABASE_URL, SECRET_KEY, OWNER_PASSWORD
createdb haylen             # database PostgreSQL
uvicorn app.main:app --reload
# dokumentasi: http://localhost:8000/docs
```

Akun owner (tier 0) dibuat otomatis dari `.env` saat pertama jalan.

## Sistem tier

Tier **lebih kecil = akses lebih luas**. Tier 0 bisa semua fitur. Level per menu:
`none < view < limited < manage < full` (view = baca saja; limited = baca/tambah/ubah; manage/full = plus hapus).

| Fitur | Owner (0) | Admin (1) | Coach (2) |
|---|---|---|---|
| Lihat omzet/laba | full | limited | none |
| Kelola member | full | full | limited |
| Kelola program | full | full | none |
| Kelola coach | full | full | none |
| Jadwal kelas | full | full | full |
| Absensi | view | manage | full |
| Transaksi | view | manage | none |
| Laporan bisnis | full | limited | none |
| Pengaturan sistem | full | limited | none |

Catatan: `fasilitas` tidak ada di tabel referensi, jadi diasumsikan Owner/Admin full, Coach none. Tier 3 hanyalah cadangan.
Isi tier di frontend (`js/access.js`) sama dengan file JSON di `backend/tiers/` — jika mengubah salah satu, ubah keduanya (atau aktifkan API agar frontend memuat dari `/api/tiers/{n}`).

## Endpoint (prefix /api)

`POST /auth/login`, `GET /auth/me`, `GET /tiers/{n}`, `GET /dashboard/summary`,
`/members`, `/programs`, `/coaches`, `/schedules`, `/transactions`, `/facilities`, `/settings` (GET/POST/PUT/DELETE),
`GET /reports/summary`, `GET /health`.
