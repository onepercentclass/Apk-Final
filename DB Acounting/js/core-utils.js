/* ============================= UTIL ============================= */
function uid(p){return (p||'id')+'_'+Math.random().toString(36).slice(2,9);}
function fmtRp(n){n=Math.round(n||0);const neg=n<0;n=Math.abs(n);return (neg?'-':'')+'Rp'+n.toLocaleString('id-ID');}
function fmtNum(n){return Math.round(n||0).toLocaleString('id-ID');}
function todayStr(){return new Date().toISOString().slice(0,10);}
function fmtDate(d){if(!d)return'-';const dt=new Date(d+'T00:00:00');return dt.getDate()+' '+MONTHS_ID[dt.getMonth()]+' '+dt.getFullYear();}
function monthKey(d){return d.slice(0,7);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function daysSince(d){return Math.floor((Date.now()-new Date(d+'T00:00:00').getTime())/86400000);}
function toast(msg){
  const el=document.createElement('div');el.className='toast';el.textContent=msg;
  document.getElementById('toastRoot').appendChild(el);
  setTimeout(()=>el.remove(),2600);
}
function co(){return S.data[S.activeId];}
function coMeta(id){return S.companies.find(c=>c.id===id);}

