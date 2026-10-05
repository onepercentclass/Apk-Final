/* ---------------- RESEP & FORMULASI ---------------- */
function renderRecipeTable(){
  const table = document.getElementById('recipeTable');
  if(DATA.recipes.length===0){ table.innerHTML='<tbody><tr><td class="empty">Belum ada resep. Tambahkan resep untuk mulai produksi.</td></tr></tbody>'; return; }
  table.innerHTML = `
    <thead><tr><th>Nama Resep</th><th>Produk Hasil</th><th>Batch</th><th>Hasil/Batch</th><th>Komposisi</th><th>Biaya/Unit</th><th></th></tr></thead>
    <tbody>${DATA.recipes.map(r=>{
      const out = productById(r.outputProductId);
      const c = recipeCost(r);
      const pctOk = Math.abs(c.totalPercent-100)<0.5;
      return `<tr>
        <td class="cell-strong">${r.name}</td>
        <td class="cell-muted">${out?out.name:'-'}</td>
        <td class="cell-muted">${r.batchSize} ${r.batchUnit||''}</td>
        <td>${c.yieldQty} ${out?out.unit:''}</td>
        <td><span class="pill ${pctOk?'pill-green':'pill-amber'}">${c.totalPercent.toFixed(1)}%</span></td>
        <td class="cell-strong">${fmtRp(c.perUnit)}</td>
        <td><div class="actions-cell">
          <button class="icon-action" onclick="openRecipeModal('${r.id}')">✎</button>
          <button class="icon-action" onclick="deleteRecipe('${r.id}')">✕</button>
        </div></td>
      </tr>`;
    }).join('')}</tbody>`;
}
function openRecipeModal(id){
  if(DATA.materials.length===0){ toast('Tambahkan bahan baku terlebih dahulu di menu Bahan Baku'); return; }
  const r = id ? recipeById(id) : null;
  const prodOptions = DATA.products.map(p=>`<option value="${p.id}" ${r&&r.outputProductId===p.id?'selected':''}>${p.name}</option>`).join('');
  const packOptions = DATA.materials.map(m=>`<option value="${m.id}" ${r&&r.packagingMaterialId===m.id?'selected':''}>${m.name}</option>`).join('');
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">${r?'Edit Resep':'Tambah Resep'}</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <form id="recipeForm">
      <div class="form-row"><label>Nama Resep</label><input class="input" name="name" required value="${r?r.name:''}"></div>
      <div class="form-row"><label>Produk Hasil</label><select class="input" name="outputProductId" required>${prodOptions}</select></div>
      <div class="form-grid-2">
        <div class="form-row"><label>Total Volume Batch</label><input class="input" type="number" step="any" name="batchSize" required value="${r?r.batchSize:20}"></div>
        <div class="form-row"><label>Satuan Batch</label><input class="input" name="batchUnit" required value="${r?r.batchUnit:'liter'}"></div>
      </div>
      <div class="form-row"><label>Isi per Kemasan (dalam satuan batch)</label><input class="input" type="number" step="any" name="fillPerUnit" required value="${r?r.fillPerUnit:1}"></div>

      <label style="display:block;font-size:12px;color:var(--muted);font-weight:600;margin:14px 0 8px;">Komposisi Bahan Baku (% dari total volume batch, bisa dikustom bebas)</label>
      <div id="recipeItems"></div>
      <button type="button" class="btn btn-sm btn-ghost" onclick="addRecipeIngredientRow()">+ Tambah Bahan</button>
      <div class="items-total"><span>Total Persentase</span><span id="recipePercentTotal">0%</span></div>

      <div class="form-grid-2" style="margin-top:14px;">
        <div class="form-row"><label>Kemasan</label><select class="input" name="packagingMaterialId">
          <option value="">- Tanpa kemasan -</option>${packOptions}
        </select></div>
        <div class="form-row"><label>Qty Kemasan / Unit</label><input class="input" type="number" step="any" name="packagingQtyPerUnit" value="${r?r.packagingQtyPerUnit:1}"></div>
      </div>
      <div class="form-grid-2">
        <div class="form-row"><label>Biaya Tenaga Kerja / Batch</label><input class="input" type="number" name="laborCost" value="${r?r.laborCost:0}"></div>
        <div class="form-row"><label>Biaya Overhead / Batch</label><input class="input" type="number" name="overheadCost" value="${r?r.overheadCost:0}"></div>
      </div>
      <div class="items-total"><span>Hasil per Batch (otomatis)</span><span id="recipeYieldPreview">0 unit</span></div>
      <div class="items-total"><span>Perkiraan Biaya per Unit</span><span id="recipeCostPreview">Rp0</span></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>`;
  document.getElementById('modalBody').classList.add('modal-wide');
  if(r && r.ingredients && r.ingredients.length){ r.ingredients.forEach(ing=> addRecipeIngredientRow(ing.materialId, ing.percent)); }
  else { addRecipeIngredientRow(); }
  ['batchSize','fillPerUnit','laborCost','overheadCost','packagingMaterialId','packagingQtyPerUnit'].forEach(n=>{
    const el = document.querySelector(`#recipeForm [name="${n}"]`);
    if(el) el.addEventListener('input', updateRecipeCostPreview);
  });
  updateRecipeCostPreview();
  document.getElementById('recipeForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const ingredients = collectRecipeIngredientRows();
    if(ingredients.length===0){ toast('Tambahkan minimal 1 bahan'); return; }
    const obj = {
      name: fd.get('name').trim(), outputProductId: fd.get('outputProductId'),
      batchSize: Number(fd.get('batchSize')), batchUnit: fd.get('batchUnit').trim(),
      fillPerUnit: Number(fd.get('fillPerUnit')),
      packagingMaterialId: fd.get('packagingMaterialId') || null,
      packagingQtyPerUnit: Number(fd.get('packagingQtyPerUnit')||0),
      laborCost: Number(fd.get('laborCost')||0), overheadCost: Number(fd.get('overheadCost')||0),
      ingredients,
    };
    if(r){ Object.assign(r,obj); toast('Resep diperbarui','success'); }
    else { DATA.recipes.push({id:uid('RCP'), ...obj}); toast('Resep ditambahkan','success'); }
    save(); closeModal(); renderAll();
  });
  showModal();
}
function addRecipeIngredientRow(presetMaterialId, presetPercent){
  const container = document.getElementById('recipeItems');
  const rowId = 'ing-'+Math.random().toString(36).slice(2,8);
  const options = DATA.materials.map(m=>`<option value="${m.id}" ${presetMaterialId===m.id?'selected':''}>${m.name}</option>`).join('');
  const div = document.createElement('div');
  div.className='item-row'; div.id=rowId;
  div.innerHTML = `
    <select class="input ing-material">${options}</select>
    <input class="input ing-percent" type="number" min="0" max="100" step="any" value="${presetPercent!=null?presetPercent:0}">
    <div class="cell-muted ing-detail" style="font-size:11px;"></div>
    <button type="button" class="remove-item" onclick="document.getElementById('${rowId}').remove(); updateRecipeCostPreview();">&times;</button>`;
  container.appendChild(div);
  div.querySelector('.ing-material').addEventListener('change', updateRecipeCostPreview);
  div.querySelector('.ing-percent').addEventListener('input', updateRecipeCostPreview);
}
function collectRecipeIngredientRows(){
  const container = document.getElementById('recipeItems');
  const rows = [...container.querySelectorAll('.item-row')];
  return rows.map(row=>({
    materialId: row.querySelector('.ing-material').value,
    percent: Math.max(0, Number(row.querySelector('.ing-percent').value||0)),
  })).filter(it=>it.materialId);
}
function updateRecipeCostPreview(){
  const form = document.getElementById('recipeForm');
  if(!form) return;
  const batchSize = Number(form.querySelector('[name="batchSize"]')?.value||0);
  const fillPerUnit = Number(form.querySelector('[name="fillPerUnit"]')?.value||0);
  const labor = Number(form.querySelector('[name="laborCost"]')?.value||0);
  const overhead = Number(form.querySelector('[name="overheadCost"]')?.value||0);
  const packagingId = form.querySelector('[name="packagingMaterialId"]')?.value;
  const packagingQtyPerUnit = Number(form.querySelector('[name="packagingQtyPerUnit"]')?.value||0);
  const yieldQty = fillPerUnit>0 ? Math.floor(batchSize/fillPerUnit) : 0;

  const rows = [...document.querySelectorAll('#recipeItems .item-row')];
  let totalPercent = 0, matCost = 0;
  rows.forEach(row=>{
    const matId = row.querySelector('.ing-material').value;
    const percent = Number(row.querySelector('.ing-percent').value||0);
    const m = materialById(matId);
    const qty = batchSize*percent/100;
    const cost = m ? qty*m.price : 0;
    totalPercent += percent; matCost += cost;
    const detail = row.querySelector('.ing-detail');
    if(detail) detail.textContent = m ? (qty.toFixed(2)+' '+m.unit+' · '+fmtRp(cost)) : '';
  });
  const packMaterial = materialById(packagingId);
  const packCost = packMaterial ? packMaterial.price*packagingQtyPerUnit*yieldQty : 0;
  const total = matCost + packCost + labor + overhead;

  const pctEl = document.getElementById('recipePercentTotal');
  if(pctEl){ pctEl.textContent = totalPercent.toFixed(1)+'%'; pctEl.style.color = Math.abs(totalPercent-100)<0.5 ? 'var(--green)' : 'var(--red)'; }
  const yieldEl = document.getElementById('recipeYieldPreview');
  if(yieldEl) yieldEl.textContent = yieldQty + ' unit';
  const costEl = document.getElementById('recipeCostPreview');
  if(costEl) costEl.textContent = yieldQty ? (fmtRp(total/yieldQty) + ' / unit') : 'Rp0 / unit';
}
function deleteRecipe(id){
  if(!confirm('Hapus resep ini?')) return;
  DATA.recipes = DATA.recipes.filter(r=>r.id!==id);
  save(); renderAll(); toast('Resep dihapus');
}
