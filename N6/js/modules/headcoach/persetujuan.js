/**
 * N6 modules - headcoach / persetujuan
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderRescheduleApproval(){
    const el = document.getElementById('rescheduleApprovalList');
    if (!rescheduleRequests.length){ el.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    el.innerHTML = rescheduleRequests.map((r, i) => `
      <div class="review-item">
        <div class="review-item-top"><span class="who">${r.coach}</span><span class="when">${statusTag(r.status)}</span></div>
        <div class="stats">${r.sesi} → <b>${r.baru}</b></div>
        <div class="note">${r.alasan || '-'}</div>
        ${r.status === 'Menunggu' ? `
          <div class="action-btns">
            <button class="btn-approve" onclick="setRescheduleStatus(${i},'Disetujui')">Setujui</button>
            <button class="btn-reject" onclick="setRescheduleStatus(${i},'Ditolak')">Tolak</button>
          </div>` : ''}
      </div>
    `).join('');
  }
/*__N6_UNIT__*/  function statusTag(status){ return `<span class="badge ${statusTone(status)}">${status}</span>`; }
/*__N6_UNIT__*/  window.setRescheduleStatus = function(i, status){
    rescheduleRequests[i].status = status;
    renderRescheduleApproval();
    showToast('Reschedule ' + rescheduleRequests[i].coach + ' ditandai: ' + status);
  };

/*__N6_UNIT__*/  function renderCutiApproval(){
    // Fase 3: belum ada endpoint cuti — tampilkan empty state, bukan data dummy.
    document.getElementById('cutiApprovalList').innerHTML =
      '<div class="cal-empty">Belum ada data.</div>';
  }
/*__N6_UNIT__*/  window.setCutiStatus = function(i, status){
    if (cutiRequests[i]) cutiRequests[i].status = status;
    renderCutiApproval();
  };

  /* ================= NAV: MAIN TABS ================= */
