/** Penulis PDF sederhana tanpa pustaka luar, dan laporan PDF bulanan. */

import { inMonth, saldoAt, sortTx, spentBy, sum } from '../core/calc.js';
import { CAT } from '../core/catalog.js';
import { S } from '../core/store.js';
import { MONTHS, TODAY_S, dlabel, fmt } from '../core/utils.js';
import { JENIS, txAcct, txCat } from './csv.js';
import { dl } from './download.js';

const HW = { ' ': 278, '.': 278, ',': 278, ':': 278, '/': 278, '-': 333, '+': 584, '(': 333, ')': 333, 'i': 222, 'l': 222, 'j': 222, 't': 278, 'f': 278, 'r': 333, 'm': 833, 'w': 722, 'M': 833, 'W': 944, 'I': 278, 'R': 722, 'F': 611, 'J': 500, '1': 556 };

const tw = (t, sz) => {
  let w = 0;
  for (const c of String(t)) {
    w += HW[c] || (/[A-Z]/.test(c) ? 667 : /\d/.test(c) ? 556 : 530);
  }
  return w * sz / 1000;
};

const pdfSafe = t => String(t).replace(/[^\x20-\x7E]/g, c => c === '\u2013' || c === '\u2014' ? '-' : '?');

const pdfEsc = t => pdfSafe(t).replace(/[\\()]/g, '\\$&');

function fit(t, maxW, sz) {
  t = pdfSafe(t);
  if (tw(t, sz) <= maxW) {
    return t;
  }
  while (t.length > 1 && tw(t + '...', sz) > maxW) {
    t = t.slice(0, -1);
  }
  return t + '...';
}

class Pg {
  constructor() {
    this.o = [];
  }
  text(x, y, t, sz = 9, bold = false, col = '0.1 0.14 0.12', al = 'l') {
    const w = tw(t, sz);
    if (al === 'r') {
      x -= w;
    }
    else if (al === 'c') {
      x -= w / 2;
    }
    this.o.push(`BT /${bold === 'i' ? 'F3' : bold ? 'F2' : 'F1'} ${sz} Tf ${col} rg ${x.toFixed(1)} ${(842 - y).toFixed(1)} Td (${pdfEsc(t)}) Tj ET`);
  }
  rect(x, y, w, h, fill, stroke) {
    this.o.push(`${fill ? fill + ' rg ' : ''}${stroke ? stroke + ' RG 0.6 w ' : ''}${x.toFixed(1)} ${(842 - y - h).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re ${fill && stroke ? 'B' : fill ? 'f' : 'S'}`);
  }
  line(x1, y1, x2, y2, col = '0.85 0.89 0.87') {
    this.o.push(`${col} RG 0.5 w ${x1} ${(842 - y1).toFixed(1)} m ${x2} ${(842 - y2).toFixed(1)} l S`);
  }
}

/** Merakit struktur berkas PDF dari halaman-halaman yang sudah digambar. */
function buildPDF(pages) {
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-BoldOblique /Encoding /WinAnsiEncoding >>'];
  const kids = [];
  pages.forEach((pg, i) => {
    const pn = 6 + i * 2, cs = pg.o.join('\n');
    kids.push(pn + ' 0 R');
    objs.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${pn + 1} 0 R >>`);
    objs.push(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
  });
  objs[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;
  let out = '%PDF-1.4\n', offs = [];
  objs.forEach((o, i) => {
    offs.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xr = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xr}\n%%EOF`;
  const u = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) {
    u[i] = out.charCodeAt(i) & 255;
  }
  return u;
}

/** Membuat dan mengunduh laporan PDF satu bulan. */
export function exportPDF(mk) {
  const [Y, M] = mk.split('-').map(Number), list = sortTx(inMonth(mk)).reverse(), I = sum(list, 'in'), O = sum(list, 'out'), sp = spentBy(mk);
  const G = '0.06 0.55 0.4', MU = '0.4 0.47 0.43', RD = '0.8 0.15 0.15', DK = '0.07 0.1 0.09', pages = [];
  const head = (pg, first) => {
    if (first) {
      pg.rect(0, 0, 595, 96, G);
      pg.text(40, 44, 'DB Track', 24, 'i', '1 1 1');
      pg.text(40, 64, 'Laporan Keuangan Bulanan', 11, false, '0.9 1 0.95');
      pg.text(555, 44, MONTHS[M - 1] + ' ' + Y, 16, true, '1 1 1', 'r');
      pg.text(555, 64, 'Dibuat: ' + dlabel(TODAY_S) + '  |  ' + S.name, 9, false, '0.9 1 0.95', 'r');
    }
    else {
      pg.rect(0, 0, 595, 34, G);
      pg.text(40, 22, 'DB Track - Laporan ' + MONTHS[M - 1] + ' ' + Y, 10, true, '1 1 1');
    }
  };
  let pg = new Pg();
  pages.push(pg);
  head(pg, true);
  let y = 124;
  // ringkasan
  const box = [['Pemasukan', fmt(I), G], ['Pengeluaran', fmt(O), RD], ['Selisih', fmt(I - O), I - O >= 0 ? G : RD], ['Saldo Akhir', fmt(saldoAt(mk)), DK]];
  box.forEach((b, i) => {
    const x = 40 + i * 130;
    pg.rect(x, y, 122, 54, '0.96 0.98 0.97', '0.85 0.89 0.87');
    pg.text(x + 10, y + 19, b[0], 8.5, false, MU);
    pg.text(x + 10, y + 39, b[1], 11.5, true, b[2]);
  });
  y += 86;
  // kategori
  pg.text(40, y, 'Pengeluaran per Kategori', 12, true, DK);
  y += 12;
  pg.rect(40, y, 515, 20, '0.93 0.96 0.94');
  [['Kategori', 48, 'l'], ['Realisasi', 290, 'r'], ['Anggaran', 380, 'r'], ['Terpakai', 440, 'r']].forEach(c => pg.text(c[1], y + 13.5, c[0], 8.5, true, MU, c[2]));
  y += 20;
  CAT.out.forEach(c => {
    const v = sp[c.id] || 0, lim = S.budgets[c.id] || 0, p = lim ? Math.round(v / lim * 100) : 0;
    pg.text(48, y + 15, c.n, 9, false, DK);
    pg.text(290, y + 15, fmt(v), 9, false, DK, 'r');
    pg.text(380, y + 15, lim ? fmt(lim) : '-', 9, false, MU, 'r');
    pg.text(440, y + 15, lim ? p + '%' : '-', 9, true, p >= 100 ? RD : DK, 'r');
    pg.rect(456, y + 8, 94, 7, '0.9 0.93 0.91');
    if (lim) {
      pg.rect(456, y + 8, Math.min(94, 94 * p / 100), 7, p >= 100 ? RD : G);
    }
    pg.line(40, y + 21, 555, y + 21);
    y += 22;
  });
  y += 22;
  // transaksi
  const th = p => {
    p.rect(40, y, 515, 20, '0.93 0.96 0.94');
    [['Tanggal', 48, 'l'], ['Jenis', 108, 'l'], ['Kategori', 172, 'l'], ['Deskripsi', 262, 'l'], ['Jumlah', 547, 'r']].forEach(c => p.text(c[1], y + 13.5, c[0], 8.5, true, MU, c[2]));
    y += 20;
  };
  pg.text(40, y, 'Daftar Transaksi (' + list.length + ')', 12, true, DK);
  y += 12;
  th(pg);
  if (!list.length) {
    pg.text(48, y + 16, 'Belum ada transaksi pada bulan ini.', 9, false, MU);
    y += 24;
  }
  list.forEach(t => {
    if (y > 790) {
      pg = new Pg();
      pages.push(pg);
      head(pg, false);
      y = 54;
      th(pg);
    }
    const amt = (t.type === 'in' ? '+ ' : t.type === 'out' ? '- ' : '') + fmt(t.amount);
    pg.text(48, y + 15, dlabel(t.date), 8.5, false, DK);
    pg.text(108, y + 15, JENIS[t.type], 8.5, false, MU);
    pg.text(172, y + 15, fit(txCat(t), 84, 8.5), 8.5, false, DK);
    pg.text(262, y + 15, fit((t.desc || '-') + '  [' + txAcct(t) + ']', 220, 8.5), 8.5, false, DK);
    pg.text(547, y + 15, amt, 8.5, true, t.type === 'in' ? G : t.type === 'out' ? RD : DK, 'r');
    pg.line(40, y + 21, 555, y + 21);
    y += 21;
  });
  pages.forEach((p, i) => p.text(297, 825, 'DB Track  -  Halaman ' + (i + 1) + ' dari ' + pages.length, 8, false, MU, 'c'));
  dl('DBTrack-laporan-' + mk + '.pdf', buildPDF(pages), 'application/pdf');
}
