/**
 * N6 modules - admin / klien
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderClientList(){
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
/*__N6_UNIT__*/  window.restoreArchivedClient = function(id){
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
/*__N6_UNIT__*/  window.deleteArchivedClient = function(id){
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

/*__N6_UNIT__*/  window.copyClientLink = function(id, btn){
    const url = clientPortalUrl(id);
    const full = (window.location.href.split('?')[0].replace(/[^\/]+$/, '')) + url;
    const text = full || url;
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(() => flashCopied(btn));
    } else {
      flashCopied(btn);
    }
  };
/*__N6_UNIT__*/  function flashCopied(btn){
    if (!btn) return;
    const orig = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = 'Tersalin!';
    setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = orig; }, 1500);
    showToast('Link dashboard klien disalin');
  }

  /* ================= FORM TAMBAH/EDIT KLIEN — PROGRAM DINAMIS ================= */
/*__N6_UNIT__*/  function populateFormSelects(){
    document.getElementById('fCoach').innerHTML = coachRoster.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
    document.getElementById('fProgram').innerHTML = '<option value="">Pilih program</option>' +
      ['Online','Offline','Kerja Sama'].map(cat => {
        const opts = programCatalog.filter(p => p.category === cat).map(p => `<option value="${p.id}">${escapeHtml(p.label)}</option>`).join('');
        return opts ? `<optgroup label="${cat}">${opts}</optgroup>` : '';
      }).join('');
  }

/*__N6_UNIT__*/  function computeConfigPrice(program, meetings, weeks){
    const totalSessions = Math.max(1, meetings) * Math.max(1, weeks);
    const total = totalSessions * program.ratePerSesi;
    return { totalSessions, total };
  }

/*__N6_UNIT__*/  function renderProgramFields(){
    const progId = document.getElementById('fProgram').value;
    const program = catalogById(progId);
    const configWrap = document.getElementById('fConfigWrap');
    const fixedWrap = document.getElementById('fFixedWrap');
    const customWrap = document.getElementById('fCustomWrap');
    const semiWrap = document.getElementById('fSemiWrap');
    const nameLabel = document.getElementById('fNameLabel');
    configWrap.style.display = 'none'; fixedWrap.style.display = 'none'; customWrap.style.display = 'none';

    const isSemi = progId === 'semi-private';
    semiWrap.style.display = isSemi ? 'block' : 'none';
    nameLabel.textContent = isSemi ? 'Nama Klien 1' : 'Nama Lengkap';
    if (!isSemi) document.getElementById('fName2').value = '';

    if (!program) return;

    if (program.mode === 'configurable'){
      configWrap.style.display = 'block';
      updateConfigPriceBox();
    } else if (program.mode === 'fixed'){
      fixedWrap.style.display = 'block';
      document.getElementById('fPriceBoxFixed').innerHTML = `
        <div class="row"><span>Program</span><span>${escapeHtml(program.label)}</span></div>
        <div class="total"><span>Total Biaya</span><span>${formatRupiah(program.price)}</span></div>
        <div class="row"><span>Durasi</span><span>${escapeHtml(program.unit)}</span></div>`;
    } else if (program.mode === 'custom'){
      customWrap.style.display = 'block';
      if (progId === 'korporat'){
        document.getElementById('fCustomNameLabel').textContent = 'Nama Perusahaan';
        document.getElementById('fCustomCountLabel').textContent = 'Jumlah Karyawan';
      } else {
        document.getElementById('fCustomNameLabel').textContent = 'Nama Event';
        document.getElementById('fCustomCountLabel').textContent = 'Jumlah Pacer';
      }
    }
  }
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

/*__N6_UNIT__*/  window.openClientForm = function(){
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
/*__N6_UNIT__*/  window.editClient = function(id){
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
/*__N6_UNIT__*/  window.closeClientForm = function(){ document.getElementById('clientFormModal').classList.remove('show'); };

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
      while (clients.some(c => String(c.id) === String(id2)) || id2 === id){ id2 = base2 + '-' + n2; n2++; }

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

/*__N6_UNIT__*/  window.deleteClient = function(id){
    const c = clients.find(x => String(x.id) === String(id));
    if (!c) return;
    if (!confirm('Hapus klien "' + c.name + '"? Data laporan dan chat klien ini tidak akan tampil lagi di dashboard.')) return;
    clients = clients.filter(x => String(x.id) !== String(id));
    persistClients().then(() => { showToast('Klien dihapus'); renderAll(); });
  };

  /* ================= INVOICE (JPG) ================= */
/*__N6_UNIT__*/  function roundRectPath(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
/*__N6_UNIT__*/  function wrapText(ctx, text, x, y, maxWidth, lineHeight){
    const words = String(text).split(' ');
    let line = '', lines = 0;
    for (let i = 0; i < words.length; i++){
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && line){
        ctx.fillText(line.trim(), x, y + lines * lineHeight);
        line = words[i] + ' ';
        lines++;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), x, y + lines * lineHeight);
    return lines + 1;
  }
/*__N6_UNIT__*/  function wrapLines(ctx, text, maxWidth){
    const words = String(text).split(' ');
    let line = '', lines = [];
    for (let i = 0; i < words.length; i++){
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && line){ lines.push(line.trim()); line = words[i] + ' '; }
      else { line = test; }
    }
    lines.push(line.trim());
    return lines;
  }
/*__N6_UNIT__*/  function nowPrintLabel(){
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
    const jam = now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }).replace(':', '.') + ' WIB';
    return { tanggal, jam };
  }
/*__N6_UNIT__*/  function ensureInvoiceNumber(c){
    if (!c.invoiceNumber){
      c.invoiceNumber = 'INV/N6/' + todayISO().replace(/-/g,'') + '/' + String(c.id).slice(0,6).toUpperCase();
      persistClients();
    }
    return c.invoiceNumber;
  }

/*__N6_UNIT__*/  window.openClientDetail = function(id){
    const c = clients.find(x => String(x.id) === String(id));
    if (!c) return;
    const p = programCache[id] || {};
    const reports = reportsCache[id] || {};
    const reportCount = Object.keys(reports).length;
    const issues = Object.keys(reports).filter(d => reports[d].issue).length;
    document.getElementById('clientDetailTitle').textContent = c.name;
    document.getElementById('clientDetailBody').innerHTML = `
      <div class="detail-grid">
        <div class="detail-item"><div class="l">Telepon</div><div class="v">${escapeHtml(c.phone || '-')}</div></div>
        <div class="detail-item"><div class="l">Coach</div><div class="v">${escapeHtml(c.coach || '-')}</div></div>
        <div class="detail-item full"><div class="l">Program</div><div class="v" style="font-size:13px;">${escapeHtml(c.programLabel || '-')}</div></div>
        <div class="detail-item full"><div class="l">Paket / Biaya</div><div class="v" style="font-size:13px;">${escapeHtml(c.priceLabel || '-')}</div></div>
        <div class="detail-item"><div class="l">Status</div><div class="v">${clientStatus(c)}</div></div>
        <div class="detail-item"><div class="l">Mulai — Selesai</div><div class="v" style="font-size:12.5px;">${formatDateID(p.startDate)} – ${formatDateID(p.endDate)}</div></div>
        <div class="detail-item"><div class="l">Total Laporan</div><div class="v">${reportCount}</div></div>
        <div class="detail-item"><div class="l">Laporan Bermasalah</div><div class="v" style="${issues ? 'color:var(--red);' : ''}">${issues}</div></div>
        ${(c.packageMeta && c.packageMeta.pairLabel) ? `<div class="detail-item full"><div class="l">Pasangan Semi Private</div><div class="v" style="font-size:13px;">${escapeHtml(c.packageMeta.pairLabel)}</div></div>` : ''}
      </div>
      ${c.notes ? `<div class="note-box">Catatan internal: ${escapeHtml(c.notes)}</div>` : ''}
      ${(c.packageMeta && c.packageMeta.pairWith) ? `<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
        <button class="btn-sm" onclick="closeClientDetail(); openClientDetail('${c.packageMeta.pairWith}')">Lihat Data Pasangan (${escapeHtml(c.packageMeta.pairLabel||'')})</button>
        <button class="copy-btn" onclick="copyClientLink('${c.packageMeta.pairWith}', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Salin Link Pasangan
        </button>
      </div>` : ''}
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn-outline" onclick="closeClientDetail(); editClient('${c.id}')">Edit Data</button>
        <button class="btn-outline" onclick="closeClientDetail(); openChatModal('${c.id}')">Buka Chat</button>
        <button class="btn-outline" onclick="downloadInvoice('${c.id}')">Unduh Invoice (JPG)</button>
        <button class="copy-btn" onclick="copyClientLink('${c.id}', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Salin Link Dashboard Client
        </button>
      </div>`;
    document.getElementById('clientDetailModal').classList.add('show');
  };
/*__N6_UNIT__*/  window.closeClientDetail = function(){ document.getElementById('clientDetailModal').classList.remove('show'); };

  /* ================= RENDER: JADWAL KLIEN ================= */
