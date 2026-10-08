// N6 New Era — state global minimal: pengguna aktif.
import { USER_KEY } from './config.js';
import { caught } from './logger.js';

let user = null;

export function setUser(u) {
  user = u || null;
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch (e) { caught(e, 'setUser'); }
}

export function getUser() {
  if (user) return user;
  try {
    const raw = localStorage.getItem(USER_KEY);
    user = raw ? JSON.parse(raw) : null;
  } catch (e) { caught(e, 'getUser'); user = null; }
  return user;
}

export function clearUser() {
  user = null;
  try { localStorage.removeItem(USER_KEY); } catch (e) { caught(e, 'clearUser'); }
}
