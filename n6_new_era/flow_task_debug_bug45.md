# Bug 45 — DELETE /athletes/{client_id} tidak ada UI

## Gejala
Menu Atlet Binaan (Head Coach) menampilkan daftar atlet, tetapi tidak ada
cara untuk menghapus atlet dari daftar.

## Dugaan penyebab
Backend menyediakan `DELETE /athletes/{client_id}` untuk drop client dari
atlet binaan, tetapi frontend tidak memiliki tombol/UI untuk memanggilnya.

## Lokasi
- Backend: `unified-backend/app/apps/n6/routers/athletes.py` —
  `@router.delete("/{client_id}")` ada.
- Frontend: tidak ada panggilan DELETE ke /athletes.

## Verifikasi
- Kode backend diperiksa 2026-10-09: endpoint DELETE ada.
- Kode frontend diperiksa: tidak ada panggilan DELETE ke /athletes.

## Status
Terkonfirmasi. Backend siap, frontend belum ada UI.
