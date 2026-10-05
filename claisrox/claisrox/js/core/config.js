/* Konfigurasi aplikasi: satu-satunya tempat mengubah mode data & endpoint. */
const STORAGE_KEY = 'claisrox_data_v1';
const THEME_KEY = 'claisrox_theme_v1';
const TOKEN_KEY = 'claisrox_token_v1';

const APP_CONFIG = {
  api: {
    enabled: false,                       // false = data di localStorage; true = data dari server
    baseUrl: 'https://api.denisbergkam.com/api',
    timeoutMs: 15000,
    syncDebounceMs: 800,                  // jeda sebelum perubahan dikirim ke server
  },
  // Dipakai selama API mati: pemilik penuh (tier 0).
  localSession: { username: 'owner', name: 'Pemilik Claisrox', tier: 0 },
  logoPath: 'assets/logo.png',
};
