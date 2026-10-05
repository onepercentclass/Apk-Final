function renderAll(){
  renderStatCards();
  renderTrendChart();
  renderCategoryChart();
  renderTopProducts();
  renderFinanceSummary();
  renderActivity();
  renderStockInfo();
  renderProfitChart();
  fillCategoryFilter();
  renderProdukTable();
  renderMaterialTable();
  renderSupplierTable();
  renderCustomerTable();
  renderSalesTable();
  renderPurchasesTable();
  renderRecipeTable();
  renderProductionTable();
  renderOnlineOrdersTable();
  renderLaporan();
}

async function bootstrap(){
  try{
    await Access.init();
    if(APP_CONFIG.api.enabled) await pullRemoteData();
  }catch(e){
    console.error(e);
    toast('Gagal memuat sesi dari server');
    return;
  }
  renderNav();
  goTo(Access.firstAllowed());
}
bootstrap();
