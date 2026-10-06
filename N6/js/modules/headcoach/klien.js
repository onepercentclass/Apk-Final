/**
 * N6 modules - headcoach / klien
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderEvalHistory(){
    const el = document.getElementById('evalHistoryList');
    // Fase 3: belum ada endpoint evaluasi — tampilkan data yang diinput user sesi ini, atau empty state.
    if (!evalHistory.length){ el.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    el.innerHTML = evalHistory.map(e => `
      <div class="review-item">
        <div class="review-item-top"><span class="who">${e.coach}</span><span class="when">${e.tanggal}</span></div>
        <div class="stats"><span class="badge ${scoreTone(e.score)}">Score ${e.score}</span></div>
        <div class="note">${e.komentar}</div>
      </div>
    `).join('');
  }
  document.getElementById('evalForm').addEventListener('submit', function(e){
    e.preventDefault();
    const coach = document.getElementById('evalCoach').value;
    const score = document.getElementById('evalScore').value.trim();
    const komentar = document.getElementById('evalKomentar').value.trim();
    if (!coach || !score || !komentar) return;
    evalHistory.unshift({ coach, tanggal:'Baru saja', score: Number(score), komentar });
    renderEvalHistory();
    this.reset();
    showToast('Feedback berhasil dikirim ke ' + coach);
  });

  /* ================= RENDER: KLIEN ================= */
/*__N6_UNIT__*/  function populateKlienFilter(){
    document.getElementById('klienFilterCoach').innerHTML =
      '<option value="">Semua Coach</option>' + coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }
/*__N6_UNIT__*/  function renderAllClients(){
    const filterEl = document.getElementById('klienFilterCoach');
    const filterVal = filterEl ? filterEl.value : '';
    const listEl = document.getElementById('allClientsList');
    if (!clients.length){ listEl.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    const list = filterVal ? clients.filter(c => c.coach === filterVal) : clients;
    if (!list.length){ listEl.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    listEl.innerHTML = list.map(c => `
      <div class="client-row" style="cursor:pointer;" onclick="openClientDetail(${c.id})">
        <div>
          <div class="name">${c.name}</div>
          <div class="meta">Coach: ${c.coach} · Target: ${c.goal}</div>
        </div>
        <div class="client-tags"><span class="badge ${statusTone(c.status)}">${c.status}</span></div>
      </div>
    `).join('');
  }
/*__N6_UNIT__*/  const klienFilterEl = document.getElementById('klienFilterCoach');
  if (klienFilterEl) klienFilterEl.addEventListener('change', renderAllClients);

/*__N6_UNIT__*/  function renderFlaggedClients(){
    const el = document.getElementById('flaggedClientsList');
    if (!clients.length){ el.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    const flagged = clients.filter(c => c.status !== 'Normal');
    el.innerHTML = flagged.length ? flagged.map(c => `
      <div class="client-row" style="cursor:pointer;" onclick="openClientDetail(${c.id})">
        <div>
          <div class="name">${c.name}</div>
          <div class="meta">Coach: ${c.coach} · ${c.note || ''}</div>
        </div>
        <div class="client-tags"><span class="badge ${statusTone(c.status)}">${c.status}</span></div>
      </div>
    `).join('') : `<div class="cal-empty">Tidak ada klien bermasalah/cedera saat ini.</div>`;
  }

  /* ================= ATLET BINAAN & PRESTASI ================= */
/*__N6_UNIT__*/  let athletes = [];   // Tidak ada endpoint — user kelola manual via UI
/*__N6_UNIT__*/  let athleteIdCounter = 1;

/*__N6_UNIT__*/  let achievements = [];   // Tidak ada endpoint — user kelola manual via UI
/*__N6_UNIT__*/  let achievementIdCounter = 1;

/*__N6_UNIT__*/  function posisiTone(posisi){
    if (posisi === 'Juara 1') return 'green';
    if (posisi === 'Juara 2') return 'blue';
    if (posisi === 'Juara 3') return 'amber';
    if (posisi === 'DNF') return 'red';
    return 'neutral';
  }

/*__N6_UNIT__*/  function athleteStats(athleteId){
    const list = achievements.filter(a => a.athleteId === athleteId);
    return {
      total: list.length,
      juara1: list.filter(a => a.posisi === 'Juara 1').length,
      juara2: list.filter(a => a.posisi === 'Juara 2').length,
      juara3: list.filter(a => a.posisi === 'Juara 3').length,
    };
  }

/*__N6_UNIT__*/  function renderPodiumSummary(){
    const ranked = athletes.map(a => ({ athlete:a, stats:athleteStats(a.id) }))
      .sort((x, y) => (y.stats.juara1*3 + y.stats.juara2*2 + y.stats.juara3) - (x.stats.juara1*3 + x.stats.juara2*2 + x.stats.juara3))
      .slice(0, 3);
    const labels = ['🥇 Terbanyak Juara', '🥈 Peringkat 2', '🥉 Peringkat 3'];
    document.getElementById('podiumSummary').innerHTML = ranked.length ? ranked.map((r, i) => `
      <div class="podium-card">
        <div class="rank">${labels[i] || ('Peringkat ' + (i+1))}</div>
        <div class="name">${r.athlete.name}</div>
        <div class="cnt">${r.stats.total} prestasi</div>
        <div style="font-size:11px; color:var(--asphalt); margin-top:4px;">🥇${r.stats.juara1} · 🥈${r.stats.juara2} · 🥉${r.stats.juara3}</div>
      </div>
    `).join('') : '<div class="cal-empty">Belum ada data atlet.</div>';
  }
