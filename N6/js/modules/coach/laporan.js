/**
 * N6 modules - coach / laporan
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderReschedule(){
    const body = document.getElementById('rescheduleBody');
    if (!rescheduleRequests.length){
      body.innerHTML = '<tr><td colspan="4" class="muted" style="text-align:center; padding:24px 0;">Belum ada data</td></tr>';
      return;
    }
    body.innerHTML = rescheduleRequests.map(r => `
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
    const body = document.getElementById('cutiBody');
    if (!cutiRequests.length){
      body.innerHTML = '<tr><td colspan="4" class="muted" style="text-align:center; padding:24px 0;">Belum ada data</td></tr>';
      return;
    }
    body.innerHTML = cutiRequests.map(c => `
      <tr>
        <td class="strong">${c.mulai}</td>
        <td class="muted">${c.selesai}</td>
        <td class="muted">${c.alasan || '-'}</td>
        <td class="right">${statusBadgeGeneric(c.status)}</td>
      </tr>
    `).join('');
  }

  /* ================= RENDER: ABSENSI COACH ================= */
/*__N6_UNIT__*/  function coachAttendanceBadge(status){
    const s = String(status || '');
    let tone = 'blue';
    if (s === 'Hadir' || s === 'Tepat Waktu') tone = 'green';
    else if (s === 'Alpha') tone = 'red';
    else if (s === 'Terlambat' || s === 'Izin' || s === 'Sakit') tone = 'amber';
    return `<span class="badge ${tone}">${status}</span>`;
  }
/*__N6_UNIT__*/  function feedbackScoreBadge(feedback){
    if (!feedback) return `<span class="badge neutral">Menunggu Review</span>`;
    const tone = feedback.score >= 85 ? 'green' : feedback.score >= 70 ? 'amber' : 'red';
    return `<span class="badge ${tone}">Score ${feedback.score}</span>`;
  }
/*__N6_UNIT__*/  function setStatLabel(valueId, text){
    const v = document.getElementById(valueId);
    const card = v && v.closest('.stat-card');
    const lab = card && card.querySelector('.label');
    if (lab) lab.textContent = text;
  }
