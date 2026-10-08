// N6 New Era — autentikasi. Memiliki layar login (alur sesi).
import { TIER_ROLE, TOKEN_KEY, REFRESH_KEY } from './config.js';
import { request, post, clearSession, ApiError } from './api.js';
import { setUser, getUser, clearUser } from './store.js';
import { caught, warn } from './logger.js';
import { esc } from './utils.js';

export function tierToRole(tier) {
  return TIER_ROLE[tier] ?? null;
}

function saveTokens(data) {
  try {
    localStorage.setItem(TOKEN_KEY, data.access_token);
    if (data.refresh_token) localStorage.setItem(REFRESH_KEY, data.refresh_token);
  } catch (e) { caught(e, 'saveTokens'); }
}

export async function login(username, password) {
  const data = await post('/auth/login', { username, password });
  saveTokens(data);
  const me = await request('/auth/me');
  setUser(me);
  return me;
}

export async function logout() {
  try { await post('/auth/logout', {}); } catch (e) { caught(e, 'logout'); }
  clearSession();
  clearUser();
}

export async function currentUser() {
  const cached = getUser();
  if (cached) return cached;
  try {
    const me = await request('/auth/me');
    setUser(me);
    return me;
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 0)) {
      warn('tidak ada sesi valid');
      return null;
    }
    throw e;
  }
}

// Layar login: satu aksi utama (Masuk). Validasi inline.
export function renderLogin(container, onSuccess) {
  container.innerHTML =
    '<div class="login-wrap">' +
    '<img class="login-logo" src="assets/images/logo-black.png" alt="NUMBER SIX">' +
    '<form class="login-form" id="loginForm" novalidate>' +
    '<label class="field"><span>Username</span>' +
    '<input type="text" name="username" autocomplete="username" required></label>' +
    '<label class="field"><span>Password</span>' +
    '<input type="password" name="password" autocomplete="current-password" required></label>' +
    '<p class="form-error" id="loginError" role="alert" hidden></p>' +
    '<button type="submit" class="btn btn-primary" id="loginBtn">Masuk</button>' +
    '</form></div>';

  const form = container.querySelector('#loginForm');
  const errEl = container.querySelector('#loginError');
  const btn = container.querySelector('#loginBtn');

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const username = form.username.value.trim();
    const password = form.password.value;
    errEl.hidden = true;
    if (!username || !password) {
      errEl.textContent = 'Isi username dan password.';
      errEl.hidden = false;
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Memeriksa…';
    try {
      const me = await login(username, password);
      onSuccess(me);
    } catch (e) {
      caught(e, 'login');
      errEl.textContent = e instanceof ApiError && e.status === 401
        ? 'Username atau password salah.'
        : 'Terjadi gangguan, coba lagi.';
      errEl.hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = 'Masuk';
    }
  });
}
