/**
 * N6 modules - owner / extra script #3
 *
 * Standalone IIFE that already ran after the role bundle in owner.html.
 * Keep as its own file: it is loaded verbatim, in file-name order, after
 * js/dist/owner.js
 */


(function(){
 const ids=['RevenueTarget','ClientsTarget','CommissionMax','TicketsMax','MessagesMax','EndingMax'];
 const key='n6-owner-kpi-limits-v1';let limits={};
 try{limits=JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(e){}
 function input(id){return document.getElementById('kpi'+id)}
 function load(){ids.forEach(id=>{input(id).value=limits[id]??''})}
 function metric(label,value,detail,target,goodWhenHigher,fmt){
  const configured=target!==undefined&&target!==null&&target!==''&&Number.isFinite(Number(target));
  const valid=configured&&Number(target)>=0;const ok=valid&&(goodWhenHigher?value>=Number(target):value<=Number(target));
  const progress=valid&&Number(target)>0?Math.min(100,Math.round(value/Number(target)*100)):null;
  const badge=!valid?'Batas belum diatur':ok?'Dalam batas':'Perlu perhatian';
  const klass=!valid?'unset':ok?'ok':'warn';
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return `<article class="health-item"><div class="health-label">${esc(label)}</div><strong>${esc(fmt?fmt(value):value)}</strong><div class="health-sub">${esc(detail)}${valid?' · Batas: '+esc(fmt?fmt(Number(target)):target):''}</div>${progress!==null?`<div class="progress-track" style="margin-top:10px"><div class="progress-fill" style="width:${progress}%"></div></div>`:''}<span class="health-pill ${klass}">${badge}</span></article>`;
 }
 window.renderBusinessHealth=function(d){
  const el=document.getElementById('businessHealth');if(!el)return;
  const rupiah=n=>'Rp'+Math.round(n).toLocaleString('id-ID');
  const rate=d.sum>0?d.commission/d.sum*100:null;
  el.innerHTML=metric('Pendapatan periode',d.sum,'Sesuai filter periode / coach',limits.RevenueTarget,true,rupiah)
   +metric('Pendaftaran baru',d.newClients,'Sesuai filter periode / coach',limits.ClientsTarget,true)
   +(rate===null?'<article class="health-item"><div class="health-label">Rasio komisi</div><strong>—</strong><div class="health-sub">Belum ada pendapatan untuk menghitung rasio</div><span class="health-pill unset">Belum dapat dihitung</span></article>':metric('Rasio komisi',Number(rate.toFixed(1)),'Dari pendapatan periode',limits.CommissionMax,false,n=>n.toLocaleString('id-ID')+'%'))
   +metric('Tiket terbuka',d.open,'Seluruh tiket, semua coach',limits.TicketsMax,false)
   +metric('Pesan menunggu',d.waiting,'Seluruh klien, semua coach',limits.MessagesMax,false)
   +metric('Program akan berakhir',d.ending,'Klien pada filter coach',limits.EndingMax,false);
 };
 document.getElementById('openKpiSettings').addEventListener('click',()=>{const el=document.getElementById('kpiSettings');el.open=!el.open;if(el.open)el.scrollIntoView({behavior:'smooth',block:'nearest'})});
 document.getElementById('saveKpiSettings').addEventListener('click',()=>{for(const id of ids){const v=input(id).value;if(v!==''&&(!Number.isFinite(Number(v))||Number(v)<0||(id==='CommissionMax'&&Number(v)>100))){input(id).focus();return}}limits={};ids.forEach(id=>{if(input(id).value!=='')limits[id]=Number(input(id).value)});try{localStorage.setItem(key,JSON.stringify(limits))}catch(e){}document.getElementById('kpiSettings').open=false;if(typeof window.n6RefreshAnalytics==='function')window.n6RefreshAnalytics();});
 document.getElementById('resetKpiSettings').addEventListener('click',()=>{limits={};try{localStorage.removeItem(key)}catch(e){}load();if(typeof window.n6RefreshAnalytics==='function')window.n6RefreshAnalytics()});
 const desktop=document.getElementById('desktopAccountBtn');const mobile=document.getElementById('mobileAccountBtn');if(desktop&&mobile)desktop.addEventListener('click',()=>mobile.click());
 load();
})();
