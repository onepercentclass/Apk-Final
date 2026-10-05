/**
 * N6 - API login gate
 *
 * When js/core/env.js has API_ENABLED = true, the dashboard may not render
 * until the browser holds a valid bearer token. This module blocks the
 * bootstrap in js/app.js until one of these happens:
 *
 *   1. a stored token validates against GET auth/me            -> continue
 *   2. the stored token is rejected (401) but a refresh works   -> continue
 *   3. otherwise a minimal login form is shown; on a successful
 *      POST auth/login the token pair is stored and the bootstrap continues
 *
 * When the API is disabled this module resolves immediately and nothing
 * changes for the localStorage-only dashboards.
 *
 * The form reuses the .n6-boot splash classes already inlined in index.html
 * (the only CSS guaranteed to exist before the role stylesheets load) plus a
 * small <style> block for the inputs. No role markup, no tier logic here.
 */

import { CONFIG, apiEnabled } from './env.js';
import { setSession } from './access.js';
import { el } from './dom.js';

const MOUNT_ID = 'n6-app';

const FORM_CSS = `
.n6-login__form { display: flex; flex-direction: column; gap: 10px; width: min(320px, 90vw); }
.n6-login__input {
  padding: 11px 14px; font-size: 14px; border-radius: 10px;
  border: 1px solid rgba(17,17,16,.18); background: #fff; color: #111110;
  font-family: inherit;
}
.n6-login__input:focus { outline: 2px solid #D62828; outline-offset: 1px; border-color: #D62828; }
.n6-login__button {
  padding: 11px 14px; font-size: 14px; font-weight: 700; letter-spacing: .03em;
  border: none; border-radius: 10px; background: #D62828; color: #fff;
  cursor: pointer; font-family: inherit;
}
.n6-login__button:disabled { opacity: .6; cursor: wait; }
.n6-login__error { min-height: 20px; font-size: 13px; font-weight: 600; color: #B71F1F; }
`;

/**
 * Show the login form inside #n6-app. Resolves with the user profile from
 * GET auth/me once the credentials are accepted.
 */
function showLoginForm(role, api) {
  const mount = document.getElementById(MOUNT_ID);
  if (!mount) throw new Error(`missing #${MOUNT_ID}`);

  return new Promise((resolve) => {
    document.title = `Masuk — ${role.title}`;
    mount.innerHTML = '';

    const error = el('p', { class: 'n6-login__error', role: 'alert', text: '' });
    const username = el('input', {
      class: 'n6-login__input', type: 'text', name: 'username',
      placeholder: 'Username', autocomplete: 'username', required: true,
    });
    const password = el('input', {
      class: 'n6-login__input', type: 'password', name: 'password',
      placeholder: 'Password', autocomplete: 'current-password', required: true,
    });
    const button = el('button', { class: 'n6-login__button', type: 'submit', text: 'Masuk' });
    const form = el('form', { class: 'n6-login__form', action: '#', method: 'post' }, [
      username, password, button,
    ]);

    mount.append(
      el('style', { html: FORM_CSS }),
      el('div', { class: 'n6-boot' }, [
        el('h1', { text: role.title }),
        el('p', { class: 'n6-boot__text', text: 'Masuk untuk membuka dashboard' }),
        form,
        error,
      ]),
    );
    username.focus();

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      error.textContent = '';
      button.disabled = true;
      button.textContent = 'Memeriksa…';
      try {
        const pair = await api.endpoints.auth.login({
          username: username.value.trim(),
          password: password.value,
        });
        api.setToken(pair.access_token);
        if (pair.refresh_token) api.setRefreshToken(pair.refresh_token);
        resolve(await api.endpoints.auth.me());
      } catch (err) {
        error.textContent =
          err instanceof api.ApiError && err.status === 401
            ? 'Username atau password salah.'
            : 'Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.';
      } finally {
        button.disabled = false;
        button.textContent = 'Masuk';
      }
    });
  });
}

/**
 * Block until the browser holds a valid API token. Returns the user profile
 * (or null when the API is disabled). Import of js/core/api.js is lazy so a
 * local-only deployment never loads the HTTP client.
 */
export async function ensureApiLogin(role) {
  if (!apiEnabled()) return null;
  const api = await import('./api.js');

  let me = null;
  if (api.getToken()) {
    try {
      me = await api.endpoints.auth.me();
    } catch (err) {
      const unauthorized = err instanceof api.ApiError && err.status === 401;
      if (unauthorized && api.getRefreshToken()) {
        try {
          const pair = await api.endpoints.auth.refresh();
          api.setToken(pair.access_token);
          if (pair.refresh_token) api.setRefreshToken(pair.refresh_token);
          me = await api.endpoints.auth.me();
        } catch {
          me = null; // refresh failed -> fall through to the login form
        }
      }
      if (!me && unauthorized) api.clearTokens();
    }
  }
  if (!me) me = await showLoginForm(role, api);

  setSession({
    userId: me.id,
    displayName: me.full_name || me.username,
    // Hak akses milik user ini — SATU-SATUNYA dasar gate di frontend.
    // Dihitung server dari tier di DB (GET /api/n6/v1/auth/me).
    backend: {
      tier: me.tier,
      role: me.role,
      menus: me.menus || [],
      actions: me.actions || {},
    },
  });
  try {
    window.localStorage.setItem(CONFIG.API_USER_KEY, JSON.stringify(me));
  } catch {
    /* storage unavailable */
  }
  return me;
}

export default { ensureApiLogin };
