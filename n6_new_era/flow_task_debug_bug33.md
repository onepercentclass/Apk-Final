# Bug 33 — Laporan (client): kirim laporan 405 Method Not Allowed

## Gejala
Mengisi laporan latihan lalu klik Kirim gagal dengan error
"Gagal: Method Not Allowed". Daftar laporan (GET) tampil normal
(empty state).

## Dugaan penyebab
Backend tidak menyediakan POST untuk `/portal/reports`:
`POST /portal/reports` menjawab 405, sedangkan `GET /portal/reports`
200. Frontend memanggil `post('/portal/reports', { text, client_id })`
ke endpoint yang hanya mendukung GET.

## Lokasi
- `js/client/laporan.js` — submit handler memanggil
  `post('/portal/reports', { text, client_id: clientId })`.

## Verifikasi
- `POST /api/n6/v1/portal/reports` (token t_client): 405
  `{"detail":"Method Not Allowed"}`.
- `GET /api/n6/v1/portal/reports` (token t_client): 200.
  Terkonfirmasi 2026-10-09.
- Perlu dipastikan: endpoint POST yang benar (mungkin path/metode lain
  di backend) sebelum mengubah frontend.

## Status
Terkonfirmasi. Belum diperbaiki.
