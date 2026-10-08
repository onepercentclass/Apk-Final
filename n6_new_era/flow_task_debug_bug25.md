# DEBUG bug25 — todayISO() tidak dipakai

1. Gejala: fungsi `todayISO()` tidak dipanggil di mana pun di seluruh
   direktori js/.
2. Dugaan penyebab: sisa perencanaan yang tidak jadi dipakai; melanggar
   prinsip anti-slop (setiap elemen harus punya fungsi).
3. File/baris: `js/core/utils.js`, baris 22-24.
4. Status verifikasi: confirmed (grep seluruh js/).
