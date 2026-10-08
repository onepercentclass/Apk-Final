# DEBUG bug21 — Regresi: badge merah gagal di dark mode pasca-fix bug18

1. Gejala: `.badge-red` kini teks putih di atas `--red`, yang pada tema
   gelap menjadi `#F28B8B` = 2.38:1 (syarat 4.5:1).
2. Dugaan penyebab: fix bug18 mengubah badge menjadi background solid +
   teks putih. Pola itu lolos di light mode (5.01:1) tetapi gagal di dark
   mode, karena `--red` menjadi varian terang. Sebelumnya pola tint
   (teks berwarna di background tint) lolos di dark mode (6.39:1).
3. File/baris: `css/components.css` (`.badge-red`),
   `css/tokens.css` (blok `[data-theme="dark"]`).
4. Status verifikasi: confirmed (perhitungan rasio kontras WCAG).
