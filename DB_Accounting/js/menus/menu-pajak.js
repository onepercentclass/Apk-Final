/* ---- MANAJEMEN PAJAK ---- */
PAGES.pajak=function(){
  const c=co();
  const keluaran=acctBalance(c,'2-2000');
  const masukan=acctBalance(c,'1-1300');
  const net=keluaran-masukan;
  const taxSales=c.sales.filter(s=>s.tax>0);
  const taxPurch=c.purchases.filter(p=>p.tax>0);
  return `
  <div class="row" style="margin-bottom:4px;"><div><div class="page-title">Manajemen Pajak</div><div class="page-sub">Rekapitulasi PPN ${esc(c.name)}.</div></div>
    <button class="btn-dl" style="margin-left:auto;" onclick="exportPajak()">${ic('download',13)}Unduh CSV</button></div>
  <div class="grid g3" style="margin-bottom:16px;">
    <div class="card stat-card"><div class="stat-label">PPN Keluaran</div><div class="stat-value">${fmtRp(keluaran)}</div></div>
    <div class="card stat-card"><div class="stat-label">PPN Masukan</div><div class="stat-value">${fmtRp(masukan)}</div></div>
    <div class="card stat-card"><div class="stat-label">${net>=0?'Kurang Bayar':'Lebih Bayar'}</div><div class="stat-value" style="color:${net>=0?'var(--neg)':'var(--pos)'}">${fmtRp(Math.abs(net))}</div></div>
  </div>
  <div class="grid g2">
    <div class="card"><div class="card-head"><h3>Pajak Keluaran (dari Penjualan)</h3></div><div class="table-wrap">
      ${taxSales.length?`<table><thead><tr><th>No.</th><th>Tanggal</th><th class="right">DPP</th><th class="right">PPN</th></tr></thead><tbody>
        ${taxSales.map(s=>`<tr><td class="acct-pill">${esc(s.no)}</td><td>${fmtDate(s.date)}</td><td class="right num">${fmtRp(s.amount)}</td><td class="right num">${fmtRp(s.tax)}</td></tr>`).join('')}
      </tbody></table>`:`<div class="empty" style="padding:26px;">Belum ada transaksi kena PPN keluaran</div>`}
    </div></div>
    <div class="card"><div class="card-head"><h3>Pajak Masukan (dari Pembelian)</h3></div><div class="table-wrap">
      ${taxPurch.length?`<table><thead><tr><th>No.</th><th>Tanggal</th><th class="right">DPP</th><th class="right">PPN</th></tr></thead><tbody>
        ${taxPurch.map(p=>`<tr><td class="acct-pill">${esc(p.no)}</td><td>${fmtDate(p.date)}</td><td class="right num">${fmtRp(p.amount)}</td><td class="right num">${fmtRp(p.tax)}</td></tr>`).join('')}
      </tbody></table>`:`<div class="empty" style="padding:26px;">Belum ada transaksi kena PPN masukan</div>`}
    </div></div>
  </div>`;
};

function exportPajak(){
  const c=co();
  const rows=[];
  c.sales.filter(s=>s.tax>0).forEach(s=>rows.push(['PPN Keluaran',s.no,fmtDate(s.date),s.amount,s.tax]));
  c.purchases.filter(p=>p.tax>0).forEach(p=>rows.push(['PPN Masukan',p.no,fmtDate(p.date),p.amount,p.tax]));
  downloadCSV('Pajak',['Jenis','No.','Tanggal','DPP','PPN'],rows);
}

