/**
 * N6 modules - owner / klien
 * menu label : Klien
 * minimum tier: 1
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/owner/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/owner.js. Concatenating every fragment in manifest
 * order reproduces owner.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__
  async function loadAllData(){
    const catalogRaw = await storeGet('programCatalog');
    try{ programCatalog = catalogRaw ? JSON.parse(catalogRaw) : []; }catch(e){ programCatalog = []; }
    if (!programCatalog.length){ programCatalog = DEFAULT_PROGRAM_CATALOG; await storeSet('programCatalog', JSON.stringify(programCatalog)); }

    const rosterRaw = await storeGet('coachRoster');
    try{ coachRoster = rosterRaw ? JSON.parse(rosterRaw) : []; }catch(e){ coachRoster = []; }
    if (!coachRoster.length && rosterRaw === null){ coachRoster = DEFAULT_COACH_ROSTER; /* local display fallback only; never inject demo coaches into Admin */ }

    const schedRaw = await storeGet('coachSchedule');
    try{ coachSchedule = schedRaw ? JSON.parse(schedRaw) : {}; }catch(e){ coachSchedule = {}; }

    const dayOffRaw = await storeGet('coachDayOff');
    try{ coachDayOff = dayOffRaw ? JSON.parse(dayOffRaw) : {}; }catch(e){ coachDayOff = {}; }

    const expenseRaw = await storeGet('expenses');
    try{ expenses = expenseRaw ? JSON.parse(expenseRaw) : []; }catch(e){ expenses = []; }

    const clientsRaw = await storeGet('clients');
    try{ clients = clientsRaw ? JSON.parse(clientsRaw) : []; }catch(e){ clients = []; }

    const deletedRaw=await storeGet('deletedAutoTickets');
    try{deletedAutoTickets=deletedRaw?JSON.parse(deletedRaw):[];}catch(e){deletedAutoTickets=[];}
    const ticketsRaw = await storeGet('tickets');
    try{ tickets = ticketsRaw ? JSON.parse(ticketsRaw) : []; }catch(e){ tickets = []; }

    try{teamPayments=JSON.parse(await storeGet('teamPayments')||'{}')||{};}catch(e){teamPayments={};}
    const archiveRaw = await storeGet('archivedClients');
    try{ archivedClients = archiveRaw ? JSON.parse(archiveRaw) : []; }catch(e){ archivedClients = []; }

    const seeded = seedDemoIfEmpty();

    chatCache = {}; reportsCache = {}; programCache = {};
    for (const c of clients){
      if (!seeded || chatCache[c.id] === undefined){
        const cRaw = await storeGet('chat:' + c.id);
        try{ chatCache[c.id] = cRaw ? JSON.parse(cRaw) : (chatCache[c.id] || []); }catch(e){ chatCache[c.id] = chatCache[c.id] || []; }
      }
      if (reportsCache[c.id] === undefined){
        const rRaw = await storeGet('reports:' + c.id);
        try{ reportsCache[c.id] = rRaw ? JSON.parse(rRaw) : (reportsCache[c.id] || {}); }catch(e){ reportsCache[c.id] = reportsCache[c.id] || {}; }
      }
      if (programCache[c.id] === undefined){
        const pRaw = await storeGet('program:' + c.id);
        try{ programCache[c.id] = pRaw ? JSON.parse(pRaw) : (programCache[c.id] || { pbStart:'', pbEnd:'', startDate:'', endDate:'' }); }catch(e){ programCache[c.id] = programCache[c.id] || { pbStart:'', pbEnd:'', startDate:'', endDate:'' }; }
      }
    }

    if (seeded){
      await storeSet('clients', JSON.stringify(clients));
      for (const c of clients){
        await storeSet('chat:' + c.id, JSON.stringify(chatCache[c.id] || []));
        await storeSet('reports:' + c.id, JSON.stringify(reportsCache[c.id] || {}));
        await storeSet('program:' + c.id, JSON.stringify(programCache[c.id] || {}));
      }
    }

    // Auto-arsip: klien Nonaktif (program sudah berakhir) 10 hari berturut-turut otomatis dipindah ke Arsip
    const stillActive = [];
    let autoArchivedCount = 0;
    for (const c of clients){
      const p = programCache[c.id] || {};
      if (p.endDate && /^\d{4}-\d{2}-\d{2}$/.test(String(p.endDate)) && daysBetween(p.endDate, todayISO()) >= 10){
        // Idempotent archive: do not create duplicate archive records for the same client.
        if (!archivedClients.some(a => String(a.id) === String(c.id))) archivedClients.push({ ...c, archivedAt: todayISO(), programSnapshot: p });
        autoArchivedCount++;
      } else {
        stillActive.push(c);
      }
    }
    if (autoArchivedCount > 0){
      clients = stillActive;
      await storeSet('clients', JSON.stringify(clients));
      await storeSet('archivedClients', JSON.stringify(archivedClients));
    }
    pendingArchiveNotice = autoArchivedCount;
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
          <div class="meta">${escapeHtml(c.programLabel || 'Belum ada program')} — Coach ${escapeHtml(c.coach || '-')}</div>
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

  /* ================= ARSIP KLIEN (auto, Nonaktif >10 hari) ================= */
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
    if (!name){ document.getElementById('clientFormError').style.display = 'block'; return; }
    let id = document.getElementById('fClientId').value;
    const isNew = !id;
    if (isNew){
      let base = slugify(name) || 'klien';
      id = base; let n = 2;
      while (clients.some(c => String(c.id) === String(id))){ id = base + '-' + n; n++; }
    }

    const progId = document.getElementById('fProgram').value;
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

    const data = {
      id, name,
      phone: document.getElementById('fPhone').value.trim(),
      coach: document.getElementById('fCoach').value,
      programId: progId, programLabel, packageMeta, price, priceLabel,
      status: 'Aktif',
      joinDate: isNew ? todayISO() : (clients.find(c=>String(c.id)===String(id))||{}).joinDate || todayISO(),
      paymentStatus: document.getElementById('fPaymentStatus').value,
      amountPaid: parseInt(document.getElementById('fAmountPaid').value, 10) || 0,
      invoiceNumber: (clients.find(c=>String(c.id)===String(id))||{}).invoiceNumber || '',
      notes: document.getElementById('fNotes').value.trim()
    };
    if (isNew){ clients.push(data); }
    else { const idx = clients.findIndex(c => String(c.id) === String(id)); clients[idx] = { ...clients[idx], ...data }; }

    programCache[id] = {
      pbStart: document.getElementById('fPbStart').value.trim(),
      pbEnd: document.getElementById('fPbEnd').value.trim(),
      startDate: document.getElementById('fStart').value,
      endDate: document.getElementById('fEnd').value
    };
    if (!chatCache[id]) chatCache[id] = [];
    if (!reportsCache[id]) reportsCache[id] = {};

    await persistClients();
    await persistProgram(id);
    if (isNew){ await storeSet('chat:' + id, JSON.stringify(chatCache[id])); await storeSet('reports:' + id, JSON.stringify(reportsCache[id])); }

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
/*__N6_UNIT__*/  function ensureInvoiceNumber(c){
    if (!c.invoiceNumber){
      c.invoiceNumber = 'INV/N6/' + todayISO().replace(/-/g,'') + '/' + c.id.slice(0,6).toUpperCase();
      persistClients();
    }
    return c.invoiceNumber;
  }

  window.downloadInvoice = function(id){
    const c = clients.find(x => String(x.id) === String(id));
    if (!c){ showToast('Klien tidak ditemukan'); return; }
    const p = programCache[c.id] || {};
    const invoiceNo = ensureInvoiceNumber(c);

    const W = 900, H = 1273;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // background
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);

    // header bar
    ctx.fillStyle = '#111110'; ctx.fillRect(0, 0, W, 150);
    ctx.fillStyle = '#D62828'; ctx.fillRect(50, 42, 66, 66);
    ctx.fillStyle = '#FFFFFF'; ctx.font = '800 26px Arial'; ctx.textAlign = 'center';
    ctx.fillText('N6', 83, 84);
    ctx.textAlign = 'left';
    ctx.font = '800 24px Arial'; ctx.fillText('NUMBER SIX RUNNING TRAINING', 134, 68);
    ctx.font = '400 14px Arial'; ctx.fillStyle = '#C9C7BE';
    ctx.fillText('n6sport.id  ·  WA 0851-4726-7786', 134, 92);
    ctx.textAlign = 'right'; ctx.fillStyle = '#FFFFFF'; ctx.font = '800 34px Arial';
    ctx.fillText('INVOICE', W - 50, 80);
    ctx.font = '400 14px Arial'; ctx.fillStyle = '#C9C7BE';
    ctx.fillText(invoiceNo, W - 50, 105);
    ctx.textAlign = 'left';

    let y = 200;
    // meta row: tanggal + status
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('TANGGAL INVOICE', 50, y);
    ctx.fillStyle = '#111110'; ctx.font = '600 15px Arial';
    ctx.fillText(formatDateID(todayISO()), 50, y + 22);

    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('STATUS PEMBAYARAN', 330, y);
    const pay = c.paymentStatus || 'Belum Lunas';
    const payColor = pay === 'Lunas' ? '#1E8E3E' : pay === 'DP Sebagian' ? '#B7791F' : '#D62828';
    const payBg = pay === 'Lunas' ? '#E8F5EC' : pay === 'DP Sebagian' ? '#FBF1DF' : '#FCEBEB';
    roundRectPath(ctx, 330, y + 10, 150, 30, 15);
    ctx.fillStyle = payBg; ctx.fill();
    ctx.fillStyle = payColor; ctx.font = '800 13px Arial'; ctx.textAlign = 'center';
    ctx.fillText(pay.toUpperCase(), 405, y + 30);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('COACH PENDAMPING', 610, y);
    ctx.fillStyle = '#111110'; ctx.font = '600 15px Arial';
    ctx.fillText(c.coach || '-', 610, y + 22);

    y += 70;
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(W - 50, y); ctx.stroke();
    y += 40;

    // ditagihkan kepada
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('DITAGIHKAN KEPADA', 50, y);
    y += 26;
    ctx.fillStyle = '#111110'; ctx.font = '800 22px Arial';
    ctx.fillText(c.name, 50, y);
    y += 26;
    ctx.fillStyle = '#3B3A36'; ctx.font = '400 14px Arial';
    ctx.fillText(c.phone || '-', 50, y);
    y += 20;
    ctx.fillText('Periode program: ' + formatDateID(p.startDate) + ' – ' + formatDateID(p.endDate), 50, y);

    y += 50;
    // table header
    ctx.fillStyle = '#F5F3EE'; ctx.fillRect(50, y, W - 100, 40);
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('DESKRIPSI PROGRAM', 66, y + 25);
    ctx.textAlign = 'right'; ctx.fillText('BIAYA', W - 66, y + 25); ctx.textAlign = 'left';
    y += 40;

    // table row
    const rowTop = y;
    ctx.fillStyle = '#111110'; ctx.font = '700 16px Arial';
    ctx.fillText(c.programLabel || '-', 66, y + 30);
    ctx.font = '400 13px Arial'; ctx.fillStyle = '#6E6C64';
    let detailLine = '';
    const meta = c.packageMeta || {};
    if (meta.mode === 'configurable') detailLine = meta.totalSessions + 'x pertemuan (' + meta.meetings + 'x/minggu × ' + meta.weeks + ' minggu)';
    else if (meta.mode === 'fixed') detailLine = 'Paket tetap';
    else if (meta.mode === 'custom') detailLine = (meta.partnerName ? meta.partnerName + ' — ' : '') + (meta.count ? meta.count + ' peserta' : '') + (meta.note ? ' · ' + meta.note : '');
    let extraLines = detailLine ? wrapText(ctx, detailLine, 66, y + 52, 560, 18) : 0;
    ctx.textAlign = 'right'; ctx.fillStyle = '#111110'; ctx.font = '700 16px Arial';
    ctx.fillText(formatRupiah(c.price || 0), W - 66, y + 30);
    ctx.textAlign = 'left';
    y = rowTop + Math.max(60, 40 + extraLines * 18);

    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(W - 50, y); ctx.stroke();
    y += 34;

    // totals
    const price = c.price || 0;
    const paid = c.amountPaid || 0;
    const remaining = Math.max(0, price - paid);
    function totalRow(label, value, bold){
      ctx.fillStyle = bold ? '#111110' : '#6E6C64';
      ctx.font = (bold ? '800 20px' : '400 14px') + ' Arial';
      ctx.fillText(label, 480, y);
      ctx.textAlign = 'right'; ctx.fillText(value, W - 66, y); ctx.textAlign = 'left';
      y += bold ? 34 : 26;
    }
    totalRow('Total Tagihan', formatRupiah(price), false);
    if (pay === 'DP Sebagian'){
      totalRow('Sudah Dibayar', formatRupiah(paid), false);
      totalRow('SISA TAGIHAN', formatRupiah(remaining), true);
    } else if (pay === 'Lunas'){
      totalRow('TOTAL DIBAYAR', formatRupiah(price), true);
    } else {
      totalRow('TOTAL TAGIHAN', formatRupiah(price), true);
    }

    // footer
    const footY = H - 130;
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(50, footY); ctx.lineTo(W - 50, footY); ctx.stroke();
    ctx.fillStyle = '#3B3A36'; ctx.font = '600 14px Arial';
    ctx.fillText('Terima kasih telah bergabung bersama N6 Running Training.', 50, footY + 34);
    ctx.fillStyle = '#6E6C64'; ctx.font = '400 12.5px Arial';
    ctx.fillText('Pertanyaan seputar invoice ini bisa hubungi Admin CS via WhatsApp 0851-4726-7786.', 50, footY + 56);
    ctx.fillText('Dokumen ini dibuat otomatis oleh sistem Admin CS N6 — ' + formatDateID(todayISO()) + '.', 50, footY + 78);

    const link = document.createElement('a');
    link.download = 'Invoice-' + slugify(c.name) + '-' + todayISO() + '.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.93);
    link.click();
    showToast('Invoice diunduh');
  };

  /* ================= DETAIL KLIEN ================= */
  window.openClientDetail = function(id){
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
      </div>
      ${c.notes ? `<div class="note-box">Catatan internal: ${escapeHtml(c.notes)}</div>` : ''}
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
  window.closeClientDetail = function(){ document.getElementById('clientDetailModal').classList.remove('show'); };

  /* ================= RENDER: JADWAL KLIEN ================= */
/*__N6_UNIT__*/  function performaTicketStats(coachName){
    const coachClientIds = new Set(clients.filter(c => c.coach === coachName).map(c => c.id));
    const own = tickets.filter(t => coachClientIds.has(t.clientId));
    return { handled: own.length, done: own.filter(t => t.status === 'Selesai').length };
  }
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
/*__N6_UNIT__*/  const panelTitles = { beranda:'Beranda', klien:'Klien', jadwalklien:'Jadwal Klien', jadwalcoach:'Jadwal Coach', harga:'Harga & Program', komisi:'Performa & Komisi', keuangan:'Keuangan', performa:'Performa Tim', tiket:'Tiket & Keluhan', pesan:'Pesan' };
/*__N6_UNIT__*/  function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarOverlay.classList.remove('show'); document.getElementById('mobileMoreBtn').setAttribute('aria-expanded','false'); }
  document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
  document.getElementById('mobileMoreBtn').addEventListener('click', openSidebar);
  document.addEventListener('keydown', e => {if(e.key === 'Escape') closeSidebar();});
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ================= SUBTABS (Tiket) ================= */
  document.querySelectorAll('.subtab-btn[data-sub]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-sub]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ticketFilter = btn.dataset.sub;
      renderTickets();
    });
  });

  /* ================= SUBTABS (Klien: Aktif / Arsip) ================= */
  document.querySelectorAll('.subtab-btn[data-klienview]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-klienview]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#klienview-aktif, #klienview-arsip').forEach(p => p.classList.remove('active'));
      document.getElementById('klienview-' + btn.dataset.klienview).classList.add('active');
    });
  });

  /* ================= SUBTABS (Jadwal Coach: Mingguan / Kalender) ================= */
  document.getElementById('toggleCoachGuide')?.addEventListener('click',()=>{const box=document.getElementById('coachGuide'),btn=document.getElementById('toggleCoachGuide');const open=box.style.display!=='none';box.style.display=open?'none':'block';btn.textContent=open?'Lihat keterangan':'Sembunyikan keterangan';btn.setAttribute('aria-expanded',String(!open));});
  document.querySelectorAll('.subtab-btn[data-coachpage]').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.subtab-btn[data-coachpage]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('#coachpage-schedule,#coachpage-roster').forEach(p=>p.classList.remove('active'));document.getElementById('coachpage-'+btn.dataset.coachpage).classList.add('active');});});

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

  /* ================= FILTER KEUANGAN ================= */
  document.querySelectorAll('.subtab-btn[data-finfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-finfilter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      finFilterMode = btn.dataset.finfilter;
      document.getElementById('finMonthPicker').style.display = finFilterMode === 'month' ? 'inline-block' : 'none';
      if (finFilterMode === 'month' && !document.getElementById('finMonthPicker').value){
        document.getElementById('finMonthPicker').value = finSelectedMonth;
      }
      renderKeuangan();
    });
  });
  document.getElementById('finMonthPicker').addEventListener('change', e => {
    if (!e.target.value) return;
    finSelectedMonth = e.target.value;
    renderKeuangan();
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
  document.getElementById('btnSaveSlot').addEventListener('click', saveSlot);
  document.getElementById('btnClearSlot').addEventListener('click', clearSlot);
  document.getElementById('klienSearchInput').addEventListener('input', renderClientList);
  document.getElementById('klienFilterCoach').addEventListener('change', renderClientList);
  document.getElementById('klienFilterStatus').addEventListener('change', renderClientList);
  document.getElementById('btnTambahProgram').addEventListener('click', () => openProgramForm());
  document.getElementById('btnSaveProgram').addEventListener('click', saveProgramForm);
  document.getElementById('btnDeleteProgram').addEventListener('click', deleteProgramConfirm);
  document.getElementById('btnTambahPengeluaran').addEventListener('click', openExpenseForm);
  document.getElementById('btnSaveExpense').addEventListener('click', saveExpenseForm);
  document.getElementById('globalSearch').addEventListener('input', (e) => {
    switchPanel('klien');
    document.getElementById('klienSearchInput').value = e.target.value;
    renderClientList();
  });


  /* Analytics: seluruh angka berasal dari state dashboard yang sama. */
