/**
 * N6 modules - headcoach / koreksi
 * menu label : Koreksi
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
  function renderDayTabs(){
    document.getElementById('dayTabs').innerHTML = koreksiWeekDates.map((d, i) => {
      const pendingCount = submissions.filter(s => s.dayIndex === i && !s.reviewed).length;
      const classes = ['day-tab-btn'];
      if (i === selectedDayIndex) classes.push('active');
      if (i === todayIndex) classes.push('today');
      return `
      <button class="${classes.join(' ')}" onclick="selectKoreksiDay(${i})">
        <span class="dname">${DAY_NAMES[i]}${pendingCount ? ' <span class="badge red" style="margin-left:4px; padding:1px 6px;">'+pendingCount+'</span>' : ''}</span>
        <span class="ddate">${d.getDate()} ${MONTH_LABEL[d.getMonth()].slice(0,3)}</span>
      </button>`;
    }).join('');
  }

/*__N6_UNIT__*/  function populateCoachFilterKoreksi(){
    document.getElementById('filterCoachKoreksi').innerHTML =
      '<option value="">Semua Coach</option>' + coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

/*__N6_UNIT__*/  function renderSubmissionList(){
    const coachFilter = document.getElementById('filterCoachKoreksi').value;
    const onlyPending = document.getElementById('onlyPendingToggle').checked;

    let list = submissions.filter(s => s.dayIndex === selectedDayIndex);
    if (coachFilter) list = list.filter(s => s.coach === coachFilter);
    const totalToday = list.length;
    const pendingCount = list.filter(s => !s.reviewed).length;
    const reviewedCount = totalToday - pendingCount;
    if (onlyPending) list = list.filter(s => !s.reviewed);

    document.getElementById('countPending').textContent = pendingCount;
    document.getElementById('countReviewed').textContent = reviewedCount;
    document.getElementById('countTotal').textContent = totalToday;

    const d = koreksiWeekDates[selectedDayIndex];
    document.getElementById('submissionListTitle').textContent =
      DAY_NAMES[selectedDayIndex] + ', ' + d.getDate() + ' ' + MONTH_LABEL[d.getMonth()] + ' ' + d.getFullYear();

    if (!list.length){
      document.getElementById('submissionList').innerHTML = `<div class="cal-empty">${onlyPending ? 'Semua hasil latihan hari ini sudah direview.' : 'Belum ada hasil latihan yang masuk untuk hari ini.'}</div>`;
      return;
    }

    document.getElementById('submissionList').innerHTML = list.map(s => `
      <div class="submission-item">
        <div class="submission-top">
          <div>
            <div class="submission-name">${s.client}</div>
            <div class="submission-meta">Coach: ${s.coach} · Lokasi: ${s.loc}</div>
          </div>
          <span class="badge ${s.reviewed ? 'green' : 'amber'}">${s.reviewed ? 'Sudah Direview' : 'Menunggu Review'}</span>
        </div>
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-top:4px;">
          <a class="week-review-link" href="${s.link}" target="_blank" rel="noopener" style="margin-top:0;">${s.link}</a>
          <a href="${clientPortalUrl(s.client, true)}" target="_blank" rel="noopener" style="font-size:11.5px; font-weight:700; color:var(--ink); white-space:nowrap;">Buka Dashboard Klien ↗</a>
        </div>
        ${s.reviewed
          ? `<div class="week-review-note"><b>Koreksi terkirim ke klien:</b> ${s.koreksi || '-'}</div>`
          : `<div class="correction-row" style="flex-direction:column; align-items:stretch;">
              <textarea class="correction-input" id="koreksi-${s.id}" placeholder="Tulis koreksi untuk klien di sini... (kolom ini bisa diisi keterangan panjang)"></textarea>
              <div class="tpl-chip-row">
                ${koreksiTemplates.map(t => `<button type="button" class="tpl-chip" onclick="applyTemplateToField('koreksi-${s.id}','${t.code}')">${t.code ? `<span class="code">${t.code}</span>` : ''}${t.label}</button>`).join('')}
              </div>
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:2px;">
                <input type="text" id="koreksicode-${s.id}" placeholder="Kode" style="width:76px; padding:7px 9px; font-size:12px;">
                <button type="button" class="btn-outline" style="margin-top:0; padding:7px 12px; font-size:11.5px;" onclick="applyTemplateCode('koreksi-${s.id}','koreksicode-${s.id}')">Terapkan Kode</button>
                <button class="btn-approve" style="margin-left:auto;" onclick="reviewSubmission(${s.id})">Tandai Direview &amp; Kirim</button>
              </div>
            </div>`}
      </div>
    `).join('');
  }

  window.selectKoreksiDay = function(i){
    selectedDayIndex = i;
    renderDayTabs();
    renderSubmissionList();
  };
  window.reviewSubmission = async function(id){
    const item = submissions.find(s => s.id === id);
    if (!item) return;
    const input = document.getElementById('koreksi-' + id);
    item.koreksi = input ? input.value.trim() : '';
    item.reviewed = true;
    renderDayTabs();
    renderSubmissionList();

    // Kirim koreksi ke thread chat klien (storage sama yang dipakai portal klien: chat:<clientId>)
    if (item.koreksi && window.storage){
      try{
        const key = 'chat:' + item.clientId;
        let existing = [];
        try{
          const raw = await window.storage.get(key, true);
          existing = raw && raw.value ? JSON.parse(raw.value) : [];
        }catch(e){ existing = []; }
        existing.push({ sender:'coach', text: item.koreksi, at: new Date().toISOString() });
        await window.storage.set(key, JSON.stringify(existing), true);
      }catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — koreksi tetap tersimpan lokal di atas */ }
    }

    showToast('Hasil latihan ' + item.client + ' ditandai direview' + (item.koreksi ? ' & koreksi terkirim ke chat klien' : ''));
  };
  document.getElementById('filterCoachKoreksi').addEventListener('change', renderSubmissionList);
  document.getElementById('onlyPendingToggle').addEventListener('change', renderSubmissionList);

  /* ================= TEMPLATE KATA KOREKSI: APPLY & CRUD ================= */
  window.applyTemplateToField = function(fieldId, code){
    const tpl = koreksiTemplates.find(t => t.code === code);
    const field = document.getElementById(fieldId);
    if (!tpl || !field) return;
    field.value = tpl.text;
    field.focus();
  };
  window.applyTemplateCode = function(fieldId, codeFieldId){
    const codeField = document.getElementById(codeFieldId);
    const code = codeField ? codeField.value.trim() : '';
    if (!code){ showToast('Masukkan kode template terlebih dahulu.'); return; }
    const tpl = koreksiTemplates.find(t => t.code === code);
    if (!tpl){ showToast('Kode template "' + code + '" tidak ditemukan.'); return; }
    const field = document.getElementById(fieldId);
    if (field){ field.value = tpl.text; field.focus(); }
    if (codeField) codeField.value = '';
  };

/*__N6_UNIT__*/  function renderKoreksiTemplateList(){
    const body = document.getElementById('koreksiTemplateList');
    if (!body) return;
    if (!koreksiTemplates.length){ body.innerHTML = '<div class="cal-empty">Belum ada template. Tambahkan template pertama Anda.</div>'; return; }
    body.innerHTML = koreksiTemplates.map((t, i) => `
      <div class="tpl-manage-item">
        <div class="tpl-manage-body">
          <div><span class="tpl-code-badge">${t.code || '-'}</span><span class="lbl">${t.label}</span></div>
          <div class="txt">${t.text}</div>
        </div>
        <div class="tpl-manage-actions">
          <button class="icon-btn" onclick="openTemplateModal('koreksi', ${i})" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn danger" onclick="deleteTemplate('koreksi', ${i})" title="Hapus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

/*__N6_UNIT__*/  let tplEditing = { kind:null, index:null };
  window.openTemplateModal = function(kind, index){
    tplEditing = { kind:kind, index:index };
    const list = kind === 'koreksi' ? koreksiTemplates : programTemplates;
    const item = (index !== null && index !== undefined) ? list[index] : null;
    document.getElementById('templateModalTitle').textContent = item ? 'Edit Template' : 'Tambah Template';
    document.getElementById('tplCode').style.display = kind === 'koreksi' ? 'block' : 'none';
    document.getElementById('tplCode').value = item && item.code ? item.code : '';
    document.getElementById('tplLabel').value = item ? item.label : '';
    document.getElementById('tplLabel').placeholder = kind === 'koreksi' ? 'Judul singkat template (misal: Bagus & Perlu Ditingkatkan)' : 'Nama program (misal: Program Pemula 5K)';
    document.getElementById('tplText').value = item ? item.text : '';
    document.getElementById('tplText').placeholder = kind === 'koreksi' ? 'Isi teks koreksi lengkap yang akan otomatis mengisi kolom keterangan' : 'Keterangan/deskripsi program yang akan otomatis mengisi kolom saat template ini dipilih';
    document.getElementById('templateModal').classList.add('show');
  };
  window.closeTemplateModal = function(){
    document.getElementById('templateModal').classList.remove('show');
  };
  document.getElementById('templateForm').addEventListener('submit', function(e){
    e.preventDefault();
    const label = document.getElementById('tplLabel').value.trim();
    const text = document.getElementById('tplText').value.trim();
    const code = document.getElementById('tplCode').value.trim();
    if (!label || !text) return;
    const kind = tplEditing.kind;
    const list = kind === 'koreksi' ? koreksiTemplates : programTemplates;
    const obj = kind === 'koreksi' ? { code:code, label:label, text:text } : { label:label, text:text };
    if (tplEditing.index !== null && tplEditing.index !== undefined){
      list[tplEditing.index] = obj;
    } else {
      list.push(obj);
    }
    closeTemplateModal();
    if (kind === 'koreksi'){
      renderKoreksiTemplateList();
      renderSubmissionList();
    } else {
      renderProgramTemplateList();
      renderProgramTplPickList();
    }
    showToast('Template disimpan.');
  });
  window.deleteTemplate = function(kind, index){
    const list = kind === 'koreksi' ? koreksiTemplates : programTemplates;
    list.splice(index, 1);
    if (kind === 'koreksi'){
      renderKoreksiTemplateList();
      renderSubmissionList();
    } else {
      renderProgramTemplateList();
      renderProgramTplPickList();
    }
    showToast('Template dihapus.');
  };

  /* ================= PROGRAM LARI: BUILDER ================= */
/*__N6_UNIT__*/  function renderRescheduleApproval(){
    document.getElementById('rescheduleApprovalList').innerHTML = rescheduleRequests.map((r, i) => `
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
/*__N6_UNIT__*/  function renderCutiApproval(){
    document.getElementById('cutiApprovalList').innerHTML = cutiRequests.map((c, i) => `
      <div class="review-item">
        <div class="review-item-top"><span class="who">${c.coach}</span><span class="when">${statusTag(c.status)}</span></div>
        <div class="stats">${c.mulai} — ${c.selesai}</div>
        <div class="note">${c.alasan || '-'}</div>
        ${c.status === 'Menunggu' ? `
          <div class="action-btns">
            <button class="btn-approve" onclick="setCutiStatus(${i},'Disetujui')">Setujui</button>
            <button class="btn-reject" onclick="setCutiStatus(${i},'Ditolak')">Tolak</button>
          </div>` : ''}
      </div>
    `).join('');
  }
  window.setCutiStatus = function(i, status){
    cutiRequests[i].status = status;
    renderCutiApproval();
    showToast('Cuti ' + cutiRequests[i].coach + ' ditandai: ' + status);
  };

  /* ================= NAV: MAIN TABS ================= */
