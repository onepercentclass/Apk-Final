# DEBUG bug16 — Verifikasi bug10: POST /portal/reports → 405

1. Gejala: kirim laporan latihan client akan gagal; route ada tetapi
   method POST tidak diizinkan (405 Method Not Allowed).
2. Dugaan penyebab: backend tidak mendukung pembuatan laporan via POST
   di route ini; API lama hanya memiliki GET untuk portal/reports.
3. File/baris: `js/client/laporan.js`, handler submit `#repForm`.
4. Status verifikasi: confirmed (probe live tanpa token: 405, tanpa efek
   samping). Method/endpoint yang benar belum diketahui — dasar fix
   belum cukup.
