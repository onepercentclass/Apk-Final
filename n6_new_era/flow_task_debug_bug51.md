# Bug 51 — Tombol "Unduh (JPG)" jadwal coach tidak berfungsi

## Gejala
Menu Jadwal Coach memiliki tombol "Unduh (JPG)", tetapi saat diklik hanya
menampilkan toast "Ekspor JPG belum tersedia di versi ini."

## Dugaan penyebab
Tombol ada di UI tetapi fungsi export belum diimplementasikan. Ini tombol
mati (dead button) — ada secara visual tetapi tidak melakukan apa-apa.

## Lokasi
- Frontend: `n6_new_era/js/shared/schedule/schedule.js` baris 79:
  `toast('Ekspor JPG belum tersedia di versi ini.', 'info');`

## Verifikasi
- Kode frontend diperiksa 2026-10-09: tombol memanggil toast, bukan fungsi export.
- Browser test Owner 2026-10-09: tombol terlihat, belum diuji klik.

## Status
Terkonfirmasi. UI ada, fungsi belum ada. Perlu keputusan: implementasikan
export atau hapus tombol.
