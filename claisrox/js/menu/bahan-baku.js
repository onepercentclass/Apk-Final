/* ---------------- BAHAN BAKU ---------------- */
function renderMaterialTable(){
  const q = (document.getElementById('materialSearch')?.value||'').toLowerCase();
  const rows = DATA.materials.filter(m=>m.name.toLowerCase().includes(q));
  const table = document.getElementById('materialTable');
  if(rows.length===0){ table.innerHTML='<tbody><tr><td class="empty">Belum ada bahan baku</td></tr></tbody>'; return; }
  table.innerHTML = `
    <thead><tr><th>Nama Bahan Baku</th><th>Harga / Satuan</th><th>Stok</th><th>Status</th><th></th></tr></thead>
    <tbody>${rows.map(m=>{
      const st = stockStatus(m);
      return `<tr>
        <td class="row-flex"><div class="prod-thumb">🧪</div><span class="cell-strong">${m.name}</span></td>
        <td>${fmtRp(m.price)} / ${m.unit}</td>
        <td>${m.stock} ${m.unit}</td>
        <td><span class="pill ${st.cls}">${st.label}</span></td>
        <td><div class="actions-cell">
          <button class="icon-action" onclick="openMaterialModal('${m.id}')" title="Edit">✎</button>
          <button class="icon-action" onclick="deleteMaterial('${m.id}')" title="Hapus">✕</button>
        </div></td>
      </tr>`;
    }).join('')}</tbody>`;
}
function openMaterialModal(id){
  const m = id ? materialById(id) : null;
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">${m?'Edit Bahan Baku':'Tambah Bahan Baku'}</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <form id="materialForm">
      <div class="form-row"><label>Nama Bahan Baku</label><input class="input" name="name" required value="${m?m.name:''}"></div>
      <div class="form-grid-2">
        <div class="form-row"><label>Harga per Satuan</label><input class="input" type="number" name="price" required value="${m?m.price:''}"></div>
        <div class="form-row"><label>Satuan</label><input class="input" name="unit" required value="${m?m.unit:'liter'}" placeholder="liter, ml, kg, pcs"></div>
      </div>
      <div class="form-grid-2">
        <div class="form-row"><label>Stok Saat Ini</label><input class="input" type="number" step="any" name="stock" required value="${m?m.stock:0}"></div>
        <div class="form-row"><label>Stok Minimum</label><input class="input" type="number" step="any" name="minStock" required value="${m?m.minStock:10}"></div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>`;
  document.getElementById('materialForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const obj = {
      name: fd.get('name').trim(), price: Number(fd.get('price')), unit: fd.get('unit').trim(),
      stock: Number(fd.get('stock')), minStock: Number(fd.get('minStock')),
    };
    if(m){ Object.assign(m, obj); toast('Bahan baku diperbarui', 'success'); }
    else { DATA.materials.push({id:uid('MAT'), ...obj}); toast('Bahan baku ditambahkan', 'success'); }
    save(); closeModal(); renderAll();
  });
  showModal();
}
function deleteMaterial(id){
  const used = DATA.recipes.some(r=> (r.ingredients||[]).some(ing=>ing.materialId===id) || r.packagingMaterialId===id);
  if(used){ toast('Bahan ini masih dipakai di resep. Perbarui resep terlebih dahulu.'); return; }
  if(!confirm('Hapus bahan baku ini?')) return;
  DATA.materials = DATA.materials.filter(m=>m.id!==id);
  save(); renderAll(); toast('Bahan baku dihapus');
}
