# DEBUG bug3 — Chat client salah endpoint

1. Gejala: halaman Chat role client memanggil `GET /messages` (dan `POST /messages`
   saat mengirim).
2. Dugaan penyebab: tier 4 kemungkinan membutuhkan `/portal/messages`.
   Aplikasi lama memisahkan `messages` (staf) dan `portal.messages` (client)
   di `js/core/api.js`.
3. File/baris: `js/shared/messaging/messaging.js`, fungsi `renderMessages()`.
4. Status verifikasi: inferred dari struktur kode lama; belum teruji ke backend live.
