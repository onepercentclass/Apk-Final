# Bug 43 — GET /schedules/clients tidak ada; menu Jadwal Klien tampil empty state

## Gejala
Menu "Jadwal Klien" (Owner/Admin) menampilkan:
"Jadwal klien belum tersedia. Backend belum menyediakan data jadwal klien."

## Dugaan penyebab
Backend hanya menyediakan `GET /schedules/clients/{client_id}` (jadwal satu
klien spesifik), tetapi tidak ada `GET /schedules/clients` (daftar semua
jadwal klien) yang dibutuhkan frontend.

Frontend `renderClientSchedule()` di `js/shared/schedule/schedule.js` (baris
46-54) secara eksplisit menangani kasus ini dengan empty state, dengan komentar:
"Backend belum menyediakan GET /schedules/clients (404)."

## Lokasi
- Backend: `unified-backend/app/apps/n6/routers/schedules.py` — ada
  `@router.get("/clients/{client_id}")` (baris 218), tidak ada
  `@router.get("/clients")`.
- Frontend: `n6_new_era/js/shared/schedule/schedule.js` — fungsi
  `renderClientSchedule()` (baris 46-54).

## Verifikasi
- Kode frontend diperiksa 2026-10-09: komentar dan empty state terkonfirmasi.
- Daftar endpoint backend diperiksa: tidak ada GET /schedules/clients.
- Pola sama dengan bug41 (POST /schedules/coach/requests yang hilang).

## Status
Terkonfirmasi. Backend gap — endpoint list tidak ada.
