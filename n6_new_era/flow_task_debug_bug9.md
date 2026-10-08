# DEBUG bug9 — Nilai status koreksi belum terverifikasi

1. Gejala: keputusan pengajuan mengirim
   `PUT /schedules/coach/requests/{id}` dengan body
   `{status:'disetujui'}` atau `{status:'ditolak'}`.
2. Dugaan penyebab: nilai status yang diterima backend tidak diketahui;
   sampel `GET /schedules/coach/requests` di api-samples.json kosong
   (tidak ada contoh nilai). Kemungkinan backend memakai kosakata lain.
3. File/baris: `js/head-coach/koreksi.js`, fungsi `decide()`.
4. Status verifikasi: unverified (perlu respons aktual backend).
