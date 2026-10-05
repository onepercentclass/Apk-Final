/* ============================= ACCOUNTING CORE ============================= */
function acctLabel(c,code){const a=c.coa.find(x=>x.code===code);return a?a.code+' — '+a.name:code;}
function acctBalance(c,code,upto){
  let d=0,cr=0;
  c.journal.forEach(j=>{ if(upto && j.date>upto) return; j.lines.forEach(l=>{ if(l.account===code){d+=l.debit||0;cr+=l.credit||0;} }); });
  const acc=c.coa.find(a=>a.code===code);
  const normal = acc && (acc.type==='Aset'||acc.type==='Beban') ? 1 : -1;
  return normal===1 ? d-cr : cr-d;
}
function nextNo(c,key,prefix){
  c.counters[key]=(c.counters[key]||0)+1;
  const yr=new Date().getFullYear();
  return prefix+'-'+yr+'-'+String(c.counters[key]).padStart(4,'0');
}
function postJournal(c,{date,desc,source,lines,refType,refId}){
  const totalD=lines.reduce((s,l)=>s+(l.debit||0),0);
  const totalC=lines.reduce((s,l)=>s+(l.credit||0),0);
  const id=uid('jr');
  const no=nextNo(c,'journal','JU');
  c.journal.push({id,no,date,desc,source:source||'Manual',lines,refType,refId,totalD,totalC,createdAt:new Date().toISOString()});
  return id;
}
function taxAccountOf(){return {out:'2-2000',in:'1-1300'};}

function addSale(c,f){
  const amount=Number(f.amount)||0;
  const tax = f.taxable? Math.round(amount*0.11):0;
  const total=amount+tax;
  const id=uid('sl');const no=nextNo(c,'sales','INV');
  const lines=[];
  const arCash = f.method==='Tunai' ? f.kasAccount : '1-1100';
  lines.push({account:arCash,debit:total,credit:0});
  lines.push({account:'4-1000',debit:0,credit:amount});
  if(tax>0) lines.push({account:taxAccountOf().out,debit:0,credit:tax});
  const jid=postJournal(c,{date:f.date,desc:'Penjualan — '+f.desc,source:'Penjualan',lines,refType:'sale',refId:id});
  c.sales.push({id,no,date:f.date,customerId:f.customerId||null,desc:f.desc,amount,tax,total,method:f.method,kasAccount:f.kasAccount,status:f.method==='Tunai'?'Lunas':'Belum Lunas',journalId:jid});
  return id;
}
function receiveSalePayment(c,saleId,kasAccount){
  const s=c.sales.find(x=>x.id===saleId); if(!s||s.status==='Lunas') return;
  const jid=postJournal(c,{date:todayStr(),desc:'Pelunasan Piutang — '+s.no,source:'Penerimaan Piutang',
    lines:[{account:kasAccount,debit:s.total,credit:0},{account:'1-1100',debit:0,credit:s.total}],refType:'sale',refId:s.id});
  s.status='Lunas';s.paidJournalId=jid;
}
const PURCHASE_CATEGORY_MAP={
  'Persediaan Barang':'1-1200','Beban Operasional':'5-2000','Beban Gaji':'5-2100','Beban Sewa':'5-2200',
  'Beban Listrik & Air':'5-2300','Aset Tetap':'1-1500'
};
function addPurchase(c,f){
  const amount=Number(f.amount)||0;
  const tax=f.taxable?Math.round(amount*0.11):0;
  const total=amount+tax;
  const id=uid('pc');const no=nextNo(c,'purchase','PB');
  const lines=[];
  const debitAcc=PURCHASE_CATEGORY_MAP[f.category]||'5-2000';
  lines.push({account:debitAcc,debit:amount,credit:0});
  if(tax>0) lines.push({account:taxAccountOf().in,debit:tax,credit:0});
  const apCash= f.method==='Tunai'? f.kasAccount : '2-1000';
  lines.push({account:apCash,debit:0,credit:total});
  const jid=postJournal(c,{date:f.date,desc:'Pembelian — '+f.desc,source:'Pembelian',lines,refType:'purchase',refId:id});
  c.purchases.push({id,no,date:f.date,supplierId:f.supplierId||null,desc:f.desc,category:f.category,amount,tax,total,method:f.method,kasAccount:f.kasAccount,status:f.method==='Tunai'?'Lunas':'Belum Lunas',journalId:jid});
  return id;
}
function paySupplier(c,purchaseId,kasAccount){
  const p=c.purchases.find(x=>x.id===purchaseId); if(!p||p.status==='Lunas') return;
  const jid=postJournal(c,{date:todayStr(),desc:'Pembayaran Hutang — '+p.no,source:'Pembayaran Hutang',
    lines:[{account:'2-1000',debit:p.total,credit:0},{account:kasAccount,debit:0,credit:p.total}],refType:'purchase',refId:p.id});
  p.status='Lunas';p.paidJournalId=jid;
}
function addCashbank(c,f){
  const amount=Number(f.amount)||0;
  const id=uid('cb');const no=nextNo(c,'cashbank','KB');
  let lines=[];
  if(f.type==='Masuk') lines=[{account:f.account,debit:amount,credit:0},{account:f.counter,debit:0,credit:amount}];
  else if(f.type==='Keluar') lines=[{account:f.counter,debit:amount,credit:0},{account:f.account,debit:0,credit:amount}];
  else lines=[{account:f.counter,debit:amount,credit:0},{account:f.account,debit:0,credit:amount}]; // Transfer: account=asal, counter=tujuan
  const jid=postJournal(c,{date:f.date,desc:f.desc,source:'Kas & Bank ('+f.type+')',lines,refType:'cashbank',refId:id});
  c.cashbank.push({id,no,date:f.date,account:f.account,type:f.type,counter:f.counter,amount,desc:f.desc,journalId:jid});
  return id;
}
function addManualJournal(c,f){
  const jid=postJournal(c,{date:f.date,desc:f.desc,source:'Jurnal Umum',lines:f.lines,refType:'manual'});
  return jid;
}
function addContact(c,f){
  const id=uid('ct');
  c.contacts.push({id,name:f.name,type:f.type,phone:f.phone||'',email:f.email||'',address:f.address||''});
  return id;
}
function addInventoryItem(c,f){
  const id=uid('iv');
  c.inventory.push({id,sku:f.sku||('SKU'+String((c.counters.item=(c.counters.item||0)+1)).padStart(4,'0')),name:f.name,unit:f.unit||'pcs',qty:Number(f.qty)||0,avgCost:Number(f.cost)||0,minStock:Number(f.minStock)||0});
}
function stockMove(c,itemId,f){
  const item=c.inventory.find(x=>x.id===itemId); if(!item) return;
  const qty=Number(f.qty)||0;
  if(f.type==='Masuk'){
    const cost=Number(f.cost)||item.avgCost;
    const newQty=item.qty+qty;
    item.avgCost = newQty>0 ? ((item.avgCost*item.qty)+(cost*qty))/newQty : cost;
    item.qty=newQty;
  } else {
    item.qty=Math.max(0,item.qty-qty);
  }
  c.inventoryLogs.push({id:uid('il'),date:f.date,itemId,type:f.type,qty,cost:item.avgCost,desc:f.desc||''});
  if(f.journal){
    const val=Math.round((f.cost||item.avgCost)*qty);
    if(f.type==='Masuk') postJournal(c,{date:f.date,desc:'Stok Masuk — '+item.name,source:'Persediaan',lines:[{account:'1-1200',debit:val,credit:0},{account:f.kasAccount,debit:0,credit:val}]});
    else postJournal(c,{date:f.date,desc:'Stok Keluar — '+item.name,source:'Persediaan',lines:[{account:'5-1000',debit:val,credit:0},{account:'1-1200',debit:0,credit:val}]});
  }
}
function addFixedAsset(c,f){
  const id=uid('as');
  c.fixedAssets.push({id,name:f.name,category:f.category,acqDate:f.acqDate,cost:Number(f.cost)||0,usefulLife:Number(f.usefulLife)||1,salvage:Number(f.salvage)||0,accDep:0,lastDepMonth:null});
  const jid=postJournal(c,{date:f.acqDate,desc:'Perolehan Aset Tetap — '+f.name,source:'Aset Tetap',lines:[{account:'1-1500',debit:Number(f.cost)||0,credit:0},{account:f.kasAccount,debit:0,credit:Number(f.cost)||0}]});
}
function runDepreciation(c){
  const ym=new Date().toISOString().slice(0,7);
  let total=0;const touched=[];
  c.fixedAssets.forEach(a=>{
    if(a.lastDepMonth===ym) return;
    const monthly=(a.cost-a.salvage)/a.usefulLife/12;
    const remaining=a.cost-a.salvage-a.accDep;
    if(remaining<=0.5) return;
    const dep=Math.min(monthly,remaining);
    a.accDep+=dep;a.lastDepMonth=ym;total+=dep;touched.push(a.name);
  });
  if(total>0.5) postJournal(c,{date:todayStr(),desc:'Beban Penyusutan Bulan '+MONTHS_FULL[new Date().getMonth()],source:'Aset Tetap',
    lines:[{account:'5-3000',debit:Math.round(total),credit:0},{account:'1-1510',debit:0,credit:Math.round(total)}]});
  return {total,touched};
}

function periodSums(c,fromDate,toDate){
  let rev=0,exp=0;
  c.journal.forEach(j=>{
    if(fromDate&&j.date<fromDate) return; if(toDate&&j.date>toDate) return;
    j.lines.forEach(l=>{
      const a=c.coa.find(x=>x.code===l.account); if(!a) return;
      if(a.type==='Pendapatan') rev += (l.credit||0)-(l.debit||0);
      if(a.type==='Beban') exp += (l.debit||0)-(l.credit||0);
    });
  });
  return {rev,exp,profit:rev-exp};
}
function totalAset(c){
  return c.coa.filter(a=>a.type==='Aset').reduce((s,a)=>s+ (a.contra? -acctBalance(c,a.code) : acctBalance(c,a.code)) ,0);
}
function totalKewajiban(c){ return c.coa.filter(a=>a.type==='Kewajiban').reduce((s,a)=>s+acctBalance(c,a.code),0); }
function totalModal(c){
  const modalPokok=c.coa.filter(a=>a.type==='Modal').reduce((s,a)=>s+acctBalance(c,a.code),0);
  const {profit}=periodSums(c);
  return modalPokok+profit;
}
function saldoKasBank(c){
  return ['1-1000','1-1010','1-1020','1-1030'].map(code=>({code,name:c.coa.find(a=>a.code===code).name,balance:acctBalance(c,code)}));
}
function totalPiutang(c){ return c.sales.filter(s=>s.status!=='Lunas').reduce((s,x)=>s+x.total,0); }
function totalHutang(c){ return c.purchases.filter(s=>s.status!=='Lunas').reduce((s,x)=>s+x.total,0); }

