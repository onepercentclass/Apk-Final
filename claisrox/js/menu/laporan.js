function defaultLaporanRange(){
  const end = todayISO();
  const startDate = new Date(); startDate.setDate(startDate.getDate()-29);
  return {start:startDate.toISOString().slice(0,10), end};
}
function initLaporanDates(){
  const {start,end} = defaultLaporanRange();
  const s = document.getElementById('laporanStart'); const e = document.getElementById('laporanEnd');
  if(s && !s.value) s.value = start;
  if(e && !e.value) e.value = end;
}
function renderLaporan(){
  const jenisEl = document.getElementById('laporanJenis');
  if(!jenisEl) return;
  initLaporanDates();
  const jenis = jenisEl.value;
  const start = document.getElementById('laporanStart').value;
  const end = document.getElementById('laporanEnd').value;
  document.getElementById('laporanPrintMeta').textContent = 'Periode: '+fmtDate(start)+' — '+fmtDate(end)+' · Dicetak: '+fmtDate(todayISO());

  const salesInRange = allSalesRecords().filter(s=>inRange(s.date,start,end));
  const purchasesInRange = DATA.purchases.filter(p=>inRange(p.date,start,end));
  const productionsInRange = DATA.productions.filter(p=>inRange(p.date,start,end));

  const totalPenjualan = salesInRange.reduce((s,x)=>s+x.total,0);
  const totalPembelian = purchasesInRange.reduce((s,x)=>s+x.total,0);
  const totalProduksi = productionsInRange.reduce((s,x)=>s+x.totalCost,0);
  const laba = salesInRange.reduce((s,x)=>s+(x.total-cogsFor(x)),0);

  const salesTableHTML = salesInRange.length ? `<table><thead><tr><th>Kode/Resi</th><th>Tanggal</th><th>Pihak</th><th>Total</th></tr></thead>
    <tbody>${[...salesInRange].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(s=>{
      const name = s.customerId ? (customerById(s.customerId)?.name||'-') : s.customerName;
      const code = s.code || s.resi;
      return `<tr><td>${code}</td><td>${fmtDate(s.date)}</td><td>${name}</td><td>${fmtRp(s.total)}</td></tr>`;
    }).join('')}</tbody></table>` : '<div class="empty">Tidak ada data penjualan pada periode ini</div>';

  const purchTableHTML = purchasesInRange.length ? `<table><thead><tr><th>Kode</th><th>Tanggal</th><th>Supplier</th><th>Total</th></tr></thead>
    <tbody>${[...purchasesInRange].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(p=>`<tr><td>${p.code}</td><td>${fmtDate(p.date)}</td><td>${supplierById(p.supplierId)?.name||'-'}</td><td>${fmtRp(p.total)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">Tidak ada data pembelian pada periode ini</div>';

  const prodTableHTML = productionsInRange.length ? `<table><thead><tr><th>Kode</th><th>Tanggal</th><th>Resep</th><th>Hasil</th><th>Biaya</th></tr></thead>
    <tbody>${[...productionsInRange].sort((a,b)=>new Date(a.date)-new Date(b.date)).map(p=>`<tr><td>${p.code}</td><td>${fmtDate(p.date)}</td><td>${recipeById(p.recipeId)?.name||'-'}</td><td>${p.producedQty}</td><td>${fmtRp(p.totalCost)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">Tidak ada data produksi pada periode ini</div>';

  const summaryHTML = `<div class="grid-4" style="margin-bottom:18px;">
    <div class="card"><div class="stat-label">Total Penjualan</div><div class="stat-value">${fmtRp(totalPenjualan)}</div></div>
    <div class="card"><div class="stat-label">Total Pembelian</div><div class="stat-value">${fmtRp(totalPembelian)}</div></div>
    <div class="card"><div class="stat-label">Biaya Produksi</div><div class="stat-value">${fmtRp(totalProduksi)}</div></div>
    <div class="card"><div class="stat-label">Laba Kotor</div><div class="stat-value">${fmtRp(laba)}</div></div>
  </div>`;

  let body = summaryHTML;
  if(jenis==='rekap'){
    body += `<div class="card" style="margin-bottom:16px;"><div class="section-title" style="margin-bottom:12px;">Laporan Penjualan</div><div class="table-wrap">${salesTableHTML}</div></div>`;
    body += `<div class="card" style="margin-bottom:16px;"><div class="section-title" style="margin-bottom:12px;">Laporan Pembelian</div><div class="table-wrap">${purchTableHTML}</div></div>`;
    body += `<div class="card"><div class="section-title" style="margin-bottom:12px;">Laporan Produksi</div><div class="table-wrap">${prodTableHTML}</div></div>`;
  } else if(jenis==='penjualan'){
    body += `<div class="card"><div class="section-title" style="margin-bottom:12px;">Laporan Penjualan</div><div class="table-wrap">${salesTableHTML}</div></div>`;
  } else if(jenis==='pembelian'){
    body += `<div class="card"><div class="section-title" style="margin-bottom:12px;">Laporan Pembelian</div><div class="table-wrap">${purchTableHTML}</div></div>`;
  } else if(jenis==='produksi'){
    body += `<div class="card"><div class="section-title" style="margin-bottom:12px;">Laporan Produksi</div><div class="table-wrap">${prodTableHTML}</div></div>`;
  }
  document.getElementById('laporanContent').innerHTML = body;
}
