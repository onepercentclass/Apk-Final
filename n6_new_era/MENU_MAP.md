# Peta Menu N6 (Aplikasi Saat Ini)

Acuan sebelum menulis VNPC. Hanya daftar elemen yang ada — tanpa analisis.
Sumber: `js/views/*.js` dan `js/modules/*/` per 2026-10-08.

---

## OWNER (11 menu)

- **Beranda**: Revenue Overview, Pertumbuhan Klien
- **Klien**: Semua Klien, Klien Terarsip, Edit, Hapus, Pulihkan, Hapus Permanen, Edit Data, Buka Chat, Unduh Invoice (JPG), Salin Link Dashboard Client
- **Jadwal Klien**: Jadwal & Paket Program Klien
- **Jadwal Coach**: Jadwal Coach, Ketersediaan Coach, Edit, Hapus, Unduh Jadwal (JPG)
- **Harga & Program**: Daftar Harga Program N6, Edit
- **Performa & Komisi**: Performa & Pembayaran Tiap Coach, Komisi per Program, Atur, Koreksi Status, Dibayar
- **Keuangan**: Pendapatan per Kategori Program, Catatan Pengeluaran, Hapus
- **Tiket & Keluhan**: Tiket & Keluhan Klien, Tindak Lanjuti, Chat Klien, Hapus
- **Pesan**: Percakapan dengan Klien
- **Kelola Anggota**: (dinamis — daftar akun, tier, aktif/nonaktif)
- **Ganti Password**: form ganti password

## ADMIN (8 menu)

- **Beranda**: Analitik Operasional, Pendaftaran menurut periode, Distribusi status klien, Atur Batas Indikator, Perlu Perhatian, Coach Kosong Hari Ini
- **Klien**: Semua Klien, Klien Terarsip (+ aksi seperti owner)
- **Jadwal Klien**: Jadwal & Paket Program Klien
- **Jadwal Coach**: Jadwal Coach, Ketersediaan Coach
- **Daftar Harga**: Daftar Harga Program N6
- **Tiket & Keluhan**: Tiket & Keluhan Klien
- **Pesan**: Percakapan dengan Klien
- **Ganti Password**: form ganti password

## HEAD COACH (9 menu)

- **Beranda**: Tren Volume Latihan & Kepatuhan, Progres Seluruh Klien, Prioritas Minggu Ini, Distribusi Status Program, Aktivitas Terbaru
- **Buat Program**: Identitas & Target Klien, Persentase Pace & HR, Pilih Template Program Lari, Lengkapi & Kirim ke Admin/CS, Riwayat Program Terkirim, Template Program Lari, Daftar Template Program
- **Monitoring Klien**: Manajemen & Prioritas Klien, Grafik Distribusi Kondisi Klien, Ringkasan Klien, Log Latihan Tercatat
- **Pesan**: Percakapan
- **Coach**: Daftar Coach, Kalender Jadwal Coach & Klien 30 Hari, Absensi Seluruh Coach, Absensi & Perizinan Coach, Catat Absensi Coach, Riwayat Absensi
- **Klien**: Penilaian Kondisi Klien, Semua Klien, Klien Bermasalah & Cedera
- **Koreksi**: Hasil Latihan Klien, Hari Ini, Pengajuan Reschedule, Pengajuan Cuti Coach, Template Kata Koreksi, Daftar Template
- **Atlet Binaan**: Podium Musim Ini, Daftar Atlet Binaan, Prestasi & Hasil Lomba
- **Ganti Password**: form ganti password

## COACH (5 menu)

- **Beranda**: Pencapaian & Performa Klien, Klien Capai Target per Bulan, Tren Performa Klien, Status Klien Bermasalah & Cedera, Tingkat Profesional Coach, Score & Rating Coach
- **Klien**: Daftar Klien, Progress Klien Menuju Target, Rapor Klien, Input Log Latihan Baru, Riwayat Log Terbaru
- **Informasi**: Riwayat Aktivitas, Rincian Gaji per Sesi, Rapor Evaluasi dari Head Coach
- **Absensi**: Ajukan Reschedule Sesi, Riwayat Pengajuan, Ajukan Cuti, Riwayat Cuti, Tandai Waktu Tidak Bisa Mengajar, Daftar Waktu Tidak Tersedia
- **Ganti Password**: Riwayat Latihan, Grafik, Detail Gaji Sesi

## CLIENT (3 tab)

- **Laporan**: Kirim Laporan Latihan, Riwayat Laporan, Info Program
- **Performa**: Grafik Performa, Kalender
- **Chat**: Chat dengan Head Coach
- **Profil**: (menu akun) Ganti Password, Keluar

---

## Catatan duplikasi antar role (observasi, bukan rekomendasi)

- Jadwal Coach: owner + admin (modul `jadwal-coach-export.js` identik di keduanya)
- Klien: owner + admin + headcoach + coach (4 versi)
- Pesan/Chat: owner + admin + headcoach + client
- Ganti Password: semua 5 role
- Beranda: semua role, isi berbeda
