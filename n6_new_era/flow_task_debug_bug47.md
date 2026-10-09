# Bug 47 — POST /corrections/{correction_id}/resolve tidak ada UI

## Gejala
Menu Koreksi (Head Coach) menampilkan daftar koreksi/pengajuan, tetapi
tidak ada cara untuk menandai koreksi sebagai selesai (resolve).

## Dugaan penyebab
Backend menyediakan `POST /corrections/{correction_id}/resolve` untuk
resolve koreksi, tetapi frontend tidak memiliki tombol/UI untuk memanggilnya.

## Lokasi
- Backend: `unified-backend/app/apps/n6/routers/corrections.py` —
  `@router.post("/{correction_id}/resolve")` ada.
- Frontend: tidak ada panggilan POST ke /corrections/*/resolve.

## Verifikasi
- Kode backend diperiksa 2026-10-09: endpoint POST resolve ada.
- Kode frontend diperiksa: tidak ada panggilan ke endpoint resolve.

## Status
Terkonfirmasi. Backend siap, frontend belum ada UI.
