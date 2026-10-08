# DEBUG bug11 — Struktur ringkasan keuangan belum terverifikasi

1. Gejala: halaman Keuangan membaca `summary.by_category`
   dari `GET /finance/summary`.
2. Dugaan penyebab: nama field tidak tercantum di api-samples.json;
   backend bisa memakai nama atau struktur berbeda
   (mis. array kategori, bukan objek).
3. File/baris: `js/owner/keuangan.js`, fungsi `load()`.
4. Status verifikasi: unverified (perlu respons aktual backend).
