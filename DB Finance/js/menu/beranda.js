/** Menu Beranda: ringkasan keuangan bulanan. */

import { bal, budTotal, firstName, inMonth, initials, mask, saldoAt, sortTx, spentBy, sum } from '../core/calc.js';
import { CAT, TYPE_LBL, maskNo } from '../core/catalog.js';
import { ic } from '../core/icons.js';
import { S, U } from '../core/store.js';
import { MSHORT, TODAY_S, esc, fmt, num, pc, sgn, shiftMK } from '../core/utils.js';
import { barChart, chart, donut, yearData } from '../ui/charts.js';
import { abadge, bar, barCls, billDue, ciEl, monthPicker, trend, txRow } from '../ui/components.js';

/** Halaman Beranda. */
export function renderBeranda() {
  const mk = U.month, cur = inMonth(mk), inc = sum(cur, 'in'), out = sum(cur, 'out'), prev = inMonth(shiftMK(mk, -1)), pi = sum(prev, 'in'), po = sum(prev, 'out');
  const bt = budTotal(), left = bt - out, pl = bt ? Math.max(0, Math.round(left / bt * 100)) : 0, sal = saldoAt(mk), net = inc - out, sc = pc(sal, saldoAt(shiftMK(mk, -1)));
  const stat = (cls, icn, label, val, sub, extra = '') => `<div class="card stat"><div class="st-h"><span class="ci lg ${cls}">${ic(icn, 22)}</span><span>${label}</span></div><div class="st-v">${val}${extra}</div><div class="st-s">${sub}</div></div>`;
  const spent = spentBy(mk), cats = CAT.out.map(c => ({ ...c, v: spent[c.id] || 0 })).filter(c => c.v > 0).sort((a, b) => b.v - a.v);
  const y = +mk.slice(0, 4);
  const sortedBills = [...S.bills].sort((a, b) => a.due.localeCompare(b.due)).slice(0, 4);
  const inv = S.invest, usedP = bt ? Math.min(100, Math.round(out / bt * 100)) : 0;
  return `
 <div class="greet only-m"><div class="avatar">${esc(initials())}</div><div><h1>Halo, ${esc(firstName())}</h1><p>Semangat mengelola keuanganmu hari ini!</p></div></div>
 <div class="ph home-h"><div class="only-d" style="display:none;flex-direction:column"><h1>Beranda</h1><p>Ringkasan keuangan Anda bulan ini</p></div>
  <div class="ph-r home-r">${monthPicker()}<button class="btn" data-act="export">${ic('download', 16)}<span class="lbl">Unduh Laporan</span></button>
   <span class="hdr-acts"><button class="btn" data-act="tf">${ic('swap', 16)}Transfer</button><button class="btn" data-act="add" data-v="in"><span class="g-t" style="display:flex">${ic('plus', 16)}</span>Pemasukan</button><button class="btn pri" data-act="add" data-v="out">${ic('minus', 16)}Pengeluaran</button></span></div></div>
 <div class="home">
  <div class="stats">
   ${stat('g', 'wallet', mk === TODAY_S.slice(0, 7) ? 'Total Saldo' : 'Saldo Akhir ' + MSHORT[+mk.slice(5, 7) - 1], `<span>${mask(fmt(sal))}</span><button class="eye" data-act="hide" aria-label="Tampilkan atau sembunyikan saldo">${ic(S.hide ? 'eyeoff' : 'eye', 18)}</button>`, trend(sc))}
   ${stat('g', 'aup', 'Pemasukan', fmt(inc), trend(pc(inc, pi)))}
   ${stat('r', 'adn', 'Pengeluaran', fmt(out), trend(pc(out, po), false))}
   ${stat('b', 'wallet', 'Sisa Anggaran', fmt(Math.max(0, left)), `<span class="tr ${left >= 0 ? 'g' : 'r'}">${left >= 0 ? pl + '% dari total budget' : 'Melebihi anggaran ' + fmt(-left)}</span><div style="margin-top:9px">${bar(usedP, barCls(usedP))}</div>`)}
  </div>
  <div class="quick h-quick">
   <button class="q" data-act="add" data-v="in"><span class="ci g">${ic('plus')}</span>Pemasukan</button>
   <button class="q" data-act="add" data-v="out"><span class="ci r">${ic('minus')}</span>Pengeluaran</button>
   <button class="q" data-act="tf"><span class="ci b">${ic('swap')}</span>Transfer</button>
   <button class="q" data-act="nav" data-v="report"><span class="ci n">${ic('chart')}</span>Laporan</button>
  </div>
  <div class="card h-cash"><div class="card-h"><h3>Arus Kas Bulanan</h3><div class="legend"><span><i style="background:var(--gr)"></i>Pemasukan</span><span><i style="background:var(--rd)"></i>Pengeluaran</span></div></div>${chart((w, h) => barChart(yearData(y), w, h), 240)}</div>
  <div class="card h-cat"><div class="card-h"><h3>Kategori Pengeluaran</h3></div>
   ${out ? `<div class="dn">${donut(cats.map(c => ({ v: c.v, c: c.c, tip: c.n + '|' + fmt(c.v) + ' (' + Math.round(c.v / out * 100) + '%)' })), 150, 20, `<b>${fmt(out)}</b><small>Total Pengeluaran</small>`)}
   <div class="lgd">${cats.slice(0, 6).map(c => `<div><i style="background:${c.c}"></i><span>${c.n}<br><em>${fmt(c.v)}</em></span><b>${Math.round(c.v / out * 100)}%</b></div>`).join('')}</div></div>` : `<div class="empty"><b>Belum ada pengeluaran</b>Catat pengeluaran pertama bulan ini.</div>`}</div>
  <div class="card h-recent"><div class="card-h"><h3>Transaksi Terbaru</h3><button class="link" data-act="nav" data-v="tx">Lihat Semua</button></div>
   <div class="list">${sortTx(S.txs).slice(0, 5).map(t => txRow(t, 'home')).join('') || '<div class="empty"><b>Belum ada transaksi</b></div>'}</div></div>
  <div class="card h-bills"><div class="card-h"><h3>Tagihan Mendatang</h3><button class="link" data-act="nav" data-v="bills">Lihat Semua</button></div>
   <div class="list">${sortedBills.map(b => {
        const [t, c] = billDue(b);
        return `<div class="mini">${ciEl(b)}<div class="m"><b>${esc(b.n)}</b><small>${fmt(b.amt)}</small></div><div class="r"><span class="badge ${c}">${t}</span></div></div>`;
    }).join('') || '<div class="empty">Tidak ada tagihan.</div>'}</div></div>
  <div class="card h-goals"><div class="card-h"><h3>Tujuan Keuangan</h3><button class="link" data-act="nav" data-v="goals">Lihat Semua</button></div>
   <div class="list">${S.goals.slice(0, 3).map(g => {
        const p = g.target ? Math.round(g.saved / g.target * 100) : 0;
        return `<div class="mini" style="display:block"><div style="display:flex;gap:10px;align-items:center"><span class="ci" style="background:${g.c}26;color:${g.c}">${ic(g.i, 18)}</span><div class="m"><b>${esc(g.n)}</b><small>Rp ${num(g.saved)} / Rp ${num(g.target)}</small></div><b style="font-size:13px">${p}%</b></div><div style="margin-top:8px">${bar(p)}</div></div>`;
    }).join('') || '<div class="empty">Belum ada tujuan.</div>'}</div></div>
  <div class="card h-acc"><div class="card-h"><h3>Rekening & Dompet</h3><button class="link" data-act="nav" data-v="accounts">Kelola</button></div><div class="list">${S.accounts.map(a => `<button class="mini" data-act="acct-edit" data-v="${a.id}" style="width:100%;text-align:left">${abadge(a)}<div class="m"><b>${esc(a.n)}</b><small>${TYPE_LBL[a.type] || 'Rekening'}${a.no ? ' · ' + esc(maskNo(a.no)) : ''}</small></div><div class="r">${mask(fmt(bal(a.id)))}</div></button>`).join('')}</div>
   <button class="btn full sm" data-act="acct-add" style="margin-top:12px;border-style:dashed;color:var(--mu)">${ic('plus', 15)}Tambah rekening</button></div>
  <div class="card h-sum"><div class="card-h"><h3>Ringkasan Keuangan</h3></div><div class="sumbody">
   <div class="sumgrid"><div><small class="mu">Pemasukan</small><b class="g-t">${fmt(inc)}</b></div><div><small class="mu">Pengeluaran</small><b class="r-t">${fmt(out)}</b></div><div><small class="mu">Selisih</small><b class="${net >= 0 ? 'g-t' : 'r-t'}">${fmt(net)}</b></div><div><small class="mu">Sisa Anggaran</small><b>${fmt(Math.max(0, left))}</b></div></div>
   ${donut([{ v: usedP, c: usedP >= 100 ? 'var(--rd)' : 'var(--gr)' }, { v: 100 - usedP, c: 'var(--bd)' }], 120, 15, `<b style="font-size:20px">${usedP}%</b><small>Anggaran<br>terpakai</small>`)}</div></div>
  <div class="card h-inv"><div class="card-h"><h3>Investasi</h3><button class="link" data-act="nav" data-v="invest">Lihat Semua</button></div><div class="list">${inv.map(i => `<div class="mini">${ciEl(i)}<div class="m"><b>${esc(i.n)}</b></div><div class="r">${fmt(i.val)}<br><small class="${i.ret >= 0 ? 'g-t' : 'r-t'}">${sgn(i.ret)}</small></div></div>`).join('') || '<div class="empty">Belum ada investasi.</div>'}</div></div>
 </div>`;
}
