# DEBUG bug23 — Splash boot hardcoded warna light (flash di dark mode)

1. Gejala: pengguna dark mode melihat splash terang sesaat saat aplikasi
   dimuat.
2. Dugaan penyebab: style inline splash di index.html memakai background
   #F5F3EE dan teks #111110 yang hardcoded; tidak merespons
   data-theme="dark" yang dipasang applyTheme().
3. File/baris: `index.html` (blok `<style>` inline).
4. Status verifikasi: confirmed (baca kode).
