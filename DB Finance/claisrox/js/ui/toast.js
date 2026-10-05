/** Notifikasi singkat (toast). */

import { $ } from '../core/utils.js';

let toastT;

export function toast(m) {
  const t = $('#toast');
  t.textContent = m;
  t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), 2200);
}
