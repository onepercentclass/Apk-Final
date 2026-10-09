# Changelog N6 New Era
Format: Keep a Changelog.

## [0.1.4] — 2026-10-09

### Fixed
- Laporan latihan client kini bisa dikirim (bug42): endpoint POST/GET /portal/training-logs ditambahkan, menu Laporan client berfungsi.
- Menu Jadwal Klien kini menampilkan daftar jadwal (bug43): endpoint GET /schedules/clients ditambahkan.

## [0.1.3] — 2026-10-09

### Fixed
- Harga kini tersimpan setelah disimpan (bug40): program baru tidak lagi terhapus oleh logika deletions di backend.
- Pengajuan cuti/reschedule coach kini bisa dikirim (bug41): endpoint POST /schedules/coach/requests ditambahkan.

## [Unreleased]

### Added
- Struktur folder awal (assets, css, js/core, js/ui, js/shared, js/roles)
- MENU_MAP.md — peta menu aplikasi lama
- design_vnpc.md — desain hasil Phase 1

### Fixed
- Layar login kini tampil dengan benar; sebelumnya halaman kosong saat belum login dan tetap kosong setelah login berhasil.
- Sesi yang kedaluwarsa kini mengembalikan pengguna ke layar login; sebelumnya pengguna terjebak di halaman dengan seluruh panggilan API gagal.
- Chat untuk role client kini memakai endpoint portal yang benar.
- Ubah harga kini menyimpan lewat `PUT /pricing` dengan data utuh; sebelumnya memakai endpoint per-id yang tidak ada.
- Daftar pesan, tiket, jadwal, harga, dan formulir kini memiliki gaya tampilan lengkap; sebelumnya tampil polos tanpa CSS.

## [0.1.2] - 2026-10-09

### Fixed
- Splash boot tidak lagi flash terang di dark mode (tema diterapkan sebelum splash dirender).
- Hapus assignment `appEl.hidden = false` yang ganda di boot.
- Hapus fungsi `todayISO()` yang tidak terpakai.
- Hapus cabang baca `n6:theme` yang tidak pernah ditulis (tema kini murni mengikuti preferensi OS).
- Jadwal Coach: owner/admin kini memilih coach dari dropdown (mengirim `coach_id` yang wajib); coach langsung melihat jadwalnya sendiri.
- Jadwal Klien: menampilkan empty state yang jelas (backend belum menyediakan endpoint).
- Keuangan: ringkasan "Pendapatan per Kategori" kini terbaca dari `revenue_by_category`; form "Catat Pengeluaran" memakai modal (bukan `prompt()`).
- Pesan: tambah pemilih kontak; kirim memakai field `body` (bukan `text`); pesan error validasi tidak lagi tampil sebagai "[object Object]".
- Beranda coach: kartu "Klien Aktif" kini membaca `clients.aktif` dari API.
- Beranda owner: kartu "Pendapatan" kini membaca `revenue` dari API.
- Harga: tambah tombol "Tambah Harga" dengan modal form; edit harga memakai modal (bukan `prompt()`).
- Absensi coach: backend mengizinkan coach melihat riwayat pengajuannya sendiri (permission `requests_view` baru).
- Laporan client: pesan error lebih jelas saat backend belum mendukung kirim laporan.

## [0.1.1] - 2026-10-08

### Fixed
- Badge merah kini terbaca di tema gelap (kontras 6.56:1; sebelumnya 2.38:1).
- Fokus keyboard kini terkurung di dalam dialog modal.

## [0.1.0] - 2026-10-08

### Fixed
- Teks tombol utama, tombol bahaya, dan notifikasi kini terbaca di tema gelap (kontras 6.56–9.08:1; sebelumnya 1.72–2.38:1).
- Badge merah kini memakai background solid agar kontrasnya lolos (5.01:1).
- Tombol aksi di tabel dan tiket kini setinggi 44px sesuai target sentuh minimal.
- Logo di layar login kini memakai versi putih saat tema gelap.
