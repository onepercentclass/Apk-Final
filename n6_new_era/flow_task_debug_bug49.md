# Bug 49 — PATCH /portal/me tidak ada UI (client tidak bisa edit profil)

## Gejala
Client tidak bisa mengubah data kontak/profil sendiri via aplikasi.

## Dugaan penyebab
Backend menyediakan `PATCH /portal/me` untuk ubah data kontak client,
tetapi frontend tidak memiliki form/UI untuk memanggilnya.

## Lokasi
- Backend: `unified-backend/app/apps/n6/routers/portal.py` —
  `@router.patch("/me")` ada.
- Frontend: tidak ada panggilan PATCH ke /portal/me.

## Verifikasi
- Kode backend diperiksa 2026-10-09: endpoint PATCH ada.
- Kode frontend diperiksa: tidak ada form edit profil client.

## Status
Terkonfirmasi. Backend siap, frontend belum ada UI.
