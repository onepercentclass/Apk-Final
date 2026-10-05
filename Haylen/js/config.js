/* Konfigurasi global aplikasi Haylen */
window.Haylen = window.Haylen || { pages: {} };

Haylen.config = {
  appName: "AquaFlow Swimming School",
  // Endpoint server. Dimatikan dulu -> data memakai localStorage.
  API_BASE: "https://n6sport.id/api",
  USE_API: false,
  STORAGE_PREFIX: "haylen_",
  // Tier user aktif. 0 = Owner (akses semua). Sementara hanya tier 0.
  CURRENT_TIER: 0,
  // Profil user sementara (nantinya dari /auth/me)
  USER: { name: "Budi Santoso", role: "Owner" },
};
