/**
 * Hak akses menu berdasarkan tier.
 * Tier 0 = owner. Tier N mendapat key akses miliknya ditambah milik tier N+1 sampai MAX_TIER,
 * sehingga tier 0 otomatis bisa mengakses semua fitur di tier 1, 2, dan seterusnya.
 */
import { USE_API, CURRENT_TIER } from '../config.js';
import { api } from '../services/api.js';
import { ENDPOINTS } from '../services/endpoints.js';

const MAX_TIER = 3;
let allowed = new Set();

async function readTier(n) {
  const res = await fetch(new URL(`./tiers/tier${n}.json`, import.meta.url));
  if (!res.ok) throw new Error(`tier${n}.json tidak ditemukan`);
  return res.json();
}

async function localAccess(tier) {
  const numbers = Array.from({ length: MAX_TIER - tier + 1 }, (_, i) => tier + i);
  const files = await Promise.all(numbers.map(readTier));
  return files.flatMap(f => f.access);
}

export async function loadAccess() {
  const keys = USE_API ? (await api.get(ENDPOINTS.accessMe)).access : await localAccess(CURRENT_TIER);
  allowed = new Set(keys);
}

export const can = menuId => allowed.has(menuId);

export const firstAllowed = order => order.find(can);
