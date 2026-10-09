# Fase Perbaikan — 3 Aplikasi (DB Finance, DB Accounting, Claisrox)

Sumber diagnosis: `RANCANGAN_PERBAIKAN.md` (2026-10-08).
Total: 20 item. Dibagi 5 fase berdasarkan ketergantungan keputusan pemilik.

---

## Fase 1 — Quick Wins (tidak butuh keputusan pemilik)

**Item:** A1, A3, A4, C1, C4

| Item | Kerja |
|------|-------|
| A1 | Tambah "Keluar" di sidebar Finance + "Masuk" di layar login |
| A3 | Perbaiki stats Kelola Anggota (ganti catch kosong dengan logger, perbaiki root cause) |
| A4 | CSS nominal besar: format singkat + ellipsis + tooltip |
| C1 | Tambah "Keluar" di sidebar Claisrox + "Masuk" di layar login |
| C4 | Sediakan logo hitam untuk PDF Claisrox |

**Deliverable:** 5 bug closed, browser-tested.
**Estimasi:** 1 sesi kerja.

---

## Fase 2 — Tombol Hapus (butuh keputusan: permanen vs arsip)

**Item:** A2, B1, B3, B4, C2

| Item | Kerja |
|------|-------|
| A2 | Hapus Anggota (Finance) |
| B1 | Hapus Anggota (Accounting) |
| B3 | Hapus Akun CoA (Accounting) + validasi referensi jurnal |
| B4 | Hapus Aset (Accounting) + validasi |
| C2 | Hapus Anggota (Claisrox) |

**Blokir:** Jawaban pemilik untuk pertanyaan 1 & 2 di RANCANGAN_PERBAIKAN.md.
**Deliverable:** 5 tombol hapus berfungsi dengan konfirmasi + validasi backend.
**Estimasi:** 1-2 sesi (tergantung backend).

---

## Fase 3 — Account Center (butuh persetujuan desain)

**Item:** A5, B6, C3

| Item | Kerja |
|------|-------|
| A5 | Account Center Finance |
| B6 | Account Center Accounting |
| C3 | Account Center Claisrox |

**Blokir:** Pilihan desain (tab vs satu halaman).
**Deliverable:** 1 pola Account Center × 3 aplikasi.
**Estimasi:** 1 sesi (setelah desain disetujui).

---

## Fase 4 — Butuh Input Pemilik

**Item:** B2, B5, B9, C5

| Item | Kerja | Butuh |
|------|-------|-------|
| B2 | Rapikan form Tambah Anggota | Screenshot "sebelum" |
| B5 | Dokumen + uji grafik laba rugi | Akses data nyata |
| B9 | Audit tema light/dark | Daftar elemen yang samar |
| C5 | Hapus keterangan PDF | Contoh PDF yang ditandai |

**Blokir:** Input dari pemilik per item.
**Deliverable:** Per item, setelah input diterima.

---

## Fase 5 — Besar / Butuh Klarifikasi Alur

**Item:** B7, C6, B8

| Item | Kerja | Catatan |
|------|-------|---------|
| B7 | Mobile UI Accounting | Audit per halaman di 360px |
| C6 | Mobile UI Claisrox | Audit per halaman di 360px |
| B8 | Multi-perusahaan login | Butuh alur langkah-per-langkah dari pemilik |

**Blokir:** Klarifikasi alur (B8). Mobile bisa jalan paralel.
**Estimasi:** 2-3 sesi.

---

## Ringkasan

| Fase | Item | Status |
|------|------|--------|
| 1 | A1, A3, A4, C1, C4 | ✅ Siap dikerjakan |
| 2 | A2, B1, B3, B4, C2 | ⏳ Tunggu keputusan hapus |
| 3 | A5, B6, C3 | ⏳ Tunggu desain |
| 4 | B2, B5, B9, C5 | ⏳ Tunggu input pemilik |
| 5 | B7, C6, B8 | ⏳ Tunggu klarifikasi |

**Rekomendasi:** Mulai Fase 1 sekarang. Sambil jalan, minta jawaban untuk Fase 2 & 3.
