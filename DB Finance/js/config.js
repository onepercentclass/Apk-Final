/** Konfigurasi aplikasi. Semua pengaturan lingkungan ada di sini. */

/** Alamat API server. Hanya dipakai bila USE_API = true.
 *  Namespace DB Finance di backend gabungan: /api/dbfin.
 *  Lokal: 'http://localhost:8000/api/dbfin' */
export const API_BASE = 'https://n6sport.id/api/dbfin';

/** false = semua data dari localStorage. true = data diambil dari API_BASE. */
export const USE_API = true;

/** Kunci localStorage untuk data aplikasi dan token API. */
export const STORAGE_KEY = 'fintrack-v1';
export const TOKEN_KEY = 'claisrox-token';
