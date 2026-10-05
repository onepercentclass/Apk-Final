/** Menu Investasi: portofolio dan imbal hasil. */

import { registerActions } from '../core/actions.js';
import { ic } from '../core/icons.js';
import { commit } from '../core/nav.js';
import { S } from '../core/store.js';
import { esc, fmt, sgn, uid } from '../core/utils.js';
import { donut } from '../ui/charts.js';
import { ciEl, pageHead } from '../ui/components.js';
import { openForm } from '../ui/form.js';
import { confirmBox } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

/** Halaman Investasi. */
export function renderInvestasi() {
  const L = S.invest, tot = L.reduce((a, i) => a + i.val, 0), gain = L.reduce((a, i) => a + i.val * i.ret / (100 + i.ret), 0), ret = tot ? Math.round(gain / (tot - gain) * 1000) / 10 : 0;
  return `${pageHead('Investasi', 'Portofolio dan imbal hasil', { back: 1, month: false, extra: `<button class="btn pri" data-act="inv-add">${ic('plus', 16)}Tambah</button>` })}
 <div class="two-c"><div class="card hero"><small class="mu">Total Nilai Investasi</small><div class="big">${fmt(tot)}</div><span class="tr ${ret >= 0 ? 'g' : 'r'}">${ic(ret >= 0 ? 'aup' : 'adn', 13)}${sgn(ret)} <i>imbal hasil gabungan</i></span></div>
 <div class="card"><div class="dn">${donut(L.map(i => ({ v: i.val, c: i.c, tip: i.n + '|' + fmt(i.val) })), 130, 18, `<b>${L.length}</b><small>Aset</small>`)}<div class="lgd">${L.map(i => `<div><i style="background:${i.c}"></i><span>${esc(i.n)}</span><b>${tot ? Math.round(i.val / tot * 100) : 0}%</b></div>`).join('')}</div></div></div></div>
 <div class="card" style="margin-top:14px"><div class="card-h"><h3>Portofolio</h3></div><div class="list">${L.map(i => `<div class="mini">${ciEl(i)}<div class="m"><b>${esc(i.n)}</b><small class="${i.ret >= 0 ? 'g-t' : 'r-t'}">${sgn(i.ret)}</small></div><div class="r">${fmt(i.val)}</div><button class="x" data-act="inv-edit" data-v="${i.id}" aria-label="Ubah investasi">${ic('edit', 16)}</button><button class="x" data-act="inv-del" data-v="${i.id}" aria-label="Hapus">${ic('trash', 16)}</button></div>`).join('') || '<div class="empty"><b>Belum ada investasi</b>Tambahkan aset pertama Anda.</div>'}</div></div>`;
}

registerActions({
  'inv-add': () => openForm('Tambah Investasi', [{ k: 'n', l: 'Nama aset', t: 'text', v: '', p: 'Contoh: Obligasi' }, { k: 'val', l: 'Nilai saat ini', t: 'money', v: '' }, { k: 'ret', l: 'Imbal hasil (%)', t: 'num', v: '' }], 'Simpan', v => {
    if (!v.n || !v.val) {
      toast('Isi nama dan nilai');
      return false;
    }
    S.invest.push({ id: uid('i'), n: v.n, val: v.val, ret: v.ret, i: 'coins', c: ['#10b981', '#60a5fa', '#fbbf24', '#fb923c', '#a78bfa'][S.invest.length % 5] });
    toast('Investasi ditambahkan');
  }),
  'inv-del': id => confirmBox('Hapus investasi ini?', () => {
    S.invest = S.invest.filter(x => x.id !== id);
    commit();
  }),
  'inv-edit': id => {
    const i = S.invest.find(x => x.id === id);
    if (!i) {
      return;
    }
    openForm('Ubah Investasi', [{ k: 'n', l: 'Nama aset', t: 'text', v: i.n }, { k: 'val', l: 'Nilai saat ini', t: 'money', v: i.val }, { k: 'ret', l: 'Imbal hasil (%)', t: 'num', v: i.ret }], 'Simpan', v => {
      if (!v.n || !v.val) {
        toast('Isi nama dan nilai');
        return false;
      }
      i.n = v.n;
      i.val = v.val;
      i.ret = v.ret;
      toast('Investasi diperbarui');
    });
  },
});
