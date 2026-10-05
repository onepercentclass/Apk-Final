/* ---- KONTAK ---- */
PAGES.kontak=function(){
  const c=co();
  const tab=S.routeParam||'Pelanggan';
  const rows=c.contacts.filter(x=>x.type===tab);
  function outstanding(ct){
    if(ct.type==='Pelanggan') return c.sales.filter(s=>s.customerId===ct.id&&s.status!=='Lunas').reduce((s,x)=>s+x.total,0);
    return c.purchases.filter(p=>p.supplierId===ct.id&&p.status!=='Lunas').reduce((s,x)=>s+x.total,0);
  }
  return `
  <div class="row wrap" style="margin-bottom:4px;"><div><div class="page-title">Pelanggan & Supplier</div><div class="page-sub">Daftar kontak bisnis ${esc(c.name)}.</div></div>
    <div class="row" style="margin-left:auto;gap:8px;"><button class="btn-dl" onclick="exportKontak('${tab}')">${ic('download',13)}Unduh CSV</button><button class="btn btn-primary" onclick="openContactModal('${tab}')">${ic('plus',14)}Tambah ${tab}</button></div></div>
  <div class="tabs">
    <div class="tab ${tab==='Pelanggan'?'active':''}" onclick="navigate('kontak','Pelanggan')">Pelanggan</div>
    <div class="tab ${tab==='Supplier'?'active':''}" onclick="navigate('kontak','Supplier')">Supplier</div>
  </div>
  <div class="card"><div class="table-wrap">
    ${rows.length?`<table><thead><tr><th>Nama</th><th>Telepon</th><th>Email</th><th>Alamat</th><th class="right">${tab==='Pelanggan'?'Piutang':'Hutang'} Belum Lunas</th></tr></thead><tbody>
      ${rows.map(ct=>`<tr><td>${esc(ct.name)}</td><td>${esc(ct.phone||'-')}</td><td>${esc(ct.email||'-')}</td><td>${esc(ct.address||'-')}</td><td class="right num">${fmtRp(outstanding(ct))}</td></tr>`).join('')}
    </tbody></table>`:`<div class="empty">${ic('people',32)}<div class="et">Belum ada ${tab.toLowerCase()}</div><div class="es">Tambahkan kontak untuk mempermudah pencatatan transaksi.</div></div>`}
  </div></div>`;
};
function exportKontak(tab){
  const c=co();
  const rows=c.contacts.filter(x=>x.type===tab);
  function outstanding(ct){
    if(ct.type==='Pelanggan') return c.sales.filter(s=>s.customerId===ct.id&&s.status!=='Lunas').reduce((s,x)=>s+x.total,0);
    return c.purchases.filter(p=>p.supplierId===ct.id&&p.status!=='Lunas').reduce((s,x)=>s+x.total,0);
  }
  downloadCSV(tab,['Nama','Telepon','Email','Alamat',(tab==='Pelanggan'?'Piutang':'Hutang')+' Belum Lunas'],
    rows.map(ct=>[ct.name,ct.phone||'',ct.email||'',ct.address||'',outstanding(ct)]));
}
function openContactModal(type){
  openModal('Tambah '+type,`
    <div class="field"><label>Nama</label><input type="text" id="ct_name" placeholder="Nama ${type.toLowerCase()}"></div>
    <div class="field"><label>Tipe</label><select id="ct_type"><option value="Pelanggan" ${type==='Pelanggan'?'selected':''}>Pelanggan</option><option value="Supplier" ${type==='Supplier'?'selected':''}>Supplier</option></select></div>
    <div class="field-row"><div class="field"><label>Telepon</label><input type="text" id="ct_phone"></div><div class="field"><label>Email</label><input type="text" id="ct_email"></div></div>
    <div class="field"><label>Alamat</label><input type="text" id="ct_addr"></div>
  `);
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="submitContact()">Simpan</button>`);
}
function submitContact(){
  const name=document.getElementById('ct_name').value.trim();
  if(!name){toast('Isi nama kontak');return;}
  const type=document.getElementById('ct_type').value;
  const c=co(); addContact(c,{name,type,phone:document.getElementById('ct_phone').value,email:document.getElementById('ct_email').value,address:document.getElementById('ct_addr').value});
  saveCompany(c.id); closeModal(); toast(type+' ditambahkan'); navigate('kontak',type);
}

