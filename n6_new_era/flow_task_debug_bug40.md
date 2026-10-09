# Bug 40 — PUT /pricing tidak persist: program baru langsung terhapus

## Gejala
`PUT /pricing` dengan program baru mengembalikan 200 tetapi tabel
`n6.programs` tetap kosong. Data tidak tersimpan.

## Dugaan penyebab
Di `write_pricing`, `keep_program_ids` dihitung di AWAL dari payload
(sebelum insert). Program baru (tanpa id) dibuat via `db.add()` +
`db.flush()` sehingga mendapat id. Namun bagian "deletions" berjalan
SETELAH flush dengan query `Program.id.notin_(keep_program_ids or {-1})`.
Karena id program baru tidak ada di `keep_program_ids`, program yang
baru dibuat langsung masuk daftar `doomed` dan di-`delete()`.

Alur: insert (flush) → id=1 → deletions: id=1 not in {-1} → delete.

## Lokasi
- `unified-backend/app/apps/n6/routers/pricing.py` — `write_pricing`,
  bagian deletions (baris ~134). `keep_program_ids` harus mencakup id
  yang baru dibuat setelah flush.

## Verifikasi
- `PUT /pricing {"programs":[{"name":"Tes","price":100000}]}` → 200,
  `GET /pricing` → kosong. Tabel `n6.programs` 0 rows (via /db/query).
  Terkonfirmasi 2026-10-09.

## Status
Terkonfirmasi. Perbaikan: tambahkan id baru ke `keep_program_ids`
setelah flush.
