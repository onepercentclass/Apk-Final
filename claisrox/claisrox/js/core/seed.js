function seedData(){
  const products = [
    {id:uid('P'), name:'Semir Ban Gloss 500ml', category:'Perawatan Body & Cat', buyPrice:9000, sellPrice:18000, stock:120, minStock:20, unit:'botol'},
    {id:uid('P'), name:'Poles Body Motor Wax', category:'Perawatan Body & Cat', buyPrice:14000, sellPrice:27000, stock:64, minStock:15, unit:'botol'},
    {id:uid('P'), name:'Chain Cleaner Rantai 300ml', category:'Pembersih & Degreaser', buyPrice:11000, sellPrice:22000, stock:8, minStock:15, unit:'botol'},
    {id:uid('P'), name:'Engine Degreaser 500ml', category:'Perawatan Mesin', buyPrice:13000, sellPrice:26000, stock:45, minStock:15, unit:'botol'},
    {id:uid('P'), name:'Shampoo Motor Foam 1L', category:'Perawatan Body & Cat', buyPrice:16000, sellPrice:32000, stock:0, minStock:10, unit:'botol'},
    {id:uid('P'), name:'Pengkilap Helm & Visor', category:'Perawatan Interior & Helm', buyPrice:8000, sellPrice:17000, stock:52, minStock:12, unit:'botol'},
    {id:uid('P'), name:'Oli Rantai Chain Lube', category:'Perawatan Mesin', buyPrice:12000, sellPrice:24000, stock:30, minStock:10, unit:'botol'},
  ];
  const materials = [
    {id:uid('M'), name:'Bahan Aktif Foam Concentrate', unit:'liter', price:45000, stock:40, minStock:10},
    {id:uid('M'), name:'Bahan Aktif Silicone Gloss', unit:'liter', price:38000, stock:25, minStock:8},
    {id:uid('M'), name:'Parfum Konsentrat', unit:'ml', price:350, stock:5000, minStock:1000},
    {id:uid('M'), name:'Air Demineral (pelarut)', unit:'liter', price:1500, stock:200, minStock:40},
    {id:uid('M'), name:'Botol Sprayer Kosong 500ml', unit:'pcs', price:2000, stock:300, minStock:50},
    {id:uid('M'), name:'Botol Kosong 1 Liter', unit:'pcs', price:2800, stock:150, minStock:30},
  ];
  const daysAgo = (n)=> new Date(Date.now()-n*86400000).toISOString().slice(0,10);
  const suppliers = [
    {id:uid('SUP'), name:'CV Kimia Nusantara', contact:'0812-3456-7801', product:'Bahan kimia dasar', status:'Aktif', createdAt:daysAgo(120)},
    {id:uid('SUP'), name:'PT Kemasan Jaya', contact:'0813-2211-9090', product:'Botol & kemasan', status:'Aktif', createdAt:daysAgo(95)},
    {id:uid('SUP'), name:'UD Wangi Aroma', contact:'0857-1122-3344', product:'Parfum & fragrance', status:'Aktif', createdAt:daysAgo(40)},
  ];
  const customers = [
    {id:uid('CUS'), name:'Bengkel Jaya Motor', contact:'0821-9988-1122', type:'Reseller', createdAt:daysAgo(110)},
    {id:uid('CUS'), name:'Toko Sinar Abadi', contact:'0856-4433-2211', type:'Retail', createdAt:daysAgo(70)},
    {id:uid('CUS'), name:'Auto Care Point', contact:'0878-5566-7788', type:'Reseller', createdAt:daysAgo(20)},
  ];
  const sales = []; const purchases = [];
  const now = new Date();
  for(let i=6;i>=0;i--){
    const d = new Date(now); d.setDate(now.getDate()-i);
    const iso = d.toISOString().slice(0,10);
    const p1 = products[i % products.length];
    const qty1 = 3 + (i*2)%9;
    sales.push({id:uid('SJ'), code:'SJ-'+d.getFullYear()+'-'+String(1000+i), date:iso, customerId:customers[i%customers.length].id,
      items:[{productId:p1.id, qty:qty1, price:p1.sellPrice}], total: qty1*p1.sellPrice});
    const m2 = materials[(i+2) % materials.length];
    const qty2 = 5 + (i*3)%12;
    purchases.push({id:uid('PB'), code:'PB-'+d.getFullYear()+'-'+String(2000+i), date:iso, supplierId:suppliers[i%suppliers.length].id,
      items:[{materialId:m2.id, qty:qty2, price:m2.price}], total: qty2*m2.price});
  }
  const shampoo = products.find(p=>p.name.startsWith('Shampoo Motor Foam'));
  const semirBan = products.find(p=>p.name.startsWith('Semir Ban'));
  const bahanAktifFoam = materials.find(m=>m.name==='Bahan Aktif Foam Concentrate');
  const bahanAktifGloss = materials.find(m=>m.name==='Bahan Aktif Silicone Gloss');
  const parfum = materials.find(m=>m.name==='Parfum Konsentrat');
  const air = materials.find(m=>m.name.startsWith('Air Demineral'));
  const botolSprayer = materials.find(m=>m.name==='Botol Sprayer Kosong 500ml');
  const botol1L = materials.find(m=>m.name==='Botol Kosong 1 Liter');
  const recipes = [
    {id:uid('RCP'), name:'Formula Shampoo Motor Foam 1L', outputProductId:shampoo.id, batchSize:20, batchUnit:'liter', fillPerUnit:1,
      packagingMaterialId:botol1L.id, packagingQtyPerUnit:1, laborCost:150000, overheadCost:50000,
      ingredients:[{materialId:bahanAktifFoam.id, percent:35},{materialId:parfum.id, percent:2},{materialId:air.id, percent:63}]},
    {id:uid('RCP'), name:'Formula Semir Ban Gloss 500ml', outputProductId:semirBan.id, batchSize:20, batchUnit:'liter', fillPerUnit:0.5,
      packagingMaterialId:botolSprayer.id, packagingQtyPerUnit:1, laborCost:100000, overheadCost:30000,
      ingredients:[{materialId:bahanAktifGloss.id, percent:40},{materialId:parfum.id, percent:1.5},{materialId:air.id, percent:58.5}]},
  ];
  const productions = [];
  const onlineOrders = [
    {id:uid('ORD'), resi:genResi(), date: sales[1].date, customerName:'Rina Kusuma', phone:'0812-1111-2222', address:'Jl. Merdeka No. 12, Kediri',
      items:[{productId:products[0].id, qty:2, price:products[0].sellPrice}], total: products[0].sellPrice*2, status:'Dikirim'},
    {id:uid('ORD'), resi:genResi(), date: todayISO(), customerName:'Dedi Setiawan', phone:'0813-3333-4444', address:'Jl. Diponegoro No. 5, Malang',
      items:[{productId:products[1].id, qty:1, price:products[1].sellPrice}], total: products[1].sellPrice*1, status:'Diproses'},
  ];
  return {products, materials, suppliers, customers, sales, purchases, recipes, productions, onlineOrders, finance:{modal:30000000, piutang:0, hutang:0}};
}
