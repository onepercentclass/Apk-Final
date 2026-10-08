# DEBUG bug2 — Sesi kedaluwarsa tidak kembali ke login

1. Gejala: setelah respons 401 dan refresh token gagal, token dibersihkan
   tetapi pengguna tetap di halaman; semua panggilan API berikutnya gagal.
2. Dugaan penyebab: `request()` memanggil `clearSession()` tanpa menampilkan
   layar login. Design §4 langkah 5 mewajibkan: 401 → coba refresh sekali →
   ulangi panggilan → bila masih 401, hapus sesi dan tampilkan login.
3. File/baris: `js/core/api.js`, fungsi `request()` (cabang 401).
4. Status verifikasi: confirmed (trace kode + banding design_vnpc.md).
