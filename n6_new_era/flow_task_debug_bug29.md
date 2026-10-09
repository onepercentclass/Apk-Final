# Bug 29 — Keuangan (owner): ringkasan pemasukan tidak tampil, tombol Catat Pengeluaran pakai prompt()

## Gejala
1. Halaman Keuangan hanya menampilkan seksi "Pengeluaran"; tidak ada
   ringkasan "Pendapatan per Kategori" sama sekali.
2. Tombol "Catat Pengeluaran" diklik tidak membuka form/dialog apa pun
   (di browser uji).

## Dugaan penyebab
1. Field mismatch: frontend memeriksa `summary.by_category`, tetapi API
   `GET /finance/summary` mengembalikan `revenue_by_category` (bukan
   `by_category`). Kondisi `if (summary && summary.by_category)` selalu
   false sehingga seksi pendapatan tidak pernah dirender.
2. Tombol tambah memakai `prompt()` bawaan browser
   (`prompt('Keterangan:')`, `prompt('Jumlah (Rp):')`), bukan form/dialog
   sungguhan. Dialog native tidak andal (terutama di webview/headless)
   dan tidak konsisten dengan UI aplikasi.

## Lokasi
- `js/owner/keuangan.js` —
  - baris `if (summary && summary.by_category)`: harusnya
    `revenue_by_category` (atau sesuaikan dengan kontrak API).
  - handler `#addBtn`: ganti `prompt()` dengan modal form.

## Verifikasi
- `GET /api/n6/v1/finance/summary` (token t_owner): 200 dengan
  `{"revenue_by_category":[], ...}` — field `by_category` tidak ada.
  Terkonfirmasi 2026-10-09.

## Status
Terkonfirmasi. Belum diperbaiki.
