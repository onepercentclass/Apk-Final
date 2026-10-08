# DEBUG bug24 — appEl.hidden = false ganda

1. Gejala: assignment `appEl.hidden = false` yang sama tertulis di dua
   baris.
2. Dugaan penyebab: baris 39 redundan; baris 30 sudah melepas `hidden`
   untuk kedua cabang alur boot (login maupun langsung render).
3. File/baris: `js/main.js`, baris 30 & 39.
4. Status verifikasi: confirmed (baca kode).
