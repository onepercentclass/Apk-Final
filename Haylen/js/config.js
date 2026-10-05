/* Konfigurasi global aplikasi Haylen */
window.Haylen = window.Haylen || { pages: {} };

Haylen.config = {
  appName: "AquaFlow Swimming School",
  // Backend gabungan (unified-backend), namespace Haylen.
  // Untuk coba lokal, ganti host jadi http://localhost:8000 (backend unified jalan di :8000).
  API_BASE: "https://n6sport.id/api/haylen",
  USE_API: true,
  STORAGE_PREFIX: "haylen_",
  // Tier user aktif. 0 = Owner (akses semua). Sementara hanya tier 0.
  CURRENT_TIER: 0,
  // Profil user sementara (nantinya dari /auth/me)
  USER: { name: "Budi Santoso", role: "Owner" },
};
