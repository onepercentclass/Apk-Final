/* ---- KELOLA ANGGOTA (owner only — dibatasi juga di server) ----
   Daftar akun, tambah anggota (tier default paling bawah/Viewer),
   ubah tier, nonaktifkan/aktifkan kembali. */
PAGES.akun=function(){
  setTimeout(loadAkunPage,0);
  return `<div class="page-title">Kelola Anggota</div><div class="page-sub">Tambah akun baru, atur tier peran, dan nonaktifkan atau aktifkan anggota tim.</div>
  <div id="akunRoot"><div class="card card-pad"><div class="empty"><div class="et">Memuat...</div></div></div></div>`;
};
const AKUN_TIER_LABEL={0:'Owner',1:'Admin',2:'Staff',3:'Viewer'};
function dbaInjectCss(){
  if(document.getElementById('dba-css'))return;
  const st=document.createElement('style');
  st.id='dba-css';
  st.textContent=[
    '.dba-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}',
    '@media(max-width:640px){.dba-stats{gap:8px}}',
    '.dba-row{display:flex;align-items:center;gap:12px}',
    '.dba-avatar{width:36px;height:36px;border-radius:50%;background:var(--accent-dim);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;flex:none}',
    '.dba-name{font-weight:700;font-size:13.5px}',
    '.dba-mail{font-size:12px;color:var(--text-2);margin-top:2px}',
    '.dba-sel{font-size:12px;padding:5px 8px;border-radius:6px;max-width:132px;margin-top:6px}',
    '.dba-act{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}',
    '.dba-empty{padding:36px 16px;text-align:center}',
    '.dba-eyebtn{background:none;border:1px solid var(--line,#ddd);border-radius:6px;cursor:pointer;padding:8px 10px;font-size:14px;line-height:1;flex:none}',
  ].join('\n');
  document.head.appendChild(st);
}
function dbaAvatar(name){
  const ini=String(name||'?').trim().split(/\s+/).map(w=>w.charAt(0)).join('').slice(0,2).toUpperCase()||'?';
  return `<span class="dba-avatar">${esc(ini)}</span>`;
}
function dbaTierBadge(t){
  const cls=t===0?'b-warn':(t===1?'b-accent':(t===2?'b-neu':'b-neu'));
  return `<span class="badge ${cls}">${esc(AKUN_TIER_LABEL[t]||t)}</span>`;
}
function dbaSetMsg(id,text,ok){
  const m=document.getElementById(id);
  if(!m)return;
  m.textContent=text||'';
  m.style.color=text?(ok?'var(--pos)':'var(--neg)'):'';
}
async function loadAkunPage(){
  dbaInjectCss();
  const root=document.getElementById('akunRoot');
  if(!root) return;
  if(!ApiClient.enabled()){
    root.innerHTML=`<div class="card card-pad"><div class="page-title" style="font-size:16px;">Kelola Anggota</div><p class="muted">Membutuhkan koneksi ke server (mode API). Aktifkan API dan masuk sebagai Owner.</p></div>`;
    return;
  }
  root.innerHTML=`
  <div class="dba-stats">
    <div class="stat-card card"><div class="stat-value" id="dbaTotal">–</div><div class="stat-label">Total Anggota</div></div>
    <div class="stat-card card"><div class="stat-value" id="dbaAktif" style="color:var(--pos)">–</div><div class="stat-label">Aktif</div></div>
    <div class="stat-card card"><div class="stat-value" id="dbaNonaktif" style="color:var(--neg)">–</div><div class="stat-label">Nonaktif</div></div>
  </div>
  <div class="card"><div class="card-head"><div><h3>Tambah Anggota Baru</h3><span class="chsub">Akun baru otomatis mendapat tier Viewer (paling bawah). Tier bisa diubah setelah dibuat.</span></div></div>
    <div class="card-body"><form id="akunAddForm" autocomplete="off" onsubmit="return submitAkunAdd(event)">
      <div class="field-row">
        <div class="field"><label>Nama lengkap *</label><input id="akunNama" required maxlength="120" placeholder="cth: Budi Santoso"></div>
        <div class="field"><label>Email *</label><input id="akunEmail" type="email" required maxlength="255" placeholder="nama@contoh.id"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Password awal * <span class="muted">(min. 8 karakter)</span></label><input id="akunPass" type="password" required minlength="8" autocomplete="new-password" placeholder="••••••••"></div>
        <div class="field"><label>Tier awal</label><select id="akunTier">
          <option value="1">Admin</option><option value="2">Staff</option><option value="3" selected>Viewer</option>
        </select></div>
      </div>
      <p class="muted" id="akunAddMsg" style="min-height:18px;margin:8px 0"></p>
      <button class="btn btn-primary" type="submit">+ Tambah Anggota</button>
    </form></div>
  </div>
  <div class="card"><div class="card-head"><div><h3>Daftar Anggota</h3><span class="chsub" id="akunInfo">Memuat...</span></div><button class="btn btn-sm" onclick="loadAkunTable()">Muat ulang</button></div>
    <div class="card-body" style="padding:0"><div class="table-wrap"><table>
      <thead><tr><th>Akun</th><th>Tier</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead>
      <tbody id="akunBody"><tr><td colspan="4" class="muted" style="text-align:center">Memuat...</td></tr></tbody>
    </table></div></div>
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
    const info=document.getElementById('akunInfo');
    if(info)info.textContent=`Menampilkan ${items.length} dari ${data.total||0} akun`;
    const aktif=items.filter(a=>a.is_active).length;
    const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
    set('dbaTotal',items.length);set('dbaAktif',aktif);set('dbaNonaktif',items.length-aktif);
    tbody.innerHTML=items.map(a=>{
      const isSelf=selfEmail&&String(a.email||'').toLowerCase()===selfEmail;
      const tierCell=a.tier===0
        ?`${dbaTierBadge(0)} <span class="muted" style="font-size:11px">(kunci)</span>`
        :`${dbaTierBadge(a.tier)}<br><select class="dba-sel" data-tier="${a.id}">${[1,2,3].map(t=>`<option value="${t}"${t===a.tier?' selected':''}>${AKUN_TIER_LABEL[t]}</option>`).join('')}</select>`;
      const status=a.is_active?`<span class="badge b-pos">Aktif</span>`:`<span class="badge b-neg">Nonaktif</span>`;
      const aksi=isSelf?`<span class="muted">akun ini</span>`
        :(a.is_active?`<button class="btn btn-sm btn-danger" data-off="${a.id}">Nonaktifkan</button>`
        :`<button class="btn btn-sm" data-on="${a.id}">Aktifkan</button>`) +
        ` <button class="btn btn-sm btn-danger" data-hard="${a.id}" title="Hapus permanen">Hapus</button>`;
      return `<tr><td><div class="dba-row">${dbaAvatar(a.name)}<div><div class="dba-name">${esc(a.name)}</div><div class="dba-mail">${esc(a.email)}</div></div></div></td><td>${tierCell}</td><td>${status}</td><td><div class="dba-act">${aksi}</div></td></tr>`;
    }).join('')||`<tr><td colspan="4"><div class="dba-empty"><div class="muted">Belum ada anggota.<br>Tambahkan anggota pertama lewat form di atas.</div></div></td></tr>`;
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
    tbody.querySelectorAll('[data-hard]').forEach(b=>b.addEventListener('click',async()=>{
      if(!confirm('HAPUS PERMANEN akun ini? Data tidak bisa dikembalikan!'))return;
      try{await ApiClient.deleteAccountHard(b.getAttribute('data-hard'));toast('Akun dihapus permanen.');}
      catch(e){toast('Gagal: '+(e.detail||e.message));}
      loadAkunTable();
    }));
  }catch(e){
    tbody.innerHTML=`<tr><td colspan="4" style="color:var(--neg)">Gagal memuat: ${esc(e.detail||e.message)}</td></tr>`;
  }
}
async function submitAkunAdd(e){
  e.preventDefault();
  dbaSetMsg('akunAddMsg','');
  try{
    const created=await ApiClient.createAccount({
      name:document.getElementById('akunNama').value.trim(),
      email:document.getElementById('akunEmail').value.trim(),
      password:document.getElementById('akunPass').value,
      tier:parseInt(document.getElementById('akunTier').value,10),
    });
    dbaSetMsg('akunAddMsg',`Anggota "${created.email}" ditambahkan (${AKUN_TIER_LABEL[created.tier]}).`,true);
    e.target.reset();
    document.getElementById('akunTier').value='3';
    loadAkunTable();
  }catch(err){dbaSetMsg('akunAddMsg','Gagal: '+(err.detail||err.message),false);}
  return false;
}
