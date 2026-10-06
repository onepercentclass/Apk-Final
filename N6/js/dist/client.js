/**
 * N6 dist bundle - client
 *
 * GENERATED FILE - do not edit. Source of truth is js/modules/client/*.js
 * Rebuilt by tools/build.ps1; concatenation is byte-identical to the
 * original <script> block in client.html.
 */


  const CLIENT_HEADER_LOGO = 'assets/img/logo-client-header.png';
  const LOGO_B64 = 'assets/img/logo-client-print.png';


  function escapeClientHtml(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function setClientTheme(mode){
    const next=mode==='dark'?'dark':'light';
    document.documentElement.setAttribute('data-client-theme',next);
    try{localStorage.setItem('n6-client-theme',next);}catch(e){}
    document.querySelectorAll('[data-client-theme]').forEach(b=>b.classList.toggle('selected',b.dataset.clientTheme===next));
  }
  function initClientAccountMenu(){
    const btn=document.getElementById('clientAccountBtn'),menu=document.getElementById('clientAccountMenu');
    if(!btn||!menu)return;
    btn.addEventListener('click',e=>{e.stopPropagation();const opening=menu.hidden;menu.hidden=!opening;btn.setAttribute('aria-expanded',String(opening));});
    menu.addEventListener('click',e=>e.stopPropagation());
    menu.querySelectorAll('[data-client-theme]').forEach(b=>b.addEventListener('click',()=>setClientTheme(b.dataset.clientTheme)));
    const logoutBtn=document.getElementById('clientLogoutBtn');
    if(logoutBtn)logoutBtn.addEventListener('click',()=>{try{const cfg=window.N6_API||{};localStorage.removeItem(cfg.tokenKey||'n6:api:token');localStorage.removeItem(cfg.refreshKey||'n6:api:refresh');localStorage.removeItem(cfg.userKey||'n6:api:user');}catch(e){}window.location.replace(window.location.pathname);});
    document.addEventListener('click',()=>{menu.hidden=true;btn.setAttribute('aria-expanded','false');});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;btn.setAttribute('aria-expanded','false');}});
    setClientTheme(document.documentElement.getAttribute('data-client-theme')||'light');
  }
  (function(){try{document.documentElement.setAttribute('data-client-theme',localStorage.getItem('n6-client-theme')==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-client-theme','light');}})();

  function getClientIdFromUrl(){
    const params = new URLSearchParams(window.location.search);
    return params.get('client') || '';
  }

  async function storeGet(key){
    try{ const r = await window.storage.get(key, true); return r ? r.value : null; }
    catch(e){ return null; }
  }
  async function storeSet(key, value){
    try{ await window.storage.set(key, value, true); return true; }
    catch(e){ return false; }
  }
  function todayISO(){
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  let clientId = getClientIdFromUrl();
  let clientName = 'Client';
  let reports = {};
  let scores = {};
  let chatMessages = [];
  let programInfo = { pbStart: '', pbEnd: '', startDate: '', endDate: '' };
  const today = new Date();
  let calYear = today.getFullYear();
  let calMonth = today.getMonth();

  function iconLaporan(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 3v2a1 1 0 001 1h4a1 1 0 001-1V3M9 11h6M9 15h4" stroke-linecap="round"/></svg>';
  }
  function iconPerforma(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke-linecap="round"/></svg>';
  }
  function iconChat(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.3-.2-3.3-.6L3 20l1-4.2C3.4 14.5 3 13.3 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" stroke-linecap="round"/></svg>';
  }
  function iconSend(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
  }
  function iconDownload(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:-3px;margin-right:4px;"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>';
  }

  function renderInvalid(){
    document.getElementById('root').innerHTML =
      '<div class="invalid-state">' +
        '<h2>Link tidak valid</h2>' +
        '<p>Halaman ini khusus untuk satu client dan diberikan oleh coach N6. Hubungi coach kamu untuk mendapatkan link dashboard yang benar.</p>' +
      '</div>';
  }

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

  async function submitReport(){
    const err = document.getElementById('reportError');
    const msg = document.getElementById('reportSaveMsg');
    const date = document.getElementById('reportDate').value;
    const link = document.getElementById('reportLink').value.trim();
    const issue = document.getElementById('reportIssue').value.trim();
    msg.classList.remove('show');
    if (!date || !link){ err.classList.add('show'); return; }
    err.classList.remove('show');
    reports[date] = { link, issue, submittedAt: new Date().toISOString() };
    if (!isDemoMode) await storeSet('reports:' + clientId, JSON.stringify(reports));
    document.getElementById('reportLink').value = '';
    document.getElementById('reportIssue').value = '';
    msg.textContent = isDemoMode ? 'Tersimpan sementara (mode pratinjau, tidak permanen).' : 'Laporan tersimpan.';
    msg.classList.add('show');
    renderReportList();
    renderCalendar();
  }

  function renderReportList(){
    const list = document.getElementById('reportList');
    const dates = Object.keys(reports).sort().reverse();
    if (dates.length === 0){ list.innerHTML = '<p class="empty-note">Belum ada laporan.</p>'; return; }
    list.innerHTML = dates.map(date => {
      const r = reports[date];
      const linkHtml = r.link ? '<a href="' + r.link + '" target="_blank" rel="noopener">Link Smartwatch</a>' : 'Tidak ada link';
      return '<div class="report-row"><div class="date">' + date + '</div><div class="meta">' + linkHtml + ' — ' + (r.issue || 'tidak ada masalah dilaporkan') + '</div></div>';
    }).join('');
  }

  function renderChart(){
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

  const dowLabels = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  function renderCalendar(){
    const grid = document.getElementById('calGrid');
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    document.getElementById('calMonthLabel').textContent = monthNames[calMonth] + ' ' + calYear;
    let html = dowLabels.map(d => '<div class="cal-dow">' + d + '</div>').join('');
    const firstDay = new Date(calYear, calMonth, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const todayStr = todayISO();
    for (let i = 0; i < startOffset; i++) html += '<div class="cal-cell empty"></div>';
    for (let d = 1; d <= daysInMonth; d++){
      const dateStr = calYear + '-' + String(calMonth+1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
      const hasReport = !!reports[dateStr];
      const hasScore = !!scores[dateStr];
      let cls = 'cal-cell';
      if (hasReport) cls += ' has-report';
      if (hasScore) cls += ' has-score';
      if (dateStr === todayStr) cls += ' today';
      let inner = '<span class="num">' + d + '</span>';
      if (hasScore) inner += '<span class="score-badge">' + scores[dateStr].score + '</span>';
      html += '<div class="' + cls + '" data-date="' + dateStr + '">' + inner + '</div>';
    }
    grid.innerHTML = html;
    grid.querySelectorAll('.cal-cell[data-date]').forEach(cell => {
      const dateStr = cell.dataset.date;
      if (reports[dateStr] || scores[dateStr]){
        cell.addEventListener('click', () => showDayDetail(dateStr));
      }
    });
  }

  function showDayDetail(dateStr){
    const el = document.getElementById('dayDetail');
    const r = reports[dateStr], s = scores[dateStr];
    let html = '<h4>' + dateStr + '</h4>';
    html += r ? ('<p>Link: ' + (r.link ? '<a href="' + r.link + '" target="_blank" rel="noopener">buka link</a>' : '-') + '</p><p>Keterangan: ' + (r.issue || 'tidak ada masalah') + '</p>')
              : '<p>Belum ada laporan tanggal ini.</p>';
    html += s ? ('<p>Skor: ' + s.score + '/100' + (s.note ? ' — ' + s.note : '') + '</p>' + (s.evidenceLink ? '<p>Bukti: <a href="' + s.evidenceLink + '" target="_blank" rel="noopener">buka link</a></p>' : ''))
              : '<p>Coach belum mengisi skor tanggal ini.</p>';
    el.innerHTML = html;
    el.classList.add('show');
  }

  let isDemoMode = false;
  const isStaffMode = new URLSearchParams(window.location.search).get('staff') === '1';

  function seedDemoData(){
    clientName = 'Dimas Prasetyo';
    isDemoMode = true;
    const d1 = todayISO();
    const d0 = new Date(Date.now() - 86400000*2);
    const d0str = d0.getFullYear() + '-' + String(d0.getMonth()+1).padStart(2,'0') + '-' + String(d0.getDate()).padStart(2,'0');
    const d2 = new Date(Date.now() - 86400000*5);
    const d2str = d2.getFullYear() + '-' + String(d2.getMonth()+1).padStart(2,'0') + '-' + String(d2.getDate()).padStart(2,'0');
    reports = {};
    reports[d0str] = { link: 'https://connect.garmin.com/contoh', issue: '', submittedAt: new Date().toISOString() };
    reports[d2str] = { link: 'https://connect.garmin.com/contoh', issue: 'Lutut sedikit nyeri di km ke-4', submittedAt: new Date().toISOString() };
    scores = {};
    scores[d2str] = { score: 72, note: 'Pace stabil, jaga postur', evidenceLink: '', updatedAt: new Date().toISOString() };
    scores[d0str] = { score: 80, note: 'Progres bagus', evidenceLink: '', updatedAt: new Date().toISOString() };
    chatMessages = [
      { sender: 'coach', text: 'Halo! Laporan kemarin sudah saya cek, pace-nya membaik. Terus jaga postur ya.', at: new Date(Date.now() - 86400000).toISOString() },
      { sender: 'client', text: 'Siap coach, terima kasih!', at: new Date(Date.now() - 82800000).toISOString() }
    ];
    programInfo = { pbStart: '25:30', pbEnd: '23:10', startDate: '2026-07-01', endDate: '2026-09-30' };
  }

  /* ================= CHAT ================= */
  function formatChatTime(iso){
    const d = new Date(iso);
    return d.getDate() + '/' + (d.getMonth()+1) + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
  }

  function renderChatThread(){
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

  function scrollChatToBottom(){
    const thread = document.getElementById('chatThread');
    if (thread) thread.scrollTop = thread.scrollHeight;
  }

  function escapeHtml(s){
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  async function sendChatMessage(){
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    chatMessages.push({ sender: isStaffMode ? 'coach' : 'client', text, at: new Date().toISOString() });
    if (!isDemoMode) await storeSet('chat:' + clientId, JSON.stringify(chatMessages));
    input.value = '';
    renderChatThread();
    scrollChatToBottom();
  }

  function showFatalError(msg){
    document.getElementById('root').innerHTML =
      '<div class="invalid-state"><h2>Terjadi kendala</h2><p>' + msg + '</p></div>';
  }

  /* ================= INFO PROGRAM (PB & TANGGAL) ================= */
  function formatDateID(dateStr){
    if (!dateStr) return '';
    const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const [y,m,d] = dateStr.split('-');
    return parseInt(d,10) + ' ' + bulan[parseInt(m,10)-1] + ' ' + y;
  }

  function pbValueHtml(val, isDate){
    if (!val) return '<div class="value empty">Belum diisi</div>';
    return '<div class="value">' + (isDate ? formatDateID(val) : escapeHtml(val)) + '</div>';
  }

  function renderPbGrid(){
    const grid = document.getElementById('pbGrid');
    if (!grid) return;
    grid.innerHTML =
      '<div class="pb-item"><div class="label">PB Awal</div>' + pbValueHtml(programInfo.pbStart, false) + '</div>' +
      '<div class="pb-item"><div class="label">PB Akhir</div>' + pbValueHtml(programInfo.pbEnd, false) + '</div>' +
      '<div class="pb-item"><div class="label">Tanggal Mulai</div>' + pbValueHtml(programInfo.startDate, true) + '</div>' +
      '<div class="pb-item"><div class="label">Tanggal Selesai</div>' + pbValueHtml(programInfo.endDate, true) + '</div>';
  }

  /* ================= UNDUH RINGKASAN (JPG) ================= */
  function downloadPdf(){
    const btn = document.getElementById('downloadPdfBtn');
    const originalLabel = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Menyiapkan gambar...';

    const dates = Object.keys(scores).sort();
    const scoreVals = dates.map(d => scores[d].score);
    const avg = scoreVals.length ? Math.round(scoreVals.reduce((a,b)=>a+b,0)/scoreVals.length) : '-';
    const best = scoreVals.length ? Math.max(...scoreVals) : '-';
    const totalReports = Object.keys(reports).length;

    // Bagi riwayat ke beberapa kolom & tentukan kepadatan font supaya ~30 hari tetap pas 1 lembar A3
    const totalEntries = dates.length;
    const columns = totalEntries <= 13 ? 1 : (totalEntries <= 32 ? 2 : 3);
    const rowsPerCol = Math.max(1, Math.ceil((totalEntries || 1) / columns));
    const densClass = rowsPerCol <= 8 ? 'dens-lg' : (rowsPerCol <= 15 ? 'dens-md' : (rowsPerCol <= 20 ? 'dens-sm' : 'dens-xs'));

    function formatDateShortID(dateStr){
      const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      const [y,m,d] = dateStr.split('-');
      return parseInt(d,10) + ' ' + bulan[parseInt(m,10)-1];
    }

    function buildRow(d){
      const s = scores[d];
      return '<div class="sum-hist-row"><span class="d">' + formatDateShortID(d) + '</span>' +
        '<span class="s"><span class="score-pill">' + s.score + '</span></span>' +
        '<span class="n">' + escapeHtml(s.note || 'Tidak ada catatan') + '</span></div>';
    }

    let historyColsHtml = '';
    if (totalEntries === 0){
      historyColsHtml =
        '<div class="sum-history-col ' + densClass + '">' +
          '<div class="sum-history-col-head"><span class="d">Tanggal</span><span class="s">Skor</span><span class="n">Catatan Coach</span></div>' +
          '<div class="sum-history-rows"><div class="sum-hist-row empty">Belum ada skor tercatat.</div></div>' +
        '</div>';
    } else {
      for (let c = 0; c < columns; c++){
        const slice = dates.slice(c * rowsPerCol, (c + 1) * rowsPerCol);
        if (!slice.length) continue;
        historyColsHtml +=
          '<div class="sum-history-col ' + densClass + '">' +
            '<div class="sum-history-col-head"><span class="d">Tanggal</span><span class="s">Skor</span><span class="n">Catatan Coach</span></div>' +
            '<div class="sum-history-rows">' + slice.map(buildRow).join('') + '</div>' +
          '</div>';
      }
    }

    document.getElementById('printArea').innerHTML =
      '<div class="sum-header">' +
        '<img src="' + LOGO_B64 + '" alt="N6">' +
        '<div class="sum-titles">' +
          '<h1>Ringkasan Performa Latihan</h1>' +
          '<div class="sum-tagline">N6 Running Training</div>' +
        '</div>' +
        '<div class="sum-meta">' +
          '<div class="client">' + escapeHtml(clientName) + '</div>' +
          '<div>Dicetak ' + formatDateID(todayISO()) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sum-body">' +
        '<div class="sum-section-title">Info Program</div>' +
        '<div class="sum-pb-grid">' +
          '<div class="sum-pb-item"><div class="label">PB Awal</div><div class="value">' + escapeHtml(programInfo.pbStart || '-') + '</div></div>' +
          '<div class="sum-pb-item"><div class="label">PB Akhir</div><div class="value">' + escapeHtml(programInfo.pbEnd || '-') + '</div></div>' +
          '<div class="sum-pb-item"><div class="label">Tanggal Mulai</div><div class="value">' + (formatDateID(programInfo.startDate) || '-') + '</div></div>' +
          '<div class="sum-pb-item"><div class="label">Tanggal Selesai</div><div class="value">' + (formatDateID(programInfo.endDate) || '-') + '</div></div>' +
        '</div>' +
        '<div class="sum-section-title">Ringkasan Skor</div>' +
        '<div class="sum-stats">' +
          '<div class="sum-stat"><div class="num">' + avg + '</div><div class="lbl">Rata-rata Skor</div></div>' +
          '<div class="sum-stat"><div class="num">' + best + '</div><div class="lbl">Skor Terbaik</div></div>' +
          '<div class="sum-stat"><div class="num">' + totalReports + '</div><div class="lbl">Total Laporan</div></div>' +
        '</div>' +
        '<div class="sum-section-title">Riwayat Skor per Tanggal (' + totalEntries + ' entri)</div>' +
        '<div class="sum-history-wrap">' + historyColsHtml + '</div>' +
        '<div class="sum-footer"><span class="brand">N6 RUNNING TRAINING</span><span>Dokumen ini dibuat otomatis dari dashboard client — Kertas A3 Potrait.</span></div>' +
      '</div>';

    const el = document.getElementById('printArea');
    html2canvas(el, { backgroundColor: '#FFFFFF', scale: 2, useCORS: true }).then(function(canvas){
      const jpgUrl = canvas.toDataURL('image/jpeg', 0.95);
      const a = document.createElement('a');
      a.href = jpgUrl;
      const safeName = (clientName || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      a.download = 'ringkasan-n6-' + (safeName || 'client') + '-' + todayISO() + '.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      btn.disabled = false;
      btn.innerHTML = originalLabel;
    }).catch(function(err){
      btn.disabled = false;
      btn.innerHTML = originalLabel;
      alert('Gagal membuat gambar ringkasan. Coba lagi. (' + (err && err.message ? err.message : 'error') + ')');
    });
  }

  (async function init(){
    try{
      if (clientId){
        const clientsRaw = await storeGet('clients');
        let clients = [];
        try{ clients = clientsRaw ? JSON.parse(clientsRaw) : []; }catch(e){ clients = []; }
        const found = clients.find(c => c.id === clientId);
        if (found){
          clientName = found.name;
          const rRaw = await storeGet('reports:' + clientId);
          const sRaw = await storeGet('scores:' + clientId);
          const cRaw = await storeGet('chat:' + clientId);
          const pRaw = await storeGet('program:' + clientId);
          try{ reports = rRaw ? JSON.parse(rRaw) : {}; }catch(e){ reports = {}; }
          try{ scores = sRaw ? JSON.parse(sRaw) : {}; }catch(e){ scores = {}; }
          try{ chatMessages = cRaw ? JSON.parse(cRaw) : []; }catch(e){ chatMessages = []; }
          try{ programInfo = pRaw ? JSON.parse(pRaw) : programInfo; }catch(e){}
        } else {
          seedDemoData();
        }
      } else {
        seedDemoData();
      }

      renderShell();
      renderReportList();
      renderChart();
      renderCalendar();
      renderChatThread();
    }catch(e){
      showFatalError('Halaman gagal dimuat (' + (e && e.message ? e.message : 'unknown error') + '). Coba muat ulang.');
    }
  })();
