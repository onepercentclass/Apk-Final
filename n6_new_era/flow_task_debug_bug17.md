# DEBUG bug17 — Kontras tombol dan toast gagal di dark mode

1. Gejala: teks putih di atas varian warna terang pada tema gelap:
   `.btn-primary` 1.72:1, `.btn-danger` 2.38:1,
   `.toast-success` 1.80:1, `.toast-error` 2.38:1
   (syarat teks normal 4.5:1).
2. Dugaan penyebab: `--accent-ink`, `--red`, `--green` menjadi varian terang
   di `[data-theme="dark"]`, tetapi warna teks tombol/toast tetap putih.
3. File/baris: `css/tokens.css` (blok `[data-theme="dark"]`),
   `css/base.css` (`.btn-primary`, `.btn-danger`),
   `css/components.css` (`.toast-success`, `.toast-error`).
4. Status verifikasi: confirmed (perhitungan rasio kontras WCAG).
