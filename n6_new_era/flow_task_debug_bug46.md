# Bug 46 — DELETE /attendance/{attendance_id} tidak ada UI

## Gejala
Menu Absensi menampilkan riwayat absensi, tetapi tidak ada cara untuk
membatalkan/menghapus entri absensi yang salah.

## Dugaan penyebab
Backend menyediakan `DELETE /attendance/{attendance_id}` untuk undo satu
baris absensi, tetapi frontend tidak memiliki tombol/UI untuk memanggilnya.

## Lokasi
- Backend: `unified-backend/app/apps/n6/routers/attendance.py` —
  `@router.delete("/{attendance_id}")` ada.
- Frontend: tidak ada panggilan DELETE ke /attendance.

## Verifikasi
- Kode backend diperiksa 2026-10-09: endpoint DELETE ada.
- Kode frontend diperiksa: tidak ada panggilan DELETE ke /attendance.

## Status
Terkonfirmasi. Backend siap, frontend belum ada UI.
