# Alur Pengguna — N6 New Era

Skenario end-to-end per role, disusun dari MENU_MAP.md.
Gaya VNPC: top-down, langkah bernomor, tiap alur menyebut penanganan gagal.
File ini bagian dari desain Phase 1.

---

## OWNER

### O1. Memantau pendapatan

1. Owner login → mendarat di Beranda.
2. Membaca kartu Revenue Overview (hari ini, bulan ini).
3. Membaca grafik Pertumbuhan Klien.
4. Gagal muat → tampilkan pesan + tombol Coba Lagi.
5. Selesai; tidak ada aksi lanjutan wajib.

### O2. Menambah klien baru

1. Owner membuka menu Klien → menekan Tambah Klien.
2. Mengisi nama, kontak, program → menekan Simpan.
3. Sistem mengirim POST /clients.
4. Gagal (401/422/500) → tampilkan pesan spesifik + tombol Coba Lagi,
   data form tidak hilang.
5. Berhasil → klien muncul di daftar Semua Klien + toast konfirmasi.

### O3. Mengatur jadwal coach

1. Owner membuka Jadwal Coach → melihat kalender 30 hari.
2. Memeriksa Ketersediaan Coach untuk slot kosong.
3. Menekan Export → mengunduh JPG jadwal.
4. Export gagal → toast "Gagal mengunduh" + tombol ulangi.

### O4. Menangani tiket keluhan

1. Owner membuka Tiket & Keluhan → daftar tiket terbuka.
2. Memilih tiket → membaca isi keluhan.
3. Menekan Tindak Lanjuti → menulis respon → kirim.
4. Atau menekan Chat Klien → pindah ke Percakapan dengan konteks tiket.
5. Tiket ditandai selesai → hilang dari daftar aktif.

---

## ADMIN

### A1. Memantau operasional harian

1. Admin login → mendarat di Beranda.
2. Membaca panel Perlu Perhatian (daftar hal yang butuh tindakan).
3. Membaca Coach Kosong Hari Ini.
4. Menekan item perhatian → diarahkan ke menu terkait.

### A2. Mengelola klien dan jadwal

1. Alur sama dengan O2 dan O3 (modul berbagi di js/shared/).
2. Perbedaan: admin tidak melihat menu Keuangan dan Komisi.

---

## HEAD COACH

### H1. Membuat program latihan (wizard)

1. Head coach membuka Buat Program.
2. Langkah 1: mengisi Identitas & Target Klien.
3. Langkah 2: mengatur Persentase Pace & HR.
4. Langkah 3 (opsional): memilih Template Program Lari.
5. Menekan Kirim → program terkirim ke Admin/CS.
6. Gagal kirim → draf tersimpan lokal, tampilkan tombol Kirim Ulang.
7. Berhasil → masuk Riwayat Program Terkirim.

### H2. Monitoring dan koreksi hasil latihan

1. Head coach membuka Monitoring Klien.
2. Membaca Grafik Distribusi Kondisi Klien + Ringkasan Klien.
3. Membuka Log Latihan Tercatat milik seorang klien.
4. Menulis koreksi → memakai Template Kata Koreksi bila perlu → kirim.
5. Koreksi tercatat di Hasil Latihan Klien.

### H3. Menyetujui reschedule dan cuti (lintas role)

1. Head coach membuka Koreksi → Pengajuan Reschedule / Pengajuan Cuti Coach.
2. Membaca detail pengajuan (siapa, kapan, alasan).
3. Menyetujui → jadwal diperbarui, pengaju mendapat notifikasi.
4. Menolak → wajib mengisi alasan, pengaju mendapat notifikasi.
5. Lihat skenario X1 untuk alur lengkap lintas role.

### H4. Mencatat absensi coach

1. Head coach membuka Coach → Catat Absensi Coach.
2. Memilih coach, tanggal, status hadir/tidak.
3. Menyimpan → masuk Riwayat Absensi + Absensi Seluruh Coach.

---

## COACH

### C1. Menginput log latihan klien

1. Coach membuka Klien → memilih seorang klien.
2. Membaca Progress Klien Menuju Target + Rapor Klien.
3. Menekan Input Log Latihan Baru → mengisi hasil sesi → simpan.
4. Gagal simpan → data tidak hilang, tombol Coba Lagi.
5. Berhasil → masuk Riwayat Log Terbaru.

### C2. Mengajukan reschedule atau cuti

1. Coach membuka Absensi → Ajukan Reschedule Sesi / Ajukan Cuti.
2. Mengisi tanggal, sesi, alasan → kirim.
3. Pengajuan masuk antrean head coach (skenario H3).
4. Coach memantau status di Riwayat Pengajuan.
5. Lihat skenario X1 untuk alur lengkap lintas role.

### C3. Melihat informasi gaji dan evaluasi

1. Coach membuka Informasi.
2. Membaca Rincian Gaji per Sesi + Rapor Evaluasi dari Head Coach.
3. Layar ini read-only; tidak ada aksi.

---

## CLIENT

### K1. Mengirim laporan latihan

1. Client membuka link dashboard (tanpa login manual bila token valid).
2. Membuka tab Laporan → menekan Kirim Laporan Latihan.
3. Mengisi hasil latihan → kirim.
4. Gagal kirim → draf tersimpan, tombol Kirim Ulang.
5. Berhasil → masuk Riwayat Laporan.

### K2. Melihat performa

1. Client membuka tab Performa.
2. Membaca Grafik Performa + Kalender latihan.
3. Data kosong (klien baru) → empty state "Belum ada data latihan".

### K3. Chat dengan head coach

1. Client membuka tab Chat.
2. Menulis pesan → terkirim real-time (atau polling bila offline).
3. Gagal kirim → pesan ditandai gagal + tombol kirim ulang.

---

## LINTAS ROLE

### X1. Reschedule sesi (coach → head coach → jadwal)

1. Coach mengajukan reschedule (C2): sesi A tanggal X → tanggal Y.
2. Pengajuan tercatat dengan status "menunggu".
3. Head coach menerima di Pengajuan Reschedule (H3).
4. Disetujui → jadwal sesi A pindah ke tanggal Y untuk semua pihak
   yang melihat jadwal tersebut (coach, klien terkait).
5. Ditolak + alasan → coach menerima notifikasi penolakan.
6. Batas: pengajuan untuk sesi yang sudah lewat ditolak sistem otomatis.

### X2. Tiket keluhan (pelapor → owner/admin)

1. Pelapor (klien/coach) membuat tiket: subjek + isi.
2. Tiket masuk daftar Tiket & Keluhan (owner, admin).
3. Owner/admin menindaklanjuti (O4): respon atau chat langsung.
4. Tiket selesai → arsip, tidak muncul di daftar aktif.

---

## Catatan untuk desain

1. Setiap skenario di atas harus dapat dipetakan ke tepat satu modul
   di js/shared/* atau js/<role>/ sesuai design_vnpc.md bagian 13.
2. Skenario X1 dan X2 adalah satu-satunya alur yang menyentuh lebih
   dari satu role; keduanya dikoordinasikan via backend, bukan via
   komunikasi langsung antar modul frontend.
3. Aturan satu aksi utama per layar (aturan 12): layar pengajuan hanya
   berisi pengajuan; riwayat selalu di tab sekunder.
