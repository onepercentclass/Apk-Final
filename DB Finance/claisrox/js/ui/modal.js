/** Modal / bottom sheet dan kotak konfirmasi. */

import { registerActions } from '../core/actions.js';
import { ic } from '../core/icons.js';
import { $ } from '../core/utils.js';

function setSheet(html) {
  $('#modal .sheet').innerHTML = html;
}

/** Membuka modal, atau mengganti isinya bila sudah terbuka. */
export function openModal(html) {
  const m = $('#modal');
  if (m.classList.contains('on')) {
    setSheet(html);
    return;
  }
  m.innerHTML = `<div class="ov" data-act="close"></div><div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  m.classList.add('on');
  document.body.classList.add('lock');
}

export function closeModal() {
  const m = $('#modal');
  m.classList.remove('on');
  m.innerHTML = '';
  document.body.classList.remove('lock');
}

export const shH = t => `<div class="sh-h"><h2>${t}</h2><button class="x" data-act="close" aria-label="Tutup">${ic('x', 18)}</button></div>`;

let CB = null;

/** Kotak konfirmasi dengan aksi yang dijalankan saat disetujui. */
export function confirmBox(msg, fn, label = 'Hapus') {
  CB = fn;
  openModal(`${shH('Konfirmasi')}<p style="margin-bottom:6px">${msg}</p><div class="acts"><button class="btn" data-act="close">Batal</button><button class="btn danger" data-act="confirm-yes">${label}</button></div>`);
}

registerActions({
  close: () => closeModal(),
  'confirm-yes': () => {
    const f = CB;
    CB = null;
    closeModal();
    f && f();
  },
});
