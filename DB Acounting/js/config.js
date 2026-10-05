/* ============================= CONFIG =============================
   SATU-SATUNYA tempat mengubah mode sumber data.
   - USE_API=false  -> seluruh data pakai localStorage.
   - USE_API=true   -> data diambil dari server BACKEND (FastAPI).
   Tier pengguna TIDAK diatur di sini: saat API aktif, hak akses selalu
   diambil dari backend (GET /auth/me) setelah login; server yang
   menghitungnya dari tier user di DB.
   Backend gabungan (unified-backend) namespace DB Accounting:
     produksi : https://api.denisbergkam.com/api/dbacc
     lokal    : http://localhost:8000/api/dbacc
   ==================================================================== */
const API_CONFIG = {
  BASE_URL: 'https://api.denisbergkam.com/api/dbacc',
  USE_API: true,
  TIMEOUT_MS: 8000,
};
