/** Tooltip grafik untuk mouse dan sentuhan. */

import { $, esc } from '../core/utils.js';

const tip = $('#tip');

function showTip(el, e) {
  const p = el.dataset.tip.split('|');
  tip.innerHTML = `<b>${esc(p[0])}</b>${p.slice(1).map(esc).join('<br>')}`;
  tip.style.display = 'block';
  posTip(e);
}

function posTip(e) {
  const w = tip.offsetWidth, h = tip.offsetHeight;
  let x = e.clientX + 14, y = e.clientY - h - 10;
  if (x + w > innerWidth - 8) {
    x = e.clientX - w - 14;
  }
  if (y < 8) {
    y = e.clientY + 16;
  }
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
}

/** Memasang listener modul ini. Dipanggil sekali dari main.js. */
export function initTooltip() {
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-tip]');
    if (t) {
      showTip(t, e);
    }
    else {
      tip.style.display = 'none';
    }
  });

  document.addEventListener('mousemove', e => {
    if (tip.style.display === 'block') {
      posTip(e);
    }
  });

  document.addEventListener('touchstart', e => {
    const t = e.target.closest('[data-tip]');
    if (t) {
      const c = e.touches[0];
      showTip(t, c);
      setTimeout(() => tip.style.display = 'none', 2200);
    }
    else {
      tip.style.display = 'none';
    }
  }, { passive: true });
}
