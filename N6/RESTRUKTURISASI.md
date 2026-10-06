# Restrukturisasi N6 — Peta Analisis

> Dibuat: 2026-10-06 | Status: PERENCANAAN (belum dieksekusi)
> Fokus: N6 dulu, 4 aplikasi lain menyusul dengan pola yang sama.

---

## 1. Struktur Saat Ini

```
N6/
├── index.html              # Entry point
├── README.md
├── .env.example
├── assets/img/             # Logo (11 file, nama tidak konsisten)
├── css/                    # Stylesheet
├── js/
│   ├── app.js              # Bootstrap
│   ├── account-ui.js       # UI akun
│   ├── core/               # 12 file shared (api, env, storage, router, dll)
│   │   ├── access.js
│   │   ├── api.js
│   │   ├── bundles.js      # ← Daftarkan script per role
│   │   ├── config.js
│   │   ├── dom.js
│   │   ├── env.js
│   │   ├── events.js
│   │   ├── login.js
│   │   ├── registry.js
│   │   ├── router.js
│   │   ├── storage.js
│   │   └── tiers.js
│   ├── dist/               # 5 bundle HASIL BUILD (jangan edit manual!)
│   │   ├── admin.js        # ~70KB
│   │   ├── client.js
│   │   ├── coach.js
│   │   ├── headcoach.js    # ~70KB
│   │   └── owner.js        # ~100KB+
│   ├── modules/            # SOURCE per role (ini yang diedit)
│   │   ├── admin/          # _core.js + 9 modul menu
│   │   ├── client/
│   │   ├── coach/
│   │   ├── headcoach/      # _core.js + 5 extra-*.js
│   │   └── owner/          # _core.js + modul menu
│   ├── shared/             # 2 file dipakai lintas role
│   │   ├── coach-requests.js
│   │   └── n6-monthly-pdf-reports.js
│   └── views/              # 5 file (admin, client, coach, headcoach, owner)
├── tools/
│   ├── build.ps1           # ⚠️ PowerShell only, tidak jalan di Linux!
│   └── split/              # 8 script PowerShell (one-time split tool)
└── vendor/                 # (untracked, isi belum diaudit)
```

---

## 2. Masalah yang Ditemukan

### 🔴 KRITIS

| # | Masalah | Dampak | Lokasi |
|---|---------|--------|--------|
| 1 | **Build script hanya PowerShell** (`tools/build.ps1`) | Tidak bisa rebuild `dist/` di Linux/VPS. Akibatnya `dist/` diedit manual → source of truth ganda | `tools/build.ps1` |
| 2 | **`dist/` diedit manual berkali-kali** | `modules/` dan `dist/` tidak sinkron. Build script (jika dijalankan) akan menimpa perbaikan manual atau error mismatch | `js/dist/*.js` |
| 3 | **Tidak ada build script Linux** | Deploy ke VPS harus manual copy file, rawan lupa | — |

### 🟡 SEDANG

| # | Masalah | Dampak | Lokasi |
|---|---------|--------|--------|
| 4 | **Nama file modul tidak konsisten** — ada `extra-1-*.js`, `extra-2-script.js`, `beranda.js`, `klien.js` | Sulit navigasi, tidak jelas urutan/prioritas | `js/modules/*/` |
| 5 | **Nama logo tidak konsisten** — `logo-black.png`, `logo-client-header.png`, `logo-print-hc.png`, dll | Sulit maintenance asset | `assets/img/` |
| 6 | **`tools/split/` sudah tidak relevan** — one-time migration tool, tapi masih di repo | Membingungkan contributor baru | `tools/split/` |
| 7 | **`vendor/` untracked & belum diaudit** | Tidak jelas isinya apa, risiko keamanan | `N6/vendor/` |

### 🟢 RINGAN

| # | Masalah | Lokasi |
|---|---------|--------|
| 8 | `know.md` di root Apk-Final tidak deskriptif | `Apk-Final/know.md` |
| 9 | `.env.example` mungkin outdated | `N6/.env.example` |

---

## 3. Rencana Restrukturisasi

### Fase A: Build Pipeline Linux (Prioritas Tertinggi)

**Tujuan:** Satu source of truth, bisa rebuild `dist/` di Linux.

| Aksi | Detail |
|------|--------|
| A1 | Buat `tools/build.sh` (bash) yang mereplikasi `tools/build.ps1` |
| A2 | Verifikasi output `build.sh` identik dengan `dist/` saat ini (byte-for-byte) |
| A3 | Tambahkan `tools/build.sh --check` ke pre-commit atau CI |
| A4 | Dokumentasikan di `N6/README.md`: "Jangan edit `dist/` manual, edit `modules/` lalu rebuild" |

**File yang disentuh:**
- BARU: `N6/tools/build.sh`
- EDIT: `N6/README.md`

**Path yang berubah:** Tidak ada (hanya tambah file baru)

---

### Fase B: Sinkronisasi `modules/` ← `dist/`

**Tujuan:** Pastikan semua perbaikan manual di `dist/` sudah masuk ke `modules/`.

**Masalah:** Kita sudah edit `dist/owner.js`, `dist/admin.js`, `dist/headcoach.js` manual berkali-kali. Perlu dipastikan `modules/` sudah mencerminkan semua perubahan.

| Aksi | Detail |
|------|--------|
| B1 | Audit diff: bandingkan setiap perubahan manual di `dist/` dengan `modules/` |
| B2 | Port semua perubahan yang belum ada di `modules/` |
| B3 | Jalankan `build.sh --check` untuk verifikasi sinkron |

**File yang diaudit:**
- `js/dist/owner.js` ↔ `js/modules/owner/*.js`
- `js/dist/admin.js` ↔ `js/modules/admin/*.js`
- `js/dist/headcoach.js` ↔ `js/modules/headcoach/*.js`
- `js/dist/coach.js` ↔ `js/modules/coach/*.js`
- `js/dist/client.js` ↔ `js/modules/client/*.js`

**Perubahan yang diketahui sudah di `dist/` tapi perlu verifikasi di `modules/`:**
- [ ] Fix `String(c.id)` comparison (owner, admin)
- [ ] `fetchCoachesFromApi()` helper (owner, admin)
- [ ] `window.n6ApiClients` exposure (headcoach)
- [ ] `adminRead()` prefer API data (headcoach extra-1)
- [ ] `openCoachForm`/`editCoach` redirect (owner)
- [ ] `syncClientsToApi()` (app.js)

---

### Fase C: Rename File Modul (Konsistensi)

**Tujuan:** Nama file yang jelas dan deskriptif. Hilangkan prefix `extra-N-` yang tidak bermakna.

**Konvensi penamaan baru:**
- Modul menu: `<nama-menu>.js` (contoh: `klien.js`, `jadwal.js`)
- Modul fitur khusus: `<nama-fitur>.js` (contoh: `monitoring.js`, `pdf-reports.js`)
- Modul tema/UI: `<nama>-theme.js`, `<nama>-ui.js`

#### C.1 — Owner (`js/modules/owner/`)

| # | Nama Lama | Nama Baru | Isi / Alasan |
|---|-----------|-----------|--------------|
| 1 | `_core.js` | `_core.js` | ✅ Tetap (konvensi: file inti) |
| 2 | `beranda.js` | `beranda.js` | ✅ Tetap (sudah deskriptif) |
| 3 | `extra-1-script.js` | `theme.js` | Set theme/appearance (22 baris, `setTheme`) |
| 4 | `extra-2-script.js` | `account-modal.js` | Kelola modal akun mobile (134 baris) |
| 5 | `extra-3-script.js` | `business-health.js` | `renderBusinessHealth` widget (41 baris) |
| 6 | `harga.js` | `harga.js` | ✅ Tetap |
| 7 | `jadwalcoach.js` | `jadwal-coach.js` | Konsisten: pakai strip |
| 8 | `jadwalklien.js` | `jadwal-klien.js` | Konsisten: pakai strip |
| 9 | `keuangan.js` | `keuangan.js` | ✅ Tetap |
| 10 | `klien.js` | `klien.js` | ✅ Tetap |
| 11 | `komisi.js` | `komisi.js` | ✅ Tetap |
| 12 | `manifest.js` | `manifest.js` | ✅ Tetap (konvensi build) |
| 13 | `pesan.js` | `pesan.js` | ✅ Tetap |
| 14 | `tiket.js` | `tiket.js` | ✅ Tetap |

#### C.2 — Admin (`js/modules/admin/`)

| # | Nama Lama | Nama Baru | Isi / Alasan |
|---|-----------|-----------|--------------|
| 1 | `_core.js` | `_core.js` | ✅ Tetap |
| 2 | `beranda.js` | `beranda.js` | ✅ Tetap |
| 3 | `extra-1-n6-owner-schedule-refresh.js` | `schedule-refresh.js` | Refresh jadwal dari Owner |
| 4 | `harga.js` | `harga.js` | ✅ Tetap |
| 5 | `jadwalcoach.js` | `jadwal-coach.js` | Konsisten: pakai strip |
| 6 | `jadwalklien.js` | `jadwal-klien.js` | Konsisten: pakai strip |
| 7 | `klien.js` | `klien.js` | ✅ Tetap |
| 8 | `manifest.js` | `manifest.js` | ✅ Tetap |
| 9 | `pesan.js` | `pesan.js` | ✅ Tetap |
| 10 | `tiket.js` | `tiket.js` | ✅ Tetap |

#### C.3 — Head Coach (`js/modules/headcoach/`)

| # | Nama Lama | Nama Baru | Isi / Alasan |
|---|-----------|-----------|--------------|
| 1 | `_core.js` | `_core.js` | ✅ Tetap |
| 2 | `atlet.js` | `atlet.js` | ✅ Tetap |
| 3 | `coach.js` | `daftar-coach.js` | Bedakan dari role `coach/` (ini daftar coach yang dikelola headcoach) |
| 4 | `extra-1-n6-hc-pro-engine.js` | `pro-engine.js` | Engine program/monitoring (renderHub, renderPrograms, renderMonitor) |
| 5 | `extra-2-script.js` | `monitoring-lanjutan.js` | `renderMonitorAdvanced` — monitoring klien versi detail |
| 6 | `extra-3-n6-weekly-builder.js` | `weekly-builder.js` | Builder program mingguan |
| 7 | `extra-4-script.js` | `coach-requests-ui.js` | `syncCoachRequests` — UI permintaan coach |
| 8 | `extra-5-m-manual-builder.js` | `manual-builder.js` | Builder program manual |
| 9 | `hub.js` | `hub.js` | ✅ Tetap |
| 10 | `klien.js` | `klien.js` | ✅ Tetap |
| 11 | `koreksi.js` | `koreksi.js` | ✅ Tetap |
| 12 | `manifest.js` | `manifest.js` | ✅ Tetap |

#### C.4 — Coach (`js/modules/coach/`)

| # | Nama Lama | Nama Baru | Isi / Alasan |
|---|-----------|-----------|--------------|
| 1 | `_core.js` | `_core.js` | ✅ Tetap |
| 2 | `extra-1-n6-coach-owner-theme.js` | `owner-theme.js` | Tema tampilan owner untuk coach |
| 3 | `extra-2-coach-account-dropdown.js` | `account-dropdown.js` | Dropdown akun |
| 4 | `home.js` | `home.js` | ✅ Tetap |
| 5 | `info.js` | `info.js` | ✅ Tetap |
| 6 | `jadwal.js` | `jadwal.js` | ✅ Tetap |
| 7 | `klien.js` | `klien.js` | ✅ Tetap |
| 8 | `manifest.js` | `manifest.js` | ✅ Tetap |

#### C.5 — Client (`js/modules/client/`)

| # | Nama Lama | Nama Baru | Isi / Alasan |
|---|-----------|-----------|--------------|
| 1 | `_core.js` | `_core.js` | ✅ Tetap |
| 2 | `chat.js` | `chat.js` | ✅ Tetap |
| 3 | `manifest.js` | `manifest.js` | ✅ Tetap |
| 4 | `performa.js` | `performa.js` | ✅ Tetap |

#### C.6 — Shared (`js/shared/`)

| # | Nama Lama | Nama Baru | Isi / Alasan |
|---|-----------|-----------|--------------|
| 1 | `coach-requests.js` | `coach-requests.js` | ✅ Tetap (sudah deskriptif) |
| 2 | `n6-monthly-pdf-reports.js` | `monthly-pdf-reports.js` | Hilangkan prefix `n6-` redundan |

#### C.7 — Core (`js/core/`)

| # | Nama Lama | Nama Baru | Isi / Alasan |
|---|-----------|-----------|--------------|
| 1 | `access.js` | `access.js` | ✅ Tetap |
| 2 | `api.js` | `api.js` | ✅ Tetap |
| 3 | `bundles.js` | `bundles.js` | ✅ Tetap |
| 4 | `config.js` | `config.js` | ✅ Tetap |
| 5 | `dom.js` | `dom.js` | ✅ Tetap |
| 6 | `env.js` | `env.js` | ✅ Tetap |
| 7 | `events.js` | `events.js` | ✅ Tetap |
| 8 | `login.js` | `login.js` | ✅ Tetap |
| 9 | `registry.js` | `registry.js` | ✅ Tetap |
| 10 | `router.js` | `router.js` | ✅ Tetap |
| 11 | `storage.js` | `storage.js` | ✅ Tetap |
| 12 | `tiers.js` | `tiers.js` | ✅ Tetap |

**Catatan:** `js/core/` sudah konsisten, tidak perlu rename.

#### C.8 — Views (`js/views/`)

| # | Nama Lama | Nama Baru | Alasan |
|---|-----------|-----------|--------|
| 1-5 | `admin.js`, `client.js`, `coach.js`, `headcoach.js`, `owner.js` | ✅ Tetap semua | Sudah deskriptif, map 1:1 ke role |

#### C.9 — Root JS

| # | Nama Lama | Nama Baru | Alasan |
|---|-----------|-----------|--------|
| 1 | `js/app.js` | `js/app.js` | ✅ Tetap (entry point) |
| 2 | `js/account-ui.js` | `js/account-ui.js` | ✅ Tetap (sudah deskriptif) |

---

**File yang harus diupdate setelah rename:**
1. `js/modules/*/manifest.js` — daftar file per role (5 file)
2. `js/core/bundles.js` — daftar script yang di-load (path `extra-*` → nama baru)
3. `tools/build.sh` (baru) — pastikan baca manifest yang sudah update

**Total file di-rename:** 15 file
**Total file diupdate (path reference):** 6 file

---

### Fase D: Bersihkan `tools/split/`

**Tujuan:** Hapus one-time migration tool yang sudah tidak dipakai.

| Aksi | Detail |
|------|--------|
| D1 | Pindahkan `tools/split/` ke `tools/archive/split-2026-10/` ATAU hapus permanen |
| D2 | Update `tools/build.ps1` jika masih referensi ke `split/` |

**Rekomendasi:** Archive dulu (jangan hapus permanen), hapus permanen setelah 30 hari jika tidak dibutuhkan.

---

### Fase E: Audit `vendor/` dan `assets/`

| Aksi | Detail |
|------|--------|
| E1 | Audit isi `N6/vendor/` — apa saja, dari mana, apakah masih dipakai |
| E2 | Rename logo di `assets/img/` dengan pola konsisten: `logo-{varian}-{ukuran}.png` |
| E3 | Hapus logo yang tidak dipakai (jika ada) |

---

## 4. Urutan Eksekusi

```
Fase A (Build Linux) 
  → Fase B (Sinkronisasi) 
    → Fase C (Rename) 
      → Fase D (Bersihkan split/) 
        → Fase E (Audit vendor/assets)
```

**Alasan urutan:**
- Fase A dulu karena tanpa build yang jalan, Fase B/C berisiko
- Fase B sebelum C karena rename file saat `dist/`/`modules/` tidak sinkron = kekacauan
- Fase D/E bisa paralel setelah A selesai

---

## 5. Estimasi Risiko

| Fase | Risiko | Mitigasi |
|------|--------|----------|
| A | Build script bash tidak 100% identik dengan PowerShell | Test byte-for-byte, jangan deploy sampai identik |
| B | Ada perubahan manual yang terlewat | Audit git log untuk semua commit yang menyentuh `dist/` |
| C | Lupa update `manifest.js`/`bundles.js` | `build.sh --check` akan error jika tidak sinkron |
| D | Ternyata `split/` masih dibutuhkan | Archive dulu, jangan hapus permanen |
| E | Hapus asset yang ternyata dipakai | Grep semua referensi sebelum hapus |

---

## 6. Checklist Eksekusi

### Fase A
- [ ] Buat `tools/build.sh`
- [ ] Test: output identik dengan `dist/` saat ini
- [ ] Dokumentasi di README

### Fase B
- [ ] Audit `dist/owner.js` vs `modules/owner/`
- [ ] Audit `dist/admin.js` vs `modules/admin/`
- [ ] Audit `dist/headcoach.js` vs `modules/headcoach/`
- [ ] Audit `dist/coach.js` vs `modules/coach/`
- [ ] Audit `dist/client.js` vs `modules/client/`
- [ ] Verifikasi dengan `build.sh --check`

### Fase C
- [ ] Rename 3 file di `modules/owner/` (extra-1/2/3 → theme, account-modal, business-health)
- [ ] Rename 1 file di `modules/admin/` (extra-1 → schedule-refresh)
- [ ] Rename 5 file di `modules/headcoach/` (extra-1..5 → pro-engine, monitoring-lanjutan, weekly-builder, coach-requests-ui, manual-builder)
- [ ] Rename 1 file di `modules/headcoach/` (coach.js → daftar-coach.js)
- [ ] Rename 2 file di `modules/coach/` (extra-1/2 → owner-theme, account-dropdown)
- [ ] Rename 2 file `jadwalcoach.js` → `jadwal-coach.js` (owner, admin)
- [ ] Rename 2 file `jadwalklien.js` → `jadwal-klien.js` (owner, admin)
- [ ] Rename 1 file di `shared/` (n6-monthly-pdf-reports → monthly-pdf-reports)
- [ ] Update 5 file `manifest.js`
- [ ] Update `js/core/bundles.js`
- [ ] Verifikasi dengan `build.sh --check`

### Fase D
- [ ] Archive `tools/split/`

### Fase E
- [ ] Audit `vendor/`
- [ ] Rename/bersihkan `assets/img/`

---

## 7. Catatan

- File ini adalah ACUAN. Jangan eksekusi tanpa konfirmasi user per fase.
- Setiap fase selesai → commit + push + lapor ke user.
- Jika ada temuan baru saat eksekusi, update file ini.

---

## 8. Tambahan: Maintainability & Debugging (Fase F, G, H)

> Ditambahkan 2026-10-06 atas permintaan user: "agar struktur aplikasinya lebih
> mudah di maintenance dan pelacakan debugging lebih robus"

**Temuan awal:** `js/dist/owner.js` (~100KB) hanya punya **1** `console.log`
dan **21** `try/catch` — praktis tidak ada infrastruktur debugging.
Error di production tidak terlacak.

---

### Fase F: Sistem Logging Terpusat

**Tujuan:** Satu pintu untuk semua log, bisa dinyalakan/dimatikan, dengan level.

| Aksi | Detail |
|------|--------|
| F1 | Buat `js/core/logger.js` — wrapper dengan level: `debug`, `info`, `warn`, `error` |
| F2 | Logger baca flag dari `localStorage['n6:debug']` atau `?debug=1` di URL |
| F3 | Mode production: hanya `warn` + `error` yang tampil; `debug`/`info` silent |
| F4 | Setiap `catch(e)` kosong (`catch(e){}`) diganti dengan `logger.warn('konteks', e)` |
| F5 | Tambahkan konteks otomatis: nama modul + nama fungsi di setiap log |

**Contoh API:**
```js
// js/core/logger.js
logger.debug('coachRoster', 'fetch selesai', { count: 5 });
logger.error('saveClientForm', 'gagal simpan', err);
```

**File yang disentuh:**
- BARU: `js/core/logger.js`
- EDIT: `js/core/bundles.js` (tambahkan logger ke load order paling awal)
- EDIT: semua `catch(e){}` kosong di `js/modules/*/` (~50+ lokasi)

---

### Fase G: Error Tracking & Build Metadata

**Tujuan:** Error di production bisa dilacak sampai ke versi code tertentu.

| Aksi | Detail |
|------|--------|
| G1 | Tambahkan **global error handler** di `js/app.js`: `window.onerror` + `unhandledrejection` → kirim ke logger + tampilkan toast user-friendly |
| G2 | **Build metadata di `dist/`**: setiap hasil build sisipkan header comment berisi git hash + timestamp + role, contoh: `/* N6 owner.js — build 2026-10-06T18:00Z — git:a1b2c3d */` |
| G3 | **Versi aplikasi di UI**: tampilkan versi singkat di footer/settings (misal: `v2026.10.06-a1b2c3d`), agar user bisa lapor "error di versi X" |
| G4 | **API error mapping**: setiap `fetch` gagal log URL + status + response body (di mode debug) |
| G5 | Buat `js/core/error-handler.js` — format error konsisten: `{ modul, fungsi, pesan, stack, timestamp, userAgent }` |

**File yang disentuh:**
- BARU: `js/core/logger.js` (dari Fase F), `js/core/error-handler.js`
- EDIT: `js/app.js` (pasang global handler)
- EDIT: `tools/build.sh` (sisipkan metadata)

---

### Fase H: Developer Experience

**Tujuan:** Memudahkan developer baru dan mencegah regresi.

| Aksi | Detail | Prioritas |
|------|--------|-----------|
| H1 | **Konvensi `catch`**: tidak boleh ada `catch(e){}` kosong — wajib log atau beri komentar alasan | Tinggi |
| H2 | **Magic string terpusat**: pindahkan string berulang (`'n6:api:token'`, URL API, nama localStorage key) ke `js/core/constants.js` | Tinggi |
| H3 | **`?debug=1` mode**: tampilkan panel debug kecil (versi, role, API status, jumlah data di memory) | Sedang |
| H4 | **Dokumentasi fungsi**: setiap fungsi public di `modules/` diberi komentar JSDoc singkat (1-2 baris: apa input/outputnya) | Sedang |
| H5 | **Smoke test**: buat `tools/smoke-test.sh` — cek setiap `dist/*.js` lolos `node --check`, setiap `manifest.js` valid, tidak ada `TODO`/`FIXME` yang menggantung | Sedang |
| H6 | **ESLint basic**: tambah `.eslintrc` minimal (no-undef, no-unused-vars) untuk tangkap typo variabel | Rendah |

**File yang disentuh:**
- BARU: `js/core/constants.js`, `js/core/error-handler.js`, `tools/smoke-test.sh`, `.eslintrc.json`
- EDIT: `js/core/env.js` (tambah flag `DEBUG`)
- EDIT: berbagai file (ganti magic string dengan konstanta)

---

### Urutan Eksekusi Tambahan

```
Fase F (Logger) → Fase G (Error Tracking) → Fase H (DevEx)
```

Bisa dikerjakan setelah Fase A+B selesai (butuh build yang stabil dulu).
Fase F+G+H independen terhadap Fase C/D/E — bisa paralel.

### Checklist Tambahan

**Fase F:**
- [ ] Buat `js/core/logger.js`
- [ ] Tambahkan ke `bundles.js` load order
- [ ] Ganti semua `catch(e){}` kosong dengan `logger.warn/error`
- [ ] Test: `?debug=1` menampilkan log, tanpa param tidak tampil

**Fase G:**
- [ ] Buat `js/core/error-handler.js`
- [ ] Pasang `window.onerror` di `app.js`
- [ ] Update `build.sh` sisipkan metadata
- [ ] Tampilkan versi di UI

**Fase H:**
- [ ] Buat `js/core/constants.js`, migrasi magic strings
- [ ] Buat `tools/smoke-test.sh`
- [ ] Tambah `.eslintrc.json`
- [ ] Dokumentasi JSDoc fungsi public

---

### Fase I: Contract Test (Frontend ↔ Backend)

**Tujuan:** Deteksi otomatis ketika frontend mengharapkan field yang tidak
dikembalikan backend (atau sebaliknya). Menggantikan kebutuhan mock server.

**Latar:** Mock server ditolak karena menambah beban sinkronisasi 3 arah
(frontend ↔ mock ↔ backend) yang pasti divergen. Contract test langsung
memverifikasi backend asli melawan ekspektasi frontend.

| Aksi | Detail |
|------|--------|
| I1 | Buat `tools/contract-test.sh` — script bash yang login pakai akun test, hit setiap endpoint yang dipakai frontend, verifikasi shape response |
| I2 | Definisikan ekspektasi per endpoint di `tools/contract/expectations.json`, contoh: |
| | ```json |
| | { |
| |   "GET /accounts?tier=3": { |
| |     "items[]": ["id", "username", "full_name", "tier", "coach_id"] |
| |   }, |
| |   "GET /clients": { |
| |     "items[]": ["id", "name", "status", "coach_id", "joined_on"] |
| |   }, |
| |   "GET /schedules/coach": { |
| |     "required": ["coach_id", "coach_name", "slots"] |
| |   } |
| | } |
| | ``` |
| I3 | Script laporkan: ✅ field sesuai, ❌ field hilang, ⚠️ field tambahan tak terduga |
| I4 | Ambil daftar endpoint otomatis dari `grep` di `js/dist/*.js` dan `js/modules/*/` (pola `n6Api('...')`, `fetch('.../v1/...')`) agar ekspektasi tidak kedaluwarsa |
| I5 | Integrasikan ke alur deploy: jalankan contract test sebelum deploy frontend ke VPS |

**File yang disentuh:**
- BARU: `tools/contract-test.sh`
- BARU: `tools/contract/expectations.json`
- EDIT: `RESTRUKTURISASI.md` (file ini)

**Contoh output:**
```
GET /accounts?tier=3 ............ ✅ (5/5 field)
GET /clients .................... ❌ hilang: coach_id
GET /schedules/coach ............. ✅ (3/3 field)
```

**Bukan mock server karena:**
- Tidak ada server palsu yang perlu di-maintenance
- Test langsung ke backend asli (staging/production)
- Snapshot response bisa disimpan sebagai fixture untuk test offline (`tools/contract/fixtures/`)

### Urutan Eksekusi Tambahan (Update)

```
Fase F (Logger) → Fase G (Error Tracking) → Fase H (DevEx)
Fase I (Contract Test) — independen, bisa dikerjakan kapan saja setelah Fase A
```

### Checklist Tambahan (Update)

**Fase I:**
- [ ] Buat `tools/contract/expectations.json` (daftar endpoint + field yang diharapkan)
- [ ] Buat `tools/contract-test.sh`
- [ ] Test manual: jalankan melawan `api.denisbergkam.com`
- [ ] Simpan fixture response ke `tools/contract/fixtures/`
- [ ] Tambahkan ke checklist deploy
