/**
 * N6 modules - headcoach / hub
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderAll(){
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
  }

  /* ================= HELPERS ================= */
/*__N6_UNIT__*/  function scoreTone(score){ return score >= 85 ? 'green' : score >= 70 ? 'amber' : 'red'; }
/*__N6_UNIT__*/  function statusTone(status){
    if (status === 'Normal') return 'green';
    if (status === 'Bermasalah') return 'amber';
    if (status === 'Cedera') return 'red';
    if (status === 'Tepat Waktu') return 'green';
    if (status === 'Terlambat') return 'amber';
    if (status === 'Latihan Sedang Berjalan') return 'blue';
    if (status === 'Disetujui') return 'green';
    if (status === 'Ditolak') return 'red';
    return 'neutral';
  }
/*__N6_UNIT__*/  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
/*__N6_UNIT__*/  window.showToast = showToast;
/*__N6_UNIT__*/  function escapeHtmlHC(str){
    return String(str == null ? '' : str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  /* ================= RENDER: HOME ================= */
/*__N6_UNIT__*/  function fmtStat(v, suffix){ return (v === null || v === undefined) ? '-' : (v + (suffix || '')); }

/*__N6_UNIT__*/  function renderCoachAttention(){
    const el = document.getElementById('coachAttentionList');
    if (!el) return;
    if (!coaches.length){ el.innerHTML = '<div class="cal-empty">Belum ada data coach.</div>'; return; }
    const withScore = coaches.filter(c => c.score !== null && c.score !== undefined);
    if (!withScore.length){ el.innerHTML = '<div class="cal-empty">Belum ada data performa coach.</div>'; return; }
    const flagged = withScore.filter(c => c.score < 75 || (c.kehadiran !== null && c.kehadiran < 85));
    el.innerHTML = flagged.length ? flagged.map(c => `
      <div class="attention-item">
        <div class="attention-dot ${c.score < 70 ? 'red' : 'amber'}"></div>
        <div class="attention-body">
          <div class="name">${c.name}</div>
          <div class="desc">Score ${c.score} · Kehadiran ${fmtStat(c.kehadiran, '%')} — perlu pembinaan lebih lanjut.</div>
        </div>
      </div>
    `).join('') : `<div class="cal-empty">Semua coach dalam performa baik.</div>`;
  }

/*__N6_UNIT__*/  function renderClientAttention(){
    const el = document.getElementById('clientAttentionList');
    if (!el) return;
    if (!clients.length){ el.innerHTML = '<div class="cal-empty">Belum ada data klien.</div>'; return; }
    const flagged = clients.filter(c => c.status !== 'Normal');
    el.innerHTML = flagged.length ? flagged.map(c => `
      <div class="attention-item">
        <div class="attention-dot ${c.status === 'Cedera' ? 'red' : 'amber'}"></div>
        <div class="attention-body">
          <div class="name">${c.name} <span style="font-weight:400; color:var(--asphalt);">— Coach: ${c.coach}</span></div>
          <div class="desc">${c.note || c.status}</div>
        </div>
      </div>
    `).join('') : `<div class="cal-empty">Tidak ada klien bermasalah/cedera saat ini.</div>`;
  }

/*__N6_UNIT__*/  function renderTeamActivity(){
    const el = document.getElementById('teamActivityList');
    if (!el) return;
    if (!teamActivityList.length){
      el.innerHTML = '<div class="cal-empty">Belum ada aktivitas tim.</div>';
      return;
    }
    el.innerHTML = teamActivityList.map(a => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-body">
          <div class="act">${a.text}</div>
          <div class="date">${a.date}</div>
        </div>
      </div>
    `).join('');
  }

  /* ================= CHARTS ================= */
/*__N6_UNIT__*/  const CHART_RED = '#D62828', CHART_INK = '#111110', CHART_ASPHALT = '#6E6C64',
        CHART_GREEN = '#1E8E3E', CHART_AMBER = '#B7791F', CHART_GRID = '#F0EEE7';

/*__N6_UNIT__*/  function buildChartConfig(key){
    if (key === 'scoreCoach') return {
      type:'bar',
      data:{ labels: chartData.coachLabels, datasets:[{ data: chartData.scoreCoach, backgroundColor: chartData.scoreCoach.map(s => s == null ? '#D8D5CC' : (s>=85?CHART_GREEN:s>=70?CHART_AMBER:CHART_RED)), borderRadius:4, maxBarThickness:36 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
        scales:{ x:{grid:{display:false}, ticks:{color:CHART_ASPHALT, font:{size:11}}}, y:{beginAtZero:true, max:100, ticks:{color:CHART_ASPHALT, font:{size:11}}, grid:{color:CHART_GRID}} } }
    };
    if (key === 'kehadiranTren') return {
      type:'line',
      data:{ labels: chartData.bulanLabel, datasets:[{ data: chartData.kehadiranTren, borderColor:CHART_RED, backgroundColor:'rgba(214,40,40,0.08)', fill:true, tension:0.35, pointRadius:3, pointBackgroundColor:CHART_RED }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{callbacks:{label:(c)=>(c.parsed.y == null ? '-' : c.parsed.y)+'%'}}},
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
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{callbacks:{label:(c)=>(c.parsed.y == null ? '-' : c.parsed.y)+' / 5.0'}}},
        scales:{ x:{grid:{display:false}, ticks:{color:CHART_ASPHALT, font:{size:11}}}, y:{min:0, max:5, ticks:{color:CHART_ASPHALT, font:{size:11}}, grid:{color:CHART_GRID}} } }
    };
  }
/*__N6_UNIT__*/  function renderCharts(){
    // Elemen chart legacy sudah dihapus dari DOM — skip bila tidak ada.
    [['chartScoreCoach','scoreCoach'],['chartKehadiranTren','kehadiranTren'],
     ['chartStatusKlienTim','statusKlienTim'],['chartRatingCoach','ratingCoach']].forEach(([id, key]) => {
      const cv = document.getElementById(id);
      if (cv) new Chart(cv, buildChartConfig(key));
    });
  }
/*__N6_UNIT__*/  let chartModalInstance = null;
/*__N6_UNIT__*/  window.openChartModal = function(key, title){
    document.getElementById('chartModalTitle').textContent = title;
    document.getElementById('chartModal').classList.add('show');
    if (chartModalInstance){ chartModalInstance.destroy(); chartModalInstance = null; }
    chartModalInstance = new Chart(document.getElementById('chartModalCanvas'), buildChartConfig(key));
  };
/*__N6_UNIT__*/  window.closeChartModal = function(){
    document.getElementById('chartModal').classList.remove('show');
    if (chartModalInstance){ chartModalInstance.destroy(); chartModalInstance = null; }
  };

  /* ================= RENDER: COACH LIST + DETAIL ================= */
