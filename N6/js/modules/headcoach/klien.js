/**
 * N6 modules - headcoach / klien
 * menu label : Klien
 * minimum tier: 2
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/headcoach/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/headcoach.js. Concatenating every fragment in manifest
 * order reproduces headcoach.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__
  function buildChartConfig(key){
    if (key === 'scoreCoach') return {
      type:'bar',
      data:{ labels: chartData.coachLabels, datasets:[{ data: chartData.scoreCoach, backgroundColor: chartData.scoreCoach.map(s => s>=85?CHART_GREEN:s>=70?CHART_AMBER:CHART_RED), borderRadius:4, maxBarThickness:36 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
        scales:{ x:{grid:{display:false}, ticks:{color:CHART_ASPHALT, font:{size:11}}}, y:{beginAtZero:true, max:100, ticks:{color:CHART_ASPHALT, font:{size:11}}, grid:{color:CHART_GRID}} } }
    };
    if (key === 'kehadiranTren') return {
      type:'line',
      data:{ labels: chartData.bulanLabel, datasets:[{ data: chartData.kehadiranTren, borderColor:CHART_RED, backgroundColor:'rgba(214,40,40,0.08)', fill:true, tension:0.35, pointRadius:3, pointBackgroundColor:CHART_RED }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{callbacks:{label:(c)=>c.parsed.y+'%'}}},
        scales:{ x:{grid:{display:false}, ticks:{color:CHART_ASPHALT, font:{size:11}}}, y:{ticks:{callback:(v)=>v+'%', color:CHART_ASPHALT, font:{size:11}}, grid:{color:CHART_GRID}} } }
    };
    if (key === 'statusKlienTim') return {
      type:'doughnut',
      data:{ labels:['Normal','Bermasalah','Cedera'], datasets:[{ data:[chartData.statusKlien.normal, chartData.statusKlien.bermasalah, chartData.statusKlien.cedera], backgroundColor:[CHART_GREEN, CHART_AMBER, CHART_RED], borderWidth:0 }] },
      options:{ responsive:true, maintainAspectRatio:false, cutout:'62%', plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}, color:CHART_INK}}} }
    };
    if (key === 'ratingCoach') return {
      type:'bar',
      data:{ labels: chartData.coachLabels, datasets:[{ data: chartData.ratingCoach, backgroundColor: CHART_INK, borderRadius:4, maxBarThickness:36 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{callbacks:{label:(c)=>c.parsed.y+' / 5.0'}}},
        scales:{ x:{grid:{display:false}, ticks:{color:CHART_ASPHALT, font:{size:11}}}, y:{min:0, max:5, ticks:{color:CHART_ASPHALT, font:{size:11}}, grid:{color:CHART_GRID}} } }
    };
  }
/*__N6_UNIT__*/  function renderCoachList(){
    document.getElementById('coachListBody').innerHTML = coaches.map(c => `
      <div class="coach-card" onclick="openCoachDetail('${c.id}')">
        <div class="coach-card-top">
          <div>
            <div class="coach-card-name">${c.name}</div>
            <div class="coach-card-meta">${c.clients} klien binaan</div>
          </div>
          <span class="badge ${scoreTone(c.score)}">Score ${c.score}</span>
        </div>
        <div class="coach-card-stats">
          <div class="coach-card-stat">Kehadiran<b>${c.kehadiran}%</b></div>
          <div class="coach-card-stat">Rating Klien<b>${c.rating}</b></div>
          <div class="coach-card-stat">Klien Binaan<b>${c.clients}</b></div>
        </div>
      </div>
    `).join('');
  }
  window.openCoachDetail = function(id){
    const c = coaches.find(x => x.id === id);
    if (!c) return;
    const myClients = clients.filter(cl => cl.coach === c.name);
    document.getElementById('coachDetailTitle').textContent = c.name;
    document.getElementById('coachDetailBody').innerHTML = `
      <div class="rapor-grid">
        <div class="rapor-stat"><div class="l">Score</div><div class="v">${c.score}</div></div>
        <div class="rapor-stat"><div class="l">Kehadiran</div><div class="v">${c.kehadiran}%</div></div>
        <div class="rapor-stat"><div class="l">Rating Klien</div><div class="v">${c.rating}</div></div>
        <div class="rapor-stat"><div class="l">Klien Binaan</div><div class="v">${c.clients}</div></div>
      </div>
      <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Klien Binaan</h4>
      ${myClients.map(cl => `
        <div class="progress-row">
          <div class="progress-row-top"><span class="pname">${cl.name}</span><span class="pgoal">${cl.goal}</span></div>
          <div class="progress-note">Status: <span class="badge ${statusTone(cl.status)}" style="margin-left:4px;">${cl.status}</span>
            · <a href="${clientPortalUrl(cl.name, true)}" target="_blank" rel="noopener" style="font-weight:700; color:var(--ink);">Lihat Dashboard ↗</a>
          </div>
        </div>
      `).join('')}
      <div class="cal-empty" style="margin-top:12px;">Gunakan tab "Evaluasi" untuk memberi skor & feedback ke coach ini.</div>
    `;
    document.getElementById('coachDetailModal').classList.add('show');
  };
  window.closeCoachDetail = function(){
    document.getElementById('coachDetailModal').classList.remove('show');
  };

  /* ================= RENDER: ABSENSI TIM ================= */
/*__N6_UNIT__*/  function getCoachSessionsForDate(coachName, date){
    const dow = date.getDay(); // 0=Minggu ... 6=Sabtu
    if (coachName === "Rangga Saputra"){
      if (dow === 1) return [{ time:"06:00", client:"Budi Hartono", loc:"GBK Senayan" }];
      if (dow === 2) return [{ time:"16:00", client:"Rina Marlina", loc:"Online" }];
      if (dow === 3) return [{ time:"07:00", client:"Andi Prasetyo", loc:"GBK Senayan" }];
      if (dow === 4) return [{ time:"18:00", client:"Yoga Pratama", loc:"Online" }];
      if (dow === 5) return [{ time:"06:00", client:"Budi Hartono", loc:"GBK Senayan" }, { time:"16:00", client:"Rina Marlina", loc:"Online" }];
      if (dow === 6) return [{ time:"09:00", client:"Citra Ayu", loc:"Online" }];
      return [];
    }
    if (coachName === "Dinda Ayu"){
      if (dow === 2) return [{ time:"16:00", client:"Sari Wijaya", loc:"Online" }];
      if (dow === 4) return [{ time:"18:00", client:"Reza Firmansyah", loc:"Online" }];
      if (dow === 6) return [{ time:"10:00", client:"Sari Wijaya", loc:"Online" }];
      return [];
    }
    if (coachName === "Fajar Nugroho"){
      if (dow === 3) return [{ time:"17:00", client:"Maya Putri", loc:"Online" }];
      return [];
    }
    return [];
  }

/*__N6_UNIT__*/  function populateKlienFilter(){
    document.getElementById('klienFilterCoach').innerHTML =
      '<option value="">Semua Coach</option>' + coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }
/*__N6_UNIT__*/  function renderAllClients(){
    const filterVal = document.getElementById('klienFilterCoach').value;
    const list = filterVal ? clients.filter(c => c.coach === filterVal) : clients;
    document.getElementById('allClientsList').innerHTML = list.map(c => `
      <div class="client-row" style="cursor:pointer;" onclick="openClientDetail('${c.name.replace(/'/g,"")}')">
        <div>
          <div class="name">${c.name}</div>
          <div class="meta">Coach: ${c.coach} · Target: ${c.goal}</div>
        </div>
        <div class="client-tags"><span class="badge ${statusTone(c.status)}">${c.status}</span></div>
      </div>
    `).join('');
  }
  document.getElementById('klienFilterCoach').addEventListener('change', renderAllClients);

/*__N6_UNIT__*/  function renderFlaggedClients(){
    const flagged = clients.filter(c => c.status !== 'Normal');
    document.getElementById('flaggedClientsList').innerHTML = flagged.length ? flagged.map(c => `
      <div class="client-row" style="cursor:pointer;" onclick="openClientDetail('${c.name.replace(/'/g,"")}')">
        <div>
          <div class="name">${c.name}</div>
          <div class="meta">Coach: ${c.coach} · ${c.note || ''}</div>
        </div>
        <div class="client-tags"><span class="badge ${statusTone(c.status)}">${c.status}</span></div>
      </div>
    `).join('') : `<div class="cal-empty">Tidak ada klien bermasalah/cedera saat ini.</div>`;
  }

  /* ================= ATLET BINAAN & PRESTASI ================= */
/*__N6_UNIT__*/  function populateProgramClientSelect(){
    const el = document.getElementById('programClient');
    if (!el) return;
    el.innerHTML = '<option value="">Pilih klien tujuan</option>' +
      clients.map(c => `<option value="${c.name}">${c.name} (Coach: ${c.coach})</option>`).join('');
  }

/*__N6_UNIT__*/  const programBuildFormEl = document.getElementById('programBuildForm');
  if (programBuildFormEl){
    programBuildFormEl.addEventListener('submit', function(e){
      e.preventDefault();
      const client = document.getElementById('programClient').value;
      const tplName = document.getElementById('programNamaTpl').value.trim();
      const keterangan = document.getElementById('programKeterangan').value.trim();
      if (!client){ showToast('Pilih klien tujuan terlebih dahulu.'); return; }
      if (!tplName){ showToast('Pilih salah satu template program di atas.'); return; }
      sentPrograms.push({ id:'p' + Date.now(), client:client, tplName:tplName, keterangan:keterangan, status:'pending', at:fmtProgramTime() });
      renderSentProgramList();
      syncProgramsToStorage();
      programBuildFormEl.reset();
      selectedProgramTplIndex = null;
      renderProgramTplPickList();
      showToast('Program "' + tplName + '" terkirim ke Admin/CS untuk ' + client + '.');
    });
  }

  /* ================= CHAT INTERNAL: HEAD COACH <-> ADMIN / OWNER ================= */
/*__N6_UNIT__*/  async function loadInternalChat(role){
    if (window.storage){
      try{
        const key = 'internalchat:headcoach-' + role;
        const raw = await window.storage.get(key, true);
        if (raw && raw.value) internalChats[role] = JSON.parse(raw.value);
      }catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — memakai data lokal */ }
    }
    renderChatThread(role);
  }

  window.sendInternalChat = async function(role){
    const inputEl = document.getElementById(role === 'admin' ? 'chatInputAdmin' : 'chatInputOwner');
    const text = inputEl.value.trim();
    if (!text) return;
    const msg = { sender:'headcoach', text:text, at:new Date().toISOString() };
    internalChats[role] = internalChats[role] || [];
    internalChats[role].push(msg);
    inputEl.value = '';
    renderChatThread(role);
    if (window.storage){
      try{
        const key = 'internalchat:headcoach-' + role;
        await window.storage.set(key, JSON.stringify(internalChats[role]), true);
      }catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — pesan tetap tersimpan lokal di atas */ }
    }
    showToast('Pesan terkirim ke ' + (role === 'admin' ? 'Admin' : 'Owner') + '.');
  };

  window.openClientDetail = function(name){
    const c = clients.find(x => x.name === name);
    if (!c) return;
    document.getElementById('clientDetailTitle').textContent = c.name;
    document.getElementById('clientDetailBody').innerHTML = `
      <div class="progress-row">
        <div class="progress-row-top"><span class="pname">Coach</span><span class="pgoal">${c.coach}</span></div>
      </div>
      <div class="progress-row">
        <div class="progress-row-top"><span class="pname">Target</span><span class="pgoal">${c.goal}</span></div>
      </div>
      <div class="progress-row">
        <div class="progress-row-top"><span class="pname">Status</span><span class="badge ${statusTone(c.status)}">${c.status}</span></div>
      </div>
      ${c.note ? `<div class="rapor-note" style="margin-top:12px;"><b>Catatan:</b> ${c.note}</div>` : ''}
      <a href="${clientPortalUrl(c.name, true)}" target="_blank" rel="noopener" class="btn-outline" style="display:block; text-align:center; text-decoration:none; margin-top:16px;">Lihat Dashboard Lengkap Klien ↗</a>
    `;
    document.getElementById('clientDetailModal').classList.add('show');
  };
  window.closeClientDetail = function(){
    document.getElementById('clientDetailModal').classList.remove('show');
  };

  /* ================= RENDER: PERSETUJUAN ================= */
/*__N6_UNIT__*/  const TITLES = { hub:'Beranda',hcprogram:'Buat Program',hcmanual:'Buat Program',hcclientchat:'Chat dengan Klien',hcmonitor:'Monitoring Klien',home:'Beranda', coach:'Coach', klien:'Klien', atlet:'Atlet Binaan', koreksi:'Koreksi',  chat:'Chat Tim', akun:'Pengaturan & Akun' };
/*__N6_UNIT__*/  function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarOverlay.classList.remove('show'); }
  document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ================= INIT ================= */
  renderCoachAttention();
  renderClientAttention();
  renderCharts();
  renderTeamActivity();
  renderCoachList();
  renderTeamAttendance();
  renderTeamCalendarLegend();
  populateCalCoachFilter();
  renderTeamCalendar();
  populateEvalSelect();
  renderEvalHistory();
  populateKlienFilter();
  renderAllClients();
  renderFlaggedClients();
  populateAthleteCoachSelect();
  populateAthleteSelectsForAchv();
  renderAthleteList();
  renderPodiumSummary();
  renderAchievementList();
  renderDayTabs();
  populateCoachFilterKoreksi();
  renderSubmissionList();
  renderRescheduleApproval();
  renderCutiApproval();
  renderKoreksiTemplateList();
  populateProgramClientSelect();
  renderProgramTplPickList();
  renderProgramTemplateList();
  loadProgramsFromStorage();
  loadInternalChat('admin');
  loadInternalChat('owner');
