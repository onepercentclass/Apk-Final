/** Menu Laporan: analisis bulanan dan tahunan. */

import { registerActions } from '../core/actions.js';
import { inMonth, sum } from '../core/calc.js';
import { CAT } from '../core/catalog.js';
import { ic } from '../core/icons.js';
import { renderPage } from '../core/nav.js';
import { S, U } from '../core/store.js';
import { MONTHS, fmt } from '../core/utils.js';
import { barChart, chart, dailyData, donut, lineChart, yearData } from '../ui/charts.js';
import { pageHead } from '../ui/components.js';

/** Halaman Laporan. */
export function renderLaporan() {
  const y = +U.month.slice(0, 4), year = U.rmode === 'year', mk = U.month;
  const src = year ? S.txs.filter(t => t.date.startsWith(String(y))) : inMonth(mk);
  const inc = sum(src, 'in'), out = sum(src, 'out');
  const sp = {};
  src.filter(t => t.type === 'out').forEach(t => sp[t.cat] = (sp[t.cat] || 0) + t.amount);
  const cats = CAT.out.map(c => ({ ...c, v: sp[c.id] || 0 })).filter(c => c.v > 0).sort((a, b) => b.v - a.v);
  const yd = yearData(y);
  return `${pageHead('Laporan Keuangan', 'Analisis pemasukan dan pengeluaran', { extra: `<button class="btn pri" data-act="export">${ic('download', 16)}Unduh Laporan</button>` })}
 <div class="seg" style="max-width:340px;margin-bottom:14px"><button class="${!year ? 'on' : ''}" data-act="rmode" data-v="month">Bulanan</button><button class="${year ? 'on' : ''}" data-act="rmode" data-v="year">Tahunan</button></div>
 <div class="sumrow"><div class="card"><small>Total Pemasukan</small><b class="g-t">${fmt(inc)}</b></div><div class="card"><small>Total Pengeluaran</small><b class="r-t">${fmt(out)}</b></div><div class="card"><small>Selisih</small><b>${fmt(inc - out)}</b></div></div>
 <div class="two-c">
  <div class="card"><div class="card-h"><h3>${year ? 'Arus Kas ' + y : 'Arus Kas Harian (kumulatif)'}</h3><div class="legend"><span><i style="background:var(--gr)"></i>Pemasukan</span><span><i style="background:var(--rd)"></i>Pengeluaran</span></div></div>
   ${year ? chart((w, h) => barChart(yd, w, h), 240) : chart((w, h) => lineChart(dailyData(mk), w, h), 240)}</div>
  <div class="card"><div class="card-h"><h3>Ringkasan Kategori Pengeluaran</h3></div>
   ${out ? `<div class="dn">${donut(cats.map(c => ({ v: c.v, c: c.c, tip: c.n + '|' + fmt(c.v) })), 150, 20, `<b>${fmt(out)}</b><small>Total</small>`)}<div class="lgd">${cats.map(c => `<div><i style="background:${c.c}"></i><span>${c.n}</span><b>${Math.round(c.v / out * 100)}%</b></div>`).join('')}</div></div>` : `<div class="empty"><b>Belum ada data</b>Tidak ada pengeluaran pada periode ini.</div>`}</div>
 </div>
 ${year ? `<div class="card" style="margin-top:14px"><div class="card-h"><h3>Rincian per Bulan</h3></div><div class="list">${yd.map((m, i) => `<div class="mini"><div class="m"><b>${MONTHS[i]}</b><small>Pemasukan ${fmt(m.a)}</small></div><div class="r ${m.a - m.b >= 0 ? 'g-t' : 'r-t'}">${fmt(m.a - m.b)}<br><small class="mu">Keluar ${fmt(m.b)}</small></div></div>`).join('')}</div></div>` : ''}`;
}

registerActions({
  rmode: v => {
    U.rmode = v;
    renderPage();
  },
});
