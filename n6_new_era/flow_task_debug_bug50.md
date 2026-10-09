# Bug 50 — POST /reports/monthly tidak ada UI

## Gejala
Tidak ada cara untuk generate laporan bulanan via aplikasi.

## Dugaan penyebab
Backend menyediakan `POST /reports/monthly` untuk generate laporan akhir
bulan, tetapi frontend tidak memiliki tombol/UI untuk memanggilnya.

## Lokasi
- Backend: `unified-backend/app/apps/n6/routers/reports.py` —
  `@router.post("/monthly")` ada.
- Frontend: tidak ada panggilan POST ke /reports/monthly.

## Verifikasi
- Kode backend diperiksa 2026-10-09: endpoint POST monthly ada.
- Kode frontend diperiksa: tidak ada tombol generate laporan.

## Status
Terkonfirmasi. Backend siap, frontend belum ada UI.
