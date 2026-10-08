// N6 New Era — logger terpusat. Semua modul mencatat lewat sini;
// catch kosong dilarang.
import { DEBUG_KEY } from './config.js';

const ORDER = { debug: 0, info: 1, warn: 2, error: 3 };
let level = 'warn';

export function initLogger() {
  try {
    const q = new URLSearchParams(window.location.search);
    const on = q.get('debug') === '1' || localStorage.getItem(DEBUG_KEY) === '1';
    level = on ? 'debug' : 'warn';
  } catch (e) {
    level = 'warn';
  }
}

function emit(lv, args) {
  if (ORDER[lv] < ORDER[level]) return;
  const fn = lv === 'debug' ? 'log' : lv;
  console[fn]('[n6]', ...args);
}

export const debug = (...args) => emit('debug', args);
export const info = (...args) => emit('info', args);
export const warn = (...args) => emit('warn', args);
export const error = (...args) => emit('error', args);

// Catat error yang ditangkap agar tidak hilang diam-diam.
export function caught(err, context = '') {
  error('caught', context, err && err.message ? err.message : err);
}
