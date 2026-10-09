# Bug 41 — POST /schedules/coach/requests tidak ada (405)

## Gejala
Form "Ajukan" di halaman Absensi (coach) gagal dengan
"Gagal: Method Not Allowed". `POST /schedules/coach/requests`
menjawab 405.

## Dugaan penyebab
Router `schedules.py` hanya mendefinisikan GET (list), PUT
(approve/reject), DELETE untuk `/coach/requests`. Tidak ada handler
POST untuk membuat pengajuan baru. Frontend memanggil endpoint yang
belum diimplementasikan.

## Lokasi
- `unified-backend/app/apps/n6/routers/schedules.py` — tidak ada
  `@router.post("/coach/requests")`.
- Frontend: `n6_new_era/js/coach/absensi.js` memanggil
  `post('/schedules/coach/requests', {type, date, reason})`.

## Verifikasi
- `POST /api/n6/v1/schedules/coach/requests` (token t_coach): 405
  `{"detail":"Method Not Allowed"}`. Terkonfirmasi 2026-10-09.
- Perlu dibuat: endpoint POST yang membuat `ScheduleRequest` baru
  untuk coach yang sedang login (coach_id dari principal).

## Status
Terkonfirmasi. Perbaikan: tambah endpoint POST.
