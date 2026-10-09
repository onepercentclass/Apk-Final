# Bug 38 — Kelola Anggota: baris Owner tanpa tombol aksi

## Gejala
Dua baris Owner (owner, t_owner) tidak menampilkan tombol
"Ubah Role / Nonaktifkan / Hapus", sementara baris lain ada.

## Dugaan penyebab
By design. Kode sengaja mengosongkan kolom aksi untuk tier 0:
`(a.tier === 0 ? '' : <tombol-tombol>)` — proteksi agar akun owner
tidak bisa diubah/dinonaktifkan/dihapus dari UI.

## Lokasi
- `js/shared/members/members.js` — baris 47-53, kondisi `a.tier === 0`.

## Verifikasi
- Inspeksi kode: kondisi eksplisit dan disengaja.
  Terkonfirmasi 2026-10-09.

## Status
Bukan bug (by design). Dicatat agar tidak diinvestigasi ulang.
