/**
 * N6 modules - headcoach / atlet
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__

  function populateAthleteCoachSelect(){
    document.getElementById('athCoach').innerHTML = '<option value="">Coach pembina</option>' +
      coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

/*__N6_UNIT__*/  function populateAthleteSelectsForAchv(){
    const opts = '<option value="">Pilih atlet</option>' + athletes.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    document.getElementById('achAthlete').innerHTML = opts;
    document.getElementById('filterAthleteAchv').innerHTML = '<option value="">Semua Atlet</option>' +
      athletes.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  }

/*__N6_UNIT__*/  function renderAthleteList(){
    const body = document.getElementById('athleteList');
    if (!athletes.length){ body.innerHTML = '<div class="cal-empty">Belum ada atlet binaan. Tambahkan atlet pertama Anda.</div>'; return; }
    body.innerHTML = athletes.map(a => {
      const s = athleteStats(a.id);
      return `
      <div class="athlete-card">
        <div>
          <div class="athlete-card-name">${a.name}</div>
          <div class="athlete-card-meta">${a.kategori} · Coach: ${a.coach}</div>
          ${a.catatan ? `<div class="athlete-card-meta" style="margin-top:6px;">${a.catatan}</div>` : ''}
          <div class="athlete-card-stats">
            <div class="athlete-card-stat">Total Lomba<b>${s.total}</b></div>
            <div class="athlete-card-stat">Juara 1<b>${s.juara1}</b></div>
            <div class="athlete-card-stat">Juara 2<b>${s.juara2}</b></div>
            <div class="athlete-card-stat">Juara 3<b>${s.juara3}</b></div>
          </div>
        </div>
        <div class="athlete-card-actions">
          <button class="icon-btn" onclick="viewAthleteAchievements('${a.id}')" title="Lihat Prestasi">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="icon-btn" onclick="openAthleteModal('${a.id}')" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn danger" onclick="deleteAthlete('${a.id}')" title="Hapus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');
  }

/*__N6_UNIT__*/  window.viewAthleteAchievements = function(athleteId){
    document.querySelector('#panel-atlet .subtab-btn[data-sub="prestasi"]').click();
    document.getElementById('filterAthleteAchv').value = athleteId;
    renderAchievementList();
  };

/*__N6_UNIT__*/  function fmtAchvDate(tanggal){
    if (!tanggal) return '-';
    const [y,m,d] = tanggal.split('-');
    return parseInt(d,10) + ' ' + MONTH_LABEL[parseInt(m,10)-1] + ' ' + y;
  }

/*__N6_UNIT__*/  function renderAchievementList(){
    const filter = document.getElementById('filterAthleteAchv').value;
    let list = achievements.slice();
    if (filter) list = list.filter(a => a.athleteId === filter);
    list.sort((a,b) => b.tanggal.localeCompare(a.tanggal));
    const body = document.getElementById('achievementList');
    if (!list.length){ body.innerHTML = '<div class="cal-empty">Belum ada prestasi tercatat.</div>'; return; }
    body.innerHTML = list.map(ac => {
      const athlete = athletes.find(a => a.id === ac.athleteId);
      return `
      <div class="achv-item">
        <div class="achv-top">
          <span class="who">${athlete ? athlete.name : '(atlet dihapus)'}</span>
          <span class="badge ${posisiTone(ac.posisi)}">${ac.posisi}</span>
        </div>
        <div class="achv-event">${ac.event}${ac.kategori ? ' — ' + ac.kategori : ''}</div>
        <div class="achv-meta">${fmtAchvDate(ac.tanggal)}${ac.waktu ? ' · Waktu: ' + ac.waktu : ''}</div>
        ${ac.catatan ? `<div class="achv-note">${ac.catatan}</div>` : ''}
        <div class="achv-actions" style="margin-top:8px;">
          <button class="icon-btn" onclick="openAchievementModal('${ac.id}')" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn danger" onclick="deleteAchievement('${ac.id}')" title="Hapus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');
  }
  document.getElementById('filterAthleteAchv').addEventListener('change', renderAchievementList);

/*__N6_UNIT__*/  let athleteEditingId = null;
/*__N6_UNIT__*/  window.openAthleteModal = function(id){
    athleteEditingId = id;
    const a = id ? athletes.find(x => x.id === id) : null;
    document.getElementById('athleteModalTitle').textContent = a ? 'Edit Atlet' : 'Tambah Atlet';
    document.getElementById('athName').value = a ? a.name : '';
    document.getElementById('athKategori').value = a ? a.kategori : '';
    document.getElementById('athCoach').value = a ? a.coach : '';
    document.getElementById('athCatatan').value = a ? a.catatan || '' : '';
    document.getElementById('athleteModal').classList.add('show');
  };
/*__N6_UNIT__*/  window.closeAthleteModal = function(){ document.getElementById('athleteModal').classList.remove('show'); };
  document.getElementById('athleteForm').addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('athName').value.trim();
    const kategori = document.getElementById('athKategori').value;
    const coach = document.getElementById('athCoach').value;
    const catatan = document.getElementById('athCatatan').value.trim();
    if (!name || !kategori || !coach) return;
    if (athleteEditingId){
      const a = athletes.find(x => x.id === athleteEditingId);
      Object.assign(a, { name, kategori, coach, catatan });
    } else {
      athletes.push({ id:'a' + (athleteIdCounter++), name, kategori, coach, catatan });
    }
    closeAthleteModal();
    renderAthleteList();
    renderPodiumSummary();
    populateAthleteSelectsForAchv();
    showToast('Data atlet disimpan.');
  });
/*__N6_UNIT__*/  window.deleteAthlete = function(id){
    athletes = athletes.filter(a => a.id !== id);
    achievements = achievements.filter(a => a.athleteId !== id);
    renderAthleteList();
    renderPodiumSummary();
    populateAthleteSelectsForAchv();
    renderAchievementList();
    showToast('Atlet & riwayat prestasinya dihapus.');
  };

/*__N6_UNIT__*/  let achievementEditingId = null;
/*__N6_UNIT__*/  window.openAchievementModal = function(id){
    achievementEditingId = id;
    const ac = id ? achievements.find(x => x.id === id) : null;
    document.getElementById('achievementModalTitle').textContent = ac ? 'Edit Prestasi' : 'Catat Prestasi';
    document.getElementById('achAthlete').value = ac ? ac.athleteId : (document.getElementById('filterAthleteAchv').value || '');
    document.getElementById('achEvent').value = ac ? ac.event : '';
    document.getElementById('achTanggal').value = ac ? ac.tanggal : '';
    document.getElementById('achKategori').value = ac ? ac.kategori || '' : '';
    document.getElementById('achPosisi').value = ac ? ac.posisi : '';
    document.getElementById('achWaktu').value = ac ? ac.waktu || '' : '';
    document.getElementById('achCatatan').value = ac ? ac.catatan || '' : '';
    document.getElementById('achievementModal').classList.add('show');
  };
/*__N6_UNIT__*/  window.closeAchievementModal = function(){ document.getElementById('achievementModal').classList.remove('show'); };
  document.getElementById('achievementForm').addEventListener('submit', function(e){
    e.preventDefault();
    const athleteId = document.getElementById('achAthlete').value;
    const event = document.getElementById('achEvent').value.trim();
    const tanggal = document.getElementById('achTanggal').value;
    const kategori = document.getElementById('achKategori').value.trim();
    const posisi = document.getElementById('achPosisi').value;
    const waktu = document.getElementById('achWaktu').value.trim();
    const catatan = document.getElementById('achCatatan').value.trim();
    if (!athleteId || !event || !tanggal || !posisi) return;
    if (achievementEditingId){
      const ac = achievements.find(x => x.id === achievementEditingId);
      Object.assign(ac, { athleteId, event, tanggal, kategori, posisi, waktu, catatan });
    } else {
      achievements.push({ id:'ac' + (achievementIdCounter++), athleteId, event, tanggal, kategori, posisi, waktu, catatan });
    }
    closeAchievementModal();
    renderAchievementList();
    renderAthleteList();
    renderPodiumSummary();
    showToast('Prestasi disimpan.');
  });
/*__N6_UNIT__*/  window.deleteAchievement = function(id){
    achievements = achievements.filter(a => a.id !== id);
    renderAchievementList();
    renderAthleteList();
    renderPodiumSummary();
    showToast('Data prestasi dihapus.');
  };

  /* ================= RENDER: HASIL LATIHAN KLIEN (antrian harian, skalabel) ================= */
