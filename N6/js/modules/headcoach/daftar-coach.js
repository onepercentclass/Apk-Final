/**
 * N6 modules - headcoach / daftar-coach
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderCoachList(){
    const el = document.getElementById('coachListBody');
    if (!coaches.length){ el.innerHTML = '<div class="cal-empty">Belum ada data coach.</div>'; return; }
    el.innerHTML = coaches.map(c => `
      <div class="coach-card" onclick="openCoachDetail('${c.id}')">
        <div class="coach-card-top">
          <div>
            <div class="coach-card-name">${c.name}</div>
            <div class="coach-card-meta">${c.clients} klien binaan</div>
          </div>
          <span class="badge ${c.score === null ? 'neutral' : scoreTone(c.score)}">Score ${fmtStat(c.score)}</span>
        </div>
        <div class="coach-card-stats">
          <div class="coach-card-stat">Kehadiran<b>${fmtStat(c.kehadiran, '%')}</b></div>
          <div class="coach-card-stat">Rating Klien<b>${fmtStat(c.rating)}</b></div>
          <div class="coach-card-stat">Klien Binaan<b>${c.clients}</b></div>
        </div>
      </div>
    `).join('');
  }
/*__N6_UNIT__*/  window.openCoachDetail = function(id){
    const c = coaches.find(x => String(x.id) === String(id));
    if (!c) return;
    const myClients = clients.filter(cl => cl.coach === c.name);
    document.getElementById('coachDetailTitle').textContent = c.name;
    document.getElementById('coachDetailBody').innerHTML = `
      <div class="rapor-grid">
        <div class="rapor-stat"><div class="l">Score</div><div class="v">${fmtStat(c.score)}</div></div>
        <div class="rapor-stat"><div class="l">Kehadiran</div><div class="v">${fmtStat(c.kehadiran, '%')}</div></div>
        <div class="rapor-stat"><div class="l">Rating Klien</div><div class="v">${fmtStat(c.rating)}</div></div>
        <div class="rapor-stat"><div class="l">Klien Binaan</div><div class="v">${c.clients}</div></div>
      </div>
      <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Klien Binaan</h4>
      ${myClients.length ? myClients.map(cl => `
        <div class="progress-row">
          <div class="progress-row-top"><span class="pname">${cl.name}</span><span class="pgoal">${cl.goal}</span></div>
          <div class="progress-note">Status: <span class="badge ${statusTone(cl.status)}" style="margin-left:4px;">${cl.status}</span>
            · <a href="${clientPortalUrl(cl.name, true)}" target="_blank" rel="noopener" style="font-weight:700; color:var(--ink);">Lihat Dashboard ↗</a>
          </div>
        </div>
      `).join('') : '<div class="cal-empty">Belum ada klien binaan.</div>'}
      <div class="cal-empty" style="margin-top:12px;">Gunakan tab "Evaluasi" untuk memberi skor & feedback ke coach ini.</div>
    `;
    document.getElementById('coachDetailModal').classList.add('show');
  };
/*__N6_UNIT__*/  window.closeCoachDetail = function(){
    document.getElementById('coachDetailModal').classList.remove('show');
  };

  /* ================= RENDER: ABSENSI TIM ================= */
/*__N6_UNIT__*/  function renderTeamAttendance(){
    const el = document.getElementById('teamAttendanceBody');
    if (!teamAttendance.length){ el.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    el.innerHTML = teamAttendance.map(a => `
      <div class="attendance-item">
        <div class="attendance-item-top">
          <div class="attendance-date">${a.tanggal} <span style="font-weight:400; color:var(--asphalt);">— ${a.coach}${a.client && a.client !== '-' ? ' · ' + a.client : ''}</span></div>
          <div class="attendance-badges"><span class="badge ${statusTone(a.status)}">${a.status}</span></div>
        </div>
      </div>
    `).join('');
  }

  /* ================= RENDER: KALENDER TIM (READ-ONLY) ================= */
/*__N6_UNIT__*/  const COACH_COLOR_PALETTE = ["#D62828", "#2563AE", "#B7791F", "#1E8E3E", "#7B2D8E", "#0E7C7B"];
/*__N6_UNIT__*/  function coachColor(name){
    const i = coaches.findIndex(c => c.name === name);
    return COACH_COLOR_PALETTE[(i < 0 ? 0 : i) % COACH_COLOR_PALETTE.length];
  }

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

/*__N6_UNIT__*/  function getTeamSessionsForDate(date){
    const result = [];
    coaches.forEach(c => {
      getCoachSessionsForDate(c.name, date).forEach(s => result.push({ coach: c.name, ...s }));
    });
    return result;
  }

/*__N6_UNIT__*/  function getFilteredTeamSessionsForDate(date){
    const filterEl = document.getElementById('calCoachFilter');
    const filter = filterEl ? filterEl.value : '';
    const all = getTeamSessionsForDate(date);
    return filter ? all.filter(s => s.coach === filter) : all;
  }

/*__N6_UNIT__*/  function populateCalCoachFilter(){
    const el = document.getElementById('calCoachFilter');
    if (!el) return;
    el.innerHTML = '<option value="">Semua Coach</option>' + coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    el.addEventListener('change', renderTeamCalendar);
  }

/*__N6_UNIT__*/  const DOW_LABEL = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
/*__N6_UNIT__*/  const MONTH_LABEL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
/*__N6_UNIT__*/  let selectedTeamCalDate = null;

/*__N6_UNIT__*/  function fmtCalDate(d){ return d.getDate() + ' ' + MONTH_LABEL[d.getMonth()] + ' ' + d.getFullYear(); }
/*__N6_UNIT__*/  function sameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

/*__N6_UNIT__*/  function renderTeamCalendarLegend(){
    document.getElementById('calLegendTeam').innerHTML = coaches.map(c => `
      <span><span class="dot" style="background:${coachColor(c.name)};"></span>${c.name.split(' ')[0]}</span>
    `).join('');
  }

/*__N6_UNIT__*/  function renderTeamCalendar(){
    const today = new Date(); today.setHours(0,0,0,0);
    const horizonEnd = new Date(today); horizonEnd.setDate(horizonEnd.getDate() + 29);
    const startOffset = (today.getDay() + 6) % 7;
    const gridStart = new Date(today); gridStart.setDate(gridStart.getDate() - startOffset);

    document.getElementById('calRange').textContent = fmtCalDate(today) + ' — ' + fmtCalDate(horizonEnd);

    let dowHtml = DOW_LABEL.map(d => `<div class="cal-dow">${d}</div>`).join('');
    let cellsHtml = '';
    for (let i=0; i<42; i++){
      const d = new Date(gridStart); d.setDate(d.getDate() + i);
      const sessions = getFilteredTeamSessionsForDate(d);
      const isToday = sameDay(d, today);
      const inWindow = d >= today && d <= horizonEnd;
      const outside = !inWindow;
      const isSelected = selectedTeamCalDate && sameDay(d, selectedTeamCalDate);
      const classes = ['cal-cell'];
      if (outside) classes.push('outside');
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      if (sessions.length && inWindow) classes.push('has-session');
      const uniqueCoaches = [...new Set(sessions.map(s => s.coach))];
      const dotsHtml = (uniqueCoaches.length && inWindow)
        ? `<div class="dots">${uniqueCoaches.map(c => `<span style="background:${coachColor(c)};"></span>`).join('')}</div>`
        : '';
      cellsHtml += `<div class="${classes.join(' ')}" onclick="selectTeamCalDay('${d.toISOString()}')">
          <div class="num">${d.getDate()}</div>
          ${dotsHtml}
        </div>`;
    }
    document.getElementById('calGrid').innerHTML = dowHtml + cellsHtml;

    if (!selectedTeamCalDate) selectedTeamCalDate = today;
    renderTeamCalDetail(selectedTeamCalDate);
  }

/*__N6_UNIT__*/  function renderTeamCalDetail(date){
    const sessions = getFilteredTeamSessionsForDate(date);
    const dateLabel = fmtCalDate(date);
    if (!sessions.length){
      document.getElementById('calDetail').innerHTML = `<h4>${dateLabel}</h4><div class="cal-empty">Tidak ada jadwal latihan tim pada hari ini.</div>`;
      return;
    }
    document.getElementById('calDetail').innerHTML = `
      <h4>${dateLabel}</h4>
      <table>
        <tbody>
          ${sessions.map(s => `
            <tr>
              <td class="muted" style="width:56px;">${s.time}</td>
              <td class="strong">${s.client}</td>
              <td class="muted">${s.loc}</td>
              <td class="right"><span class="badge neutral" style="border-left:3px solid ${coachColor(s.coach)}; padding-left:8px;">${s.coach}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  }

/*__N6_UNIT__*/  window.selectTeamCalDay = function(isoString){
    selectedTeamCalDate = new Date(isoString);
    renderTeamCalendar();
  };

  /* ================= RENDER: EVALUASI ================= */
/*__N6_UNIT__*/  function populateEvalSelect(){
    document.getElementById('evalCoach').innerHTML =
      '<option value="">Pilih coach</option>' + coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }
