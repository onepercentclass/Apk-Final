# Bug 35 — Beranda (owner): kartu Pendapatan "–"

## Gejala
Kartu "Pendapatan" di Beranda owner hanya menampilkan "–", sementara
"Total Klien" tampil angka (5).

## Dugaan penyebab
Field mismatch: frontend membaca `finance.total_revenue`, tetapi API
`GET /finance/summary` mengembalikan field `revenue` (bukan
`total_revenue`). `finance.total_revenue != null` false sehingga jatuh
ke '-'.

## Lokasi
- `js/owner/beranda.js` — baris
  `finance && finance.total_revenue != null ? formatRupiah(finance.total_revenue) : '-'`.

## Verifikasi
- `GET /api/n6/v1/finance/summary` (token t_owner): 200 dengan
  `{"revenue":0.0,...}` — tidak ada field `total_revenue`.
  Terkonfirmasi 2026-10-09.

## Status
Terkonfirmasi. Belum diperbaiki.
