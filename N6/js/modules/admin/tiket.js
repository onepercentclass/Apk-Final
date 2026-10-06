/**
 * N6 modules - admin / tiket
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderTickets(){
    const linkedAuto = new Set(tickets.map(t => t.autoKey).filter(Boolean));
    const items = [];
    tickets.forEach(t => items.push({ ...t, kind:'manual' }));
    autoIssueMap = {};
    autoIssues().forEach(a => {
      const key = a.clientId + '|' + a.date;
      autoIssueMap[key] = { clientId:a.clientId, clientName:a.clientName, detail:a.issue };
      if (!linkedAuto.has(key)) items.push({ id:'auto-'+key, clientId:a.clientId, clientName:a.clientName, subject:'Keluhan dari laporan latihan', detail:a.issue, priority:'Sedang', status:'Baru', createdAt:a.date, kind:'auto', autoKey:key });
    });
    items.sort((a,b) => (b.createdAt||'').localeCompare(a.createdAt||''));

    const filtered = items.filter(t => {
      if (ticketFilter === 'baru') return t.status === 'Baru';
      if (ticketFilter === 'diproses') return t.status === 'Diproses';
      if (ticketFilter === 'selesai') return t.status === 'Selesai';
      return true;
    });

    document.getElementById('ticketListBody').innerHTML = filtered.length ? filtered.map(t => `
      <div class="ticket-item">
        <div class="ticket-top">
          <div><div class="who">${escapeHtml(t.clientName)} ${t.kind === 'auto' ? '<span class="badge blue" style="margin-left:6px;">Otomatis</span>' : ''}</div>
          <div class="ticket-subject">${escapeHtml(t.subject)}</div></div>
          <div style="text-align:right;">
            <span class="badge ${t.status === 'Selesai' ? 'green' : t.status === 'Diproses' ? 'amber' : 'red'}">${t.status}</span>
            <div class="when">${formatDateID(t.createdAt)}</div>
          </div>
        </div>
        <div class="ticket-detail">${escapeHtml(t.detail || '-')}</div>
        <div class="ticket-actions">
          ${t.kind === 'auto'
            ? `<button class="btn-sm" onclick="convertAutoTicket('${t.autoKey}')">Tindak Lanjuti</button>`
            : `<select class="btn-sm" style="padding:6px 8px;" onchange="updateTicketStatus('${t.id}', this.value)">
                <option value="Baru" ${t.status==='Baru'?'selected':''}>Baru</option>
                <option value="Diproses" ${t.status==='Diproses'?'selected':''}>Diproses</option>
                <option value="Selesai" ${t.status==='Selesai'?'selected':''}>Selesai</option>
              </select>
              <button class="btn-outline" style="padding:6px 12px; font-size:12px; margin-top:0;" onclick="openChatModal('${t.clientId}')">Chat Klien</button>`
          }
        </div>
      </div>`).join('') : '<div class="list-empty">Tidak ada tiket pada kategori ini.</div>';
  }

/*__N6_UNIT__*/  window.updateTicketStatus = function(id, status){
    const t = tickets.find(x => String(x.id) === String(id));
    if (!t) return;
    t.status = status;
    persistTickets().then(() => { showToast('Status tiket diperbarui'); renderAll(); });
  };
/*__N6_UNIT__*/  window.convertAutoTicket = function(autoKey){
    const src = autoIssueMap[autoKey];
    if (!src) return;
    tickets.push({ id: 't-' + Date.now(), clientId:src.clientId, clientName:src.clientName, subject:'Keluhan dari laporan latihan', detail:src.detail, priority:'Sedang', status:'Diproses', createdAt: todayISO(), autoKey });
    persistTickets().then(() => { showToast('Tiket ditindaklanjuti'); renderAll(); });
  };

/*__N6_UNIT__*/  function populateTicketClientSelect(){
    document.getElementById('tClient').innerHTML = clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('') || '<option value="">Belum ada klien</option>';
  }
/*__N6_UNIT__*/  window.openTicketForm = function(){
    populateTicketClientSelect();
    document.getElementById('tSubject').value = '';
    document.getElementById('tDetail').value = '';
    document.getElementById('tPriority').value = 'Sedang';
    document.getElementById('tStatus').value = 'Baru';
    document.getElementById('ticketFormModal').classList.add('show');
  };
/*__N6_UNIT__*/  window.closeTicketForm = function(){ document.getElementById('ticketFormModal').classList.remove('show'); };
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
