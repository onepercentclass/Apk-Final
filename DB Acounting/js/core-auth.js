/* ============================= AUTH ============================= */
const SESSION_KEY='dbacc_session';
async function sha256(text){
  try{
    const buf=await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){
    // fallback sederhana bila Web Crypto tidak tersedia (bukan untuk produksi)
    let h=0; for(let i=0;i<text.length;i++){h=(h<<5)-h+text.charCodeAt(i);h|=0;} return 'fb'+Math.abs(h);
  }
}
function getSession(){
  try{ const raw=localStorage.getItem(SESSION_KEY); return raw?JSON.parse(raw):null; }catch(e){ return null; }
}
function setSession(sess){
  S.session=sess;
  try{ localStorage.setItem(SESSION_KEY, JSON.stringify(sess)); }catch(e){ if(window.logger) window.logger.caught('auth', e, 'saveSession'); }
}
function clearSession(){
  S.session=null;
  try{ localStorage.removeItem(SESSION_KEY); }catch(e){ if(window.logger) window.logger.caught('auth', e, 'clearSession'); }
}
async function loadAccount(){
  // Mode lokal: akun tersimpan di localStorage perangkat ini.
  try{ const raw=localStorage.getItem('dbacc_account_v1'); S.account = raw?JSON.parse(raw):null; }catch(e){ S.account=null; }
  if(typeof ApiClient!=='undefined' && ApiClient.enabled()){
    try{
      const acc=await ApiClient.getAccount();
      if(acc){
        // GET /auth/me hanya mengembalikan {tier, menus} — pertahankan
        // name/email dari akun lokal/sesi agar cek sesi di boot() tetap jalan.
        const sess=getSession();
        S.account=Object.assign({}, acc, {
          email:(S.account&&S.account.email)||(sess&&sess.email)||'',
          name:(S.account&&S.account.name)||(sess&&sess.name)||''
        });
      }
    }catch(e){ /* tetap pakai lokal */ }
  }
}
async function saveAccount(acc){
  S.account=acc;
  try{ localStorage.setItem('dbacc_account_v1', JSON.stringify(acc)); }catch(e){ if(window.logger) window.logger.caught('auth', e, 'saveAccount'); }
  if(typeof ApiClient!=='undefined' && ApiClient.enabled()){
    try{ await ApiClient.saveAccount(acc); }catch(e){ if(window.logger) window.logger.caught('auth', e, 'saveAccountApi'); }
  }
}
async function registerAccount(f){
  const hash=await sha256(f.password);
  const acc={name:f.name,email:f.email.trim().toLowerCase(),passwordHash:hash,createdAt:new Date().toISOString()};
  await saveAccount(acc);
  setSession({name:acc.name,email:acc.email,ts:Date.now()});
}
async function loginAccount(f){
  if(!S.account) return {ok:false,msg:'Akun belum dibuat di perangkat ini.'};
  const hash=await sha256(f.password);
  if(f.email.trim().toLowerCase()!==S.account.email || hash!==S.account.passwordHash) return {ok:false,msg:'Email atau kata sandi salah.'};
  setSession({name:S.account.name,email:S.account.email,ts:Date.now()});
  return {ok:true};
}
function logout(){
  clearSession();
  if(typeof ApiClient!=='undefined' && ApiClient.enabled()) ApiClient.clearToken();
  S.acctMenuOpen=false;
  showAuth();
  toast('Anda telah keluar');
}
async function updateAccountProfile(f){
  const acc={...S.account,name:f.name};
  if(f.newPassword){ acc.passwordHash=await sha256(f.newPassword); }
  await saveAccount(acc);
  setSession({...S.session,name:acc.name});
  toast('Profil akun diperbarui');
}

