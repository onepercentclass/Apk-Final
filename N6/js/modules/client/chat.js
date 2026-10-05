/**
 * N6 modules - client / chat
 * menu label : Chat
 * minimum tier: 4
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/client/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/client.js. Concatenating every fragment in manifest
 * order reproduces client.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__
  function renderShell(){
    const demoBanner = isDemoMode
      ? '<div style="background:#FFF3CD; color:#7A5B00; font-size:11.5px; font-weight:700; text-align:center; padding:7px 10px;">MODE PRATINJAU — data contoh, belum terhubung ke client asli</div>'
      : '';
    const staffBanner = isStaffMode
      ? '<div style="background:#111110; color:#F5F3EE; font-size:11.5px; font-weight:700; text-align:center; padding:7px 10px;">MODE STAFF — Anda melihat dashboard ini sebagai Head Coach</div>'
      : '';
    document.getElementById('root').innerHTML =
      '<div class="app-shell">' +
        demoBanner +
        staffBanner +
'<header class="app-header">' +
           '<div class="brand-lockup"><img src="' + CLIENT_HEADER_LOGO + '" alt="N6 logo"><div class="brand-copy"><strong>NUMBER SIX</strong><span>CLIENT DASHBOARD</span></div></div>' +
           '<div class="header-actions"><div class="client-greeting"><span>HALO,</span><strong id="clientNameDisplay">' + escapeClientHtml(clientName) + '</strong></div>' +
           '<button class="account-trigger" id="clientAccountBtn" type="button" aria-label="Akun dan pengaturan" aria-expanded="false" aria-controls="clientAccountMenu">' +
           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c0-4 2.7-6 6.5-6s6.5 2 6.5 6"/></svg></button>' +
           '<div class="account-menu" id="clientAccountMenu" hidden><div class="account-menu-title">PENGATURAN AKUN</div><div class="account-person">' + escapeClientHtml(clientName) + '</div>' +
           '<div class="theme-picker"><button type="button" data-client-theme="light">☀ &nbsp;Light</button><button type="button" data-client-theme="dark">☾ &nbsp;Dark</button></div>' +
           '<div class="account-menu-foot">NUMBER SIX RUNNING · Client</div></div></div>' +
        '</header>' +        '<main class="app-content">' +

          '<section class="tab-view active" id="tab-laporan">' +
            '<div class="card">' +
              '<h2>Kirim Laporan Latihan</h2>' +
              '<p class="sub">Isi setelah kamu selesai latihan hari ini.</p>' +
              '<div class="field"><label for="reportDate">Tanggal Latihan</label><input type="date" id="reportDate"></div>' +
              '<div class="field"><label for="reportLink">Link Smartwatch</label><input type="url" id="reportLink" placeholder="https://..."></div>' +
              '<div class="field"><label for="reportIssue">Keterangan (jika ada masalah saat latihan)</label><textarea id="reportIssue" placeholder="Kosongkan jika tidak ada masalah"></textarea></div>' +
              '<p class="error-text" id="reportError">Isi tanggal dan link smartwatch dulu.</p>' +
              '<button type="button" class="btn" id="submitReportBtn">Kirim Laporan</button>' +
              '<p class="save-msg" id="reportSaveMsg">Laporan tersimpan.</p>' +
            '</div>' +
            '<div class="card">' +
              '<h2>Riwayat Laporan</h2>' +
              '<div id="reportList"></div>' +
            '</div>' +
          '</section>' +

          '<section class="tab-view" id="tab-performa">' +
            '<div class="card">' +
              '<h2>Info Program</h2>' +
              '<div class="pb-grid" id="pbGrid"></div>' +
            '</div>' +
            '<div class="card">' +
              '<h2>Grafik Performa</h2>' +
              '<div class="chart-wrap"><svg class="chart-svg" id="chartSvg" height="200"></svg></div>' +
              '<button type="button" class="btn btn-outline" id="downloadPdfBtn" style="margin-top:12px;">' + iconDownload() + ' Unduh Ringkasan (JPG)</button>' +
            '</div>' +
            '<div class="card">' +
              '<div class="cal-head"><h3 id="calMonthLabel">-</h3>' +
                '<div class="cal-nav"><button type="button" id="calPrev">&larr;</button><button type="button" id="calNext">&rarr;</button></div>' +
              '</div>' +
              '<div class="cal-grid" id="calGrid"></div>' +
              '<div class="legend">' +
                '<span><i style="background:var(--green-bg); border-color:var(--green);"></i>Laporan dikirim</span>' +
                '<span><i style="background:var(--paper-dim); border-color:var(--ink);"></i>Skor coach</span>' +
              '</div>' +
              '<div class="day-detail" id="dayDetail"></div>' +
            '</div>' +
          '</section>' +

          '<section class="tab-view" id="tab-chat">' +
            '<div class="card">' +
              '<h2>Chat dengan Head Coach</h2>' +
              '<p class="sub">Catatan feedback harian dari coach — kamu juga bisa membalas di sini.</p>' +
              '<div class="chat-thread" id="chatThread"></div>' +
              '<div class="chat-input-row">' +
                '<input type="text" id="chatInput" placeholder="' + (isStaffMode ? 'Balas sebagai coach...' : 'Tulis pesan...') + '">' +
                '<button type="button" id="chatSendBtn" aria-label="Kirim">' + iconSend() + '</button>' +
              '</div>' +
            '</div>' +
          '</section>' +

        '</main>' +
        '<nav class="bottom-nav">' +
          '<button type="button" class="active" data-tab="laporan"><span class="icon-pill">' + iconLaporan() + '</span><span>Laporan</span></button>' +
          '<button type="button" data-tab="performa"><span class="icon-pill">' + iconPerforma() + '</span><span>Performa</span></button>' +
          '<button type="button" data-tab="chat"><span class="icon-pill">' + iconChat() + '</span><span>Chat</span></button>' +
        '</nav>' +
      '</div>';

    document.querySelectorAll('.bottom-nav button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-view').forEach(t => t.classList.remove('active'));
        document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        if (btn.dataset.tab === 'chat'){
          renderChatThread();
          scrollChatToBottom();
        }
      });
    });

    document.getElementById('reportDate').value = todayISO();
    document.getElementById('submitReportBtn').addEventListener('click', submitReport);
    document.getElementById('calPrev').addEventListener('click', () => { calMonth--; if (calMonth<0){calMonth=11; calYear--;} document.getElementById('dayDetail').classList.remove('show'); renderCalendar(); });
    document.getElementById('calNext').addEventListener('click', () => { calMonth++; if (calMonth>11){calMonth=0; calYear++;} document.getElementById('dayDetail').classList.remove('show'); renderCalendar(); });
    document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
    document.getElementById('chatInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMessage(); });
    document.getElementById('downloadPdfBtn').addEventListener('click', downloadPdf);
    renderPbGrid();
    initClientAccountMenu();
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

/*__N6_UNIT__*/  async function sendChatMessage(){
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    chatMessages.push({ sender: isStaffMode ? 'coach' : 'client', text, at: new Date().toISOString() });
    if (!isDemoMode) await storeSet('chat:' + clientId, JSON.stringify(chatMessages));
    input.value = '';
    renderChatThread();
    scrollChatToBottom();
  }

