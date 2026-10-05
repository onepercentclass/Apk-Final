/* ---------------- PENJUALAN ---------------- */
function renderSalesTable(){
  const start = document.getElementById('penjualanStart')?.value;
  const end = document.getElementById('penjualanEnd')?.value;
  const rows = DATA.sales.filter(s=>matchesRange(s.date,start,end)).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const table = document.getElementById('salesTable');
  if(rows.length===0){ table.innerHTML='<tbody><tr><td class="empty">Belum ada transaksi penjualan pada periode ini</td></tr></tbody>'; return; }
  table.innerHTML = `
    <thead><tr><th>Kode</th><th>Tanggal</th><th>Customer</th><th>Item</th><th>Total</th><th></th></tr></thead>
    <tbody>${rows.map(s=>{
      const cus = customerById(s.customerId);
      return `<tr>
        <td class="cell-strong">${s.code}</td>
        <td class="cell-muted">${fmtDate(s.date)}</td>
        <td>${cus?cus.name:'-'}</td>
        <td class="cell-muted">${s.items.length} produk</td>
        <td class="cell-strong">${fmtRp(s.total)}</td>
        <td><div class="actions-cell"><button class="icon-action" onclick="deleteSale('${s.id}')">✕</button></div></td>
      </tr>`;
    }).join('')}</tbody>`;
}
function openSaleModal(){
  const custOptions = DATA.customers.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">Transaksi Penjualan</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <form id="saleForm">
      <div class="form-grid-2">
        <div class="form-row"><label>Customer</label><select class="input" name="customerId" required>${custOptions}</select></div>
        <div class="form-row"><label>Tanggal</label><input class="input" type="date" name="date" required value="${todayISO()}"></div>
      </div>
      <label style="display:block;font-size:12px;color:var(--muted);font-weight:600;margin-bottom:8px;">Item Penjualan</label>
      <div id="saleItems"></div>
      <button type="button" class="btn btn-sm btn-ghost" onclick="addSaleItemRow()">+ Tambah Item</button>
      <div class="items-total"><span>Total</span><span id="saleTotal">Rp0</span></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan Transaksi</button>
      </div>
    </form>` .replace('</form>','</form>');
  document.getElementById('modalBody').classList.add('modal-wide');
  addSaleItemRow();
  document.getElementById('saleForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const customerId = fd.get('customerId'); const date = fd.get('date');
    const items = collectItemRows('saleItems');
    if(items.length===0){ toast('Tambahkan minimal 1 item'); return; }
    for(const it of items){
      const p = productById(it.productId);
      if(!p || p.stock < it.qty){ toast('Stok "'+(p?p.name:'produk')+'" tidak cukup'); return; }
    }
    const total = items.reduce((s,it)=>{ const p=productById(it.productId); return s+p.sellPrice*it.qty; },0);
    const finalItems = items.map(it=>{ const p=productById(it.productId); p.stock -= it.qty; return {productId:it.productId, qty:it.qty, price:p.sellPrice}; });
    const code = 'SJ-'+new Date(date).getFullYear()+'-'+String(1000+DATA.sales.length);
    DATA.sales.push({id:uid('SJ'), code, date, customerId, items:finalItems, total});
    save(); closeModal(); renderAll(); toast('Transaksi penjualan tersimpan','success');
  });
  showModal();
}
function addSaleItemRow(){ addItemRow('saleItems', 'sellPrice', updateSaleTotal); }
function updateSaleTotal(){
  const items = collectItemRows('saleItems');
  const total = items.reduce((s,it)=>{ const p=productById(it.productId); return s + (p?p.sellPrice*it.qty:0); },0);
  const el = document.getElementById('saleTotal'); if(el) el.textContent = fmtRp(total);
}
function deleteSale(id){
  if(!confirm('Hapus transaksi ini? Stok akan dikembalikan.')) return;
  const s = DATA.sales.find(x=>x.id===id);
  if(s) s.items.forEach(it=>{ const p=productById(it.productId); if(p) p.stock += it.qty; });
  DATA.sales = DATA.sales.filter(x=>x.id!==id);
  save(); renderAll(); toast('Transaksi penjualan dihapus');
}
function printSalesPDF(){
  const start = document.getElementById('penjualanStart')?.value;
  const end = document.getElementById('penjualanEnd')?.value;
  const rows = DATA.sales.filter(s=>matchesRange(s.date,start,end)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const total = rows.reduce((s,x)=>s+x.total,0);
  const body = rows.length ? `<table><thead><tr><th>Kode</th><th>Tanggal</th><th>Customer</th><th>Item</th><th>Total</th></tr></thead>
    <tbody>${rows.map(s=>{ const c=customerById(s.customerId); return `<tr><td>${s.code}</td><td>${fmtDate(s.date)}</td><td>${c?c.name:'-'}</td><td>${s.items.length} produk</td><td>${fmtRp(s.total)}</td></tr>`; }).join('')}</tbody></table>
    <div class="rp-total">Total Penjualan: ${fmtRp(total)}</div>` : '<div class="rp-empty">Tidak ada transaksi penjualan pada periode ini</div>';
  openPrintReport('Laporan Penjualan', periodLabelFor(start,end), body);
}
