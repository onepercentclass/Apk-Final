/**
 * N6 modules - admin / bootstrap
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderAll(){
    renderBeranda();
    renderClientList();
    renderArchive();
    renderJadwal();
    renderPriceList();
    renderTickets();
    renderMessages();
    renderCoachRoster();
    renderShareCoachOptions();
    renderDayTabs();
    renderSchedTable();
    renderCoachCalendar();
    renderCoachCalDetail();
  }

  /* ================= NAV / PANEL SWITCH ================= */
/*__N6_UNIT__*/  const panelTitles = { beranda:'Beranda', klien:'Klien', jadwalklien:'Jadwal Klien', jadwalcoach:'Jadwal Coach', harga:'Daftar Harga', tiket:'Tiket & Keluhan', pesan:'Pesan', sandi:'Ganti Password' };
/*__N6_UNIT__*/  function switchPanel(name){
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    document.querySelectorAll('.side-nav button, .bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    document.getElementById('pageTitle').textContent = panelTitles[name] || name;
    closeSidebar();
    const more=document.getElementById('n6MoreMenu');if(more)more.hidden=true;
  }
/*__N6_UNIT__*/  window.switchPanel = switchPanel;
  document.querySelectorAll('.side-nav button, .bottom-nav button').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });

/*__N6_UNIT__*/  const sidebarEl = document.getElementById('sidebar');
/*__N6_UNIT__*/  const sidebarOverlay = document.getElementById('sidebarOverlay');
/*__N6_UNIT__*/  function openSidebar(){ sidebarEl.classList.add('open'); sidebarOverlay.classList.add('show'); }
/*__N6_UNIT__*/  function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarOverlay.classList.remove('show'); }
  document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ================= SUBTABS (Klien: Aktif / Arsip) ================= */
  document.querySelectorAll('.subtab-btn[data-klienview]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-klienview]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#klienview-aktif, #klienview-arsip').forEach(p => p.classList.remove('active'));
      document.getElementById('klienview-' + btn.dataset.klienview).classList.add('active');
    });
  });

  /* ================= SUBTABS (Tiket) ================= */
  document.querySelectorAll('.subtab-btn[data-sub]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-sub]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ticketFilter = btn.dataset.sub;
      renderTickets();
    });
  });

  /* ================= SUBTABS (Jadwal Coach: Mingguan / Kalender) ================= */
  document.querySelectorAll('.subtab-btn[data-jcview]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-jcview]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#jcview-mingguan, #jcview-bulanan').forEach(p => p.classList.remove('active'));
      document.getElementById('jcview-' + btn.dataset.jcview).classList.add('active');
      if (btn.dataset.jcview === 'bulanan'){ renderCoachCalendar(); renderCoachCalDetail(); }
    });
  });
  document.getElementById('coachCalPrev').addEventListener('click', () => {
    calMonth--; if (calMonth < 0){ calMonth = 11; calYear--; }
    selectedCalDate = null; renderCoachCalendar(); renderCoachCalDetail();
  });
  document.getElementById('coachCalNext').addEventListener('click', () => {
    calMonth++; if (calMonth > 11){ calMonth = 0; calYear++; }
    selectedCalDate = null; renderCoachCalendar(); renderCoachCalDetail();
  });
  document.getElementById('coachCalToday').addEventListener('click', () => {
    calYear = todayNow.getFullYear(); calMonth = todayNow.getMonth();
    selectedCalDate = todayISO(); renderCoachCalendar(); renderCoachCalDetail();
  });

  /* ================= EVENTS ================= */
  document.getElementById('btnTambahKlien').addEventListener('click', openClientForm);
  document.getElementById('btnSaveClient').addEventListener('click', saveClientForm);
  document.getElementById('btnDownloadInvoice').addEventListener('click', () => {
    const id = document.getElementById('fClientId').value;
    if (id) downloadInvoice(id);
  });
  document.getElementById('fProgram').addEventListener('change', renderProgramFields);
  document.getElementById('fMeetings').addEventListener('input', updateConfigPriceBox);
  document.getElementById('fWeeks').addEventListener('input', updateConfigPriceBox);
  document.getElementById('btnTambahTiket').addEventListener('click', openTicketForm);
  document.getElementById('btnSaveTicket').addEventListener('click', saveTicketForm);
  document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
  document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });
  document.getElementById('templateSelect').addEventListener('change', e => {
    if (e.target.value) document.getElementById('chatInput').value = e.target.value;
  });
  document.getElementById('btnBroadcast').addEventListener('click', openBroadcast);
  document.getElementById('bTarget').addEventListener('change', e => {
    document.getElementById('bCoachWrap').style.display = e.target.value === 'coach' ? 'block' : 'none';
    updateBroadcastCount();
  });
  document.getElementById('bCoach').addEventListener('change', updateBroadcastCount);
  document.getElementById('btnSendBroadcast').addEventListener('click', sendBroadcast);
  document.getElementById('btnTambahCoach').addEventListener('click', openCoachForm);
  document.getElementById('btnSaveCoach').addEventListener('click', saveCoachForm);
  document.getElementById('btnDownloadCoachSchedule').addEventListener('click', () => {
    const coachId = document.getElementById('shareScheduleCoach').value;
    const startStr = document.getElementById('shareScheduleStart').value;
    downloadCoachScheduleImage(coachId, startStr);
  });
  document.getElementById('btnSaveSlot').addEventListener('click', saveSlot);
  document.getElementById('btnClearSlot').addEventListener('click', clearSlot);
  document.getElementById('klienSearchInput').addEventListener('input', renderClientList);
  document.getElementById('klienFilterCoach').addEventListener('change', renderClientList);
  document.getElementById('klienFilterStatus').addEventListener('change', renderClientList);
  document.getElementById('globalSearch').addEventListener('input', (e) => {
    switchPanel('klien');
    document.getElementById('klienSearchInput').value = e.target.value;
    renderClientList();
  });

  /* ================= CADANGAN + TEMA ================= */
/*__N6_UNIT__*/  const N6_KEYS=['programCatalog','coachRoster','coachSchedule','coachDayOff','clients','tickets','archivedClients'];
/*__N6_UNIT__*/  function n6StorageStatus(){
    const box=document.getElementById('n6StorageNotice');
    try{const k=STORE_PREFIX+'__test';localStorage.setItem(k,'ok');if(localStorage.getItem(k)!=='ok')throw Error('Gagal membaca ulang');localStorage.removeItem(k);box.style.display='flex';box.textContent='Penyimpanan lokal tersedia. Data hanya tersimpan pada browser dan alamat halaman ini, belum tersinkron ke perangkat lain.';}
    catch(e){box.style.display='flex';box.style.background='var(--red-tint)';box.style.color='var(--red)';box.textContent='PERINGATAN: Penyimpanan browser tidak tersedia. Jangan input data sebelum memperbaiki izin penyimpanan.';}
  }
/*__N6_UNIT__*/  function n6ExportData(){
    const records={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(STORE_PREFIX))records[k.slice(STORE_PREFIX.length)]=localStorage.getItem(k);}
    const blob=new Blob([JSON.stringify({format:'n6cs-admin-backup-v1',exportedAt:new Date().toISOString(),records},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='number-six-admin-cadangan-'+todayISO()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.getElementById('n6ImportFile').addEventListener('change',async e=>{
    const f=e.target.files[0];if(!f)return;
    try{const data=JSON.parse(await f.text());if(data.format!=='n6cs-admin-backup-v1'||!data.records||typeof data.records!=='object')throw Error('Format cadangan tidak sesuai');
      if(!confirm('Impor akan mengganti data di browser ini. Ekspor cadangan data saat ini terlebih dahulu. Lanjutkan?'))return;
      n6ExportData();
      const entries=Object.entries(data.records).filter(([k,v])=>typeof v==='string' && (N6_KEYS.includes(k)||/^(chat|reports|program):/.test(k)));
      for(const [k,v] of entries){JSON.parse(v);localStorage.setItem(STORE_PREFIX+k,v)}
      alert('Impor selesai. Halaman akan dimuat ulang.');location.reload();
    }catch(err){alert('Impor dibatalkan: '+err.message)}finally{e.target.value=''}
  });
/*__N6_UNIT__*/  const n6ThemeKey=STORE_PREFIX+'theme:v2';
/*__N6_UNIT__*/  function n6SetTheme(t){document.body.dataset.theme=t;try{localStorage.setItem(n6ThemeKey,t)}catch(e){};document.getElementById('n6ThemeBtn').textContent='♙';document.getElementById('n6ChooseLight').setAttribute('aria-pressed',String(t!=='dark'));document.getElementById('n6ChooseDark').setAttribute('aria-pressed',String(t==='dark'))}
/*__N6_UNIT__*/  function n6ToggleTheme(){n6SetTheme(document.body.dataset.theme==='dark'?'light':'dark')}
  n6SetTheme(localStorage.getItem(n6ThemeKey)==='light'?'light':'dark');
  document.getElementById('n6ThemeBtn').addEventListener('click',n6OpenAccount);
  document.getElementById('n6MobileTheme').addEventListener('click',n6OpenAccount);
/*__N6_UNIT__*/  const n6More=document.getElementById('n6MoreMenu');
  document.getElementById('n6MoreBtn').addEventListener('click',()=>{n6More.hidden=!n6More.hidden});
  n6More.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>{n6More.hidden=true;switchPanel(b.dataset.panel)}));

/* Owner-style account interface, independent of Admin business records */
const n6AccountModal=document.getElementById('n6AccountModal');
const n6AccountForm=document.getElementById('n6AccountForm');
const n6AccountLogout=document.getElementById('n6AccountLogout');
const n6AccountUser=document.getElementById('n6AccountUsername');
const n6AccountPassword=document.getElementById('n6AccountPassword');
const n6AccountSessionKey='n6csAdmin:preview-account-name';
function n6ReadAccount(){try{return sessionStorage.getItem(n6AccountSessionKey)||''}catch(e){return ''}}
function n6RenderAccount(){var me=null;try{var k=(window.N6_API||{}).userKey||'n6:api:user';me=JSON.parse(window.localStorage.getItem(k)||'null')}catch(e){}var name=me?(me.full_name||me.username):n6ReadAccount();var roleLabel=me?(' · '+(me.role||(me.tier!=null?'Tier '+me.tier:'Admin'))):'';document.getElementById('n6AccountName').textContent=name||'Admin CS';document.getElementById('n6AccountStatus').textContent=name?('Masuk'+roleLabel):'Belum masuk';n6AccountForm.hidden=!!name;n6AccountLogout.hidden=!name;}
function n6OpenAccount(){n6RenderAccount();document.getElementById('n6MoreMenu').hidden=true;n6AccountModal.classList.add('show')}
function n6CloseAccount(){n6AccountModal.classList.remove('show')}
document.getElementById('n6AccountClose').addEventListener('click',n6CloseAccount);
n6AccountModal.addEventListener('click',e=>{if(e.target===n6AccountModal)n6CloseAccount()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')n6CloseAccount()});
document.getElementById('n6ChooseLight').addEventListener('click',()=>n6SetTheme('light'));
document.getElementById('n6ChooseDark').addEventListener('click',()=>n6SetTheme('dark'));
document.getElementById('n6ShowPassword').addEventListener('click',()=>{const shown=n6AccountPassword.type==='password';n6AccountPassword.type=shown?'text':'password';document.getElementById('n6ShowPassword').textContent=shown?'Sembunyikan':'Lihat'});
n6AccountForm.addEventListener('submit',e=>{e.preventDefault();const name=n6AccountUser.value.trim();if(!name||n6AccountPassword.value.length<6)return;try{sessionStorage.setItem(n6AccountSessionKey,name)}catch(e){showToast('Sesi browser tidak tersedia');return}n6AccountPassword.value='';n6AccountPassword.type='password';document.getElementById('n6ShowPassword').textContent='Lihat';n6RenderAccount();showToast('Sesi aktif')});
n6AccountLogout.addEventListener('click',()=>{const cfg=(window.N6_API||{});if(cfg.enabled===true){try{localStorage.removeItem(cfg.tokenKey||'n6:api:token');localStorage.removeItem(cfg.refreshKey||'n6:api:refresh');localStorage.removeItem(cfg.userKey||'n6:api:user')}catch(e){}window.location.replace(window.location.pathname);return}try{sessionStorage.removeItem(n6AccountSessionKey)}catch(e){}n6AccountUser.value='';n6AccountPassword.value='';n6RenderAccount();showToast('Keluar dari sesi')});
n6RenderAccount();

  n6StorageStatus();

  
/* N6 data-driven operational indicators. This script does not mutate business records. */
const n6TargetKey=STORE_PREFIX+'indicator-targets:v1';
const n6DefaultTargets={new:10,tickets:5,messages:3,unpaid:5};
function n6Targets(){try{return {...n6DefaultTargets,...JSON.parse(localStorage.getItem(n6TargetKey)||'{}')}}catch(e){return {...n6DefaultTargets}}}
function n6ScopedClients(){const coach=document.getElementById('n6CoachFilter').value;return coach?clients.filter(c=>c.coach===coach):clients}
function n6AnalyticsData(){
 const scope=n6ScopedClients(),period=Number(document.getElementById('n6Period').value)||30;
 const now=todayISO(),start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-period+1);
 const joiners=scope.filter(c=>c.joinDate && new Date(c.joinDate+'T00:00:00')>=start && c.joinDate<=now);
 const active=scope.filter(c=>clientStatus(c)==='Aktif').length;
 const expiring=scope.filter(c=>{const end=(programCache[c.id]||{}).endDate;return end&&daysBetween(now,end)>=0&&daysBetween(now,end)<=7}).length;
 const unpaid=scope.filter(c=>c.paymentStatus&&c.paymentStatus!=='Lunas').length;
 const waiting=scope.filter(c=>{const m=lastMessage(c.id);return m&&m.sender==='client'}).length;
 const scopeIds=new Set(scope.map(c=>c.id));const relatedTickets=tickets.filter(t=>!document.getElementById('n6CoachFilter').value||scopeIds.has(t.clientId));
 const open=relatedTickets.filter(t=>t.status!=='Selesai').length;
 const paid=scope.filter(c=>c.paymentStatus==='Lunas').length;
 const billed=scope.reduce((a,c)=>a+(Number(c.price)||0),0),received=scope.reduce((a,c)=>a+(Number(c.amountPaid)||0),0);
 return {scope,period,start,joiners,active,expiring,unpaid,waiting,open,paid,billed,received};
}
function n6RenderAnalytics(){
 const sel=document.getElementById('n6CoachFilter'),previous=sel.value,names=[...new Set([...coachRoster.map(c=>c.name),...clients.map(c=>c.coach)].filter(Boolean))].sort();
 const signature=names.join('|');if(sel.dataset.names!==signature){sel.innerHTML='<option value="">Semua Coach</option>'+names.map(n=>'<option value="'+escapeHtml(n)+'">'+escapeHtml(n)+'</option>').join('');sel.value=previous;sel.dataset.names=signature}
 const d=n6AnalyticsData(),t=n6Targets(),percent=d.scope.length?Math.round(d.active/d.scope.length*100):0;
 const metrics=[['Klien baru',d.joiners.length,'Target ≥ '+t.new,d.joiners.length<t.new?'warn':'good'],['Klien aktif',d.active,percent+'% dari klien terdaftar',''],['Program berakhir ≤7 hari',d.expiring,'Perlu tindak lanjut',''],['Tiket terbuka',d.open,'Batas ≤ '+t.tickets,d.open>t.tickets?'warn':'good'],['Pesan menunggu',d.waiting,'Batas ≤ '+t.messages,d.waiting>t.messages?'warn':'good'],['Belum lunas',d.unpaid,'Batas ≤ '+t.unpaid,d.unpaid>t.unpaid?'warn':'good'],['Pembayaran lunas',d.paid,'Klien dengan status lunas',''],['Nilai paket tercatat','Rp '+d.billed.toLocaleString('id-ID'),'Total nilai paket (bukan kas masuk)','']];
 document.getElementById('n6MetricGrid').innerHTML=metrics.map(([label,value,hint,status])=>'<div class="n6-metric '+status+'"><div class="n6-label">'+label+'</div><div class="n6-value">'+value+'</div><div class="n6-hint">'+hint+'</div></div>').join('');
 const count=d.period<=7?7:d.period<=30?6:6,buckets=Array(count).fill(0),labels=[];
 for(let i=0;i<count;i++){const a=new Date(d.start);a.setDate(a.getDate()+Math.floor(i*d.period/count));const b=new Date(d.start);b.setDate(b.getDate()+Math.floor((i+1)*d.period/count));buckets[i]=d.joiners.filter(c=>{const x=new Date(c.joinDate+'T00:00:00');return x>=a&&x<b}).length;labels.push(a.toLocaleDateString('id-ID',{day:'numeric',month:'short'}))}
 const max=Math.max(1,...buckets);document.getElementById('n6SignupChart').innerHTML=buckets.map((v,i)=>'<div class="n6-bar-col"><b>'+v+'</b><i style="height:'+Math.max(3,Math.round(v/max*100))+'px"></i><small>'+labels[i]+'</small></div>').join('');
 const statuses=['Aktif','Akan Berakhir','Nonaktif'],statusCounts=statuses.map(x=>d.scope.filter(c=>clientStatus(c)===x).length);
 document.getElementById('n6StatusChart').innerHTML=statuses.map((name,i)=>'<div class="n6-status-row"><div class="n6-status-top"><span>'+name+'</span><b>'+statusCounts[i]+'</b></div><div class="n6-progress"><i style="width:'+(d.scope.length?statusCounts[i]/d.scope.length*100:0)+'%"></i></div></div>').join('');
}
function n6ExportCsv(){const d=n6AnalyticsData(),rows=[['Indikator','Nilai'],['Periode hari',d.period],['Klien baru',d.joiners.length],['Klien aktif',d.active],['Program akan berakhir',d.expiring],['Tiket terbuka',d.open],['Pesan menunggu',d.waiting],['Pembayaran belum lunas',d.unpaid],['Nilai paket tercatat',d.billed]];const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='n6-indikator-'+todayISO()+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
document.getElementById('n6Period').addEventListener('change',n6RenderAnalytics);
document.getElementById('n6CoachFilter').addEventListener('change',n6RenderAnalytics);
document.getElementById('n6Csv').addEventListener('click',n6ExportCsv);
document.getElementById('n6TargetsBtn').addEventListener('click',()=>{const p=document.getElementById('n6TargetsPanel');p.hidden=!p.hidden;if(!p.hidden){const t=n6Targets();document.getElementById('n6TargetNew').value=t.new;document.getElementById('n6TargetTickets').value=t.tickets;document.getElementById('n6TargetMessages').value=t.messages;document.getElementById('n6TargetUnpaid').value=t.unpaid}});
document.getElementById('n6SaveTargets').addEventListener('click',()=>{const v={new:Number(document.getElementById('n6TargetNew').value),tickets:Number(document.getElementById('n6TargetTickets').value),messages:Number(document.getElementById('n6TargetMessages').value),unpaid:Number(document.getElementById('n6TargetUnpaid').value)};if(Object.values(v).some(x=>!Number.isFinite(x)||x<0)){showToast('Batas harus angka positif');return}try{localStorage.setItem(n6TargetKey,JSON.stringify(v));n6RenderAnalytics();showToast('Batas indikator tersimpan')}catch(e){showToast('Batas gagal disimpan')}});
const n6OriginalRenderBeranda=renderBeranda;
renderBeranda=function(){n6OriginalRenderBeranda();n6RenderAnalytics()};

// Accept coach roster/schedule/day-off changes made in the Owner dashboard
// when both dashboards are hosted on the same origin.
function n6RefreshSharedCoachData(){
/*__N6_UNIT__*/  const read=(key,fallback)=>{try{const v=localStorage.getItem(STORE_PREFIX+key);return v===null?fallback:JSON.parse(v)}catch(e){return fallback}};
/*__N6_UNIT__*/  const roster=read('coachRoster',coachRoster),schedule=read('coachSchedule',coachSchedule),off=read('coachDayOff',coachDayOff);
  if(Array.isArray(roster))coachRoster=roster;
  if(schedule && typeof schedule==='object' && !Array.isArray(schedule))coachSchedule=schedule;
  if(off && typeof off==='object' && !Array.isArray(off))coachDayOff=off;
  populateCoachFilters();populateFormSelects();renderAll();
}
window.addEventListener('storage',e=>{
  if(['coachRoster','coachSchedule','coachDayOff'].some(k=>e.key===STORE_PREFIX+k))n6RefreshSharedCoachData();
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)n6RefreshSharedCoachData();});
/* ================= INIT ================= */
  (async function init(){
    await loadAllData();
    populateCoachFilters();
    populateFormSelects();
    renderAll();
    if (pendingArchiveNotice > 0){
      showToast(pendingArchiveNotice + ' klien nonaktif >7 hari otomatis dipindah ke Arsip');
    }
  })();
