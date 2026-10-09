# DB Accounting — Modular

Hasil pemecahan `db-accounting.html` menjadi struktur modular
**tanpa mengubah UI/UX dan fitur** (CSS/JS hasil split identik dengan aslinya).

## Struktur

```
index.html                  # shell: head + css/js links + body markup
css/
  01-tokens.css             # variabel :root + tema terang/gelap
  02-base.css               # reset, body, scrollbar
  03-sidebar.css            # sidebar + brand + navigasi
  04-topbar.css             # topbar + search + userchip
  05-auth.css               # layar auth + dropdown akun
  06-components.css          # tombol, kartu, grid, stat, tabel, badge, form, modal, tab, toast
  07-modules.css            # kartu perusahaan, pengingat, aksi cepat, jurnal, kv, banner
  08-polish.css             # UI refresh (bayangan, radius, tabel, dsb.)
  09-theme-fix.css          # perbaikan kontras tema + responsif
js/
  config.js                 # ★ SATU TEMPAT: USE_API, BASE_URL, CURRENT_TIER
  tiers.js                  # filter menu sidebar per tier (tier 0 = semua)
  api.js                    # klien https://n6sport.id/api (NONAKTIF saat ini)
  core-*.js                 # ikon, konstanta, state, tema, util, csv, store,
                            # auth, akuntansi, chart, modal, shell
  page-auth.js              # layar login/register
  menus/menu-*.js           # 1 file per menu sidebar (13 menu)
  boot.js                   # inisialisasi aplikasi
assets/
  logo.png                  # logo (kode tetap memakai DATA URI seperti semula)
tiers/
  tier-0.json               # ★ AKTIF: Owner — semua menu
  tier-1.json               # Admin — semua kecuali Pengaturan
  tier-2.json               # Staff — operasional harian
  tier-3.json               # Viewer/Auditor — baca saja
backend/                    # FastAPI + PostgreSQL (lihat backend/README.md)
```

## Cara pakai (frontend saja)

Tidak perlu build. Sajikan folder ini lewat HTTP lokal agar `fetch`
tier JSON dan operasi file berjalan normal:

```bash
# pilih salah satu
npx serve .
python -m http.server 5500
```

Lalu buka `http://localhost:5500/index.html`.
(Dibuka langsung via `file://` juga tetap jalan berkat fallback tier inline.)

## Mengganti tier aktif

1. Edit `js/config.js` → `CURRENT_TIER: 1` (misalnya).
2. Sidebar otomatis hanya menampilkan menu milik tier tersebut;
   rute di luar hak ditolak dengan toast.

## Menyalakan backend

1. Jalankan backend (lihat `backend/README.md`) hingga tersedia di
   `https://n6sport.id/api`.
2. Edit `js/config.js` → `USE_API: true`.
3. Muat ulang — data dibaca dari server, localStorage menjadi cache.

## Verifikasi split

Blok `<style>` asli terpartisi persis ke `css/01..09` (urutan link di
`index.html` menjaga kaskade), dan setiap blok `/* ==== */` pada
`<script>` asli pindah utuh ke file `js/`-nya masing-masing.
Satu-satunya perubahan kode yang disengaja dan terdokumentasi:

- `js/core-store.js` — lapisan simpan diganti localStorage (+ hook API
  nonaktif), nama fungsi tetap (`initDb/seedLocal/saveCompany/saveMeta`).
- `js/core-auth.js` (`loadAccount`/`saveAccount`) — akun disimpan di
  localStorage, bukan host `claude` yang hanya ada di lingkungan demo.
- `js/core-shell.js` (`renderSidebar`/`navigate`) + `js/boot.js` —
  filter tier (tier 0 = semua, output identik).
