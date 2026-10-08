# DEBUG bug8 — Class CSS tanpa aturan

1. Gejala: halaman berfungsi tetapi tampil polos (tanpa gaya) pada
   daftar pesan, tiket, jadwal, harga, dan form.
2. Dugaan penyebab: class berikut dipakai di JS tetapi tidak didefinisikan
   di stylesheet mana pun: `.msg`, `.msg-list`, `.msg-text`, `.msg-meta`,
   `.ticket`, `.ticket-head`, `.ticket-actions`, `.ticket-meta`,
   `.schedule-list`, `.schedule-item`, `.price-row`, `.send-form`,
   `.muted`, `.pw-form`.
3. File/baris: `css/components.css` / `css/pages.css` (tidak ada);
   dipakai di `js/shared/*/` dan `js/*/`.
4. Status verifikasi: confirmed (grep class di `css/*.css`).
