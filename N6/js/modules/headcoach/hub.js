/**
 * N6 modules - headcoach / hub
 * menu label : Beranda
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
  function renderCoachAttention(){
    const flagged = coaches.filter(c => c.score < 75 || c.kehadiran < 85);
    document.getElementById('coachAttentionList').innerHTML = flagged.length ? flagged.map(c => `
      <div class="attention-item">
        <div class="attention-dot ${c.score < 70 ? 'red' : 'amber'}"></div>
        <div class="attention-body">
          <div class="name">${c.name}</div>
          <div class="desc">Score ${c.score} · Kehadiran ${c.kehadiran}% — perlu pembinaan lebih lanjut.</div>
        </div>
      </div>
    `).join('') : `<div class="cal-empty">Semua coach dalam performa baik.</div>`;
  }

/*__N6_UNIT__*/  function renderClientAttention(){
    const flagged = clients.filter(c => c.status !== 'Normal');
    document.getElementById('clientAttentionList').innerHTML = flagged.length ? flagged.map(c => `
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
    document.getElementById('teamActivityList').innerHTML = teamActivityList.map(a => `
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
/*__N6_UNIT__*/  function renderCharts(){
    new Chart(document.getElementById('chartScoreCoach'), buildChartConfig('scoreCoach'));
    new Chart(document.getElementById('chartKehadiranTren'), buildChartConfig('kehadiranTren'));
    new Chart(document.getElementById('chartStatusKlienTim'), buildChartConfig('statusKlienTim'));
    new Chart(document.getElementById('chartRatingCoach'), buildChartConfig('ratingCoach'));
  }
