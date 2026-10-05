/**
 * N6 - REST client for the unified backend (https://n6sport.id/api/n6)
 *
 * ACTIVE BY DEFAULT. js/core/env.js sets API_ENABLED = true, so the
 * dashboard reads/writes through this module and js/core/login.js gates the
 * bootstrap behind POST /v1/auth/login. Set API_ENABLED = false to go back to
 * the localStorage-only dashboards.
 *
 * Turning it off is a two-step change:
 *
 *   1. js/core/env.js      ->  API_ENABLED: false
 *   2. js/core/storage.js  ->  getRepository() already falls back to the
 *                             localStorage repository when the API is off
 *
 * The endpoints below mirror the routers in backend/app/api/v1/endpoints/.
 * Every path is expressed with the same verbs and the same path parameters,
 * so the client and the server can be diffed against each other.
 *
 * Security note: the client-side tier check in js/core/access.js is a UX
 * affordance only. It hides navigation so a user does not wander into a view
 * they cannot use. The real enforcement lives in
 * backend/app/api/deps.py, which loads backend/tiers/*.json and rejects the
 * request server-side. Never trust a client for an authorization decision.
 */

import { CONFIG, getUrl, apiEnabled } from './env.js';

/* --------------------------------------------------------------- transport */

export class ApiError extends Error {
  constructor(status, body, url) {
    super(`[n6] ${status} ${url}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
    this.url = url;
  }
}

export function getToken() {
  try {
    return window.localStorage.getItem(CONFIG.API_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(CONFIG.API_TOKEN_KEY, token);
    else window.localStorage.removeItem(CONFIG.API_TOKEN_KEY);
  } catch { /* storage unavailable */ }
}

export function getRefreshToken() {
  try {
    return window.localStorage.getItem(CONFIG.API_REFRESH_TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

export function setRefreshToken(token) {
  try {
    if (token) window.localStorage.setItem(CONFIG.API_REFRESH_TOKEN_KEY, token);
    else window.localStorage.removeItem(CONFIG.API_REFRESH_TOKEN_KEY);
  } catch { /* storage unavailable */ }
}

/** Drop both tokens, e.g. after the server rejects them. */
export function clearTokens() {
  setToken(null);
  setRefreshToken(null);
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** fetch with timeout, JSON in, JSON out, bearer token attached. */
export async function request(path, { method = 'GET', body, query, signal } = {}) {
  if (!apiEnabled()) {
    throw new ApiError(0, { detail: 'API is disabled. Set API_ENABLED = true in js/core/env.js.' }, path);
  }
  const url = new URL(getUrl(path));
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT_MS);
  if (signal) signal.addEventListener('abort', () => controller.abort(), { once: true });

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...authHeaders(),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const payload = isJson ? await res.json().catch(() => null) : await res.text();

    if (CONFIG.API_DEBUG) console.debug(`[n6:api] ${method} ${url}`, res.status, payload);
    if (!res.ok) throw new ApiError(res.status, payload, String(url));
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

/* -------------------------------------------------------------- endpoints *
 * Names match the FastAPI routers 1:1. Grouped by menu so the two can be
 * read side by side.
 * -------------------------------------------------------------------------- */

export const endpoints = {
  auth: {
    login: (body) => request('auth/login', { method: 'POST', body }),
    me: () => request('auth/me'),
    refresh: () => request('auth/refresh', { method: 'POST', body: { refresh_token: getRefreshToken() } }),
    logout: () => request('auth/logout', { method: 'POST' }),
    changePassword: (body) => request('auth/password', { method: 'PUT', body }),
  },

  accounts: {
    list: (query) => request('accounts', { query }),
    create: (body) => request('accounts', { method: 'POST', body }),
    update: (id, body) => request(`accounts/${id}`, { method: 'PATCH', body }),
    setTier: (id, tier) => request(`accounts/${id}/tier`, { method: 'PUT', body: { tier } }),
    deactivate: (id) => request(`accounts/${id}`, { method: 'DELETE' }),
  },

  clients: {
    list: (query) => request('clients', { query }),
    get: (id) => request(`clients/${id}`),
    create: (body) => request('clients', { method: 'POST', body }),
    update: (id, body) => request(`clients/${id}`, { method: 'PATCH', body }),
    archive: (id, body) => request(`clients/${id}/archive`, { method: 'POST', body }),
    remove: (id) => request(`clients/${id}`, { method: 'DELETE' }),
    exportCsv: (query) => request('clients/export', { query }),
  },

  clientSchedule: {
    list: (clientId, query) => request(`schedules/clients/${clientId}`, { query }),
    save: (clientId, body) => request(`schedules/clients/${clientId}`, { method: 'PUT', body }),
  },

  coachSchedule: {
    get: (query) => request('schedules/coach', { query }),
    save: (body) => request('schedules/coach', { method: 'PUT', body }),
    listRequests: (query) => request('schedules/coach/requests', { query }),
    decideRequest: (id, body) => request(`schedules/coach/requests/${id}`, { method: 'PUT', body }),
  },

  pricing: {
    get: () => request('pricing'),
    save: (body) => request('pricing', { method: 'PUT', body }),
  },

  finance: {
    summary: (query) => request('finance/summary', { query }),
    listExpenses: (query) => request('finance/expenses', { query }),
    createExpense: (body) => request('finance/expenses', { method: 'POST', body }),
    deleteExpense: (id) => request(`finance/expenses/${id}`, { method: 'DELETE' }),
    monthly: (query) => request('finance/monthly', { query }),
  },

  commissions: {
    summary: (query) => request('commissions/summary', { query }),
    setRate: (coachId, body) => request(`commissions/${coachId}`, { method: 'PUT', body }),
    payout: (coachId, body) => request(`commissions/${coachId}/payout`, { method: 'POST', body }),
  },

  tickets: {
    list: (query) => request('tickets', { query }),
    reply: (id, body) => request(`tickets/${id}/reply`, { method: 'POST', body }),
    close: (id, body) => request(`tickets/${id}/close`, { method: 'POST', body }),
  },

  messages: {
    list: (query) => request('messages', { query }),
    send: (body) => request('messages', { method: 'POST', body }),
    broadcast: (body) => request('messages/broadcast', { method: 'POST', body }),
    read: (id) => request(`messages/${id}/read`, { method: 'POST' }),
  },

  programs: {
    list: (query) => request('programs', { query }),
    get: (id) => request(`programs/${id}`),
    create: (body) => request('programs', { method: 'POST', body }),
    update: (id, body) => request(`programs/${id}`, { method: 'PATCH', body }),
    publish: (id) => request(`programs/${id}/publish`, { method: 'POST' }),
  },

  attendance: {
    list: (query) => request('attendance', { query }),
    record: (body) => request('attendance', { method: 'POST', body }),
  },

  monitoring: {
    clients: (query) => request('monitoring/clients', { query }),
    flags: (query) => request('monitoring/flags', { query }),
  },

  corrections: {
    list: (query) => request('corrections', { query }),
    create: (body) => request('corrections', { method: 'POST', body }),
    resolve: (id, body) => request(`corrections/${id}/resolve`, { method: 'POST', body }),
  },

  athletes: {
    list: (query) => request('athletes', { query }),
    update: (id, body) => request(`athletes/${id}`, { method: 'PUT', body }),
  },

  reports: {
    monthly: (query) => request('reports/monthly', { query }),
    generate: (body) => request('reports/monthly', { method: 'POST', body }),
    clientSummary: (clientId) => request(`reports/clients/${clientId}/summary`),
  },

  portal: {
    me: () => request('portal/me'),
    updateMe: (body) => request('portal/me', { method: 'PATCH', body }),
    reports: () => request('portal/reports'),
    summary: () => request('portal/reports/summary'),
    messages: (query) => request('portal/messages', { query }),
    sendMessage: (body) => request('portal/messages', { method: 'POST', body }),
  },
};

/* --------------------------------------------------------- repository *
 * Same shape as the localStorage repository in js/core/storage.js, so
 * initRepository() can hand back either one without touching call sites.
 * -------------------------------------------------------------------------- */

export function createApiRepository(role) {
  return {
    source: 'api',
    role,
    async get(key) {
      const map = {
        clients: () => endpoints.clients.list(),
        coachSchedule: () => endpoints.coachSchedule.get(),
        pricing: () => endpoints.pricing.get(),
        tickets: () => endpoints.tickets.list(),
        messages: () => endpoints.messages.list(),
      };
      const fn = map[key];
      return fn ? fn() : null;
    },
    async set(key, value) {
      const map = {
        clients: (id, v) => endpoints.clients.update(id, v),
        coachSchedule: (v) => endpoints.coachSchedule.save(v),
        pricing: (v) => endpoints.pricing.save(v),
      };
      const fn = map[key];
      if (!fn) throw new ApiError(0, { detail: `Key "${key}" is not writable over the API.` }, key);
      return fn(value?.id, value);
    },
    async remove() {
      throw new ApiError(0, { detail: 'Server-side deletion is exposed per resource, not per key.' }, 'remove');
    },
    async has() { return true; },
    async keys() { return Object.keys(endpoints); },
    async clear() {
      throw new ApiError(0, { detail: 'Bulk wipe is intentionally not available over the API.' }, 'clear');
    },
  };
}

export default { request, endpoints, ApiError, getToken, setToken, getRefreshToken, setRefreshToken, clearTokens, createApiRepository };