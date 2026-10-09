/* ---- GANTI PASSWORD (semua peran yang sudah login) ---- */
PAGES.sandi=function(){
  if(!ApiClient.enabled()){
    return `<div class="page-title">Ganti Password</div><div class="page-sub">Kelola kata sandi akun Anda.</div>
    <div class="card card-pad" style="max-width:520px;"><p class="muted">Membutuhkan koneksi ke server (mode API).</p></div>`;
  }
  setTimeout(initSandiPage,0);
  return `<div class="page-title">Ganti Password</div><div class="page-sub">Perbarui kata sandi akun Anda secara berkala demi keamanan.</div>
  <style>
    .dbs-pwrow{display:flex;align-items:center;gap:8px;margin-bottom:14px}
    .dbs-pwrow input{flex:1}
    .dbs-eye{background:none;border:1px solid var(--line,#ddd);border-radius:6px;cursor:pointer;padding:8px 10px;font-size:14px;line-height:1;flex:none}
    .dbs-meter{height:6px;border-radius:4px;background:var(--line,#eee);margin:6px 0 4px;overflow:hidden}
    .dbs-fill{height:100%;width:0;border-radius:4px;transition:width .25s ease,background .25s ease}
    .dbs-hint{font-size:12px;color:var(--text-2);margin-bottom:14px}
    .dbs-tip{font-size:12.5px;color:var(--text-2);background:var(--accent-dim);border-radius:8px;padding:10px 14px;margin-bottom:16px}
  </style>
  <div class="card card-pad" style="max-width:520px;">
    <div class="dbs-tip">Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol dengan panjang minimal 8 karakter.</div>
    <form autocomplete="off" onsubmit="return submitSandiChange(event)">
      <div class="field"><label>Password saat ini</label>
        <div class="dbs-pwrow"><input type="password" id="sandiLama" autocomplete="current-password" required placeholder="Masukkan password lama"><button type="button" class="dbs-eye" data-eye="sandiLama" title="Tampilkan/sembunyikan">&#128065;</button></div>
      </div>
      <div class="field"><label>Password baru</label>
        <div class="dbs-pwrow" style="margin-bottom:0"><input type="password" id="sandiBaru" autocomplete="new-password" required minlength="8" placeholder="Minimal 8 karakter"><button type="button" class="dbs-eye" data-eye="sandiBaru" title="Tampilkan/sembunyikan">&#128065;</button></div>
        <div class="dbs-meter"><div class="dbs-fill" id="dbsFill"></div></div>
        <div class="dbs-hint" id="dbsHint">Kekuatan password akan muncul di sini.</div>
      </div>
      <div class="field"><label>Ulangi password baru</label>
        <div class="dbs-pwrow"><input type="password" id="sandiBaru2" autocomplete="new-password" required minlength="8" placeholder="Ketik ulang password baru"><button type="button" class="dbs-eye" data-eye="sandiBaru2" title="Tampilkan/sembunyikan">&#128065;</button></div>
      </div>
      <p class="muted" id="sandiMsg" style="min-height:18px;margin:6px 0 10px"></p>
      <button class="btn btn-primary" type="submit">Simpan Password Baru</button>
    </form>
  </div>`;
};
function initSandiPage(){
  document.querySelectorAll('.dbs-eye').forEach(function(b){
    b.addEventListener('click',function(){
      const i=document.getElementById(b.getAttribute('data-eye'));
      if(i)i.type=i.type==='password'?'text':'password';
    });
  });
  const inp=document.getElementById('sandiBaru'),fill=document.getElementById('dbsFill'),hint=document.getElementById('dbsHint');
  if(inp&&fill&&hint)inp.addEventListener('input',function(){
    const v=inp.value;let s=0;
    if(v.length>=8)s++;if(v.length>=12)s++;
    if(/[a-z]/.test(v)&&/[A-Z]/.test(v))s++;
    if(/\d/.test(v))s++;if(/[^A-Za-z0-9]/.test(v))s++;
    const colors=['#e5e5e5','#E5484D','#f97316','#eab308','#1EB682','#15803d'];
    const labels=['Terlalu pendek','Lemah','Cukup','Kuat','Sangat kuat','Sangat kuat'];
    fill.style.width=Math.min(100,s*20)+'%';fill.style.background=colors[s];
    hint.textContent=v?('Kekuatan: '+labels[s]):'Kekuatan password akan muncul di sini.';
  });
}
function dbsSetMsg(text,ok){
  const m=document.getElementById('sandiMsg');
  if(!m)return;
  m.textContent=text||'';
  m.style.color=text?(ok?'var(--pos)':'var(--neg)'):'';
}
async function submitSandiChange(e){
  e.preventDefault();
  dbsSetMsg('');
  const lama=document.getElementById('sandiLama').value;
  const baru=document.getElementById('sandiBaru').value;
  if(baru!==document.getElementById('sandiBaru2').value){dbsSetMsg('Ulangi password baru tidak sama.',false);return false;}
  try{
    await ApiClient.changePassword(lama,baru);
    dbsSetMsg('Password berhasil diganti.',true);
    e.target.reset();
    const fill=document.getElementById('dbsFill'),hint=document.getElementById('dbsHint');
    if(fill)fill.style.width='0';
    if(hint)hint.textContent='Kekuatan password akan muncul di sini.';
    toast('Password berhasil diganti.');
  }catch(err){dbsSetMsg('Gagal: '+(err.detail||err.message),false);}
  return false;
}
