# DEBUG bug22 — Fokus modal tidak terkurung

1. Gejala: tombol Tab dapat memindahkan fokus keluar dari dialog modal
   ke elemen di belakangnya.
2. Dugaan penyebab: implementasi hanya memfokuskan tombol pertama saat
   dialog dibuka dan menangani Escape; tidak ada penanganan Tab untuk
   mengurung fokus. Menyimpang dari design_vnpc.md §7.2 yang mewajibkan
   "fokus terkurung" pada modal.js.
3. File/baris: `js/ui/modal.js`, fungsi `modal()`.
4. Status verifikasi: confirmed (baca kode + banding design_vnpc.md).
