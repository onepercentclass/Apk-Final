# DB Accounting — Backend (FastAPI + PostgreSQL)

## 1. Persiapan

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env                            # sesuaikan DATABASE_URL
```

Buat database sekali:

```sql
CREATE DATABASE dbacc;
```

## 2. Jalankan (dev)

```bash
uvicorn app.main:app --reload --port 8000
```

Cek: `GET http://localhost:8000/health` dan docs di `/docs`.

## 3. Sambungkan frontend

1. Deploy backend sehingga tersedia di `https://n6sport.id/api`
   (reverse-proxy `/api` → uvicorn, contoh via Nginx).
2. Di `js/config.js`: set `USE_API: true`.
3. Login ulang di frontend — data localStorage tetap sebagai cache,
   server menjadi sumber utama.

## 4. Tier

Hak akses dibaca dari `tiers/tier-{0..3}.json` (file yang sama dipakai
frontend). Kirim header `X-Tier: <n>` dari klien setelah login
(produksi: turunkan dari JWT, bukan dari header mentah).
Untuk sementara hanya tier `0` (Owner) yang dipakai.

## 5. Catatan fase berikutnya

- Ganti hash `sha256$` dev di `routers/auth.py` dengan `passlib[bcrypt]`
  + JWT (`python-jose`).
- Pecah koleksi `payload` JSONB menjadi tabel relasional
  (journal_lines, sales, purchases, ...) — path endpoint tidak berubah.
