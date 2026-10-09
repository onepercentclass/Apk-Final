# Bug 34 — Chat: kirim pesan 422 + "Gagal: [object Object]"

## Gejala
Mengirim pesan (client maupun owner) gagal. UI menampilkan
"Gagal: [object Object]" — objek JS mentah bocor ke tampilan,
bukan pesan error yang bisa dibaca.

## Dugaan penyebab (dua lapis)
1. Field mismatch: frontend mengirim `{ text }`, tetapi backend
   mewajibkan field `body`. `POST /portal/messages` (dan `/messages`)
   menjawab 422 `{"detail":[{"type":"missing","loc":["body","body"],
   "msg":"Field required",...}]}`.
2. `friendly()` di messaging.js mengembalikan `e.body.detail` apa adanya.
   Ketika `detail` berupa array/objek (seperti validation error FastAPI),
   `'Gagal: ' + detail` menjadi "Gagal: [object Object]".

## Lokasi
- `js/shared/messaging/messaging.js` —
  - submit handler: `post(base, { text })` harusnya `{ body: text }`
    (atau sesuaikan dengan kontrak API).
  - `friendly(e)`: harus menangani `detail` berupa array/objek
    (ambil `msg` pertama / stringify yang aman).

## Verifikasi
- `POST /api/n6/v1/portal/messages {"text":"halo"}` (token t_client):
  422, detail berupa array dengan `loc: ["body","body"]`.
- `POST /api/n6/v1/messages {"text":"halo"}` (token t_owner): 422 sama.
  Terkonfirmasi 2026-10-09.

## Status
Terkonfirmasi. Belum diperbaiki.
