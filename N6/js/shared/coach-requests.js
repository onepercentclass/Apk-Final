/**
 * N6 shared module - coach-requests
 *
 * Was duplicated byte for byte in owner and admin.html.
 * Kept once here; both roles load this same file after their bundle.
 *
 * Standalone IIFE, already self-contained, so sharing it changes nothing.
 */

/* Additional Coach schedule tabs. Shared localStorage works for dashboards on the same origin. */
(function(){
 'use strict';
 const key='n6:coach:requests:v1';
 const kinds=['izin','reschedule','cuti'];
 const root=document.getElementById('panel-jadwalcoach');if(!root)return;
 const $=(q)=>root.querySelector(q);
 const escape=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function load(){try{const x=JSON.parse(localStorage.getItem(key));return Array.isArray(x)?x.filter(r=>r&&kinds.includes(r.kind)):[]}catch(e){return []}}
 let rows=load();
 function save(){try{localStorage.setItem(key,JSON.stringify(rows))}catch(e){alert('Gagal menyimpan: penyimpanan browser tidak tersedia.')}}
 function coaches(){
  const selects=[...document.querySelectorAll('select')].filter(s=>/coach/i.test(s.id||''));
  const names=new Set();selects.forEach(s=>[...s.options].forEach(o=>{const v=o.textContent.trim();if(o.value&&v&&!/pilih|semua|—|--/i.test(v)&&v.length<65)names.add(v)}));
  try{const data=JSON.parse(localStorage.getItem('n6:shared:coaches:v1'));if(Array.isArray(data))data.forEach(x=>{if(x&&x.name)names.add(x.name)})}catch(e){}
  return [...names];
 }
 function populate(){const names=coaches();root.querySelectorAll('[data-n6-coaches]').forEach(s=>{const old=s.value;s.innerHTML='<option value="">Pilih coach</option>'+names.map(n=>'<option value="'+escape(n)+'">'+escape(n)+'</option>').join('')+'<option value="__other">+ Nama coach lain…</option>';if(names.includes(old))s.value=old;});}
 function render(){kinds.forEach(kind=>{const dest=$('[data-n6-list="'+kind+'"]');const list=rows.filter(x=>x.kind===kind).sort((a,b)=>b.created.localeCompare(a.created));dest.innerHTML=list.length?list.map(r=>{
 const detail=kind==='izin'?(r.tanggal+' · '+r.jam+' · '+(r.klien||'Tanpa klien')):kind==='reschedule'?('Lama: '+r.lama+' → Baru: '+r.baru+' · '+r.klien):('Cuti: '+r.mulai+' s.d. '+r.selesai+' · '+r.jenis);
 const status=r.status||'Menunggu';const tone=status==='Disetujui'?'green':status==='Ditolak'?'red':'amber';
 return '<article class="n6-request-item"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b>'+escape(r.coach)+'</b><span class="badge '+tone+'">'+escape(status)+'</span></div><div class="meta">'+escape(detail)+'</div><div>'+escape(r.alasan)+'</div><div class="n6-request-actions">'+(status==='Menunggu'?'<button type="button" class="btn-sm" data-n6-decision="Disetujui" data-id="'+escape(r.id)+'">Setujui</button><button type="button" class="btn-danger-sm" data-n6-decision="Ditolak" data-id="'+escape(r.id)+'">Tolak</button>':'')+'<button type="button" class="btn-sm" data-n6-delete="'+escape(r.id)+'">Hapus</button></div></article>'}).join(''):'<p class="n6-request-hint">Belum ada pengajuan '+kind+'.</p>';});}
 root.querySelectorAll('[data-coachpage]').forEach(btn=>{if(!kinds.includes(btn.dataset.coachpage))return;btn.addEventListener('click',()=>{root.querySelectorAll('[data-coachpage]').forEach(b=>b.classList.toggle('active',b===btn));root.querySelectorAll('[id^="coachpage-"]').forEach(p=>p.classList.toggle('active',p.id==='coachpage-'+btn.dataset.coachpage));populate();render();});});
 root.querySelectorAll('[data-n6-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form));if(data.coach==='__other'){const n=prompt('Nama coach:');if(!n||!n.trim())return;data.coach=n.trim()};if(!data.coach){alert('Pilih coach terlebih dahulu.');return};if(form.dataset.n6Form==='cuti'&&data.selesai<data.mulai){alert('Tanggal selesai tidak boleh sebelum tanggal mulai.');return};if(form.dataset.n6Form==='reschedule'&&data.baru===data.lama){alert('Jadwal pengganti harus berbeda dari jadwal lama.');return};rows.push({...data,id:'req-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),kind:form.dataset.n6Form,status:'Menunggu',created:new Date().toISOString()});save();form.reset();populate();render();}));
 root.addEventListener('click',e=>{const b=e.target.closest('[data-n6-decision],[data-n6-delete]');if(!b)return;const id=b.dataset.id||b.dataset.n6Delete;const r=rows.find(x=>x.id===id);if(!r)return;if(b.dataset.n6Delete){if(!confirm('Hapus pengajuan '+r.coach+'?'))return;rows=rows.filter(x=>x.id!==id)}else{r.status=b.dataset.n6Decision;r.decidedAt=new Date().toISOString()}save();render();});
 window.addEventListener('storage',e=>{if(e.key===key){rows=load();render()}});
 populate();render();
})();