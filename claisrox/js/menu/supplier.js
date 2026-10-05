/* ---------------- SUPPLIER ---------------- */
function renderSupplierTable(){
  const q = (document.getElementById('supplierSearch')?.value||'').toLowerCase();
  const start = document.getElementById('supplierStart')?.value;
  const end = document.getElementById('supplierEnd')?.value;
  const rows = DATA.suppliers.filter(s=> s.name.toLowerCase().includes(q) && matchesRange(s.createdAt, start, end));
  const table = document.getElementById('supplierTable');
  if(rows.length===0){ table.innerHTML='<tbody><tr><td class="empty">Belum ada supplier</td></tr></tbody>'; return; }
  table.innerHTML = `
    <thead><tr><th>Nama Supplier</th><th>Kontak</th><th>Produk / Bahan</th><th>Status</th><th>Tgl. Ditambahkan</th><th></th></tr></thead>
    <tbody>${rows.map(s=>`
      <tr>
        <td class="cell-strong">${s.name}</td>
        <td class="cell-muted">${s.contact}</td>
        <td class="cell-muted">${s.product}</td>
        <td><span class="pill pill-green">${s.status}</span></td>
        <td class="cell-muted">${s.createdAt?fmtDate(s.createdAt):'-'}</td>
        <td><div class="actions-cell">
          <button class="icon-action" onclick="openSupplierModal('${s.id}')">✎</button>
          <button class="icon-action" onclick="deleteSupplier('${s.id}')">✕</button>
        </div></td>
      </tr>`).join('')}</tbody>`;
}
function openSupplierModal(id){
  const s = id ? supplierById(id) : null;
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">${s?'Edit Supplier':'Tambah Supplier'}</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <form id="supplierForm">
      <div class="form-row"><label>Nama Supplier</label><input class="input" name="name" required value="${s?s.name:''}"></div>
      <div class="form-row"><label>Kontak</label><input class="input" name="contact" required value="${s?s.contact:''}"></div>
      <div class="form-row"><label>Produk / Bahan yang Dipasok</label><input class="input" name="product" required value="${s?s.product:''}"></div>
      <div class="form-row"><label>Status</label><select class="input" name="status"><option ${s&&s.status==='Aktif'?'selected':''}>Aktif</option><option ${s&&s.status==='Nonaktif'?'selected':''}>Nonaktif</option></select></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>`;
  document.getElementById('supplierForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const obj = {name:fd.get('name').trim(), contact:fd.get('contact').trim(), product:fd.get('product').trim(), status:fd.get('status')};
    if(s){ Object.assign(s,obj); toast('Supplier diperbarui','success'); }
    else { DATA.suppliers.push({id:uid('SUP'), ...obj, createdAt:todayISO()}); toast('Supplier ditambahkan','success'); }
    save(); closeModal(); renderAll();
  });
  showModal();
}
function deleteSupplier(id){
  if(!confirm('Hapus supplier ini?')) return;
  DATA.suppliers = DATA.suppliers.filter(s=>s.id!==id);
  save(); renderAll(); toast('Supplier dihapus');
}

function printSupplierPDF(){
  const start = document.getElementById('supplierStart')?.value;
  const end = document.getElementById('supplierEnd')?.value;
  const rows = DATA.suppliers.filter(s=>matchesRange(s.createdAt,start,end)).sort((a,b)=>new Date(a.createdAt||0)-new Date(b.createdAt||0));
  const body = rows.length ? `<table><thead><tr><th>Nama Supplier</th><th>Kontak</th><th>Produk/Bahan</th><th>Status</th><th>Tgl. Ditambahkan</th></tr></thead>
    <tbody>${rows.map(s=>`<tr><td>${s.name}</td><td>${s.contact}</td><td>${s.product}</td><td>${s.status}</td><td>${s.createdAt?fmtDate(s.createdAt):'-'}</td></tr>`).join('')}</tbody></table>`
    : '<div class="rp-empty">Tidak ada data supplier pada periode ini</div>';
  openPrintReport('Laporan Supplier', periodLabelFor(start,end), body);
}
