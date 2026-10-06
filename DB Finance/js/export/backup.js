/** Validasi dan pemulihan backup JSON. */

import { commit } from '../core/nav.js';
import { S, U, replaceState } from '../core/store.js';
import { applyTheme } from '../core/theme.js';
import { TODAY_S } from '../core/utils.js';
import { confirmBox } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

/** Memeriksa struktur berkas backup; mengembalikan data valid atau null. */
function validBackup(o) {
  const d = o && typeof o === 'object' ? (o.data || o) : null;
  if (!d || !Array.isArray(d.txs) || !Array.isArray(d.accounts) || !d.accounts.length || !d.opening || typeof d.opening !== 'object') {
    return null;
  }
  if (!d.budgets || typeof d.budgets !== 'object' || !Array.isArray(d.bills) || !Array.isArray(d.goals) || !Array.isArray(d.invest)) {
    return null;
  }
  const ids = new Set(d.accounts.map(a => a && a.id));
  if (ids.size !== d.accounts.length || ids.has(undefined)) {
    return null;
  }
  for (const t of d.txs) {
    if (!t || typeof t.id !== 'string' || !(t.amount > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(t.date || '')) {
      return null;
    }
    if (t.type === 'tf') {
      if (!ids.has(t.from) || !ids.has(t.to)) {
        return null;
      }
    }
    else if ((t.type !== 'in' && t.type !== 'out') || !ids.has(t.acct)) {
      return null;
    }
  }
  return d;
}

/** Memasang listener modul ini. Dipanggil sekali dari main.js. */
export function initRestore() {
  document.addEventListener('change', async (e) => {
    if (e.target.id !== 'restore-file' || !e.target.files[0]) {
      return;
    }
    let d = null;
    try {
      d = validBackup(JSON.parse(await e.target.files[0].text()));
    }
    catch (x) {
    }
    if (!d) {
      toast('Berkas backup tidak valid');
      return;
    }
    confirmBox('Pulihkan backup ini? Data saat ini (' + S.txs.length + ' transaksi) akan diganti dengan ' + d.txs.length + ' transaksi dari berkas.', () => {
      d.txs.forEach((t, i) => {
        if (typeof t.ts !== 'number') {
          t.ts = i + 1;
        }
      });
      replaceState(d);
      if (!S.theme) {
        S.theme = 'dark';
      }
      if (!S.name) {
        S.name = 'Pengguna';
      }
      applyTheme();
      U.month = TODAY_S.slice(0, 7);
      U.f = { q: '', type: 'all' };
      commit();
      toast('Backup berhasil dipulihkan');
    }, 'Pulihkan');
  });
}
