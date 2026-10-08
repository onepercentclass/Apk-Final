// N6 New Era — satu-satunya pintu HTTP. Tidak ada fetch ke API
// di luar modul ini.
import { API_BASE, TOKEN_KEY, REFRESH_KEY, USER_KEY } from './config.js';
import { caught, warn } from './logger.js';

export class ApiError extends Error {
  constructor(status, body, url) {
    super('API ' + status + ' ' + url);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.url = url;
  }

  get message_() {
    return (this.body && this.body.detail) || this.message;
  }
}

function storageGet(key) {
  try { return localStorage.getItem(key); } catch (e) { caught(e, 'storageGet'); return null; }
}

function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { caught(e, 'storageSet'); }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (e) { caught(e, 'clearSession'); }
}

async function raw(path, { method = 'GET', body = null, query = null, token = null } = {}) {
  let url = API_BASE + path;
  if (query) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    }
    const s = qs.toString();
    if (s) url += '?' + s;
  }
  const headers = {};
  if (body !== null) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = 'Bearer ' + token;
  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new ApiError(0, { detail: 'Jaringan tidak terjangkau.' }, path);
  }
  let data = null;
  try { data = await res.json(); } catch (e) { caught(e, 'parse ' + path); }
  if (!res.ok) throw new ApiError(res.status, data, path);
  return data;
}

async function tryRefresh() {
  const rt = storageGet(REFRESH_KEY);
  if (!rt) return false;
  try {
    const data = await raw('/auth/refresh', { method: 'POST', body: { refresh_token: rt } });
    if (data && data.access_token) {
      storageSet(TOKEN_KEY, data.access_token);
      if (data.refresh_token) storageSet(REFRESH_KEY, data.refresh_token);
      return true;
    }
  } catch (e) { caught(e, 'tryRefresh'); }
  return false;
}

export async function request(path, opts = {}) {
  const token = storageGet(TOKEN_KEY);
  try {
    return await raw(path, { ...opts, token });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401 && token && !opts._retried) {
      const ok = await tryRefresh();
      if (ok) return request(path, { ...opts, _retried: true });
      warn('sesi berakhir, membersihkan token');
      clearSession();
      window.location.replace(window.location.pathname);
    }
    throw e;
  }
}

export const get = (path, query) => request(path, { query });
export const post = (path, body) => request(path, { method: 'POST', body });
export const put = (path, body) => request(path, { method: 'PUT', body });
export const patch = (path, body) => request(path, { method: 'PATCH', body });
export const del = (path) => request(path, { method: 'DELETE' });
