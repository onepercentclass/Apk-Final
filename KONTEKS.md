# Konteks Restrukturisasi Apk-Final — Acuan 5 Aplikasi

> Dibuat: 2026-10-06 | Status: KEPUTUSAN TETAP
> Tujuan: Satu arah perbaikan untuk semua aplikasi, agar tidak diskusi 2 kali.

---

## 1. Keputusan Arsitektur

### 1.1 N6 adalah aplikasi referensi
Semua pola perbaikan pertama kali diterapkan dan diuji di **N6**.
Setelah N6 stabil dan lolos uji, pola yang sama diterapkan ke aplikasi lain.

### 1.2 Haylen akan digantikan N6
**Keputusan:** Aplikasi Haylen yang lama akan **dihapus** dan digantikan oleh
N6 dengan perubahan frontend.

**Implikasi:**
- ❌ JANGAN investasikan waktu untuk restrukturisasi Haylen secara mendalam
- ✅ Fokus perbaikan struktur hanya di N6
- ✅ Saat N6 stabil, buat varian frontend N6 untuk kebutuhan Haylen, lalu hapus folder `Haylen/`
- Detail migrasi Haylen → N6 akan dibahas terpisah setelah N6 lolos uji

### 1.3 Aplikasi yang tetap dipertahankan
| Aplikasi | Status | Aksi |
|----------|--------|------|
| N6 | Referensi utama | Restrukturisasi penuh (9 fase di `N6/RESTRUKTURISASI.md`) |
| Haylen | Akan dihapus | Digantikan N6 (lihat 1.2) |
| DB Accounting | Tetap | Terapkan pola N6 setelah stabil |
| DB Finance | Tetap | Terapkan pola N6 setelah stabil |
| Claisrox | Tetap | Terapkan pola N6 setelah stabil |

---

## 2. Pola yang Harus Konsisten di Semua Aplikasi

Pola ini **wajib** diikuti saat mengerjakan DB Accounting, DB Finance, dan Claisrox.
Disalin dari hasil restrukturisasi N6.

### 2.1 Struktur Folder Frontend
```
<app>/
├── index.html
├── README.md
├── assets/img/          # Penamaan: <nama>-<varian>.png (konsisten)
├── css/
├── js/
│   ├── app.js           # Entry point (jangan rename)
│   ├── core/            # Shared: api, env, storage, logger, constants
│   │   ├── api.js
│   │   ├── constants.js # ← WAJIB ADA (Fase H)
│   │   ├── env.js
│   │   ├── error-handler.js # ← WAJIB ADA (Fase G)
│   │   ├── logger.js    # ← WAJIB ADA (Fase F)
│   │   └── storage.js
│   ├── dist/            # Hasil build — JANGAN EDIT MANUAL
│   ├── modules/<role>/  # Source per role — INI yang diedit
│   │   ├── _core.js
│   │   ├── manifest.js  # Daftar urutan file untuk build
│   │   └── <nama-menu>.js
│   ├── shared/          # Dipakai lintas role
│   └── views/           # Template per role
└── tools/
    ├── build.sh         # ← WAJIB ADA, pengganti build.ps1 (Fase A)
    ├── contract-test.sh # ← WAJIB ADA (Fase I)
    ├── smoke-test.sh    # ← WAJIB ADA (Fase H)
    └── contract/
        └── expectations.json
```

### 2.2 Konvensi Penamaan File
| Jenis | Pola | Contoh |
|-------|------|--------|
| Modul menu | `<nama-menu>.js` (lowercase, strip untuk 2 kata) | `klien.js`, `jadwal-coach.js` |
| Modul fitur | `<nama-fitur>.js` (deskriptif) | `monitoring-lanjutan.js`, `pdf-reports.js` |
| File inti | `_core.js` | Tetap |
| Manifest | `manifest.js` | Tetap |
| DILARANG | Prefix `extra-N-`, `n6-`, nama generik `script.js` | — |

### 2.3 Aturan Data
| Aturan | Detail |
|--------|--------|
| Sumber data bisnis | **API dulu**, localStorage hanya untuk cache/state UI |
| Daftar referensi (coach, dll) | Ambil dari endpoint master (contoh: `/accounts`), JANGAN bikin list terpisah di localStorage |
| Perbandingan ID | Selalu `String(a) === String(b)` — jangan `===` langsung (DB = number, form = string) |
| `catch` kosong | DILARANG — wajib `logger.warn/error` atau komentar alasan |

### 2.4 Aturan Build & Deploy
| Aturan | Detail |
|--------|--------|
| Source of truth | `js/modules/` — bukan `js/dist/` |
| Build | Via `tools/build.sh` — output harus byte-identical |
| Pre-deploy | Jalankan `build.sh --check` + `contract-test.sh` + `smoke-test.sh` |
| Metadata | Setiap `dist/` disisipi git hash + timestamp |
| Versi UI | Tampilkan versi singkat di footer/settings |

### 2.5 Debugging
| Fitur | Cara aktif |
|-------|------------|
| Mode debug | URL `?debug=1` atau `localStorage['<app>:debug'] = '1'` |
| Level log | `debug`, `info`, `warn`, `error` (via `js/core/logger.js`) |
| Production | Hanya `warn` + `error` yang tampil |

---

## 3. Peta Jalan (Roadmap)

```
Fase 1: N6 restrukturisasi penuh (9 fase: A–I)
  │
  ├─→ N6 stabil + lolos uji
  │     │
  │     ├─→ Buat varian frontend N6 untuk Haylen
  │     │     └─→ Hapus folder Haylen/
  │     │
  │     └─→ Terapkan pola ke DB Accounting
  │           └─→ Terapkan pola ke DB Finance
  │                 └─→ Terapkan pola ke Claisrox
  │
  └─→ Selesai: 4 aplikasi (N6, DBAcc, DBFin, Claisrox) dengan struktur konsisten
```

**Urutan ini mengikat.** Jangan kerjakan aplikasi lain sebelum N6 selesai,
agar pola yang diterapkan sudah terbukti.

---

## 4. Yang TIDAK Boleh Dilakukan

1. ❌ Edit `js/dist/` manual — selalu via `modules/` + rebuild
2. ❌ Buat daftar referensi terpisah di localStorage (contoh kasus: `coachRoster`)
3. ❌ Tambah mock server — gunakan contract test sebagai gantinya
4. ❌ Rename folder aplikasi tanpa diskusi (berdampak ke URL, deploy path, dokumentasi)
5. ❌ Investasi waktu ke Haylen (akan dihapus)

---

## 5. Referensi Dokumen

| Dokumen | Isi |
|---------|-----|
| `N6/RESTRUKTURISASI.md` | Detail 9 fase restrukturisasi N6 (acuan teknis) |
| File ini (`KONTEKS.md`) | Keputusan arsitektur + pola konsisten lintas aplikasi |

---

## 6. Riwayat Keputusan

| Tanggal | Keputusan | Oleh |
|---------|-----------|------|
| 2026-10-06 | N6 sebagai referensi, Haylen digantikan N6 | User |
| 2026-10-06 | Hapus `coachRoster` terpisah, ambil dari `/accounts` | User |
| 2026-10-06 | Tolak mock server, ganti dengan contract test | User + Asisten |
| 2026-10-06 | 9 fase restrukturisasi N6 (A–I) | Asisten (disetujui user) |
