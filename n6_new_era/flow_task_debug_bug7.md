# DEBUG bug7 — Arsip klien: parameter dan restore belum terverifikasi

1. Gejala: daftar memakai query `?archived=1`; pulihkan memakai
   `POST /clients/{id}/archive` dengan body `{undo:true}`.
2. Dugaan penyebab: aplikasi lama mengelola arsip di localStorage
   (`archivedClients`), bukan via parameter query. Endpoint
   `POST clients/{id}/archive` memang ada di API lama, tetapi dukungan
   parameter `archived` dan bentuk body restore tidak diketahui.
3. File/baris: `js/shared/clients/clients.js`, fungsi `load()` dan `onAction()`.
4. Status verifikasi: confirmed tidak ada di kode lama; perilaku backend
   belum teruji.
