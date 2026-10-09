/* ============================= AUTH SCREEN ============================= */
function showAuth(){
  const bl=document.getElementById('bootLoader'); if(bl) bl.remove();
  document.getElementById('shell').style.display='none';
  const el=document.getElementById('authScreen');
  el.style.display='flex';
  renderAuthScreen();
}
function showApp(){
  const bl=document.getElementById('bootLoader'); if(bl) bl.remove();
  document.getElementById('authScreen').style.display='none';
  document.getElementById('shell').style.display='flex';
  renderAll();
}
function renderAuthScreen(){
  const el=document.getElementById('authScreen');
  const hasAccount=!!S.account;
  const mode = hasAccount ? 'login' : 'register';
  S.authMode=mode;
  if(mode==='register'){
    el.innerHTML=`<div class="auth-box">
      <div class="auth-brand"><div class="logomark"><img src="${LOGO_DATA_URI}" alt="DB Accounting"></div><h1>DB Accounting</h1><p>Buat akun untuk mulai mengelola pembukuan bisnis Anda.</p></div>
      <div class="card auth-card">
        <div class="auth-title">Buat Akun</div>
        <div class="auth-sub">Akun ini digunakan untuk masuk ke aplikasi di perangkat ini.</div>
        <div id="authErrBox"></div>
        <div class="field"><label>Nama Lengkap</label><input type="text" id="rg_name" placeholder="Nama Anda"></div>
        <div class="field"><label>Email</label><input type="text" id="rg_email" placeholder="nama@email.com"></div>
        <div class="field"><label>Kata Sandi</label><input type="password" id="rg_pass" placeholder="Minimal 6 karakter"></div>
        <div class="field"><label>Konfirmasi Kata Sandi</label><input type="password" id="rg_pass2" placeholder="Ulangi kata sandi"></div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="submitRegister()">Buat Akun & Masuk</button>
      </div>
      <div class="auth-hint">${apiEnabled() ? 'Akun tersimpan di server. Pada server baru yang masih kosong, pendaftaran ini membuat akun owner pertama.' : 'Akun tersimpan secara lokal pada aplikasi ini. Saat backend API sudah aktif sesuai dokumentasi, proses ini dapat diganti dengan autentikasi server (JWT).'}</div>
    </div>`;
  } else {
    el.innerHTML=`<div class="auth-box">
      <div class="auth-brand"><div class="logomark"><img src="${LOGO_DATA_URI}" alt="DB Accounting"></div><h1>DB Accounting</h1><p>Masuk untuk melanjutkan ke sistem akuntansi Anda.</p></div>
      <div class="card auth-card">
        <div class="auth-title">Masuk</div>
        <div class="auth-sub">Selamat datang kembali, ${esc(S.account?S.account.name:'')}.</div>
        <div id="authErrBox"></div>
        <div class="field"><label>Email</label><input type="text" id="lg_email" value="${S.account?esc(S.account.email):''}" placeholder="nama@email.com"></div>
        <div class="field"><label>Kata Sandi</label><input type="password" id="lg_pass" placeholder="Kata sandi Anda"></div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="submitLogin()">Masuk</button>
      </div>
    </div>`;
  }
  const first=el.querySelector('input');if(first) setTimeout(()=>first.focus(),50);
  el.querySelectorAll('input').forEach(inp=>inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ mode==='register'?submitRegister():submitLogin(); } }));
}
function authError(msg){
  const box=document.getElementById('authErrBox');
  if(box) box.innerHTML=`<div class="auth-error">${esc(msg)}</div>`;
}
function apiEnabled(){
  return typeof ApiClient !== 'undefined' && ApiClient.enabled();
}
async function applyApiSession(res){
  // res: {token, tier, name, email} dari POST /auth/login atau /auth/register
  ApiClient.setToken(res.token);
  S.account = { name: res.name, email: res.email, tier: res.tier };
  try { localStorage.setItem('dbacc_account_v1', JSON.stringify(S.account)); } catch (e) { if(window.logger) window.logger.caught('page-auth', e, 'saveAccount'); }
  setSession({ name: res.name, email: res.email, ts: Date.now() });
  // Segarkan hak akses dari backend (token baru) sebelum aplikasi di-render,
  // agar menu yang tampil sesuai tier user — bukan tier 0 bawaan.
  if (typeof TierAccess !== 'undefined' && TierAccess.init) {
    try { await TierAccess.init(); } catch (e) { /* pakai fallback */ }
  }
}
async function submitRegister(){
  const name=document.getElementById('rg_name').value.trim();
  const email=document.getElementById('rg_email').value.trim();
  const pass=document.getElementById('rg_pass').value;
  const pass2=document.getElementById('rg_pass2').value;
  if(!name||!email){authError('Isi nama dan email terlebih dahulu.');return;}
  if(!/^\S+@\S+\.\S+$/.test(email)){authError('Format email tidak valid.');return;}
  if(pass.length<6){authError('Kata sandi minimal 6 karakter.');return;}
  if(pass!==pass2){authError('Konfirmasi kata sandi tidak cocok.');return;}
  if(apiEnabled()){
    try {
      const res = await ApiClient.post('/auth/register', { name, email, password: pass });
      await applyApiSession(res);
      toast('Akun berhasil dibuat');
      showApp();
    } catch (e) {
      if (e && e.status === 403) {
        // Server sudah punya user (register hanya untuk bootstrap) -> alihkan ke login.
        S.account = { name: '', email: email };
        renderAuthScreen();
        authError('Pendaftaran ditutup: akun sudah ada di server. Silakan masuk.');
      } else if (e && e.status === 409) {
        authError('Email sudah terdaftar. Silakan masuk.');
      } else {
        authError((e && e.detail) || 'Gagal membuat akun. Periksa koneksi ke server.');
      }
    }
    return;
  }
  await registerAccount({name,email,password:pass});
  toast('Akun berhasil dibuat');
  showApp();
}
async function submitLogin(){
  const email=document.getElementById('lg_email').value;
  const pass=document.getElementById('lg_pass').value;
  if(!email||!pass){authError('Isi email dan kata sandi.');return;}
  if(apiEnabled()){
    try {
      const res = await ApiClient.post('/auth/login', { email: email.trim(), password: pass });
      await applyApiSession(res);
      toast('Berhasil masuk');
      showApp();
    } catch (e) {
      if (e && e.status === 401) authError('Email atau kata sandi salah.');
      else authError((e && e.detail) || 'Gagal masuk. Periksa koneksi ke server.');
    }
    return;
  }
  const res=await loginAccount({email,password:pass});
  if(!res.ok){authError(res.msg);return;}
  toast('Berhasil masuk');
  showApp();
}

