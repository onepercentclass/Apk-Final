/* ---- KELOLA ANGGOTA (owner only — dibatasi juga di server) ----
   Daftar akun, tambah anggota (tier default paling bawah/Viewer),
   ubah tier, nonaktifkan/aktifkan kembali. */
PAGES.akun=function(){
  setTimeout(loadAkunPage,0);
  return `<div class="page-title">Kelola Anggota</div><div class="page-sub">Kelola akun pengguna aplikasi.</div>
  <div id="akunRoot"><div class="card card-pad"><div class="empty"><div class="et">Memuat...</div></div></div></div>`;
};
const AKUN_TIER_LABEL={0:'Owner',1:'Admin',2:'Staff',3:'Viewer'};
async function loadAkunPage(){
  const root=document.getElementById('akunRoot');
  if(!root) return;
  if(!ApiClient.enabled()){
    root.innerHTML=`<div class="card card-pad"><div class="page-title" style="font-size:16px;">Kelola Anggota</div><p class="muted">Membutuhkan koneksi ke server (mode API). Aktifkan API dan masuk sebagai Owner.</p></div>`;
    return;
  }
  root.innerHTML=`
  <div class="card"><div class="card-head"><h3>Tambah Anggota Baru</h3></div>
    <div class="card-body"><form id="akunAddForm" autocomplete="off" onsubmit="return submitAkunAdd(event)">
      <div class="form-grid">
        <div class="field"><label>Nama lengkap *</label><input id="akunNama" required maxlength="120" placeholder="cth: Budi Santoso"></div>
        <div class="field"><label>Email *</label><input id="akunEmail" type="email" required maxlength="255" placeholder="nama@contoh.id"></div>
        <div class="field"><label>Password awal *</label><input id="akunPass" type="password" required minlength="8" autocomplete="new-password"></div>
        <div class="field"><label>Tier</label><select id="akunTier">
          <option value="1">Admin</option><option value="2">Staff</option><option value="3" selected>Viewer</option>
        </select></div>
      </div>
      <p id="akunAddMsg" class="form-msg"></p>
      <button class="btn btn-primary" type="submit">Tambah Anggota</button>
      <span class="muted">Tier default: Viewer (paling bawah).</span>
    </form></div>
  </div>
  <div class="card"><div class="card-head"><h3>Daftar Akun</h3><button class="btn btn-sm" onclick="loadAkunTable()">Muat ulang</button></div>
    <div class="card-body"><div class="table-wrap"><table>
      <thead><tr><th>Akun</th><th>Tier</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead>
      <tbody id="akunBody"><tr><td colspan="4" class="muted" style="text-align:center">Memuat...</td></tr></tbody>
    </table></div><p class="muted" id="akunInfo"></p></div>
  </div>`;
  loadAkunTable();
}
async function loadAkunTable(){
  const tbody=document.getElementById('akunBody');
  if(!tbody) return;
  const selfEmail=(S.account&&S.account.email||'').toLowerCase();
  try{
    const data=await ApiClient.accounts();
    const items=data.items||[];
    document.getElementById('akunInfo').textContent=`Menampilkan ${items.length} dari ${data.total||0} akun`;
    tbody.innerHTML=items.map(a=>{
      const isSelf=selfEmail&&a.email.toLowerCase()===selfEmail;
      const tierCell=a.tier===0
        ?`<span class="badge">Owner</span> <span class="muted">(kunci)</span>`
        :`<select data-tier="${a.id}">${[1,2,3].map(t=>`<option value="${t}"${t===a.tier?' selected':''}>${AKUN_TIER_LABEL[t]}</option>`).join('')}</select>`;
      const status=a.is_active?`<span style="color:var(--pos)">Aktif</span>`:`<span style="color:var(--neg)">Nonaktif</span>`;
      const aksi=isSelf?`<span class="muted">akun ini</span>`
        :a.is_active?`<button class="btn btn-sm" data-off="${a.id}">Nonaktifkan</button>`
        :`<button class="btn btn-sm" data-on="${a.id}">Aktifkan</button>`;
      return `<tr><td><b>${esc(a.name)}</b><br><span class="muted">${esc(a.email)}</span></td><td>${tierCell}</td><td>${status}</td><td style="text-align:right">${aksi}</td></tr>`;
    }).join('')||`<tr><td colspan="4" class="muted" style="text-align:center">Belum ada anggota.</td></tr>`;
    tbody.querySelectorAll('[data-tier]').forEach(sel=>sel.addEventListener('change',async()=>{
      const id=sel.getAttribute('data-tier'),tier=parseInt(sel.value,10);
      if(!confirm(`Ubah tier menjadi ${AKUN_TIER_LABEL[tier]}?`)){loadAkunTable();return;}
      try{await ApiClient.setAccountTier(id,tier);toast('Tier berhasil diubah.');}
      catch(e){toast('Gagal: '+(e.detail||e.message));}
      loadAkunTable();
    }));
    tbody.querySelectorAll('[data-off]').forEach(b=>b.addEventListener('click',async()=>{
      if(!confirm('Nonaktifkan akun ini? Ia tidak bisa masuk sampai diaktifkan kembali.'))return;
      try{await ApiClient.deactivateAccount(b.getAttribute('data-off'));toast('Akun dinonaktifkan.');}
      catch(e){toast('Gagal: '+(e.detail||e.message));}
      loadAkunTable();
    }));
    tbody.querySelectorAll('[data-on]').forEach(b=>b.addEventListener('click',async()=>{
      try{await ApiClient.updateAccount(b.getAttribute('data-on'),{is_active:true});toast('Akun diaktifkan kembali.');}
      catch(e){toast('Gagal: '+(e.detail||e.message));}
      loadAkunTable();
    }));
  }catch(e){
    tbody.innerHTML=`<tr><td colspan="4" style="color:var(--neg)">Gagal memuat: ${esc(e.detail||e.message)}</td></tr>`;
  }
}
async function submitAkunAdd(e){
  e.preventDefault();
  const msg=document.getElementById('akunAddMsg');
  msg.textContent='';
  try{
    const created=await ApiClient.createAccount({
      name:document.getElementById('akunNama').value.trim(),
      email:document.getElementById('akunEmail').value.trim(),
      password:document.getElementById('akunPass').value,
      tier:parseInt(document.getElementById('akunTier').value,10),
    });
    msg.textContent=`Anggota "${created.email}" ditambahkan (${AKUN_TIER_LABEL[created.tier]}).`;
    e.target.reset();
    document.getElementById('akunTier').value='3';
    loadAkunTable();
  }catch(err){msg.textContent='Gagal: '+(err.detail||err.message);}
  return false;
}
