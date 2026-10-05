# KNOW.md — Pemahaman Repo Apk-Final

> Ditulis 2026-10-05 setelah membaca seluruh struktur repo (5 aplikasi, README masing-masing,
> config, backend entry point, dan riwayat git). Dipakai sebagai rujukan kerja berikutnya.

## Gambaran umum

Repo `onepercentclass/Apk-Final` adalah **monorepo berisi 5 aplikasi web bisnis**, semuanya dibangun
dengan pola arsitektur yang sama:

| Folder | Nama aplikasi | Jenis usaha |
|---|---|---|
| `Haylen/` | Haylen — AquaFlow Swimming School | Sekolah renang (member, coach, jadwal kelas, program, fasilitas, transaksi, absensi, laporan) |
| `N6/` | N6 Split5 | Bisnis kepelatihan olahraga — 5 dashboard peran: owner, admin, headcoach, coach, client (atlet, jadwal, program, pricing, komisi, tiket, pesan, monitoring, keuangan, laporan) |
| `DB Acounting/` | DB Accounting | Akuntansi umum — 13 menu: dashboard, jurnal, kas/bank, penjualan, pembelian, persediaan, aset tetap, pajak, laporan, kontak, perusahaan, transaksi, pengaturan |
| `DB Finance/` | DB Track (di README disebut "Claisrox (DB Track)", pecahan dari `FinTrack.html`) | Keuangan pribadi — beranda, transaksi, anggaran, rekening, laporan, investasi, tagihan, tujuan, pengaturan |
| `claisrox/` | Claisrox | Operasional bisnis produksi (kuliner/F&B — ada modul resep, produksi, bahan baku, cetak resi/label/lembar produksi): beranda, produk, bahan-baku, resep, produksi, supplier, customer, penjualan, pembelian, online, laporan, keuangan |

## Pola arsitektur bersama (berlaku untuk kelimanya)

1. **Frontend vanilla** — HTML + CSS + JS murni, tanpa framework. File statis, dijalankan lewat
   `python -m http.server` (atau `npx serve`). Tidak perlu build (kecuali N6 yang punya skrip build).
2. **localStorage-first** — `USE_API: false` adalah default di semua `js/config.js`; aplikasi
   jalan penuh offline di browser. Backend opsional, dinyalakan lewat `USE_API: true`.
3. **Backend FastAPI + PostgreSQL + JWT** — tiap aplikasi punya `backend/` sendiri:
   `app/main.py`, `config.py`, `database.py`, `models.py`, `security.py`, `routers/`,
   `requirements.txt`, `.env.example`, (+ `Dockerfile`/`docker-compose.yml` di sebagian).
   Tabel dibuat otomatis saat start (`Base.metadata.create_all`); claisrox mencatat:
   untuk produksi sebaiknya pakai migrasi Alembic.
4. **Sistem tier (hak akses)** — konsep inti yang dipakai semua aplikasi:
   - Tier **lebih kecil = akses lebih luas**; tier 0 selalu Owner (akses semua).
   - Aturan file JSON tier di-**mirror** antara frontend (`js/.../tiers*.json`) dan backend
     (`backend/tiers/*.json`); kalau diubah satu sisi, sisi lain harus ikut (atau aktifkan API
     agar frontend memuat dari endpoint `/api/tiers/{n}`).
   - Contoh pembagian: Haylen = Owner(0)/Admin(1)/Coach(2); N6 = owner(0)/admin(1)/
     headcoach(2)/coach(3)/client(4); DB Accounting = Owner/Admin/Staff/Viewer;
     claisrox = Owner/Manager/Staf Produksi & Gudang/Kasir & Toko Online.
5. **Satu domain API bersama** — `API_BASE` default di semua config mengarah ke
   `https://n6sport.id/api`.
6. **Akun owner otomatis** — dibuat saat backend pertama jalan, dari variabel `.env`
   (`OWNER_PASSWORD` / `JWT_SECRET` + `DATABASE_URL`).
7. **Struktur frontend seragam** — `index.html` + `css/` (satu file per fungsi) +
   `js/core/` (config, api, storage, access, ui, utils, ...) + `js/menu/` atau
   `js/menus/` (**satu file JS = satu menu sidebar**) + `assets/`.

## Catatan per aplikasi

- **Haylen**: commit terakhir ("new era") merestrukturisasi `Haylen/Haylen/*` → `Haylen/*`.
  Tier aktif default 0 (Owner), user demo "Budi Santoso".
- **N6**: hasil split 5 file HTML monolit (`admin/owner/headcoach/coach/client.html`) jadi proyek
  modular; ada `tools/split/*.ps1` (jejak provenance) dan `tools/build.ps1` untuk rebuild
  bundle `js/dist/<role>.js` (terverifikasi byte-identical). Entry point tunggal:
  `index.html?role=owner|admin|headcoach|coach|client`. CDN: jsPDF, AutoTable, Chart.js, html2canvas.
- **DB Accounting**: satu-satunya perubahan kode vs HTML asli yang disengaja: lapisan simpan
  diganti localStorage (`core-store.js`), auth localStorage (`core-auth.js`), dan filter tier
  di sidebar (`core-shell.js`, `boot.js`). Ada `tiers/tier-0..3.json`.
- **DB Finance**: ES module (wajib via http server, tidak bisa `file://`). Punya modul export
  (csv, pdf, backup). **Klarifikasi pemilik (2026-10-05)**: folder ini memang aplikasi finance
  (DB Track, pecahan `FinTrack.html`); judul "Claisrox (DB Track)" di README-nya salah nama —
  seharusnya "DB Finance". Isi/fungsi tidak tertukar, hanya judulnya.
- **claisrox**: satu-satunya yang skrip klasik (bukan ES module) agar `onclick` dan `file://`
  tetap jalan. Punya `css/print/` (resi, label, lembar produksi, laporan) → dipakai untuk
  operasional cetak. Item transaksi & bahan resep disimpan sebagai JSONB di baris induk.
  Ada `backend/tests/test_access.py` dan `scripts/create_user.py`.

## Riwayat git (per 2026-10-05)

- `fc23b53` — "first commit"
- `d3ff43c` — "new era" (HEAD): restrukturisasi folder Haylen.

## Unified backend (2026-10-05)

Atas permintaan user, dibangun **1 backend gabungan** di `unified-backend/`
(FastAPI, 124 endpoint, 23/23 uji lolos via TestClient mode SQLite).
Rancangan: 1 database PostgreSQL dengan 5 schema (`haylen`, `n6`, `dbacc`, `dbfin`, `clx`);
namespace `/api/haylen`, `/api/n6/v1`, `/api/dbacc`, `/api/dbfin`, `/api/claisrox`;
1 JWT (klaim `app` mengisolasi token antar aplikasi) + bcrypt untuk semua.
Perubahan penting: auth DB Accounting ditulis ulang total (dulu SHA-256 +
token dummy `"dev-token"` + tier dari header `X-Tier` — tidak aman);
bug DB Finance diperbaiki (`TIERS_DIR` rusak, judul "Claisrox API");
bug N6 diperbaiki (`TIER_ADMIN` tidak diimpor di schemas/account.py).
Hash & token lama tidak berlaku — user lama harus dibuat ulang
(owner auto-seed dari `.env`). Frontend tiap aplikasi cukup ubah 1 baris
`API_BASE` ke namespace barunya. Push repo ini: `~/workspace/github-push.sh`
(kredensial `custom.github-apkfinal`; token lama Anonimz7 tidak bisa push ke sini).

## Implikasi untuk kerja berikutnya

- Semua aplikasi **bisa langsung dibuka dan dites tanpa backend** (localStorage) — cukup
  `python3 -m http.server` di folder aplikasinya.
- Kalau mau mengaktifkan backend: butuh PostgreSQL + isi `.env` dari `.env.example`,
  lalu `USE_API: true` di `js/config.js`.
- Perubahan tier/akses harus sinkron frontend ↔ backend (file JSON kembar).
- Untuk N6, perubahan JS per-role harus lewat fragmen `js/modules/<role>/` lalu rebuild
  via `tools/build.ps1 -Check` (lingkungan Windows/PowerShell).
