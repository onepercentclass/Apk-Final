/**
 * N6 modules - admin / _core
 * menu label : shared core / boot / state
 * minimum tier: n/a
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/admin/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/admin.js. Concatenating every fragment in manifest
 * order reproduces admin.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__

  /* ================= KATALOG PROGRAM (default — bisa diubah lewat storage 'programCatalog') ================= */
/*__N6_UNIT__*/  const DEFAULT_PROGRAM_CATALOG = [
    { id:'run-start', label:'Run-Start', category:'Online', mode:'fixed', unit:'3 Bulan', price:334000 },
    { id:'privat-online', label:'Private Online', category:'Online', mode:'fixed', unit:'1 Bulan', price:800000 },
    { id:'single-session', label:'Single Session Training', category:'Offline', mode:'fixed', unit:'1x Pertemuan', price:170000 },
    { id:'running-class', label:'Running Class (5–20 orang)', category:'Offline', mode:'configurable', unit:'per orang', ratePerSesi:65000, defaultMeetings:2, defaultWeeks:4 },
    { id:'semi-private', label:'Semi Private (2 orang)', category:'Offline', mode:'configurable', unit:'per paket', ratePerSesi:190000, defaultMeetings:2, defaultWeeks:4 },
    { id:'private-offline', label:'Private Offline', category:'Offline', mode:'configurable', unit:'per paket', ratePerSesi:150000, defaultMeetings:2, defaultWeeks:4 },
    { id:'korporat', label:'Kerja Sama Korporat (Karyawan)', category:'Kerja Sama', mode:'custom' },
    { id:'event-pacer', label:'Kerja Sama Event (Pacer)', category:'Kerja Sama', mode:'custom' }
  ];
/*__N6_UNIT__*/  const DEFAULT_COACH_ROSTER = [
    { id:'c1', name:'Rangga Saputra', phone:'081200000001' },
    { id:'c2', name:'Dinda Ayu', phone:'081200000002' },
    { id:'c3', name:'Fajar Nugroho', phone:'081200000003' }
  ];
/*__N6_UNIT__*/  const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
/*__N6_UNIT__*/  const BLOCKS = [
    { key:'pagi', label:'Pagi', time:'06:00–09:00' },
    { key:'siang', label:'Siang', time:'09:00–12:00' },
    { key:'sore', label:'Sore', time:'15:00–18:00' },
    { key:'malam', label:'Malam', time:'18:00–21:00' }
  ];

/*__N6_UNIT__*/  function slugify(name){ return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
/*__N6_UNIT__*/  function escapeHtml(s){ const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
/*__N6_UNIT__*/  function todayISO(){ const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
/*__N6_UNIT__*/  function daysBetween(a, b){ return Math.round((new Date(b) - new Date(a)) / 86400000); }
/*__N6_UNIT__*/  function formatDateID(dateStr){
    if (!dateStr) return '-';
    const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const [y,m,d] = dateStr.split('-');
    return parseInt(d,10) + ' ' + bulan[parseInt(m,10)-1] + ' ' + y;
  }
/*__N6_UNIT__*/  function formatRupiah(n){ n = Number(n) || 0; return 'Rp' + n.toLocaleString('id-ID'); }
/*__N6_UNIT__*/  function clientPortalUrl(id){ return 'dashboard-client.html?client=' + encodeURIComponent(id); }
  // Logo N6 putih transparan, dipakai pada header Invoice (PNG) agar konsisten dgn Laporan Keuangan Coach
/*__N6_UNIT__*/  const LOGO_DATA = "assets/img/logo-report.png";
/*__N6_UNIT__*/  function todayDayName(){
    const jsDay = new Date().getDay(); // 0=Minggu
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    return DAYS[idx];
  }

  // Catatan penting: window.storage hanya tersedia di dalam preview Artifact Claude.ai.
  // Begitu file ini diunduh dan dibuka sebagai halaman biasa (di server sendiri / dibuka langsung
  // di browser), window.storage tidak ada — sehingga semua data (klien, jadwal, dll) gagal
  // tersimpan secara diam-diam dan selalu kembali kosong setiap kali halaman dibuka ulang.
  // Makanya dipindah ke localStorage asli milik browser, yang benar-benar tersimpan permanen
  // di perangkat/browser tempat dashboard ini dibuka.
/*__N6_UNIT__*/  const STORE_PREFIX = 'n6csAdmin:';
/*__N6_UNIT__*/  const N6_API_KEYS = new Set(['clients','tickets','messages']);
/*__N6_UNIT__*/  async function storeGet(key){
    if (N6_API_KEYS.has(key) && typeof window !== 'undefined' && window.storage) {
      try {
        const r = await window.storage.get(key, true);
        if (r && r.value != null) return r.value;
      } catch (e) {}
    }
    try{ return localStorage.getItem(STORE_PREFIX + key); }
    catch(e){ return null; }
  }
/*__N6_UNIT__*/  async function storeSet(key, value){
    if (N6_API_KEYS.has(key) && typeof window !== 'undefined' && window.storage) {
      try { await window.storage.set(key, value, true); } catch (e) {}
    }
    try{ localStorage.setItem(STORE_PREFIX + key, value); if(localStorage.getItem(STORE_PREFIX + key)!==value) throw Error('Verifikasi gagal'); return true; }
    catch(e){ showToast('GAGAL menyimpan! Periksa izin penyimpanan browser.'); throw e; }
  }

/*__N6_UNIT__*/  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ================= STATE ================= */
/*__N6_UNIT__*/  let clients = [];
/*__N6_UNIT__*/  let tickets = [];
/*__N6_UNIT__*/  let archivedClients = [];
/*__N6_UNIT__*/  let chatCache = {};
/*__N6_UNIT__*/  let reportsCache = {};
/*__N6_UNIT__*/  let programCache = {};
/*__N6_UNIT__*/  let programCatalog = [];
/*__N6_UNIT__*/  let coachRoster = [];
/*__N6_UNIT__*/  let coachSchedule = {};
/*__N6_UNIT__*/  let coachDayOff = {};
/*__N6_UNIT__*/  let activeChatClientId = null;
/*__N6_UNIT__*/  let activeSlot = null; // { coachId, day, blockKey }
/*__N6_UNIT__*/  let pendingArchiveNotice = 0;

/*__N6_UNIT__*/  function catalogById(id){ return programCatalog.find(p => p.id === id); }
/*__N6_UNIT__*/  function coachById(id){ return coachRoster.find(c => c.id === id); }

/*__N6_UNIT__*/  async function persistClients(){ await storeSet('clients', JSON.stringify(clients)); }
/*__N6_UNIT__*/  async function persistTickets(){ await storeSet('tickets', JSON.stringify(tickets)); }
/*__N6_UNIT__*/  async function persistChat(id){ await storeSet('chat:' + id, JSON.stringify(chatCache[id] || [])); }
/*__N6_UNIT__*/  async function persistProgram(id){ await storeSet('program:' + id, JSON.stringify(programCache[id] || {})); }
/*__N6_UNIT__*/  async function persistCoachRoster(){ await storeSet('coachRoster', JSON.stringify(coachRoster)); }
/*__N6_UNIT__*/  async function persistCoachSchedule(){ await storeSet('coachSchedule', JSON.stringify(coachSchedule)); }
/*__N6_UNIT__*/  async function persistCoachDayOff(){ await storeSet('coachDayOff', JSON.stringify(coachDayOff)); }

  /* ================= DERIVED HELPERS ================= */
/*__N6_UNIT__*/  function clientStatus(c){
    const p = programCache[c.id] || {};
    if (!p.endDate) return c.status || 'Aktif';
    const diff = daysBetween(todayISO(), p.endDate);
    if (diff < 0) return 'Nonaktif';
    if (diff <= 7) return 'Akan Berakhir';
    return 'Aktif';
  }
/*__N6_UNIT__*/  function statusTone(status){
    if (status === 'Aktif') return 'green';
    if (status === 'Akan Berakhir') return 'amber';
    if (status === 'Nonaktif') return 'neutral';
    return 'neutral';
  }
/*__N6_UNIT__*/  function autoIssues(){
    const out = [];
    for (const c of clients){
      const reports = reportsCache[c.id] || {};
      Object.keys(reports).forEach(date => {
        const r = reports[date];
        if (r && r.issue && r.issue.trim()){
          out.push({ clientId:c.id, clientName:c.name, date, issue:r.issue });
        }
      });
    }
    return out.sort((a,b) => b.date.localeCompare(a.date));
  }
/*__N6_UNIT__*/  function openTicketCount(){
    const manualOpen = tickets.filter(t => t.status !== 'Selesai').length;
    const alreadyLinked = new Set(tickets.map(t => t.autoKey).filter(Boolean));
    const autoOpen = autoIssues().filter(a => !alreadyLinked.has(a.clientId + '|' + a.date)).length;
    return manualOpen + autoOpen;
  }
/*__N6_UNIT__*/  function lastMessage(id){
    const arr = chatCache[id] || [];
    return arr.length ? arr[arr.length-1] : null;
  }
/*__N6_UNIT__*/  function waitingReplyCount(){
    return clients.filter(c => { const m = lastMessage(c.id); return m && m.sender === 'client'; }).length;
  }

  /* ================= RENDER: BERANDA ================= */
/*__N6_UNIT__*/  function flashCopied(btn){
    if (!btn) return;
    const orig = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = 'Tersalin!';
    setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = orig; }, 1500);
    showToast('Link dashboard klien disalin');
  }

  /* ================= FORM TAMBAH/EDIT KLIEN — PROGRAM DINAMIS ================= */
/*__N6_UNIT__*/  function populateFormSelects(){
    document.getElementById('fCoach').innerHTML = coachRoster.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
    document.getElementById('fProgram').innerHTML = '<option value="">Pilih program</option>' +
      ['Online','Offline','Kerja Sama'].map(cat => {
        const opts = programCatalog.filter(p => p.category === cat).map(p => `<option value="${p.id}">${escapeHtml(p.label)}</option>`).join('');
        return opts ? `<optgroup label="${cat}">${opts}</optgroup>` : '';
      }).join('');
  }

/*__N6_UNIT__*/  function computeConfigPrice(program, meetings, weeks){
    const totalSessions = Math.max(1, meetings) * Math.max(1, weeks);
    const total = totalSessions * program.ratePerSesi;
    return { totalSessions, total };
  }

/*__N6_UNIT__*/  function renderProgramFields(){
    const progId = document.getElementById('fProgram').value;
    const program = catalogById(progId);
    const configWrap = document.getElementById('fConfigWrap');
    const fixedWrap = document.getElementById('fFixedWrap');
    const customWrap = document.getElementById('fCustomWrap');
    const semiWrap = document.getElementById('fSemiWrap');
    const nameLabel = document.getElementById('fNameLabel');
    configWrap.style.display = 'none'; fixedWrap.style.display = 'none'; customWrap.style.display = 'none';

    const isSemi = progId === 'semi-private';
    semiWrap.style.display = isSemi ? 'block' : 'none';
    nameLabel.textContent = isSemi ? 'Nama Klien 1' : 'Nama Lengkap';
    if (!isSemi) document.getElementById('fName2').value = '';

    if (!program) return;

    if (program.mode === 'configurable'){
      configWrap.style.display = 'block';
      updateConfigPriceBox();
    } else if (program.mode === 'fixed'){
      fixedWrap.style.display = 'block';
      document.getElementById('fPriceBoxFixed').innerHTML = `
        <div class="row"><span>Program</span><span>${escapeHtml(program.label)}</span></div>
        <div class="total"><span>Total Biaya</span><span>${formatRupiah(program.price)}</span></div>
        <div class="row"><span>Durasi</span><span>${escapeHtml(program.unit)}</span></div>`;
    } else if (program.mode === 'custom'){
      customWrap.style.display = 'block';
      if (progId === 'korporat'){
        document.getElementById('fCustomNameLabel').textContent = 'Nama Perusahaan';
        document.getElementById('fCustomCountLabel').textContent = 'Jumlah Karyawan';
      } else {
        document.getElementById('fCustomNameLabel').textContent = 'Nama Event';
        document.getElementById('fCustomCountLabel').textContent = 'Jumlah Pacer';
      }
    }
  }
/*__N6_UNIT__*/  function roundRectPath(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
/*__N6_UNIT__*/  function wrapText(ctx, text, x, y, maxWidth, lineHeight){
    const words = String(text).split(' ');
    let line = '', lines = 0;
    for (let i = 0; i < words.length; i++){
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && line){
        ctx.fillText(line.trim(), x, y + lines * lineHeight);
        line = words[i] + ' ';
        lines++;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), x, y + lines * lineHeight);
    return lines + 1;
  }
/*__N6_UNIT__*/  function wrapLines(ctx, text, maxWidth){
    const words = String(text).split(' ');
    let line = '', lines = [];
    for (let i = 0; i < words.length; i++){
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && line){ lines.push(line.trim()); line = words[i] + ' '; }
      else { line = test; }
    }
    lines.push(line.trim());
    return lines;
  }
/*__N6_UNIT__*/  function nowPrintLabel(){
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
    const jam = now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }).replace(':', '.') + ' WIB';
    return { tanggal, jam };
  }
/*__N6_UNIT__*/  let ticketFilter = 'semua';
/*__N6_UNIT__*/  let autoIssueMap = {};
/*__N6_UNIT__*/  function populateBroadcastCoachSelect(){
    document.getElementById('bCoach').innerHTML = coachRoster.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
  }
/*__N6_UNIT__*/  function broadcastTargets(){
    const target = document.getElementById('bTarget').value;
    if (target === 'coach'){
      const coachName = document.getElementById('bCoach').value;
      return clients.filter(c => c.coach === coachName);
    }
    return clients;
  }
/*__N6_UNIT__*/  function updateBroadcastCount(){
    document.getElementById('bTargetCount').textContent = 'Pesan akan dikirim ke ' + broadcastTargets().length + ' klien.';
  }
  window.openBroadcast = function(){
    populateBroadcastCoachSelect();
    document.getElementById('bTarget').value = 'all';
    document.getElementById('bCoachWrap').style.display = 'none';
    document.getElementById('bMessage').value = '';
    updateBroadcastCount();
    document.getElementById('broadcastModal').classList.add('show');
  };
  window.closeBroadcast = function(){ document.getElementById('broadcastModal').classList.remove('show'); };
/*__N6_UNIT__*/  let activeDay = todayDayName();
/*__N6_UNIT__*/  const todayNow = new Date();
/*__N6_UNIT__*/  let calYear = todayNow.getFullYear();
/*__N6_UNIT__*/  let calMonth = todayNow.getMonth();
/*__N6_UNIT__*/  let selectedCalDate = null;

/*__N6_UNIT__*/  function dateStrOf(y, m, d){ return y + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0'); }
/*__N6_UNIT__*/  function weekdayNameOf(y, m, d){
    const jsDay = new Date(y, m, d).getDay();
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    return DAYS[idx];
  }
/*__N6_UNIT__*/  function isCoachOff(coachId, dateStr){ return !!(coachDayOff[coachId] || []).includes(dateStr); }

/*__N6_UNIT__*/  function daySummary(dateStr, weekday){
    let kosong = 0, total = 0, anyOff = false;
    coachRoster.forEach(coach => {
      const off = isCoachOff(coach.id, dateStr);
      if (off){ anyOff = true; return; }
      const sched = coachSchedule[coach.id] || {};
      BLOCKS.forEach(b => {
        total++;
        if (!sched[weekday + '|' + b.key]) kosong++;
      });
    });
    return { kosong, total, anyOff };
  }

/*__N6_UNIT__*/  function renderAll(){
    renderBeranda();
    renderClientList();
    renderArchive();
    renderJadwal();
    renderPriceList();
    renderTickets();
    renderMessages();
    renderCoachRoster();
    renderShareCoachOptions();
    renderDayTabs();
    renderSchedTable();
    renderCoachCalendar();
    renderCoachCalDetail();
  }

  /* ================= NAV / PANEL SWITCH ================= */
/*__N6_UNIT__*/  function switchPanel(name){
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    document.querySelectorAll('.side-nav button, .bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    document.getElementById('pageTitle').textContent = panelTitles[name] || name;
    closeSidebar();
    const more=document.getElementById('n6MoreMenu');if(more)more.hidden=true;
  }
  window.switchPanel = switchPanel;
  document.querySelectorAll('.side-nav button, .bottom-nav button').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });

/*__N6_UNIT__*/  const sidebarEl = document.getElementById('sidebar');
/*__N6_UNIT__*/  const sidebarOverlay = document.getElementById('sidebarOverlay');
/*__N6_UNIT__*/  function openSidebar(){ sidebarEl.classList.add('open'); sidebarOverlay.classList.add('show'); }
/*__N6_UNIT__*/  const N6_KEYS=['programCatalog','coachRoster','coachSchedule','coachDayOff','clients','tickets','archivedClients'];
/*__N6_UNIT__*/  const n6ThemeKey=STORE_PREFIX+'theme:v2';
/*__N6_UNIT__*/  function n6SetTheme(t){document.body.dataset.theme=t;try{localStorage.setItem(n6ThemeKey,t)}catch(e){};document.getElementById('n6ThemeBtn').textContent='♙';document.getElementById('n6ChooseLight').setAttribute('aria-pressed',String(t!=='dark'));document.getElementById('n6ChooseDark').setAttribute('aria-pressed',String(t==='dark'))}
/*__N6_UNIT__*/  function n6ToggleTheme(){n6SetTheme(document.body.dataset.theme==='dark'?'light':'dark')}
  n6SetTheme(localStorage.getItem(n6ThemeKey)==='light'?'light':'dark');
  document.getElementById('n6ThemeBtn').addEventListener('click',n6OpenAccount);
  document.getElementById('n6MobileTheme').addEventListener('click',n6OpenAccount);
/*__N6_UNIT__*/  const read=(key,fallback)=>{try{const v=localStorage.getItem(STORE_PREFIX+key);return v===null?fallback:JSON.parse(v)}catch(e){return fallback}};
