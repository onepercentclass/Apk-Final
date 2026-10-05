/* ============================= CONFIG =============================
   SATU-SATUNYA tempat mengubah mode sumber data & tier aktif.
   - USE_API=false  -> seluruh data pakai localStorage.
   - USE_API=true   -> data diambil dari server BACKEND (FastAPI).
   - CURRENT_TIER=0 -> Owner (akses semua menu). Untuk sementara hanya owner.
   Backend gabungan (unified-backend) namespace DB Accounting:
     produksi : https://n6sport.id/api/dbacc
     lokal    : http://localhost:8000/api/dbacc
   ==================================================================== */
const API_CONFIG = {
  BASE_URL: 'https://n6sport.id/api/dbacc',
  USE_API: true,
  TIMEOUT_MS: 8000,
};

const APP_CONFIG = {
  CURRENT_TIER: 0,
  TIER_JSON_PATH: 'tiers/tier-{tier}.json',
};
