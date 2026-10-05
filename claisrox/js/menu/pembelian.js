function renderPurchasesTable(){
  const start = document.getElementById('pembelianStart')?.value;
  const end = document.getElementById('pembelianEnd')?.value;
  const rows = DATA.purchases.filter(p=>matchesRange(p.date,start,end)).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const table = document.getElementById('purchasesTable');
  if(rows.length===0){ table.innerHTML='<tbody><tr><td class="empty">Belum ada transaksi pembelian pada periode ini</td></tr></tbody>'; return; }
  table.innerHTML = `
    <thead><tr><th>Kode</th><th>Tanggal</th><th>Supplier</th><th>Item</th><th>Total</th><th></th></tr></thead>
    <tbody>${rows.map(p=>{
      const sup = supplierById(p.supplierId);
      return `<tr>
        <td class="cell-strong">${p.code}</td>
        <td class="cell-muted">${fmtDate(p.date)}</td>
        <td>${sup?sup.name:'-'}</td>
        <td class="cell-muted">${p.items.length} bahan</td>
        <td class="cell-strong">${fmtRp(p.total)}</td>
        <td><div class="actions-cell"><button class="icon-action" onclick="deletePurchase('${p.id}')">✕</button></div></td>
      </tr>`;
    }).join('')}</tbody>`;
}
function openPurchaseModal(){
  if(DATA.materials.length===0){ toast('Tambahkan bahan baku terlebih dahulu di menu Bahan Baku'); return; }
  const supOptions = DATA.suppliers.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">Transaksi Pembelian</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <form id="purchaseForm">
      <div class="form-grid-2">
        <div class="form-row"><label>Supplier</label><select class="input" name="supplierId" required>${supOptions}</select></div>
        <div class="form-row"><label>Tanggal</label><input class="input" type="date" name="date" required value="${todayISO()}"></div>
      </div>
      <label style="display:block;font-size:12px;color:var(--muted);font-weight:600;margin-bottom:8px;">Bahan Baku Dibeli</label>
      <div id="purchaseItems"></div>
      <button type="button" class="btn btn-sm btn-ghost" onclick="addPurchaseItemRow()">+ Tambah Bahan</button>
      <div class="items-total"><span>Total</span><span id="purchaseTotal">Rp0</span></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan Transaksi</button>
      </div>
    </form>`;
  document.getElementById('modalBody').classList.add('modal-wide');
  addPurchaseItemRow();
  document.getElementById('purchaseForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const supplierId = fd.get('supplierId'); const date = fd.get('date');
    const items = collectMaterialRows('purchaseItems');
    if(items.length===0){ toast('Tambahkan minimal 1 bahan'); return; }
    const total = items.reduce((s,it)=>{ const m=materialById(it.materialId); return s+(m?m.price*it.qty:0); },0);
    const finalItems = items.map(it=>{ const m=materialById(it.materialId); m.stock += it.qty; return {materialId:it.materialId, qty:it.qty, price:m.price}; });
    const code = 'PB-'+new Date(date).getFullYear()+'-'+String(2000+DATA.purchases.length);
    DATA.purchases.push({id:uid('PB'), code, date, supplierId, items:finalItems, total});
    save(); closeModal(); renderAll(); toast('Transaksi pembelian tersimpan','success');
  });
  showModal();
}
function addPurchaseItemRow(){ addMaterialItemRow('purchaseItems', updatePurchaseTotal); }
function updatePurchaseTotal(){
  const items = collectMaterialRows('purchaseItems');
  const total = items.reduce((s,it)=>{ const m=materialById(it.materialId); return s + (m?m.price*it.qty:0); },0);
  const el = document.getElementById('purchaseTotal'); if(el) el.textContent = fmtRp(total);
}
function deletePurchase(id){
  if(!confirm('Hapus transaksi ini? Stok bahan akan dikurangi kembali.')) return;
  const p = DATA.purchases.find(x=>x.id===id);
  if(p) p.items.forEach(it=>{ const m=materialById(it.materialId); if(m) m.stock -= it.qty; });
  DATA.purchases = DATA.purchases.filter(x=>x.id!==id);
  save(); renderAll(); toast('Transaksi pembelian dihapus');
}

function printPurchasesPDF(){
  const start = document.getElementById('pembelianStart')?.value;
  const end = document.getElementById('pembelianEnd')?.value;
  const rows = DATA.purchases.filter(p=>matchesRange(p.date,start,end)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const total = rows.reduce((s,x)=>s+x.total,0);
  const body = rows.length ? `<table><thead><tr><th>Kode</th><th>Tanggal</th><th>Supplier</th><th>Item</th><th>Total</th></tr></thead>
    <tbody>${rows.map(p=>{ const s=supplierById(p.supplierId); return `<tr><td>${p.code}</td><td>${fmtDate(p.date)}</td><td>${s?s.name:'-'}</td><td>${p.items.length} bahan</td><td>${fmtRp(p.total)}</td></tr>`; }).join('')}</tbody></table>
    <div class="rp-total">Total Pembelian: ${fmtRp(total)}</div>` : '<div class="rp-empty">Tidak ada transaksi pembelian pada periode ini</div>';
  openPrintReport('Laporan Pembelian', periodLabelFor(start,end), body);
}
