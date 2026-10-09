# Rancangan Perbaikan — Bug List Pemilik (2026-10-08)

Sumber: `bug_apk.txt` (20 item, 3 aplikasi). Dokumen ini berisi diagnosis awal
dan usulan perbaikan per item. Belum dieksekusi — menunggu persetujuan.

**Prinsip:**
- Tidak mengubah perilaku yang tidak diminta.
- Setiap item yang menyentuh data (hapus) wajib konfirmasi + backend mendukung.
- Setiap item diuji di browser sebelum dianggap selesai.

---

## A. DB Finance / DB Tracker (5 item)

### A1. Tombol menu Login & Logout
- **Diagnosis:** Saat ini tidak ada tombol logout yang jelas di navigasi; user harus tahu cara keluar.
- **Usulan:** Tambahkan item "Keluar" di menu/sidebar + tombol "Masuk" di layar login bila sesi habis.
- **Scope:** Frontend saja (`js/core/nav.js`, `js/menu/index.js`).

### A2. Kelola Anggota — tombol Hapus Anggota
- **Diagnosis:** Saat ini hanya ada "Nonaktifkan"/"Aktifkan". Backend `DELETE /accounts/{id}` = nonaktifkan (soft), bukan hapus permanen (`app/apps/dbfin/routers/accounts.py:140`).
- **Usulan:** Tambah tombol "Hapus" permanen → butuh endpoint backend baru (hard delete) + konfirmasi ganda di frontend.
- **Scope:** Frontend + backend.
- **Pertanyaan untuk pemilik:** Hapus permanen atau cukup nonaktifkan? Bagaimana dengan data transaksi milik anggota yang dihapus?

### A3. Kolom statistik Kelola Anggota tidak berfungsi (Total/Aktif/Nonaktif)
- **Diagnosis:** Kode statistik ADA (`updateStats()` di `js/menu/akun.js:98`, dipanggil di `:174`), tapi kegagalan API ditelan `catch` kosong (`/* statistik opsional, abaikan */`). Kemungkinan penyebab: respons `/accounts?limit=1000` tidak sesuai ekspektasi atau error jaringan.
- **Usulan:** (1) Ganti catch kosong dengan logger agar penyebab terlihat; (2) perbaiki root cause setelah terlihat; (3) fallback tampilkan "–" dengan tooltip bila gagal.
- **Scope:** Frontend (kemungkinan kecil backend).

### A4. Nominal besar keluar kolom
- **Diagnosis:** Angka besar (mis. ratusan juta) overflow dari kolomnya — kemungkinan `white-space: nowrap` tanpa `text-overflow` atau kolom terlalu sempit.
- **Usulan:** CSS: format angka singkat (mis. 1,2 jt / 3,4 M) untuk kolom sempit + tooltip angka penuh; atau `overflow: hidden; text-overflow: ellipsis`.
- **Scope:** Frontend CSS saja. Perlu uji di beberapa lebar layar.

### A5. Akun Center (Kelola Anggota, Ganti Password, Tema, Login/Logout jadi satu)
- **Diagnosis:** Saat ini tersebar: `akun.js` (kelola anggota), `sandi.js` (ganti password), tema di pengaturan, logout tidak jelas.
- **Usulan:** Satu halaman/panel "Akun" dengan tab atau seksi: Profil, Kelola Anggota, Ganti Password, Tema (light/dark), tombol Keluar. Ini perubahan navigasi, bukan logika.
- **Scope:** Frontend. Perlu persetujuan desain dari pemilik (tab vs satu halaman panjang).

---

## B. Accounting (9 item)

### B1. Kelola Anggota — tombol Hapus Anggota
- Sama seperti A2. Cek dulu apakah backend dbacc punya hard delete atau hanya deactivate.
- **Scope:** Frontend + (kemungkinan) backend.
- **Pertanyaan untuk pemilik:** sama dengan A2.

### B2. Menu Kelola Anggota (Tambah Anggota Baru) — rapikan kolom
- **Diagnosis:** Form tambah anggota kolomnya tidak rapi (kemungkinan label/input tidak sejajar, spacing tidak konsisten).
- **Usulan:** Samakan dengan pola form di menu lain (label kiri/input kanan atau stacked konsisten), perbaiki spacing.
- **Scope:** Frontend CSS/HTML. Butuh screenshot "sebelum" sebagai acuan.

### B3. Pengaturan → Chart of Accounts — tombol hapus akun
- **Diagnosis:** Terkonfirmasi: tidak ada tombol hapus di `menu-pengaturan.js`.
- **Usulan:** Tambah tombol hapus per akun + konfirmasi. **Risiko:** akun yang sudah dipakai di jurnal/transaksi tidak boleh dihapus sembarangan → backend harus tolak (atau arsipkan) bila akun masih direferensikan.
- **Scope:** Frontend + backend (validasi referensi).
- **Pertanyaan untuk pemilik:** Akun terpakai dihapus → tolak, atau arsipkan (sembunyikan)?

### B4. Aset Tetap — tombol "Hapus Aset"
- **Diagnosis:** Terkonfirmasi: tidak ada tombol hapus di `menu-asettetap.js`.
- **Usulan:** Sama seperti B3 — tombol hapus + konfirmasi + validasi backend (aset yang sudah disusutkan/dijual?).
- **Scope:** Frontend + backend (validasi).

### B5. Jelaskan dan uji grafik Beranda — Laporan Laba Rugi
- **Diagnosis:** Grafik ADA (`barLineChart` 12 bulan: pendapatan, beban, laba bersih di `menu-dashboard.js:73-80`). Pemilik minta penjelasan + pengujian.
- **Usulan:** (1) Dokumen singkat: dari mana datanya (endpoint?), cara baca grafik; (2) uji dengan data nyata: cocokkan angka grafik vs laporan laba rugi di menu Laporan.
- **Scope:** Investigasi + dokumen. Bukan perubahan kode kecuali ditemukan bug.

### B6. Akun Center
- Sama seperti A5, diterapkan di Accounting.

### B7. Tampilan mobile berantakan — rapikan UI/UX
- **Diagnosis:** Perlu audit per halaman di viewport mobile (tabel lebar, form, sidebar).
- **Usulan:** Fase tersendiri: (1) screenshot tiap menu di 360px; (2) perbaiki yang paling parah dulu (tabel → card/scroll horizontal); (3) uji ulang.
- **Scope:** Frontend CSS. Ini pekerjaan besar — usulkan dikerjakan setelah item fungsional selesai.

### B8. Multi Perusahaan — pilih perusahaan dengan login berbeda-beda
- **Diagnosis:** Saat ini ganti perusahaan kemungkinan hanya ganti konteks dalam satu sesi login.
- **Usulan:** Perlu dipahami dulu maksud pemilik: apakah tiap perusahaan = akun login terpisah? Atau satu akun bisa akses banyak perusahaan tapi harus login ulang tiap ganti? Ini perubahan alur auth — **butuh klarifikasi**.
- **Scope:** Frontend + backend (auth). **Pertanyaan untuk pemilik:** jelaskan alur yang diinginkan langkah per langkah.

### B9. Tema light/dark — font tidak stabil, warna samar/kurang jelas
- **Diagnosis:** Kemungkinan variabel CSS tema tidak konsisten (beberapa elemen pakai warna hardcoded, bukan `var(--...)`), atau kontras tidak memenuhi standar.
- **Usulan:** (1) Audit: cari warna hardcoded di CSS; (2) ganti dengan variabel tema; (3) uji kontras di kedua tema.
- **Scope:** Frontend CSS.

---

## C. Claisrox (6 item)

### C1. Tombol menu Login & Logout
- Sama seperti A1. Cek `js/core/nav.js`.

### C2. Kelola Anggota — tombol Hapus Anggota
- Sama seperti A2. Cek backend claisrox: hard delete atau deactivate.

### C3. Akun Center
- Sama seperti A5, diterapkan di Claisrox.

### C4. Logo PDF putih tidak terlihat — ganti hitam
- **Diagnosis:** PDF dibuat via `window.print()` (`js/core/print.js`), logo diambil dari `APP_CONFIG.logoPath` — file logonya sendiri berwarna putih, jadi di kertas putih tidak terlihat.
- **Usulan:** Sediakan varian logo hitam (`logo-print.png`) khusus untuk cetak, atau CSS print `filter: invert(1)` pada logo. Varian file lebih aman (hasil pasti).
- **Scope:** Frontend + 1 file gambar.

### C5. Hasil PDF — hapus keterangan yang tidak mendukung
- **Diagnosis:** Perlu daftar konkret: keterangan mana yang harus dihapus di menu apa.
- **Usulan:** Minta pemilik tandai contoh PDF (coret bagian yang tidak perlu), lalu hapus dari template `print.js` per menu.
- **Scope:** Frontend. **Pertanyaan untuk pemilik:** kirim contoh PDF yang sudah ditandai.

### C6. Desain tampilan mobile — UI/UX
- Sama seperti B7, diterapkan di Claisrox. Usulkan setelah item fungsional.

---

## Usulan Urutan Eksekusi

| Gelombang | Isi | Alasan |
|-----------|-----|--------|
| 1 | A1, A3, A4, C1, C4 | Kecil, jelas, tidak butuh keputusan pemilik |
| 2 | A2, B1, B3, B4, C2 (tombol hapus) | Butuh keputusan: hapus permanen vs nonaktifkan + validasi backend |
| 3 | A5, B6, C3 (akun center) | Perubahan navigasi, butuh persetujuan desain |
| 4 | B2, B5, B9, C5 | Perlu input pemilik (screenshot, contoh PDF, penjelasan) |
| 5 | B7, C6 (mobile), B8 (multi-perusahaan) | Besar / butuh klarifikasi alur |

## Pertanyaan Terbuka untuk Pemilik

1. Hapus anggota/akun/aset = hapus permanen atau nonaktifkan/arsipkan? (A2, B1, B3, B4, C2)
2. Akun terpakai di jurnal → tolak hapus atau arsipkan? (B3)
3. Desain akun center: tab atau satu halaman? (A5, B6, C3)
4. Alur multi-perusahaan yang diinginkan, langkah per langkah (B8)
5. Contoh PDF yang sudah ditandai bagian tidak perlu (C5)
6. Screenshot bagian mobile yang paling berantakan menurut pemilik (B7, C6)
