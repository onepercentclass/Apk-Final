# Fase 4 — C5: Audit Keterangan PDF

## Keterangan yang Ada di Template

File: `claisrox/js/core/print.js`

1. **Footer** (line 23):
   - "Claisrox — Dokumen ini dicetak otomatis dari sistem manajemen bisnis."
   - Muncul di semua PDF

2. **Header**:
   - Judul laporan + periode
   - "Dicetak: [tanggal]"

## Butuh dari Pemilik

Untuk menghapus "keterangan yang tidak mendukung", perlu:
- Contoh PDF yang sudah ditandai (coret bagian yang tidak perlu)
- Daftar menu mana saja yang perlu dibersihkan

## Kandidat untuk Dihapus (tebakan)

- Footer "dicetak otomatis" — mungkin tidak perlu di dokumen resmi
- Tapi JANGAN hapus sebelum konfirmasi pemilik
