/**
 * N6 modules - coach / absensi
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderCoachAttendance(){
    document.getElementById('periodeMulai').textContent = coachPeriode.mulai;
    document.getElementById('periodeSelesai').textContent = coachPeriode.selesai;

    // Label disesuaikan dengan status API (hadir/izin/sakit/alpha)
    setStatLabel('absensiCountHadir', 'Hadir');
    setStatLabel('absensiCountTerlambat', 'Alpha (Mangkir)');
    setStatLabel('absensiCountIzin', 'Izin / Sakit');

    const hadir = coachAttendanceList.filter(a => a.status === 'Hadir').length;
    const alpha = coachAttendanceList.filter(a => a.status === 'Alpha').length;
    const izin = coachAttendanceList.filter(a => a.status === 'Izin' || a.status === 'Sakit').length;
    document.getElementById('absensiCountHadir').textContent = hadir + 'x';
    document.getElementById('absensiCountTerlambat').textContent = alpha + 'x';
    document.getElementById('absensiCountIzin').textContent = izin + 'x';

    if (!coachAttendanceList.length){
      document.getElementById('coachAttendanceBody').innerHTML = '<div class="cal-empty">Belum ada data</div>';
      return;
    }
    document.getElementById('coachAttendanceBody').innerHTML = coachAttendanceList.map(a => `
      <div class="attendance-item">
        <div class="attendance-item-top">
          <div class="attendance-date">${a.tanggal} · ${a.sesi || ''}</div>
          <div class="attendance-badges">
            ${coachAttendanceBadge(a.status)}
            ${feedbackScoreBadge(a.feedback)}
          </div>
        </div>
        ${a.ket && a.ket !== '-' ? `<div class="attendance-comment">${a.ket}</div>` : ''}
        ${a.feedback && a.feedback.komentar ? `<div class="attendance-comment">${a.feedback.komentar}</div>` : ''}
      </div>
    `).join('');
  }

  /* ================= RENDER: KALENDER 30 HARI (REAL-TIME) ================= */
/*__N6_UNIT__*/  const DOW_LABEL = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
/*__N6_UNIT__*/  const MONTH_LABEL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
/*__N6_UNIT__*/  let selectedCalDate = null;

/*__N6_UNIT__*/  function fmtCalDate(d){
    return d.getDate() + ' ' + MONTH_LABEL[d.getMonth()] + ' ' + d.getFullYear();
  }
/*__N6_UNIT__*/  function sameDay(a,b){
    return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  }
/*__N6_UNIT__*/  function toDateKey(d){
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
/*__N6_UNIT__*/  function fmtDateKeyLabel(key){
    const [y,m,d] = key.split('-').map(Number);
    return fmtCalDate(new Date(y, m-1, d));
  }
/*__N6_UNIT__*/  function getUnavailableForDate(d){
    const key = toDateKey(d);
    return coachUnavailable.filter(u => u.tanggal === key);
  }

  /* ================= RENDER: WAKTU TIDAK BISA MENGAJAR ================= */
/*__N6_UNIT__*/  function renderUnavailableList(){
    const body = document.getElementById('unavailableBody');
    if (!coachUnavailable.length){
      body.innerHTML = `<div class="cal-empty">Belum ada waktu yang ditandai tidak tersedia.</div>`;
      return;
    }
    const sorted = [...coachUnavailable].sort((a,b) => a.tanggal.localeCompare(b.tanggal));
    body.innerHTML = sorted.map(u => `
      <div class="attendance-item">
        <div class="attendance-item-top">
          <span class="attendance-date">${fmtDateKeyLabel(u.tanggal)}</span>
          <div class="attendance-badges">
            <span class="badge amber">${u.allDay ? 'Sepanjang Hari' : (u.jamMulai + '–' + u.jamSelesai)}</span>
            <button type="button" class="att-btn tidak" title="Hapus tanda" onclick="removeUnavailable(${u.id})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        ${u.alasan ? `<div class="attendance-comment">${u.alasan}</div>` : ''}
      </div>
    `).join('');
  }

/*__N6_UNIT__*/  window.removeUnavailable = function(id){
    coachUnavailable = coachUnavailable.filter(u => u.id !== id);
    renderUnavailableList();
    renderCalendar();
    showToast('Tanda tidak tersedia dihapus');
  };

/*__N6_UNIT__*/  function renderCalendar(){
    const today = new Date();
    today.setHours(0,0,0,0);
    const horizonEnd = new Date(today); horizonEnd.setDate(horizonEnd.getDate() + 29); // 30 hari termasuk hari ini

    // mulai grid dari hari Senin minggu ini, tampilkan 6 minggu (42 hari) agar grid rapi
    const startOffset = (today.getDay() + 6) % 7; // 0 jika Senin
    const gridStart = new Date(today); gridStart.setDate(gridStart.getDate() - startOffset);

    document.getElementById('calRange').textContent =
      fmtCalDate(today) + ' — ' + fmtCalDate(horizonEnd);

    let dowHtml = DOW_LABEL.map(d => `<div class="cal-dow">${d}</div>`).join('');
    let cellsHtml = '';
    for (let i=0; i<42; i++){
      const d = new Date(gridStart); d.setDate(d.getDate() + i);
      const sessions = getSessionsForDate(d);
      const unavail = getUnavailableForDate(d);
      const isToday = sameDay(d, today);
      const inWindow = d >= today && d <= horizonEnd;
      const outside = !inWindow;
      const isSelected = selectedCalDate && sameDay(d, selectedCalDate);
      const classes = ['cal-cell'];
      if (outside) classes.push('outside');
      if (unavail.length && inWindow) classes.push('unavailable');
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      if ((sessions.length || unavail.length) && inWindow) classes.push('has-session');
      const dotsHtml = ((sessions.length || unavail.length) && inWindow) ? `<div class="dots">${
        sessions.map(()=>'<span class="dot-session"></span>').join('') +
        unavail.map(()=>'<span class="dot-unavail"></span>').join('')
      }</div>` : '';
      cellsHtml += `<div class="${classes.join(' ')}" data-date="${d.toISOString()}" onclick="selectCalDay('${d.toISOString()}')">
          <div class="num">${d.getDate()}</div>
          ${dotsHtml}
        </div>`;
    }
    document.getElementById('calGrid').innerHTML = dowHtml + cellsHtml;

    if (!selectedCalDate) selectedCalDate = today;
    renderCalDetail(selectedCalDate);
  }

/*__N6_UNIT__*/  function renderCalDetail(date){
    const sessions = getSessionsForDate(date);
    const unavail = getUnavailableForDate(date);
    const dateLabel = fmtCalDate(date);

    let html = `<h4>${dateLabel}</h4>`;

    if (unavail.length){
      html += unavail.map(u => `
        <div class="rapor-note" style="background:var(--amber-tint); color:#6B4A10; border-color:var(--amber); margin-bottom:12px;">
          <b>⛔ Tidak bisa mengajar</b> ${u.allDay ? '(Sepanjang hari)' : '(' + u.jamMulai + '–' + u.jamSelesai + ')'}${u.alasan ? ' — ' + u.alasan : ''}
        </div>`).join('');
    }

    if (!sessions.length){
      html += `<div class="cal-empty">Tidak ada jadwal latihan pada hari ini.</div>`;
    } else {
      html += `
        <table>
          <tbody>
            ${sessions.map(s => `
              <tr><td class="muted" style="width:60px;">${s.time}</td><td class="strong">${s.client}</td><td class="muted right">${s.loc}</td></tr>
            `).join('')}
          </tbody>
        </table>`;
    }

    document.getElementById('calDetail').innerHTML = html;
  }

/*__N6_UNIT__*/  window.selectCalDay = function(isoString){
    selectedCalDate = new Date(isoString);
    renderCalendar();
  };

  /* ================= RENDER: LOGS ================= */
/*__N6_UNIT__*/  function renderLogs(){
    const el = document.getElementById('logList');
    if (!logs.length){
      el.innerHTML = '<div class="cal-empty">Belum ada data</div>';
      return;
    }
    el.innerHTML = logs.map(l => `
      <div class="log-item">
        <div class="log-item-top"><span>${l.client}</span><span class="date">${l.date}</span></div>
        <div class="stats">${l.distance} · ${l.pace} · <span class="badge neutral">${l.loc || '-'}</span></div>
        <div class="note">${l.note || ''}</div>
      </div>
    `).join('');
  }

  /* ================= NAV: MAIN TABS ================= */
