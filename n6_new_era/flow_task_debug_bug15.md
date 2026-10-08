# DEBUG bug15 — Verifikasi bug6: GET /schedules/clients → 404

1. Gejala: halaman Jadwal Klien akan tampil error; route koleksi
   tidak ada di backend (404 Not Found).
2. Dugaan penyebab: API hanya menyediakan `/schedules/clients/{id}`
   per klien; tidak ada endpoint koleksi.
3. File/baris: `js/shared/schedule/schedule.js`, fungsi `renderClientSchedule()`.
4. Status verifikasi: confirmed (probe live tanpa token: 404).
   Alternatif yang benar belum diketahui — dasar fix belum cukup.
