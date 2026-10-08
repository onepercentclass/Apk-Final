# DEBUG bug26 — Preferensi tema tersimpan tidak pernah ditulis

1. Gejala: `localStorage['n6:theme']` dibaca oleh applyTheme(), tetapi
   tidak ada kode di mana pun yang menulisnya; tidak ada UI toggle tema.
2. Dugaan penyebab: fitur setengah jadi; cabang `saved === 'dark'`
   tidak pernah tercapai sehingga tema efektif hanya mengikuti
   preferensi OS.
3. File/baris: `js/main.js` baris 12-13; `js/core/config.js` baris 7.
4. Status verifikasi: confirmed (grep seluruh js/).
