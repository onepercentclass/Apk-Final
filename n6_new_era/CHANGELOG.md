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
