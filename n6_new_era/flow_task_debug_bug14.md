# DEBUG bug14 — Verifikasi bug5: POST /schedules/coach/requests → 405

1. Gejala: submit form absensi coach akan gagal; route ada tetapi
   method POST tidak diizinkan (405 Method Not Allowed).
2. Dugaan penyebab: backend tidak mendukung pembuatan pengajuan via POST
   di route ini; aplikasi lama menyimpan pengajuan di variabel lokal
   dan tidak pernah POST.
3. File/baris: `js/coach/absensi.js`, handler submit `#reqForm`.
4. Status verifikasi: confirmed (probe live tanpa token: 405, tanpa efek
   samping). Endpoint/method yang benar belum diketahui — dasar fix
   belum cukup.
