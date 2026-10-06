/**
 * N6 modules - owner / jadwal-coach
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderShareCoachOptions(){
    const sel=document.getElementById('shareScheduleCoach');if(!sel)return;
    const current=sel.value;
    sel.innerHTML='<option value="">Pilih coach...</option>'+coachRoster.map(c=>'<option value="'+escapeHtml(c.id)+'">'+escapeHtml(c.name)+'</option>').join('');
    if(coachRoster.some(c=>c.id===current))sel.value=current;
    else if(coachRoster.length)sel.value=coachRoster[0].id;
  }
  /* ================= JADWAL COACH — UNDUH SEBAGAI GAMBAR (JPG) UNTUK CALON KLIEN ================= */
/*__N6_UNIT__*/  let activeDay = todayDayName();
/*__N6_UNIT__*/  function renderCoachRoster(){
    document.getElementById('coachRosterList').innerHTML = coachRoster.length ? coachRoster.map(c => `
      <div class="coach-roster-item">
        <div><div class="name" style="font-weight:600; font-size:13.5px;">${escapeHtml(c.name)}</div><div class="meta" style="font-size:12px; color:var(--asphalt);">${escapeHtml(c.phone || '-')}</div></div>
        <div style="display:flex; gap:8px;">
          <button class="btn-sm" onclick="editCoach('${c.id}')">Edit</button>
          <button class="btn-danger-sm" onclick="deleteCoach('${c.id}')">Hapus</button>
        </div>
      </div>`).join('') : '<div class="list-empty">Belum ada coach terdaftar.</div>';
  }
/*__N6_UNIT__*/  function renderDayTabs(){
    document.getElementById('dayTabs').innerHTML = DAYS.map(d => `<button type="button" class="subtab-btn ${d===activeDay?'active':''}" data-day="${d}">${d}${d===todayDayName() ? ' (Hari ini)' : ''}</button>`).join('');
    document.querySelectorAll('#dayTabs .subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => { activeDay = btn.dataset.day; renderDayTabs(); renderSchedTable(); });
    });
  }
/*__N6_UNIT__*/  function renderSchedTable(){
    const table = document.getElementById('schedTable');
    let thead = '<thead><tr><th style="text-align:left;">Coach</th>' + BLOCKS.map(b => `<th>${b.label}<br><span style="font-weight:400; text-transform:none;">${b.time}</span></th>`).join('') + '</tr></thead>';
    let rows = coachRoster.map(coach => {
      const sched = coachSchedule[coach.id] || {};
      const cells = BLOCKS.map(b => {
        const slot = sched[activeDay + '|' + b.key];
        if (slot){
          const slotNames = Array.isArray(slot.clients) && slot.clients.length ? slot.clients : String((slot.clientId && clients.find(c => c.id === slot.clientId)?.name) || slot.client || '').split(',').map(x=>x.trim()).filter(Boolean);
          const categoryLabels={'single-session':'Single Session Training','group-training':'Group Training','semi-private':'Semi Privat Training','private-training':'Privat Training'};
          return `<td><button type="button" class="slot-btn terisi" onclick="openSlotModal('${coach.id}','${activeDay}','${b.key}')">Terisi<span class="cn">${escapeHtml(categoryLabels[slot.trainingCategory]||'Single Session Training')}</span>${slotNames.map(name=>`<span class="cn">${escapeHtml(name)}</span>`).join('')}${slot.location ? `<span class="loc">${escapeHtml(slot.location)}</span>` : ''}</button></td>`;
        }
        return `<td><button type="button" class="slot-btn kosong" onclick="openSlotModal('${coach.id}','${activeDay}','${b.key}')">Kosong</button></td>`;
      }).join('');
      return `<tr><td class="coach-name-cell">${escapeHtml(coach.name)}</td>${cells}</tr>`;
    }).join('');
    if (!coachRoster.length) rows = `<tr><td colspan="${BLOCKS.length+1}" class="muted" style="text-align:center; padding:16px 0;">Tambahkan coach dulu untuk mengatur jadwal.</td></tr>`;
    table.innerHTML = thead + '<tbody>' + rows + '</tbody>';
  }

  /* ================= KALENDER 30 HARI COACH (REAL-TIME) ================= */
/*__N6_UNIT__*/  const todayNow = new Date();
/*__N6_UNIT__*/  let calYear = todayNow.getFullYear();
/*__N6_UNIT__*/  let calMonth = todayNow.getMonth();
/*__N6_UNIT__*/  let selectedCalDate = null;

/*__N6_UNIT__*/  function dateStrOf(y, m, d){ return y + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0'); }
/*__N6_UNIT__*/  function weekdayNameOf(y, m, d){
    const jsDay = new Date(y, m, d).getDay();
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    return DAYS[idx];
  }
/*__N6_UNIT__*/  function isCoachOff(coachId, dateStr){ return !!(coachDayOff[coachId] || []).includes(dateStr); }

/*__N6_UNIT__*/  function daySummary(dateStr, weekday){
    let kosong = 0, total = 0, anyOff = false;
    coachRoster.forEach(coach => {
      const off = isCoachOff(coach.id, dateStr);
      if (off){ anyOff = true; return; }
      const sched = coachSchedule[coach.id] || {};
      BLOCKS.forEach(b => {
        total++;
        if (!sched[weekday + '|' + b.key]) kosong++;
      });
    });
    return { kosong, total, anyOff };
  }

/*__N6_UNIT__*/  function renderCoachCalendar(){
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    document.getElementById('coachCalRange').textContent = monthNames[calMonth] + ' ' + calYear;
    const dowLabels = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    let html = dowLabels.map(d => `<div class="cal-dow">${d}</div>`).join('');

    const firstDay = new Date(calYear, calMonth, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevDaysInMonth = new Date(calYear, calMonth, 0).getDate();
    const todayStr = todayISO();

    for (let i = startOffset; i > 0; i--){
      html += `<div class="cal-cell outside"><span class="num">${prevDaysInMonth - i + 1}</span></div>`;
    }
    for (let d = 1; d <= daysInMonth; d++){
      const dateStr = dateStrOf(calYear, calMonth, d);
      const weekday = weekdayNameOf(calYear, calMonth, d);
      const { kosong, anyOff } = daySummary(dateStr, weekday);
      let cls = 'cal-cell';
      if (dateStr === todayStr) cls += ' today';
      if (dateStr === selectedCalDate) cls += ' selected';
      const cntCls = kosong > 0 ? 'green' : 'red';
      const cntLabel = coachRoster.length ? (kosong > 0 ? kosong + ' kosong' : 'Penuh') : '-';
      html += `<div class="${cls}" data-date="${dateStr}">
        <span class="num">${d}</span>
        <span class="cnt ${cntCls}">${cntLabel}</span>
        ${anyOff ? '<span class="off-dot" title="Ada coach libur"></span>' : ''}
      </div>`;
    }
    const totalCells = startOffset + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= trailing; d++){
      html += `<div class="cal-cell outside"><span class="num">${d}</span></div>`;
    }

    document.getElementById('coachCalGrid').innerHTML = html;
    document.querySelectorAll('#coachCalGrid .cal-cell[data-date]').forEach(cell => {
      cell.addEventListener('click', () => { selectedCalDate = cell.dataset.date; renderCoachCalendar(); renderCoachCalDetail(); });
    });
  }

/*__N6_UNIT__*/  function renderCoachCalDetail(){
    const box = document.getElementById('coachCalDetail');
    if (!selectedCalDate){ box.innerHTML = '<p class="modal-empty">Klik salah satu tanggal untuk lihat detail ketersediaan tiap coach.</p>'; return; }
    if (!coachRoster.length){ box.innerHTML = '<p class="modal-empty">Belum ada coach terdaftar.</p>'; return; }
    const weekday = selectedCalDate.split('-').map(Number);
    const wd = weekdayNameOf(weekday[0], weekday[1]-1, weekday[2]);
    box.innerHTML = `<h4>${formatDateID(selectedCalDate)} — ${wd}</h4>` + coachRoster.map(coach => {
      const off = isCoachOff(coach.id, selectedCalDate);
      const sched = coachSchedule[coach.id] || {};
      const chips = BLOCKS.map(b => {
        const slot = sched[wd + '|' + b.key];
        if (!slot) return `<span class="cal-slot-chip kosong">${b.label}: Kosong</span>`;
        const slotNames = Array.isArray(slot.clients) && slot.clients.length ? slot.clients : String((slot.clientId && clients.find(c => c.id === slot.clientId)?.name) || slot.client || 'Terisi').split(',').map(x=>x.trim()).filter(Boolean);
        const categoryLabels={'single-session':'Single Session','group-training':'Group Training','semi-private':'Semi Privat','private-training':'Privat Training'};
        return slotNames.map((name,index)=>`<span class="cal-slot-chip terisi">${b.label}${slotNames.length>1?' • '+(index+1):''}: ${escapeHtml(name)} <small>(${escapeHtml(categoryLabels[slot.trainingCategory]||'Single Session')})</small>${slot.location ? ' 📍'+escapeHtml(slot.location) : ''}</span>`).join('');
      }).join('');
      return `<div class="cal-coach-block">
        <div class="cal-coach-block-top">
          <div class="nm">${escapeHtml(coach.name)} ${off ? '<span class="badge amber" style="margin-left:6px;">Libur</span>' : ''}</div>
          <button type="button" class="btn-sm" onclick="toggleCoachDayOff('${coach.id}','${selectedCalDate}')">${off ? 'Batalkan Libur' : 'Tandai Libur Hari Ini'}</button>
        </div>
        ${off ? '<div class="ct" style="font-size:11.5px; color:var(--asphalt); margin-top:4px;">Coach tidak tersedia sepanjang hari ini (pola mingguan diabaikan untuk tanggal ini).</div>' : `<div class="cal-slots-row">${chips}</div>`}
      </div>`;
    }).join('');
  }

/*__N6_UNIT__*/  window.toggleCoachDayOff = function(coachId, dateStr){
    if (!coachDayOff[coachId]) coachDayOff[coachId] = [];
    const idx = coachDayOff[coachId].indexOf(dateStr);
    if (idx >= 0) coachDayOff[coachId].splice(idx, 1);
    else coachDayOff[coachId].push(dateStr);
    persistCoachDayOff().then(() => {
      showToast(idx >= 0 ? 'Libur dibatalkan' : 'Coach ditandai libur tanggal ini');
      renderCoachCalendar();
      renderCoachCalDetail();
      renderBeranda();
    });
  };

/*__N6_UNIT__*/  window.openSlotModal = function(coachId, day, blockKey){
    activeSlot = { coachId, day, blockKey, addingClient:false };
    const coach = coachById(coachId);
    const block = BLOCKS.find(b => b.key === blockKey);
    const slot = (coachSchedule[coachId] || {})[day + '|' + blockKey];
    document.getElementById('slotModalTitle').textContent = coach.name + ' — ' + day + ' ' + block.label + ' (' + block.time + ')';
    document.getElementById('slotClientSelect').innerHTML = '<option value="">— Isi manual di bawah —</option>' + clients.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join('');
    document.getElementById('slotClientSelect').value = slot && slot.clientId ? slot.clientId : '';
    document.getElementById('slotAddClientAction').style.display = slot ? 'block' : 'none';
    document.getElementById('btnSaveSlot').textContent = slot ? 'Simpan Perubahan' : 'Tandai Terisi';
    const linkedSlotClient = slot && slot.clientId ? clients.find(c => c.id === slot.clientId) : null;
    const existingName = slot ? (linkedSlotClient?.name || (Array.isArray(slot.clients) ? slot.clients[0] : '') || String(slot.client || '').split(',')[0].trim()) : '';
    document.getElementById('slotClientName').value = existingName;
    document.getElementById('slotTrainingCategory').value = slot?.trainingCategory || 'single-session';
    document.getElementById('slotClientName').placeholder = slot ? 'Nama klien atau keterangan sesi' : "mis. Dimas Prasetyo atau 'Sesi Trial'";
    document.getElementById('slotLocation').value = slot ? (slot.location || '') : '';
    document.getElementById('slotNote').value = slot ? (slot.note || '') : '';
    const occurrenceDate=document.getElementById('slotOccurrenceDate'); occurrenceDate.value=todayISO();
    document.getElementById('slotOccurrenceDone').checked=!!(slot?.completedDates||[]).includes(todayISO());
    refreshLocationSuggestions();
    document.getElementById('slotModal').classList.add('show');
  };
/*__N6_UNIT__*/  function refreshLocationSuggestions(){
    const locs = new Set();
    Object.values(coachSchedule).forEach(sched => Object.values(sched || {}).forEach(slot => { if (slot && slot.location) locs.add(slot.location); }));
    document.getElementById('slotLocationList').innerHTML = [...locs].map(l => `<option value="${escapeHtml(l)}">`).join('');
  }
/*__N6_UNIT__*/  window.beginAddSlotClient = function(){ if(!activeSlot) return; activeSlot.addingClient=true; document.getElementById('slotClientSelect').value=''; document.getElementById('slotClientName').value=''; document.getElementById('slotClientName').placeholder='Pilih/tulis klien tambahan'; document.getElementById('slotAddClientAction').style.display='none'; document.getElementById('btnSaveSlot').textContent='Tambahkan ke Sesi'; };
/*__N6_UNIT__*/  window.closeSlotModal = function(){ document.getElementById('slotModal').classList.remove('show'); activeSlot = null; };
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
/*__N6_UNIT__*/  async function clearSlot(){
    if (!activeSlot) return;
    const { coachId, day, blockKey } = activeSlot;
    if (coachSchedule[coachId]) delete coachSchedule[coachId][day + '|' + blockKey];
    await persistCoachSchedule();
    closeSlotModal();
    showToast('Slot dikosongkan');
    renderAll();
  }

/*__N6_UNIT__*/  window.openCoachForm = function(){
    // Daftar coach dihapus, kelola via Kelola Anggota.
    if (typeof showToast === 'function') showToast('Kelola coach via menu Kelola Anggota');
    if (typeof switchPanel === 'function') switchPanel('akun');
  };
/*__N6_UNIT__*/  window.editCoach = function(id){
    // Daftar coach dihapus, kelola via Kelola Anggota.
    if (typeof showToast === 'function') showToast('Kelola coach via menu Kelola Anggota');
    if (typeof switchPanel === 'function') switchPanel('akun');
  };
/*__N6_UNIT__*/  window.closeCoachForm = function(){ document.getElementById('coachFormModal').classList.remove('show'); };
/*__N6_UNIT__*/  async function saveCoachForm(){
    const name = document.getElementById('cfName').value.trim();
    if (!name){ showToast('Nama coach wajib diisi'); return; }
    let id = document.getElementById('cfCoachId').value;
    const isNew = !id;
    if (isNew){
      let base = slugify(name) || 'coach'; id = base; let n = 2;
      while (coachRoster.some(c => c.id === id)){ id = base + '-' + n; n++; }
    }
    const data = { id, name, phone: document.getElementById('cfPhone').value.trim() };
    if (isNew) coachRoster.push(data);
    else { const idx = coachRoster.findIndex(c => c.id === id); coachRoster[idx] = data; }
    await persistCoachRoster();
    closeCoachForm();
    showToast(isNew ? 'Coach baru ditambahkan' : 'Data coach diperbarui');
    populateCoachFilters();
    populateFormSelects();
    renderAll();
  }
/*__N6_UNIT__*/  window.deleteCoach = function(id){
    const c = coachById(id);
    if (!c) return;
    if (!confirm('Hapus coach "' + c.name + '" dari roster? Jadwal ketersediaannya juga akan dihapus.')) return;
    coachRoster = coachRoster.filter(x => x.id !== id);
    delete coachSchedule[id];
    Promise.all([persistCoachRoster(), persistCoachSchedule()]).then(() => {
      showToast('Coach dihapus');
      populateCoachFilters();
      populateFormSelects();
      renderAll();
    });
  };

  /* ================= RENDER ALL ================= */
