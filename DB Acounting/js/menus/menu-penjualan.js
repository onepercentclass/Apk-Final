/* ---- PENJUALAN ---- */
PAGES.penjualan=function(){
  const c=co();
  const rows=[...c.sales].sort((a,b)=>b.date.localeCompare(a.date));
  const totalPend=rows.reduce((s,r)=>s+r.total,0);
  const belumLunas=rows.filter(r=>r.status!=='Lunas').length;
  return `
  <div class="row wrap" style="margin-bottom:4px;"><div><div class="page-title">Penjualan</div><div class="page-sub">Faktur penjualan &amp; piutang usaha ${esc(c.name)}.</div></div>
    <div class="row" style="margin-left:auto;gap:8px;"><button class="btn-dl" onclick="exportPenjualan()">${ic('download',13)}Unduh CSV</button><button class="btn btn-primary" onclick="openSaleModal()">${ic('plus',14)}Faktur Baru</button></div></div>
  <div class="grid g3" style="margin-bottom:16px;">
    <div class="card stat-card"><div class="stat-label">Total Penjualan</div><div class="stat-value">${fmtRp(totalPend)}</div></div>
    <div class="card stat-card"><div class="stat-label">Jumlah Faktur</div><div class="stat-value">${rows.length}</div></div>
    <div class="card stat-card"><div class="stat-label">Belum Lunas</div><div class="stat-value" style="color:var(--warn)">${belumLunas}</div></div>
  </div>
  <div class="card"><div class="table-wrap">
    ${rows.length?`<table><thead><tr><th>No. Invoice</th><th>Tanggal</th><th>Pelanggan</th><th>Keterangan</th><th class="right">Nominal</th><th class="right">PPN</th><th class="right">Total</th><th>Status</th><th></th></tr></thead><tbody>
      ${rows.map(r=>{const cust=c.contacts.find(x=>x.id===r.customerId);return `<tr><td class="acct-pill">${esc(r.no)}</td><td>${fmtDate(r.date)}</td><td>${esc(cust?cust.name:'Umum')}</td><td>${esc(r.desc)}</td><td class="right num">${fmtRp(r.amount)}</td><td class="right num">${fmtRp(r.tax)}</td><td class="right num">${fmtRp(r.total)}</td><td>${r.status==='Lunas'?`<span class="badge b-pos">Lunas</span>`:`<span class="badge b-warn">Belum Lunas</span>`}</td><td>${r.status!=='Lunas'?`<button class="btn btn-sm" onclick="doReceivePayment('${r.id}')">Terima Bayar</button>`:''}</td></tr>`;}).join('')}
    </tbody></table>`:`<div class="empty">${ic('sales',32)}<div class="et">Belum ada faktur penjualan</div><div class="es">Buat faktur pertama untuk mulai mencatat pendapatan.</div></div>`}
  </div></div>`;
};
function exportPenjualan(){
  const c=co();
  const rows=[...c.sales].sort((a,b)=>b.date.localeCompare(a.date));
  downloadCSV('Penjualan',['No. Invoice','Tanggal','Pelanggan','Keterangan','Nominal','PPN','Total','Status'],
    rows.map(r=>{const cust=c.contacts.find(x=>x.id===r.customerId);return [r.no,fmtDate(r.date),cust?cust.name:'Umum',r.desc,r.amount,r.tax,r.total,r.status];}));
}
function openSaleModal(){
  const c=co();
  const custOpts=c.contacts.filter(x=>x.type==='Pelanggan').map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');
  const kasOpts=['1-1000','1-1010','1-1020','1-1030'].map(code=>`<option value="${code}">${esc(c.coa.find(a=>a.code===code).name)}</option>`).join('');
  openModal('Faktur Penjualan Baru',`
    <div class="field-row"><div class="field"><label>Tanggal</label><input type="date" id="f_date" value="${todayStr()}"></div>
    <div class="field"><label>Pelanggan</label><select id="f_cust"><option value="">Pelanggan Umum</option>${custOpts}</select></div></div>
    <div class="field"><label>Keterangan</label><input type="text" id="f_desc" placeholder="Contoh: Penjualan produk 3 pcs"></div>
    <div class="field-row"><div class="field"><label>Nominal (sebelum pajak)</label><input type="number" id="f_amount" placeholder="0"></div>
    <div class="field"><label>Metode</label><select id="f_method"><option value="Tunai">Tunai</option><option value="Piutang">Piutang (belum dibayar)</option></select></div></div>
    <div class="field" id="f_kaswrap"><label>Rekening Penerima</label><select id="f_kas">${kasOpts}</select></div>
    <label class="checkrow" style="margin-bottom:6px;"><input type="checkbox" id="f_tax"> Kena PPN 11%</label>
    <div class="hint">Jurnal akan dibuat otomatis: Debit ${'Kas/Piutang'}, Kredit Pendapatan Penjualan${''}${''}.</div>
  `,{onMount(){
    document.getElementById('f_method').addEventListener('change',e=>{document.getElementById('f_kaswrap').style.display=e.target.value==='Tunai'?'block':'none';});
  }});
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="submitSale()">Simpan Faktur</button>`);
}
function submitSale(){
  const date=document.getElementById('f_date').value, desc=document.getElementById('f_desc').value.trim();
  const amount=document.getElementById('f_amount').value, method=document.getElementById('f_method').value;
  const kasAccount=document.getElementById('f_kas').value, taxable=document.getElementById('f_tax').checked;
  const customerId=document.getElementById('f_cust').value||null;
  if(!date||!desc||!amount||Number(amount)<=0){toast('Lengkapi tanggal, keterangan, dan nominal');return;}
  const c=co(); addSale(c,{date,desc,amount,method,kasAccount,taxable,customerId}); saveCompany(c.id); closeModal(); toast('Faktur penjualan tersimpan'); renderAll();
}
function doReceivePayment(saleId){
  const c=co();
  openModal('Terima Pembayaran Piutang',`<div class="field"><label>Rekening Penerima</label><select id="rp_kas">${['1-1000','1-1010','1-1020','1-1030'].map(code=>`<option value="${code}">${esc(c.coa.find(a=>a.code===code).name)}</option>`).join('')}</select></div>`);
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="(function(){receiveSalePayment(co(),'${saleId}',document.getElementById('rp_kas').value);saveCompany(co().id);closeModal();toast('Pembayaran diterima');renderAll();})()">Konfirmasi</button>`);
}

