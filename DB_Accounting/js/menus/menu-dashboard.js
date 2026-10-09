/* ---- DASHBOARD ---- */
PAGES.dashboard=function(){
  const c=co();
  const aset=totalAset(c),kwj=totalKewajiban(c),modal=totalModal(c);
  const {rev,exp,profit}=periodSums(c);
  const kasbank=saldoKasBank(c);
  const totalKas=kasbank.reduce((s,x)=>s+x.balance,0);
  const piutang=totalPiutang(c),hutang=totalHutang(c);
  const persediaanVal=c.inventory.reduce((s,i)=>s+i.qty*i.avgCost,0);
  const rasioLancar = (totalKas+piutang+persediaanVal) / Math.max(1,hutang);

  // 12 month trend
  const now=new Date();const months=[],revArr=[],expArr=[],profArr=[];
  for(let i=11;i>=0;i--){
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    const ym=d.toISOString().slice(0,7);
    months.push(MONTHS_ID[d.getMonth()]);
    let r=0,e=0;
    c.journal.forEach(j=>{ if(monthKey(j.date)!==ym) return; j.lines.forEach(l=>{const a=c.coa.find(x=>x.code===l.account);if(!a)return;if(a.type==='Pendapatan')r+=(l.credit||0)-(l.debit||0);if(a.type==='Beban')e+=(l.debit||0)-(l.credit||0);}); });
    revArr.push(r);expArr.push(e);profArr.push(r-e);
  }
  // revenue composition
  const revAccts=c.coa.filter(a=>a.type==='Pendapatan');
  const compPalette=['var(--accent)','#2F8FE0','#C97A16','#8B6FE0','#5FA8A0'];
  const comp=revAccts.map((a,i)=>({label:a.name,value:Math.max(0,acctBalance(c,a.code)),color:compPalette[i%compPalette.length]})).filter(x=>x.value>0);
  const compTotal=comp.reduce((s,x)=>s+x.value,0);

  // recent transactions merged
  const recent=[];
  c.sales.forEach(s=>recent.push({date:s.date,no:s.no,jenis:'Penjualan',ket:s.desc,total:s.total,badge:'b-pos'}));
  c.purchases.forEach(p=>recent.push({date:p.date,no:p.no,jenis:'Pembelian',ket:p.desc,total:p.total,badge:'b-neg'}));
  c.cashbank.forEach(k=>recent.push({date:k.date,no:k.no,jenis:'Kas '+k.type,ket:k.desc,total:k.amount,badge:k.type==='Masuk'?'b-pos':'b-neg'}));
  c.journal.filter(j=>j.source==='Manual').forEach(j=>recent.push({date:j.date,no:j.no,jenis:'Jurnal',ket:j.desc,total:j.totalD,badge:'b-accent'}));
  recent.sort((a,b)=>b.date.localeCompare(a.date));

  // reminders
  const reminders=[];
  c.sales.filter(s=>s.status!=='Lunas'&&daysSince(s.date)>30).forEach(s=>reminders.push({icon:'alert',color:'neg',text:'Piutang jatuh tempo: '+s.no,sub:daysSince(s.date)+' hari sejak invoice'}));
  c.purchases.filter(p=>p.status!=='Lunas'&&daysSince(p.date)>30).forEach(p=>reminders.push({icon:'clock',color:'warn',text:'Hutang belum dibayar: '+p.no,sub:daysSince(p.date)+' hari sejak tagihan'}));
  const ym=new Date().toISOString().slice(0,7);
  if(c.fixedAssets.some(a=>a.lastDepMonth!==ym && (a.cost-a.salvage-a.accDep)>0.5)) reminders.push({icon:'asset',color:'accent',text:'Penyusutan aset tetap bulan ini',sub:'Belum dijalankan untuk '+MONTHS_FULL[new Date().getMonth()]});
  c.inventory.filter(i=>i.qty<=i.minStock && i.minStock>0).forEach(i=>reminders.push({icon:'box',color:'warn',text:'Stok menipis: '+i.name,sub:'Sisa '+i.qty+' '+i.unit}));

  const emptyState = c.journal.length===0;

  return `
  <div class="page-title">Selamat datang 👋</div>
  <div class="page-sub">Ringkasan keuangan ${esc(c.name)}. Kelola bisnis Anda dengan mudah, cepat, dan akurat.</div>

  ${emptyState?`<div class="banner banner-warn">${ic('alert',16)}<div>Belum ada transaksi untuk ${esc(c.name)}. Mulai dengan mencatat penjualan, pembelian, atau kas pertama Anda dari menu Aksi Cepat di sebelah kanan.</div></div>`:''}

  <div class="grid g4" style="margin-bottom:16px;">
    <div class="card stat-card">
      <div class="stat-icon" style="background:var(--accent-dim);color:var(--accent)">${ic('wallet',16)}</div>
      <div class="stat-label">Total Aset</div><div class="stat-value">${fmtRp(aset)}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon" style="background:var(--warn-dim);color:var(--warn)">${ic('bank',16)}</div>
      <div class="stat-label">Total Kewajiban</div><div class="stat-value">${fmtRp(kwj)}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon" style="background:var(--pos-dim);color:var(--pos)">${ic('building',16)}</div>
      <div class="stat-label">Modal</div><div class="stat-value">${fmtRp(modal)}</div>
    </div>
    <div class="card stat-card">
      <div class="stat-icon" style="background:${profit>=0?'var(--pos-dim)':'var(--neg-dim)'};color:${profit>=0?'var(--pos)':'var(--neg)'}">${ic('report',16)}</div>
      <div class="stat-label">Laba/Rugi</div><div class="stat-value" style="color:${profit>=0?'var(--pos)':'var(--neg)'}">${fmtRp(profit)}</div>
    </div>
  </div>

  <div class="grid g-main" style="margin-bottom:16px;">
    <div class="card">
      <div class="card-head"><h3>Laporan Laba Rugi</h3><span class="chsub">12 bulan terakhir · dari jurnal yang diposting</span></div>
      <div class="card-pad">
        <div class="row" style="gap:16px;margin-bottom:6px;">
          <div class="legend-row"><span class="dot" style="background:var(--pos)"></span>Pendapatan</div>
          <div class="legend-row"><span class="dot" style="background:var(--neg)"></span>Beban</div>
          <div class="legend-row"><span class="dot" style="background:var(--accent-2)"></span>Laba Bersih</div>
        </div>
        ${barLineChart(months,revArr,expArr,profArr)}
        <p class="hint" style="margin-top:8px">Angka = total jurnal per bulan. Cocokkan dengan menu Laporan → Laba Rugi untuk verifikasi.</p>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Komposisi Pendapatan</h3></div>
      <div class="card-pad" style="display:flex;flex-direction:column;align-items:center;gap:16px;">
        ${comp.length? `<div style="position:relative;">${donutChart(comp)}<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;"><div style="font-size:10.5px;color:var(--text-3)">Total</div><div class="num" style="font-size:13px;font-weight:700;">${fmtRp(compTotal)}</div></div></div>`
          : `<div class="empty" style="padding:30px 0;">${ic('report',30)}<div class="et">Belum ada data</div></div>`}
        <div style="width:100%;">
          ${comp.map(x=>`<div class="legend-row" style="justify-content:space-between;"><span class="row"><span class="dot" style="background:${x.color}"></span>${esc(x.label)}</span><b class="num">${compTotal?Math.round(x.value/compTotal*100):0}%</b></div>`).join('')||''}
        </div>
      </div>
    </div>
  </div>

  <div class="grid g-main" style="margin-bottom:16px;">
    <div class="card">
      <div class="card-head"><h3>Saldo Kas & Bank</h3></div>
      <div class="card-pad">
        ${kasbank.map(k=>`<div class="kv"><span class="row">${ic('bank',15)} ${esc(k.name)}</span><b class="num">${fmtRp(k.balance)}</b></div>`).join('')}
        <div class="kv" style="border-top:1px solid var(--border-strong);margin-top:6px;padding-top:11px;"><span>Total Saldo</span><b class="num" style="font-size:15px;">${fmtRp(totalKas)}</b></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Piutang & Hutang</h3><a class="chsub" style="cursor:pointer;color:var(--accent)" onclick="navigate('laporan','piutang')">Lihat Semua</a></div>
      <div class="card-pad">
        <div class="kv"><span class="row">${ic('sales',15)} Piutang Usaha</span><b class="num" style="color:var(--pos)">${fmtRp(piutang)}</b></div>
        <div class="kv"><span class="row">${ic('purchase',15)} Hutang Usaha</span><b class="num" style="color:var(--neg)">${fmtRp(hutang)}</b></div>
        <div class="kv"><span>Rasio Lancar</span><b class="num">${rasioLancar.toFixed(2)}</b></div>
      </div>
    </div>
  </div>

  <div class="grid g-main">
    <div class="card">
      <div class="card-head"><h3>Transaksi Terbaru</h3><a class="chsub" style="cursor:pointer;color:var(--accent)" onclick="navigate('transaksi')">Lihat Semua</a></div>
      <div class="table-wrap">
        ${recent.length? `<table><thead><tr><th>Tanggal</th><th>No. Transaksi</th><th>Jenis</th><th>Keterangan</th><th class="right">Total</th></tr></thead><tbody>
          ${recent.slice(0,8).map(r=>`<tr><td>${fmtDate(r.date)}</td><td class="acct-pill">${esc(r.no)}</td><td><span class="badge ${r.badge}">${esc(r.jenis)}</span></td><td>${esc(r.ket)}</td><td class="right num">${fmtRp(r.total)}</td></tr>`).join('')}
        </tbody></table>` : `<div class="empty">${ic('txn',30)}<div class="et">Belum ada transaksi</div><div class="es">Catat transaksi pertama Anda dari Aksi Cepat.</div></div>`}
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div class="card card-pad">
        <h3 style="margin-bottom:12px;">Aksi Cepat</h3>
        <div class="quickgrid">
          <button class="quickbtn" onclick="navigate('penjualan');openSaleModal();">${ic('sales',16)}Buat Faktur Penjualan</button>
          <button class="quickbtn" onclick="navigate('pembelian');openPurchaseModal();">${ic('purchase',16)}Buat Faktur Pembelian</button>
          <button class="quickbtn" onclick="navigate('kasbank');openCashbankModal();">${ic('bank',16)}Input Kas/Bank</button>
          <button class="quickbtn" onclick="navigate('jurnal');openJournalModal();">${ic('journal',16)}Jurnal Umum</button>
          <button class="quickbtn" onclick="navigate('laporan')">${ic('report',16)}Laporan Keuangan</button>
          <button class="quickbtn" onclick="navigate('perusahaan');openCompanyModal();">${ic('plus',16)}Tambah Perusahaan</button>
        </div>
      </div>
      <div class="card card-pad">
        <h3 style="margin-bottom:6px;">Pengingat & Tugas</h3>
        ${reminders.length? reminders.slice(0,5).map(r=>`<div class="reminder-item"><div class="ri-icon" style="background:var(--${r.color}-dim);color:var(--${r.color})">${ic(r.icon,15)}</div><div><div class="ri-text">${esc(r.text)}</div><div class="ri-sub">${esc(r.sub)}</div></div></div>`).join('')
          : `<div class="empty" style="padding:20px 0;"><div class="es">Tidak ada pengingat saat ini.</div></div>`}
      </div>
    </div>
  </div>
  `;
};

