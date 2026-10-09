/** Menu Tujuan Keuangan: target tabungan. */

import { registerActions } from '../core/actions.js';
import { ic } from '../core/icons.js';
import { commit } from '../core/nav.js';
import { S } from '../core/store.js';
import { esc, fmt, uid } from '../core/utils.js';
import { bar, ciEl, pageHead } from '../ui/components.js';
import { openForm } from '../ui/form.js';
import { confirmBox } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

/** Halaman Tujuan Keuangan. */
export function renderTujuan() {
  const G = S.goals, tg = G.reduce((a, g) => a + g.target, 0), sv = G.reduce((a, g) => a + g.saved, 0), pp = tg ? Math.round(sv / tg * 100) : 0;
  const sm = (l, v, sub, cls = '') => `<div class="card"><small>${l}</small><b class="${cls}">${v}</b><small style="display:block;margin-top:2px">${sub}</small></div>`;
  return `${pageHead('Tujuan Keuangan', 'Wujudkan target tabunganmu', { back: 1, month: false, extra: `<button class="btn pri" data-act="goal-add">${ic('plus', 16)}Tujuan Baru</button>` })}
 <div class="sumrow">${sm('Total Target', fmt(tg), G.length + ' tujuan aktif')}${sm('Dana Terkumpul', fmt(sv), 'Sisa ' + fmt(Math.max(0, tg - sv)), 'g-t')}${sm('Progres Keseluruhan', pp + '%', 'dari total target')}</div>
 <div class="gl-grid">${G.map(g => {
        const p = g.target ? Math.round(g.saved / g.target * 100) : 0;
        return `<div class="card gcard"><div class="gtop">${ciEl(g, 20, 'lg')}<div class="m"><b>${esc(g.n)}</b><small>Target ${fmt(g.target)}</small></div><span class="badge ${p >= 100 ? '' : 'a'}">${p >= 100 ? 'Tercapai' : p + '%'}</span></div>
  <div class="gamt">${fmt(g.saved)}</div><div class="gsub">terkumpul dari ${fmt(g.target)}</div>${bar(p)}<div class="gl-r"><span>Sisa ${fmt(Math.max(0, g.target - g.saved))}</span><span>${p}%</span></div>
  <div class="rowbtn"><button class="btn sm" data-act="goal-fund" data-v="${g.id}" style="flex:1">${ic('plus', 15)}Tambah dana</button><button class="btn sm" data-act="goal-edit" data-v="${g.id}" aria-label="Ubah tujuan">${ic('edit', 15)}</button><button class="btn danger sm" data-act="goal-del" data-v="${g.id}" aria-label="Hapus tujuan">${ic('trash', 15)}</button></div></div>`;
    }).join('')}
  <button class="card gadd" data-act="goal-add"><span class="ci">${ic('plus', 20)}</span>Tambah tujuan baru</button></div>`;
}

registerActions({
  'goal-add': () => openForm('Tujuan Keuangan Baru', [{ k: 'n', l: 'Nama tujuan', t: 'text', v: '', p: 'Contoh: Beli motor' }, { k: 'target', l: 'Target dana', t: 'money', v: '' }, { k: 'saved', l: 'Dana terkumpul', t: 'money', v: '' }], 'Simpan', v => {
    if (!v.n || !v.target) {
      toast('Isi nama dan target dana');
      return false;
    }
    S.goals.push({ id: uid('g'), n: v.n, saved: v.saved, target: v.target, i: 'target', c: ['#10b981', '#8b5cf6', '#fbbf24', '#60a5fa', '#fb923c'][S.goals.length % 5] });
    toast('Tujuan ditambahkan');
  }),
  'goal-fund': id => openForm('Tambah Dana', [{ k: 'a', l: 'Nominal', t: 'money', v: '' }], 'Tambahkan', v => {
    if (!v.a) {
      toast('Masukkan nominal');
      return false;
    }
    const g = S.goals.find(x => x.id === id);
    g.saved += v.a;
    toast('Dana ditambahkan');
  }),
  'goal-del': id => confirmBox('Hapus tujuan ini?', () => {
    S.goals = S.goals.filter(x => x.id !== id);
    commit();
  }),
  'goal-edit': id => {
    const g = S.goals.find(x => x.id === id);
    if (!g) {
      return;
    }
    openForm('Ubah Tujuan', [{ k: 'n', l: 'Nama tujuan', t: 'text', v: g.n }, { k: 'target', l: 'Target dana', t: 'money', v: g.target }, { k: 'saved', l: 'Dana terkumpul', t: 'money', v: g.saved }], 'Simpan', v => {
      if (!v.n || !v.target) {
        toast('Isi nama dan target dana');
        return false;
      }
      g.n = v.n;
      g.target = v.target;
      g.saved = v.saved;
      toast('Tujuan diperbarui');
    });
  },
});
