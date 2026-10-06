/**
 * N6 modules - admin / klien
 * menu label : Klien
 * minimum tier: 1
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/admin/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/admin.js. Concatenating every fragment in manifest
 * order reproduces admin.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__
  async function loadAllData(){
    // Preserve the exact existing browser records. No demo data and no automatic archiving.
    const read = async (key, fallback) => {
      const raw=await storeGet(key);
      if(raw===null) return fallback;
      try { const parsed=JSON.parse(raw); return parsed!==null?parsed:fallback; }
      catch(err){ console.error('Data rusak pada '+key,err); showToast('Data '+key+' tidak terbaca. Jangan hapus cadangan.'); return fallback; }
    };
    programCatalog=await read('programCatalog',DEFAULT_PROGRAM_CATALOG);
    coachRoster=await read('coachRoster',[]);
    coachSchedule=await read('coachSchedule',{});
    coachDayOff=await read('coachDayOff',{});
    clients=await read('clients',[]);
    tickets=await read('tickets',[]);
    archivedClients=await read('archivedClients',[]);
    if(!Array.isArray(programCatalog))programCatalog=DEFAULT_PROGRAM_CATALOG;
    if(!Array.isArray(coachRoster))coachRoster=[];
    if(!Array.isArray(clients))clients=[];
    if(!Array.isArray(tickets))tickets=[];
    if(!Array.isArray(archivedClients))archivedClients=[];
    chatCache={};reportsCache={};programCache={};
    for(const c of [...clients,...archivedClients]){
      chatCache[c.id]=await read('chat:'+c.id,[]);
      reportsCache[c.id]=await read('reports:'+c.id,{});
      programCache[c.id]=await read('program:'+c.id,c.programSnapshot||{});
    }
    pendingArchiveNotice=0;
  }

/*__N6_UNIT__*/  function populateCoachFilters(){
    const sel = document.getElementById('klienFilterCoach');
    sel.innerHTML = '<option value="">Semua Coach</option>' + coachRoster.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
  }
/*__N6_UNIT__*/  function renderClientList(){
    document.getElementById('klienCountTitle').textContent = 'Semua Klien (' + clients.length + ')';
    const search = (document.getElementById('klienSearchInput').value || '').toLowerCase().trim();
    const fCoach = document.getElementById('klienFilterCoach').value;
    const fStatus = document.getElementById('klienFilterStatus').value;
    let list = clients.filter(c => {
      if (search && !(c.name.toLowerCase().includes(search) || (c.phone||'').includes(search))) return false;
      if (fCoach && c.coach !== fCoach) return false;
      if (fStatus && clientStatus(c) !== fStatus) return false;
      return true;
    });
    list = [...list].sort((a,b) => (b.joinDate||'').localeCompare(a.joinDate||''));
    document.getElementById('clientListBody').innerHTML = list.length ? list.map(c => {
      const st = clientStatus(c);
      return `
      <div class="client-row">
        <div style="cursor:pointer; flex:1; min-width:180px;" onclick="openClientDetail('${c.id}')">
          <div class="name">${escapeHtml(c.name)}</div>
          <div class="meta">${escapeHtml(c.programLabel || 'Belum ada program')} — Coach ${escapeHtml(c.coach || '-')}${(c.packageMeta && c.packageMeta.pairLabel) ? ' · Bersama ' + escapeHtml(c.packageMeta.pairLabel) : ''}</div>
        </div>
        <div class="client-tags">
          <span class="badge ${statusTone(st)}">${st}</span>
          <button class="copy-btn" onclick="event.stopPropagation(); copyClientLink('${c.id}', this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Salin Link
          </button>
          <button class="btn-sm" onclick="event.stopPropagation(); editClient('${c.id}')">Edit</button>
          <button class="btn-danger-sm" onclick="event.stopPropagation(); deleteClient('${c.id}')">Hapus</button>
        </div>
      </div>`;
    }).join('') : '<div class="list-empty">Tidak ada klien yang cocok dengan filter.</div>';
  }

  /* ================= ARSIP KLIEN (auto, Nonaktif >7 hari) ================= */
/*__N6_UNIT__*/  function renderArchive(){
    const badge = document.getElementById('arsipCountBadge');
    badge.textContent = archivedClients.length ? '(' + archivedClients.length + ')' : '';
    const sorted = [...archivedClients].sort((a,b) => (b.archivedAt||'').localeCompare(a.archivedAt||''));
    document.getElementById('archiveListBody').innerHTML = sorted.length ? sorted.map(c => {
      const p = c.programSnapshot || {};
      return `
      <div class="client-row" style="cursor:default;">
        <div>
          <div class="name">${escapeHtml(c.name)}</div>
          <div class="meta">${escapeHtml(c.program || c.programLabel || '-')} — Coach ${escapeHtml(c.coach || '-')} — program berakhir ${formatDateID(p.endDate)}</div>
          <div class="meta">Diarsipkan otomatis pada ${formatDateID(c.archivedAt)}</div>
        </div>
        <div class="client-tags">
          <button class="btn-sm" onclick="restoreArchivedClient('${c.id}')">Pulihkan</button>
          <button class="btn-danger-sm" onclick="deleteArchivedClient('${c.id}')">Hapus Permanen</button>
        </div>
      </div>`;
    }).join('') : '<div class="list-empty">Belum ada klien yang diarsipkan otomatis.</div>';
  }
  window.restoreArchivedClient = function(id){
    const idx = archivedClients.findIndex(c => String(c.id) === String(id));
    if (idx < 0) return;
    const restored = { ...archivedClients[idx] };
    delete restored.archivedAt;
    delete restored.programSnapshot;
    clients.push(restored);
    archivedClients.splice(idx, 1);
    Promise.all([persistClients(), storeSet('archivedClients', JSON.stringify(archivedClients))]).then(() => {
      showToast('Klien dipulihkan ke daftar aktif');
      populateFormSelects();
      renderAll();
    });
  };
  window.deleteArchivedClient = function(id){
    const c = archivedClients.find(x => String(x.id) === String(id));
    if (!c) return;
    if (!confirm('Hapus permanen data "' + c.name + '"? Laporan latihan, riwayat chat, dan data program klien ini akan hilang selamanya dan tidak bisa dikembalikan.')) return;
    archivedClients = archivedClients.filter(x => String(x.id) !== String(id));
    Promise.all([
      storeSet('archivedClients', JSON.stringify(archivedClients)),
      storeSet('chat:' + id, JSON.stringify([])),
      storeSet('reports:' + id, JSON.stringify({})),
      storeSet('program:' + id, JSON.stringify({}))
    ]).then(() => {
      showToast('Data klien dihapus permanen');
      renderAll();
    });
  };

  window.copyClientLink = function(id, btn){
    const url = clientPortalUrl(id);
    const full = (window.location.href.split('?')[0].replace(/[^\/]+$/, '')) + url;
    const text = full || url;
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(() => flashCopied(btn));
    } else {
      flashCopied(btn);
    }
  };
/*__N6_UNIT__*/  function updateConfigPriceBox(){
    const progId = document.getElementById('fProgram').value;
    const program = catalogById(progId);
    if (!program || program.mode !== 'configurable') return;
    const meetings = parseInt(document.getElementById('fMeetings').value, 10) || 1;
    const weeks = parseInt(document.getElementById('fWeeks').value, 10) || 1;
    const { totalSessions, total } = computeConfigPrice(program, meetings, weeks);
    document.getElementById('fPriceBoxConfig').innerHTML = `
      <div class="row"><span>Total Pertemuan</span><span>${totalSessions}x (${meetings}x/minggu × ${weeks} minggu)</span></div>
      <div class="row"><span>Tarif per Sesi</span><span>${formatRupiah(program.ratePerSesi)}</span></div>
      <div class="total"><span>Total Biaya</span><span>${formatRupiah(total)}</span></div>`;
  }

  window.openClientForm = function(){
    document.getElementById('clientFormTitle').textContent = 'Tambah Klien';
    document.getElementById('fClientId').value = '';
    document.getElementById('fName').value = '';
    document.getElementById('fName2').value = '';
    document.getElementById('fPhone').value = '';
    document.getElementById('fCoach').value = coachRoster.length ? coachRoster[0].name : '';
    document.getElementById('fProgram').value = '';
    document.getElementById('fMeetings').value = 2;
    document.getElementById('fWeeks').value = 4;
    document.getElementById('fCustomName').value = '';
    document.getElementById('fCustomCount').value = '';
    document.getElementById('fCustomValue').value = '';
    document.getElementById('fCustomNote').value = '';
    document.getElementById('fStart').value = todayISO();
    document.getElementById('fEnd').value = '';
    document.getElementById('fPbStart').value = '';
    document.getElementById('fPbEnd').value = '';
    document.getElementById('fPaymentStatus').value = 'Belum Lunas';
    document.getElementById('fAmountPaid').value = '';
    document.getElementById('fNotes').value = '';
    document.getElementById('clientFormError').style.display = 'none';
    document.getElementById('invoiceActionWrap').style.display = 'none';
    renderProgramFields();
    document.getElementById('clientFormModal').classList.add('show');
  };
  window.editClient = function(id){
    const c = clients.find(x => String(x.id) === String(id));
    if (!c) return;
    const p = programCache[id] || {};
    const meta = c.packageMeta || {};
    document.getElementById('clientFormTitle').textContent = 'Edit Klien';
    document.getElementById('fClientId').value = c.id;
    document.getElementById('fName').value = c.name;
    document.getElementById('fName2').value = meta.pairLabel || '';
    document.getElementById('fPhone').value = c.phone || '';
    document.getElementById('fCoach').value = c.coach || (coachRoster[0] ? coachRoster[0].name : '');
    document.getElementById('fProgram').value = c.programId || '';
    document.getElementById('fMeetings').value = meta.meetings || 2;
    document.getElementById('fWeeks').value = meta.weeks || 4;
    document.getElementById('fCustomName').value = meta.partnerName || '';
    document.getElementById('fCustomCount').value = meta.count || '';
    document.getElementById('fCustomValue').value = c.price || '';
    document.getElementById('fCustomNote').value = meta.note || '';
    document.getElementById('fStart').value = p.startDate || '';
    document.getElementById('fEnd').value = p.endDate || '';
    document.getElementById('fPbStart').value = p.pbStart || '';
    document.getElementById('fPbEnd').value = p.pbEnd || '';
    document.getElementById('fPaymentStatus').value = c.paymentStatus || 'Belum Lunas';
    document.getElementById('fAmountPaid').value = c.amountPaid || '';
    document.getElementById('fNotes').value = c.notes || '';
    document.getElementById('clientFormError').style.display = 'none';
    document.getElementById('invoiceActionWrap').style.display = 'block';
    renderProgramFields();
    document.getElementById('clientFormModal').classList.add('show');
  };
  window.closeClientForm = function(){ document.getElementById('clientFormModal').classList.remove('show'); };

/*__N6_UNIT__*/  async function saveClientForm(){
    const name = document.getElementById('fName').value.trim();
    const errEl = document.getElementById('clientFormError');
    if (!name){ errEl.textContent = 'Nama klien wajib diisi.'; errEl.style.display = 'block'; return; }

    let id = document.getElementById('fClientId').value;
    const isNew = !id;
    const progId = document.getElementById('fProgram').value;
    const isSemi = progId === 'semi-private';
    const name2 = document.getElementById('fName2').value.trim();

    if (isSemi && isNew && !name2){
      errEl.textContent = 'Nama Klien 2 wajib diisi untuk program Semi Private.';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    if (isNew){
      let base = slugify(name) || 'klien';
      id = base; let n = 2;
      while (clients.some(c => String(c.id) === String(id))){ id = base + '-' + n; n++; }
    }

    const program = catalogById(progId);
    let packageMeta = {}, price = 0, priceLabel = '-', programLabel = program ? program.label : '';
    if (program){
      if (program.mode === 'fixed'){
        packageMeta = { mode:'fixed' };
        price = program.price;
        priceLabel = formatRupiah(price) + ' / ' + program.unit;
      } else if (program.mode === 'configurable'){
        const meetings = parseInt(document.getElementById('fMeetings').value, 10) || 1;
        const weeks = parseInt(document.getElementById('fWeeks').value, 10) || 1;
        const { totalSessions, total } = computeConfigPrice(program, meetings, weeks);
        packageMeta = { mode:'configurable', meetings, weeks, totalSessions };
        price = total;
        priceLabel = formatRupiah(price) + ' / ' + totalSessions + 'x pertemuan';
      } else if (program.mode === 'custom'){
        const partnerName = document.getElementById('fCustomName').value.trim();
        const count = document.getElementById('fCustomCount').value;
        const note = document.getElementById('fCustomNote').value.trim();
        price = parseInt(document.getElementById('fCustomValue').value, 10) || 0;
        packageMeta = { mode:'custom', partnerName, count, note };
        priceLabel = (price ? formatRupiah(price) : 'Nego') + (partnerName ? ' — ' + partnerName : '');
      }
    }

    const phone = document.getElementById('fPhone').value.trim();
    const coach = document.getElementById('fCoach').value;
    const paymentStatus = document.getElementById('fPaymentStatus').value;
    const amountPaid = parseInt(document.getElementById('fAmountPaid').value, 10) || 0;
    const notes = document.getElementById('fNotes').value.trim();
    const programEntry = {
      pbStart: document.getElementById('fPbStart').value.trim(),
      pbEnd: document.getElementById('fPbEnd').value.trim(),
      startDate: document.getElementById('fStart').value,
      endDate: document.getElementById('fEnd').value
    };

    function buildClientData(clientId, clientName, meta){
      return {
        id: clientId, name: clientName,
        phone,
        coach,
        programId: progId, programLabel, packageMeta: meta, price, priceLabel,
        status: 'Aktif',
        joinDate: isNew ? todayISO() : (clients.find(c=>c.id===clientId)||{}).joinDate || todayISO(),
        paymentStatus, amountPaid,
        invoiceNumber: (clients.find(c=>c.id===clientId)||{}).invoiceNumber || '',
        notes
      };
    }
    async function finalizeClient(clientId){
      programCache[clientId] = { ...programEntry };
      if (!chatCache[clientId]) chatCache[clientId] = [];
      if (!reportsCache[clientId]) reportsCache[clientId] = {};
      await persistProgram(clientId);
      if (isNew){ await storeSet('chat:' + clientId, JSON.stringify(chatCache[clientId])); await storeSet('reports:' + clientId, JSON.stringify(reportsCache[clientId])); }
    }

    // ===== Program Semi Private (baru) — buat 2 klien terpisah, masing-masing dgn ID & link dashboard sendiri =====
    if (isSemi && isNew && name2){
      let base2 = slugify(name2) || 'klien';
      let id2 = base2; let n2 = 2;
      while (clients.some(c => String(c.id) === String(id)2) || id2 === id){ id2 = base2 + '-' + n2; n2++; }

      const data1 = buildClientData(id, name, { ...packageMeta, pairWith: id2, pairLabel: name2 });
      const data2 = buildClientData(id2, name2, { ...packageMeta, pairWith: id, pairLabel: name });
      clients.push(data1);
      clients.push(data2);

      await persistClients();
      await finalizeClient(id);
      await finalizeClient(id2);

      closeClientForm();
      showToast('2 klien Semi Private berhasil didaftarkan dengan link masing-masing');
      renderAll();
      return;
    }

    // ===== Edit klien Semi Private yang sudah ada — sinkronkan nama pasangan bila diubah =====
    if (isSemi && !isNew){
      const existing = clients.find(c => String(c.id) === String(id));
      const prevMeta = (existing && existing.packageMeta) || {};
      packageMeta = { ...packageMeta, pairWith: prevMeta.pairWith || null, pairLabel: name2 || prevMeta.pairLabel || '' };
      if (prevMeta.pairWith){
        const partnerIdx = clients.findIndex(c => c.id === prevMeta.pairWith);
        if (partnerIdx >= 0 && name2){
          clients[partnerIdx] = {
            ...clients[partnerIdx],
            name: name2,
            packageMeta: { ...clients[partnerIdx].packageMeta, pairLabel: name }
          };
        }
      }
    }

    const data = buildClientData(id, name, packageMeta);
    if (isNew){ clients.push(data); }
    else { const idx = clients.findIndex(c => String(c.id) === String(id)); clients[idx] = { ...clients[idx], ...data }; }

    await persistClients();
    await finalizeClient(id);

    closeClientForm();
    showToast(isNew ? 'Klien baru berhasil didaftarkan' : 'Data klien diperbarui');
    renderAll();
  }

  window.deleteClient = function(id){
    const c = clients.find(x => String(x.id) === String(id));
    if (!c) return;
    if (!confirm('Hapus klien "' + c.name + '"? Data laporan dan chat klien ini tidak akan tampil lagi di dashboard.')) return;
    clients = clients.filter(x => String(x.id) !== String(id));
    persistClients().then(() => { showToast('Klien dihapus'); renderAll(); });
  };

  /* ================= INVOICE (JPG) ================= */
/*__N6_UNIT__*/  async function saveTicketForm(){
    const clientId = document.getElementById('tClient').value;
    const client = clients.find(c => c.id === clientId);
    if (!client || !document.getElementById('tSubject').value.trim()){ showToast('Lengkapi klien dan judul tiket'); return; }
    tickets.push({
      id: 't-' + Date.now(), clientId, clientName: client.name,
      subject: document.getElementById('tSubject').value.trim(),
      detail: document.getElementById('tDetail').value.trim(),
      priority: document.getElementById('tPriority').value,
      status: document.getElementById('tStatus').value,
      createdAt: todayISO()
    });
    await persistTickets();
    closeTicketForm();
    showToast('Tiket manual ditambahkan');
    renderAll();
  }

  /* ================= RENDER: PESAN ================= */
/*__N6_UNIT__*/  async function saveSlot(){
    if (!activeSlot) return;
    const { coachId, day, blockKey } = activeSlot;
    const occurrenceDate=document.getElementById('slotOccurrenceDate').value;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(occurrenceDate)){showToast('Pilih tanggal sesi yang valid');return;}
    const pickedId = document.getElementById('slotClientSelect').value;
    const manual = document.getElementById('slotClientName').value.trim();
    const linkedClient = pickedId ? clients.find(c => c.id === pickedId) : null;
    const clientName = linkedClient ? linkedClient.name : manual;
    if (!clientName && !((coachSchedule[coachId]||{})[day + '|' + blockKey])){ showToast('Isi nama klien atau keterangan dulu'); return; }
    if (!coachSchedule[coachId]) coachSchedule[coachId] = {};
    const existingSlot = coachSchedule[coachId][day + '|' + blockKey];
    if(activeSlot.addingClient){
      if(!clientName){ showToast('Pilih atau isi nama klien tambahan'); return; }
      const ids=Array.isArray(existingSlot.clientIds)?[...existingSlot.clientIds]:(existingSlot.clientId?[existingSlot.clientId]:[]);
      const names=Array.isArray(existingSlot.clients)?[...existingSlot.clients]:[existingSlot.client || (clients.find(c=>c.id===existingSlot.clientId)?.name||'')].filter(Boolean);
      if(linkedClient && ids.map(String).includes(String(linkedClient.id))){ showToast('Klien ini sudah tercatat pada sesi tersebut'); return; }
      const normName = v => String(v||'').trim().toLocaleLowerCase('id-ID');
      if(names.some(n => normName(n) === normName(clientName))){ showToast('Nama ini sudah tercatat pada sesi tersebut'); return; }
      if(linkedClient) ids.push(linkedClient.id);
      names.push(clientName);
      coachSchedule[coachId][day + '|' + blockKey]={...existingSlot, clientId:ids[0]||'', clientIds:ids, clients:names, client:names.join(', ')};
    }else{
      const singleName = clientName ? [clientName] : [];
      coachSchedule[coachId][day + '|' + blockKey] = { clientId: linkedClient ? linkedClient.id : (existingSlot?.clientId||''), clientIds:linkedClient?[linkedClient.id]:(existingSlot?.clientIds||[]), clients: singleName, client: clientName, trainingCategory: document.getElementById('slotTrainingCategory').value, location: document.getElementById('slotLocation').value.trim(), note: document.getElementById('slotNote').value.trim() };
    }
    const savedSlot=coachSchedule[coachId][day + '|' + blockKey];
    const doneDates=new Set(Array.isArray(savedSlot.completedDates)?savedSlot.completedDates:[]);
    if(document.getElementById('slotOccurrenceDone').checked)doneDates.add(occurrenceDate);else doneDates.delete(occurrenceDate);
    savedSlot.completedDates=[...doneDates];
    await persistCoachSchedule();
    closeSlotModal();
    showToast('Slot dan status sesi disimpan');
    renderAll();
  }
/*__N6_UNIT__*/  const panelTitles = { beranda:'Beranda', klien:'Klien', jadwalklien:'Jadwal Klien', jadwalcoach:'Jadwal Coach', harga:'Daftar Harga', tiket:'Tiket & Keluhan', pesan:'Pesan' };
/*__N6_UNIT__*/  function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarOverlay.classList.remove('show'); }
  document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ================= SUBTABS (Klien: Aktif / Arsip) ================= */
  document.querySelectorAll('.subtab-btn[data-klienview]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-klienview]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#klienview-aktif, #klienview-arsip').forEach(p => p.classList.remove('active'));
      document.getElementById('klienview-' + btn.dataset.klienview).classList.add('active');
    });
  });

  /* ================= SUBTABS (Tiket) ================= */
  document.querySelectorAll('.subtab-btn[data-sub]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-sub]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ticketFilter = btn.dataset.sub;
      renderTickets();
    });
  });

  /* ================= SUBTABS (Jadwal Coach: Mingguan / Kalender) ================= */
  document.querySelectorAll('.subtab-btn[data-jcview]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-jcview]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#jcview-mingguan, #jcview-bulanan').forEach(p => p.classList.remove('active'));
      document.getElementById('jcview-' + btn.dataset.jcview).classList.add('active');
      if (btn.dataset.jcview === 'bulanan'){ renderCoachCalendar(); renderCoachCalDetail(); }
    });
  });
  document.getElementById('coachCalPrev').addEventListener('click', () => {
    calMonth--; if (calMonth < 0){ calMonth = 11; calYear--; }
    selectedCalDate = null; renderCoachCalendar(); renderCoachCalDetail();
  });
  document.getElementById('coachCalNext').addEventListener('click', () => {
    calMonth++; if (calMonth > 11){ calMonth = 0; calYear++; }
    selectedCalDate = null; renderCoachCalendar(); renderCoachCalDetail();
  });
  document.getElementById('coachCalToday').addEventListener('click', () => {
    calYear = todayNow.getFullYear(); calMonth = todayNow.getMonth();
    selectedCalDate = todayISO(); renderCoachCalendar(); renderCoachCalDetail();
  });

  /* ================= EVENTS ================= */
  document.getElementById('btnTambahKlien').addEventListener('click', openClientForm);
  document.getElementById('btnSaveClient').addEventListener('click', saveClientForm);
  document.getElementById('btnDownloadInvoice').addEventListener('click', () => {
    const id = document.getElementById('fClientId').value;
    if (id) downloadInvoice(id);
  });
  document.getElementById('fProgram').addEventListener('change', renderProgramFields);
  document.getElementById('fMeetings').addEventListener('input', updateConfigPriceBox);
  document.getElementById('fWeeks').addEventListener('input', updateConfigPriceBox);
  document.getElementById('btnTambahTiket').addEventListener('click', openTicketForm);
  document.getElementById('btnSaveTicket').addEventListener('click', saveTicketForm);
  document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
  document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });
  document.getElementById('templateSelect').addEventListener('change', e => {
    if (e.target.value) document.getElementById('chatInput').value = e.target.value;
  });
  document.getElementById('btnBroadcast').addEventListener('click', openBroadcast);
  document.getElementById('bTarget').addEventListener('change', e => {
    document.getElementById('bCoachWrap').style.display = e.target.value === 'coach' ? 'block' : 'none';
    updateBroadcastCount();
  });
  document.getElementById('bCoach').addEventListener('change', updateBroadcastCount);
  document.getElementById('btnSendBroadcast').addEventListener('click', sendBroadcast);
  document.getElementById('btnTambahCoach').addEventListener('click', openCoachForm);
  document.getElementById('btnSaveCoach').addEventListener('click', saveCoachForm);
  document.getElementById('btnDownloadCoachSchedule').addEventListener('click', () => {
    const coachId = document.getElementById('shareScheduleCoach').value;
    const startStr = document.getElementById('shareScheduleStart').value;
    downloadCoachScheduleImage(coachId, startStr);
  });
  document.getElementById('btnSaveSlot').addEventListener('click', saveSlot);
  document.getElementById('btnClearSlot').addEventListener('click', clearSlot);
  document.getElementById('klienSearchInput').addEventListener('input', renderClientList);
  document.getElementById('klienFilterCoach').addEventListener('change', renderClientList);
  document.getElementById('klienFilterStatus').addEventListener('change', renderClientList);
  document.getElementById('globalSearch').addEventListener('input', (e) => {
    switchPanel('klien');
    document.getElementById('klienSearchInput').value = e.target.value;
    renderClientList();
  });

  /* ================= CADANGAN + TEMA ================= */
