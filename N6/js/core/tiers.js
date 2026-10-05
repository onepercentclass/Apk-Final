/**
 * N6 - access vocabulary (BUKAN matriks hak akses)
 *
 * Matriks hak akses per tier HANYA ada di backend
 * (unified-backend/app/apps/n6/tiers/tier-*.json). Saat API aktif, browser
 * menerima menus + actions milik user yang login dari
 * GET /api/n6/v1/auth/me (atau /access/me) dan js/core/access.js memakai
 * itu sebagai satu-satunya dasar menyembunyikan navigasi — lihat
 * js/core/login.js.
 *
 * File ini hanya menyimpan vocabulary: daftar domain aksi yang dikenal
 * backend, agar guardControl()/guardActions() bisa menyebut nama domain
 * tanpa mendeklarasikan ulang hak tier mana pun. Tidak ada keputusan
 * "tier X boleh apa" di sini.
 *
 * Mode lokal (API dimatikan): dashboard asli tidak punya gate, jadi semua
 * diizinkan — perilaku identik sebelum wiring API.
 */

/** Domain aksi yang dikenal backend (lihat backend tiers/*.json -> actions). */
export const ACTION_DOMAINS = Object.freeze([
  'accounts',
  'athletes',
  'attendance',
  'client_schedule',
  'clients',
  'coach_schedule',
  'commissions',
  'corrections',
  'finance',
  'messages',
  'monitoring',
  'pricing',
  'programs',
  'reports',
  'tickets',
]);

export default { ACTION_DOMAINS };
