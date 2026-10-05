/* ---- LAPORAN ---- */
PAGES.laporan=function(){
  const c=co();
  const tab=S.routeParam||'labarugi';
  const tabs=[['labarugi','Laba Rugi'],['neraca','Neraca'],['saldo','Neraca Saldo'],['bukubesar','Buku Besar'],['piutang','Piutang'],['hutang','Hutang']];
  let body='';
  if(tab==='labarugi'){
    const {rev,exp,profit}=periodSums(c);
    const revRows=c.coa.filter(a=>a.type==='Pendapatan').map(a=>({a,bal:acctBalance(c,a.code)}));
    const expRows=c.coa.filter(a=>a.type==='Beban').map(a=>({a,bal:acctBalance(c,a.code)}));
    body=`<div class="grid g2">
      <div class="card"><div class="card-head"><h3>Pendapatan</h3></div><div class="card-pad">
        ${revRows.map(r=>`<div class="kv"><span>${esc(r.a.name)}</span><b class="num">${fmtRp(r.bal)}</b></div>`).join('')}
        <div class="kv" style="border-top:1px solid var(--border-strong);margin-top:6px;padding-top:11px;"><span>Total Pendapatan</span><b class="num">${fmtRp(rev)}</b></div>
      </div></div>
      <div class="card"><div class="card-head"><h3>Beban</h3></div><div class="card-pad">
        ${expRows.map(r=>`<div class="kv"><span>${esc(r.a.name)}</span><b class="num">${fmtRp(r.bal)}</b></div>`).join('')}
        <div class="kv" style="border-top:1px solid var(--border-strong);margin-top:6px;padding-top:11px;"><span>Total Beban</span><b class="num">${fmtRp(exp)}</b></div>
      </div></div>
    </div>
    <div class="card card-pad" style="margin-top:16px;"><div class="kv" style="border:none;"><span style="font-weight:600;font-size:15px;">Laba / Rugi Bersih</span><b class="num" style="font-size:18px;color:${profit>=0?'var(--pos)':'var(--neg)'}">${fmtRp(profit)}</b></div></div>`;
  } else if(tab==='neraca'){
    const aset=c.coa.filter(a=>a.type==='Aset'&&!a.contra);
    const contra=c.coa.filter(a=>a.contra);
    const kwj=c.coa.filter(a=>a.type==='Kewajiban');
    const modalPokok=c.coa.filter(a=>a.type==='Modal');
    const {profit}=periodSums(c);
    const totA=totalAset(c),totK=totalKewajiban(c),totM=totalModal(c);
    body=`<div class="grid g2">
      <div class="card"><div class="card-head"><h3>Aset</h3></div><div class="card-pad">
        ${aset.map(a=>`<div class="kv"><span>${esc(a.name)}</span><b class="num">${fmtRp(acctBalance(c,a.code))}</b></div>`).join('')}
        ${contra.map(a=>`<div class="kv"><span>(-) ${esc(a.name)}</span><b class="num">(${fmtRp(acctBalance(c,a.code))})</b></div>`).join('')}
        <div class="kv" style="border-top:1px solid var(--border-strong);margin-top:6px;padding-top:11px;"><span>Total Aset</span><b class="num">${fmtRp(totA)}</b></div>
      </div></div>
      <div class="card"><div class="card-head"><h3>Kewajiban & Modal</h3></div><div class="card-pad">
        ${kwj.map(a=>`<div class="kv"><span>${esc(a.name)}</span><b class="num">${fmtRp(acctBalance(c,a.code))}</b></div>`).join('')}
        <div class="kv" style="font-weight:600;"><span>Total Kewajiban</span><b class="num">${fmtRp(totK)}</b></div>
        ${modalPokok.map(a=>`<div class="kv" style="margin-top:8px;"><span>${esc(a.name)}</span><b class="num">${fmtRp(acctBalance(c,a.code))}</b></div>`).join('')}
        <div class="kv"><span>Laba Berjalan</span><b class="num">${fmtRp(profit)}</b></div>
        <div class="kv" style="border-top:1px solid var(--border-strong);margin-top:6px;padding-top:11px;"><span>Total Kewajiban + Modal</span><b class="num">${fmtRp(totK+totM)}</b></div>
      </div></div>
    </div>`;
  } else if(tab==='saldo'){
    let sumD=0,sumC=0;
    const rows=c.coa.map(a=>{
      const bal=acctBalance(c,a.code);
      const isDebitNormal = a.type==='Aset'||a.type==='Beban';
      const d = bal>=0 ? (isDebitNormal?bal:0) : (isDebitNormal?0:-bal);
      const cr = bal>=0 ? (isDebitNormal?0:bal) : (isDebitNormal?-bal:0);
      sumD+=d;sumC+=cr;
      return {a,d,cr};
    });
    body=`<div class="card"><div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama Akun</th><th>Tipe</th><th class="right">Debit</th><th class="right">Kredit</th></tr></thead><tbody>
      ${rows.map(r=>`<tr><td class="acct-pill">${r.a.code}</td><td>${esc(r.a.name)}</td><td>${esc(r.a.type)}</td><td class="right num">${r.d?fmtRp(r.d):''}</td><td class="right num">${r.cr?fmtRp(r.cr):''}</td></tr>`).join('')}
      <tr><td colspan="3" style="font-weight:700;">Total</td><td class="right num" style="font-weight:700;">${fmtRp(sumD)}</td><td class="right num" style="font-weight:700;">${fmtRp(sumC)}</td></tr>
    </tbody></table></div></div>`;
  } else if(tab==='bukubesar'){
    const sel=S.buSelAcct||c.coa[0].code;
    let running=0;
    const acc=c.coa.find(a=>a.code===sel);
    const isDebitNormal=acc.type==='Aset'||acc.type==='Beban';
    const entries=[];
    [...c.journal].sort((a,b)=>a.date.localeCompare(b.date)).forEach(j=>{
      j.lines.forEach(l=>{ if(l.account===sel){ running += isDebitNormal? (l.debit-l.credit) : (l.credit-l.debit); entries.push({date:j.date,desc:j.desc,debit:l.debit,credit:l.credit,running}); } });
    });
    body=`<div class="field" style="max-width:340px;margin-bottom:16px;"><label>Pilih Akun</label><select onchange="S.buSelAcct=this.value;renderAll();">${c.coa.map(a=>`<option value="${a.code}" ${a.code===sel?'selected':''}>${a.code} — ${esc(a.name)}</option>`).join('')}</select></div>
    <div class="card"><div class="table-wrap">${entries.length?`<table><thead><tr><th>Tanggal</th><th>Keterangan</th><th class="right">Debit</th><th class="right">Kredit</th><th class="right">Saldo</th></tr></thead><tbody>
      ${entries.map(e=>`<tr><td>${fmtDate(e.date)}</td><td>${esc(e.desc)}</td><td class="right num">${e.debit?fmtRp(e.debit):''}</td><td class="right num">${e.credit?fmtRp(e.credit):''}</td><td class="right num">${fmtRp(e.running)}</td></tr>`).join('')}
    </tbody></table>`:`<div class="empty">${ic('journal',30)}<div class="et">Belum ada mutasi pada akun ini</div></div>`}</div></div>`;
  } else if(tab==='piutang'){
    const rows=c.sales.filter(s=>s.status!=='Lunas');
    body=`<div class="card"><div class="table-wrap">${rows.length?`<table><thead><tr><th>No. Invoice</th><th>Tanggal</th><th>Pelanggan</th><th class="right">Total</th><th class="right">Umur (hari)</th></tr></thead><tbody>
      ${rows.map(r=>{const cust=c.contacts.find(x=>x.id===r.customerId);const d=daysSince(r.date);return `<tr><td class="acct-pill">${esc(r.no)}</td><td>${fmtDate(r.date)}</td><td>${esc(cust?cust.name:'Umum')}</td><td class="right num">${fmtRp(r.total)}</td><td class="right"><span class="badge ${d>30?'b-neg':'b-warn'}">${d} hari</span></td></tr>`;}).join('')}
    </tbody></table>`:`<div class="empty">${ic('sales',30)}<div class="et">Tidak ada piutang</div></div>`}</div></div>`;
  } else if(tab==='hutang'){
    const rows=c.purchases.filter(p=>p.status!=='Lunas');
    body=`<div class="card"><div class="table-wrap">${rows.length?`<table><thead><tr><th>No. Tagihan</th><th>Tanggal</th><th>Supplier</th><th class="right">Total</th><th class="right">Umur (hari)</th></tr></thead><tbody>
      ${rows.map(r=>{const sup=c.contacts.find(x=>x.id===r.supplierId);const d=daysSince(r.date);return `<tr><td class="acct-pill">${esc(r.no)}</td><td>${fmtDate(r.date)}</td><td>${esc(sup?sup.name:'-')}</td><td class="right num">${fmtRp(r.total)}</td><td class="right"><span class="badge ${d>30?'b-neg':'b-warn'}">${d} hari</span></td></tr>`;}).join('')}
    </tbody></table>`:`<div class="empty">${ic('purchase',30)}<div class="et">Tidak ada hutang</div></div>`}</div></div>`;
  }
  return `<div class="row wrap" style="margin-bottom:4px;"><div><div class="page-title">Laporan</div><div class="page-sub">Laporan keuangan lengkap ${esc(c.name)}.</div></div>
    <button class="btn-dl" style="margin-left:auto;" onclick="exportLaporan('${tab}')">${ic('download',13)}Unduh CSV</button></div>
  <div class="tabs">${tabs.map(([k,l])=>`<div class="tab ${tab===k?'active':''}" onclick="navigate('laporan','${k}')">${l}</div>`).join('')}</div>
  ${body}`;
};
function exportLaporan(tab){
  const c=co();
  if(tab==='labarugi'){
    const {rev,exp,profit}=periodSums(c);
    const rows=[];
    c.coa.filter(a=>a.type==='Pendapatan').forEach(a=>rows.push(['Pendapatan',a.name,acctBalance(c,a.code)]));
    rows.push(['','Total Pendapatan',rev]);
    c.coa.filter(a=>a.type==='Beban').forEach(a=>rows.push(['Beban',a.name,acctBalance(c,a.code)]));
    rows.push(['','Total Beban',exp]);
    rows.push(['','Laba/Rugi Bersih',profit]);
    downloadCSV('LabaRugi',['Kelompok','Akun','Nominal'],rows);
  } else if(tab==='neraca'){
    const rows=[];
    c.coa.filter(a=>a.type==='Aset'&&!a.contra).forEach(a=>rows.push(['Aset',a.name,acctBalance(c,a.code)]));
    c.coa.filter(a=>a.contra).forEach(a=>rows.push(['Aset (Kontra)',a.name,-acctBalance(c,a.code)]));
    rows.push(['','Total Aset',totalAset(c)]);
    c.coa.filter(a=>a.type==='Kewajiban').forEach(a=>rows.push(['Kewajiban',a.name,acctBalance(c,a.code)]));
    c.coa.filter(a=>a.type==='Modal').forEach(a=>rows.push(['Modal',a.name,acctBalance(c,a.code)]));
    rows.push(['Modal','Laba Berjalan',periodSums(c).profit]);
    rows.push(['','Total Kewajiban + Modal',totalKewajiban(c)+totalModal(c)]);
    downloadCSV('Neraca',['Kelompok','Akun','Nominal'],rows);
  } else if(tab==='saldo'){
    const rows=c.coa.map(a=>{
      const bal=acctBalance(c,a.code); const isDebitNormal=a.type==='Aset'||a.type==='Beban';
      const d=bal>=0?(isDebitNormal?bal:0):(isDebitNormal?0:-bal);
      const cr=bal>=0?(isDebitNormal?0:bal):(isDebitNormal?-bal:0);
      return [a.code,a.name,a.type,d,cr];
    });
    downloadCSV('NeracaSaldo',['Kode','Nama Akun','Tipe','Debit','Kredit'],rows);
  } else if(tab==='bukubesar'){
    const sel=S.buSelAcct||c.coa[0].code; const acc=c.coa.find(a=>a.code===sel);
    const isDebitNormal=acc.type==='Aset'||acc.type==='Beban'; let running=0; const rows=[];
    [...c.journal].sort((a,b)=>a.date.localeCompare(b.date)).forEach(j=>{
      j.lines.forEach(l=>{ if(l.account===sel){ running+=isDebitNormal?(l.debit-l.credit):(l.credit-l.debit); rows.push([fmtDate(j.date),j.desc,l.debit||'',l.credit||'',running]); } });
    });
    downloadCSV('BukuBesar-'+acc.name,['Tanggal','Keterangan','Debit','Kredit','Saldo'],rows);
  } else if(tab==='piutang'){
    const rows=c.sales.filter(s=>s.status!=='Lunas').map(r=>{const cust=c.contacts.find(x=>x.id===r.customerId);return [r.no,fmtDate(r.date),cust?cust.name:'Umum',r.total,daysSince(r.date)];});
    downloadCSV('Piutang',['No. Invoice','Tanggal','Pelanggan','Total','Umur (hari)'],rows);
  } else if(tab==='hutang'){
    const rows=c.purchases.filter(p=>p.status!=='Lunas').map(r=>{const sup=c.contacts.find(x=>x.id===r.supplierId);return [r.no,fmtDate(r.date),sup?sup.name:'-',r.total,daysSince(r.date)];});
    downloadCSV('Hutang',['No. Tagihan','Tanggal','Supplier','Total','Umur (hari)'],rows);
  }
}

