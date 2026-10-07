/** Sumber data. localStorage selalu dipakai sebagai cache; API hanya bila USE_API = true. */
import { STORAGE_KEY } from '../config.js';
import { api } from './api.js';
import { logger } from '../core/logger.js';
import { ENDPOINTS } from './endpoints.js';
import { toApi, fromApi } from './mappers.js';

export function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function writeLocal(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { logger.caught('storage', e, 'writeLocal'); }
}

export async function pullState(current) {
  return fromApi(await api.get(ENDPOINTS.state), current);
}

export function pushState(state) {
  return api.put(ENDPOINTS.state, toApi(state));
}
