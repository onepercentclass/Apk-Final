/**
 * Hak akses menu berdasarkan tier.
 *
 * SATU-SATUNYA sumber kebenaran = backend: GET /access/me mengembalikan
 * {tier, name, access} yang dihitung server dari tier user di DB
 * (bukan dari input client). File ini TIDAK menyimpan keputusan
 * "tier X boleh apa" — hanya vocabulary pemakaian: can()/firstAllowed().
 *
 * Mode lokal (USE_API=false): tanpa server, pemegang perangkat adalah
 * pemiliknya sendiri, jadi semua key vocabulary diizinkan. Daftar key
 * (fallbackKeys) dipasok pemanggil dari registry menu (js/menu/index.js),
 * bukan didefinisikan di sini.
 */
import { USE_API } from '../config.js';
import { api } from '../services/api.js';
import { ENDPOINTS } from '../services/endpoints.js';

let allowed = new Set();

export async function loadAccess(fallbackKeys = []) {
  if (USE_API) {
    const me = await api.get(ENDPOINTS.accessMe);
    allowed = new Set(me.access || []);
  } else {
    allowed = new Set(fallbackKeys);
  }
}

export const can = menuId => allowed.has(menuId);

export const firstAllowed = order => order.find(can);
