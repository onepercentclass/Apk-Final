let trendChartInst=null, categoryChartInst=null;

function renderStatCards(){
  const cards = [
    {label:'Total Penjualan', value: fmtRp(totalSales()), icon:'cart', color:'var(--red)', bg:'rgba(226,38,59,.14)'},
    {label:'Total Pembelian', value: fmtRp(totalPurchases()), icon:'bag', color:'var(--amber)', bg:'rgba(232,163,57,.14)'},
    {label:'Stok Tersedia', value: totalStockUnits().toLocaleString('id-ID')+' Unit', icon:'box', color:'var(--teal)', bg:'rgba(43,183,166,.14)'},
    {label:'Laba Kotor', value: fmtRp(grossProfit()), icon:'coin', color:'var(--violet)', bg:'rgba(139,111,232,.14)'},
  ];
  document.getElementById('statCards').innerHTML = cards.map(c=>`
    <div class="card stat-card">
      <div class="stat-top">
        <div class="stat-icon" style="background:${c.bg}; color:${c.color};">${iconSvg(c.icon)}</div>
        <div class="stat-label">${c.label}</div>
      </div>
      <div class="stat-value">${c.value}</div>
    </div>
  `).join('');
}

function last7DaysLabels(){
  const arr=[];
  const now=new Date();
  for(let i=6;i>=0;i--){ const d=new Date(now); d.setDate(now.getDate()-i); arr.push(d.toISOString().slice(0,10)); }
  return arr;
}
function renderTrendChart(){
  const days = last7DaysLabels();
  const salesByDay = days.map(d=> allSalesRecords().filter(s=>s.date===d).reduce((s,x)=>s+x.total,0));
  const purchByDay = days.map(d=> DATA.purchases.filter(s=>s.date===d).reduce((s,x)=>s+x.total,0));
  const labels = days.map(d=> new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short'}));
  const ctx = document.getElementById('trendChart');
  if(trendChartInst) trendChartInst.destroy();
  trendChartInst = new Chart(ctx, {
    type:'bar',
    data:{ labels, datasets:[
      {label:'Penjualan', data:salesByDay, backgroundColor:'#e2263b', borderRadius:4, barThickness:16},
      {label:'Pembelian', data:purchByDay, backgroundColor:'#3a3a40', borderRadius:4, barThickness:16},
    ]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{labels:{color:cssVar('--muted'), usePointStyle:true, pointStyle:'circle', boxWidth:7, font:{size:11.5}}}},
      scales:{
        x:{ticks:{color:cssVar('--muted'), font:{size:11}}, grid:{display:false}},
        y:{ticks:{color:cssVar('--muted'), font:{size:11}, callback:(v)=> v>=1000000?(v/1000000)+'jt':(v/1000)+'rb'}, grid:{color:cssVar('--line')}}
      }
    }
  });
}
function renderCategoryChart(){
  const sums = {};
  CATEGORIES.forEach(c=>sums[c]=0);
  DATA.products.forEach(p=>{ sums[p.category] = (sums[p.category]||0) + p.stock*p.sellPrice; });
  const labels = CATEGORIES.filter(c=>sums[c]>0);
  const data = labels.map(l=>sums[l]);
  const colors = labels.map(l=>CATEGORY_COLORS[l]);
  const ctx = document.getElementById('categoryChart');
  if(categoryChartInst) categoryChartInst.destroy();
  if(data.length===0){ ctx.parentElement.innerHTML='<div class="empty">Belum ada data produk</div>'; return; }
  categoryChartInst = new Chart(ctx, {
    type:'doughnut',
    data:{ labels, datasets:[{data, backgroundColor:colors, borderColor:'#131316', borderWidth:3}]},
    options:{ responsive:true, maintainAspectRatio:false, cutout:'68%', plugins:{legend:{display:false}} }
  });
  const total = data.reduce((a,b)=>a+b,0) || 1;
  document.getElementById('categoryLegend').innerHTML = labels.map((l,i)=>`
    <div class="legend-row">
      <span class="legend-dot" style="background:${colors[i]}"></span>
      <span class="legend-label">${l}</span>
      <span class="legend-val">${Math.round(data[i]/total*100)}%</span>
    </div>`).join('');
}
function renderTopProducts(){
  const qtyMap = {};
  allSalesRecords().forEach(s=> s.items.forEach(it=> qtyMap[it.productId] = (qtyMap[it.productId]||0)+it.qty ));
  const rows = Object.entries(qtyMap).sort((a,b)=>b[1]-a[1]).slice(0,5)
    .map(([pid,qty])=>{ const p=productById(pid); return p? {p,qty} : null; }).filter(Boolean);
  const table = document.getElementById('topProductsTable');
  if(rows.length===0){ table.innerHTML='<tbody><tr><td class="empty">Belum ada transaksi penjualan</td></tr></tbody>'; return; }
  table.innerHTML = `
    <thead><tr><th>Produk</th><th>Kategori</th><th style="text-align:right">Terjual</th></tr></thead>
    <tbody>${rows.map(r=>`
      <tr>
        <td class="row-flex"><div class="prod-thumb">🧴</div><span class="cell-strong">${r.p.name}</span></td>
        <td class="cell-muted">${r.p.category}</td>
        <td style="text-align:right" class="cell-strong">${r.qty} ${r.p.unit}</td>
      </tr>`).join('')}
    </tbody>`;
}
function renderActivity(){
  const items = [
    ...DATA.sales.map(s=>({type:'sale', date:s.date, code:s.code, total:s.total})),
    ...DATA.purchases.map(p=>({type:'purchase', date:p.date, code:p.code, total:p.total})),
    ...DATA.onlineOrders.map(o=>({type:'online', date:o.date, code:o.resi, total:o.total})),
    ...DATA.productions.map(p=>({type:'production', date:p.date, code:p.code, total:p.totalCost})),
  ].sort((a,b)=> new Date(b.date)-new Date(a.date)).slice(0,6);
  const el = document.getElementById('activityList');
  if(items.length===0){ el.innerHTML='<div class="empty">Belum ada aktivitas</div>'; return; }
  const meta = {
    sale:{label:'Penjualan', icon:'cart', color:'var(--red)', bg:'rgba(226,38,59,.14)'},
    purchase:{label:'Pembelian', icon:'bag', color:'var(--amber)', bg:'rgba(232,163,57,.14)'},
    online:{label:'Pesanan Online', icon:'store', color:'var(--teal)', bg:'rgba(43,183,166,.14)'},
    production:{label:'Produksi', icon:'factory', color:'var(--violet)', bg:'rgba(139,111,232,.14)'},
  };
  el.innerHTML = items.map(it=>{
    const m = meta[it.type];
    return `<div class="activity-row">
      <div class="act-ic" style="background:${m.bg}; color:${m.color}">${iconSvg(m.icon)}</div>
      <div>
        <div class="act-title">${m.label} #${it.code}</div>
        <div class="act-sub">${fmtRp(it.total)} · ${fmtDate(it.date)}</div>
      </div>
    </div>`;
  }).join('');
}
function renderStockInfo(){
  const allItems = [...DATA.products, ...DATA.materials];
  const menipis = allItems.filter(p=>p.stock>0 && p.stock<=p.minStock).length;
  const habis = allItems.filter(p=>p.stock<=0).length;
  const aman = allItems.length - menipis - habis;
  document.getElementById('alertBadge').textContent = menipis+habis;
  document.getElementById('stockInfo').innerHTML = `
    <div class="finance-row">
      <div class="finance-left"><div class="finance-ic" style="background:rgba(232,163,57,.14); color:var(--amber);">${iconSvg('box')}</div><div class="finance-label">Stok Menipis</div></div>
      <div class="finance-val">${menipis} Item</div>
    </div>
    <div class="finance-row">
      <div class="finance-left"><div class="finance-ic" style="background:rgba(226,38,59,.14); color:var(--red);">${iconSvg('box')}</div><div class="finance-label">Stok Habis</div></div>
      <div class="finance-val">${habis} Item</div>
    </div>
    <div class="finance-row">
      <div class="finance-left"><div class="finance-ic" style="background:rgba(51,181,106,.14); color:var(--green);">${iconSvg('box')}</div><div class="finance-label">Stok Aman</div></div>
      <div class="finance-val">${aman} Item</div>
    </div>`;
}
