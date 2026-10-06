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
    const el = document.getElementById('coachAttentionList');
    if (!el) return;
    const flagged = coaches.filter(c => c.score < 75 || c.kehadiran < 85);
    el.innerHTML = flagged.length ? flagged.map(c => `
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
    const el = document.getElementById('clientAttentionList');
    if (!el) return;
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
/*__N6_UNIT__*/  function renderCharts(){
    [['chartScoreCoach','scoreCoach'],['chartKehadiranTren','kehadiranTren'],
     ['chartStatusKlienTim','statusKlienTim'],['chartRatingCoach','ratingCoach']].forEach(([id, key]) => {
      const cv = document.getElementById(id);
      if (cv) new Chart(cv, buildChartConfig(key));
    });
  }
