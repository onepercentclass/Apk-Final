/** Login gate untuk mode API (USE_API = true).
 *  Menampilkan form login sederhana sebelum aplikasi di-render bila
 *  belum ada token di localStorage. Tidak menyentuh sistem tier/UI lain.
 */
import { API_BASE, TOKEN_KEY } from './config.js';

/** Pesan sekali-pakai (mis. "sesi berakhir") dari handler 401 global. */
const MSG_KEY = 'dbfin-login-msg';

function markup(msg) {
  return `
  <div style="min-height:100dvh;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;">
    <div class="card" style="width:100%;max-width:360px;padding:24px;">
      <div class="card-h" style="margin-bottom:4px;"><h3>Masuk</h3></div>
      <p style="color:var(--mu);font-size:13px;margin:0 0 16px;">DB Track — masuk untuk memuat data dari server.</p>
      ${msg ? `<p style="color:var(--rd);font-size:13px;font-weight:700;margin:0 0 12px;">${msg}</p>` : ''}
      <form id="login-form" autocomplete="on">
        <div class="inp" style="margin-bottom:12px;">
          <input id="login-user" type="text" placeholder="Username" autocomplete="username"
                 required style="width:100%;box-sizing:border-box;">
        </div>
        <div class="inp" style="margin-bottom:16px;">
          <input id="login-pass" type="password" placeholder="Password" autocomplete="current-password"
                 required style="width:100%;box-sizing:border-box;">
        </div>
        <button class="btn pri full" type="submit" id="login-btn">Masuk</button>
      </form>
    </div>
  </div>`;
}

/** POST /auth/login langsung (tidak lewat api.js agar 401 bisa dibedakan). */
async function tryLogin(username, password) {
  let res;
  try {
    res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch {
    return 'Server tidak terjangkau. Periksa koneksi lalu coba lagi.';
  }
  if (res.status === 401) return 'Username atau password salah.';
  if (!res.ok) return `Login gagal (${res.status}).`;
  const data = await res.json().catch(() => null);
  if (!data || !data.access_token) return 'Respons server tidak valid.';
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return null;
}

/**
 * Pastikan ada token sebelum boot. Resolve true hanya setelah login
 * berhasil (atau bila token sudah ada). Menampilkan ulang form dengan
 * pesan error bila kredensial ditolak.
 */
export function ensureLogin() {
  if (localStorage.getItem(TOKEN_KEY)) return Promise.resolve(true);
  let msg = sessionStorage.getItem(MSG_KEY) || '';
  sessionStorage.removeItem(MSG_KEY);
  return new Promise(resolve => {
    const attempt = () => {
      document.getElementById('app').innerHTML = markup(msg);
      document.getElementById('login-form').addEventListener('submit', async ev => {
        ev.preventDefault();
        const btn = document.getElementById('login-btn');
        btn.disabled = true;
        btn.textContent = 'Memeriksa...';
        const err = await tryLogin(
          document.getElementById('login-user').value.trim(),
          document.getElementById('login-pass').value,
        );
        if (err) {
          msg = err;
          attempt();
        } else {
          resolve(true);
        }
      });
      document.getElementById('login-user').focus();
    };
    attempt();
  });
}
