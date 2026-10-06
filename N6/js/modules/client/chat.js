/**
 * N6 modules - client / chat
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  const isStaffMode = new URLSearchParams(window.location.search).get('staff') === '1';

  /* ================= CHAT ================= */
/*__N6_UNIT__*/  function formatChatTime(iso){
    const d = new Date(iso);
    return d.getDate() + '/' + (d.getMonth()+1) + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }

/*__N6_UNIT__*/  function renderChatThread(){
    const thread = document.getElementById('chatThread');
    if (!thread) return;
    if (chatMessages.length === 0){
      thread.innerHTML = '<p class="chat-empty">Belum ada percakapan. Feedback dari coach akan muncul di sini.</p>';
      return;
    }
    thread.innerHTML = chatMessages.map(m => {
      const cls = m.sender === 'coach' ? 'coach' : 'client';
      const label = m.sender === 'coach' ? 'Head Coach' : 'Kamu';
      return '<div class="chat-bubble ' + cls + '"><div class="sender">' + label + '</div>' +
        escapeHtml(m.text) + '<div class="time">' + formatChatTime(m.at) + '</div></div>';
    }).join('');
  }

/*__N6_UNIT__*/  function scrollChatToBottom(){
    const thread = document.getElementById('chatThread');
    if (thread) thread.scrollTop = thread.scrollHeight;
  }

/*__N6_UNIT__*/  function escapeHtml(s){
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

/*__N6_UNIT__*/  async function sendChatMessage(){
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    chatMessages.push({ sender: isStaffMode ? 'coach' : 'client', text, at: new Date().toISOString() });
    await storeSet('chat:' + clientId, JSON.stringify(chatMessages));
    input.value = '';
    renderChatThread();
    scrollChatToBottom();
  }

