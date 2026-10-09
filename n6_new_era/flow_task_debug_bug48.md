# Bug 48 — POST /messages/broadcast tidak ada UI

## Gejala
Menu Pesan tidak memiliki fitur broadcast (kirim pesan ke banyak penerima
sekaligus).

## Dugaan penyebab
Backend menyediakan `POST /messages/broadcast` untuk broadcast pesan,
tetapi frontend tidak memiliki UI untuk memanggilnya.

## Lokasi
- Backend: `unified-backend/app/apps/n6/routers/messages.py` —
  `@router.post("/broadcast")` ada.
- Frontend: tidak ada panggilan POST ke /messages/broadcast.

## Verifikasi
- Kode backend diperiksa 2026-10-09: endpoint POST broadcast ada.
- Kode frontend diperiksa: tidak ada panggilan ke endpoint broadcast.

## Status
Terkonfirmasi. Backend siap, frontend belum ada UI.
