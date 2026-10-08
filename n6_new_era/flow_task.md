# FLOW TASK — N6 New Era

Diturunkan dari design_vnpc.md. Status: pending/done.

| ID | Deskripsi | Dependensi | Status |
|----|-----------|------------|--------|
| T1 | js/core/config.js — API_BASE, flag fitur, konstanta | — | done |
| T2 | js/core/logger.js — debug/info/warn/error/caught, ?debug=1 | — | done |
| T3 | js/core/utils.js — formatRupiah, formatTanggal, esc | — | done |
| T4 | js/core/api.js — request(), ApiError, header Authorization | T1, T2 | done |
| T5 | js/core/store.js — state global minimal | T2 | done |
| T6 | js/core/auth.js — login/logout/refresh, tier→role, layar login | T4 | done |
| T7 | js/core/router.js — parse ?role=&menu=, validasi, dynamic import, lifecycle halaman | T6 | done |
| T8 | js/ui/ — toast.js, modal.js, empty-state.js | — | done |
| T9 | js/ui/ — table.js, badge.js, stat-card.js | — | done |
| T10 | css/reset.css + css/base.css | — | done |
| T11 | css/components.css — gaya untuk js/ui/ | T8, T9, T10 | done |
| T12 | css/pages.css — tata letak halaman | T10 | done |
| T13 | js/shared/password/ — ganti password (5 role) | T4, T8 | done |
| T14 | js/shared/members/ — kelola anggota, tier, nonaktif, hapus | T4, T8, T9 | done |
| T15 | js/shared/clients/ — daftar, detail, arsip (mode read/full) | T4, T8, T9 | done |
| T16 | js/shared/messaging/ — pesan, chat, tiket | T4, T8 | done |
| T17 | js/shared/schedule/ — jadwal 30 hari, ketersediaan, export JPG | T4, T8, T9 | done |
<!-- Catatan Phase 3: renderClientSchedule memakai GET /schedules/clients (koleksi);
     API lama hanya punya /schedules/clients/{id}. Perlu verifikasi di Phase 4. -->
| T18 | js/shared/pricing/ — daftar harga mode read/edit | T4, T8, T9 | done |
| T19 | js/client/ — laporan, performa, chat | T4, T8, T16 | done |
| T20 | js/coach/ — beranda, informasi, absensi | T15, T16, T17 | done |
| T21 | js/admin/ — beranda operasional | T15, T17 | done |
| T22 | js/head-coach/ — program, monitoring, koreksi, atlet, coach | T14, T15, T16, T17 | done |
| T23 | js/owner/ — beranda pendapatan, keuangan, komisi | T15, T17, T18 | done |
| T24 | js/main.js — wiring boot: splash → auth → router | T7 | done |
| T25 | tools/contract-test.sh — adaptasi, target 10/10 | T4 | done |
| T26 | tools/smoke-test.sh — node --check semua modul | — | done |
