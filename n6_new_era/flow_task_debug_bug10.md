# DEBUG bug10 — Kirim laporan client: endpoint belum terverifikasi

1. Gejala: form laporan memanggil `POST /portal/reports`
   dengan body `{text, client_id}`.
2. Dugaan penyebab: API lama untuk portal hanya memiliki GET
   (`portal.reports()`), tanpa endpoint create. Endpoint POST belum
   terverifikasi ada di backend.
3. File/baris: `js/client/laporan.js`, handler submit `#repForm`.
4. Status verifikasi: unverified (perlu respons aktual backend).
