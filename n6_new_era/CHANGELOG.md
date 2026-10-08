# Changelog N6 New Era
Format: Keep a Changelog.

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
