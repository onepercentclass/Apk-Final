/** Menu Transaksi: riwayat, pencarian, tambah / ubah / hapus transaksi, dan transfer antar rekening. */

import { registerActions } from '../core/actions.js';
import { acctName, inMonth, sortTx, sum } from '../core/calc.js';
import { CAT, catById } from '../core/catalog.js';
import { ic } from '../core/icons.js';
import { commit, renderPage } from '../core/nav.js';
import { S, U } from '../core/store.js';
import { $, TODAY_S, addDays, dlabel, esc, fmt, money, uid } from '../core/utils.js';
import { ciEl, pageHead, txRow } from '../ui/components.js';
import { openForm } from '../ui/form.js';
import { closeModal, confirmBox, openModal, shH } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

/** Pasang pencarian langsung pada halaman Transaksi. */
export function bindPencarianTransaksi() {
  const q = $('#q');
  if (q) q.oninput = () => {
    U.f.q = q.value;
    $('#txlist').innerHTML = txList();
  };
}

/** Daftar transaksi terfilter, dikelompokkan per tanggal. */
function txList() {
  const q = U.f.q.trim().toLowerCase();
  let L = q ? S.txs.slice() : inMonth(U.month);
  if (U.f.type !== 'all') {
    L = L.filter(t => t.type === U.f.type);
  }
  if (q) {
    L = L.filter(t => ((t.desc || '') + ' ' + (t.type === 'tf' ? 'transfer' : catById(t.cat).n) + ' ' + acctName(t.acct || t.from)).toLowerCase().includes(q));
  }
  L = sortTx(L);
  if (!L.length) {
    return `<div class="empty"><b>Tidak ada transaksi</b>${q ? 'Tidak ada hasil untuk pencarian ini di semua bulan.' : 'Coba ubah filter, bulan, atau tambahkan transaksi baru.'}</div>`;
  }
  let h = q ? `<div class="grp" style="margin-top:10px">Hasil pencarian di semua bulan · ${L.length} transaksi</div>` : '', last = '';
  L.forEach(t => {
    if (t.date !== last) {
      last = t.date;
      const lb = t.date === TODAY_S ? 'Hari ini, ' + dlabel(t.date) : t.date === addDays(-1) ? 'Kemarin, ' + dlabel(t.date) : dlabel(t.date);
      h += `<div class="grp">${lb}</div>`;
    }
    h += txRow(t);
  });
  return `<div class="card" style="padding:8px 14px 12px">${h}</div>`;
}

/** Halaman Transaksi. */
export function renderTransaksi() {
  const cur = inMonth(U.month), T = [['all', 'Semua'], ['in', 'Pemasukan'], ['out', 'Pengeluaran'], ['tf', 'Transfer']];
  return `${pageHead('Transaksi', 'Riwayat pemasukan dan pengeluaran', { extra: `<button class="btn pri only-d" data-act="add" data-v="out">${ic('plus', 16)}Tambah</button>` })}
 <div class="sumrow"><div class="card"><small>Pemasukan</small><b class="g-t">${fmt(sum(cur, 'in'))}</b></div><div class="card"><small>Pengeluaran</small><b class="r-t">${fmt(sum(cur, 'out'))}</b></div><div class="card"><small>Selisih</small><b>${fmt(sum(cur, 'in') - sum(cur, 'out'))}</b></div></div>
 <div class="search">${ic('search', 18)}<input id="q" type="search" placeholder="Cari transaksi…" value="${esc(U.f.q)}" aria-label="Cari transaksi"></div>
 <div class="chips" style="margin-bottom:6px">${T.map(t => `<button class="chip ${U.f.type === t[0] ? 'on' : ''}" data-act="filter" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
 <div id="txlist">${txList()}</div>`;
}

let DR = null;

function openTx(id, type) {
  const t = id ? S.txs.find(x => x.id === id) : null;
  DR = t ? { ...t, amount: String(t.amount) } : { id: null, type: type || 'out', cat: null, amount: '', date: TODAY_S, desc: '', acct: S.accounts[0].id };
  if (!S.accounts.some(a => a.id === DR.acct)) {
    DR.acct = S.accounts[0].id;
  }
  if (!CAT[DR.type].some(c => c.id === DR.cat)) {
    DR.cat = CAT[DR.type][0].id;
  }
  renderTx();
}

function renderTx() {
  openModal(`${shH((DR.id ? 'Ubah' : 'Tambah') + ' Transaksi')}
 <div class="seg"><button class="${DR.type === 'in' ? 'on in' : ''}" data-act="tx-type" data-v="in">Pemasukan</button><button class="${DR.type === 'out' ? 'on out' : ''}" data-act="tx-type" data-v="out">Pengeluaran</button></div>
 <label>Kategori</label><div class="cats">${CAT[DR.type].map(c => `<button class="cat ${DR.cat === c.id ? 'on' : ''}" data-act="tx-cat" data-v="${c.id}">${ciEl(c, 17)}<span>${c.n}</span></button>`).join('')}</div>
 <label for="f-amt">Nominal</label><div class="inp"><span>Rp</span><input id="f-amt" data-money inputmode="numeric" placeholder="0" value="${money(DR.amount)}" autocomplete="off"></div>
 <div class="two"><div><label for="f-date">Tanggal</label><input id="f-date" type="date" value="${DR.date}"></div><div><label for="f-acct">Rekening</label><select id="f-acct">${S.accounts.map(a => `<option value="${a.id}" ${DR.acct === a.id ? 'selected' : ''}>${esc(a.n)}</option>`).join('')}</select></div></div>
 <label for="f-desc">Deskripsi (opsional)</label><input id="f-desc" placeholder="Contoh: Gaji bulan September" value="${esc(DR.desc)}">
 <div class="acts">${DR.id ? `<button class="btn danger" data-act="tx-del">Hapus</button>` : ''}<button class="btn pri" data-act="tx-save">Simpan</button></div>`);
}

function syncDR() {
  DR.amount = ($('#f-amt').value || '').replace(/\D/g, '');
  DR.date = $('#f-date').value;
  DR.desc = $('#f-desc').value;
  DR.acct = $('#f-acct').value;
}

registerActions({
  add: v => openTx(null, v),
  'edit-tx': id => {
    const t = S.txs.find(x => x.id === id);
    if (!t) {
      return;
    }
    if (t.type === 'tf') {
      confirmBox('Hapus transfer ini? Saldo rekening akan dikembalikan.', () => {
        S.txs = S.txs.filter(x => x.id !== id);
        commit();
        toast('Transfer dihapus');
      });
    }
    else {
      openTx(id);
    }
  },
  'tx-type': v => {
    syncDR();
    DR.type = v;
    DR.cat = CAT[v][0].id;
    renderTx();
  },
  'tx-cat': v => {
    syncDR();
    DR.cat = v;
    renderTx();
  },
  'tx-save': () => {
    syncDR();
    const amt = Number(DR.amount);
    if (!amt) {
      toast('Masukkan nominal terlebih dahulu');
      return;
    }
    const date = DR.date || TODAY_S, o = { type: DR.type, cat: DR.cat, amount: amt, date, desc: DR.desc.trim(), acct: DR.acct };
    if (DR.id) {
      const i = S.txs.findIndex(x => x.id === DR.id);
      S.txs[i] = { ...S.txs[i], ...o };
      toast('Perubahan disimpan');
    }
    else {
      S.txs.push({ id: uid('u'), ts: Date.now(), ...o });
      toast('Transaksi disimpan');
    }
    U.month = date.slice(0, 7);
    closeModal();
    commit();
  },
  'tx-del': () => {
    const id = DR.id;
    confirmBox('Hapus transaksi ini?', () => {
      S.txs = S.txs.filter(x => x.id !== id);
      commit();
      toast('Transaksi dihapus');
    });
  },
  tf: () => {
    const o = S.accounts.map(a => [a.id, a.n]);
    if (S.accounts.length < 2) {
      toast('Tambahkan minimal 2 rekening untuk transfer');
      return;
    }
    openForm('Transfer Antar Rekening', [{ k: 'from', l: 'Dari', t: 'select', o, v: S.accounts[0].id }, { k: 'to', l: 'Ke', t: 'select', o, v: S.accounts[1].id }, { k: 'amt', l: 'Nominal', t: 'money', v: '' }, { k: 'date', l: 'Tanggal', t: 'date', v: TODAY_S }, { k: 'desc', l: 'Catatan (opsional)', t: 'text', v: '' }], 'Transfer', v => {
      if (v.from === v.to) {
        toast('Pilih rekening yang berbeda');
        return false;
      }
      if (!v.amt) {
        toast('Masukkan nominal');
        return false;
      }
      S.txs.push({ id: uid('u'), ts: Date.now(), type: 'tf', from: v.from, to: v.to, amount: v.amt, date: v.date || TODAY_S, desc: v.desc });
      toast('Transfer berhasil');
    });
  },
  filter: v => {
    U.f.type = v;
    renderPage();
  },
});
