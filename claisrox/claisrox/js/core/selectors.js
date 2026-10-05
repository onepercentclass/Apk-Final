function productById(id){ return DATA.products.find(p=>p.id===id); }
function materialById(id){ return DATA.materials.find(m=>m.id===id); }
function supplierById(id){ return DATA.suppliers.find(s=>s.id===id); }
function customerById(id){ return DATA.customers.find(c=>c.id===id); }
function recipeById(id){ return DATA.recipes.find(r=>r.id===id); }
function allSalesRecords(){ return [...DATA.sales, ...DATA.onlineOrders]; }
function stockStatus(p){
  if(p.stock<=0) return {label:'Habis', cls:'pill-red'};
  if(p.stock<=p.minStock) return {label:'Menipis', cls:'pill-amber'};
  return {label:'Aman', cls:'pill-green'};
}
function totalSales(){ return allSalesRecords().reduce((s,x)=>s+x.total,0); }
function totalPurchases(){ return DATA.purchases.reduce((s,x)=>s+x.total,0); }
function totalStockUnits(){ return DATA.products.reduce((s,p)=>s+p.stock,0); }
function cogsFor(sale){
  return sale.items.reduce((s,it)=>{ const p=productById(it.productId); return s + (p?p.buyPrice*it.qty:0); },0);
}
function grossProfit(){
  return allSalesRecords().reduce((s,sale)=> s + (sale.total - cogsFor(sale)), 0);
}
function recipeYield(recipe){
  return recipe.fillPerUnit>0 ? Math.floor(recipe.batchSize/recipe.fillPerUnit) : 0;
}
function recipeCost(recipe){
  const yieldQty = recipeYield(recipe);
  const ingredientCost = recipe.ingredients.reduce((s,ing)=>{
    const m = materialById(ing.materialId);
    const qty = recipe.batchSize * (ing.percent||0) / 100;
    return s + (m ? m.price*qty : 0);
  },0);
  const totalPercent = recipe.ingredients.reduce((s,ing)=>s+(ing.percent||0),0);
  const pkg = recipe.packagingMaterialId ? materialById(recipe.packagingMaterialId) : null;
  const packagingCost = pkg ? pkg.price * (recipe.packagingQtyPerUnit||1) * yieldQty : 0;
  const total = ingredientCost + packagingCost + Number(recipe.laborCost||0) + Number(recipe.overheadCost||0);
  const perUnit = yieldQty ? total/yieldQty : 0;
  return {ingredientCost, packagingCost, total, perUnit, yieldQty, totalPercent};
}
