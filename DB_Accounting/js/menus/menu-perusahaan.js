/* ---- MULTI PERUSAHAAN ---- */
PAGES.perusahaan=function(){
  if(!S.companies.length){
    return `
    <div class="page-title">Multi Perusahaan</div><div class="page-sub">Kelola seluruh perusahaan dalam satu akun.</div>
    <div class="card card-pad"><div class="empty">
      <div class="et">Belum ada perusahaan</div>
      <div class="es">Tambahkan perusahaan pertama Anda untuk mulai mencatat transaksi dan laporan keuangan.</div>
      <div style="margin-top:14px;"><button class="btn btn-primary" onclick="openCompanyModal()">${ic('plus',14)}Buat Perusahaan Baru</button></div>
    </div></div>`;
  }
  return `
  <div class="row" style="margin-bottom:4px;"><div><div class="page-title">Multi Perusahaan</div><div class="page-sub">Kelola seluruh perusahaan dalam satu akun.</div></div>
    <button class="btn btn-primary" style="margin-left:auto;" onclick="openCompanyModal()">${ic('plus',14)}Tambah Perusahaan</button></div>
  <div class="co-grid">
    ${S.companies.map(m=>{
      const d=S.data[m.id]; const aset=totalAset(d); const {profit}=periodSums(d);
      return `<div class="card co-card ${m.id===S.activeId?'active':''}" onclick="switchCompany('${m.id}')">
        <div class="co-card-top"><div class="co-badge" style="background:${m.color};color:${m.dark?'#111':'#fff'};width:34px;height:34px;border-radius:9px;">${esc(m.initial)}</div>
        <div><div class="co-card-name">${esc(m.name)}</div><div class="co-card-ind">${esc(m.industry||'')}</div></div></div>
        <div class="co-stat-row"><span>Total Aset</span><b class="num">${fmtRp(aset)}</b></div>
        <div class="co-stat-row"><span>Laba/Rugi</span><b class="num" style="color:${profit>=0?'var(--pos)':'var(--neg)'}">${fmtRp(profit)}</b></div>
        <div class="row" style="margin-top:12px;gap:8px;" onclick="event.stopPropagation()">
          <button class="btn btn-sm grow" onclick="switchCompany('${m.id}');navigate('dashboard')">Buka</button>
          <button class="btn btn-sm" onclick="openCompanyModal('${m.id}')">${ic('edit',13)}</button>
        </div>
      </div>`;
    }).join('')}
    <div class="card add-co-card" onclick="openCompanyModal()">${ic('plus',22)}<span style="font-size:13px;font-weight:600;">Tambah Perusahaan</span></div>
  </div>`;
};
function switchCompany(id){
  if(id === S.activeId){ navigate('dashboard'); return; }
  if(!confirm('Pindah ke '+coMeta(id).name+'?\n\nAnda harus login ulang dengan akun perusahaan tersebut.')) return;
  // B8: ganti perusahaan = logout, login dengan akun perusahaan lain
  try{ localStorage.removeItem('dbacc-token'); }catch(e){}
  try{ sessionStorage.setItem('dbacc-pending-company', id); }catch(e){}
  location.reload();
}
function openCompanyModal(editId){
  const m=editId?coMeta(editId):null;
  openModal(editId?'Edit Profil Perusahaan':'Tambah Perusahaan Baru',`
    <div class="field"><label>Nama Perusahaan</label><input type="text" id="co_name" value="${m?esc(m.name):''}" placeholder="Nama bisnis"></div>
    <div class="field"><label>Industri</label><input type="text" id="co_ind" value="${m?esc(m.industry||''):''}" placeholder="Contoh: Retail, Jasa, F&B"></div>
    <div class="field-row"><div class="field"><label>NPWP</label><input type="text" id="co_npwp" value="${m&&S.data[m.id]?esc(S.data[m.id].npwp||''):''}" placeholder="Opsional"></div>
    <div class="field"><label>Warna Identitas</label><input type="text" id="co_color" value="${m?m.color:'#1EB682'}" placeholder="#1EB682"></div></div>
  `);
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="submitCompany(${editId?`'${editId}'`:'null'})">Simpan</button>`);
}
function submitCompany(editId){
  const name=document.getElementById('co_name').value.trim();
  if(!name){toast('Isi nama perusahaan');return;}
  const industry=document.getElementById('co_ind').value, npwp=document.getElementById('co_npwp').value, color=document.getElementById('co_color').value||'#1EB682';
  if(editId){
    const m=coMeta(editId); m.name=name;m.industry=industry;m.color=color;
    S.data[editId].name=name;S.data[editId].industry=industry;S.data[editId].npwp=npwp;
    saveMeta();saveCompany(editId);
  } else {
    const id=uid('co');
    const initial=name.slice(0,2).toUpperCase();
    const meta={id,name,industry,color,initial};
    S.companies.push(meta);
    S.data[id]=newCompanyData(meta); S.data[id].npwp=npwp;
    saveMeta();saveCompany(id);
    S.activeId=id;
  }
  closeModal();toast('Perusahaan tersimpan');navigate('perusahaan');
}

