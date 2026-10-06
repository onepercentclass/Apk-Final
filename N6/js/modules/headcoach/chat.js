/**
 * N6 modules - headcoach / chat
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderChatThread(role){
    const el = document.getElementById(role === 'admin' ? 'chatThreadAdmin' : 'chatThreadOwner');
    if (!el) return;
    const msgs = internalChats[role] || [];
    if (!msgs.length){
      el.innerHTML = '<div class="chat-empty">Belum ada percakapan dengan ' + (role === 'admin' ? 'Admin' : 'Owner') + '.</div>';
      return;
    }
    el.innerHTML = msgs.map(m => {
      const mine = m.sender === 'headcoach';
      const who = mine ? 'Anda' : (role === 'admin' ? 'Admin' : 'Owner');
      const time = new Date(m.at).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
      return `<div class="chat-bubble-row ${mine ? 'me' : ''}"><div class="chat-bubble">${escapeHtmlHC(m.text)}<span class="meta">${who} · ${time}</span></div></div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  }

/*__N6_UNIT__*/  async function loadInternalChat(role){
    if (window.storage){
      try{
        const key = 'internalchat:headcoach-' + role;
        const raw = await window.storage.get(key, true);
        if (raw && raw.value) internalChats[role] = JSON.parse(raw.value);
      }catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — memakai data lokal */ }
    }
    renderChatThread(role);
  }

/*__N6_UNIT__*/  window.sendInternalChat = async function(role){
    const inputEl = document.getElementById(role === 'admin' ? 'chatInputAdmin' : 'chatInputOwner');
    const text = inputEl.value.trim();
    if (!text) return;
    const msg = { sender:'headcoach', text:text, at:new Date().toISOString() };
    internalChats[role] = internalChats[role] || [];
    internalChats[role].push(msg);
    inputEl.value = '';
    renderChatThread(role);
    if (window.storage){
      try{
        const key = 'internalchat:headcoach-' + role;
        await window.storage.set(key, JSON.stringify(internalChats[role]), true);
      }catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — pesan tetap tersimpan lokal di atas */ }
    }
    showToast('Pesan terkirim ke ' + (role === 'admin' ? 'Admin' : 'Owner') + '.');
  };

/*__N6_UNIT__*/  window.openClientDetail = function(id){
    const c = clients.find(x => String(x.id) === String(id));
    if (!c) return;
    document.getElementById('clientDetailTitle').textContent = c.name;
    document.getElementById('clientDetailBody').innerHTML = `
      <div class="progress-row">
        <div class="progress-row-top"><span class="pname">Coach</span><span class="pgoal">${c.coach}</span></div>
      </div>
      <div class="progress-row">
        <div class="progress-row-top"><span class="pname">Target</span><span class="pgoal">${c.goal}</span></div>
      </div>
      <div class="progress-row">
        <div class="progress-row-top"><span class="pname">Status</span><span class="badge ${statusTone(c.status)}">${c.status}</span></div>
      </div>
      ${c.note ? `<div class="rapor-note" style="margin-top:12px;"><b>Catatan:</b> ${c.note}</div>` : ''}
      <a href="${clientPortalUrl(c.name, true)}" target="_blank" rel="noopener" class="btn-outline" style="display:block; text-align:center; text-decoration:none; margin-top:16px;">Lihat Dashboard Lengkap Klien ↗</a>
    `;
    document.getElementById('clientDetailModal').classList.add('show');
  };
/*__N6_UNIT__*/  window.closeClientDetail = function(){
    document.getElementById('clientDetailModal').classList.remove('show');
  };

  /* ================= RENDER: PERSETUJUAN ================= */
