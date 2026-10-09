# Bug 27 — Jadwal Klien (owner): endpoint 404

## Gejala
Halaman Jadwal Klien menampilkan "Terjadi gangguan, coba lagi."
Tombol "Coba Lagi" tidak mengubah apa-apa (error menetap).

## Dugaan penyebab
Frontend memanggil `GET /schedules/clients`, tetapi endpoint tersebut
tidak ada di backend (respons 404 `{"detail":"Not Found"}`).
`fetchList` menangkap error dan menampilkan halaman error generik.

## Lokasi
- `js/shared/schedule/schedule.js` — `renderClientSchedule` memanggil
  `fetchList('/schedules/clients', ...)`.

## Verifikasi
- `curl` langsung ke `GET /api/n6/v1/schedules/clients` (token t_owner):
  404 `{"detail":"Not Found"}`. Terkonfirmasi 2026-10-09.
- Perlu dipastikan: apakah backend memang belum punya endpoint ini,
  atau frontend salah path (misal seharusnya `/schedules?scope=clients`).

## Status
Terkonfirmasi. Belum diperbaiki.
