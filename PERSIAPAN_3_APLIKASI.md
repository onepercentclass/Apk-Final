# Persiapan Perbaikan 3 Aplikasi — DB Finance, DB Accounting, Claisrox

Sumber: `bug_apk.txt` dari pemilik (2026-10-09).
Repo: `~/workspace/Apk-Final/` — folder `DB Finance/`, `DB Acounting/`, `claisrox/`.

---

## 1. DB Finance (DB Tracker)

| # | Bug | Kategori |
|---|-----|----------|
| F1 | Tombol menu Login & Logout | Auth UI |
| F2 | Kelola Anggota: buatkan tombol Hapus Anggota | CRUD anggota |
| F3 | Kolom Kelola Anggota (Total, Aktif, Non-Aktif) tidak berfungsi | Stats |
| F4 | Desain UI/UX: nominal besar angka keluar kolom | Layout |
| F5 | Account center: Kelola Anggota, Ganti Password, Tema light/dark, Login/Logout jadi satu | Fitur gabungan |

## 2. DB Accounting

| # | Bug | Kategori |
|---|-----|----------|
| A1 | Kelola Anggota: tombol Hapus Anggota | CRUD anggota |
| A2 | Kelola Anggota: Tambah Anggota Baru + rapikan kolom | CRUD + layout |
| A3 | Pengaturan → Chart of Accounts: tombol hapus akun | CRUD akun |
| A4 | Aset Tetap: tombol "Hapus Aset" | CRUD aset |
| A5 | Jelaskan & uji grafik laporan laba rugi di Beranda | Verifikasi |
| A6 | Account center (sama seperti F5) | Fitur gabungan |
| A7 | Tampilan mobile berantakan — rapikan UI/UX | Responsif |
| A8 | Multi Perusahaan: pilih perusahaan dengan login berbeda | Auth/konteks |
| A9 | Tema light/dark: font tidak stabil, warna samar | Tema |

## 3. Claisrox

| # | Bug | Kategori |
|---|-----|----------|
| C1 | Tombol menu Login & Logout | Auth UI |
| C2 | Kelola Anggota: tombol Hapus Anggota | CRUD anggota |
| C3 | Account center (sama seperti F5) | Fitur gabungan |
| C4 | PDF: logo harus hitam bukan putih (tidak terlihat) | PDF |
| C5 | PDF: banyak keterangan tidak mendukung, harus dihapus | PDF |
| C6 | Desain tampilan mobile — UI/UX | Responsif |

---

## Pola umum (dikerjakan sekali, dipakai 3 aplikasi)

1. **Account Center** (F5/A6/C3): satu halaman berisi Kelola Anggota + Ganti Password + Tema + Login/Logout.
   - N6 sudah punya pola Kelola Anggota & Ganti Password — bisa diadopsi.
2. **Tombol Hapus Anggota** (F2/A1/C2): pola sama di 3 aplikasi.
3. **Login/Logout menu** (F1/C1): pola sama.

## Urutan kerja yang disarankan

**Fase 1 — Pola bersama:**
- Account Center (1x desain, 3x implementasi)
- Hapus Anggota (3 aplikasi)
- Login/Logout menu (Finance & Claisrox)

**Fase 2 — DB Finance spesifik:**
- Stats anggota (F3), layout nominal (F4)

**Fase 3 — DB Accounting spesifik:**
- Tambah anggota + kolom (A2), hapus akun CoA (A3), hapus aset (A4)
- Grafik laba rugi (A5), multi-perusahaan (A8), tema (A9), mobile (A7)

**Fase 4 — Claisrox spesifik:**
- PDF logo hitam (C4), PDF keterangan (C5), mobile (C6)

## Yang perlu dikonfirmasi sebelum mulai

1. Apakah "DB Tracker" = folder `DB Finance/`? (nama folder vs nama di bug list)
2. Untuk A8 (multi perusahaan login berbeda): apakah tiap perusahaan punya user terpisah?
3. Untuk C4/C5 (PDF): menu mana saja yang generate PDF?
4. Prioritas: apakah Fase 1 dulu, atau ada bug yang lebih urgent?
