/**
 * N6 modules - client / laporan
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderInvalid(){
    document.getElementById('root').innerHTML =
      '<div class="invalid-state">' +
        '<h2>Link tidak valid</h2>' +
        '<p>Halaman ini khusus untuk satu client dan diberikan oleh coach N6. Hubungi coach kamu untuk mendapatkan link dashboard yang benar.</p>' +
        '<p><button type="button" class="btn-outline" id="invalidLogoutBtn">Keluar</button></p>' +
      '</div>';
    const btn = document.getElementById('invalidLogoutBtn');
    if (btn) btn.addEventListener('click', () => {
      try {
        const cfg = window.N6_API || {};
        localStorage.removeItem(cfg.tokenKey || 'n6:api:token');
        localStorage.removeItem(cfg.refreshKey || 'n6:api:refresh');
        localStorage.removeItem(cfg.userKey || 'n6:api:user');
      } catch (e) {}
      window.location.replace(window.location.pathname);
    });
  }

/*__N6_UNIT__*/  function renderShell(){
    const staffBanner = isStaffMode
      ? '<div style="background:#111110; color:#F5F3EE; font-size:11.5px; font-weight:700; text-align:center; padding:7px 10px;">MODE STAFF — Anda melihat dashboard ini sebagai Head Coach</div>'
      : '';
    document.getElementById('root').innerHTML =
      '<div class="app-shell">' +
        staffBanner +
'<header class="app-header">' +
           '<div class="brand-lockup"><img src="' + CLIENT_HEADER_LOGO + '" alt="N6 logo"><div class="brand-copy"><strong>NUMBER SIX</strong><span>CLIENT DASHBOARD</span></div></div>' +
           '<div class="header-actions"><div class="client-greeting"><span>HALO,</span><strong id="clientNameDisplay">' + escapeClientHtml(clientName) + '</strong></div>' +
           '<button class="account-trigger" id="clientAccountBtn" type="button" aria-label="Akun dan pengaturan" aria-expanded="false" aria-controls="clientAccountMenu">' +
           '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c0-4 2.7-6 6.5-6s6.5 2 6.5 6"/></svg></button>' +
           '<div class="account-menu" id="clientAccountMenu" hidden><div class="account-menu-title">PENGATURAN AKUN</div><div class="account-person">' + escapeClientHtml(clientName) + '</div>' +
           '<div class="theme-picker"><button type="button" data-client-theme="light">☀ &nbsp;Light</button><button type="button" data-client-theme="dark">☾ &nbsp;Dark</button></div>' +
           '<button type="button" class="account-logout-btn" id="clientLogoutBtn">⏻ &nbsp;Keluar</button>' +
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

/*__N6_UNIT__*/  async function submitReport(){
    const err = document.getElementById('reportError');
    const msg = document.getElementById('reportSaveMsg');
    const date = document.getElementById('reportDate').value;
    const link = document.getElementById('reportLink').value.trim();
    const issue = document.getElementById('reportIssue').value.trim();
    msg.classList.remove('show');
    if (!date || !link){ err.classList.add('show'); return; }
    err.classList.remove('show');
    reports[date] = { link, issue, submittedAt: new Date().toISOString() };
    await storeSet('reports:' + clientId, JSON.stringify(reports));
    document.getElementById('reportLink').value = '';
    document.getElementById('reportIssue').value = '';
    msg.textContent = 'Laporan tersimpan.';
    msg.classList.add('show');
    renderReportList();
    renderCalendar();
  }

/*__N6_UNIT__*/  function renderReportList(){
    const list = document.getElementById('reportList');
    const dates = Object.keys(reports).sort().reverse();
    if (dates.length === 0){ list.innerHTML = '<p class="empty-note">Belum ada laporan.</p>'; return; }
    list.innerHTML = dates.map(date => {
      const r = reports[date];
      const linkHtml = r.link ? '<a href="' + r.link + '" target="_blank" rel="noopener">Link Smartwatch</a>' : 'Tidak ada link';
      return '<div class="report-row"><div class="date">' + date + '</div><div class="meta">' + linkHtml + ' — ' + (r.issue || 'tidak ada masalah dilaporkan') + '</div></div>';
    }).join('');
  }

/*__N6_UNIT__*/  function renderChart(){
    const svg = document.getElementById('chartSvg');
    const dates = Object.keys(scores).sort();
    const w = 420;
    svg.setAttribute('viewBox', '0 0 ' + w + ' 200');
    if (dates.length === 0){
      svg.innerHTML =
        '<circle cx="' + (w/2) + '" cy="82" r="26" fill="#EAE7DE"/>' +
        '<path d="M' + (w/2-9) + ' 86l6 6 12-14" stroke="#6E6C64" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<text x="' + (w/2) + '" y="132" font-size="13" fill="#111110" font-weight="700" text-anchor="middle">Belum ada skor</text>' +
        '<text x="' + (w/2) + '" y="150" font-size="11.5" fill="#6E6C64" text-anchor="middle">Grafik akan muncul setelah coach mengisi skor</text>';
      return;
    }
    const padL = 30, padR = 14, padT = 14, padB = 26;
    const innerW = w - padL - padR, innerH = 200 - padT - padB;
    const stepX = dates.length > 1 ? innerW / (dates.length - 1) : 0;
    let gridSvg = '';
    [0,50,100].forEach(v => {
      const y = padT + innerH - (v/100)*innerH;
      gridSvg += '<line x1="' + padL + '" y1="' + y + '" x2="' + (w-padR) + '" y2="' + y + '" stroke="#DDD9CC" stroke-width="1"/>';
      gridSvg += '<text x="2" y="' + (y+4) + '" font-size="9.5" fill="#6E6C64">' + v + '</text>';
    });
    let points = [], dotsSvg = '', labelsSvg = '';
    dates.forEach((date, i) => {
      const x = padL + stepX * i;
      const y = padT + innerH - (scores[date].score/100)*innerH;
      points.push(x + ',' + y);
      dotsSvg += '<circle cx="' + x + '" cy="' + y + '" r="3.5" fill="#D62828"/>';
      labelsSvg += '<text x="' + x + '" y="' + (200-6) + '" font-size="8.5" fill="#6E6C64" text-anchor="middle">' + date.slice(5) + '</text>';
    });
    svg.innerHTML = gridSvg + '<polyline points="' + points.join(' ') + '" fill="none" stroke="#111110" stroke-width="2"/>' + dotsSvg + labelsSvg;
  }

