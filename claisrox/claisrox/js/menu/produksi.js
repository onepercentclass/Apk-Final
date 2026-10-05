/* ---------------- PRODUKSI ---------------- */
function renderProductionTable(){
  const start = document.getElementById('produksiStart')?.value;
  const end = document.getElementById('produksiEnd')?.value;
  const rows = DATA.productions.filter(p=>matchesRange(p.date,start,end)).sort((a,b)=>new Date(b.date)-new Date(a.date));
  const table = document.getElementById('productionTable');
  if(rows.length===0){ table.innerHTML='<tbody><tr><td class="empty">Belum ada produksi pada periode ini</td></tr></tbody>'; return; }
  table.innerHTML = `
    <thead><tr><th>Kode</th><th>Tanggal</th><th>Resep</th><th>Batch</th><th>Hasil</th><th>Total Biaya</th><th>HPP/Unit</th><th></th></tr></thead>
    <tbody>${rows.map(p=>{
      const r = recipeById(p.recipeId);
      const out = r ? productById(r.outputProductId) : null;
      return `<tr>
        <td class="cell-strong">${p.code}</td>
        <td class="cell-muted">${fmtDate(p.date)}</td>
        <td>${r?r.name:'-'}</td>
        <td>${p.batches}</td>
        <td>${p.producedQty} ${out?out.unit:''}</td>
        <td>${fmtRp(p.totalCost)}</td>
        <td>${fmtRp(p.costPerUnit)}</td>
        <td><div class="actions-cell">
          <button class="icon-action" onclick="printProductionSheet('${p.recipeId}', ${p.batches}, '${p.date}', '${p.code}')" title="Cetak Lembar Produksi">🖨</button>
          <button class="icon-action" onclick="deleteProduction('${p.id}')" title="Hapus">✕</button>
        </div></td>
      </tr>`;
    }).join('')}</tbody>`;
}
function openProductionModal(){
  if(DATA.recipes.length===0){ toast('Tambahkan resep terlebih dahulu di menu Resep & Formulasi'); return; }
  const recipeOptions = DATA.recipes.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">Buat Produksi</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <form id="productionForm">
      <div class="form-grid-2">
        <div class="form-row"><label>Resep</label><select class="input" id="prodRecipeSelect" name="recipeId" required>${recipeOptions}</select></div>
        <div class="form-row"><label>Tanggal</label><input class="input" type="date" id="prodDate" name="date" required value="${todayISO()}"></div>
      </div>
      <div class="form-row"><label>Jumlah Batch</label><input class="input" type="number" id="prodBatches" name="batches" min="1" value="1" required></div>
      <div id="prodPreview" class="card" style="background:var(--panel-2); padding:14px;"></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="button" class="btn" id="prodPrintBtn">🖨 Cetak Lembar Produksi</button>
        <button type="submit" class="btn btn-primary">Proses Produksi</button>
      </div>
    </form>`;
  document.getElementById('modalBody').classList.add('modal-wide');
  function refreshPreview(){
    const recipe = recipeById(document.getElementById('prodRecipeSelect').value);
    const batches = Math.max(1, Number(document.getElementById('prodBatches').value||1));
    if(!recipe) return;
    const c = recipeCost(recipe);
    const producedQty = c.yieldQty*batches;
    const totalCost = c.total*batches;
    const out = productById(recipe.outputProductId);
    let shortage = [];
    const materialsHTML = recipe.ingredients.map(ing=>{
      const m = materialById(ing.materialId);
      const needed = (recipe.batchSize*(ing.percent||0)/100)*batches;
      const enough = m && m.stock>=needed;
      if(!enough) shortage.push(m?m.name:'?');
      return `<div class="finance-row"><div class="finance-label">${m?m.name:'-'} (${ing.percent}%)</div><div class="finance-val" style="color:${enough?'var(--text)':'var(--red)'}">${needed.toFixed(2)} ${m?m.unit:''} ${enough?'':'(kurang, stok '+(m?m.stock:0)+')'}</div></div>`;
    }).join('');
    let packHTML = '';
    const packMaterial = recipe.packagingMaterialId ? materialById(recipe.packagingMaterialId) : null;
    if(packMaterial){
      const neededPack = (recipe.packagingQtyPerUnit||0)*producedQty;
      const enough = packMaterial.stock>=neededPack;
      if(!enough) shortage.push(packMaterial.name);
      packHTML = `<div class="finance-row"><div class="finance-label">${packMaterial.name} (kemasan)</div><div class="finance-val" style="color:${enough?'var(--text)':'var(--red)'}">${neededPack} ${packMaterial.unit} ${enough?'':'(kurang, stok '+packMaterial.stock+')'}</div></div>`;
    }
    document.getElementById('prodPreview').innerHTML = `
      <div style="font-size:12.5px; color:var(--muted); font-weight:600; margin-bottom:6px;">Kebutuhan Bahan</div>
      ${materialsHTML}${packHTML}
      <div class="finance-row"><div class="finance-label">Hasil Produksi</div><div class="finance-val">${producedQty} ${out?out.unit:''}</div></div>
      <div class="finance-row"><div class="finance-label">Total Biaya</div><div class="finance-val">${fmtRp(totalCost)}</div></div>
      <div class="finance-row"><div class="finance-label">HPP per Unit</div><div class="finance-val">${producedQty? fmtRp(totalCost/producedQty) : 'Rp0'}</div></div>
      ${shortage.length? `<div style="color:var(--red); font-size:12px; margin-top:8px;">Stok bahan tidak cukup: ${shortage.join(', ')}</div>`:''}
    `;
  }
  document.getElementById('prodRecipeSelect').addEventListener('change', refreshPreview);
  document.getElementById('prodBatches').addEventListener('input', refreshPreview);
  document.getElementById('prodPrintBtn').addEventListener('click', ()=>{
    const recipeId = document.getElementById('prodRecipeSelect').value;
    const batches = Math.max(1, Number(document.getElementById('prodBatches').value||1));
    const date = document.getElementById('prodDate').value || todayISO();
    printProductionSheet(recipeId, batches, date, null);
  });
  refreshPreview();
  document.getElementById('productionForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const recipe = recipeById(fd.get('recipeId'));
    const batches = Math.max(1, Number(fd.get('batches')));
    const date = fd.get('date');
    const c = recipeCost(recipe);
    const producedQty = c.yieldQty*batches;
    if(producedQty<=0){ toast('Isi per kemasan resep belum diatur dengan benar'); return; }
    for(const ing of recipe.ingredients){
      const m = materialById(ing.materialId);
      const needed = (recipe.batchSize*(ing.percent||0)/100)*batches;
      if(!m || m.stock < needed){ toast('Stok bahan "'+(m?m.name:'?')+'" tidak cukup'); return; }
    }
    const packMaterial = recipe.packagingMaterialId ? materialById(recipe.packagingMaterialId) : null;
    if(packMaterial){
      const neededPack = (recipe.packagingQtyPerUnit||0)*producedQty;
      if(packMaterial.stock < neededPack){ toast('Stok kemasan "'+packMaterial.name+'" tidak cukup'); return; }
    }
    recipe.ingredients.forEach(ing=>{
      const m = materialById(ing.materialId);
      m.stock -= (recipe.batchSize*(ing.percent||0)/100)*batches;
    });
    if(packMaterial){ packMaterial.stock -= (recipe.packagingQtyPerUnit||0)*producedQty; }
    const out = productById(recipe.outputProductId);
    out.stock += producedQty;
    const totalCost = c.total*batches;
    const code = 'PRD-'+new Date(date).getFullYear()+'-'+String(3000+DATA.productions.length);
    DATA.productions.push({id:uid('PRD'), code, date, recipeId:recipe.id, batches, producedQty, totalCost, costPerUnit: totalCost/producedQty});
    save(); closeModal(); renderAll(); toast('Produksi berhasil dicatat','success');
  });
  showModal();
}
function deleteProduction(id){
  if(!confirm('Hapus catatan produksi ini? Stok bahan & hasil akan dikembalikan.')) return;
  const prod = DATA.productions.find(x=>x.id===id);
  if(prod){
    const recipe = recipeById(prod.recipeId);
    if(recipe){
      recipe.ingredients.forEach(ing=>{
        const m = materialById(ing.materialId);
        if(m) m.stock += (recipe.batchSize*(ing.percent||0)/100)*prod.batches;
      });
      const packMaterial = recipe.packagingMaterialId ? materialById(recipe.packagingMaterialId) : null;
      if(packMaterial) packMaterial.stock += (recipe.packagingQtyPerUnit||0)*prod.producedQty;
      const out = productById(recipe.outputProductId);
      if(out) out.stock -= prod.producedQty;
    }
  }
  DATA.productions = DATA.productions.filter(x=>x.id!==id);
  save(); renderAll(); toast('Produksi dihapus');
}
function printProductionSheet(recipeId, batches, date, code){
  const recipe = recipeById(recipeId);
  if(!recipe){ toast('Resep tidak ditemukan'); return; }
  batches = Math.max(1, Number(batches||1));
  const out = productById(recipe.outputProductId);
  const c = recipeCost(recipe);
  const producedQty = c.yieldQty*batches;

  const ingredientRows = recipe.ingredients.map(ing=>{
    const m = materialById(ing.materialId);
    const qty = (recipe.batchSize*(ing.percent||0)/100)*batches;
    const subtotal = m ? qty*m.price : 0;
    return {name:m?m.name:'Bahan tidak ditemukan', percent:ing.percent||0, qty, unit:m?m.unit:'', price:m?m.price:0, subtotal};
  });
  const packMaterial = recipe.packagingMaterialId ? materialById(recipe.packagingMaterialId) : null;
  const packQty = packMaterial ? (recipe.packagingQtyPerUnit||0)*producedQty : 0;
  const packSubtotal = packMaterial ? packQty*packMaterial.price : 0;
  const bahanCost = ingredientRows.reduce((s,r)=>s+r.subtotal,0);
  const laborTotal = Number(recipe.laborCost||0)*batches;
  const overheadTotal = Number(recipe.overheadCost||0)*batches;
  const totalCost = bahanCost + packSubtotal + laborTotal + overheadTotal;
  const hppUnit = producedQty ? totalCost/producedQty : 0;
  const totalPercent = ingredientRows.reduce((s,r)=>s+r.percent,0);

  const rowsHTML = ingredientRows.map(r=>`
    <tr>
      <td>${r.name}</td>
      <td style="text-align:center">${r.percent}%</td>
      <td style="text-align:right">${r.qty.toFixed(2)} ${r.unit}</td>
      <td style="text-align:right">${fmtRp(r.price)}</td>
      <td style="text-align:right">${fmtRp(r.subtotal)}</td>
    </tr>`).join('');
  const packRowHTML = packMaterial ? `
    <tr>
      <td>${packMaterial.name} <span class="muted">(kemasan)</span></td>
      <td style="text-align:center">-</td>
      <td style="text-align:right">${packQty} ${packMaterial.unit}</td>
      <td style="text-align:right">${fmtRp(packMaterial.price)}</td>
      <td style="text-align:right">${fmtRp(packSubtotal)}</td>
    </tr>` : '';

  const w = window.open('', '_blank', 'width=860,height=1000');
  if(!w){ toast('Izinkan pop-up untuk mencetak'); return; }
  w.document.write(`<html><head><title>Lembar Produksi - ${recipe.name}</title>
    ${printStylesheet('production-sheet')}</head><body${PRINT_ON_LOAD}>
    <div class="head">
      <div class="logo-box"><img src="${LOGO_URL}" alt="Claisrox"></div>
      <div class="doc-title">
        <h1>LEMBAR KERJA PRODUKSI</h1>
        <div class="muted">${code ? code : 'Draf — belum diproses'}</div>
      </div>
    </div>
    <div class="meta">
      <div><span>Resep</span><b>${recipe.name}</b></div>
      <div><span>Produk Hasil</span><b>${out?out.name:'-'}</b></div>
      <div><span>Tanggal Produksi</span><b>${fmtDate(date||todayISO())}</b></div>
      <div><span>Jumlah Batch</span><b>${batches} batch (${recipe.batchSize} ${recipe.batchUnit||''} / batch)</b></div>
      <div><span>Total Volume</span><b>${(recipe.batchSize*batches).toFixed(2)} ${recipe.batchUnit||''}</b></div>
      <div><span>Target Hasil</span><b>${producedQty} ${out?out.unit:''}</b></div>
    </div>

    <h3>Komposisi Bahan Baku</h3>
    <table>
      <thead><tr><th>Nama Bahan</th><th style="text-align:center">Persentase</th><th style="text-align:right">Kebutuhan</th><th style="text-align:right">Harga/Satuan</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>${rowsHTML}${packRowHTML}</tbody>
    </table>
    <div class="pct-note ${Math.abs(totalPercent-100)<0.5 ? 'pct-ok':'pct-warn'}">Total komposisi bahan: ${totalPercent.toFixed(1)}% ${Math.abs(totalPercent-100)<0.5 ? '(sesuai)' : '(periksa kembali, seharusnya 100%)'}</div>

    <div class="totals">
      <div><span>Biaya Bahan Baku</span><span>${fmtRp(bahanCost)}</span></div>
      ${packMaterial? `<div><span>Biaya Kemasan</span><span>${fmtRp(packSubtotal)}</span></div>` : ''}
      <div><span>Biaya Tenaga Kerja</span><span>${fmtRp(laborTotal)}</span></div>
      <div><span>Biaya Overhead</span><span>${fmtRp(overheadTotal)}</span></div>
      <div class="grand"><span>Total Biaya Produksi</span><span>${fmtRp(totalCost)}</span></div>
      <div><span>HPP per Unit</span><span>${fmtRp(hppUnit)}</span></div>
    </div>

    <div class="signs">
      <div class="sign-box">Diproduksi oleh<div class="sign-line">Nama &amp; Tanda Tangan</div></div>
      <div class="sign-box">Diperiksa oleh (QC)<div class="sign-line">Nama &amp; Tanda Tangan</div></div>
      <div class="sign-box">Disetujui oleh<div class="sign-line">Nama &amp; Tanda Tangan</div></div>
    </div>
    </body></html>`);
  w.document.close();
}

function printProductionPDF(){
  const start = document.getElementById('produksiStart')?.value;
  const end = document.getElementById('produksiEnd')?.value;
  const rows = DATA.productions.filter(p=>matchesRange(p.date,start,end)).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const total = rows.reduce((s,x)=>s+x.totalCost,0);
  const body = rows.length ? `<table><thead><tr><th>Kode</th><th>Tanggal</th><th>Resep</th><th>Batch</th><th>Hasil</th><th>Total Biaya</th><th>HPP/Unit</th></tr></thead>
    <tbody>${rows.map(p=>{ const r=recipeById(p.recipeId); const out=r?productById(r.outputProductId):null; return `<tr><td>${p.code}</td><td>${fmtDate(p.date)}</td><td>${r?r.name:'-'}</td><td>${p.batches}</td><td>${p.producedQty} ${out?out.unit:''}</td><td>${fmtRp(p.totalCost)}</td><td>${fmtRp(p.costPerUnit)}</td></tr>`; }).join('')}</tbody></table>
    <div class="rp-total">Total Biaya Produksi: ${fmtRp(total)}</div>` : '<div class="rp-empty">Tidak ada data produksi pada periode ini</div>';
  openPrintReport('Laporan Produksi', periodLabelFor(start,end), body);
}
