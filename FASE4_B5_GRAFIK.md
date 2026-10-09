# Fase 4 — B5: Dokumentasi Grafik Laba Rugi (Beranda)

## Sumber Data

Grafik di `menu-dashboard.js:13-20` mengambil data dari **jurnal** perusahaan (`c.journal`).

Untuk setiap bulan dalam 12 bulan terakhir:
- **Pendapatan** = total `credit - debit` dari akun bertipe `Pendapatan`
- **Beban** = total `debit - credit` dari akun bertipe `Beban`
- **Laba Bersih** = Pendapatan − Beban

## Cara Baca

- **Bar hijau** (Pendapatan): total pemasukan bulan itu
- **Bar merah** (Beban): total pengeluaran bulan itu
- **Garis biru** (Laba Bersih): selisihnya — di atas nol = untung, di bawah = rugi

## Verifikasi

Untuk memastikan angka grafik benar:
1. Buka menu **Laporan** → **Laba Rugi**
2. Pilih periode bulan yang sama
3. Bandingkan angka Pendapatan, Beban, Laba Bersih
4. Harus sama dengan yang tampil di grafik

## Catatan

- Grafik hanya menghitung jurnal yang sudah diposting
- Akun harus punya tipe yang benar (`Pendapatan`/`Beban`) di Chart of Accounts
- Jika grafik kosong, kemungkinan belum ada jurnal di periode tersebut
