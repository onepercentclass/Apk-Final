/**
 * N6 modules - owner / bootstrap
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderAll(){
    renderKomisi();
    renderKeuangan();
    renderPerforma();
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
/*__N6_UNIT__*/  const panelTitles = { beranda:'Beranda', klien:'Klien', jadwalklien:'Jadwal Klien', jadwalcoach:'Jadwal Coach', harga:'Harga & Program', komisi:'Performa & Komisi', keuangan:'Keuangan', performa:'Performa Tim', tiket:'Tiket & Keluhan', pesan:'Pesan', akun:'Kelola Anggota', sandi:'Ganti Password' };
/*__N6_UNIT__*/  function switchPanel(name){
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    if(name === 'performa') name = 'komisi';
    document.getElementById('panel-' + name).classList.add('active');
    document.querySelectorAll('.side-nav button, .bottom-nav button[data-panel]').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    document.getElementById('mobileMoreBtn').classList.toggle('more-active', !['beranda','klien','jadwalklien'].includes(name));
    document.getElementById('pageTitle').textContent = panelTitles[name] || name;
    closeSidebar();
  }
/*__N6_UNIT__*/  window.switchPanel = switchPanel;
  document.querySelectorAll('.side-nav button, .bottom-nav button[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });

/*__N6_UNIT__*/  const sidebarEl = document.getElementById('sidebar');
/*__N6_UNIT__*/  const sidebarOverlay = document.getElementById('sidebarOverlay');
/*__N6_UNIT__*/  function openSidebar(){ sidebarEl.classList.add('open'); sidebarOverlay.classList.add('show'); document.getElementById('mobileMoreBtn').setAttribute('aria-expanded','true'); }
/*__N6_UNIT__*/  function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarOverlay.classList.remove('show'); document.getElementById('mobileMoreBtn').setAttribute('aria-expanded','false'); }
  document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
  document.getElementById('mobileMoreBtn').addEventListener('click', openSidebar);
  document.addEventListener('keydown', e => {if(e.key === 'Escape') closeSidebar();});
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ================= SUBTABS (Tiket) ================= */
  document.querySelectorAll('.subtab-btn[data-sub]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-sub]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ticketFilter = btn.dataset.sub;
      renderTickets();
    });
  });

  /* ================= SUBTABS (Klien: Aktif / Arsip) ================= */
  document.querySelectorAll('.subtab-btn[data-klienview]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-klienview]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#klienview-aktif, #klienview-arsip').forEach(p => p.classList.remove('active'));
      document.getElementById('klienview-' + btn.dataset.klienview).classList.add('active');
    });
  });

  /* ================= SUBTABS (Jadwal Coach: Mingguan / Kalender) ================= */
  document.getElementById('toggleCoachGuide')?.addEventListener('click',()=>{const box=document.getElementById('coachGuide'),btn=document.getElementById('toggleCoachGuide');const open=box.style.display!=='none';box.style.display=open?'none':'block';btn.textContent=open?'Lihat keterangan':'Sembunyikan keterangan';btn.setAttribute('aria-expanded',String(!open));});
  document.querySelectorAll('.subtab-btn[data-coachpage]').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.subtab-btn[data-coachpage]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('#coachpage-schedule,#coachpage-roster').forEach(p=>p.classList.remove('active'));document.getElementById('coachpage-'+btn.dataset.coachpage).classList.add('active');});});

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

  /* ================= FILTER KEUANGAN ================= */
  document.querySelectorAll('.subtab-btn[data-finfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-finfilter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      finFilterMode = btn.dataset.finfilter;
      document.getElementById('finMonthPicker').style.display = finFilterMode === 'month' ? 'inline-block' : 'none';
      if (finFilterMode === 'month' && !document.getElementById('finMonthPicker').value){
        document.getElementById('finMonthPicker').value = finSelectedMonth;
      }
      renderKeuangan();
    });
  });
  document.getElementById('finMonthPicker').addEventListener('change', e => {
    if (!e.target.value) return;
    finSelectedMonth = e.target.value;
    renderKeuangan();
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
  document.getElementById('btnSaveSlot').addEventListener('click', saveSlot);
  document.getElementById('btnClearSlot').addEventListener('click', clearSlot);
  document.getElementById('klienSearchInput').addEventListener('input', renderClientList);
  document.getElementById('klienFilterCoach').addEventListener('change', renderClientList);
  document.getElementById('klienFilterStatus').addEventListener('change', renderClientList);
  document.getElementById('btnTambahProgram').addEventListener('click', () => openProgramForm());
  document.getElementById('btnSaveProgram').addEventListener('click', saveProgramForm);
  document.getElementById('btnDeleteProgram').addEventListener('click', deleteProgramConfirm);
  document.getElementById('btnTambahPengeluaran').addEventListener('click', openExpenseForm);
  document.getElementById('btnSaveExpense').addEventListener('click', saveExpenseForm);
  document.getElementById('globalSearch').addEventListener('input', (e) => {
    switchPanel('klien');
    document.getElementById('klienSearchInput').value = e.target.value;
    renderClientList();
  });


  /* Analytics: seluruh angka berasal dari state dashboard yang sama. */
/*__N6_UNIT__*/  const ANALYTICS_COLORS=['var(--accent)','#6656ee','#3ed3a0','#f5b957','#df79cb','#6fc8ed','#97a4ff'];
/*__N6_UNIT__*/  const aMoney=n=>'Rp'+Math.round(n||0).toLocaleString('id-ID');
/*__N6_UNIT__*/  const aShort=n=>Math.abs(n)>=1e9?(n/1e9).toFixed(1)+'M':Math.abs(n)>=1e6?(n/1e6).toFixed(1)+'jt':Math.abs(n)>=1e3?(n/1e3).toFixed(0)+'rb':String(Math.round(n));
/*__N6_UNIT__*/  const aEsc=s=>escapeHtml(String(s??''));
/*__N6_UNIT__*/  function aMonths(n){const d=new Date(),out=[];for(let i=n-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push({key:x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0'),label:x.toLocaleDateString('id-ID',{month:'short',year:'2-digit'})});}return out;}
/*__N6_UNIT__*/  function aSvg(values,labels,kind){const w=700,h=245,L=55,R=12,T=20,B=36,plotW=w-L-R,plotH=h-T-B,max=Math.max(1,...values)*1.16;let out=`<svg class="analytics-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Grafik ${kind==='bar'?'jumlah klien':'pendapatan'} per bulan">`;
    for(let i=0;i<=4;i++){let y=T+plotH*i/4;out+=`<line x1="${L}" x2="${w-R}" y1="${y}" y2="${y}" stroke="var(--chart-grid)" stroke-dasharray="3 5"/><text x="${L-8}" y="${y+4}" text-anchor="end">${aShort(max*(4-i)/4)}</text>`;}
    if(kind==='bar'){const step=plotW/values.length;values.forEach((v,i)=>{const bh=v/max*plotH,x=L+i*step+step*.18,y=T+plotH-bh;out+=`<rect x="${x}" y="${y}" width="${step*.64}" height="${bh}" rx="4" fill="var(--chart-fill)"><title>${aEsc(labels[i])}: ${v} klien</title></rect>`;});}
    else{const pts=values.map((v,i)=>[L+(values.length===1?plotW/2:i*plotW/(values.length-1)),T+plotH-v/max*plotH]);const path=pts.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ');const area=path+` L${pts.at(-1)[0]} ${T+plotH} L${pts[0][0]} ${T+plotH} Z`;out+=`<defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--chart-fill)" stop-opacity=".43"/><stop offset="1" stop-color="var(--chart-fill)" stop-opacity="0"/></linearGradient></defs><path d="${area}" fill="url(#revenueFill)"/><path d="${path}" fill="none" stroke="var(--chart-fill)" stroke-width="3" stroke-linejoin="round"/>`;pts.forEach((p,i)=>out+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--chart-point)"><title>${aEsc(labels[i])}: ${aMoney(values[i])}</title></circle>`);}
    labels.forEach((label,i)=>{const x=L+(kind==='bar'?(i+.5)*plotW/labels.length:labels.length===1?plotW/2:i*plotW/(labels.length-1));out+=`<text x="${x}" y="${h-9}" text-anchor="middle">${aEsc(label)}</text>`;});return out+'</svg>';}
/*__N6_UNIT__*/  function aProgress(label,value,max,detail,color){const pct=max?Math.max(0,Math.min(100,value/max*100)):0;return `<div><div class="progress-line"><span>${aEsc(label)}</span><strong>${aEsc(detail)}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${color||'#328bff'}"></div></div></div>`;}
/*__N6_UNIT__*/  function renderAnalytics(){
    const root=document.getElementById('analyticsPeriod');if(!root)return;
    const coachSelect=document.getElementById('analyticsCoach'),old=coachSelect.value;
    coachSelect.innerHTML='<option value="">Semua Coach</option>'+coachRoster.map(c=>`<option value="${aEsc(c.name)}">${aEsc(c.name)}</option>`).join('');coachSelect.value=old;
    const coach=coachSelect.value,today=todayISO();let from=today.slice(0,8)+'01',to=today;
    if(root.value==='custom'){from=document.getElementById('analyticsFrom').value||from;to=document.getElementById('analyticsTo').value||today;if(from>to){const t=from;from=to;to=t;}}
    document.getElementById('analyticsFrom').style.display=root.value==='custom'?'inline-block':'none';document.getElementById('analyticsTo').style.display=root.value==='custom'?'inline-block':'none';
    const historyMap=new Map();[...archivedClients,...clients].forEach(c=>{if(c&&c.id!=null)historyMap.set(String(c.id),c)});const history=[...historyMap.values()];
    const selected=history.filter(c=>{const d=String(c.joinDate||'').slice(0,10);return(!coach||c.coach===coach)&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&d>=from&&d<=to;});
    const months=[];let [yy,mm]=from.slice(0,7).split('-').map(Number),[ey,em]=to.slice(0,7).split('-').map(Number);while(yy<ey||(yy===ey&&mm<=em)){months.push({key:yy+'-'+String(mm).padStart(2,'0'),label:new Date(yy,mm-1,1).toLocaleDateString('id-ID',{month:'short',year:'2-digit'})});if(++mm>12){mm=1;yy++;}}
    const revenues=months.map(m=>selected.filter(c=>c.joinDate.slice(0,7)===m.key).reduce((s,c)=>s+(Number(c.price)||0),0)),counts=months.map(m=>selected.filter(c=>c.joinDate.slice(0,7)===m.key).length),sum=revenues.reduce((a,b)=>a+b,0);
    document.getElementById('analyticsRevenueTotal').textContent=aMoney(sum);document.getElementById('analyticsClientTotal').textContent=selected.length+' pendaftaran';
    document.getElementById('revenueChart').innerHTML=sum?aSvg(revenues,months.map(m=>m.label),'line')+'<p class="mini-note">Pendapatan per bulan dalam rentang yang dipilih.</p>':'<div class="analytics-empty">Belum ada pendapatan pada rentang ini.</div>';
    document.getElementById('growthChart').innerHTML=selected.length?aSvg(counts,months.map(m=>m.label),'bar')+'<p class="mini-note">Pendaftaran baru per bulan dalam rentang yang dipilih.</p>':'<div class="analytics-empty">Belum ada pendaftaran pada rentang ini.</div>';
    const cats=[...new Set(programCatalog.map(p=>p.category).filter(Boolean))],groups=cats.map(cat=>{const ids=new Set(programCatalog.filter(p=>p.category===cat).map(p=>p.id));return{label:cat,value:selected.filter(c=>ids.has(c.programId)).reduce((s,c)=>s+(Number(c.price)||0),0)}});const known=new Set(programCatalog.map(p=>p.id)),other=selected.filter(c=>!known.has(c.programId)).reduce((s,c)=>s+(Number(c.price)||0),0);if(other)groups.push({label:'Lainnya',value:other});const positive=groups.filter(g=>g.value>0);let cumulative=0;const gradient=positive.map((g,i)=>{let st=cumulative/sum*100;cumulative+=g.value;return`${ANALYTICS_COLORS[i%ANALYTICS_COLORS.length]} ${st}% ${cumulative/sum*100}%`}).join(',');
    document.getElementById('analyticsPrograms').innerHTML=sum?`<div class="donut-layout"><div class="donut-graphic" style="background:conic-gradient(${gradient})"><div class="donut-hole">${aShort(sum)}<small>Total pendapatan</small></div></div><div class="donut-legend">${positive.map((g,i)=>`<div><span><i class="legend-dot" style="background:${ANALYTICS_COLORS[i%ANALYTICS_COLORS.length]}"></i>${aEsc(g.label)}</span><strong>${(g.value/sum*100).toFixed(1)}%</strong></div>`).join('')}</div></div>`:'<div class="analytics-empty">Belum ada pendapatan pada rentang ini.</div>';
    const coaches=(coach?coachRoster.filter(c=>c.name===coach):coachRoster).map(c=>({name:c.name,count:selected.filter(x=>x.coach===c.name).length})).sort((a,b)=>b.count-a.count),maxCoach=Math.max(1,...coaches.map(c=>c.count));document.getElementById('analyticsCoaches').innerHTML=coaches.length?`<div class="analytics-progress">${coaches.map((c,i)=>aProgress(c.name,c.count,maxCoach,c.count+' klien',ANALYTICS_COLORS[i%ANALYTICS_COLORS.length])).join('')}</div>`:'<div class="analytics-empty">Belum ada coach terdaftar.</div>';
    const commission=selected.reduce((s,c)=>s+clientCommissionAmount(c),0),periodExpenses=expenses.filter(e=>e.date&&e.date>=from&&e.date<=to),exp=coach?null:periodExpenses.reduce((s,e)=>s+(Number(e.amount)||0),0),net=coach?null:sum-commission-exp;
    document.getElementById('analyticsFinance').innerHTML=`<div class="analytics-progress">${aProgress('Pendapatan',sum,Math.max(sum,commission,exp||0,1),aMoney(sum),'var(--chart-fill)')}${aProgress('Komisi final coach',commission,Math.max(sum,commission,exp||0,1),aMoney(commission),'#7869ff')}${coach?'<p class="mini-note">Pengeluaran umum dan laba bersih hanya ditampilkan pada filter Semua Coach agar tidak salah dialokasikan.</p>':aProgress('Pengeluaran lainnya',exp,Math.max(sum,commission,exp||0,1),aMoney(exp),'#f5b957')+`<div class="analytics-kpi"><small>Estimasi laba bersih periode ini</small><strong>${aMoney(net)}</strong></div>`}</div>`;
    const allSelected=clients.filter(c=>!coach||c.coach===coach),active=allSelected.filter(c=>clientStatus(c)==='Aktif').length,ending=allSelected.filter(c=>clientStatus(c)==='Akan Berakhir').length,total=allSelected.length,open=tickets.filter(t=>t.status!=='Selesai').length,done=tickets.filter(t=>t.status==='Selesai').length;
    document.getElementById('analyticsOperations').innerHTML=`<div class="analytics-progress">${aProgress('Klien aktif',active,total,active+' / '+total,'#3ed3a0')}${aProgress('Program akan berakhir',ending,total,ending+' klien','#f5b957')}${aProgress('Tiket selesai',done,open+done,done+' / '+(open+done),'#328bff')}${aProgress('Pesan menunggu balasan',waitingReplyCount(),Math.max(1,clients.length),waitingReplyCount()+' pesan','#a389ff')}</div><p class="mini-note">Operasional menggunakan kondisi terkini dashboard.</p>`;
    if(typeof window.renderBusinessHealth==='function')window.renderBusinessHealth({sum,newClients:selected.length,commission,active,ending,open,waiting:waitingReplyCount(),coach});
  }
/*__N6_UNIT__*/  window.n6RefreshAnalytics=renderAnalytics;
  document.getElementById('analyticsPeriod').addEventListener('change',()=>{if(document.getElementById('analyticsPeriod').value==='custom'){const t=todayISO(),d=new Date(),f=new Date(d.getFullYear(),d.getMonth(),1);document.getElementById('analyticsFrom').value=document.getElementById('analyticsFrom').value||f.toISOString().slice(0,10);document.getElementById('analyticsTo').value=document.getElementById('analyticsTo').value||t;}renderAnalytics();});
  document.getElementById('analyticsFrom').addEventListener('change',renderAnalytics);document.getElementById('analyticsTo').addEventListener('change',renderAnalytics);
  document.getElementById('analyticsCoach').addEventListener('change',renderAnalytics);
  document.getElementById('analyticsExport').addEventListener('click',()=>{const mode=document.getElementById('analyticsPeriod').value,today=todayISO();let from=mode==='current'?today.slice(0,8)+'01':document.getElementById('analyticsFrom').value,to=mode==='current'?today:document.getElementById('analyticsTo').value;if(!from||!to){showToast('Tentukan rentang tanggal terlebih dahulu');return;}if(from>to){const t=from;from=to;to=t;}const coach=document.getElementById('analyticsCoach').value,history=new Map();[...archivedClients,...clients].forEach(c=>{if(c&&c.id!=null)history.set(String(c.id),c)});const rows=[['Tanggal','Bulan','Coach','Pendaftaran','Pendapatan','Estimasi Komisi']];[...history.values()].filter(c=>(!coach||c.coach===coach)&&c.joinDate>=from&&c.joinDate<=to).forEach(c=>rows.push([c.joinDate,c.joinDate.slice(0,7),coach||c.coach||'—',1,Number(c.price)||0,clientCommissionAmount(c)]));const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));link.download='number-six-analytics.csv';link.click();URL.revokeObjectURL(link.href);});
/*__N6_UNIT__*/  const originalRenderBeranda=renderBeranda;renderBeranda=function(){originalRenderBeranda();renderAnalytics();};

  // Refresh from Admin CS after edits in another tab; never replace Owner client data.
/*__N6_UNIT__*/  async function refreshSharedCoachSchedule(){
    const read = (key,fallback) => {try{const raw=localStorage.getItem(N6_ADMIN_PREFIX+key);return raw===null?fallback:JSON.parse(raw)}catch(e){return fallback}};
    const newRoster=read('coachRoster',coachRoster),newSchedule=read('coachSchedule',coachSchedule),newOff=read('coachDayOff',coachDayOff);
    if(Array.isArray(newRoster))coachRoster=newRoster;
    if(newSchedule && typeof newSchedule==='object' && !Array.isArray(newSchedule))coachSchedule=newSchedule;
    if(newOff && typeof newOff==='object' && !Array.isArray(newOff))coachDayOff=newOff;
    populateCoachFilters();populateFormSelects();renderAll();
    const status=document.getElementById('n6SyncStatus');
    if(status)status.textContent='Terakhir diperbarui: '+new Date().toLocaleTimeString('id-ID')+' · '+coachRoster.length+' coach · sinkronisasi satu browser & alamat situs.';
  }
  document.getElementById('n6SyncRefresh')?.addEventListener('click',refreshSharedCoachSchedule);
  window.addEventListener('storage',e=>{if(e.key && N6_SHARED_COACH_KEYS.has(e.key.slice(N6_ADMIN_PREFIX.length)) && e.key.startsWith(N6_ADMIN_PREFIX))refreshSharedCoachSchedule();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSharedCoachSchedule();});
  /* ================= INIT ================= */
  document.getElementById('btnDownloadCoachSchedule').addEventListener('click', async ()=>{
    const btn=document.getElementById('btnDownloadCoachSchedule');
    const coachId=document.getElementById('shareScheduleCoach').value;
    if(!coachId){showToast('Pilih coach terlebih dahulu');return;}
    btn.disabled=true;
    try{await downloadCoachScheduleImage(coachId,document.getElementById('shareScheduleStart').value);}
    catch(err){console.error('Gagal mengunduh jadwal:',err);showToast('Gagal membuat JPG jadwal. Silakan coba lagi.');}
    finally{btn.disabled=false;}
  });
  document.getElementById('shareScheduleStart').value=todayISO();
  (async function init(){
    await loadAllData();
    await refreshSharedCoachSchedule();
    populateCoachFilters();
    populateFormSelects();
    renderAll();
    if (pendingArchiveNotice > 0){
      showToast(pendingArchiveNotice + ' klien nonaktif >10 hari otomatis dipindah ke Arsip');
    }
  })();
