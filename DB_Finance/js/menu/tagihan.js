/** Menu Tagihan & Pengingat: jatuh tempo dan pembayaran tagihan. */

import { registerActions } from '../core/actions.js';
import { ic } from '../core/icons.js';
import { commit } from '../core/nav.js';
import { S } from '../core/store.js';
import { TODAY_S, addDays, addMonth, dayDiff, dlabel, esc, fmt, uid } from '../core/utils.js';
import { billDue, ciEl, pageHead } from '../ui/components.js';
import { openForm } from '../ui/form.js';
import { confirmBox } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

/** Halaman Tagihan & Pengingat. */
export function renderTagihan() {
  const L = [...S.bills].sort((a, b) => a.due.localeCompare(b.due));
  const tot = L.reduce((a, b) => a + b.amt, 0), soon = L.filter(b => {
    const d = dayDiff(b.due);
    return d >= 0 && d <= 7;
  }), late = L.filter(b => dayDiff(b.due) < 0);
  const sm = (l, v, sub, cls = '') => `<div class="card"><small>${l}</small><b class="${cls}">${v}</b><small style="display:block;margin-top:2px">${sub}</small></div>`;
  return `${pageHead('Tagihan & Pengingat', 'Jangan lewatkan jatuh tempo', { back: 1, month: false, extra: `<button class="btn pri" data-act="bill-add">${ic('plus', 16)}Tambah Tagihan</button>` })}
 <div class="sumrow">${sm('Total Tagihan Aktif', fmt(tot), L.length + ' tagihan')}${sm('Jatuh Tempo 7 Hari', fmt(soon.reduce((a, b) => a + b.amt, 0)), soon.length + ' tagihan', '')}${sm('Terlambat', fmt(late.reduce((a, b) => a + b.amt, 0)), late.length ? late.length + ' tagihan perlu dibayar' : 'Tidak ada tagihan terlambat', late.length ? 'r-t' : 'g-t')}</div>
 <div class="card" style="padding:6px 16px">${L.length ? `<div class="blist">${L.map(b => {
        const [t, c] = billDue(b);
        return `<div class="brow">${ciEl(b, 20, 'lg')}<div class="m"><b>${esc(b.n)}</b><small>Jatuh tempo ${b.due.slice(0, 4) == TODAY_S.slice(0, 4) ? dlabel(b.due).replace(/ \d{4}$/, '') : dlabel(b.due)}</small></div><span class="badge ${c}">${t}</span><div class="amt">${fmt(b.amt)}</div><div class="ops"><button class="btn pri sm" data-act="bill-pay" data-v="${b.id}">${ic('check', 15)}Tandai dibayar</button><button class="x" data-act="bill-edit" data-v="${b.id}" aria-label="Ubah tagihan">${ic('edit', 16)}</button><button class="x" data-act="bill-del" data-v="${b.id}" aria-label="Hapus tagihan">${ic('trash', 16)}</button></div></div>`;
    }).join('')}</div>` : `<div class="empty"><b>Belum ada tagihan</b>Tambahkan tagihan rutin agar Anda diingatkan sebelum jatuh tempo.</div>`}</div>
 <p class="mu" style="font-size:12.5px;margin:12px 4px 0">Menandai tagihan sebagai dibayar akan mencatat pengeluaran otomatis dan memajukan jatuh tempo satu bulan.</p>`;
}

registerActions({
  'bill-add': () => openForm('Tagihan Baru', [{ k: 'n', l: 'Nama tagihan', t: 'text', v: '', p: 'Contoh: Air PDAM' }, { k: 'amt', l: 'Nominal', t: 'money', v: '' }, { k: 'due', l: 'Jatuh tempo', t: 'date', v: addDays(7) }], 'Simpan', v => {
    if (!v.n || !v.amt) {
      toast('Isi nama dan nominal');
      return false;
    }
    S.bills.push({ id: uid('b'), n: v.n, amt: v.amt, due: v.due || addDays(7), i: 'receipt', c: '#10b981' });
    toast('Tagihan ditambahkan');
  }),
  'bill-del': id => confirmBox('Hapus tagihan ini?', () => {
    S.bills = S.bills.filter(x => x.id !== id);
    commit();
  }),
  'bill-pay': id => {
    const b = S.bills.find(x => x.id === id);
    if (!b) {
      return;
    }
    const o = S.accounts.map(a => [a.id, a.n]);
    openForm('Bayar ' + b.n, [{ k: 'amt', l: 'Nominal dibayar', t: 'money', v: b.amt }, { k: 'acct', l: 'Bayar dari rekening', t: 'select', o, v: S.accounts[0].id }, { k: 'date', l: 'Tanggal bayar', t: 'date', v: TODAY_S }], 'Bayar & catat', v => {
      if (!v.amt) {
        toast('Masukkan nominal');
        return false;
      }
      S.txs.push({ id: uid('u'), ts: Date.now(), type: 'out', cat: 'tagihan', amount: v.amt, date: v.date || TODAY_S, desc: b.n, acct: v.acct });
      b.due = addMonth(b.due);
      toast(b.n + ' dicatat sebagai pengeluaran');
    });
  },
  'bill-edit': id => {
    const b = S.bills.find(x => x.id === id);
    if (!b) {
      return;
    }
    openForm('Ubah Tagihan', [{ k: 'n', l: 'Nama tagihan', t: 'text', v: b.n }, { k: 'amt', l: 'Nominal', t: 'money', v: b.amt }, { k: 'due', l: 'Jatuh tempo', t: 'date', v: b.due }], 'Simpan', v => {
      if (!v.n || !v.amt) {
        toast('Isi nama dan nominal');
        return false;
      }
      b.n = v.n;
      b.amt = v.amt;
      b.due = v.due || b.due;
      toast('Tagihan diperbarui');
    });
  },
});
