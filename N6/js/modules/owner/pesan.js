/**
 * N6 modules - owner / pesan
 * menu label : Pesan
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
  function renderMessages(){
    const rows = [...clients].sort((a,b) => {
      const ma = lastMessage(a.id), mb = lastMessage(b.id);
      return (mb ? new Date(mb.at) : 0) - (ma ? new Date(ma.at) : 0);
    });
    document.getElementById('messageListBody').innerHTML = rows.length ? rows.map(c => {
      const m = lastMessage(c.id);
      const waiting = m && m.sender === 'client';
      return `
      <div class="client-row" onclick="openChatModal('${c.id}')">
        <div>
          <div class="name">${escapeHtml(c.name)} ${waiting ? '<span class="unread-dot" style="display:inline-block; vertical-align:middle; margin-left:6px;"></span>' : ''}</div>
          <div class="msg-preview">${m ? ((m.sender === 'client' ? 'Klien' : 'Kamu') + ': ' + m.text) : 'Belum ada percakapan — klik untuk mulai chat'}</div>
        </div>
        <div class="client-tags">${m ? `<span class="badge neutral">${new Date(m.at).toLocaleDateString('id-ID')}</span>` : ''}</div>
      </div>`;
    }).join('') : '<div class="list-empty">Belum ada klien terdaftar.</div>';
  }

/*__N6_UNIT__*/  function formatChatTime(iso){
    const d = new Date(iso);
    return d.getDate() + '/' + (d.getMonth()+1) + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }
  window.openChatModal = function(clientId){
    const c = clients.find(x => x.id === clientId);
    if (!c) return;
    activeChatClientId = clientId;
    document.getElementById('chatModalTitle').textContent = 'Chat — ' + c.name;
    document.getElementById('templateSelect').value = '';
    renderChatThread();
    document.getElementById('chatModal').classList.add('show');
  };
  window.closeChatModal = function(){ document.getElementById('chatModal').classList.remove('show'); activeChatClientId = null; };
/*__N6_UNIT__*/  function renderChatThread(){
    const thread = document.getElementById('chatThread');
    const arr = chatCache[activeChatClientId] || [];
    thread.innerHTML = arr.length ? arr.map(m => {
      const cls = m.sender === 'coach' ? 'cs' : 'client';
      const label = m.sender === 'coach' ? 'Kamu (Coach/CS)' : 'Klien';
      return `<div class="chat-bubble ${cls}"><div class="sender">${label}</div>${escapeHtml(m.text)}<div class="time">${formatChatTime(m.at)}</div></div>`;
    }).join('') : '<p class="chat-empty">Belum ada percakapan dengan klien ini. Mulai chat lewat kotak di bawah.</p>';
    thread.scrollTop = thread.scrollHeight;
  }
/*__N6_UNIT__*/  async function sendChatMessage(){
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !activeChatClientId) return;
    if (!chatCache[activeChatClientId]) chatCache[activeChatClientId] = [];
    chatCache[activeChatClientId].push({ sender:'coach', text, at:new Date().toISOString() });
    await persistChat(activeChatClientId);
    input.value = '';
    renderChatThread();
    renderAll();
  }

  /* ================= BROADCAST ================= */
/*__N6_UNIT__*/  async function sendBroadcast(){
    const text = document.getElementById('bMessage').value.trim();
    if (!text) { showToast('Isi pesan broadcast dulu'); return; }
    const targets = broadcastTargets();
    if (!targets.length){ showToast('Tidak ada klien pada target ini'); return; }
    for (const c of targets){
      if (!chatCache[c.id]) chatCache[c.id] = [];
      chatCache[c.id].push({ sender:'coach', text, at:new Date().toISOString() });
      await persistChat(c.id);
    }
    closeBroadcast();
    showToast('Broadcast terkirim ke ' + targets.length + ' klien');
    renderAll();
  }

