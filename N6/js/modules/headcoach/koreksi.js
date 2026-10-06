/**
 * N6 modules - headcoach / koreksi
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  const DAY_NAMES = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

/*__N6_UNIT__*/  const FIRST_NAMES = ["Budi","Andi","Rina","Yoga","Citra","Sari","Reza","Maya","Dewi","Bayu","Nadia","Rizky","Agus","Wulan","Doni","Fitri","Hendra","Sinta","Galih","Putri","Indra","Lina","Tia","Dian","Yudi","Rara","Fajar","Wahyu"];
/*__N6_UNIT__*/  const LAST_NAMES = ["Hartono","Prasetyo","Marlina","Pratama","Ayu","Wijaya","Firmansyah","Putri","Lestari","Setiawan","Ramadhan","Salim","Kurniawan","Handayani","Gunawan","Dewi","Permana","Kusuma","Anggraini","Puspita","Santoso","Kirana"];
/*__N6_UNIT__*/  const LOCATIONS = ["GBK Senayan","Online","Lapangan A. Yani","Taman Menteng","Online","Stadion Madya","Online"];

/*__N6_UNIT__*/  function generateSubmissions(){
    // Data dummy dinonaktifkan — menunggu endpoint API hasil latihan klien (Fase 3).
    return [];
  }
/*__N6_UNIT__*/  let submissions = generateSubmissions();

/*__N6_UNIT__*/  function getMonday(d){
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0,0,0,0);
    return date;
  }
/*__N6_UNIT__*/  const koreksiMonday = getMonday(new Date());
/*__N6_UNIT__*/  const koreksiWeekDates = [];
  for (let i=0;i<7;i++){ const d = new Date(koreksiMonday); d.setDate(d.getDate()+i); koreksiWeekDates.push(d); }
/*__N6_UNIT__*/  const todayIndex = (new Date().getDay() + 6) % 7;
/*__N6_UNIT__*/  let selectedDayIndex = todayIndex;

/*__N6_UNIT__*/  function renderDayTabs(){
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

/*__N6_UNIT__*/  window.selectKoreksiDay = function(i){
    selectedDayIndex = i;
    renderDayTabs();
    renderSubmissionList();
  };
/*__N6_UNIT__*/  window.reviewSubmission = async function(id){
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
/*__N6_UNIT__*/  window.applyTemplateToField = function(fieldId, code){
    const tpl = koreksiTemplates.find(t => t.code === code);
    const field = document.getElementById(fieldId);
    if (!tpl || !field) return;
    field.value = tpl.text;
    field.focus();
  };
/*__N6_UNIT__*/  window.applyTemplateCode = function(fieldId, codeFieldId){
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
/*__N6_UNIT__*/  window.openTemplateModal = function(kind, index){
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
/*__N6_UNIT__*/  window.closeTemplateModal = function(){
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
/*__N6_UNIT__*/  window.deleteTemplate = function(kind, index){
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
/*__N6_UNIT__*/  function renderProgramTplPickList(){
    const body = document.getElementById('programTplPickList');
    if (!body) return;
    if (!programTemplates.length){
      body.innerHTML = '<div class="cal-empty">Belum ada template program. Tambahkan lewat tab "Kelola Template Program".</div>';
      return;
    }
    body.innerHTML = programTemplates.map((t, i) => `
      <div class="program-tpl-card ${selectedProgramTplIndex === i ? 'selected' : ''}" onclick="pickProgramTpl(${i})">
        <div class="name">${t.label}</div>
        <div class="desc">${t.text}</div>
      </div>
    `).join('');
  }
/*__N6_UNIT__*/  window.pickProgramTpl = function(i){
    selectedProgramTplIndex = i;
    const t = programTemplates[i];
    document.getElementById('programNamaTpl').value = t.label;
    document.getElementById('programKeterangan').value = t.text;
    renderProgramTplPickList();
  };

/*__N6_UNIT__*/  function renderProgramTemplateList(){
    const body = document.getElementById('programTemplateList');
    if (!body) return;
    if (!programTemplates.length){ body.innerHTML = '<div class="cal-empty">Belum ada template program.</div>'; return; }
    body.innerHTML = programTemplates.map((t, i) => `
      <div class="tpl-manage-item">
        <div class="tpl-manage-body">
          <div class="lbl">${t.label}</div>
          <div class="txt">${t.text}</div>
        </div>
        <div class="tpl-manage-actions">
          <button class="icon-btn" onclick="openTemplateModal('program', ${i})" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn danger" onclick="deleteTemplate('program', ${i})" title="Hapus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

/*__N6_UNIT__*/  function populateProgramClientSelect(){
    const el = document.getElementById('programClient');
    if (!el) return;
    el.innerHTML = '<option value="">Pilih klien tujuan</option>' +
      clients.map(c => `<option value="${c.name}">${c.name} (Coach: ${c.coach})</option>`).join('');
  }

/*__N6_UNIT__*/  function fmtProgramTime(){
    return new Date().toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }

/*__N6_UNIT__*/  const PROGRAMS_STORAGE_KEY = 'programs:n6-shared';
/*__N6_UNIT__*/  async function syncProgramsToStorage(){
    if (!window.storage) return;
    try{ await window.storage.set(PROGRAMS_STORAGE_KEY, JSON.stringify(sentPrograms), true); }
    catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — data tetap tersimpan lokal */ }
  }
/*__N6_UNIT__*/  async function loadProgramsFromStorage(){
    if (!window.storage) return;
    try{
      const raw = await window.storage.get(PROGRAMS_STORAGE_KEY, true);
      if (raw && raw.value) sentPrograms = JSON.parse(raw.value);
    }catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — memakai data lokal */ }
    renderSentProgramList();
  }

/*__N6_UNIT__*/  function programStatusBadge(status){
    if (status === 'diproses') return '<span class="badge blue">Sedang Diproses Admin</span>';
    if (status === 'terkirim') return '<span class="badge green">Sudah Dikirim ke Klien</span>';
    return '<span class="badge amber">Menunggu Diproses Admin</span>';
  }

/*__N6_UNIT__*/  function renderSentProgramList(){
    const body = document.getElementById('sentProgramList');
    if (!body) return;
    if (!sentPrograms.length){ body.innerHTML = '<div class="cal-empty">Belum ada program yang dikirim ke Admin/CS.</div>'; return; }
    body.innerHTML = sentPrograms.slice().reverse().map(p => `
      <div class="sent-program-item">
        <div class="sent-program-top"><span class="who">${p.client}</span>${programStatusBadge(p.status)}</div>
        <div class="sent-program-name">${p.tplName}</div>
        <div class="sent-program-desc">${p.keterangan}</div>
        <div class="sent-program-when">Dikirim ${p.at}</div>
      </div>
    `).join('');
  }

/*__N6_UNIT__*/  const programBuildFormEl = document.getElementById('programBuildForm');
  if (programBuildFormEl){
    programBuildFormEl.addEventListener('submit', function(e){
      e.preventDefault();
      const client = document.getElementById('programClient').value;
      const tplName = document.getElementById('programNamaTpl').value.trim();
      const keterangan = document.getElementById('programKeterangan').value.trim();
      if (!client){ showToast('Pilih klien tujuan terlebih dahulu.'); return; }
      if (!tplName){ showToast('Pilih salah satu template program di atas.'); return; }
      sentPrograms.push({ id:'p' + Date.now(), client:client, tplName:tplName, keterangan:keterangan, status:'pending', at:fmtProgramTime() });
      renderSentProgramList();
      syncProgramsToStorage();
      programBuildFormEl.reset();
      selectedProgramTplIndex = null;
      renderProgramTplPickList();
      showToast('Program "' + tplName + '" terkirim ke Admin/CS untuk ' + client + '.');
    });
  }

  /* ================= CHAT INTERNAL: HEAD COACH <-> ADMIN / OWNER ================= */
