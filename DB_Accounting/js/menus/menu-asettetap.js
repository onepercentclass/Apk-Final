/* ---- ASET TETAP ---- */
PAGES.asettetap=function(){
  const c=co();
  const totalCost=c.fixedAssets.reduce((s,a)=>s+a.cost,0), totalDep=c.fixedAssets.reduce((s,a)=>s+a.accDep,0);
  return `
  <div class="row wrap" style="margin-bottom:4px;"><div><div class="page-title">Aset Tetap</div><div class="page-sub">Kelola aset tetap dan penyusutan ${esc(c.name)}.</div></div>
    <div class="row" style="margin-left:auto;gap:8px;"><button class="btn-dl" onclick="exportAsetTetap()">${ic('download',13)}Unduh CSV</button><button class="btn" onclick="doRunDepreciation()">${ic('refresh',14)}Jalankan Penyusutan</button><button class="btn btn-primary" onclick="openAssetModal()">${ic('plus',14)}Tambah Aset</button></div></div>
  <div class="grid g3" style="margin-bottom:16px;">
    <div class="card stat-card"><div class="stat-label">Jumlah Aset</div><div class="stat-value">${c.fixedAssets.length}</div></div>
    <div class="card stat-card"><div class="stat-label">Nilai Perolehan</div><div class="stat-value">${fmtRp(totalCost)}</div></div>
    <div class="card stat-card"><div class="stat-label">Nilai Buku</div><div class="stat-value">${fmtRp(totalCost-totalDep)}</div></div>
  </div>
  <div class="card"><div class="table-wrap">
    ${c.fixedAssets.length?`<table><thead><tr><th>Nama Aset</th><th>Kategori</th><th>Tgl Perolehan</th><th class="right">Harga Perolehan</th><th class="right">Akum. Penyusutan</th><th class="right">Nilai Buku</th><th>Aksi</th></tr></thead><tbody>
      ${c.fixedAssets.map((a,i)=>`<tr><td>${esc(a.name)}</td><td>${esc(a.category)}</td><td>${fmtDate(a.acqDate)}</td><td class="right num">${fmtRp(a.cost)}</td><td class="right num">${fmtRp(a.accDep)}</td><td class="right num">${fmtRp(a.cost-a.accDep)}</td><td><button class="btn btn-sm btn-danger" onclick="delAsset(${i})">Hapus</button></td></tr>`).join('')}
    </tbody></table>`:`<div class="empty">${ic('asset',32)}<div class="et">Belum ada aset tetap</div><div class="es">Tambahkan aset seperti kendaraan, peralatan, atau mesin.</div></div>`}
  </div></div>`;
};
function delAsset(idx){
  if(!confirm('HAPUS PERMANEN aset ini? Data tidak bisa dikembalikan!'))return;
  const c=co();
  c.fixedAssets.splice(idx,1);
  saveCompany(c.id);toast('Aset dihapus.');renderAll();
}
function exportAsetTetap(){
  const c=co();
  downloadCSV('AsetTetap',['Nama Aset','Kategori','Tgl Perolehan','Harga Perolehan','Akumulasi Penyusutan','Nilai Buku'],
    c.fixedAssets.map(a=>[a.name,a.category,fmtDate(a.acqDate),a.cost,Math.round(a.accDep),Math.round(a.cost-a.accDep)]));
}
function openAssetModal(){
  const c=co();
  const kasOpts=['1-1000','1-1010','1-1020','1-1030'].map(code=>`<option value="${code}">${esc(c.coa.find(a=>a.code===code).name)}</option>`).join('');
  openModal('Tambah Aset Tetap',`
    <div class="field"><label>Nama Aset</label><input type="text" id="as_name" placeholder="Contoh: Motor Operasional"></div>
    <div class="field-row"><div class="field"><label>Kategori</label><input type="text" id="as_cat" placeholder="Kendaraan / Peralatan / Mesin"></div>
    <div class="field"><label>Tanggal Perolehan</label><input type="date" id="as_date" value="${todayStr()}"></div></div>
    <div class="field-row"><div class="field"><label>Harga Perolehan</label><input type="number" id="as_cost" placeholder="0"></div>
    <div class="field"><label>Nilai Residu</label><input type="number" id="as_salvage" placeholder="0" value="0"></div></div>
    <div class="field-row"><div class="field"><label>Umur Ekonomis (tahun)</label><input type="number" id="as_life" placeholder="4" value="4"></div>
    <div class="field"><label>Rekening Sumber Dana</label><select id="as_kas">${kasOpts}</select></div></div>
  `);
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="submitAsset()">Simpan</button>`);
}
function submitAsset(){
  const name=document.getElementById('as_name').value.trim(); const cost=document.getElementById('as_cost').value;
  if(!name||!cost||Number(cost)<=0){toast('Lengkapi nama dan harga perolehan');return;}
  const c=co();
  addFixedAsset(c,{name,category:document.getElementById('as_cat').value||'Umum',acqDate:document.getElementById('as_date').value,cost,salvage:document.getElementById('as_salvage').value,usefulLife:document.getElementById('as_life').value,kasAccount:document.getElementById('as_kas').value});
  saveCompany(c.id); closeModal(); toast('Aset tetap ditambahkan'); renderAll();
}
function doRunDepreciation(){
  const c=co(); const {total,touched}=runDepreciation(c); saveCompany(c.id);
  toast(total>0.5? `Penyusutan tercatat: ${fmtRp(total)} (${touched.length} aset)` : 'Tidak ada aset yang perlu disusutkan bulan ini');
  renderAll();
}

