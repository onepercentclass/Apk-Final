/* ---- PERSEDIAAN ---- */
PAGES.persediaan=function(){
  const c=co();
  const totalVal=c.inventory.reduce((s,i)=>s+i.qty*i.avgCost,0);
  return `
  <div class="row wrap" style="margin-bottom:4px;"><div><div class="page-title">Persediaan</div><div class="page-sub">Stok barang dan nilai persediaan ${esc(c.name)}.</div></div>
    <div class="row" style="margin-left:auto;gap:8px;"><button class="btn-dl" onclick="exportPersediaan()">${ic('download',13)}Unduh CSV</button><button class="btn btn-primary" onclick="openItemModal()">${ic('plus',14)}Tambah Barang</button></div></div>
  <div class="grid g3" style="margin-bottom:16px;">
    <div class="card stat-card"><div class="stat-label">Jumlah SKU</div><div class="stat-value">${c.inventory.length}</div></div>
    <div class="card stat-card"><div class="stat-label">Total Nilai Persediaan</div><div class="stat-value">${fmtRp(totalVal)}</div></div>
    <div class="card stat-card"><div class="stat-label">Stok Menipis</div><div class="stat-value" style="color:var(--warn)">${c.inventory.filter(i=>i.qty<=i.minStock&&i.minStock>0).length}</div></div>
  </div>
  <div class="card"><div class="table-wrap">
    ${c.inventory.length?`<table><thead><tr><th>SKU</th><th>Nama Barang</th><th class="right">Qty</th><th>Satuan</th><th class="right">HPP Rata-rata</th><th class="right">Nilai Stok</th><th></th></tr></thead><tbody>
      ${c.inventory.map(i=>`<tr><td class="acct-pill">${esc(i.sku)}</td><td>${esc(i.name)}${i.qty<=i.minStock&&i.minStock>0?` <span class="badge b-warn">Stok Rendah</span>`:''}</td><td class="right num">${fmtNum(i.qty)}</td><td>${esc(i.unit)}</td><td class="right num">${fmtRp(i.avgCost)}</td><td class="right num">${fmtRp(i.qty*i.avgCost)}</td><td><button class="btn btn-sm" onclick="openStockModal('${i.id}','Masuk')">Masuk</button> <button class="btn btn-sm" onclick="openStockModal('${i.id}','Keluar')">Keluar</button></td></tr>`).join('')}
    </tbody></table>`:`<div class="empty">${ic('inv',32)}<div class="et">Belum ada barang</div><div class="es">Tambahkan item persediaan untuk mulai melacak stok.</div></div>`}
  </div></div>`;
};
function exportPersediaan(){
  const c=co();
  downloadCSV('Persediaan',['SKU','Nama Barang','Qty','Satuan','HPP Rata-rata','Nilai Stok'],
    c.inventory.map(i=>[i.sku,i.name,i.qty,i.unit,i.avgCost,i.qty*i.avgCost]));
}
function openItemModal(){
  openModal('Tambah Barang',`
    <div class="field"><label>Nama Barang</label><input type="text" id="iv_name" placeholder="Contoh: Shampoo Motor 500ml"></div>
    <div class="field-row"><div class="field"><label>Satuan</label><input type="text" id="iv_unit" value="pcs"></div>
    <div class="field"><label>Stok Minimum</label><input type="number" id="iv_min" placeholder="0"></div></div>
    <div class="field-row"><div class="field"><label>Qty Awal</label><input type="number" id="iv_qty" placeholder="0"></div>
    <div class="field"><label>HPP per Unit</label><input type="number" id="iv_cost" placeholder="0"></div></div>
  `);
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="submitItem()">Simpan</button>`);
}
function submitItem(){
  const name=document.getElementById('iv_name').value.trim();
  if(!name){toast('Isi nama barang');return;}
  const c=co(); addInventoryItem(c,{name,unit:document.getElementById('iv_unit').value,minStock:document.getElementById('iv_min').value,qty:document.getElementById('iv_qty').value,cost:document.getElementById('iv_cost').value});
  saveCompany(c.id); closeModal(); toast('Barang ditambahkan'); renderAll();
}
function openStockModal(itemId,type){
  const c=co();
  const kasOpts=['1-1000','1-1010','1-1020','1-1030'].map(code=>`<option value="${code}">${esc(c.coa.find(a=>a.code===code).name)}</option>`).join('');
  openModal((type==='Masuk'?'Stok Masuk':'Stok Keluar')+' — '+esc(c.inventory.find(i=>i.id===itemId).name),`
    <div class="field-row"><div class="field"><label>Tanggal</label><input type="date" id="sm_date" value="${todayStr()}"></div>
    <div class="field"><label>Qty</label><input type="number" id="sm_qty" placeholder="0"></div></div>
    ${type==='Masuk'?`<div class="field"><label>HPP per Unit (opsional)</label><input type="number" id="sm_cost" placeholder="Gunakan HPP rata-rata bila kosong"></div>`:''}
    <div class="field"><label>Keterangan</label><input type="text" id="sm_desc" placeholder="Opsional"></div>
    <label class="checkrow"><input type="checkbox" id="sm_journal"> Buat jurnal otomatis (${type==='Masuk'?'Debit Persediaan / Kredit Kas':'Debit HPP / Kredit Persediaan'})</label>
    ${type==='Masuk'?`<div class="field" id="sm_kaswrap" style="margin-top:12px;"><label>Rekening Sumber Dana</label><select id="sm_kas">${kasOpts}</select></div>`:''}
  `);
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="submitStock('${itemId}','${type}')">Simpan</button>`);
}
function submitStock(itemId,type){
  const date=document.getElementById('sm_date').value, qty=document.getElementById('sm_qty').value;
  const desc=document.getElementById('sm_desc').value, journal=document.getElementById('sm_journal').checked;
  const cost=type==='Masuk'?document.getElementById('sm_cost').value:null;
  const kasAccount=type==='Masuk'?document.getElementById('sm_kas').value:null;
  if(!date||!qty||Number(qty)<=0){toast('Isi tanggal dan qty');return;}
  const c=co(); stockMove(c,itemId,{date,type,qty,cost,desc,journal,kasAccount}); saveCompany(c.id); closeModal(); toast('Stok diperbarui'); renderAll();
}

