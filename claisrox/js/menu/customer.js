/* ---------------- CUSTOMER ---------------- */
function renderCustomerTable(){
  const q = (document.getElementById('customerSearch')?.value||'').toLowerCase();
  const start = document.getElementById('customerStart')?.value;
  const end = document.getElementById('customerEnd')?.value;
  const rows = DATA.customers.filter(c=> c.name.toLowerCase().includes(q) && matchesRange(c.createdAt, start, end));
  const table = document.getElementById('customerTable');
  if(rows.length===0){ table.innerHTML='<tbody><tr><td class="empty">Belum ada customer</td></tr></tbody>'; return; }
  table.innerHTML = `
    <thead><tr><th>Nama Customer</th><th>Kontak</th><th>Tipe</th><th>Tgl. Ditambahkan</th><th>Transaksi Terakhir</th><th></th></tr></thead>
    <tbody>${rows.map(c=>{
      const lastSale = DATA.sales.filter(s=>s.customerId===c.id).sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
      return `<tr>
        <td class="cell-strong">${c.name}</td>
        <td class="cell-muted">${c.contact}</td>
        <td><span class="pill pill-muted">${c.type}</span></td>
        <td class="cell-muted">${c.createdAt?fmtDate(c.createdAt):'-'}</td>
        <td class="cell-muted">${lastSale?fmtDate(lastSale.date):'-'}</td>
        <td><div class="actions-cell">
          <button class="icon-action" onclick="openCustomerModal('${c.id}')">✎</button>
          <button class="icon-action" onclick="deleteCustomer('${c.id}')">✕</button>
        </div></td>
      </tr>`;
    }).join('')}</tbody>`;
}
function openCustomerModal(id){
  const c = id ? customerById(id) : null;
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">${c?'Edit Customer':'Tambah Customer'}</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <form id="customerForm">
      <div class="form-row"><label>Nama Customer</label><input class="input" name="name" required value="${c?c.name:''}"></div>
      <div class="form-row"><label>Kontak</label><input class="input" name="contact" required value="${c?c.contact:''}"></div>
      <div class="form-row"><label>Tipe</label><select class="input" name="type"><option ${c&&c.type==='Retail'?'selected':''}>Retail</option><option ${c&&c.type==='Reseller'?'selected':''}>Reseller</option></select></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>`;
  document.getElementById('customerForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const obj = {name:fd.get('name').trim(), contact:fd.get('contact').trim(), type:fd.get('type')};
    if(c){ Object.assign(c,obj); toast('Customer diperbarui','success'); }
    else { DATA.customers.push({id:uid('CUS'), ...obj, createdAt:todayISO()}); toast('Customer ditambahkan','success'); }
    save(); closeModal(); renderAll();
  });
  showModal();
}
function deleteCustomer(id){
  if(!confirm('Hapus customer ini?')) return;
  DATA.customers = DATA.customers.filter(c=>c.id!==id);
  save(); renderAll(); toast('Customer dihapus');
}

function printCustomerPDF(){
  const start = document.getElementById('customerStart')?.value;
  const end = document.getElementById('customerEnd')?.value;
  const rows = DATA.customers.filter(c=>matchesRange(c.createdAt,start,end)).sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
  const body = rows.length ? `<table><thead><tr><th>Nama Customer</th><th>Kontak</th><th>Tipe</th><th>Tgl. Ditambahkan</th></tr></thead>
    <tbody>${rows.map(c=>`<tr><td>${c.name}</td><td>${c.contact}</td><td>${c.type}</td><td>${c.createdAt?fmtDate(c.createdAt):'-'}</td></tr>`).join('')}</tbody></table>`
    : '<div class="rp-empty">Tidak ada data customer pada periode ini</div>';
  openPrintReport('Laporan Customer', periodLabelFor(start,end), body);
}
