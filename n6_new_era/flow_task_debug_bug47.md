# Bug 47 — Modul koreksi latihan belum ada di frontend (termasuk POST /corrections/{id}/resolve)

## Gejala
Menu "Koreksi" di aplikasi sebenarnya menampilkan pengajuan reschedule/cuti
coach (dari /schedules/coach/requests), BUKAN koreksi latihan.

## Dugaan penyebab
Backend memiliki modul koreksi latihan terpisah:
- `GET /corrections` — daftar koreksi
- `POST /corrections` — buat koreksi
- `POST /corrections/{correction_id}/resolve` — selesaikan koreksi

Tetapi frontend tidak memiliki UI sama sekali untuk modul ini. Tidak ada
panggilan ke /corrections di seluruh kode frontend.

Ini bukan sekadar "tombol resolve hilang" — seluruh modul belum dibuat.

## Lokasi
- Backend: `unified-backend/app/apps/n6/routers/corrections.py` — lengkap.
- Frontend: tidak ada file yang memanggil /corrections.

## Verifikasi
- Kode backend diperiksa 2026-10-09: 3 endpoint corrections ada.
- Kode frontend diperiksa: tidak ada referensi ke /corrections.
- Menu "Koreksi" yang ada memakai /schedules/coach/requests (fitur berbeda).

## Status
Terkonfirmasi. Fitur belum ada — perlu keputusan desain sebelum implementasi.

## Update 2026-10-09
Diimplementasikan: UI koreksi latihan ditambahkan ke menu Koreksi (Head Coach).
- Form "Buat Koreksi" (klien, field, nilai baru, alasan)
- Daftar koreksi dengan tombol "Selesaikan"
- Menggunakan GET/POST /corrections dan POST /corrections/{id}/resolve
