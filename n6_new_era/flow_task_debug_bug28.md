# Bug 28 — Jadwal Coach (owner): endpoint 400, coach_id wajib

## Gejala
Halaman Jadwal Coach menampilkan "Terjadi gangguan, coba lagi."
Tombol "Coba Lagi" tidak mengubah apa-apa (error menetap).

## Dugaan penyebab
Frontend memanggil `GET /schedules/coach` tanpa parameter, tetapi
backend menjawab 400 `{"detail":"coach_id is required for this account"}`.
Untuk akun owner, backend mewajibkan query param `coach_id` yang tidak
pernah dikirim frontend.

## Lokasi
- `js/shared/schedule/schedule.js` — `renderCoachSchedule` memanggil
  `fetchList('/schedules/coach', ...)` tanpa parameter.

## Verifikasi
- `curl` langsung ke `GET /api/n6/v1/schedules/coach` (token t_owner):
  400 `{"detail":"coach_id is required for this account"}`.
  Terkonfirmasi 2026-10-09.
- Perlu dipastikan: apakah untuk owner seharusnya bisa melihat semua
  jadwal coach tanpa `coach_id` (keputusan backend), atau frontend
  harus mengirim daftar coach_id.

## Status
Terkonfirmasi. Belum diperbaiki.
