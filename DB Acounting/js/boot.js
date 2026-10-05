/* ============================= BOOT ============================= */
async function boot(){
  await initDb();
  if(typeof TierAccess!=='undefined'){ try{ await TierAccess.init(); }catch(e){} }
  // Cegah route tersimpan/di-request di luar hak tier (tier 0 = semua lolos).
  if(typeof TierAccess!=='undefined' && !TierAccess.canAccess(S.route)) S.route='dashboard';
  S.downloads = null; /* unduhan via browser bawaan; integrasi native nonaktif (lihat js/config.js) */
  await loadAccount();
  S.session = getSession();
  const validSession = S.session && S.account && S.session.email===S.account.email;
  if(validSession){ showApp(); }
  else { clearSession(); showAuth(); }
}
boot();
