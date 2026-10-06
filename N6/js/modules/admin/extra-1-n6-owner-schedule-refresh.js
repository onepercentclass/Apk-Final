/**
 * N6 modules - admin / extra script #1
 *
 * Standalone IIFE that already ran after the role bundle in admin.html.
 * Keep as its own file: it is loaded verbatim, in file-name order, after
 * js/dist/admin.js
 */


(function(){
 const btn=document.getElementById('n6SyncRefresh');
 if(!btn)return;
 btn.addEventListener('click',()=>{
  if(typeof n6RefreshSharedCoachData==='function')n6RefreshSharedCoachData();
  const status=document.getElementById('n6SyncStatus');
  if(status)status.textContent='Terakhir diperbarui: '+new Date().toLocaleTimeString('id-ID')+' · '+coachRoster.length+' coach · sinkronisasi satu browser & alamat situs.';
 });
})();
