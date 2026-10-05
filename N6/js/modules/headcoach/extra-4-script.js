/**
 * N6 modules - headcoach / extra script #4
 *
 * Standalone IIFE that already ran after the role bundle in headcoach.html.
 * Keep as its own file: it is loaded verbatim, in file-name order, after
 * js/dist/headcoach.js
 */

(()=>{'use strict';
const $=id=>document.getElementById(id),toggle=$('hcAccountToggle'),menu=$('hcAccountMenu');
toggle.addEventListener('click',e=>{e.stopPropagation();menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden))});
document.addEventListener('click',e=>{if(!menu.contains(e.target)&&e.target!==toggle){menu.hidden=true;toggle.setAttribute('aria-expanded','false')}});
menu.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(b.id!=='hcAccountToggle'){menu.hidden=true;toggle.setAttribute('aria-expanded','false')}}));
const key='n6hc:coach-attendance:v1';let entries=[];try{const x=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(x))entries=x}catch(e){}
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>{try{localStorage.setItem(key,JSON.stringify(entries));return true}catch(e){alert('Penyimpanan browser tidak tersedia.');return false}};
const names=()=>{let all=[];try{if(typeof coaches!=='undefined'&&Array.isArray(coaches))all=coaches.map(c=>c.name).filter(Boolean)}catch(e){}try{if(typeof admin!=='undefined'&&Array.isArray(admin.coaches))all=all.concat(admin.coaches.map(c=>c.name||c.nama).filter(Boolean))}catch(e){}return [...new Set(all)]};
function coachOptions(){let el=$('hcAttCoach'),v=el.value;el.innerHTML='<option value="">Pilih coach</option>'+names().map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');el.value=v}
const sharedKey='n6:coach-requests:v1';
function syncCoachRequests(){let raw=[];try{const v=JSON.parse(localStorage.getItem(sharedKey)||'[]');raw=Array.isArray(v)?v:(Array.isArray(v.requests)?v.requests:[])}catch(e){}
 let changed=false;raw.forEach(r=>{if(!r||typeof r!=='object')return;const type=String(r.type||r.jenis||r.status||'').toLowerCase();if(!/izin|sakit|cuti|reschedule|jadwal/.test(type))return;
 const coach=String(r.coachName||r.coach||r.namaCoach||'').trim(),date=String(r.date||r.tanggal||r.mulai||'').slice(0,10);if(!coach||!/^\d{4}-\d{2}-\d{2}$/.test(date))return;
 const requestId=String(r.id||r.requestId||[coach,date,type,r.reason||r.alasan||''].join('|'));
 if(entries.some(e=>e.requestId===requestId))return;
 entries.push({id:'request-'+requestId,requestId,coach,date,status:/reschedule|jadwal/.test(type)?'Reschedule':/sakit/.test(type)?'Sakit':'Izin',time:String(r.time||r.sesi||''),note:String(r.reason||r.alasan||r.keterangan||'Pengajuan dari Dashboard Coach')+' · Pengajuan: '+String(r.approvalStatus||r.statusPersetujuan||'Menunggu'),source:'coach-request'});changed=true;
 });if(changed)save();return changed}
function render(){const q=$('hcAttSearch').value.toLowerCase().trim(),month=$('hcAttMonth').value,status=$('hcAttFilter').value;const filtered=entries.filter(e=>(!q||e.coach.toLowerCase().includes(q))&&(!month||e.date.startsWith(month))&&(!status||e.status===status)).sort((a,b)=>b.date.localeCompare(a.date));$('hcAttRows').innerHTML=filtered.map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(e.coach)}</td><td><span class="badge ${/hadir/i.test(e.status)?'green':/terlambat|reschedule/i.test(e.status)?'amber':/tanpa/i.test(e.status)?'red':'neutral'}">${esc(e.status)}</span></td><td>${esc(e.time)}</td><td>${esc(e.note)}</td><td><button type="button" class="icon-btn danger" data-del="${esc(e.id)}" aria-label="Hapus catatan">✕</button></td></tr>`).join('')||'<tr><td colspan="6" class="hc-empty">Belum ada absensi yang tercatat untuk filter ini.</td></tr>';
const counts=[['Total Catatan',entries.length],['Hadir',entries.filter(e=>e.status==='Hadir').length],['Izin / Sakit',entries.filter(e=>['Izin','Sakit'].includes(e.status)).length],['Reschedule',entries.filter(e=>e.status==='Reschedule').length]];$('hcAttKpis').innerHTML=counts.map(([n,v])=>`<div><small>${n}</small><b>${v}</b></div>`).join('');
$('hcAttReschedule').innerHTML=(typeof rescheduleRequests!=='undefined'&&Array.isArray(rescheduleRequests)?rescheduleRequests:[]).map(r=>`<div class="hc-att-entry"><b>${esc(r.coach)}</b><small>${esc(r.sesi)} → ${esc(r.baru)}</small><small>Alasan: ${esc(r.alasan)} · ${esc(r.status)}</small></div>`).join('')||'<p class="hc-muted">Belum ada pengajuan.</p>';
$('hcAttLeave').innerHTML=(typeof cutiRequests!=='undefined'&&Array.isArray(cutiRequests)?cutiRequests:[]).map(r=>`<div class="hc-att-entry"><b>${esc(r.coach)}</b><small>${esc(r.mulai)} – ${esc(r.selesai)}</small><small>${esc(r.alasan)} · ${esc(r.status)}</small></div>`).join('')||'<p class="hc-muted">Belum ada pengajuan.</p>';
}
$('hcAttDate').value=new Date().toLocaleDateString('en-CA');$('hcAttMonth').value='';coachOptions();syncCoachRequests();render();
$('hcAttForm').addEventListener('submit',e=>{e.preventDefault();let coach=$('hcAttCoach').value,date=$('hcAttDate').value;if(!coach||!date)return;const item={id:String(Date.now())+'-'+Math.random().toString(36).slice(2),coach,date,status:$('hcAttStatus').value,time:$('hcAttTime').value.trim(),note:$('hcAttNote').value.trim()};entries.push(item);if(save()){$('hcAttTime').value='';$('hcAttNote').value='';render()}});
$('hcAttRows').addEventListener('click',e=>{const b=e.target.closest('[data-del]');if(!b||!confirm('Hapus catatan absensi ini?'))return;entries=entries.filter(x=>x.id!==b.dataset.del);save();render()});
['hcAttSearch','hcAttMonth','hcAttFilter'].forEach(id=>$(id).addEventListener('input',render));
$('hcAttPdf').addEventListener('click',()=>{
 const jspdf=window.jspdf;if(!jspdf?.jsPDF){alert('Pustaka PDF belum termuat. Periksa koneksi internet.');return}
 syncCoachRequests();
 const q=$('hcAttSearch').value.toLowerCase().trim(),m=$('hcAttMonth').value,st=$('hcAttFilter').value;
 const data=entries.filter(e=>(!q||e.coach.toLowerCase().includes(q))&&(!m||e.date.startsWith(m))&&(!st||e.status===st)).sort((a,b)=>b.date.localeCompare(a.date));
 const doc=new jspdf.jsPDF({unit:'mm',format:'a4'});const W=210,ink=[22,39,54],muted=[92,107,120],accent=[30,143,105];let y=0,page=0;
 const logo=document.querySelector('.side-brand .logo-white');
 function header(){page++;doc.setFillColor(...ink);doc.rect(0,0,W,38,'F');let logoOk=false;
  if(logo?.src?.startsWith('data:image/'))try{doc.addImage(logo.src,'PNG',13,7,32,20,undefined,'FAST');logoOk=true}catch(e){}
  doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(logoOk?14:17);doc.text('NUMBER SIX RUNNING',logoOk?49:14,18);
  doc.setFontSize(9);doc.setFont('helvetica','normal');doc.text('LAPORAN ABSENSI & PERIZINAN COACH',logoOk?49:14,25);
  doc.setTextColor(...ink);doc.setFontSize(15);doc.setFont('helvetica','bold');doc.text('Riwayat Absensi Coach',14,51);
  doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(...muted);doc.text('Periode: '+(m||'Semua bulan')+'  |  Status: '+(st||'Semua')+'  |  '+data.length+' catatan',14,58);
  doc.setFillColor(235,242,239);doc.rect(13,64,184,9,'F');doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...ink);
  doc.text('TANGGAL',16,70);doc.text('COACH',43,70);doc.text('STATUS',91,70);doc.text('SESI / WAKTU',127,70);doc.text('KETERANGAN',159,70);y=77;
 }
 function footer(){doc.setDrawColor(215,225,221);doc.line(13,283,197,283);doc.setFontSize(8);doc.setTextColor(...muted);doc.text('NUMBER SIX RUNNING  •  Dokumen internal Head Coach',13,289);doc.text(String(page),197,289,{align:'right'})}
 header();if(!data.length){doc.setFontSize(10);doc.text('Tidak ada catatan pada filter yang dipilih.',16,88)}
 data.forEach((e,i)=>{const note=doc.splitTextToSize(String(e.note||'—'),35),coach=doc.splitTextToSize(String(e.coach||'—'),44),time=doc.splitTextToSize(String(e.time||'—'),29);const h=Math.max(13,note.length*4.3+5,coach.length*4.3+5,time.length*4.3+5);
  if(y+h>279){footer();doc.addPage();header()}
  if(i%2===0){doc.setFillColor(247,250,248);doc.rect(13,y,184,h,'F')}
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...ink);doc.text(String(e.date||'—'),16,y+6);doc.text(coach,43,y+6);doc.text(String(e.status||'—'),91,y+6);doc.text(time,127,y+6);doc.text(note,159,y+6);y+=h;
 });footer();doc.save('NUMBER-SIX-Absensi-Coach-'+(m||'semua')+'.pdf');
});
// Update request summaries after existing approval buttons run.
document.addEventListener('click',e=>{if(e.target.closest('.btn-approve,.btn-reject'))queueMicrotask(render)});
window.addEventListener('storage',e=>{if(e.key===sharedKey){syncCoachRequests();render()}});window.addEventListener('focus',()=>{syncCoachRequests();render()});
})();