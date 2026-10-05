/**
 * N6 modules - client / _core
 * menu label : shared core / boot / state
 * minimum tier: n/a
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/client/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/client.js. Concatenating every fragment in manifest
 * order reproduces client.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__
try{document.documentElement.setAttribute('data-client-theme',localStorage.getItem('n6-client-theme')==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-client-theme','light');}})();

/*__N6_UNIT__*/  function getClientIdFromUrl(){
    const params = new URLSearchParams(window.location.search);
    return params.get('client') || '';
  }

/*__N6_UNIT__*/  async function storeGet(key){
    try{ const r = await window.storage.get(key, true); return r ? r.value : null; }
    catch(e){ return null; }
  }
/*__N6_UNIT__*/  async function storeSet(key, value){
    try{ await window.storage.set(key, value, true); return true; }
    catch(e){ return false; }
  }
/*__N6_UNIT__*/  function todayISO(){
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

/*__N6_UNIT__*/  let clientId = getClientIdFromUrl();
/*__N6_UNIT__*/  let clientName = 'Client';
/*__N6_UNIT__*/  let reports = {};
/*__N6_UNIT__*/  let scores = {};
/*__N6_UNIT__*/  let chatMessages = [];
/*__N6_UNIT__*/  let programInfo = { pbStart: '', pbEnd: '', startDate: '', endDate: '' };
/*__N6_UNIT__*/  const today = new Date();
/*__N6_UNIT__*/  let calYear = today.getFullYear();
/*__N6_UNIT__*/  let calMonth = today.getMonth();

/*__N6_UNIT__*/  function iconLaporan(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M9 3v2a1 1 0 001 1h4a1 1 0 001-1V3M9 11h6M9 15h4" stroke-linecap="round"/></svg>';
  }
/*__N6_UNIT__*/  function iconPerforma(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke-linecap="round"/></svg>';
  }
/*__N6_UNIT__*/  function iconChat(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.3-.2-3.3-.6L3 20l1-4.2C3.4 14.5 3 13.3 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" stroke-linecap="round"/></svg>';
  }
/*__N6_UNIT__*/  function iconSend(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
  }
/*__N6_UNIT__*/  function iconDownload(){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:-3px;margin-right:4px;"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 19h16"/></svg>';
  }

/*__N6_UNIT__*/  function renderInvalid(){
    document.getElementById('root').innerHTML =
      '<div class="invalid-state">' +
        '<h2>Link tidak valid</h2>' +
        '<p>Halaman ini khusus untuk satu client dan diberikan oleh coach N6. Hubungi coach kamu untuk mendapatkan link dashboard yang benar.</p>' +
      '</div>';
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
    if (!isDemoMode) await storeSet('reports:' + clientId, JSON.stringify(reports));
    document.getElementById('reportLink').value = '';
    document.getElementById('reportIssue').value = '';
    msg.textContent = isDemoMode ? 'Tersimpan sementara (mode pratinjau, tidak permanen).' : 'Laporan tersimpan.';
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

/*__N6_UNIT__*/  const dowLabels = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
/*__N6_UNIT__*/  function showDayDetail(dateStr){
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

/*__N6_UNIT__*/  let isDemoMode = false;
/*__N6_UNIT__*/  const isStaffMode = new URLSearchParams(window.location.search).get('staff') === '1';

/*__N6_UNIT__*/  function formatChatTime(iso){
    const d = new Date(iso);
    return d.getDate() + '/' + (d.getMonth()+1) + ' ' + String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0');
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

/*__N6_UNIT__*/  function showFatalError(msg){
    document.getElementById('root').innerHTML =
      '<div class="invalid-state"><h2>Terjadi kendala</h2><p>' + msg + '</p></div>';
  }

  /* ================= INFO PROGRAM (PB & TANGGAL) ================= */
/*__N6_UNIT__*/  function formatDateID(dateStr){
    if (!dateStr) return '';
    const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const [y,m,d] = dateStr.split('-');
    return parseInt(d,10) + ' ' + bulan[parseInt(m,10)-1] + ' ' + y;
  }

/*__N6_UNIT__*/  function pbValueHtml(val, isDate){
    if (!val) return '<div class="value empty">Belum diisi</div>';
    return '<div class="value">' + (isDate ? formatDateID(val) : escapeHtml(val)) + '</div>';
  }

/*__N6_UNIT__*/  function renderPbGrid(){
    const grid = document.getElementById('pbGrid');
    if (!grid) return;
    grid.innerHTML =
      '<div class="pb-item"><div class="label">PB Awal</div>' + pbValueHtml(programInfo.pbStart, false) + '</div>' +
      '<div class="pb-item"><div class="label">PB Akhir</div>' + pbValueHtml(programInfo.pbEnd, false) + '</div>' +
      '<div class="pb-item"><div class="label">Tanggal Mulai</div>' + pbValueHtml(programInfo.startDate, true) + '</div>' +
      '<div class="pb-item"><div class="label">Tanggal Selesai</div>' + pbValueHtml(programInfo.endDate, true) + '</div>';
  }

  /* ================= UNDUH RINGKASAN (JPG) ================= */
