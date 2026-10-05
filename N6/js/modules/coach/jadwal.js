/**
 * N6 modules - coach / jadwal
 * menu label : Absensi
 * minimum tier: 3
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/coach/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/coach.js. Concatenating every fragment in manifest
 * order reproduces coach.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__
  function attendanceButtons(idx, current){
    return `
      <div class="att-btns">
        <button class="att-btn hadir ${current==='hadir'?'active':''}" title="Hadir" onclick="markAttendance(${idx}, 'hadir')">${ICONS.hadir}</button>
        <button class="att-btn tidak ${current==='tidak'?'active':''}" title="Tidak Hadir" onclick="markAttendance(${idx}, 'tidak')">${ICONS.tidak}</button>
        <button class="att-btn izin ${current==='izin'?'active':''}" title="Izin" onclick="markAttendance(${idx}, 'izin')">${ICONS.izin}</button>
      </div>`;
  }
/*__N6_UNIT__*/  function renderSchedule(){
    const rowsHtml = schedule.map((s, i) => `
      <tr>
        <td class="muted">${s.time}</td>
        <td class="strong">${s.client}</td>
        <td class="muted">${s.loc}</td>
        <td>${statusBadge(s.status)}</td>
        <td class="right">${attendanceButtons(i, s.attendance)}</td>
      </tr>
    `).join('');
    document.getElementById('scheduleBodyHome').innerHTML = rowsHtml;
    document.getElementById('scheduleBodyAbsensi').innerHTML = rowsHtml;
  }
  window.markAttendance = function(idx, value){
    schedule[idx].attendance = schedule[idx].attendance === value ? null : value;
    if (schedule[idx].attendance === 'hadir') schedule[idx].status = 'Selesai';
    renderSchedule();
    showToast(schedule[idx].attendance ? ('Absensi ' + schedule[idx].client + ' dicatat') : 'Absensi dibatalkan');
  };

  /* ================= RENDER: JADWAL PERTEMUAN TERDEKAT ================= */
/*__N6_UNIT__*/  function renderReschedule(){
    document.getElementById('rescheduleBody').innerHTML = rescheduleRequests.map(r => `
      <tr>
        <td class="strong">${r.sesi}</td>
        <td class="muted">${r.baru}</td>
        <td class="muted">${r.alasan || '-'}</td>
        <td class="right">${statusBadgeGeneric(r.status)}</td>
      </tr>
    `).join('');
  }

  /* ================= RENDER: CUTI ================= */
/*__N6_UNIT__*/  function renderCuti(){
    document.getElementById('cutiBody').innerHTML = cutiRequests.map(c => `
      <tr>
        <td class="strong">${c.mulai}</td>
        <td class="muted">${c.selesai}</td>
        <td class="muted">${c.alasan || '-'}</td>
        <td class="right">${statusBadgeGeneric(c.status)}</td>
      </tr>
    `).join('');
  }

  /* ================= RENDER: ABSENSI COACH ================= */
/*__N6_UNIT__*/  function renderCoachAttendance(){
    document.getElementById('periodeMulai').textContent = coachPeriode.mulai;
    document.getElementById('periodeSelesai').textContent = coachPeriode.selesai;

    const tepat = coachAttendanceList.filter(a => a.status === 'Tepat Waktu').length;
    const terlambat = coachAttendanceList.filter(a => a.status === 'Terlambat').length;
    const berjalan = coachAttendanceList.filter(a => a.status === 'Latihan Sedang Berjalan').length;
    document.getElementById('absensiCountHadir').textContent = tepat + 'x';
    document.getElementById('absensiCountTerlambat').textContent = terlambat + 'x';
    document.getElementById('absensiCountIzin').textContent = berjalan + 'x';

    document.getElementById('coachAttendanceBody').innerHTML = coachAttendanceList.map(a => `
      <div class="attendance-item">
        <div class="attendance-item-top">
          <div class="attendance-date">${a.tanggal}</div>
          <div class="attendance-badges">
            ${coachAttendanceBadge(a.status)}
            ${feedbackScoreBadge(a.feedback)}
          </div>
        </div>
        ${a.feedback && a.feedback.komentar ? `<div class="attendance-comment">${a.feedback.komentar}</div>` : ''}
      </div>
    `).join('');
  }

  /* ================= RENDER: KALENDER 30 HARI (REAL-TIME) ================= */
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

  window.removeUnavailable = function(id){
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

  window.selectCalDay = function(isoString){
    selectedCalDate = new Date(isoString);
    renderCalendar();
  };

  /* ================= RENDER: LOGS ================= */
/*__N6_UNIT__*/  function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarOverlay.classList.remove('show'); }
  document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ================= NAV: SUB TABS ================= */
  document.querySelectorAll('.subtabs').forEach(group => {
    const groupName = group.getAttribute('data-group');
    const section = group.closest('.panel');
    const btns = group.querySelectorAll('.subtab-btn');
    const subpanels = section.querySelectorAll('.subpanel');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        subpanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(groupName + '-' + btn.getAttribute('data-sub')).classList.add('active');
      });
    });
  });

  /* ================= FORM: LOG LATIHAN ================= */
  document.getElementById('logForm').addEventListener('submit', function(e){
    e.preventDefault();
    const client = document.getElementById('logClient').value;
    const loc = document.getElementById('logLokasi').value;
    const jarak = document.getElementById('logJarak').value.trim();
    const pace = document.getElementById('logPace').value.trim();
    const catatan = document.getElementById('logCatatan').value.trim();
    if (!client || !loc || !jarak || !pace) return;
    logs.unshift({ client, date:'Baru saja', distance: jarak + ' km', pace: pace + '/km', loc, note: catatan });
    renderLogs();
    this.reset();
    showToast('Log latihan tersimpan');
  });

  /* ================= FORM: RESCHEDULE ================= */
  document.getElementById('rescheduleForm').addEventListener('submit', function(e){
    e.preventDefault();
    const sesi = document.getElementById('rsSesi').value;
    const tanggal = document.getElementById('rsTanggal').value;
    const jam = document.getElementById('rsJam').value.trim();
    const alasan = document.getElementById('rsAlasan').value.trim();
    if (!sesi || !tanggal || !jam) return;
    rescheduleRequests.unshift({ sesi, baru: tanggal + ', ' + jam, alasan, status:'Menunggu' });
    renderReschedule();
    this.reset();
    showToast('Pengajuan reschedule terkirim');
  });

  /* ================= FORM: CUTI ================= */
  document.getElementById('cutiForm').addEventListener('submit', function(e){
    e.preventDefault();
    const mulai = document.getElementById('cutiMulai').value;
    const selesai = document.getElementById('cutiSelesai').value;
    const alasan = document.getElementById('cutiAlasan').value.trim();
    if (!mulai || !selesai) return;
    cutiRequests.unshift({ mulai, selesai, alasan, status:'Menunggu' });
    renderCuti();
    this.reset();
    showToast('Pengajuan cuti terkirim');
  });

  /* ================= FORM: WAKTU TIDAK BISA MENGAJAR ================= */
  document.getElementById('uaSepanjangHari').addEventListener('change', function(){
    const jamMulai = document.getElementById('uaJamMulai');
    const jamSelesai = document.getElementById('uaJamSelesai');
    jamMulai.disabled = this.checked;
    jamSelesai.disabled = this.checked;
    if (this.checked){ jamMulai.value = ''; jamSelesai.value = ''; }
  });

  document.getElementById('unavailableForm').addEventListener('submit', function(e){
    e.preventDefault();
    const tanggal = document.getElementById('uaTanggal').value;
    const allDay = document.getElementById('uaSepanjangHari').checked;
    const jamMulai = document.getElementById('uaJamMulai').value.trim();
    const jamSelesai = document.getElementById('uaJamSelesai').value.trim();
    const alasan = document.getElementById('uaAlasan').value.trim();
    if (!tanggal){ showToast('Pilih tanggal terlebih dahulu'); return; }
    if (!allDay && (!jamMulai || !jamSelesai)){ showToast('Isi jam mulai & selesai, atau centang Sepanjang Hari'); return; }
    coachUnavailable.push({
      id: unavailIdSeq++, tanggal, allDay,
      jamMulai: allDay ? '' : jamMulai,
      jamSelesai: allDay ? '' : jamSelesai,
      alasan
    });
    this.reset();
    document.getElementById('uaJamMulai').disabled = false;
    document.getElementById('uaJamSelesai').disabled = false;
    renderUnavailableList();
    renderCalendar();
    showToast('Waktu tidak tersedia ditandai — Admin akan melihatnya di kalender');
  });

  /* ================= FORM: ABSENSI COACH (self check-in ke Admin) ================= */
  document.getElementById('coachAttendanceForm').addEventListener('submit', function(e){
    e.preventDefault();
    const sesi = document.getElementById('acSesi').value;
    const status = document.getElementById('acStatus').value;
    const catatan = document.getElementById('acCatatan').value.trim();
    if (!sesi || !status) return;
    const today = new Date();
    const tanggal = today.getDate() + ' ' + ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][today.getMonth()] + ' ' + today.getFullYear();
    coachAttendanceList.unshift({ tanggal, sesi, status, ket: catatan || '-', feedback: null });
    renderCoachAttendance();
    this.reset();
    showToast('Absensi terkirim ke Admin, menunggu review');
  });

  /* ================= RAPOR PDF EXPORT ================= */
