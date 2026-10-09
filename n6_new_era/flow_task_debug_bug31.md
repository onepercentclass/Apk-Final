# Bug 31 — Beranda (coach): semua kartu statistik "–"

## Gejala
Keempat kartu (Klien Aktif, Sesi Bulan Ini, Kehadiran, Rating) hanya
menampilkan "–", padahal coach memiliki minimal 1 klien aktif.

## Dugaan penyebab
Field mismatch: frontend membaca `data.active_clients ?? data.client_count`,
tetapi API `GET /dashboards/coach/me` mengembalikan struktur bersarang:
`{"clients":{"total":1,"aktif":1,...}, "progress":[...], ...}`.
`data.active_clients` dan `data.client_count` keduanya undefined sehingga
jatuh ke '-'. Field lain (`sessions_this_month`, `attendance_pct`,
`rating`) juga tidak ada di respons dengan nama tersebut.

## Lokasi
- `js/coach/beranda.js` — array `cards`, baris
  `String(data.active_clients ?? data.client_count ?? '-')` dkk.

## Verifikasi
- `GET /api/n6/v1/dashboards/coach/me` (token t_coach): 200 dengan
  `{"coach_id":1,"clients":{"total":1,"aktif":1,...}}` — tidak ada
  `active_clients`/`client_count` di top level.
  Terkonfirmasi 2026-10-09.

## Status
Terkonfirmasi. Belum diperbaiki.
