# DEBUG bug13 — Dereferensi tak terjaga di edit harga

1. Gejala: bila id harga tidak ditemukan di daftar, `p.price = price`
   melempar TypeError di luar blok try/catch → unhandled rejection.
2. Dugaan penyebab: baris assignment ditambahkan oleh fix bug4
   (`PUT /pricing` body utuh) tanpa guard terhadap `p` undefined.
3. File/baris: `js/shared/pricing/pricing.js`, fungsi `onEdit()`.
4. Status verifikasi: confirmed (trace kode, tanpa eksekusi).
   Severity rendah — id selalu berasal dari baris yang dirender.
