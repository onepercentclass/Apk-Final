# DEBUG bug1 — Layar login tidak terlihat

1. Gejala: halaman kosong (blank) saat belum login, dan tetap kosong
   setelah login berhasil.
2. Dugaan penyebab: elemen `#app` memiliki atribut `hidden` di index.html.
   Fungsi `boot()` tidak pernah melepasnya — baik di cabang tanpa-user
   (sebelum `renderLogin`) maupun di callback sukses login
   (sebelum `initRouter()` + `render()`).
3. File/baris: `js/main.js`, fungsi `boot()`.
4. Status verifikasi: confirmed (trace kode, tanpa eksekusi).
