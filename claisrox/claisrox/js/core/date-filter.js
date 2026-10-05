function inRange(dateStr, start, end){ return dateStr>=start && dateStr<=end; }
function matchesRange(dateStr, start, end){
  if(!dateStr) return !start && !end;
  if(start && dateStr<start) return false;
  if(end && dateStr>end) return false;
  return true;
}
function clearFilter(prefix){
  const s = document.getElementById(prefix+'Start'); const e = document.getElementById(prefix+'End');
  if(s) s.value=''; if(e) e.value='';
  const fnMap = {
    supplier:renderSupplierTable, customer:renderCustomerTable,
    penjualan:renderSalesTable, pembelian:renderPurchasesTable, produksi:renderProductionTable,
  };
  if(fnMap[prefix]) fnMap[prefix]();
}
