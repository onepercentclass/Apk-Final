/** Klien HTTP tipis untuk API server. Tidak dipanggil selama USE_API = false. */
import { API_BASE, TOKEN_KEY } from '../config.js';

async function request(method, path, body) {
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(API_BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401) {
    // Token kedaluwarsa/tidak valid: buang token, beri tahu via event,
    // dan siapkan pesan untuk form login berikutnya.
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.setItem('dbfin-login-msg', 'Sesi berakhir, silakan login kembali.');
    window.dispatchEvent(new CustomEvent('api:unauthorized'));
  }
  if (!res.ok) throw new Error(`${method} ${path} gagal (${res.status})`);
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: path => request('GET', path),
  put: (path, body) => request('PUT', path, body),
};
