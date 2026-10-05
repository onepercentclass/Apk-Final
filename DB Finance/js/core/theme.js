/** Penerapan tema terang / gelap / sistem. */

import { S } from './store.js';

export function applyTheme() {
  const r = document.documentElement;
  if (S.theme === 'system') {
    r.removeAttribute('data-theme');
  }
  else {
    r.setAttribute('data-theme', S.theme);
  }
}

export const isDark = () => S.theme === 'dark' || (S.theme === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
