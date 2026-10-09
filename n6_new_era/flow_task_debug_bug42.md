# Bug 42 — POST /portal/reports tidak ada; konsep training log belum ada

## Gejala
Tombol "Kirim" di halaman Laporan (client) gagal. `POST
/portal/reports` menjawab 405.

## Dugaan penyebab
`GET /portal/reports` di `portal.py` mengembalikan `MonthlyReport`
(dokumen yang dibuat gym untuk audiens), bukan log latihan yang
dikirim client. Tidak ada konsep "training log" di backend: tidak ada
tabel, model, maupun endpoint POST untuk menampung laporan latihan
dari client. Frontend mengasumsikan fitur yang belum diimplementasikan.

## Lokasi
- `unified-backend/app/apps/n6/routers/portal.py` — hanya ada
  `@router.get("/reports")`, tidak ada POST.
- Frontend: `n6_new_era/js/client/laporan.js` memanggil
  `post('/portal/reports', {body, client_id})`.

## Verifikasi
- `POST /api/n6/v1/portal/reports` (token t_client): 405.
- `GET /api/n6/v1/portal/reports`: 200 (mengembalikan MonthlyReport).
  Terkonfirmasi 2026-10-09.
- Penambahan fitur ini butuh tabel baru + endpoint + permission —
  di luar scope perbaikan bug; perlu keputusan desain dari pemilik.

## Status
Terkonfirmasi. Bukan bug kode — fitur belum ada. Disarankan: diskusikan
desain training log dengan pemilik sebelum implementasi.
