# Fase 5 — B8: Multi Perusahaan

## Implementasi (berdasarkan asumsi)

**Asumsi:** Tiap perusahaan punya user terpisah. Pindah perusahaan = logout + login ulang.

**Perubahan:**
- `switchCompany()` di `menu-perusahaan.js`: tidak lagi langsung ganti `S.activeId`
- Sekarang: konfirmasi → hapus token → reload (kembali ke login)
- User login dengan akun perusahaan yang dituju

## Catatan

- Ini asumsi berdasarkan "login yang berbeda-beda"
- Jika pemilik maksudnya lain (mis. hanya konfirmasi password, bukan logout penuh), perlu revisi
- Data perusahaan tetap terpisah di localStorage per `S.activeId`
