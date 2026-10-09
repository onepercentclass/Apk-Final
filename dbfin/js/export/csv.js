/** Ekspor transaksi ke CSV (siap diimpor ke Google Sheets). */

import { acctName, inMonth, sum } from '../core/calc.js';
import { catById } from '../core/catalog.js';
import { S } from '../core/store.js';
import { dl } from './download.js';

export const JENIS = { in: 'Pemasukan', out: 'Pengeluaran', tf: 'Transfer' };

export const txCat = t => t.type === 'tf' ? 'Transfer' : catById(t.cat).n;

export const txAcct = t => t.type === 'tf' ? acctName(t.from) + ' > ' + acctName(t.to) : acctName(t.acct);

const csvC = v => {
  v = String(v ?? '');
  return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};

function csvRows(list) {
  const rows = [['Tanggal', 'Jenis', 'Kategori', 'Deskripsi', 'Rekening', 'Jumlah', 'Arus Kas']];
  [...list].sort((a, b) => a.date.localeCompare(b.date) || a.ts - b.ts).forEach(t => rows.push([t.date, JENIS[t.type], txCat(t), t.desc || '', txAcct(t), t.amount, t.type === 'in' ? t.amount : t.type === 'out' ? -t.amount : 0]));
  return rows;
}

/** Unduh CSV satu bulan, atau semua data bila mk = "all". */
export function exportCSV(mk) {
  const all = mk === 'all', list = all ? S.txs : inMonth(mk), rows = csvRows(list);
  if (!all) {
    const I = sum(list, 'in'), O = sum(list, 'out');
    rows.push([], ['Total Pemasukan', '', '', '', '', I], ['Total Pengeluaran', '', '', '', '', O], ['Selisih', '', '', '', '', I - O]);
  }
  const txt = '\uFEFF' + rows.map(r => r.map(csvC).join(',')).join('\r\n');
  dl(all ? 'DBTrack-backup-semua-data.csv' : 'DBTrack-laporan-' + mk + '.csv', txt, 'text/csv;charset=utf-8');
}
