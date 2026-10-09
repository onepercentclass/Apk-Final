# Bug 30 — Pesan (owner): tidak ada daftar kontak/penerima

## Gejala
Halaman Pesan menampilkan empty state "Belum ada percakapan" dan form
kirim, tetapi tidak ada daftar kontak — pengguna tidak bisa memilih
mau mengirim pesan ke siapa.

## Dugaan penyebab
Komponen `renderMessages` hanya me-render daftar pesan dan form kirim
`{ text }` tanpa penerima. Tidak ada UI pemilih kontak (klien/coach)
dan tidak ada pemuatan daftar kontak dari API. Pesan yang dikirim
tidak jelas ditujukan ke siapa.

## Lokasi
- `js/shared/messaging/messaging.js` — `renderMessages(container, ctx)`.
  Dipakai owner, admin, head-coach, client (via `/portal/messages`).

## Verifikasi
- Inspeksi kode: tidak ada elemen pemilih penerima di template maupun
  logika. Terkonfirmasi 2026-10-09.
- Perlu dipastikan: model percakapan yang diinginkan (thread per
  klien? broadcast?).

## Status
Terkonfirmasi. Belum diperbaiki.
