# Bug 36 — Harga: daftar kosong tanpa tombol tambah

## Gejala
Halaman Harga & Program menampilkan "Daftar harga kosong" tanpa tombol
atau aksi untuk menambah harga/program. Satu-satunya aksi edit
(`prompt()` harga baru) hanya muncul jika sudah ada item.

## Dugaan penyebab
`renderPricing` tidak punya alur create: empty state tidak menyertakan
CTA tambah, dan `onEdit` hanya untuk item yang sudah ada (via
`prompt()` native, bukan form). Untuk katalog yang masih kosong,
owner tidak punya jalan menambah data dari UI.

## Lokasi
- `js/shared/pricing/pricing.js` — `renderPricing`, empty state
  `{ title: 'Daftar harga kosong' }`, dan `onEdit` (memakai `prompt()`).

## Verifikasi
- `GET /api/n6/v1/pricing` (token t_owner): 200
  `{"programs":[],"standalone":[]}` — API normal, memang kosong.
- Inspeksi kode: tidak ada tombol/form tambah di template maupun logika.
  Terkonfirmasi 2026-10-09.
- Perlu dipastikan: endpoint create/update pricing di backend
  (frontend saat ini `put('/pricing', { programs, standalone })` untuk edit).

## Status
Terkonfirmasi. Belum diperbaiki.
