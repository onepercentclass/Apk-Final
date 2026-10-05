function addMaterialItemRow(containerId, onChangeCb, presetMaterialId, presetQty){
  const container = document.getElementById(containerId);
  const rowId = 'row-'+Math.random().toString(36).slice(2,8);
  const options = DATA.materials.map(m=>`<option value="${m.id}" ${presetMaterialId===m.id?'selected':''}>${m.name}</option>`).join('');
  const div = document.createElement('div');
  div.className='item-row'; div.id=rowId;
  div.innerHTML = `
    <select class="input mat-select">${options}</select>
    <input class="input mat-qty" type="number" min="0.01" step="any" value="${presetQty||1}">
    <div class="cell-muted mat-price-display" style="font-size:12.5px;"></div>
    <button type="button" class="remove-item" onclick="document.getElementById('${rowId}').remove(); ${onChangeCb.name}()">&times;</button>`;
  container.appendChild(div);
  const sel = div.querySelector('.mat-select');
  const qty = div.querySelector('.mat-qty');
  const priceDisplay = div.querySelector('.mat-price-display');
  function refreshPrice(){
    const m = materialById(sel.value);
    priceDisplay.textContent = m ? fmtRp(m.price) : '';
    onChangeCb();
  }
  sel.addEventListener('change', refreshPrice);
  qty.addEventListener('input', onChangeCb);
  refreshPrice();
}
function collectMaterialRows(containerId){
  const container = document.getElementById(containerId);
  const rows = [...container.querySelectorAll('.item-row')];
  return rows.map(r=>({
    materialId: r.querySelector('.mat-select').value,
    qty: Math.max(0.01, Number(r.querySelector('.mat-qty').value||1)),
  })).filter(it=>it.materialId);
}
function addItemRow(containerId, priceField, onChangeCb, presetProductId, presetQty){
  const container = document.getElementById(containerId);
  const rowId = 'row-'+Math.random().toString(36).slice(2,8);
  const options = DATA.products.map(p=>`<option value="${p.id}" ${presetProductId===p.id?'selected':''}>${p.name}</option>`).join('');
  const div = document.createElement('div');
  div.className='item-row'; div.id=rowId;
  const removeFn = {saleItems:'updateSaleTotal', onlineItems:'updateOnlineTotal'}[containerId] || '';
  div.innerHTML = `
    <select class="input item-product">${options}</select>
    <input class="input item-qty" type="number" min="0.01" step="any" value="${presetQty||1}">
    <div class="cell-muted item-price-display" style="font-size:12.5px;"></div>
    <button type="button" class="remove-item" onclick="document.getElementById('${rowId}').remove(); ${removeFn}()">&times;</button>`;
  container.appendChild(div);
  const sel = div.querySelector('.item-product');
  const qty = div.querySelector('.item-qty');
  const priceDisplay = div.querySelector('.item-price-display');
  function refreshPrice(){
    const p = productById(sel.value);
    priceDisplay.textContent = p ? fmtRp(p[priceField]) : '';
    onChangeCb();
  }
  sel.addEventListener('change', refreshPrice);
  qty.addEventListener('input', onChangeCb);
  refreshPrice();
}
function collectItemRows(containerId){
  const container = document.getElementById(containerId);
  const rows = [...container.querySelectorAll('.item-row')];
  return rows.map(r=>({
    productId: r.querySelector('.item-product').value,
    qty: Math.max(0.01, Number(r.querySelector('.item-qty').value||1)),
  })).filter(it=>it.productId);
}
