/* ---------------- PRODUK ---------------- */
function fillCategoryFilter(){
  const sel = document.getElementById('produkCatFilter');
  sel.innerHTML = '<option value="">Semua Kategori</option>' + CATEGORIES.map(c=>`<option value="${c}">${c}</option>`).join('');
}
function renderProdukTable(){
  const q = (document.getElementById('produkSearch')?.value||'').toLowerCase();
  const cat = document.getElementById('produkCatFilter')?.value||'';
  const rows = DATA.products.filter(p=> p.name.toLowerCase().includes(q) && (!cat || p.category===cat));
  const table = document.getElementById('produkTable');
  if(rows.length===0){ table.innerHTML='<tbody><tr><td class="empty">Tidak ada produk ditemukan</td></tr></tbody>'; return; }
  table.innerHTML = `
    <thead><tr><th>Produk</th><th>Kategori</th><th>Harga Beli</th><th>Harga Jual</th><th>Stok</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows.map(p=>{
      const st = stockStatus(p);
      return `<tr>
        <td class="row-flex"><div class="prod-thumb">🧴</div><span class="cell-strong">${p.name}</span></td>
        <td class="cell-muted">${p.category}</td>
        <td>${fmtRp(p.buyPrice)}</td>
        <td>${fmtRp(p.sellPrice)}</td>
        <td>${p.stock} ${p.unit}</td>
        <td><span class="pill ${st.cls}">${st.label}</span></td>
        <td><div class="actions-cell">
          <button class="icon-action" onclick="openProductModal('${p.id}')" title="Edit">${iconSvg('box').replace('width="24"','width="13"')}</button>
          <button class="icon-action" onclick="deleteProduct('${p.id}')" title="Hapus">✕</button>
        </div></td>
      </tr>`;
    }).join('')}</tbody>`;
}
function openProductModal(id){
  const p = id ? productById(id) : null;
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">${p?'Edit Produk':'Tambah Produk'}</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <form id="productForm">
      <div class="form-row"><label>Nama Produk</label><input class="input" name="name" required value="${p?p.name:''}"></div>
      <div class="form-row"><label>Kategori</label><select class="input" name="category" required>${CATEGORIES.map(c=>`<option ${p&&p.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
      <div class="form-grid-2">
        <div class="form-row"><label>Harga Beli</label><input class="input" type="number" name="buyPrice" required value="${p?p.buyPrice:''}"></div>
        <div class="form-row"><label>Harga Jual</label><input class="input" type="number" name="sellPrice" required value="${p?p.sellPrice:''}"></div>
      </div>
      <div class="form-grid-2">
        <div class="form-row"><label>Stok Saat Ini</label><input class="input" type="number" name="stock" required value="${p?p.stock:0}"></div>
        <div class="form-row"><label>Satuan</label><input class="input" name="unit" required value="${p?p.unit:'botol'}"></div>
      </div>
      <div class="form-row"><label>Stok Minimum (peringatan menipis)</label><input class="input" type="number" name="minStock" required value="${p?p.minStock:10}"></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>`;
  document.getElementById('productForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const obj = {
      name: fd.get('name').trim(), category: fd.get('category'),
      buyPrice: Number(fd.get('buyPrice')), sellPrice: Number(fd.get('sellPrice')),
      stock: Number(fd.get('stock')), unit: fd.get('unit').trim(), minStock: Number(fd.get('minStock')),
    };
    if(p){ Object.assign(p, obj); toast('Produk berhasil diperbarui', 'success'); }
    else { DATA.products.push({id:uid('P'), ...obj}); toast('Produk berhasil ditambahkan', 'success'); }
    save(); closeModal(); renderAll();
  });
  showModal();
}
function deleteProduct(id){
  if(!confirm('Hapus produk ini?')) return;
  DATA.products = DATA.products.filter(p=>p.id!==id);
  save(); renderAll(); toast('Produk dihapus');
}
