/**
 * N6 modules - owner / tiket
 * menu label : Tiket & Keluhan
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
  function renderTickets(){
    const linkedAuto = new Set(tickets.map(t => t.autoKey).filter(Boolean));
    const items = [];
    tickets.forEach(t => items.push({ ...t, kind:'manual' }));
    autoIssueMap = {};
    autoIssues().forEach(a => {
      const key = a.clientId + '|' + a.date;
      autoIssueMap[key] = { clientId:a.clientId, clientName:a.clientName, detail:a.issue };
      if (!linkedAuto.has(key) && !deletedAutoTickets.includes(key)) items.push({ id:'auto-'+key, clientId:a.clientId, clientName:a.clientName, subject:'Keluhan dari laporan latihan', detail:a.issue, priority:'Sedang', status:'Baru', createdAt:a.date, kind:'auto', autoKey:key });
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
          <button class="btn-danger-sm" data-ticket-delete="${encodeURIComponent(String(t.id))}" data-ticket-kind="${t.kind}" data-ticket-autokey="${encodeURIComponent(t.autoKey||'')}">Hapus</button>
        </div>
      </div>`).join('') : '<div class="list-empty">Tidak ada tiket pada kategori ini.</div>';
  }

  document.getElementById('ticketListBody').addEventListener('click',event=>{
    const btn=event.target.closest('[data-ticket-delete]');if(!btn)return;
    deleteTeamTicket(decodeURIComponent(btn.dataset.ticketDelete),btn.dataset.ticketKind,decodeURIComponent(btn.dataset.ticketAutokey));
  });
  window.deleteTeamTicket=async function(id,kind,autoKey){
    if(!confirm('Hapus tiket/keluhan ini dari daftar? Tindakan ini tidak dapat dibatalkan.'))return;
    if(kind==='auto'){
      const next=[...new Set([...deletedAutoTickets,autoKey])];
      if(!await storeSet('deletedAutoTickets',JSON.stringify(next))){showToast('Gagal menyimpan penghapusan');return;}
      deletedAutoTickets=next;
    }else{
      const next=tickets.filter(t=>String(t.id)!==String(id));
      if(!await storeSet('tickets',JSON.stringify(next))){showToast('Gagal menghapus tiket');return;}
      tickets=next;
      if(autoKey){
        const hidden=[...new Set([...deletedAutoTickets,autoKey])];
        if(await storeSet('deletedAutoTickets',JSON.stringify(hidden)))deletedAutoTickets=hidden;
      }
    }
    renderAll();showToast('Tiket dihapus');
  };
  window.updateTicketStatus = function(id, status){
    const t = tickets.find(x => x.id === id);
    if (!t) return;
    t.status = status;
    persistTickets().then(() => { showToast('Status tiket diperbarui'); renderAll(); });
  };
  window.convertAutoTicket = function(autoKey){
    const src = autoIssueMap[autoKey];
    if (!src) return;
    tickets.push({ id: 't-' + Date.now(), clientId:src.clientId, clientName:src.clientName, subject:'Keluhan dari laporan latihan', detail:src.detail, priority:'Sedang', status:'Diproses', createdAt: todayISO(), autoKey });
    persistTickets().then(() => { showToast('Tiket ditindaklanjuti'); renderAll(); });
  };

/*__N6_UNIT__*/  function populateTicketClientSelect(){
    document.getElementById('tClient').innerHTML = clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('') || '<option value="">Belum ada klien</option>';
  }
  window.openTicketForm = function(){
    populateTicketClientSelect();
    document.getElementById('tSubject').value = '';
    document.getElementById('tDetail').value = '';
    document.getElementById('tPriority').value = 'Sedang';
    document.getElementById('tStatus').value = 'Baru';
    document.getElementById('ticketFormModal').classList.add('show');
  };
  window.closeTicketForm = function(){ document.getElementById('ticketFormModal').classList.remove('show'); };
