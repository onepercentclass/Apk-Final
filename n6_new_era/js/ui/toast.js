// N6 New Era — toast: notifikasi singkat sukses/gagal.
import { esc } from '../core/utils.js';

let host = null;

function ensureHost() {
  if (host) return host;
  host = document.createElement('div');
  host.className = 'toast-host';
  host.setAttribute('aria-live', 'polite');
  document.body.appendChild(host);
  return host;
}

export function toast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.textContent = message;
  ensureHost().appendChild(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 300);
  }, 2800);
}
