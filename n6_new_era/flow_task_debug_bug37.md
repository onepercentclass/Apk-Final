# Bug 37 — Data klien tes: tanggal gabung identik, tanpa no. HP

## Gejala
Semua klien menampilkan tanggal gabung yang sama ("6 Okt 2026") dan
3 klien tidak punya nomor HP.

## Dugaan penyebab
Bukan bug kode. Data dibuat pada hari yang sama (akun tes t_*
dibuat 2026-10-06) dan field phone memang dikosongkan saat pembuatan.

## Lokasi
- Data: tabel klien di database (`joined_on: "2026-10-06"`, `phone: ""`
  untuk sebagian akun).

## Verifikasi
- `GET /api/n6/v1/clients?limit=5` (token t_owner): semua item
  `joined_on: "2026-10-06"`, beberapa `phone: ""`.
  Terkonfirmasi 2026-10-09.

## Status
Bukan bug. Basis tidak cukup untuk file temuan — dicatat agar tidak
diinvestigasi ulang.
