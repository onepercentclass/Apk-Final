/** Menu Rekening & Dompet: bank, dompet digital, dan uang tunai. */

import { registerActions } from '../core/actions.js';
import { bal, mask, saldoTotal } from '../core/calc.js';
import { COLORS, PRESET, TYPE_LBL, abbr, maskNo } from '../core/catalog.js';
import { ic } from '../core/icons.js';
import { commit } from '../core/nav.js';
import { S } from '../core/store.js';
import { $, esc, fmt, money, uid } from '../core/utils.js';
import { abadge, bar, pageHead } from '../ui/components.js';
import { closeModal, confirmBox, openModal, shH } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

/** Halaman Rekening & Dompet. */
export function renderRekening() {
  const L = S.accounts, tot = saldoTotal(), big = [...L].sort((a, b) => bal(b.id) - bal(a.id))[0];
  const sm = (l, v, sub) => `<div class="card"><small>${l}</small><b>${v}</b><small style="display:block;margin-top:2px">${sub}</small></div>`;
  return `${pageHead('Rekening & Dompet', 'Kelola bank, dompet digital, dan uang tunai', { back: 1, month: false, extra: `<button class="btn pri" data-act="acct-add">${ic('plus', 16)}Tambah Rekening</button>` })}
 <div class="sumrow">${sm('Total Saldo', mask(fmt(tot)), 'Gabungan semua rekening')}${sm('Jumlah Rekening', String(L.length), 'Bank, e-wallet, dan tunai')}${sm('Saldo Terbesar', big ? esc(big.n) : '-', big ? mask(fmt(bal(big.id))) : '')}</div>
 <div class="gl-grid">${L.map(a => {
        const b = bal(a.id), p = tot > 0 ? Math.max(0, Math.round(b / tot * 100)) : 0;
        return `<button class="card acard" data-act="acct-edit" data-v="${a.id}"><div class="gtop">${abadge(a, 'lg')}<div class="m"><b>${esc(a.n)}</b><small>${TYPE_LBL[a.type] || 'Rekening'}${a.no ? ' · ' + esc(maskNo(a.no)) : ''}</small></div><span class="ci n" style="width:34px;height:34px;border-radius:10px">${ic('edit', 16)}</span></div>
  <div class="gamt">${mask(fmt(b))}</div><div class="gsub">${p}% dari total saldo</div>${bar(p)}</button>`;
    }).join('')}
  <button class="card gadd" data-act="acct-add"><span class="ci">${ic('plus', 20)}</span>Tambah rekening baru</button></div>`;
}

let AD = null;

function openAcct(id) {
  const a = id ? S.accounts.find(x => x.id === id) : null;
  AD = a ? { id: a.id, n: a.n, type: a.type || 'bank', no: a.no || '', c: a.c, bal: String(Math.abs(Math.round(bal(a.id)))) } : { id: null, n: '', type: 'bank', no: '', c: COLORS[0], bal: '' };
  renderAcc();
}

function syncAD() {
  AD.n = $('#a-n').value;
  AD.type = $('#a-t').value;
  AD.no = $('#a-no').value;
  AD.bal = ($('#a-b').value || '').replace(/\D/g, '');
}

function renderAcc() {
  openModal(`${shH(AD.id ? 'Ubah Rekening' : 'Tambah Rekening')}
 ${AD.id ? '' : `<label>Pilih bank / dompet digital</label><div class="presets">${PRESET.map((p, i) => `<button class="cat" data-act="acct-preset" data-v="${i}"><span class="ci" style="background:${p[2]}26;color:${p[2]};font-size:11px;font-weight:800">${esc(abbr(p[0]))}</span><span>${p[0]}</span></button>`).join('')}</div>`}
 <label for="a-n">Nama (bebas diisi)</label><input id="a-n" value="${esc(AD.n)}" placeholder="Contoh: Bank Jatim, Tabungan Haji" maxlength="30">
 <div class="two"><div><label for="a-t">Jenis</label><select id="a-t">${Object.entries(TYPE_LBL).map(([k, v]) => `<option value="${k}" ${AD.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div><div><label for="a-no">No. rekening / HP</label><input id="a-no" inputmode="numeric" value="${esc(AD.no)}" placeholder="Opsional" maxlength="24"></div></div>
 <label for="a-b">${AD.id ? 'Saldo saat ini' : 'Saldo awal'}</label><div class="inp"><span>Rp</span><input id="a-b" data-money inputmode="numeric" placeholder="0" value="${money(AD.bal)}" autocomplete="off"></div>
 <label>Warna</label><div class="sw-row">${COLORS.map(c => `<button class="swatch ${AD.c === c ? 'on' : ''}" style="background:${c}" data-act="acct-color" data-v="${c}" aria-label="Warna ${c}"></button>`).join('')}</div>
 <div class="acts">${AD.id ? `<button class="btn danger" data-act="acct-del">Hapus</button>` : ''}<button class="btn pri" data-act="acct-save">Simpan</button></div>`);
}

/** Menghapus rekening; transaksi dipindah ke rekening pertama dan transfer terkait dihapus. */
function deleteAcct(id) {
  const before = {};
  S.accounts.forEach(a => before[a.id] = bal(a.id));
  S.accounts = S.accounts.filter(a => a.id !== id);
  const fb = S.accounts[0].id;
  S.txs = S.txs.filter(t => !(t.type === 'tf' && (t.from === id || t.to === id)));
  S.txs.forEach(t => {
    if (t.type !== 'tf' && t.acct === id) {
      t.acct = fb;
    }
  });
  delete S.opening[id];
  S.accounts.forEach(a => {
    S.opening[a.id] = (S.opening[a.id] || 0) + before[a.id] - bal(a.id);
  });
}

registerActions({
  'acct-add': () => openAcct(null),
  'acct-edit': id => openAcct(id),
  'acct-preset': i => {
    syncAD();
    const p = PRESET[i];
    AD.n = p[0];
    AD.type = p[1];
    AD.c = p[2];
    renderAcc();
  },
  'acct-color': c => {
    syncAD();
    AD.c = c;
    renderAcc();
  },
  'acct-save': () => {
    syncAD();
    const n = AD.n.trim();
    if (!n) {
      toast('Isi nama rekening terlebih dahulu');
      return;
    }
    const nb = Number(AD.bal) || 0;
    if (AD.id) {
      const a = S.accounts.find(x => x.id === AD.id), cur = bal(a.id);
      Object.assign(a, { n, type: AD.type, no: AD.no.trim(), c: AD.c });
      if (Math.abs(cur) !== nb) {
        S.opening[a.id] = (S.opening[a.id] || 0) + nb - cur;
      }
      toast('Rekening diperbarui');
    }
    else {
      const id = uid('a');
      S.accounts.push({ id, n, type: AD.type, no: AD.no.trim(), c: AD.c });
      S.opening[id] = nb;
      toast('Rekening ditambahkan');
    }
    closeModal();
    commit();
  },
  'acct-del': () => {
    const id = AD.id;
    if (S.accounts.length < 2) {
      toast('Minimal harus ada satu rekening');
      return;
    }
    confirmBox('Hapus rekening ini? Transaksi yang memakainya dipindahkan ke rekening pertama, dan transfer terkait dihapus. Saldo rekening lain tidak berubah.', () => {
      deleteAcct(id);
      commit();
      toast('Rekening dihapus');
    });
  },
});
