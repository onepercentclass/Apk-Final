/** Menu Anggaran: batas pengeluaran per kategori. */

import { registerActions } from '../core/actions.js';
import { budTotal, spentBy } from '../core/calc.js';
import { CAT, catById } from '../core/catalog.js';
import { S, U } from '../core/store.js';
import { MONTHS, fmt } from '../core/utils.js';
import { bar, barCls, ciEl, pageHead } from '../ui/components.js';
import { openForm } from '../ui/form.js';
import { toast } from '../ui/toast.js';

/** Halaman Anggaran. */
export function renderAnggaran() {
  const mk = U.month, sp = spentBy(mk), tot = budTotal(), used = Object.values(sp).reduce((a, b) => a + b, 0), p = tot ? Math.round(used / tot * 100) : 0;
  return `${pageHead('Anggaran', 'Batas pengeluaran per kategori')}
 <div class="card hero" style="margin-bottom:14px"><small class="mu">Total Anggaran</small><div class="big">${fmt(tot)}</div>
  <div class="cols"><div><small>Terpakai</small><b>${fmt(used)}</b></div><div><small>${tot - used >= 0 ? 'Sisa' : 'Melebihi'}</small><b class="${tot - used >= 0 ? 'g-t' : 'r-t'}">${fmt(Math.abs(tot - used))}</b></div></div>
  ${bar(p, barCls(p))}<div class="gl-r"><span>${p}% terpakai</span><span>${MONTHS[+mk.slice(5, 7) - 1]} ${mk.slice(0, 4)}</span></div></div>
 <div class="card-h" style="margin:18px 2px 10px"><h3>Kategori Anggaran</h3><span class="mu" style="font-size:12px">Ketuk untuk mengubah batas</span></div>
 <div class="bgt-grid">${CAT.out.map(c => {
        const lim = S.budgets[c.id] || 0, s = sp[c.id] || 0, pp = lim ? Math.round(s / lim * 100) : (s ? 100 : 0);
        return `<button class="card bgt" data-act="bud-edit" data-v="${c.id}"><div class="top">${ciEl(c)}<div class="m"><b>${c.n}</b><small>${fmt(s)} / ${fmt(lim)}</small></div><span class="pc ${pp >= 100 ? 'r-t' : ''}">${pp}%</span></div>${bar(pp, barCls(pp))}</button>`;
    }).join('')}</div>`;
}

registerActions({
  'bud-edit': id => {
    const c = catById(id);
    openForm('Anggaran ' + c.n, [{ k: 'v', l: 'Batas per bulan', t: 'money', v: S.budgets[id] || 0 }], 'Simpan', v => {
      S.budgets[id] = v.v;
      toast('Anggaran diperbarui');
    });
  },
});
