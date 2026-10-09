/* ---- PENGATURAN ---- */
PAGES.pengaturan=function(){
  const c=co();
  const tab=S.routeParam||'profil';
  const tabs=[['profil','Profil Perusahaan'],['coa','Chart of Accounts'],['preferensi','Preferensi']];
  let body='';
  if(tab==='profil'){
    body=`<div class="card card-pad" style="max-width:520px;">
      <div class="field"><label>Nama Perusahaan</label><input type="text" id="st_name" value="${esc(c.name)}"></div>
      <div class="field"><label>Industri</label><input type="text" id="st_ind" value="${esc(c.industry||'')}"></div>
      <div class="field"><label>NPWP</label><input type="text" id="st_npwp" value="${esc(c.npwp||'')}"></div>
      <div class="field"><label>Awal Tahun Buku</label><select id="st_fy">${MONTHS_FULL.map((m,i)=>`<option value="${i+1}" ${c.fiscalStart===i+1?'selected':''}>${m}</option>`).join('')}</select></div>
      <div class="field"><label>Mata Uang</label><input type="text" id="st_cur" value="${esc(c.currency)}"></div>
      <button class="btn btn-primary" onclick="saveProfile()">Simpan Perubahan</button>
    </div>`;
  } else if(tab==='coa'){
    body=`<div class="row" style="margin-bottom:14px;"><button class="btn btn-primary" style="margin-left:auto;" onclick="openAcctModal()">${ic('plus',14)}Tambah Akun</button></div>
    <div class="card"><div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama Akun</th><th>Tipe</th><th>Kategori</th><th class="right">Saldo</th><th>Aksi</th></tr></thead><tbody>
      ${c.coa.map(a=>`<tr><td class="acct-pill">${a.code}</td><td>${esc(a.name)}</td><td><span class="badge b-neu">${a.type}</span></td><td>${esc(a.cat||'-')}</td><td class="right num">${fmtRp(acctBalance(c,a.code))}</td><td><button class="btn btn-sm btn-danger" onclick="delAcct('${a.code}')">Hapus</button></td></tr>`).join('')}
    </tbody></table></div></div>`;
  } else if(tab==='preferensi'){
    body=`<div class="card card-pad" style="max-width:520px;">
      <div class="kv"><span>Versi Aplikasi</span><b>DB Accounting v1.0</b></div>
      <div class="kv"><span>Penyimpanan Data</span><b>${S.dbReady?'Tersimpan otomatis (cloud)':'Sesi ini saja (lokal)'}</b></div>
      <div class="kv"><span>Jumlah Perusahaan</span><b>${S.companies.length}</b></div>
    </div>`;
  }
  return `<div class="page-title">Pengaturan</div><div class="page-sub">Konfigurasi ${esc(c.name)} dan preferensi aplikasi.</div>
  <div class="tabs">${tabs.map(([k,l])=>`<div class="tab ${tab===k?'active':''}" onclick="navigate('pengaturan','${k}')">${l}</div>`).join('')}</div>
  ${body}`;
};
function saveProfile(){
  const c=co();
  c.name=document.getElementById('st_name').value.trim()||c.name;
  c.industry=document.getElementById('st_ind').value;
  c.npwp=document.getElementById('st_npwp').value;
  c.fiscalStart=Number(document.getElementById('st_fy').value);
  c.currency=document.getElementById('st_cur').value||'IDR';
  const m=coMeta(c.id); m.name=c.name;m.industry=c.industry;
  saveCompany(c.id);saveMeta();toast('Profil perusahaan diperbarui');renderAll();
}
function delAcct(code){
  if(!confirm('HAPUS PERMANEN akun '+code+'? Data tidak bisa dikembalikan!'))return;
  const c=co();
  // Cek apakah akun dipakai di jurnal
  const used=(c.journals||[]).some(j=>(j.lines||[]).some(l=>l.acct===code));
  if(used){toast('Akun dipakai di jurnal, tidak bisa dihapus.','error');return;}
  c.coa=c.coa.filter(a=>a.code!==code);
  saveCompany(c.id);toast('Akun dihapus.');renderAll();
}
function openAcctModal(){
  openModal('Tambah Akun Baru',`
    <div class="field-row"><div class="field"><label>Kode Akun</label><input type="text" id="ac_code" placeholder="6-1000"></div>
    <div class="field"><label>Tipe</label><select id="ac_type"><option>Aset</option><option>Kewajiban</option><option>Modal</option><option>Pendapatan</option><option>Beban</option></select></div></div>
    <div class="field"><label>Nama Akun</label><input type="text" id="ac_name" placeholder="Nama akun"></div>
    <div class="field"><label>Kategori</label><input type="text" id="ac_cat" placeholder="Opsional"></div>
  `);
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="submitAcct()">Simpan</button>`);
}
function submitAcct(){
  const code=document.getElementById('ac_code').value.trim(), name=document.getElementById('ac_name').value.trim();
  if(!code||!name){toast('Isi kode dan nama akun');return;}
  const c=co();
  if(c.coa.some(a=>a.code===code)){toast('Kode akun sudah ada');return;}
  c.coa.push({code,name,type:document.getElementById('ac_type').value,cat:document.getElementById('ac_cat').value||''});
  saveCompany(c.id);closeModal();toast('Akun ditambahkan');navigate('pengaturan','coa');
}

