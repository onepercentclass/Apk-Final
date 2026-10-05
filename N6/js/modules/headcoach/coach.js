/**
 * N6 modules - headcoach / coach
 * menu label : Coach
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
  function renderTeamAttendance(){
    document.getElementById('teamAttendanceBody').innerHTML = teamAttendance.map(a => `
      <div class="attendance-item">
        <div class="attendance-item-top">
          <div class="attendance-date">${a.tanggal} <span style="font-weight:400; color:var(--asphalt);">— ${a.coach}</span></div>
          <div class="attendance-badges"><span class="badge ${statusTone(a.status)}">${a.status}</span></div>
        </div>
      </div>
    `).join('');
  }

  /* ================= RENDER: KALENDER TIM (READ-ONLY) ================= */
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

/*__N6_UNIT__*/  function renderTeamCalendarLegend(){
    document.getElementById('calLegendTeam').innerHTML = coaches.map(c => `
      <span><span class="dot" style="background:${COACH_COLORS[c.name]};"></span>${c.name.split(' ')[0]}</span>
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
        ? `<div class="dots">${uniqueCoaches.map(c => `<span style="background:${COACH_COLORS[c]};"></span>`).join('')}</div>`
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
              <td class="right"><span class="badge neutral" style="border-left:3px solid ${COACH_COLORS[s.coach]}; padding-left:8px;">${s.coach}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  }

  window.selectTeamCalDay = function(isoString){
    selectedTeamCalDate = new Date(isoString);
    renderTeamCalendar();
  };

  /* ================= RENDER: EVALUASI ================= */
/*__N6_UNIT__*/  function populateEvalSelect(){
    document.getElementById('evalCoach').innerHTML =
      '<option value="">Pilih coach</option>' + coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }
/*__N6_UNIT__*/  function renderEvalHistory(){
    document.getElementById('evalHistoryList').innerHTML = evalHistory.map(e => `
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
