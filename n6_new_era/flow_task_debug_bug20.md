# DEBUG bug20 — Logo login tak terbaca di dark mode

1. Gejala: `logo-black.png` ditampilkan di atas background navy `#14243c`
   pada tema gelap — nyaris tak terlihat.
2. Dugaan penyebab: tidak ada pemilihan `logo-white.png` untuk tema gelap;
   file tersebut tersedia di `assets/images/` tetapi tidak dipakai.
3. File/baris: `js/core/auth.js` baris 53 (`renderLogin`).
4. Status verifikasi: confirmed (baca kode + daftar isi `assets/images/`).
