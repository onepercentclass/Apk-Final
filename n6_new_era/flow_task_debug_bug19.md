# DEBUG bug19 — Tombol aksi 36px melanggar target sentuh 44px

1. Gejala: `.cell-actions .btn` dan `.ticket-actions .btn` memakai
   `min-height: 36px`, di bawah target sentuh minimal.
2. Dugaan penyebab: menyimpang dari aturan 14 Agent-Core
   (target sentuh ≥ 44px) dan design_vnpc.md §11.6.
3. File/baris: `css/components.css` baris 50 dan 94.
4. Status verifikasi: confirmed (grep).
