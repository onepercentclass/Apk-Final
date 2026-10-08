# DEBUG bug4 — Edit harga salah endpoint

1. Gejala: ubah harga memanggil `PUT /pricing/{id}` dengan body `{price}`.
2. Dugaan penyebab: aplikasi lama memakai `PUT /pricing` dengan satu body utuh
   (`pricing.save`), bukan per-id. Endpoint per-id belum terverifikasi ada.
3. File/baris: `js/shared/pricing/pricing.js`, fungsi `onEdit()`.
4. Status verifikasi: confirmed (banding `N6/js/core/api.js` baris 162-165).
