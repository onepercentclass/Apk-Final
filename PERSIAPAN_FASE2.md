# Persiapan Fase 2 — Tombol Hapus (5 item)

**Item:** A2, B1, B3, B4, C2
**Status:** Menunggu keputusan pemilik (hapus permanen vs nonaktifkan/arsipkan)

---

## Kondisi Saat Ini

### Hapus Anggota (A2, B1, C2)
- **Backend (ketiga aplikasi):** `DELETE /accounts/{id}` = soft delete (set `is_active=False`).
  - `dbfin/routers/accounts.py:139`
  - `dbacc/routers/accounts.py` (sama)
  - `claisrox/routers/accounts.py` (sama)
- **Frontend:** Hanya ada tombol "Nonaktifkan"/"Aktifkan", tidak ada "Hapus".
- **Keputusan dibutuhkan:** Apakah "Hapus" = hapus permanen (hard delete)?
  - Jika ya: butuh endpoint backend baru + bahas data terkait (transaksi milik user yang dihapus).
  - Jika tidak: cukup ganti label "Nonaktifkan" jadi "Hapus" (tapi ini menyesatkan).

### Hapus Akun CoA (B3)
- **Frontend:** `DB_Accounting/js/menus/menu-pengaturan.js` — tidak ada tombol hapus.
- **Backend:** Tidak ada router CoA terpisah (cek `dbacc/routers/` — hanya accounts, auth, companies, reports, transactions).
  - Kemungkinan CoA disimpan di frontend (localStorage) atau di tabel umum.
- **Risiko:** Akun yang sudah dipakai di jurnal tidak boleh dihapus sembarangan.
- **Keputusan dibutuhkan:** Akun terpakai → tolak hapus, atau arsipkan (sembunyikan)?

### Hapus Aset (B4)
- **Frontend:** `DB_Accounting/js/menus/menu-asettetap.js` — tidak ada tombol hapus.
- **Backend:** Tidak ada router assets terpisah.
- **Risiko:** Aset yang sudah disusutkan/dijual perlu validasi.
- **Keputusan dibutuhkan:** Sama seperti B3.

---

## Opsi Implementasi

### Opsi A: Hapus Permanen (hard delete)
- Backend: tambah endpoint `DELETE /accounts/{id}/hard` atau parameter `?permanent=true`.
- Frontend: tombol "Hapus Permanen" + konfirmasi ganda (ketik nama/centang).
- Validasi: tolak jika ada data terkait (transaksi, jurnal) — atau cascade dengan peringatan.
- **Pro:** Sesuai permintaan harfiah pemilik ("tombol Hapus").
- **Kontra:** Risiko kehilangan data; butuh audit trail.

### Opsi B: Arsipkan (soft delete dengan label "Hapus")
- Backend: pakai yang ada (`is_active=False`), tambah filter "Arsip".
- Frontend: ganti label "Nonaktifkan" → "Hapus", tambah tab "Arsip" untuk restore.
- **Pro:** Aman, reversible, tidak butuh endpoint baru.
- **Kontra:** Data tetap ada (mungkin bukan yang pemilik mau).

### Opsi C: Hybrid
- "Nonaktifkan" tetap ada (soft).
- "Hapus Permanen" terpisah dengan konfirmasi ekstra ketat (hanya owner, ketik nama).
- **Pro:** Fleksibel.
- **Kontra:** Lebih kompleks.

---

## Rekomendasi

**Untuk Anggota (A2/B1/C2):** Opsi C (hybrid).
- Alasan: Nonaktifkan untuk kasus umum (karyawan resign sementara), Hapus Permanen untuk kasus khusus dengan konfirmasi ketat.

**Untuk CoA & Aset (B3/B4):** Tergantung jawaban pemilik soal "tolak vs arsip".
- Jika "tolak": validasi di backend, tombol hapus hanya untuk akun/aset yang belum terpakai.
- Jika "arsip": tambah flag `is_archived`, sembunyikan dari daftar utama.

---

## Langkah Setelah Keputusan

1. Backend: implementasi endpoint/validasi sesuai opsi terpilih.
2. Frontend (3 aplikasi untuk anggota, 1 untuk CoA/Aset): tambah tombol + konfirmasi.
3. Browser test: buat data uji → hapus → verifikasi → cleanup.
4. Update changelog.

---

## Pertanyaan untuk Pemilik (dari RANCANGAN_PERBAIKAN.md)

1. Hapus anggota = hapus permanen atau cukup nonaktifkan? Bagaimana dengan data transaksi milik anggota yang dihapus?
2. Akun CoA terpakai di jurnal → tolak hapus atau arsipkan?
3. Aset yang sudah disusutkan → boleh dihapus?
