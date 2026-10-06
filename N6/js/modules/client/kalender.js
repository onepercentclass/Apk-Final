/**
 * N6 modules - client / kalender
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  const dowLabels = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
/*__N6_UNIT__*/  function renderCalendar(){
    const grid = document.getElementById('calGrid');
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    document.getElementById('calMonthLabel').textContent = monthNames[calMonth] + ' ' + calYear;
    let html = dowLabels.map(d => '<div class="cal-dow">' + d + '</div>').join('');
    const firstDay = new Date(calYear, calMonth, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const todayStr = todayISO();
    for (let i = 0; i < startOffset; i++) html += '<div class="cal-cell empty"></div>';
    for (let d = 1; d <= daysInMonth; d++){
      const dateStr = calYear + '-' + String(calMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      const hasReport = !!reports[dateStr];
      const hasScore = !!scores[dateStr];
      let cls = 'cal-cell';
      if (hasReport) cls += ' has-report';
      if (hasScore) cls += ' has-score';
      if (dateStr === todayStr) cls += ' today';
      let inner = '<span class="num">' + d + '</span>';
      if (hasScore) inner += '<span class="score-badge">' + scores[dateStr].score + '</span>';
      html += '<div class="' + cls + '" data-date="' + dateStr + '">' + inner + '</div>';
    }
    grid.innerHTML = html;
    grid.querySelectorAll('.cal-cell[data-date]').forEach(cell => {
      const dateStr = cell.dataset.date;
      if (reports[dateStr] || scores[dateStr]){
        cell.addEventListener('click', () => showDayDetail(dateStr));
      }
    });
  }

/*__N6_UNIT__*/  function showDayDetail(dateStr){
    const el = document.getElementById('dayDetail');
    const r = reports[dateStr], s = scores[dateStr];
    let html = '<h4>' + dateStr + '</h4>';
    html += r ? ('<p>Link: ' + (r.link ? '<a href="' + r.link + '" target="_blank" rel="noopener">buka link</a>' : '-') + '</p><p>Keterangan: ' + (r.issue || 'tidak ada masalah') + '</p>')
              : '<p>Belum ada laporan tanggal ini.</p>';
    html += s ? ('<p>Skor: ' + s.score + '/100' + (s.note ? ' — ' + s.note : '') + '</p>' + (s.evidenceLink ? '<p>Bukti: <a href="' + s.evidenceLink + '" target="_blank" rel="noopener">buka link</a></p>' : ''))
              : '<p>Coach belum mengisi skor tanggal ini.</p>';
    el.innerHTML = html;
    el.classList.add('show');
  }

