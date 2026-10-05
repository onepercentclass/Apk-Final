/** Konfigurasi aplikasi. Semua pengaturan lingkungan ada di sini. */

/** Alamat API server. Hanya dipakai bila USE_API = true. */
export const API_BASE = 'https://n6sport.id/api';

/** false = semua data dari localStorage. true = data diambil dari API_BASE. */
export const USE_API = false;

/** Kunci localStorage untuk data aplikasi dan token API. */
export const STORAGE_KEY = 'fintrack-v1';
export const TOKEN_KEY = 'claisrox-token';

/**
 * Tier pengguna aktif (0 = owner). Dipakai selama USE_API = false;
 * saat API aktif, tier ditentukan server lewat /access/me.
 */
export const CURRENT_TIER = 0;
