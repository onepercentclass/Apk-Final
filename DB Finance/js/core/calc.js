/** Perhitungan turunan dari state: saldo, total, pengeluaran per kategori, dan sejenisnya. */

import { S } from './store.js';
import { dayDiff } from './utils.js';

export const acctName = id => (S.accounts.find(a => a.id === id) || { n: '(dihapus)' }).n;

export const inMonth = mk => S.txs.filter(t => t.date.startsWith(mk));

export const sum = (a, type) => a.filter(t => t.type === type).reduce((s, t) => s + t.amount, 0);

/** Saldo terkini satu rekening. */
export function bal(id) {
  let b = S.opening[id] || 0;
  for (const t of S.txs) {
    if (t.type === 'tf') {
      if (t.from === id) {
        b -= t.amount;
      }
      if (t.to === id) {
        b += t.amount;
      }
    }
    else if (t.acct === id) {
      b += t.type === 'in' ? t.amount : -t.amount;
    }
  }
  return b;
}

export const saldoTotal = () => S.accounts.reduce((a, c) => a + bal(c.id), 0);

/** Saldo gabungan semua rekening sampai akhir bulan tertentu. */
export const saldoAt = mk => {
  const end = mk + '-31';
  let b = S.accounts.reduce((a, c) => a + (S.opening[c.id] || 0), 0);
  S.txs.forEach(t => {
    if (t.date <= end) {
      if (t.type === 'in') {
        b += t.amount;
      }
      else if (t.type === 'out') {
        b -= t.amount;
      }
    }
  });
  return b;
};

export const sortTx = a => [...a].sort((x, y) => y.date.localeCompare(x.date) || y.ts - x.ts);

/** Total pengeluaran per kategori pada satu bulan. */
export const spentBy = mk => {
  const o = {};
  inMonth(mk).filter(t => t.type === 'out').forEach(t => o[t.cat] = (o[t.cat] || 0) + t.amount);
  return o;
};

export const budTotal = () => Object.values(S.budgets).reduce((a, b) => a + b, 0);

export const mask = (s) => S.hide ? 'Rp ••••••' : s;

export const firstName = () => (S.name || 'Pengguna').split(' ')[0];

export const initials = () => (S.name || 'P').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();

export const urgent = () => S.bills.filter(b => dayDiff(b.due) <= 7).length;
