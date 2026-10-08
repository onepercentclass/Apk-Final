# DEBUG bug5 — Pengajuan absensi coach: endpoint create belum terverifikasi

1. Gejala: form absensi memanggil `POST /schedules/coach/requests`
   dengan body `{type, date, reason}`.
2. Dugaan penyebab: aplikasi lama menyimpan pengajuan reschedule/cuti di
   variabel lokal (`rescheduleRequests.unshift(...)` di
   `js/modules/coach/bootstrap.js`) dan tidak pernah POST ke backend.
   Yang terverifikasi ada hanya GET list dan PUT decide
   (`schedules/coach/requests/{id}`).
3. File/baris: `js/coach/absensi.js`, handler submit `#reqForm`.
4. Status verifikasi: confirmed tidak ada di kode lama; keberadaan endpoint
   di backend belum teruji.
