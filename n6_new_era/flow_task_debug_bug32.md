# Bug 32 — Absensi (coach): riwayat pengajuan 403

## Gejala
Seksi "Riwayat Pengajuan" di halaman Absensi menampilkan
"Terjadi gangguan, coba lagi." Form pengajuan tampil normal.

## Dugaan penyebab
Backend menolak akses: `GET /schedules/coach/requests` menjawab 403
`{"detail":{"error":"access_denied","reason":"'requests' on
'coach_schedule' needs a higher tier","tier":3,"role":"coach"}}`.
Coach (tier 3) tidak diizinkan melihat riwayat pengajuannya sendiri.
Ini kemungkinan salah konfigurasi permission di backend — coach
seharusnya bisa membaca request miliknya.

## Lokasi
- `js/coach/absensi.js` — fungsi `load()` memanggil
  `get('/schedules/coach/requests', { limit: 50 })`.
- Akar masalah di backend (tier permission untuk resource
  `coach_schedule/requests`).

## Verifikasi
- `curl` langsung ke `GET /api/n6/v1/schedules/coach/requests?limit=50`
  (token t_coach): 403 access_denied. Terkonfirmasi 2026-10-09.

## Status
Terkonfirmasi. Perbaikan kemungkinan di sisi backend (permission),
bukan frontend.
