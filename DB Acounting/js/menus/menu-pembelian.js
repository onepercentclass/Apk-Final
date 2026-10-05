/* ---- PEMBELIAN ---- */
PAGES.pembelian=function(){
  const c=co();
  const rows=[...c.purchases].sort((a,b)=>b.date.localeCompare(a.date));
  const totalBeli=rows.reduce((s,r)=>s+r.total,0);
  const belum=rows.filter(r=>r.status!=='Lunas').length;
  return `
  <div class="row wrap" style="margin-bottom:4px;"><div><div class="page-title">Pembelian</div><div class="page-sub">Tagihan pembelian &amp; hutang usaha ${esc(c.name)}.</div></div>
    <div class="row" style="margin-left:auto;gap:8px;"><button class="btn-dl" onclick="exportPembelian()">${ic('download',13)}Unduh CSV</button><button class="btn btn-primary" onclick="openPurchaseModal()">${ic('plus',14)}Tagihan Baru</button></div></div>
  <div class="grid g3" style="margin-bottom:16px;">
    <div class="card stat-card"><div class="stat-label">Total Pembelian</div><div class="stat-value">${fmtRp(totalBeli)}</div></div>
    <div class="card stat-card"><div class="stat-label">Jumlah Tagihan</div><div class="stat-value">${rows.length}</div></div>
    <div class="card stat-card"><div class="stat-label">Belum Dibayar</div><div class="stat-value" style="color:var(--warn)">${belum}</div></div>
  </div>
  <div class="card"><div class="table-wrap">
    ${rows.length?`<table><thead><tr><th>No. Tagihan</th><th>Tanggal</th><th>Supplier</th><th>Kategori</th><th>Keterangan</th><th class="right">Total</th><th>Status</th><th></th></tr></thead><tbody>
      ${rows.map(r=>{const sup=c.contacts.find(x=>x.id===r.supplierId);return `<tr><td class="acct-pill">${esc(r.no)}</td><td>${fmtDate(r.date)}</td><td>${esc(sup?sup.name:'-')}</td><td>${esc(r.category)}</td><td>${esc(r.desc)}</td><td class="right num">${fmtRp(r.total)}</td><td>${r.status==='Lunas'?`<span class="badge b-pos">Lunas</span>`:`<span class="badge b-warn">Belum Lunas</span>`}</td><td>${r.status!=='Lunas'?`<button class="btn btn-sm" onclick="doPaySupplier('${r.id}')">Bayar</button>`:''}</td></tr>`;}).join('')}
    </tbody></table>`:`<div class="empty">${ic('purchase',32)}<div class="et">Belum ada tagihan pembelian</div><div class="es">Catat pembelian bahan, operasional, atau aset di sini.</div></div>`}
  </div></div>`;
};
function exportPembelian(){
  const c=co();
  const rows=[...c.purchases].sort((a,b)=>b.date.localeCompare(a.date));
  downloadCSV('Pembelian',['No. Tagihan','Tanggal','Supplier','Kategori','Keterangan','Nominal','PPN','Total','Status'],
    rows.map(r=>{const sup=c.contacts.find(x=>x.id===r.supplierId);return [r.no,fmtDate(r.date),sup?sup.name:'-',r.category,r.desc,r.amount,r.tax,r.total,r.status];}));
}
function openPurchaseModal(){
  const c=co();
  const supOpts=c.contacts.filter(x=>x.type==='Supplier').map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('');
  const kasOpts=['1-1000','1-1010','1-1020','1-1030'].map(code=>`<option value="${code}">${esc(c.coa.find(a=>a.code===code).name)}</option>`).join('');
  openModal('Tagihan Pembelian Baru',`
    <div class="field-row"><div class="field"><label>Tanggal</label><input type="date" id="p_date" value="${todayStr()}"></div>
    <div class="field"><label>Supplier</label><select id="p_sup"><option value="">Umum</option>${supOpts}</select></div></div>
    <div class="field"><label>Keterangan</label><input type="text" id="p_desc" placeholder="Contoh: Beli bahan baku"></div>
    <div class="field"><label>Kategori</label><select id="p_cat">${Object.keys(PURCHASE_CATEGORY_MAP).map(k=>`<option value="${k}">${k}</option>`).join('')}</select></div>
    <div class="field-row"><div class="field"><label>Nominal</label><input type="number" id="p_amount" placeholder="0"></div>
    <div class="field"><label>Metode</label><select id="p_method"><option value="Tunai">Tunai</option><option value="Hutang">Hutang (belum dibayar)</option></select></div></div>
    <div class="field" id="p_kaswrap"><label>Rekening Sumber Dana</label><select id="p_kas">${kasOpts}</select></div>
    <label class="checkrow"><input type="checkbox" id="p_tax"> Ada PPN Masukan 11%</label>
  `,{onMount(){document.getElementById('p_method').addEventListener('change',e=>{document.getElementById('p_kaswrap').style.display=e.target.value==='Tunai'?'block':'none';});}});
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="submitPurchase()">Simpan Tagihan</button>`);
}
function submitPurchase(){
  const date=document.getElementById('p_date').value, desc=document.getElementById('p_desc').value.trim();
  const category=document.getElementById('p_cat').value, amount=document.getElementById('p_amount').value;
  const method=document.getElementById('p_method').value, kasAccount=document.getElementById('p_kas').value;
  const taxable=document.getElementById('p_tax').checked, supplierId=document.getElementById('p_sup').value||null;
  if(!date||!desc||!amount||Number(amount)<=0){toast('Lengkapi tanggal, keterangan, dan nominal');return;}
  const c=co(); addPurchase(c,{date,desc,category,amount,method,kasAccount,taxable,supplierId}); saveCompany(c.id); closeModal(); toast('Tagihan pembelian tersimpan'); renderAll();
}
function doPaySupplier(purchaseId){
  const c=co();
  openModal('Bayar Hutang Usaha',`<div class="field"><label>Rekening Sumber Dana</label><select id="pp_kas">${['1-1000','1-1010','1-1020','1-1030'].map(code=>`<option value="${code}">${esc(c.coa.find(a=>a.code===code).name)}</option>`).join('')}</select></div>`);
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="(function(){paySupplier(co(),'${purchaseId}',document.getElementById('pp_kas').value);saveCompany(co().id);closeModal();toast('Hutang dibayar');renderAll();})()">Konfirmasi</button>`);
}

