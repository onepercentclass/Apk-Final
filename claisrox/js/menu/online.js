/* ---------------- TOKO ONLINE ---------------- */
function renderOnlineOrdersTable(){
  const dateFilter = document.getElementById('onlineDateFilter')?.value || '';
  const all = [...DATA.onlineOrders].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const rows = dateFilter ? all.filter(o=>o.date===dateFilter) : all;
  const table = document.getElementById('onlineOrdersTable');
  if(rows.length===0){
    table.innerHTML = `<tbody><tr><td class="empty">${dateFilter?'Tidak ada pesanan pada tanggal ini':'Belum ada pesanan online'}</td></tr></tbody>`;
    return;
  }
  const statusOptions = ['Diproses','Dikirim','Selesai'];
  table.innerHTML = `
    <thead><tr>
      <th style="width:30px;"><input type="checkbox" id="onlineSelectAll" onchange="toggleAllOnlineChecks(this.checked)"></th>
      <th>No. Resi</th><th>Tanggal</th><th>Customer</th><th>Item</th><th>Total</th><th>Status</th><th></th>
    </tr></thead>
    <tbody>${rows.map(o=>`
      <tr>
        <td><input type="checkbox" class="order-check" data-id="${o.id}"></td>
        <td class="cell-strong">${o.resi}</td>
        <td class="cell-muted">${fmtDate(o.date)}</td>
        <td>${o.customerName}<div class="cell-muted" style="font-size:11.5px;">${o.phone}</div></td>
        <td class="cell-muted">${o.items.length} produk</td>
        <td class="cell-strong">${fmtRp(o.total)}</td>
        <td><select class="input" style="padding:4px 8px; font-size:12px;" onchange="updateOrderStatus('${o.id}', this.value)">
          ${statusOptions.map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`).join('')}
        </select></td>
        <td><div class="actions-cell">
          <button class="icon-action" onclick="printResi('${o.id}')" title="Cetak Resi">🖨</button>
          <button class="icon-action" onclick="deleteOnlineOrder('${o.id}')">✕</button>
        </div></td>
      </tr>`).join('')}</tbody>`;
}
function toggleAllOnlineChecks(checked){
  document.querySelectorAll('.order-check').forEach(cb=>{ cb.checked = checked; });
}
function clearOnlineDateFilter(){
  const el = document.getElementById('onlineDateFilter');
  if(el) el.value = '';
  renderOnlineOrdersTable();
}
function printSelectedResi(){
  const checked = [...document.querySelectorAll('.order-check:checked')].map(cb=>cb.dataset.id);
  if(checked.length>0){ printBulkResi(checked); return; }
  const dateFilter = document.getElementById('onlineDateFilter')?.value;
  if(dateFilter){
    const idsForDate = DATA.onlineOrders.filter(o=>o.date===dateFilter).map(o=>o.id);
    if(idsForDate.length===0){ toast('Tidak ada resi pada tanggal ini'); return; }
    printBulkResi(idsForDate);
    return;
  }
  toast('Pilih minimal 1 pesanan, atau tentukan tanggal terlebih dahulu');
}
function updateOrderStatus(id, status){
  const o = DATA.onlineOrders.find(x=>x.id===id);
  if(o){ o.status = status; save(); renderAll(); toast('Status pesanan diperbarui','success'); }
}
function openOnlineOrderModal(){
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">Pesanan Retail Online</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <form id="onlineOrderForm">
      <div class="form-grid-2">
        <div class="form-row"><label>Nama Pembeli</label><input class="input" name="customerName" required></div>
        <div class="form-row"><label>No. HP</label><input class="input" name="phone" required></div>
      </div>
      <div class="form-row"><label>Alamat Pengiriman</label><input class="input" name="address" required></div>
      <label style="display:block;font-size:12px;color:var(--muted);font-weight:600;margin-bottom:8px;">Produk Dipesan</label>
      <div id="onlineItems"></div>
      <button type="button" class="btn btn-sm btn-ghost" onclick="addOnlineItemRow()">+ Tambah Produk</button>
      <div class="items-total"><span>Total</span><span id="onlineTotal">Rp0</span></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Buat Pesanan</button>
      </div>
    </form>`;
  document.getElementById('modalBody').classList.add('modal-wide');
  addOnlineItemRow();
  document.getElementById('onlineOrderForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const items = collectItemRows('onlineItems');
    if(items.length===0){ toast('Tambahkan minimal 1 produk'); return; }
    for(const it of items){
      const p = productById(it.productId);
      if(!p || p.stock<it.qty){ toast('Stok "'+(p?p.name:'produk')+'" tidak cukup'); return; }
    }
    const total = items.reduce((s,it)=>{ const p=productById(it.productId); return s+p.sellPrice*it.qty; },0);
    const finalItems = items.map(it=>{ const p=productById(it.productId); p.stock -= it.qty; return {productId:it.productId, qty:it.qty, price:p.sellPrice}; });
    const resi = genResi();
    const order = {id:uid('ORD'), resi, date:todayISO(), customerName:fd.get('customerName').trim(), phone:fd.get('phone').trim(), address:fd.get('address').trim(), items:finalItems, total, status:'Diproses'};
    DATA.onlineOrders.push(order);
    save(); renderAll();
    showOrderConfirmation(order);
  });
  showModal();
}
function addOnlineItemRow(){ addItemRow('onlineItems','sellPrice', updateOnlineTotal); }
function updateOnlineTotal(){
  const items = collectItemRows('onlineItems');
  const total = items.reduce((s,it)=>{ const p=productById(it.productId); return s + (p?p.sellPrice*it.qty:0); },0);
  const el = document.getElementById('onlineTotal'); if(el) el.textContent = fmtRp(total);
}
function showOrderConfirmation(order){
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">Pesanan Berhasil Dibuat</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <div style="text-align:center; padding:10px 0 20px;">
      <div style="font-size:12.5px; color:var(--muted); margin-bottom:6px;">Nomor Resi Pengiriman</div>
      <div style="font-size:28px; font-weight:700; letter-spacing:1px; color:var(--red); font-family:'Rajdhani',sans-serif;">${order.resi}</div>
      <div style="font-size:13px; color:var(--muted); margin-top:10px;">${order.customerName} · ${fmtRp(order.total)}</div>
    </div>
    <div class="modal-foot">
      <button type="button" class="btn btn-ghost" onclick="printResi('${order.id}')">Cetak Resi</button>
      <button type="button" class="btn btn-primary" onclick="closeModal()">Selesai</button>
    </div>`;
}
function deleteOnlineOrder(id){
  if(!confirm('Hapus pesanan ini? Stok akan dikembalikan.')) return;
  const o = DATA.onlineOrders.find(x=>x.id===id);
  if(o) o.items.forEach(it=>{ const p=productById(it.productId); if(p) p.stock += it.qty; });
  DATA.onlineOrders = DATA.onlineOrders.filter(x=>x.id!==id);
  save(); renderAll(); toast('Pesanan dihapus');
}
function resiLabelMarkup(o){
  const itemsHTML = o.items.map(it=>{
    const p = productById(it.productId);
    return `<tr><td>${p?p.name:'-'}</td><td style="text-align:center">${it.qty}</td></tr>`;
  }).join('');
  return `
    <div class="label">
      <div class="label-head">
        <div class="logo-box"><img src="${LOGO_URL}" alt="Claisrox"></div>
        <div class="label-head-right">
          <div class="courier-name">CLAISROX EXPRESS</div>
          <div class="muted">${fmtDate(o.date)}</div>
        </div>
      </div>
      <div class="barcode"></div>
      <div class="resi-text">${o.resi}</div>
      <div class="addr-grid">
        <div class="addr-box">
          <div class="addr-label">Dari (Pengirim)</div>
          <div class="addr-name">CLAISROX</div>
          <div class="addr-detail">Chemical Perawatan Kendaraan Motor</div>
        </div>
        <div class="addr-box">
          <div class="addr-label">Kepada (Penerima)</div>
          <div class="addr-name">${o.customerName}</div>
          <div class="addr-detail">${o.phone}</div>
          <div class="addr-detail">${o.address}</div>
        </div>
      </div>
      <div class="addr-label">Isi Paket</div>
      <table class="items-table">
        <thead><tr><th>Produk</th><th style="text-align:center">Qty</th></tr></thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      <div class="label-foot">
        <div>Status: <span class="status-chip">${o.status}</span></div>
        <div>Total: <b>${fmtRp(o.total)}</b></div>
      </div>
    </div>`;
}
function printBulkResi(ids){
  const orders = DATA.onlineOrders.filter(o=>ids.includes(o.id)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(orders.length===0){ toast('Tidak ada resi yang dipilih'); return; }
  const w = window.open('', '_blank', 'width=460,height=820');
  if(!w){ toast('Izinkan pop-up untuk mencetak resi'); return; }
  const labelsHTML = orders.map(o=>resiLabelMarkup(o)).join('');
  w.document.write(`<html><head><title>Cetak Resi (${orders.length})</title>
    ${printStylesheet('resi-label')}</head><body${PRINT_ON_LOAD}>
    ${labelsHTML}
    </body></html>`);
  w.document.close();
}
function printResi(id){
  printBulkResi([id]);
}
