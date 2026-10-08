# DEBUG bug6 — Jadwal klien kolektif: endpoint belum terverifikasi

1. Gejala: halaman Jadwal Klien memanggil `GET /schedules/clients`.
2. Dugaan penyebab: API lama hanya memiliki `schedules/clients/{clientId}`
   (per klien), tidak ada endpoint koleksi. Bentuk respons koleksi pun
   tidak diketahui.
3. File/baris: `js/shared/schedule/schedule.js`, fungsi `renderClientSchedule()`.
4. Status verifikasi: confirmed tidak ada di kode lama (`N6/js/core/api.js`
   baris 151-152); keberadaan endpoint di backend belum teruji.
   (Catatan ini juga tercantum di flow_task.md pada T17.)
