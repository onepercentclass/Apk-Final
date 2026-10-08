# DEBUG bug18 — Badge merah light marginal gagal

1. Gejala: `#D62828` di atas `#FCEBEB` = 4.35:1, di bawah syarat 4.5:1
   untuk teks normal.
2. Dugaan penyebab: pasangan tint merah terlalu terang dibanding
   warna teksnya; badge lain lolos di kedua tema.
3. File/baris: `css/tokens.css` (`--red`, `--red-tint`),
   `css/components.css` (`.badge-red`).
4. Status verifikasi: confirmed (perhitungan rasio kontras WCAG).
