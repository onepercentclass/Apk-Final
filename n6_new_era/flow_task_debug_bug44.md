# Bug 44 — PUT /schedules/clients/{client_id} tidak ada UI

## Gejala
Menu Jadwal Klien hanya menampilkan daftar (read-only). Tidak ada form
untuk mengatur/mengubah jadwal klien.

## Dugaan penyebab
Backend menyediakan `PUT /schedules/clients/{client_id}` untuk replace
jadwal klien, tetapi frontend tidak memiliki UI (form) untuk memanggilnya.
Fitur setengah jadi: baca sudah ada (bug43 diperbaiki), tulis belum ada.

## Lokasi
- Backend: `unified-backend/app/apps/n6/routers/schedules.py` —
  `@router.put("/clients/{client_id}")` ada.
- Frontend: `n6_new_era/js/shared/schedule/schedule.js` —
  `renderClientSchedule()` hanya fetch list, tidak ada form edit.

## Verifikasi
- Kode backend diperiksa 2026-10-09: endpoint PUT ada.
- Kode frontend diperiksa: tidak ada panggilan PUT ke /schedules/clients.
- Tidak ada tombol "Edit" atau "Atur Jadwal" di menu Jadwal Klien.

## Status
Terkonfirmasi. Backend siap, frontend belum ada UI.
