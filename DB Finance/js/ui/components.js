/** Potongan UI yang dipakai banyak halaman: ikon kategori, progress bar, header halaman, baris transaksi. */

import { acctName } from '../core/calc.js';
import { abbr, catById } from '../core/catalog.js';
import { ic } from '../core/icons.js';
import { U } from '../core/store.js';
import { MONTHS, MSHORT, dayDiff, dlabel, esc, fmt } from '../core/utils.js';

const LOGO = 'assets/img/logo.png';

export const logoImg = () => `<img src="${LOGO}" alt="Logo DB">`;

export const abadge = (a, cls = '') => `<span class="ci ${cls}" style="background:${a.c}26;color:${a.c};font-size:${cls === 'lg' ? 12 : 11}px;font-weight:800;letter-spacing:-.02em">${esc(abbr(a.n))}</span>`;

export const ciEl = (c, s = 18, cls = '') => `<span class="ci ${cls}" style="background:${c.c}26;color:${c.c}">${ic(c.i, s)}</span>`;

export const bar = (p, cls = '') => `<div class="bar ${cls}"><i style="width:${Math.min(100, Math.max(0, p))}%"></i></div>`;

export const barCls = p => p >= 100 ? 'bad' : p >= 75 ? 'warn' : '';

export function monthPicker() {
  const [y, m] = U.month.split('-').map(Number);
  const lbl = U.page === 'report' && U.rmode === 'year' ? String(y) : MONTHS[m - 1] + ' ' + y;
  return `<div class="mp"><button data-act="month" data-v="-1" aria-label="Sebelumnya">${ic('chl', 18)}</button><span>${lbl}</span><button data-act="month" data-v="1" aria-label="Berikutnya">${ic('chr', 18)}</button></div>`;
}

/** Header standar halaman (judul, subjudul, pemilih bulan). */
export function pageHead(title, sub, o = {}) {
  return `<div class="ph"><div style="display:flex;align-items:center;gap:12px">${o.back ? `<button class="back" data-act="nav" data-v="settings" aria-label="Kembali">${ic('chl', 18)}</button>` : ''}<div><h1>${title}</h1><p>${sub}</p></div></div><div class="ph-r">${o.extra || ''}${o.month === false ? '' : monthPicker()}</div></div>`;
}

/** Satu baris transaksi. */
export function txRow(t, showDate) {
  let c, title, sub, amt, cls;
  if (t.type === 'tf') {
    c = { c: '#60a5fa', i: 'swap' };
    title = 'Transfer' + (t.desc ? ' · ' + esc(t.desc) : '');
    sub = acctName(t.from) + ' → ' + acctName(t.to);
    amt = fmt(t.amount);
    cls = 'tf';
  }
  else {
    c = catById(t.cat);
    title = esc(t.desc || c.n);
    sub = c.n + ' · ' + acctName(t.acct);
    amt = (t.type === 'in' ? '+ ' : '- ') + fmt(t.amount);
    cls = t.type;
  }
  if (showDate === 'home') {
    sub = (t.type === 'tf' ? sub : catById(t.cat).n) + ' · ' + t.date.slice(8, 10) * 1 + ' ' + MSHORT[+t.date.slice(5, 7) - 1];
  }
  else if (showDate) {
    sub += ' · ' + dlabel(t.date);
  }
  return `<button class="tx" data-act="edit-tx" data-v="${t.id}">${ciEl(c)}<div class="tx-m"><b>${title}</b><small>${sub}</small></div><div class="tx-a ${cls}">${amt}</div></button>`;
}

export const trend = (v, goodUp = true) => {
  const up = v >= 0, good = up === goodUp;
  return `<span class="tr ${good ? 'g' : 'r'}">${ic(up ? 'aup' : 'adn', 13)}${up ? '+' : ''}${v}% <i>dari bulan lalu</i></span>`;
};

export function billDue(b) {
  const d = dayDiff(b.due);
  return d < 0 ? ['Terlambat ' + (-d) + ' hari', 'r'] : d === 0 ? ['Jatuh tempo hari ini', 'r'] : d === 1 ? ['Besok', 'a'] : d <= 7 ? [d + ' hari lagi', 'a'] : [d + ' hari lagi', ''];
}
