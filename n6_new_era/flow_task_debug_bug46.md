# Bug 46 — Modul absensi coach belum ada di frontend (termasuk DELETE /attendance/{id})

## Gejala
Menu Head Coach > Coach hanya menampilkan daftar coach dengan statistik.
Tidak ada form "Catat Absensi", tidak ada "Riwayat Absensi", tidak ada
tombol hapus/batal absensi.

## Dugaan penyebab
Backend menyediakan lengkap:
- `GET /attendance` — daftar absensi
- `POST /attendance` — catat absensi
- `DELETE /attendance/{attendance_id}` — batalkan absensi

Tetapi frontend tidak memiliki UI sama sekali untuk modul absensi.
MENU_MAP.md menyebut "Catat Absensi Coach" dan "Riwayat Absensi", tetapi
tidak pernah diimplementasikan di `js/head-coach/coach.js` (hanya 29 baris,
hanya tampil daftar coach).

Ini bukan sekadar "tombol hapus hilang" — seluruh modul belum dibuat.

## Lokasi
- Backend: `unified-backend/app/apps/n6/routers/attendance.py` — lengkap.
- Frontend: `n6_new_era/js/head-coach/coach.js` — hanya daftar coach,
  tidak ada UI absensi.

## Verifikasi
- Kode backend diperiksa 2026-10-09: 3 endpoint attendance ada.
- Kode frontend diperiksa: tidak ada panggilan ke /attendance sama sekali.
- File coach.js hanya 29 baris.

## Status
Terkonfirmasi. Fitur belum ada — perlu keputusan desain sebelum implementasi.
Diputuskan 2026-10-09: dokumentasikan saja, tidak dibuatkan UI sekarang.
