/* ---- TRANSAKSI (unified) ---- */
PAGES.transaksi=function(){
  const c=co();
  const all=[];
  c.sales.forEach(s=>all.push({date:s.date,no:s.no,jenis:'Penjualan',badge:'b-pos',ket:s.desc,total:s.total,status:s.status}));
  c.purchases.forEach(p=>all.push({date:p.date,no:p.no,jenis:'Pembelian',badge:'b-neg',ket:p.desc,total:p.total,status:p.status}));
  c.cashbank.forEach(k=>all.push({date:k.date,no:k.no,jenis:'Kas & Bank — '+k.type,badge:k.type==='Masuk'?'b-pos':'b-neg',ket:k.desc,total:k.amount,status:'-'}));
  c.journal.filter(j=>j.source==='Manual').forEach(j=>all.push({date:j.date,no:j.no,jenis:'Jurnal Umum',badge:'b-accent',ket:j.desc,total:j.totalD,status:'-'}));
  all.sort((a,b)=>b.date.localeCompare(a.date));
  return `
  <div class="row" style="margin-bottom:4px;"><div><div class="page-title">Transaksi</div><div class="page-sub">Semua transaksi ${esc(c.name)} dalam satu tampilan.</div></div>
    <button class="btn-dl" style="margin-left:auto;" onclick="exportTransaksi()">${ic('download',13)}Unduh CSV</button></div>
  <div class="card">
    <div class="table-wrap">
      ${all.length? `<table><thead><tr><th>Tanggal</th><th>No. Transaksi</th><th>Jenis</th><th>Keterangan</th><th>Status</th><th class="right">Total</th></tr></thead><tbody>
        ${all.map(r=>`<tr><td>${fmtDate(r.date)}</td><td class="acct-pill">${esc(r.no)}</td><td><span class="badge ${r.badge}">${esc(r.jenis)}</span></td><td>${esc(r.ket)}</td><td>${r.status==='Lunas'?`<span class="badge b-pos">Lunas</span>`:r.status==='Belum Lunas'?`<span class="badge b-warn">Belum Lunas</span>`:'—'}</td><td class="right num">${fmtRp(r.total)}</td></tr>`).join('')}
      </tbody></table>` : `<div class="empty">${ic('txn',32)}<div class="et">Belum ada transaksi</div><div class="es">Transaksi dari Penjualan, Pembelian, Kas & Bank, dan Jurnal Umum akan tampil di sini.</div></div>`}
    </div>
  </div>`;
};

function exportTransaksi(){
  const c=co();
  const all=[];
  c.sales.forEach(s=>all.push({date:s.date,no:s.no,jenis:'Penjualan',ket:s.desc,total:s.total,status:s.status}));
  c.purchases.forEach(p=>all.push({date:p.date,no:p.no,jenis:'Pembelian',ket:p.desc,total:p.total,status:p.status}));
  c.cashbank.forEach(k=>all.push({date:k.date,no:k.no,jenis:'Kas & Bank — '+k.type,ket:k.desc,total:k.amount,status:'-'}));
  c.journal.filter(j=>j.source==='Manual').forEach(j=>all.push({date:j.date,no:j.no,jenis:'Jurnal Umum',ket:j.desc,total:j.totalD,status:'-'}));
  all.sort((a,b)=>b.date.localeCompare(a.date));
  downloadCSV('Transaksi',['Tanggal','No. Transaksi','Jenis','Keterangan','Status','Total'],all.map(r=>[fmtDate(r.date),r.no,r.jenis,r.ket,r.status,r.total]));
}

