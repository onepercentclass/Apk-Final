# DESIGN VNPC — N6 New Era

Rebuild frontend N6 dari nol. Backend tidak berubah (kontrak API sama,
pintu penerimaan: tools/contract-test.sh 10/10).

## 1. Tujuan

1. Satu aplikasi frontend untuk 5 role (owner, admin, head-coach, coach, client)
   yang berbagi kode maksimal dan hanya menyimpan kekhususan role di folder role.
2. Antarmuka sederhana: satu aksi utama per layar, tanpa menu bertingkat,
   mobile-first (aturan 12).
3. Tanpa build step: ES modules native, dibuka langsung dari server statis.

## 2. Struktur folder

n6-new-era/
  index.html
  MENU_MAP.md
  design_vnpc.md (file ini)
  assets/icons/
  assets/images/
  css/ tokens.css, reset.css, base.css, components.css, pages.css, dark.css
  js/
    core/ api.js, auth.js, router.js, store.js, config.js, logger.js, utils.js
    ui/ table.js, modal.js, toast.js, empty-state.js, badge.js, stat-card.js
    shared/ clients/, schedule/, messaging/, members/, password/, pricing/
    owner/
    admin/
    head-coach/
    coach/
    client/
  tools/ contract-test.sh, smoke-test.sh

Setiap folder di bawah js/ maksimal 1 level lagi (aturan 18: total 3 level).

## 3. Alur boot (top-down)

1. Browser memuat index.html, menampilkan splash boot.
2. Modul core/config.js dibaca: menentukan API_BASE dan flag fitur.
3. Modul core/logger.js diinisialisasi: level debug aktif bila ?debug=1
   atau localStorage n6:debug = 1, selain itu warn/error.
4. Modul core/auth.js memeriksa token tersimpan:
   a. Token valid → lanjut langkah 5.
   b. Token tidak ada/kedaluwarsa → tampilkan layar login, hentikan boot.
5. Modul core/router.js membaca ?role= dan menu= dari URL:
   a. Role tidak cocok dengan tier pengguna → paksa role sesuai tier.
   b. Menu tidak dikenal → paksa menu default role tersebut.
6. Router memuat modul halaman via dynamic import dan me-render ke #app.
7. Navigasi role di-render dari registry halaman role tersebut.

Hasil yang diharapkan: pengguna sampai ke halaman yang benar dalam satu
rangkaian tanpa layar kosong; setiap kegagalan menampilkan pesan, bukan blank.

## 4. Alur autentikasi

1. Pengguna mengisi username dan password, menekan Masuk.
2. auth.js mengirim POST /api/n6/v1/auth/login.
3. Respons 200 → simpan access_token dan refresh_token, petakan tier ke role,
   arahkan ke ?role=<role>.
4. Respons 401 → tampilkan "Username atau password salah", catat warning di log.
5. Setiap panggilan API yang mendapat 401 → coba refresh token sekali →
   ulangi panggilan → bila masih 401, hapus sesi dan tampilkan login.
6. Keluar → hapus token, kembali ke layar login, bersihkan URL.

Variabel: access_token, refresh_token, tier (0-4), role hasil pemetaan tier.

## 5. Alur routing dan siklus hidup halaman

1. Setiap modul halaman mengekspor fungsi render(container, params).
2. Router memanggil render, lalu mencatat halaman aktif di navigasi.
3. Setiap halaman wajib menangani tiga status: memuat, kosong, gagal.
4. Status memuat: tampilkan skeleton/spinner, bukan konten lama.
5. Status kosong: tampilkan empty-state.js dengan ajakan aksi yang jelas.
6. Status gagal: tampilkan pesan ramah + tombol Coba Lagi; catat error di log.
7. Saat pindah halaman, router memanggil cleanup halaman lama bila ada
   (hentikan polling, lepas listener).

## 6. Modul core

1. core/api.js — satu-satunya pintu HTTP.
   a. Fungsi request(path, options): menambah header Authorization,
      melempar ApiError(status, body, url) bila gagal.
   b. Tidak ada fetch langsung ke API di luar modul ini.
2. core/auth.js — login, logout, refresh, tier gate, pemetaan tier→role.
3. core/router.js — parsing URL, validasi role/menu, dynamic import halaman.
4. core/store.js — state global minimal (pengguna aktif, preferensi).
5. core/config.js — konstanta lingkungan, tanpa magic string tersebar.
6. core/logger.js — debug/info/warn/error + caught(); dipakai semua modul,
   catch kosong dilarang.
7. core/utils.js — fungsi murni: formatRupiah, formatTanggal, esc (HTML escape).
   O(n) untuk format, tanpa dependensi.

## 7. Komponen ui (presentasional, tanpa logika bisnis)

1. table.js — tabel dengan kolom responsif; di layar sempit berubah jadi kartu.
2. modal.js — dialog konfirmasi/aksi, fokus terkurung, tutup via Escape.
3. toast.js — notifikasi singkat sukses/gagal.
4. empty-state.js — ilustrasi + teks + tombol aksi.
5. badge.js — label status (Aktif, Nonaktif, Terarsip).
6. stat-card.js — kartu angka ringkas untuk dashboard.

Setiap komponen menerima data dan callback; tidak memanggil API langsung.

## 8. Fitur berbagi (js/shared) — dipakai minimal 2 role

1. shared/clients/ — daftar, detail, arsip, pulihkan, hapus permanen.
   Menggantikan 4 versi menu Klien (owner, admin, head-coach, coach).
   Mode: read-only untuk coach, penuh untuk owner/admin.
2. shared/schedule/ — jadwal coach & klien 30 hari, ketersediaan,
   export JPG. Menggantikan 2 modul identik jadwal-coach-export.js.
3. shared/messaging/ — daftar percakapan, kirim pesan, tiket & keluhan.
   Satu komponen percakapan dipakai owner, admin, head-coach, client.
4. shared/members/ — kelola anggota: daftar, ubah tier, nonaktifkan, hapus.
   Hapus permanen wajib konfirmasi ganda; backend menolak bila masih
   direferensikan data lain.
5. shared/password/ — form ganti password dengan validasi inline.
   Satu modul untuk 5 role.
6. shared/pricing/ — daftar harga dengan mode read (admin, coach)
   dan mode edit (owner). Satu komponen, dua mode.

Aturan: bila sebuah fitur dipakai 2+ role, ia tinggal di shared/,
bukan diduplikasi di folder role.

## 9. Halaman per role (hanya kekhususan role)

1. owner/ — beranda pendapatan (Revenue Overview, Pertumbuhan Klien),
   keuangan (pendapatan per kategori, pengeluaran), komisi & performa coach.
2. admin/ — beranda operasional (pendaftaran per periode, distribusi status,
   coach kosong hari ini, perlu perhatian).
3. head-coach/ — buat program (wizard identitas→target→pace/HR→kirim),
   monitoring klien, koreksi & reschedule, atlet binaan, kelola coach.
4. coach/ — beranda performa, informasi (gaji, evaluasi), absensi
   (reschedule, cuti, tandai tidak tersedia).
5. client/ — laporan latihan, performa (grafik + kalender), chat.

Satu aksi utama per layar (aturan 12): contoh layar coach/absensi hanya
berisi pengajuan; riwayat dipindah ke tab sekunder, bukan halaman baru.

## 10. Penanganan error

1. Semua catch wajib mencatat via logger.caught() atau menampilkan ke pengguna.
2. Kegagalan API 4xx → pesan spesifik dari backend bila ada.
3. Kegagalan API 5xx atau jaringan → "Terjadi gangguan, coba lagi."
   + tombol Coba Lagi + catat error.
4. Global handler: error tak tertangkap → toast ramah + log,
   aplikasi tidak blank.
5. Tidak ada data sensitif di log (tanpa password, tanpa token utuh).

## 11. CSS

1. tokens.css — warna, spasi, tipografi, radius; satu-satunya sumber nilai desain.
2. reset.css, base.css — normalisasi dan gaya elemen dasar.
3. components.css — gaya untuk setiap komponen js/ui/.
4. pages.css — tata letak halaman.
5. dark.css — override tema gelap; tidak ada warna hardcoded di luar tokens.css.
6. Kontras teks minimal 4.5:1 di kedua tema; target sentuh minimal 44px.

## 12. Trade-off (aturan 8)

1. ES modules native tanpa build step: diperoleh kesederhanaan dan debug
   langsung, dikorbankan dukungan browser sangat lama, untuk pengembang
   dan pengguna.
2. Fitur berbagi vs salinan per role: diperoleh satu sumber kebenaran,
   dikorbankan kebebasan kustom per role, untuk pemelihara.
3. Routing ?role=&menu= dipertahankan: diperoleh kompatibilitas bookmark
   dan link lama, dikorbankan URL yang lebih bersih, untuk pengguna lama.
4. Satu aksi utama per layar: diperoleh kejelasan, dikorbankan kepadatan
   informasi per layar, untuk pengguna.

## 13. Kriteria selesai desain

1. Setiap menu di MENU_MAP.md terpetakan ke tepat satu lokasi:
   js/shared/* atau js/<role>/.
2. Tidak ada menu yang membutuhkan modul di dua tempat.
3. Alur 3–5 dapat diikuti dari kalimat pertama sampai terakhir tanpa
   konteks luar.
