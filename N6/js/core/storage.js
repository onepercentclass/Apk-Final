/**
 * N6 - localStorage data layer
 *
 * This is the active data source while js/core/env.js has API_ENABLED = false,
 * which is the default. It is deliberately compatible with the original five
 * dashboards: the same keys, the same JSON shapes, the same role namespaces,
 * so a browser that already has data keeps it.
 *
 * When the API is switched on, `repository()` returns the HTTP-backed
 * implementation from js/core/api.js instead and every caller keeps working
 * unchanged.
 */

import { apiEnabled } from './env.js';
import { STORAGE_PREFIX, ROLE_NAMESPACES, SHARED_KEYS, STATE_VERSION } from './config.js';
import { clone } from './utils.js';

/** Guard every access: private-mode Safari throws on localStorage entirely. */
const memory = new Map();
let usable = null;

function hasLocalStorage() {
  if (usable !== null) return usable;
  try {
    const probe = `${STORAGE_PREFIX}__probe__`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    usable = true;
  } catch {
    usable = false;
    console.warn('[n6] localStorage unavailable, falling back to an in-memory store');
  }
  return usable;
}

/**
 * Windows Script Host stand-in: the original code sometimes calls
 * window.storage.get/set when it is opened inside an AI Studio preview.
 * Keep working when it exists, but never depend on it.
 */
const hostStorage = (typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function')
  ? window.storage
  : null;

/** Namespaced physical key for a logical key. */
export function physicalKey(key, role) {
  if (SHARED_KEYS.includes(key)) return key;
  const prefix = role ? ROLE_NAMESPACES[role] || '' : '';
  return prefix ? `${prefix}${key}` : `${STORAGE_PREFIX}${key}`;
}

/** Read and parse a JSON value. Returns `fallback` on miss or corruption. */
export function read(key, fallback = null, role = null) {
  const k = physicalKey(key, role);
  let raw = null;
  if (hasLocalStorage()) {
    raw = window.localStorage.getItem(k);
  } else if (memory.has(k)) {
    raw = memory.get(k);
  }
  if (raw == null) return fallback;
  try {
    const value = JSON.parse(raw);
    return value == null ? fallback : value;
  } catch (err) {
    console.warn(`[n6] "${k}" is not valid JSON, using fallback`, err);
    return fallback;
  }
}

/** Serialise and store a JSON value. Returns false if the write was refused. */
export function write(key, value, role = null) {
  const k = physicalKey(key, role);
  let raw;
  try {
    raw = JSON.stringify(value);
  } catch (err) {
    console.error(`[n6] cannot serialise value for "${k}"`, err);
    return false;
  }
  if (raw === undefined) return false;
  if (!hasLocalStorage()) {
    memory.set(k, raw);
    return true;
  }
  try {
    window.localStorage.setItem(k, raw);
    return true;
  } catch (err) {
    // QuotaExceededError is the usual one; keep the app alive either way.
    console.error(`[n6] write to "${k}" failed`, err);
    return false;
  }
}

export function remove(key, role = null) {
  const k = physicalKey(key, role);
  if (hasLocalStorage()) window.localStorage.removeItem(k);
  else memory.delete(k);
  return true;
}

/** True when the logical key exists for this role. */
export function has(key, role = null) {
  const k = physicalKey(key, role);
  if (hasLocalStorage()) return window.localStorage.getItem(k) != null;
  return memory.has(k);
}

/** Every key currently stored for a role, with the namespace stripped. */
export function keys(role = null) {
  const prefix = role ? ROLE_NAMESPACES[role] || '' : STORAGE_PREFIX;
  const out = [];
  if (hasLocalStorage()) {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(prefix)) out.push(prefix ? k.slice(prefix.length) : k);
    }
  } else {
    for (const k of memory.keys()) {
      if (k.startsWith(prefix)) out.push(prefix ? k.slice(prefix.length) : k);
    }
  }
  return out.sort();
}

/** Remove every key belonging to a role. Never touches another role's data. */
export function clearRole(role) {
  const all = keys(role);
  for (const k of all) remove(k, role);
  return all.length;
}

/** Sync with a host-provided storage implementation when one is present. */
export async function syncWithHost() {
  if (!hostStorage) return false;
  for (const key of keys()) {
    try {
      const res = await hostStorage.get(physicalKey(key), true);
      if (res && res.value != null) write(key, res.value);
    } catch { /* host storage is best-effort */ }
  }
  return true;
}

/** Export everything this role owns, for the "backup" file the UI offers. */
export function exportRole(role) {
  const dump = {};
  for (const key of keys(role)) dump[physicalKey(key, role)] = read(key, null, role);
  return { schema: STATE_VERSION, role, exportedAt: new Date().toISOString(), data: dump };
}

/** Merge a previously exported dump back in. Unknown keys are ignored. */
export function importRole(dump, role) {
  if (!dump || typeof dump !== 'object' || !dump.data) return 0;
  let applied = 0;
  for (const [k, v] of Object.entries(dump.data)) {
    const key = k.replace(/^[a-z]+:/i, '');
    if (write(key, clone(v), role)) applied += 1;
  }
  return applied;
}

/* ------------------------------------------------------------------ *
 * Repository: one facade the rest of the app talks to.
 * localStorage today, HTTP when the API is enabled.
 * ------------------------------------------------------------------ */

const localRepository = {
  source: 'localstorage',
  async get(key, fallback = null, role = null) { return read(key, fallback, role); },
  async set(key, value, role = null) { return write(key, value, role); },
  async remove(key, role = null) { return remove(key, role); },
  async has(key, role = null) { return has(key, role); },
  async keys(role = null) { return keys(role); },
  async clear(role) { return clearRole(role); },
};

/**
 * Return the repository to use. The HTTP repository is imported lazily so that
 * a local-only deployment never even loads js/core/api.js.
 */
let repository = localRepository;

export async function initRepository(role) {
  if (!apiEnabled()) {
    await syncWithHost();
    repository = localRepository;
    return repository;
  }
  const { createApiRepository } = await import('./api.js');
  repository = createApiRepository(role);
  return repository;
}

export function getRepository() {
  return repository;
}

export default {
  read, write, remove, has, keys, clearRole,
  exportRole, importRole,
  physicalKey,
  initRepository, getRepository,
};