# Fase 5 — B8: Multi Perusahaan (TERBLOKIR)

## Kondisi Saat Ini

File: `DB_Accounting/js/menus/menu-perusahaan.js`

Perusahaan disimpan di `S.companies`, ganti via dropdown tanpa login ulang.

## Pertanyaan untuk Pemilik

"Menu Multi Perusahaan - waktu memilih kalau bisa dengan login yang berbeda-beda."

Maksud yang belum jelas:
1. Apakah tiap perusahaan = akun login terpisah (satu user satu perusahaan)?
2. Atau satu user bisa akses banyak perusahaan, tapi tiap ganti harus login ulang?
3. Atau cukup konfirmasi password saat ganti perusahaan?

## Dampak

- Opsi 1: Perubahan besar di auth backend (user-company mapping)
- Opsi 2: Perubahan alur frontend (logout + login saat ganti)
- Opsi 3: Kecil (tambah konfirmasi)

**Status:** Menunggu penjelasan langkah-per-langkah dari pemilik.
