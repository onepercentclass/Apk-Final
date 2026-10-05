/** Listener global: klik (data-act), input uang, keyboard, resize, dan perubahan tema sistem. */

import { A } from './actions.js';
import { go, render } from './nav.js';
import { S, U } from './store.js';
import { $, money } from './utils.js';
import { drawCharts } from '../ui/charts.js';
import { closeModal } from '../ui/modal.js';

let rz;

/** Memasang listener modul ini. Dipanggil sekali dari main.js. */
export function initEvents() {
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el) {
      return;
    }
    const f = A[el.dataset.act];
    if (f) {
      f(el.dataset.v, el, e);
    }
  });

  document.addEventListener('input', e => {
    if (e.target.matches('[data-money]')) {
      e.target.value = money(e.target.value);
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#modal').classList.contains('on')) {
      closeModal();
    }
    if (e.key === 'Enter' && e.target.closest('.sheet') && e.target.tagName === 'INPUT') {
      const b = $('.sheet [data-act="form-ok"],.sheet [data-act="tx-save"],.sheet [data-act="acct-save"]');
      b && b.click();
    }
    if (e.key === 'Enter' && e.target.id === 'gs') {
      U.f.q = e.target.value;
      U.f.type = 'all';
      go('tx');
    }
  });

  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(drawCharts, 120);
  });

  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (S.theme === 'system') {
      render();
    }
  });
}
