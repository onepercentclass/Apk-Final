/**
 * N6 - runtime environment switches
 *
 * Single place to flip the data layer from local-only to server-backed.
 *
 *   API_ENABLED = false  -> js/core/storage.js is the only data source.
 *                           Nothing in the app performs a network request.
 *   API_ENABLED = true   -> js/core/api.js talks to API_BASE_URL and the
 *                           repository in js/core/storage.js falls through to
 *                           the HTTP client. Tier checks then happen on the
 *                           server as well, because the backend enforces the
 *                           same backend/tiers/*.json matrix.
 *
 * The unified backend serves N6 under the /api/n6 namespace, so the default
 * base below already includes it: https://api.denisbergkam.com/api/n6/v1/...
 *
 * Flip it here, or override from the shell before the module is evaluated:
 *
 *   <script>window.N6_ENV = { API_ENABLED: true };</script>
 *   <script type="module" src="js/app.js"></script>
 */

const overrides = (typeof window !== 'undefined' && window.N6_ENV) || {};

export const ENV = {
  /**
   * Master switch for the server data layer.
   * On: the dashboard reads/writes through the unified backend and shows a
   * login gate before anything renders (see js/core/login.js).
   */
  API_ENABLED: true,

  /**
   * Base URL of the REST API. Trailing slash is normalised away.
   * Unified backend namespace for N6 is /api/n6 (endpoints keep /v1/...).
   * Untuk coba lokal, ganti host menjadi http://localhost:8000
   * (path /api/n6 tetap dipakai): 'http://localhost:8000/api/n6'
   */
  API_BASE_URL: 'https://api.denisbergkam.com/api/n6',

  /** Version segment appended to API_BASE_URL, i.e. https://api.denisbergkam.com/api/v1. */
  API_PREFIX: '/v1',

  /** Abort a request after this many milliseconds. */
  API_TIMEOUT_MS: 15000,

  /** Bearer token injected by the backend on a successful login. */
  API_TOKEN_KEY: 'n6:api:token',

  /** Refresh token from the login token pair, used to mint new access tokens. */
  API_REFRESH_TOKEN_KEY: 'n6:api:refresh',

  /** currentUser profile cached after login. */
  API_USER_KEY: 'n6:api:user',

  /** Log every request/response pair to the console. Noisy; off in production. */
  API_DEBUG: false,

  /** Persist state to localStorage. Always on while the API is disabled. */
  PERSIST_LOCAL: true,
};

export const CONFIG = Object.freeze({ ...ENV, ...overrides });

/** Fully qualified base for a v1 endpoint, e.g. getUrl('clients'). */
export function getUrl(path) {
  const base = String(CONFIG.API_BASE_URL).replace(/\/+$/, '');
  const prefix = String(CONFIG.API_PREFIX || '').replace(/\/+$/, '');
  const tail = String(path || '').replace(/^\/+/, '');
  return `${base}${prefix}/${tail}`;
}

/** True when the app should read and write through the REST API. */
export function apiEnabled() {
  return CONFIG.API_ENABLED === true;
}

export default CONFIG;