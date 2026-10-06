/**
 * N6 dist bundle - admin
 *
 * GENERATED FILE - do not edit. Source of truth is js/modules/admin/*.js
 * Rebuilt by tools/build.ps1; concatenation is byte-identical to the
 * original <script> block in admin.html.
 */


(function(){
  /* ================= KATALOG PROGRAM (default — bisa diubah lewat storage 'programCatalog') ================= */
  const DEFAULT_PROGRAM_CATALOG = [
    { id:'run-start', label:'Run-Start', category:'Online', mode:'fixed', unit:'3 Bulan', price:334000 },
    { id:'privat-online', label:'Private Online', category:'Online', mode:'fixed', unit:'1 Bulan', price:800000 },
    { id:'single-session', label:'Single Session Training', category:'Offline', mode:'fixed', unit:'1x Pertemuan', price:170000 },
    { id:'running-class', label:'Running Class (5–20 orang)', category:'Offline', mode:'configurable', unit:'per orang', ratePerSesi:65000, defaultMeetings:2, defaultWeeks:4 },
    { id:'semi-private', label:'Semi Private (2 orang)', category:'Offline', mode:'configurable', unit:'per paket', ratePerSesi:190000, defaultMeetings:2, defaultWeeks:4 },
    { id:'private-offline', label:'Private Offline', category:'Offline', mode:'configurable', unit:'per paket', ratePerSesi:150000, defaultMeetings:2, defaultWeeks:4 },
    { id:'korporat', label:'Kerja Sama Korporat (Karyawan)', category:'Kerja Sama', mode:'custom' },
    { id:'event-pacer', label:'Kerja Sama Event (Pacer)', category:'Kerja Sama', mode:'custom' }
  ];
  const DEFAULT_COACH_ROSTER = [
    { id:'c1', name:'Rangga Saputra', phone:'081200000001' },
    { id:'c2', name:'Dinda Ayu', phone:'081200000002' },
    { id:'c3', name:'Fajar Nugroho', phone:'081200000003' }
  ];
  const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
  const BLOCKS = [
    { key:'pagi', label:'Pagi', time:'06:00–09:00' },
    { key:'siang', label:'Siang', time:'09:00–12:00' },
    { key:'sore', label:'Sore', time:'15:00–18:00' },
    { key:'malam', label:'Malam', time:'18:00–21:00' }
  ];

  function slugify(name){ return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
  function escapeHtml(s){ const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
  function todayISO(){ const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
  function daysBetween(a, b){ return Math.round((new Date(b) - new Date(a)) / 86400000); }
  function formatDateID(dateStr){
    if (!dateStr) return '-';
    const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const [y,m,d] = dateStr.split('-');
    return parseInt(d,10) + ' ' + bulan[parseInt(m,10)-1] + ' ' + y;
  }
  function formatRupiah(n){ n = Number(n) || 0; return 'Rp' + n.toLocaleString('id-ID'); }
  function clientPortalUrl(id){ return 'dashboard-client.html?client=' + encodeURIComponent(id); }
  // Logo N6 putih transparan, dipakai pada header Invoice (PNG) agar konsisten dgn Laporan Keuangan Coach
  const LOGO_DATA = "assets/img/logo-report.png";
  function todayDayName(){
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
  const STORE_PREFIX = 'n6csAdmin:';
  async function storeGet(key){
    try{ return localStorage.getItem(STORE_PREFIX + key); }
    catch(e){ return null; }
  }
  async function storeSet(key, value){
    try{ localStorage.setItem(STORE_PREFIX + key, value); if(localStorage.getItem(STORE_PREFIX + key)!==value) throw Error('Verifikasi gagal'); return true; }
    catch(e){ showToast('GAGAL menyimpan! Periksa izin penyimpanan browser.'); throw e; }
  }

  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  /* ================= STATE ================= */
  let clients = [];
  let tickets = [];
  let archivedClients = [];
  let chatCache = {};
  let reportsCache = {};
  let programCache = {};
  let programCatalog = [];
  let coachRoster = [];
  let coachSchedule = {};
  let coachDayOff = {};
  let activeChatClientId = null;
  let activeSlot = null; // { coachId, day, blockKey }
  let pendingArchiveNotice = 0;

  function catalogById(id){ return programCatalog.find(p => p.id === id); }
  function coachById(id){ return coachRoster.find(c => c.id === id); }

  function seedDemoIfEmpty(){
    if (clients.length) return false;
    const d = new Date();
    const iso = (offsetDays) => { const x = new Date(d.getTime() + offsetDays*86400000); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'); };
    clients = [
      { id:'dimas-prasetyo', name:'Dimas Prasetyo', phone:'081234567890', coach:'Rangga Saputra',
        programId:'running-class', programLabel:'Running Class (5–20 orang)',
        packageMeta:{ mode:'configurable', meetings:2, weeks:4, totalSessions:8 },
        price:520000, priceLabel: formatRupiah(520000) + ' / 8x pertemuan',
        status:'Aktif', joinDate: iso(-4), notes:'' },
      { id:'siti-rahmawati', name:'Siti Rahmawati', phone:'081298765432', coach:'Dinda Ayu',
        programId:'privat-online', programLabel:'Private Online',
        packageMeta:{ mode:'fixed' },
        price:800000, priceLabel: formatRupiah(800000) + ' / 1 Bulan',
        status:'Aktif', joinDate: iso(-2), notes:'' },
    ];
    programCache['dimas-prasetyo'] = { pbStart:'25:30', pbEnd:'23:10', startDate: iso(-30), endDate: iso(30) };
    programCache['siti-rahmawati'] = { pbStart:'', pbEnd:'', startDate: iso(-3), endDate: iso(27) };
    chatCache['dimas-prasetyo'] = [
      { sender:'coach', text:'Halo! Laporan kemarin sudah saya cek, pace-nya membaik.', at:new Date(Date.now()-86400000).toISOString() },
      { sender:'client', text:'Siap coach, terima kasih! Btw jadwal sesi minggu depan bisa digeser ke sore?', at:new Date(Date.now()-3600000).toISOString() }
    ];
    reportsCache['dimas-prasetyo'] = { [iso(-2)]: { link:'https://connect.garmin.com/contoh', issue:'Lutut sedikit nyeri di km ke-4', submittedAt:new Date().toISOString() } };
    reportsCache['siti-rahmawati'] = {};
    return true;
  }

  /* ================= LOAD DATA ================= */
  async function loadAllData(){
    // Preserve the exact existing browser records. No demo data and no automatic archiving.
    const read = async (key, fallback) => {
      const raw=await storeGet(key);
      if(raw===null) return fallback;
      try { const parsed=JSON.parse(raw); return parsed!==null?parsed:fallback; }
      catch(err){ console.error('Data rusak pada '+key,err); showToast('Data '+key+' tidak terbaca. Jangan hapus cadangan.'); return fallback; }
    };
    programCatalog=await read('programCatalog',DEFAULT_PROGRAM_CATALOG);
    coachRoster=await read('coachRoster',[]);
    coachSchedule=await read('coachSchedule',{});
    coachDayOff=await read('coachDayOff',{});
    clients=await read('clients',[]);
    tickets=await read('tickets',[]);
    archivedClients=await read('archivedClients',[]);
    if(!Array.isArray(programCatalog))programCatalog=DEFAULT_PROGRAM_CATALOG;
    if(!Array.isArray(coachRoster))coachRoster=[];
    if(!Array.isArray(clients))clients=[];
    if(!Array.isArray(tickets))tickets=[];
    if(!Array.isArray(archivedClients))archivedClients=[];
    chatCache={};reportsCache={};programCache={};
    for(const c of [...clients,...archivedClients]){
      chatCache[c.id]=await read('chat:'+c.id,[]);
      reportsCache[c.id]=await read('reports:'+c.id,{});
      programCache[c.id]=await read('program:'+c.id,c.programSnapshot||{});
    }
    pendingArchiveNotice=0;
  }

  async function persistClients(){ await storeSet('clients', JSON.stringify(clients)); }
  async function persistTickets(){ await storeSet('tickets', JSON.stringify(tickets)); }
  async function persistChat(id){ await storeSet('chat:' + id, JSON.stringify(chatCache[id] || [])); }
  async function persistProgram(id){ await storeSet('program:' + id, JSON.stringify(programCache[id] || {})); }
  async function persistCoachRoster(){ await storeSet('coachRoster', JSON.stringify(coachRoster)); }
  async function persistCoachSchedule(){ await storeSet('coachSchedule', JSON.stringify(coachSchedule)); }
  async function persistCoachDayOff(){ await storeSet('coachDayOff', JSON.stringify(coachDayOff)); }

  /* ================= DERIVED HELPERS ================= */
  function clientStatus(c){
    const p = programCache[c.id] || {};
    if (!p.endDate) return c.status || 'Aktif';
    const diff = daysBetween(todayISO(), p.endDate);
    if (diff < 0) return 'Nonaktif';
    if (diff <= 7) return 'Akan Berakhir';
    return 'Aktif';
  }
  function statusTone(status){
    if (status === 'Aktif') return 'green';
    if (status === 'Akan Berakhir') return 'amber';
    if (status === 'Nonaktif') return 'neutral';
    return 'neutral';
  }
  function autoIssues(){
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
  function openTicketCount(){
    const manualOpen = tickets.filter(t => t.status !== 'Selesai').length;
    const alreadyLinked = new Set(tickets.map(t => t.autoKey).filter(Boolean));
    const autoOpen = autoIssues().filter(a => !alreadyLinked.has(a.clientId + '|' + a.date)).length;
    return manualOpen + autoOpen;
  }
  function lastMessage(id){
    const arr = chatCache[id] || [];
    return arr.length ? arr[arr.length-1] : null;
  }
  function waitingReplyCount(){
    return clients.filter(c => { const m = lastMessage(c.id); return m && m.sender === 'client'; }).length;
  }

  /* ================= RENDER: BERANDA ================= */
  function renderBeranda(){
    document.getElementById('statTotalKlien').textContent = clients.length;
    document.getElementById('n6TotalCoach').textContent = coachRoster.length;
    document.getElementById('n6Expiring').textContent = clients.filter(c=>{const d=(programCache[c.id]||{}).endDate;return d && daysBetween(todayISO(),d)>=0 && daysBetween(todayISO(),d)<=7}).length;
    document.getElementById('n6Unpaid').textContent = clients.filter(c=>c.paymentStatus && c.paymentStatus!=='Lunas').length;
    document.getElementById('n6Archived').textContent = archivedClients.length;
    const baru7 = clients.filter(c => c.joinDate && daysBetween(c.joinDate, todayISO()) <= 7 && daysBetween(c.joinDate, todayISO()) >= 0).length;
    document.getElementById('statKlienBaru').textContent = baru7;
    document.getElementById('statTiketTerbuka').textContent = openTicketCount();
    document.getElementById('statPesanMenunggu').textContent = waitingReplyCount();

    const attention = [];
    autoIssues().slice(0,5).forEach(a => attention.push({ type:'red', name:a.clientName, desc:'Laporan ' + formatDateID(a.date) + ': ' + a.issue, id:a.clientId }));
    clients.forEach(c => {
      if (clientStatus(c) === 'Akan Berakhir') attention.push({ type:'amber', name:c.name, desc:'Program akan berakhir ' + formatDateID((programCache[c.id]||{}).endDate), id:c.id });
    });
    document.getElementById('attentionList').innerHTML = attention.length ? attention.slice(0,6).map(a => `
      <div class="attention-item">
        <div class="attention-dot ${a.type}"></div>
        <div class="attention-body"><div class="name">${escapeHtml(a.name)}</div><div class="desc">${escapeHtml(a.desc)}</div></div>
      </div>`).join('') : '<div class="attention-empty">Tidak ada hal yang perlu perhatian saat ini.</div>';

    renderCoachKosongToday();

    const msgs = clients.map(c => ({ c, m: lastMessage(c.id) })).filter(x => x.m).sort((a,b) => new Date(b.m.at) - new Date(a.m.at)).slice(0,5);
    document.getElementById('recentMessagesList').innerHTML = msgs.length ? msgs.map(x => `
      <div class="client-row" onclick="openChatModal('${x.c.id}')">
        <div>
          <div class="name">${escapeHtml(x.c.name)} ${x.m.sender === 'client' ? '<span class="unread-dot" style="display:inline-block; vertical-align:middle; margin-left:6px;"></span>' : ''}</div>
          <div class="msg-preview">${x.m.sender === 'client' ? 'Klien' : 'Kamu'}: ${escapeHtml(x.m.text)}</div>
        </div>
        <div class="client-tags"><span class="badge neutral">${new Date(x.m.at).toLocaleDateString('id-ID')}</span></div>
      </div>`).join('') : '<div class="list-empty">Belum ada percakapan.</div>';

    const recentClients = [...clients].sort((a,b) => (b.joinDate||'').localeCompare(a.joinDate||'')).slice(0,5);
    document.getElementById('recentClientsList').innerHTML = recentClients.length ? recentClients.map(c => `
      <div class="client-row" onclick="openClientDetail('${c.id}')">
        <div><div class="name">${escapeHtml(c.name)}</div><div class="meta">${escapeHtml(c.programLabel||'-')} — Coach ${escapeHtml(c.coach||'-')}</div></div>
        <div class="client-tags"><span class="badge neutral">${formatDateID(c.joinDate)}</span></div>
      </div>`).join('') : '<div class="list-empty">Belum ada klien terdaftar.</div>';

    const tiketBadge = openTicketCount();
    ['navDotTiket','navDotTiketMobile'].forEach(id => {
      const el = document.getElementById(id);
      if (tiketBadge > 0){ el.style.display='flex'; el.textContent = tiketBadge; } else { el.style.display='none'; }
    });
    const pesanBadge = waitingReplyCount();
    ['navDotPesan','navDotPesanMobile'].forEach(id => {
      const el = document.getElementById(id);
      if (pesanBadge > 0){ el.style.display='flex'; el.textContent = pesanBadge; } else { el.style.display='none'; }
    });
    document.getElementById('bellIcon').classList.toggle('has-alert', (tiketBadge + pesanBadge) > 0);
  }

  function renderCoachKosongToday(){
    const day = todayDayName();
    const todayStr = todayISO();
    const rows = coachRoster.map(coach => {
      const off = isCoachOff(coach.id, todayStr);
      const sched = coachSchedule[coach.id] || {};
      const freeBlocks = off ? [] : BLOCKS.filter(b => !sched[day + '|' + b.key]);
      return { coach, freeBlocks, off };
    });
    document.getElementById('coachKosongToday').innerHTML = rows.length ? rows.map(r => `
      <div class="attention-item">
        <div class="attention-dot ${r.off ? 'amber' : (r.freeBlocks.length ? 'green' : 'red')}"></div>
        <div class="attention-body">
          <div class="name">${escapeHtml(r.coach.name)} <span style="font-weight:400; color:var(--asphalt); font-size:11.5px;">(${day})</span></div>
          <div class="desc">${r.off ? 'Libur hari ini' : (r.freeBlocks.length ? 'Kosong: ' + r.freeBlocks.map(b => b.label).join(', ') : 'Penuh sepanjang hari')}</div>
        </div>
      </div>`).join('') : '<div class="attention-empty">Belum ada coach terdaftar.</div>';
  }

  /* ================= RENDER: KLIEN ================= */
  function populateCoachFilters(){
    const sel = document.getElementById('klienFilterCoach');
    sel.innerHTML = '<option value="">Semua Coach</option>' + coachRoster.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
  }
  function renderClientList(){
    document.getElementById('klienCountTitle').textContent = 'Semua Klien (' + clients.length + ')';
    const search = (document.getElementById('klienSearchInput').value || '').toLowerCase().trim();
    const fCoach = document.getElementById('klienFilterCoach').value;
    const fStatus = document.getElementById('klienFilterStatus').value;
    let list = clients.filter(c => {
      if (search && !(c.name.toLowerCase().includes(search) || (c.phone||'').includes(search))) return false;
      if (fCoach && c.coach !== fCoach) return false;
      if (fStatus && clientStatus(c) !== fStatus) return false;
      return true;
    });
    list = [...list].sort((a,b) => (b.joinDate||'').localeCompare(a.joinDate||''));
    document.getElementById('clientListBody').innerHTML = list.length ? list.map(c => {
      const st = clientStatus(c);
      return `
      <div class="client-row">
        <div style="cursor:pointer; flex:1; min-width:180px;" onclick="openClientDetail('${c.id}')">
          <div class="name">${escapeHtml(c.name)}</div>
          <div class="meta">${escapeHtml(c.programLabel || 'Belum ada program')} — Coach ${escapeHtml(c.coach || '-')}${(c.packageMeta && c.packageMeta.pairLabel) ? ' · Bersama ' + escapeHtml(c.packageMeta.pairLabel) : ''}</div>
        </div>
        <div class="client-tags">
          <span class="badge ${statusTone(st)}">${st}</span>
          <button class="copy-btn" onclick="event.stopPropagation(); copyClientLink('${c.id}', this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Salin Link
          </button>
          <button class="btn-sm" onclick="event.stopPropagation(); editClient('${c.id}')">Edit</button>
          <button class="btn-danger-sm" onclick="event.stopPropagation(); deleteClient('${c.id}')">Hapus</button>
        </div>
      </div>`;
    }).join('') : '<div class="list-empty">Tidak ada klien yang cocok dengan filter.</div>';
  }

  /* ================= ARSIP KLIEN (auto, Nonaktif >7 hari) ================= */
  function renderArchive(){
    const badge = document.getElementById('arsipCountBadge');
    badge.textContent = archivedClients.length ? '(' + archivedClients.length + ')' : '';
    const sorted = [...archivedClients].sort((a,b) => (b.archivedAt||'').localeCompare(a.archivedAt||''));
    document.getElementById('archiveListBody').innerHTML = sorted.length ? sorted.map(c => {
      const p = c.programSnapshot || {};
      return `
      <div class="client-row" style="cursor:default;">
        <div>
          <div class="name">${escapeHtml(c.name)}</div>
          <div class="meta">${escapeHtml(c.program || c.programLabel || '-')} — Coach ${escapeHtml(c.coach || '-')} — program berakhir ${formatDateID(p.endDate)}</div>
          <div class="meta">Diarsipkan otomatis pada ${formatDateID(c.archivedAt)}</div>
        </div>
        <div class="client-tags">
          <button class="btn-sm" onclick="restoreArchivedClient('${c.id}')">Pulihkan</button>
          <button class="btn-danger-sm" onclick="deleteArchivedClient('${c.id}')">Hapus Permanen</button>
        </div>
      </div>`;
    }).join('') : '<div class="list-empty">Belum ada klien yang diarsipkan otomatis.</div>';
  }
  window.restoreArchivedClient = function(id){
    const idx = archivedClients.findIndex(c => c.id === id);
    if (idx < 0) return;
    const restored = { ...archivedClients[idx] };
    delete restored.archivedAt;
    delete restored.programSnapshot;
    clients.push(restored);
    archivedClients.splice(idx, 1);
    Promise.all([persistClients(), storeSet('archivedClients', JSON.stringify(archivedClients))]).then(() => {
      showToast('Klien dipulihkan ke daftar aktif');
      populateFormSelects();
      renderAll();
    });
  };
  window.deleteArchivedClient = function(id){
    const c = archivedClients.find(x => x.id === id);
    if (!c) return;
    if (!confirm('Hapus permanen data "' + c.name + '"? Laporan latihan, riwayat chat, dan data program klien ini akan hilang selamanya dan tidak bisa dikembalikan.')) return;
    archivedClients = archivedClients.filter(x => x.id !== id);
    Promise.all([
      storeSet('archivedClients', JSON.stringify(archivedClients)),
      storeSet('chat:' + id, JSON.stringify([])),
      storeSet('reports:' + id, JSON.stringify({})),
      storeSet('program:' + id, JSON.stringify({}))
    ]).then(() => {
      showToast('Data klien dihapus permanen');
      renderAll();
    });
  };

  window.copyClientLink = function(id, btn){
    const url = clientPortalUrl(id);
    const full = (window.location.href.split('?')[0].replace(/[^\/]+$/, '')) + url;
    const text = full || url;
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(() => flashCopied(btn));
    } else {
      flashCopied(btn);
    }
  };
  function flashCopied(btn){
    if (!btn) return;
    const orig = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = 'Tersalin!';
    setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = orig; }, 1500);
    showToast('Link dashboard klien disalin');
  }

  /* ================= FORM TAMBAH/EDIT KLIEN — PROGRAM DINAMIS ================= */
  function populateFormSelects(){
    document.getElementById('fCoach').innerHTML = coachRoster.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
    document.getElementById('fProgram').innerHTML = '<option value="">Pilih program</option>' +
      ['Online','Offline','Kerja Sama'].map(cat => {
        const opts = programCatalog.filter(p => p.category === cat).map(p => `<option value="${p.id}">${escapeHtml(p.label)}</option>`).join('');
        return opts ? `<optgroup label="${cat}">${opts}</optgroup>` : '';
      }).join('');
  }

  function computeConfigPrice(program, meetings, weeks){
    const totalSessions = Math.max(1, meetings) * Math.max(1, weeks);
    const total = totalSessions * program.ratePerSesi;
    return { totalSessions, total };
  }

  function renderProgramFields(){
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
  function updateConfigPriceBox(){
    const progId = document.getElementById('fProgram').value;
    const program = catalogById(progId);
    if (!program || program.mode !== 'configurable') return;
    const meetings = parseInt(document.getElementById('fMeetings').value, 10) || 1;
    const weeks = parseInt(document.getElementById('fWeeks').value, 10) || 1;
    const { totalSessions, total } = computeConfigPrice(program, meetings, weeks);
    document.getElementById('fPriceBoxConfig').innerHTML = `
      <div class="row"><span>Total Pertemuan</span><span>${totalSessions}x (${meetings}x/minggu × ${weeks} minggu)</span></div>
      <div class="row"><span>Tarif per Sesi</span><span>${formatRupiah(program.ratePerSesi)}</span></div>
      <div class="total"><span>Total Biaya</span><span>${formatRupiah(total)}</span></div>`;
  }

  window.openClientForm = function(){
    document.getElementById('clientFormTitle').textContent = 'Tambah Klien';
    document.getElementById('fClientId').value = '';
    document.getElementById('fName').value = '';
    document.getElementById('fName2').value = '';
    document.getElementById('fPhone').value = '';
    document.getElementById('fCoach').value = coachRoster.length ? coachRoster[0].name : '';
    document.getElementById('fProgram').value = '';
    document.getElementById('fMeetings').value = 2;
    document.getElementById('fWeeks').value = 4;
    document.getElementById('fCustomName').value = '';
    document.getElementById('fCustomCount').value = '';
    document.getElementById('fCustomValue').value = '';
    document.getElementById('fCustomNote').value = '';
    document.getElementById('fStart').value = todayISO();
    document.getElementById('fEnd').value = '';
    document.getElementById('fPbStart').value = '';
    document.getElementById('fPbEnd').value = '';
    document.getElementById('fPaymentStatus').value = 'Belum Lunas';
    document.getElementById('fAmountPaid').value = '';
    document.getElementById('fNotes').value = '';
    document.getElementById('clientFormError').style.display = 'none';
    document.getElementById('invoiceActionWrap').style.display = 'none';
    renderProgramFields();
    document.getElementById('clientFormModal').classList.add('show');
  };
  window.editClient = function(id){
    const c = clients.find(x => x.id === id);
    if (!c) return;
    const p = programCache[id] || {};
    const meta = c.packageMeta || {};
    document.getElementById('clientFormTitle').textContent = 'Edit Klien';
    document.getElementById('fClientId').value = c.id;
    document.getElementById('fName').value = c.name;
    document.getElementById('fName2').value = meta.pairLabel || '';
    document.getElementById('fPhone').value = c.phone || '';
    document.getElementById('fCoach').value = c.coach || (coachRoster[0] ? coachRoster[0].name : '');
    document.getElementById('fProgram').value = c.programId || '';
    document.getElementById('fMeetings').value = meta.meetings || 2;
    document.getElementById('fWeeks').value = meta.weeks || 4;
    document.getElementById('fCustomName').value = meta.partnerName || '';
    document.getElementById('fCustomCount').value = meta.count || '';
    document.getElementById('fCustomValue').value = c.price || '';
    document.getElementById('fCustomNote').value = meta.note || '';
    document.getElementById('fStart').value = p.startDate || '';
    document.getElementById('fEnd').value = p.endDate || '';
    document.getElementById('fPbStart').value = p.pbStart || '';
    document.getElementById('fPbEnd').value = p.pbEnd || '';
    document.getElementById('fPaymentStatus').value = c.paymentStatus || 'Belum Lunas';
    document.getElementById('fAmountPaid').value = c.amountPaid || '';
    document.getElementById('fNotes').value = c.notes || '';
    document.getElementById('clientFormError').style.display = 'none';
    document.getElementById('invoiceActionWrap').style.display = 'block';
    renderProgramFields();
    document.getElementById('clientFormModal').classList.add('show');
  };
  window.closeClientForm = function(){ document.getElementById('clientFormModal').classList.remove('show'); };

  async function saveClientForm(){
    const name = document.getElementById('fName').value.trim();
    const errEl = document.getElementById('clientFormError');
    if (!name){ errEl.textContent = 'Nama klien wajib diisi.'; errEl.style.display = 'block'; return; }

    let id = document.getElementById('fClientId').value;
    const isNew = !id;
    const progId = document.getElementById('fProgram').value;
    const isSemi = progId === 'semi-private';
    const name2 = document.getElementById('fName2').value.trim();

    if (isSemi && isNew && !name2){
      errEl.textContent = 'Nama Klien 2 wajib diisi untuk program Semi Private.';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    if (isNew){
      let base = slugify(name) || 'klien';
      id = base; let n = 2;
      while (clients.some(c => c.id === id)){ id = base + '-' + n; n++; }
    }

    const program = catalogById(progId);
    let packageMeta = {}, price = 0, priceLabel = '-', programLabel = program ? program.label : '';
    if (program){
      if (program.mode === 'fixed'){
        packageMeta = { mode:'fixed' };
        price = program.price;
        priceLabel = formatRupiah(price) + ' / ' + program.unit;
      } else if (program.mode === 'configurable'){
        const meetings = parseInt(document.getElementById('fMeetings').value, 10) || 1;
        const weeks = parseInt(document.getElementById('fWeeks').value, 10) || 1;
        const { totalSessions, total } = computeConfigPrice(program, meetings, weeks);
        packageMeta = { mode:'configurable', meetings, weeks, totalSessions };
        price = total;
        priceLabel = formatRupiah(price) + ' / ' + totalSessions + 'x pertemuan';
      } else if (program.mode === 'custom'){
        const partnerName = document.getElementById('fCustomName').value.trim();
        const count = document.getElementById('fCustomCount').value;
        const note = document.getElementById('fCustomNote').value.trim();
        price = parseInt(document.getElementById('fCustomValue').value, 10) || 0;
        packageMeta = { mode:'custom', partnerName, count, note };
        priceLabel = (price ? formatRupiah(price) : 'Nego') + (partnerName ? ' — ' + partnerName : '');
      }
    }

    const phone = document.getElementById('fPhone').value.trim();
    const coach = document.getElementById('fCoach').value;
    const paymentStatus = document.getElementById('fPaymentStatus').value;
    const amountPaid = parseInt(document.getElementById('fAmountPaid').value, 10) || 0;
    const notes = document.getElementById('fNotes').value.trim();
    const programEntry = {
      pbStart: document.getElementById('fPbStart').value.trim(),
      pbEnd: document.getElementById('fPbEnd').value.trim(),
      startDate: document.getElementById('fStart').value,
      endDate: document.getElementById('fEnd').value
    };

    function buildClientData(clientId, clientName, meta){
      return {
        id: clientId, name: clientName,
        phone,
        coach,
        programId: progId, programLabel, packageMeta: meta, price, priceLabel,
        status: 'Aktif',
        joinDate: isNew ? todayISO() : (clients.find(c=>c.id===clientId)||{}).joinDate || todayISO(),
        paymentStatus, amountPaid,
        invoiceNumber: (clients.find(c=>c.id===clientId)||{}).invoiceNumber || '',
        notes
      };
    }
    async function finalizeClient(clientId){
      programCache[clientId] = { ...programEntry };
      if (!chatCache[clientId]) chatCache[clientId] = [];
      if (!reportsCache[clientId]) reportsCache[clientId] = {};
      await persistProgram(clientId);
      if (isNew){ await storeSet('chat:' + clientId, JSON.stringify(chatCache[clientId])); await storeSet('reports:' + clientId, JSON.stringify(reportsCache[clientId])); }
    }

    // ===== Program Semi Private (baru) — buat 2 klien terpisah, masing-masing dgn ID & link dashboard sendiri =====
    if (isSemi && isNew && name2){
      let base2 = slugify(name2) || 'klien';
      let id2 = base2; let n2 = 2;
      while (clients.some(c => c.id === id2) || id2 === id){ id2 = base2 + '-' + n2; n2++; }

      const data1 = buildClientData(id, name, { ...packageMeta, pairWith: id2, pairLabel: name2 });
      const data2 = buildClientData(id2, name2, { ...packageMeta, pairWith: id, pairLabel: name });
      clients.push(data1);
      clients.push(data2);

      await persistClients();
      await finalizeClient(id);
      await finalizeClient(id2);

      closeClientForm();
      showToast('2 klien Semi Private berhasil didaftarkan dengan link masing-masing');
      renderAll();
      return;
    }

    // ===== Edit klien Semi Private yang sudah ada — sinkronkan nama pasangan bila diubah =====
    if (isSemi && !isNew){
      const existing = clients.find(c => c.id === id);
      const prevMeta = (existing && existing.packageMeta) || {};
      packageMeta = { ...packageMeta, pairWith: prevMeta.pairWith || null, pairLabel: name2 || prevMeta.pairLabel || '' };
      if (prevMeta.pairWith){
        const partnerIdx = clients.findIndex(c => c.id === prevMeta.pairWith);
        if (partnerIdx >= 0 && name2){
          clients[partnerIdx] = {
            ...clients[partnerIdx],
            name: name2,
            packageMeta: { ...clients[partnerIdx].packageMeta, pairLabel: name }
          };
        }
      }
    }

    const data = buildClientData(id, name, packageMeta);
    if (isNew){ clients.push(data); }
    else { const idx = clients.findIndex(c => c.id === id); clients[idx] = { ...clients[idx], ...data }; }

    await persistClients();
    await finalizeClient(id);

    closeClientForm();
    showToast(isNew ? 'Klien baru berhasil didaftarkan' : 'Data klien diperbarui');
    renderAll();
  }

  window.deleteClient = function(id){
    const c = clients.find(x => x.id === id);
    if (!c) return;
    if (!confirm('Hapus klien "' + c.name + '"? Data laporan dan chat klien ini tidak akan tampil lagi di dashboard.')) return;
    clients = clients.filter(x => x.id !== id);
    persistClients().then(() => { showToast('Klien dihapus'); renderAll(); });
  };

  /* ================= INVOICE (JPG) ================= */
  function roundRectPath(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function wrapText(ctx, text, x, y, maxWidth, lineHeight){
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
  function wrapLines(ctx, text, maxWidth){
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
  function nowPrintLabel(){
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
    const jam = now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }).replace(':', '.') + ' WIB';
    return { tanggal, jam };
  }
  function ensureInvoiceNumber(c){
    if (!c.invoiceNumber){
      c.invoiceNumber = 'INV/N6/' + todayISO().replace(/-/g,'') + '/' + c.id.slice(0,6).toUpperCase();
      persistClients();
    }
    return c.invoiceNumber;
  }

  window.downloadInvoice = async function(id){
    const c = clients.find(x => x.id === id);
    if (!c){ showToast('Klien tidak ditemukan'); return; }
    const p = programCache[c.id] || {};
    const invoiceNo = ensureInvoiceNumber(c);

    // preload logo dulu supaya drawImage tidak kosong
    const logoImg = new Image();
    await new Promise((resolve) => { logoImg.onload = resolve; logoImg.onerror = resolve; logoImg.src = LOGO_DATA; });

    const pay = c.paymentStatus || 'Belum Lunas';
    const meta = c.packageMeta || {};
    let detailLine = '';
    if (meta.mode === 'configurable') detailLine = meta.totalSessions + 'x pertemuan (' + meta.meetings + 'x/minggu × ' + meta.weeks + ' minggu)';
    else if (meta.mode === 'fixed') detailLine = 'Paket tetap — ' + ((catalogById(c.programId) || {}).unit || '');
    else if (meta.mode === 'custom') detailLine = (meta.partnerName ? meta.partnerName + ' — ' : '') + (meta.count ? meta.count + ' peserta' : '') + (meta.note ? ' · ' + meta.note : '');
    const noteText = 'Invoice ini dicetak otomatis oleh sistem dan sah tanpa tanda tangan basah. Pertanyaan seputar invoice ini bisa menghubungi Admin CS via WhatsApp 0851-4726-7786.';

    // ===== KANVAS RASIO A4 POTRAIT (210:297mm), resolusi cetak layak (150dpi) =====
    const W = 1240, H = 1754, marginX = 70;

    // ukur teks lebih dulu di canvas sementara (untuk word-wrap yang presisi sebelum digambar)
    const measureCanvas = document.createElement('canvas');
    const mctx = measureCanvas.getContext('2d');
    mctx.font = '400 16px Arial';
    const detailLines = detailLine ? wrapLines(mctx, detailLine, 278) : [];
    mctx.font = 'italic 400 16px Arial';
    const noteLines = wrapLines(mctx, noteText, W - marginX * 2);

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);

    // ===== HEADER (hitam padat + garis merah + logo & judul rapat-sejajar) =====
    const headerH = 148, stripH = 7;
    ctx.fillStyle = '#111110'; ctx.fillRect(0, 0, W, headerH);
    const logoW = 130, logoH = logoW * (168 / 325);
    const logoX = marginX, logoY = (headerH - logoH) / 2;
    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    const textX = logoX + logoW + 20;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF'; ctx.font = '800 34px Arial';
    ctx.fillText('NUMBER SIX RUNNING', textX, 72);
    ctx.fillStyle = '#C9C7BE'; ctx.font = '400 17px Arial';
    ctx.fillText('Invoice Klien', textX, 100);
    ctx.fillStyle = '#D62828'; ctx.fillRect(0, headerH, W, stripH);

    // ===== BARIS IDENTITAS: KIRI (Ditagihkan Kepada) & KANAN (Meta Invoice) =====
    const topY = 200;

    ctx.fillStyle = '#6E6C64'; ctx.font = '700 14px Arial';
    ctx.fillText('DITAGIHKAN KEPADA', marginX, topY);
    ctx.fillStyle = '#111110'; ctx.font = '800 28px Arial';
    ctx.fillText(c.name, marginX, topY + 34);
    ctx.fillStyle = '#6E6C64'; ctx.font = '400 16px Arial';
    ctx.fillText((c.programLabel || 'Klien') + ' — ' + (c.phone || '-'), marginX, topY + 62);
    ctx.fillText('Periode program: ' + formatDateID(p.startDate) + ' – ' + formatDateID(p.endDate), marginX, topY + 86);
    let leftBottom = topY + 86;
    if (c.packageMeta && c.packageMeta.pairLabel){
      ctx.fillText('Peserta Semi Private bersama: ' + c.packageMeta.pairLabel, marginX, topY + 110);
      leftBottom = topY + 110;
    }

    const metaX = 780;
    function metaBlock(label, value, yy){
      ctx.fillStyle = '#6E6C64'; ctx.font = '700 13px Arial'; ctx.textAlign = 'left';
      ctx.fillText(label, metaX, yy);
      ctx.fillStyle = '#111110'; ctx.font = '600 18px Arial';
      ctx.fillText(value, metaX, yy + 24);
    }
    metaBlock('NO. INVOICE', invoiceNo.length > 24 ? invoiceNo.slice(0, 24) + '…' : invoiceNo, topY);
    metaBlock('TANGGAL', formatDateID(todayISO()), topY + 48);
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 13px Arial';
    ctx.fillText('STATUS PEMBAYARAN', metaX, topY + 96);
    const payColor = pay === 'Lunas' ? '#1E8E3E' : pay === 'DP Sebagian' ? '#B7791F' : '#D62828';
    const payBg = pay === 'Lunas' ? '#E8F5EC' : pay === 'DP Sebagian' ? '#FBF1DF' : '#FCEBEB';
    roundRectPath(ctx, metaX, topY + 104, 130, 32, 16);
    ctx.fillStyle = payBg; ctx.fill();
    ctx.fillStyle = payColor; ctx.font = '800 14px Arial'; ctx.textAlign = 'center';
    ctx.fillText(pay.toUpperCase(), metaX + 65, topY + 125);
    ctx.textAlign = 'left';
    const rightBottom = topY + 136;

    const dividerY = Math.max(leftBottom, rightBottom) + 40;
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(marginX, dividerY); ctx.lineTo(W - marginX, dividerY); ctx.stroke();

    // ===== TABEL RINCIAN PROGRAM (grid hitam-putih, konsisten dgn Laporan Keuangan Coach) =====
    const tableTop = dividerY + 40;
    const tableX0 = marginX, tableX1 = W - marginX;
    const col1X = tableX0, col2X = tableX0 + 480, col3X = col2X + 310;
    const headerRowH = 48;

    ctx.fillStyle = '#111110'; ctx.fillRect(tableX0, tableTop, tableX1 - tableX0, headerRowH);
    ctx.fillStyle = '#FFFFFF'; ctx.font = '700 15px Arial'; ctx.textAlign = 'left';
    ctx.fillText('DESKRIPSI PROGRAM', col1X + 20, tableTop + 30);
    ctx.fillText('RINCIAN', col2X + 20, tableTop + 30);
    ctx.textAlign = 'right'; ctx.fillText('BIAYA', tableX1 - 20, tableTop + 30); ctx.textAlign = 'left';

    const rowY = tableTop + headerRowH;
    const rowH = Math.max(80, 40 + detailLines.length * 21 + 24);

    ctx.fillStyle = '#FAFAF7'; ctx.fillRect(tableX0, rowY, tableX1 - tableX0, rowH);
    ctx.fillStyle = '#111110'; ctx.font = '800 21px Arial';
    ctx.fillText(c.programLabel || '-', col1X + 20, rowY + 34);
    ctx.fillStyle = '#6E6C64'; ctx.font = '400 16px Arial';
    detailLines.forEach((line, i) => ctx.fillText(line, col2X + 20, rowY + 34 + i * 21));
    ctx.fillStyle = '#111110'; ctx.font = '800 24px Arial'; ctx.textAlign = 'right';
    ctx.fillText(formatRupiah(c.price || 0), tableX1 - 20, rowY + 34);
    ctx.textAlign = 'left';

    const tableBottom = rowY + rowH;
    ctx.strokeStyle = '#E7E4DB'; ctx.lineWidth = 1;
    [tableTop, rowY, tableBottom].forEach(ly => { ctx.beginPath(); ctx.moveTo(tableX0, ly); ctx.lineTo(tableX1, ly); ctx.stroke(); });
    [tableX0, col2X, col3X, tableX1].forEach(lx => { ctx.beginPath(); ctx.moveTo(lx, tableTop); ctx.lineTo(lx, tableBottom); ctx.stroke(); });

    // ===== KOTAK RINGKASAN TOTAL (kanan, konsisten dgn Laporan Keuangan Coach) =====
    const price = c.price || 0;
    const paid = c.amountPaid || 0;
    const remaining = Math.max(0, price - paid);
    const boxW = 460, boxX = tableX1 - boxW, boxTop = tableBottom + 36;
    const boxH = pay === 'DP Sebagian' ? 158 : 96;

    ctx.fillStyle = '#FAFAF7'; ctx.strokeStyle = '#E7E4DB'; ctx.lineWidth = 1;
    roundRectPath(ctx, boxX, boxTop, boxW, boxH, 8);
    ctx.fill(); ctx.stroke();

    if (pay === 'DP Sebagian'){
      ctx.fillStyle = '#6E6C64'; ctx.font = '400 17px Arial';
      ctx.fillText('Total Tagihan', boxX + 24, boxTop + 36);
      ctx.textAlign = 'right'; ctx.fillText(formatRupiah(price), boxX + boxW - 24, boxTop + 36); ctx.textAlign = 'left';
      ctx.fillStyle = '#2563AE';
      ctx.fillText('Sudah Dibayar', boxX + 24, boxTop + 66);
      ctx.textAlign = 'right'; ctx.fillText('+' + formatRupiah(paid), boxX + boxW - 24, boxTop + 66); ctx.textAlign = 'left';
      ctx.strokeStyle = '#D62828'; ctx.beginPath(); ctx.moveTo(boxX + 24, boxTop + 84); ctx.lineTo(boxX + boxW - 24, boxTop + 84); ctx.stroke();
      ctx.fillStyle = '#111110'; ctx.font = '800 24px Arial';
      ctx.fillText('Sisa Tagihan', boxX + 24, boxTop + 124);
      ctx.textAlign = 'right'; ctx.fillText(formatRupiah(remaining), boxX + boxW - 24, boxTop + 124); ctx.textAlign = 'left';
    } else {
      // Label dibuat singkat (status "Lunas" sudah ditampilkan di badge atas) supaya tidak pernah bertabrakan dengan nominal, sepanjang apa pun angkanya
      const label = pay === 'Lunas' ? 'Total Dibayar' : 'Total Tagihan';
      ctx.fillStyle = '#111110'; ctx.font = '800 24px Arial';
      ctx.fillText(label, boxX + 24, boxTop + 58);
      ctx.textAlign = 'right'; ctx.fillText(formatRupiah(price), boxX + boxW - 24, boxTop + 58); ctx.textAlign = 'left';
    }

    // ===== CATATAN =====
    const noteTop = boxTop + boxH + 42;
    ctx.fillStyle = '#8C2020'; ctx.font = 'italic 400 16px Arial';
    noteLines.forEach((line, i) => ctx.fillText(line, marginX, noteTop + i * 22));

    // ===== FOOTER (identik dgn Laporan Keuangan Coach: garis tipis + waktu cetak + brand) =====
    const printLabel = nowPrintLabel();
    const footerY = H - 60;
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(marginX, footerY - 22); ctx.lineTo(W - marginX, footerY - 22); ctx.stroke();
    ctx.fillStyle = '#8C8A82'; ctx.font = '400 14px Arial'; ctx.textAlign = 'left';
    ctx.fillText('Dicetak otomatis oleh sistem pada ' + printLabel.tanggal + ', pukul ' + printLabel.jam, marginX, footerY);
    ctx.fillStyle = '#111110'; ctx.font = '700 14px Arial'; ctx.textAlign = 'right';
    ctx.fillText('NUMBER SIX RUNNING', W - marginX, footerY);
    ctx.textAlign = 'left';

    const link = document.createElement('a');
    link.download = 'Invoice-' + slugify(c.name) + '-' + todayISO() + '.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.93);
    link.click();
    showToast('Invoice diunduh');
  };

  // Sinkronkan pilihan coach dengan daftar coach aktual, termasuk setelah tambah/edit/hapus.
  function renderShareCoachOptions(){
    const sel = document.getElementById('shareScheduleCoach');
    const download = document.getElementById('btnDownloadCoachSchedule');
    if (!sel) return;
    const previous = sel.value;
    sel.replaceChildren();
    const placeholder = new Option(coachRoster.length ? 'Pilih coach...' : 'Belum ada coach terdaftar', '');
    sel.add(placeholder);
    coachRoster.forEach(coach => sel.add(new Option(coach.name, coach.id)));
    if (coachRoster.some(coach => coach.id === previous)) sel.value = previous;
    else if (coachRoster.length) sel.value = coachRoster[0].id;
    if (download) download.disabled = !coachRoster.length;
  }
  /* ================= JADWAL COACH — UNDUH SEBAGAI GAMBAR (JPG) UNTUK CALON KLIEN ================= */
  window.downloadCoachScheduleImage = async function(coachId, startStr){
    const coach = coachById(coachId);
    if (!coach){ showToast('Pilih coach terlebih dahulu'); return; }

    const startDate = startStr ? new Date(startStr + 'T00:00:00') : new Date(new Date().setHours(0,0,0,0));
    if (isNaN(startDate.getTime())){ showToast('Tanggal mulai tidak valid'); return; }

    const schedCheck = coachSchedule[coachId] || {};
    const offCheck = coachDayOff[coachId] || [];
    const noDataYet = !Object.keys(schedCheck).length && !offCheck.length;

    const logoImg = new Image();
    await new Promise((resolve) => { logoImg.onload = resolve; logoImg.onerror = resolve; logoImg.src = LOGO_DATA; });

    const MONTH_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const DOW_SHORT = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    const totalDays = 30;
    const jsStartDay = startDate.getDay();
    const startWd = jsStartDay === 0 ? 6 : jsStartDay - 1; // 0 = Senin
    const rows = Math.ceil((startWd + totalDays) / 7);

    // ===== KANVAS RASIO A4 POTRAIT (210:297mm ≈ 1:1.4142), resolusi cetak layak (150dpi) =====
    const W = 1240, H = 1754, marginX = 60;
    const headerH = 130, stripH = 6;
    const nameY = 195, subtitleY = nameY + 27, rangeY = subtitleY + 21;
    const dividerY = rangeY + 32;
    const dowY = dividerY + 42;
    const gridTop = dowY + 20;

    // Sisa tinggi di bawah grid (jarak + legenda 2 baris + footer 2 baris) dihitung tetap,
    // lalu tinggi tiap sel kalender dibagi rata supaya grid selalu pas mengisi satu halaman A4 penuh.
    const bottomFixed = 40 + 30 + 38 + 30 + 24 + 40; // gap+legend2baris+gap+footer2baris+padding bawah
    const cellH = (H - gridTop - bottomFixed) / rows;
    const gridBottom = gridTop + rows * cellH;
    const legendTop = gridBottom + 40;
    const footerDividerY = legendTop + 30 + 38;
    const footerLine1Y = footerDividerY + 30;
    const footerLine2Y = footerLine1Y + 24;

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);

    // ===== HEADER (konsisten dgn Laporan Keuangan Coach & Invoice) =====
    ctx.fillStyle = '#111110'; ctx.fillRect(0, 0, W, headerH);
    const logoW = 132, logoH = logoW * (168 / 325);
    const logoX = marginX, logoY = (headerH - logoH) / 2;
    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    const textX = logoX + logoW + 20;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF'; ctx.font = '800 34px Arial';
    ctx.fillText('NUMBER SIX RUNNING', textX, 62);
    ctx.fillStyle = '#C9C7BE'; ctx.font = '400 17px Arial';
    ctx.fillText('Jadwal Latihan Coach', textX, 88);
    ctx.fillStyle = '#D62828'; ctx.fillRect(0, headerH, W, stripH);

    // ===== IDENTITAS COACH & RENTANG TANGGAL =====
    const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + totalDays - 1);
    ctx.fillStyle = '#111110'; ctx.font = '800 28px Arial';
    ctx.fillText(coach.name, marginX, nameY);
    ctx.fillStyle = '#6E6C64'; ctx.font = '400 16px Arial';
    ctx.fillText('Jadwal Latihan — 30 Hari ke Depan', marginX, subtitleY);
    ctx.fillText(formatDateID(dateStrOf(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) + ' – ' + formatDateID(dateStrOf(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())), marginX, rangeY);

    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(marginX, dividerY); ctx.lineTo(W - marginX, dividerY); ctx.stroke();

    // ===== HEADER HARI (SEN—MIN) =====
    const colW = (W - marginX * 2) / 7;
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 14px Arial'; ctx.textAlign = 'center';
    DOW_SHORT.forEach((d, i) => ctx.fillText(d.toUpperCase(), marginX + i * colW + colW / 2, dowY));
    ctx.textAlign = 'left';

    // ===== GRID 30 HARI (tinggi sel otomatis mengisi penuh sisa halaman A4) =====
    const sched = coachSchedule[coachId] || {};
    const todayStr = todayISO();

    // ukuran pil zona waktu dihitung dinamis dari cellH supaya selalu proporsional & terbaca jelas
    const pillAreaTop = 52, pillBottomPad = 16, pillGapV = 10, pillGapH = 10, pillSidePad = 14;
    const pillAreaH = cellH - pillAreaTop - pillBottomPad;
    const pillH = Math.max(28, (pillAreaH - pillGapV) / 2);
    const pillW = (colW - pillSidePad * 2 - pillGapH) / 2;

    for (let i = 0; i < rows * 7; i++){
      const col = i % 7, row = Math.floor(i / 7);
      const cx = marginX + col * colW, cy = gridTop + row * cellH;
      ctx.strokeStyle = '#E7E4DB'; ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, colW, cellH);

      const dayOffset = i - startWd;
      if (dayOffset < 0 || dayOffset >= totalDays) continue;

      const d = new Date(startDate); d.setDate(d.getDate() + dayOffset);
      const dateStr = dateStrOf(d.getFullYear(), d.getMonth(), d.getDate());
      const weekday = DAYS[col];
      const isToday = dateStr === todayStr;
      const off = isCoachOff(coachId, dateStr);

      if (isToday){
        ctx.fillStyle = '#F5F3EE'; ctx.fillRect(cx + 1, cy + 1, colW - 2, cellH - 2);
        ctx.lineWidth = 2.5; ctx.strokeStyle = '#111110'; ctx.strokeRect(cx + 1.5, cy + 1.5, colW - 3, cellH - 3);
      }

      ctx.fillStyle = '#111110'; ctx.font = (isToday ? '800' : '700') + ' 18px Arial';
      const dateLabel = String(d.getDate()) + (d.getDate() === 1 || dayOffset === 0 ? ' ' + MONTH_SHORT[d.getMonth()] : '');
      ctx.fillText(dateLabel, cx + pillSidePad, cy + 30);

      if (off){
        // Libur: blok warna hijau solid
        ctx.fillStyle = '#1E8E3E'; ctx.fillRect(cx + 2, cy + 2, colW - 4, cellH - 4);
        ctx.fillStyle = '#FFFFFF'; ctx.font = '800 16px Arial'; ctx.textAlign = 'center';
        ctx.fillText('LIBUR', cx + colW / 2, cy + cellH / 2 + 6);
        ctx.textAlign = 'left';
        continue;
      }

      const px0 = cx + pillSidePad, py0 = cy + pillAreaTop;
      BLOCKS.forEach((b, bi) => {
        const bc = bi % 2, br = Math.floor(bi / 2);
        const px = px0 + bc * (pillW + pillGapH), py = py0 + br * (pillH + pillGapV);
        const slot = sched[weekday + '|' + b.key];
        const filled = !!slot;
        const timeLabel = (filled && slot.timeStart && slot.timeEnd) ? (slot.timeStart + '–' + slot.timeEnd) : b.time;

        // Blok warna solid: putih = tersedia, merah = terisi/penuh
        ctx.fillStyle = filled ? '#D62828' : '#FFFFFF';
        roundRectPath(ctx, px, py, pillW, pillH, 5);
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = filled ? '#D62828' : '#C9C7BE';
        roundRectPath(ctx, px, py, pillW, pillH, 5);
        ctx.stroke();

        const textColor = filled ? '#FFFFFF' : '#111110';
        ctx.fillStyle = textColor; ctx.textAlign = 'center';
        ctx.font = '800 12px Arial';
        ctx.fillText(b.label.toUpperCase(), px + pillW / 2, py + pillH * 0.38);
        ctx.font = '700 10.5px Arial';
        ctx.fillText(filled ? 'TERISI' : 'TERSEDIA', px + pillW / 2, py + pillH * 0.62);
        ctx.font = '400 10px Arial';
        ctx.fillText(timeLabel, px + pillW / 2, py + pillH * 0.84);
        ctx.textAlign = 'left';
      });
    }

    // ===== LEGENDA =====
    function legendSwatch(x, yy, mode, label){
      const s = 26, sy = yy - 19;
      const bg = mode === 'off' ? '#1E8E3E' : mode === 'filled' ? '#D62828' : '#FFFFFF';
      const border = mode === 'off' ? '#1E8E3E' : mode === 'filled' ? '#D62828' : '#C9C7BE';
      ctx.fillStyle = bg; roundRectPath(ctx, x, sy, s, s, 4); ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = border; roundRectPath(ctx, x, sy, s, s, 4); ctx.stroke();
      ctx.fillStyle = '#3B3A36'; ctx.font = '400 14.5px Arial'; ctx.textAlign = 'left';
      ctx.fillText(label, x + s + 12, yy);
    }
    legendSwatch(marginX, legendTop, 'empty', 'Putih — Tersedia, bisa dipesan');
    legendSwatch(marginX + 340, legendTop, 'filled', 'Merah — Terisi / penuh');
    legendSwatch(marginX + 600, legendTop, 'off', 'Hijau — Coach libur sepanjang hari');
    ctx.fillStyle = '#8C8A82'; ctx.font = '400 13.5px Arial';
    ctx.fillText('Jam pada tiap sesi mengikuti jadwal yang sudah ditentukan Admin CS.', marginX, legendTop + 30);

    // ===== FOOTER =====
    const printLabel = nowPrintLabel();
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(marginX, footerDividerY); ctx.lineTo(W - marginX, footerDividerY); ctx.stroke();
    ctx.fillStyle = '#3B3A36'; ctx.font = '600 15px Arial';
    ctx.fillText('Tertarik ikut sesi latihan? Hubungi Admin CS N6 via WhatsApp 0851-4726-7786.', marginX, footerLine1Y);
    ctx.fillStyle = '#8C8A82'; ctx.font = '400 12.5px Arial';
    ctx.fillText('Dicetak otomatis oleh sistem pada ' + printLabel.tanggal + ', pukul ' + printLabel.jam, marginX, footerLine2Y);
    ctx.fillStyle = '#111110'; ctx.font = '700 13px Arial'; ctx.textAlign = 'right';
    ctx.fillText('NUMBER SIX RUNNING', W - marginX, footerLine2Y);
    ctx.textAlign = 'left';

    const link = document.createElement('a');
    link.download = 'Jadwal-' + slugify(coach.name) + '-30hari-' + todayISO() + '.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    link.click();
    showToast(noDataYet
      ? coach.name + ' belum punya jadwal tersimpan — semua sesi tampil Kosong. Tandai slot di tab "Pola Mingguan", klik Simpan, baru unduh lagi.'
      : 'Jadwal ' + coach.name + ' berhasil diunduh');
  };

  /* ================= DETAIL KLIEN ================= */
  window.openClientDetail = function(id){
    const c = clients.find(x => x.id === id);
    if (!c) return;
    const p = programCache[id] || {};
    const reports = reportsCache[id] || {};
    const reportCount = Object.keys(reports).length;
    const issues = Object.keys(reports).filter(d => reports[d].issue).length;
    document.getElementById('clientDetailTitle').textContent = c.name;
    document.getElementById('clientDetailBody').innerHTML = `
      <div class="detail-grid">
        <div class="detail-item"><div class="l">Telepon</div><div class="v">${escapeHtml(c.phone || '-')}</div></div>
        <div class="detail-item"><div class="l">Coach</div><div class="v">${escapeHtml(c.coach || '-')}</div></div>
        <div class="detail-item full"><div class="l">Program</div><div class="v" style="font-size:13px;">${escapeHtml(c.programLabel || '-')}</div></div>
        <div class="detail-item full"><div class="l">Paket / Biaya</div><div class="v" style="font-size:13px;">${escapeHtml(c.priceLabel || '-')}</div></div>
        <div class="detail-item"><div class="l">Status</div><div class="v">${clientStatus(c)}</div></div>
        <div class="detail-item"><div class="l">Mulai — Selesai</div><div class="v" style="font-size:12.5px;">${formatDateID(p.startDate)} – ${formatDateID(p.endDate)}</div></div>
        <div class="detail-item"><div class="l">Total Laporan</div><div class="v">${reportCount}</div></div>
        <div class="detail-item"><div class="l">Laporan Bermasalah</div><div class="v" style="${issues ? 'color:var(--red);' : ''}">${issues}</div></div>
        ${(c.packageMeta && c.packageMeta.pairLabel) ? `<div class="detail-item full"><div class="l">Pasangan Semi Private</div><div class="v" style="font-size:13px;">${escapeHtml(c.packageMeta.pairLabel)}</div></div>` : ''}
      </div>
      ${c.notes ? `<div class="note-box">Catatan internal: ${escapeHtml(c.notes)}</div>` : ''}
      ${(c.packageMeta && c.packageMeta.pairWith) ? `<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
        <button class="btn-sm" onclick="closeClientDetail(); openClientDetail('${c.packageMeta.pairWith}')">Lihat Data Pasangan (${escapeHtml(c.packageMeta.pairLabel||'')})</button>
        <button class="copy-btn" onclick="copyClientLink('${c.packageMeta.pairWith}', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Salin Link Pasangan
        </button>
      </div>` : ''}
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn-outline" onclick="closeClientDetail(); editClient('${c.id}')">Edit Data</button>
        <button class="btn-outline" onclick="closeClientDetail(); openChatModal('${c.id}')">Buka Chat</button>
        <button class="btn-outline" onclick="downloadInvoice('${c.id}')">Unduh Invoice (JPG)</button>
        <button class="copy-btn" onclick="copyClientLink('${c.id}', this)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Salin Link Dashboard Client
        </button>
      </div>`;
    document.getElementById('clientDetailModal').classList.add('show');
  };
  window.closeClientDetail = function(){ document.getElementById('clientDetailModal').classList.remove('show'); };

  /* ================= RENDER: JADWAL KLIEN ================= */
  function renderJadwal(){
    const rows = [...clients].sort((a,b) => ((programCache[a.id]||{}).startDate||'').localeCompare((programCache[b.id]||{}).startDate||''));
    document.getElementById('jadwalBody').innerHTML = rows.length ? rows.map(c => {
      const p = programCache[c.id] || {};
      const st = clientStatus(c);
      return `<tr>
        <td class="strong">${escapeHtml(c.name)}</td>
        <td class="muted">${escapeHtml(c.programLabel || '-')}</td>
        <td class="muted">${escapeHtml(c.coach || '-')}</td>
        <td>${formatDateID(p.startDate)}</td>
        <td>${formatDateID(p.endDate)}</td>
        <td class="muted" style="font-size:12px;">${escapeHtml(c.priceLabel || '-')}</td>
        <td><span class="badge ${statusTone(st)}">${st}</span></td>
      </tr>`;
    }).join('') : `<tr><td colspan="7" class="muted" style="text-align:center; padding:20px 0;">Belum ada klien terjadwal.</td></tr>`;
  }

  /* ================= RENDER: DAFTAR HARGA ================= */
  function renderPriceList(){
    document.getElementById('priceListBody').innerHTML = ['Online','Offline','Kerja Sama'].map(cat => {
      const items = programCatalog.filter(p => p.category === cat);
      if (!items.length) return '';
      const rows = items.map(p => {
        let pv = '', ct = p.unit || '';
        if (p.mode === 'fixed') pv = formatRupiah(p.price);
        else if (p.mode === 'configurable'){ pv = formatRupiah(p.ratePerSesi); ct = 'per sesi — pertemuan/minggu & durasi bisa diatur saat pendaftaran'; }
        else { pv = 'Nego'; ct = 'Harga disesuaikan kebutuhan kerja sama'; }
        return `<div class="price-list-item">
          <div><div class="nm">${escapeHtml(p.label)}</div><div class="ct">${escapeHtml(ct)}</div></div>
          <div class="pv">${pv}${p.mode==='configurable' ? '<small>/sesi</small>' : ''}</div>
        </div>`;
      }).join('');
      return `<h3 style="font-size:12px; color:var(--asphalt); text-transform:uppercase; letter-spacing:0.03em; margin:14px 0 4px;">${cat}</h3>${rows}`;
    }).join('');
  }

  /* ================= RENDER: TIKET ================= */
  let ticketFilter = 'semua';
  let autoIssueMap = {};
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

  function populateTicketClientSelect(){
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
  async function saveTicketForm(){
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

  function formatChatTime(iso){
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
  function renderChatThread(){
    const thread = document.getElementById('chatThread');
    const arr = chatCache[activeChatClientId] || [];
    thread.innerHTML = arr.length ? arr.map(m => {
      const cls = m.sender === 'coach' ? 'cs' : 'client';
      const label = m.sender === 'coach' ? 'Kamu (Coach/CS)' : 'Klien';
      return `<div class="chat-bubble ${cls}"><div class="sender">${label}</div>${escapeHtml(m.text)}<div class="time">${formatChatTime(m.at)}</div></div>`;
    }).join('') : '<p class="chat-empty">Belum ada percakapan dengan klien ini. Mulai chat lewat kotak di bawah.</p>';
    thread.scrollTop = thread.scrollHeight;
  }
  async function sendChatMessage(){
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
  function populateBroadcastCoachSelect(){
    document.getElementById('bCoach').innerHTML = coachRoster.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
  }
  function broadcastTargets(){
    const target = document.getElementById('bTarget').value;
    if (target === 'coach'){
      const coachName = document.getElementById('bCoach').value;
      return clients.filter(c => c.coach === coachName);
    }
    return clients;
  }
  function updateBroadcastCount(){
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
  async function sendBroadcast(){
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

  /* ================= JADWAL COACH (ROSTER + KETERSEDIAAN) ================= */
  let activeDay = todayDayName();
  function renderCoachRoster(){
    document.getElementById('coachRosterList').innerHTML = coachRoster.length ? coachRoster.map(c => `
      <div class="coach-roster-item">
        <div><div class="name" style="font-weight:600; font-size:13.5px;">${escapeHtml(c.name)}</div><div class="meta" style="font-size:12px; color:var(--asphalt);">${escapeHtml(c.phone || '-')}</div></div>
        <div style="display:flex; gap:8px;">
          <button class="btn-sm" onclick="editCoach('${c.id}')">Edit</button>
          <button class="btn-danger-sm" onclick="deleteCoach('${c.id}')">Hapus</button>
        </div>
      </div>`).join('') : '<div class="list-empty">Belum ada coach terdaftar.</div>';
  }
  function renderDayTabs(){
    document.getElementById('dayTabs').innerHTML = DAYS.map(d => `<button type="button" class="subtab-btn ${d===activeDay?'active':''}" data-day="${d}">${d}${d===todayDayName() ? ' (Hari ini)' : ''}</button>`).join('');
    document.querySelectorAll('#dayTabs .subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => { activeDay = btn.dataset.day; renderDayTabs(); renderSchedTable(); });
    });
  }
  function renderSchedTable(){
    const table = document.getElementById('schedTable');
    let thead = '<thead><tr><th style="text-align:left;">Coach</th>' + BLOCKS.map(b => `<th>${b.label}<br><span style="font-weight:400; text-transform:none;">${b.time}</span></th>`).join('') + '</tr></thead>';
    let rows = coachRoster.map(coach => {
      const sched = coachSchedule[coach.id] || {};
      const cells = BLOCKS.map(b => {
        const slot = sched[activeDay + '|' + b.key];
        if (slot){
          const slotNames = Array.isArray(slot.clients) && slot.clients.length ? slot.clients : String((slot.clientId && clients.find(c => c.id === slot.clientId)?.name) || slot.client || '').split(',').map(x=>x.trim()).filter(Boolean);
          const categoryLabels={'single-session':'Single Session Training','group-training':'Group Training','semi-private':'Semi Privat Training','private-training':'Privat Training'};
          return `<td><button type="button" class="slot-btn terisi" onclick="openSlotModal('${coach.id}','${activeDay}','${b.key}')">Terisi<span class="cn">${escapeHtml(categoryLabels[slot.trainingCategory]||'Single Session Training')}</span>${slotNames.map(name=>`<span class="cn">${escapeHtml(name)}</span>`).join('')}${slot.location ? `<span class="loc">${escapeHtml(slot.location)}</span>` : ''}</button></td>`;
        }
        return `<td><button type="button" class="slot-btn kosong" onclick="openSlotModal('${coach.id}','${activeDay}','${b.key}')">Kosong</button></td>`;
      }).join('');
      return `<tr><td class="coach-name-cell">${escapeHtml(coach.name)}</td>${cells}</tr>`;
    }).join('');
    if (!coachRoster.length) rows = `<tr><td colspan="${BLOCKS.length+1}" class="muted" style="text-align:center; padding:16px 0;">Tambahkan coach dulu untuk mengatur jadwal.</td></tr>`;
    table.innerHTML = thead + '<tbody>' + rows + '</tbody>';
  }

  /* ================= KALENDER 30 HARI COACH (REAL-TIME) ================= */
  const todayNow = new Date();
  let calYear = todayNow.getFullYear();
  let calMonth = todayNow.getMonth();
  let selectedCalDate = null;

  function dateStrOf(y, m, d){ return y + '-' + String(m+1).padStart(2,'0') + '-' + String(d).padStart(2,'0'); }
  function weekdayNameOf(y, m, d){
    const jsDay = new Date(y, m, d).getDay();
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    return DAYS[idx];
  }
  function isCoachOff(coachId, dateStr){ return !!(coachDayOff[coachId] || []).includes(dateStr); }

  function daySummary(dateStr, weekday){
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

  function renderCoachCalendar(){
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    document.getElementById('coachCalRange').textContent = monthNames[calMonth] + ' ' + calYear;
    const dowLabels = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    let html = dowLabels.map(d => `<div class="cal-dow">${d}</div>`).join('');

    const firstDay = new Date(calYear, calMonth, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevDaysInMonth = new Date(calYear, calMonth, 0).getDate();
    const todayStr = todayISO();

    for (let i = startOffset; i > 0; i--){
      html += `<div class="cal-cell outside"><span class="num">${prevDaysInMonth - i + 1}</span></div>`;
    }
    for (let d = 1; d <= daysInMonth; d++){
      const dateStr = dateStrOf(calYear, calMonth, d);
      const weekday = weekdayNameOf(calYear, calMonth, d);
      const { kosong, anyOff } = daySummary(dateStr, weekday);
      let cls = 'cal-cell';
      if (dateStr === todayStr) cls += ' today';
      if (dateStr === selectedCalDate) cls += ' selected';
      const cntCls = kosong > 0 ? 'green' : 'red';
      const cntLabel = coachRoster.length ? (kosong > 0 ? kosong + ' kosong' : 'Penuh') : '-';
      html += `<div class="${cls}" data-date="${dateStr}">
        <span class="num">${d}</span>
        <span class="cnt ${cntCls}">${cntLabel}</span>
        ${anyOff ? '<span class="off-dot" title="Ada coach libur"></span>' : ''}
      </div>`;
    }
    const totalCells = startOffset + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= trailing; d++){
      html += `<div class="cal-cell outside"><span class="num">${d}</span></div>`;
    }

    document.getElementById('coachCalGrid').innerHTML = html;
    document.querySelectorAll('#coachCalGrid .cal-cell[data-date]').forEach(cell => {
      cell.addEventListener('click', () => { selectedCalDate = cell.dataset.date; renderCoachCalendar(); renderCoachCalDetail(); });
    });
  }

  function renderCoachCalDetail(){
    const box = document.getElementById('coachCalDetail');
    if (!selectedCalDate){ box.innerHTML = '<p class="modal-empty">Klik salah satu tanggal untuk lihat detail ketersediaan tiap coach.</p>'; return; }
    if (!coachRoster.length){ box.innerHTML = '<p class="modal-empty">Belum ada coach terdaftar.</p>'; return; }
    const weekday = selectedCalDate.split('-').map(Number);
    const wd = weekdayNameOf(weekday[0], weekday[1]-1, weekday[2]);
    box.innerHTML = `<h4>${formatDateID(selectedCalDate)} — ${wd}</h4>` + coachRoster.map(coach => {
      const off = isCoachOff(coach.id, selectedCalDate);
      const sched = coachSchedule[coach.id] || {};
      const chips = BLOCKS.map(b => {
        const slot = sched[wd + '|' + b.key];
        if (!slot) return `<span class="cal-slot-chip kosong">${b.label}: Kosong</span>`;
        const slotNames = Array.isArray(slot.clients) && slot.clients.length ? slot.clients : String((slot.clientId && clients.find(c => c.id === slot.clientId)?.name) || slot.client || 'Terisi').split(',').map(x=>x.trim()).filter(Boolean);
        const categoryLabels={'single-session':'Single Session','group-training':'Group Training','semi-private':'Semi Privat','private-training':'Privat Training'};
        return slotNames.map((name,index)=>`<span class="cal-slot-chip terisi">${b.label}${slotNames.length>1?' • '+(index+1):''}: ${escapeHtml(name)} <small>(${escapeHtml(categoryLabels[slot.trainingCategory]||'Single Session')})</small>${slot.location ? ' 📍'+escapeHtml(slot.location) : ''}</span>`).join('');
      }).join('');
      return `<div class="cal-coach-block">
        <div class="cal-coach-block-top">
          <div class="nm">${escapeHtml(coach.name)} ${off ? '<span class="badge amber" style="margin-left:6px;">Libur</span>' : ''}</div>
          <button type="button" class="btn-sm" onclick="toggleCoachDayOff('${coach.id}','${selectedCalDate}')">${off ? 'Batalkan Libur' : 'Tandai Libur Hari Ini'}</button>
        </div>
        ${off ? '<div class="ct" style="font-size:11.5px; color:var(--asphalt); margin-top:4px;">Coach tidak tersedia sepanjang hari ini (pola mingguan diabaikan untuk tanggal ini).</div>' : `<div class="cal-slots-row">${chips}</div>`}
      </div>`;
    }).join('');
  }

  window.toggleCoachDayOff = function(coachId, dateStr){
    if (!coachDayOff[coachId]) coachDayOff[coachId] = [];
    const idx = coachDayOff[coachId].indexOf(dateStr);
    if (idx >= 0) coachDayOff[coachId].splice(idx, 1);
    else coachDayOff[coachId].push(dateStr);
    persistCoachDayOff().then(() => {
      showToast(idx >= 0 ? 'Libur dibatalkan' : 'Coach ditandai libur tanggal ini');
      renderCoachCalendar();
      renderCoachCalDetail();
      renderBeranda();
    });
  };

  window.openSlotModal = function(coachId, day, blockKey){
    activeSlot = { coachId, day, blockKey, addingClient:false };
    const coach = coachById(coachId);
    const block = BLOCKS.find(b => b.key === blockKey);
    const slot = (coachSchedule[coachId] || {})[day + '|' + blockKey];
    document.getElementById('slotModalTitle').textContent = coach.name + ' — ' + day + ' ' + block.label + ' (' + block.time + ')';
    document.getElementById('slotClientSelect').innerHTML = '<option value="">— Isi manual di bawah —</option>' + clients.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join('');
    document.getElementById('slotClientSelect').value = slot && slot.clientId ? slot.clientId : '';
    document.getElementById('slotAddClientAction').style.display = slot ? 'block' : 'none';
    document.getElementById('btnSaveSlot').textContent = slot ? 'Simpan Perubahan' : 'Tandai Terisi';
    const linkedSlotClient = slot && slot.clientId ? clients.find(c => c.id === slot.clientId) : null;
    const existingName = slot ? (linkedSlotClient?.name || (Array.isArray(slot.clients) ? slot.clients[0] : '') || String(slot.client || '').split(',')[0].trim()) : '';
    document.getElementById('slotClientName').value = existingName;
    document.getElementById('slotTrainingCategory').value = slot?.trainingCategory || 'single-session';
    document.getElementById('slotClientName').placeholder = slot ? 'Nama klien atau keterangan sesi' : "mis. Dimas Prasetyo atau 'Sesi Trial'";
    document.getElementById('slotLocation').value = slot ? (slot.location || '') : '';
    document.getElementById('slotNote').value = slot ? (slot.note || '') : '';
    const occurrenceDate=document.getElementById('slotOccurrenceDate'); occurrenceDate.value=todayISO();
    document.getElementById('slotOccurrenceDone').checked=!!(slot?.completedDates||[]).includes(todayISO());
    refreshLocationSuggestions();
    document.getElementById('slotModal').classList.add('show');
  };
  function refreshLocationSuggestions(){
    const locs = new Set();
    Object.values(coachSchedule).forEach(sched => Object.values(sched || {}).forEach(slot => { if (slot && slot.location) locs.add(slot.location); }));
    document.getElementById('slotLocationList').innerHTML = [...locs].map(l => `<option value="${escapeHtml(l)}">`).join('');
  }
  window.beginAddSlotClient = function(){ if(!activeSlot) return; activeSlot.addingClient=true; document.getElementById('slotClientSelect').value=''; document.getElementById('slotClientName').value=''; document.getElementById('slotClientName').placeholder='Pilih/tulis klien tambahan'; document.getElementById('slotAddClientAction').style.display='none'; document.getElementById('btnSaveSlot').textContent='Tambahkan ke Sesi'; };
  window.closeSlotModal = function(){ document.getElementById('slotModal').classList.remove('show'); activeSlot = null; };
  async function saveSlot(){
    if (!activeSlot) return;
    const { coachId, day, blockKey } = activeSlot;
    const occurrenceDate=document.getElementById('slotOccurrenceDate').value;
    if(!/^\d{4}-\d{2}-\d{2}$/.test(occurrenceDate)){showToast('Pilih tanggal sesi yang valid');return;}
    const pickedId = document.getElementById('slotClientSelect').value;
    const manual = document.getElementById('slotClientName').value.trim();
    const linkedClient = pickedId ? clients.find(c => c.id === pickedId) : null;
    const clientName = linkedClient ? linkedClient.name : manual;
    if (!clientName && !((coachSchedule[coachId]||{})[day + '|' + blockKey])){ showToast('Isi nama klien atau keterangan dulu'); return; }
    if (!coachSchedule[coachId]) coachSchedule[coachId] = {};
    const existingSlot = coachSchedule[coachId][day + '|' + blockKey];
    if(activeSlot.addingClient){
      if(!clientName){ showToast('Pilih atau isi nama klien tambahan'); return; }
      const ids=Array.isArray(existingSlot.clientIds)?[...existingSlot.clientIds]:(existingSlot.clientId?[existingSlot.clientId]:[]);
      const names=Array.isArray(existingSlot.clients)?[...existingSlot.clients]:[existingSlot.client || (clients.find(c=>c.id===existingSlot.clientId)?.name||'')].filter(Boolean);
      if(linkedClient && ids.map(String).includes(String(linkedClient.id))){ showToast('Klien ini sudah tercatat pada sesi tersebut'); return; }
      const normName = v => String(v||'').trim().toLocaleLowerCase('id-ID');
      if(names.some(n => normName(n) === normName(clientName))){ showToast('Nama ini sudah tercatat pada sesi tersebut'); return; }
      if(linkedClient) ids.push(linkedClient.id);
      names.push(clientName);
      coachSchedule[coachId][day + '|' + blockKey]={...existingSlot, clientId:ids[0]||'', clientIds:ids, clients:names, client:names.join(', ')};
    }else{
      const singleName = clientName ? [clientName] : [];
      coachSchedule[coachId][day + '|' + blockKey] = { clientId: linkedClient ? linkedClient.id : (existingSlot?.clientId||''), clientIds:linkedClient?[linkedClient.id]:(existingSlot?.clientIds||[]), clients: singleName, client: clientName, trainingCategory: document.getElementById('slotTrainingCategory').value, location: document.getElementById('slotLocation').value.trim(), note: document.getElementById('slotNote').value.trim() };
    }
    const savedSlot=coachSchedule[coachId][day + '|' + blockKey];
    const doneDates=new Set(Array.isArray(savedSlot.completedDates)?savedSlot.completedDates:[]);
    if(document.getElementById('slotOccurrenceDone').checked)doneDates.add(occurrenceDate);else doneDates.delete(occurrenceDate);
    savedSlot.completedDates=[...doneDates];
    await persistCoachSchedule();
    closeSlotModal();
    showToast('Slot dan status sesi disimpan');
    renderAll();
  }
  async function clearSlot(){
    if (!activeSlot) return;
    const { coachId, day, blockKey } = activeSlot;
    if (coachSchedule[coachId]) delete coachSchedule[coachId][day + '|' + blockKey];
    await persistCoachSchedule();
    closeSlotModal();
    showToast('Slot dikosongkan');
    renderAll();
  }

  window.openCoachForm = function(){
    document.getElementById('coachFormTitle').textContent = 'Tambah Coach';
    document.getElementById('cfCoachId').value = '';
    document.getElementById('cfName').value = '';
    document.getElementById('cfPhone').value = '';
    document.getElementById('coachFormModal').classList.add('show');
  };
  window.editCoach = function(id){
    const c = coachById(id);
    if (!c) return;
    document.getElementById('coachFormTitle').textContent = 'Edit Coach';
    document.getElementById('cfCoachId').value = c.id;
    document.getElementById('cfName').value = c.name;
    document.getElementById('cfPhone').value = c.phone || '';
    document.getElementById('coachFormModal').classList.add('show');
  };
  window.closeCoachForm = function(){ document.getElementById('coachFormModal').classList.remove('show'); };
  async function saveCoachForm(){
    const name = document.getElementById('cfName').value.trim();
    if (!name){ showToast('Nama coach wajib diisi'); return; }
    let id = document.getElementById('cfCoachId').value;
    const isNew = !id;
    if (isNew){
      let base = slugify(name) || 'coach'; id = base; let n = 2;
      while (coachRoster.some(c => c.id === id)){ id = base + '-' + n; n++; }
    }
    const data = { id, name, phone: document.getElementById('cfPhone').value.trim() };
    if (isNew) coachRoster.push(data);
    else { const idx = coachRoster.findIndex(c => c.id === id); coachRoster[idx] = data; }
    await persistCoachRoster();
    closeCoachForm();
    showToast(isNew ? 'Coach baru ditambahkan' : 'Data coach diperbarui');
    populateCoachFilters();
    populateFormSelects();
    renderAll();
  }
  window.deleteCoach = function(id){
    const c = coachById(id);
    if (!c) return;
    if (!confirm('Hapus coach "' + c.name + '" dari roster? Jadwal ketersediaannya juga akan dihapus.')) return;
    coachRoster = coachRoster.filter(x => x.id !== id);
    delete coachSchedule[id];
    Promise.all([persistCoachRoster(), persistCoachSchedule()]).then(() => {
      showToast('Coach dihapus');
      populateCoachFilters();
      populateFormSelects();
      renderAll();
    });
  };

  // Jadwal Coach: owner-equivalent tabs and explanatory guide.
  document.querySelectorAll('[data-coachpage]').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('[data-coachpage]').forEach(b=>b.classList.toggle('active',b===btn));
    document.querySelectorAll('#panel-jadwalcoach [id^="coachpage-"]').forEach(p=>p.classList.toggle('active',p.id==='coachpage-'+btn.dataset.coachpage));
  }));
  document.getElementById('toggleCoachGuide')?.addEventListener('click',function(){
    const guide=document.getElementById('coachGuide');const visible=guide.style.display!=='none';guide.style.display=visible?'none':'block';this.setAttribute('aria-expanded',String(!visible));this.textContent=visible?'Lihat keterangan':'Tutup keterangan';
  });

  /* ================= RENDER ALL ================= */
  function renderAll(){
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
  const panelTitles = { beranda:'Beranda', klien:'Klien', jadwalklien:'Jadwal Klien', jadwalcoach:'Jadwal Coach', harga:'Daftar Harga', tiket:'Tiket & Keluhan', pesan:'Pesan', sandi:'Ganti Password' };
  function switchPanel(name){
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

  const sidebarEl = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  function openSidebar(){ sidebarEl.classList.add('open'); sidebarOverlay.classList.add('show'); }
  function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarOverlay.classList.remove('show'); }
  document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ================= SUBTABS (Klien: Aktif / Arsip) ================= */
  document.querySelectorAll('.subtab-btn[data-klienview]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-klienview]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#klienview-aktif, #klienview-arsip').forEach(p => p.classList.remove('active'));
      document.getElementById('klienview-' + btn.dataset.klienview).classList.add('active');
    });
  });

  /* ================= SUBTABS (Tiket) ================= */
  document.querySelectorAll('.subtab-btn[data-sub]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-sub]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ticketFilter = btn.dataset.sub;
      renderTickets();
    });
  });

  /* ================= SUBTABS (Jadwal Coach: Mingguan / Kalender) ================= */
  document.querySelectorAll('.subtab-btn[data-jcview]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-jcview]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#jcview-mingguan, #jcview-bulanan').forEach(p => p.classList.remove('active'));
      document.getElementById('jcview-' + btn.dataset.jcview).classList.add('active');
      if (btn.dataset.jcview === 'bulanan'){ renderCoachCalendar(); renderCoachCalDetail(); }
    });
  });
  document.getElementById('coachCalPrev').addEventListener('click', () => {
    calMonth--; if (calMonth < 0){ calMonth = 11; calYear--; }
    selectedCalDate = null; renderCoachCalendar(); renderCoachCalDetail();
  });
  document.getElementById('coachCalNext').addEventListener('click', () => {
    calMonth++; if (calMonth > 11){ calMonth = 0; calYear++; }
    selectedCalDate = null; renderCoachCalendar(); renderCoachCalDetail();
  });
  document.getElementById('coachCalToday').addEventListener('click', () => {
    calYear = todayNow.getFullYear(); calMonth = todayNow.getMonth();
    selectedCalDate = todayISO(); renderCoachCalendar(); renderCoachCalDetail();
  });

  /* ================= EVENTS ================= */
  document.getElementById('btnTambahKlien').addEventListener('click', openClientForm);
  document.getElementById('btnSaveClient').addEventListener('click', saveClientForm);
  document.getElementById('btnDownloadInvoice').addEventListener('click', () => {
    const id = document.getElementById('fClientId').value;
    if (id) downloadInvoice(id);
  });
  document.getElementById('fProgram').addEventListener('change', renderProgramFields);
  document.getElementById('fMeetings').addEventListener('input', updateConfigPriceBox);
  document.getElementById('fWeeks').addEventListener('input', updateConfigPriceBox);
  document.getElementById('btnTambahTiket').addEventListener('click', openTicketForm);
  document.getElementById('btnSaveTicket').addEventListener('click', saveTicketForm);
  document.getElementById('chatSendBtn').addEventListener('click', sendChatMessage);
  document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });
  document.getElementById('templateSelect').addEventListener('change', e => {
    if (e.target.value) document.getElementById('chatInput').value = e.target.value;
  });
  document.getElementById('btnBroadcast').addEventListener('click', openBroadcast);
  document.getElementById('bTarget').addEventListener('change', e => {
    document.getElementById('bCoachWrap').style.display = e.target.value === 'coach' ? 'block' : 'none';
    updateBroadcastCount();
  });
  document.getElementById('bCoach').addEventListener('change', updateBroadcastCount);
  document.getElementById('btnSendBroadcast').addEventListener('click', sendBroadcast);
  document.getElementById('btnTambahCoach').addEventListener('click', openCoachForm);
  document.getElementById('btnSaveCoach').addEventListener('click', saveCoachForm);
  document.getElementById('btnDownloadCoachSchedule').addEventListener('click', () => {
    const coachId = document.getElementById('shareScheduleCoach').value;
    const startStr = document.getElementById('shareScheduleStart').value;
    downloadCoachScheduleImage(coachId, startStr);
  });
  document.getElementById('btnSaveSlot').addEventListener('click', saveSlot);
  document.getElementById('btnClearSlot').addEventListener('click', clearSlot);
  document.getElementById('klienSearchInput').addEventListener('input', renderClientList);
  document.getElementById('klienFilterCoach').addEventListener('change', renderClientList);
  document.getElementById('klienFilterStatus').addEventListener('change', renderClientList);
  document.getElementById('globalSearch').addEventListener('input', (e) => {
    switchPanel('klien');
    document.getElementById('klienSearchInput').value = e.target.value;
    renderClientList();
  });

  /* ================= CADANGAN + TEMA ================= */
  const N6_KEYS=['programCatalog','coachRoster','coachSchedule','coachDayOff','clients','tickets','archivedClients'];
  function n6StorageStatus(){
    const box=document.getElementById('n6StorageNotice');
    try{const k=STORE_PREFIX+'__test';localStorage.setItem(k,'ok');if(localStorage.getItem(k)!=='ok')throw Error('Gagal membaca ulang');localStorage.removeItem(k);box.style.display='flex';box.textContent='Penyimpanan lokal tersedia. Data hanya tersimpan pada browser dan alamat halaman ini, belum tersinkron ke perangkat lain.';}
    catch(e){box.style.display='flex';box.style.background='var(--red-tint)';box.style.color='var(--red)';box.textContent='PERINGATAN: Penyimpanan browser tidak tersedia. Jangan input data sebelum memperbaiki izin penyimpanan.';}
  }
  function n6ExportData(){
    const records={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(STORE_PREFIX))records[k.slice(STORE_PREFIX.length)]=localStorage.getItem(k);}
    const blob=new Blob([JSON.stringify({format:'n6cs-admin-backup-v1',exportedAt:new Date().toISOString(),records},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='number-six-admin-cadangan-'+todayISO()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  document.getElementById('n6ImportFile').addEventListener('change',async e=>{
    const f=e.target.files[0];if(!f)return;
    try{const data=JSON.parse(await f.text());if(data.format!=='n6cs-admin-backup-v1'||!data.records||typeof data.records!=='object')throw Error('Format cadangan tidak sesuai');
      if(!confirm('Impor akan mengganti data di browser ini. Ekspor cadangan data saat ini terlebih dahulu. Lanjutkan?'))return;
      n6ExportData();
      const entries=Object.entries(data.records).filter(([k,v])=>typeof v==='string' && (N6_KEYS.includes(k)||/^(chat|reports|program):/.test(k)));
      for(const [k,v] of entries){JSON.parse(v);localStorage.setItem(STORE_PREFIX+k,v)}
      alert('Impor selesai. Halaman akan dimuat ulang.');location.reload();
    }catch(err){alert('Impor dibatalkan: '+err.message)}finally{e.target.value=''}
  });
  const n6ThemeKey=STORE_PREFIX+'theme:v2';
  function n6SetTheme(t){document.body.dataset.theme=t;try{localStorage.setItem(n6ThemeKey,t)}catch(e){};document.getElementById('n6ThemeBtn').textContent='♙';document.getElementById('n6ChooseLight').setAttribute('aria-pressed',String(t!=='dark'));document.getElementById('n6ChooseDark').setAttribute('aria-pressed',String(t==='dark'))}
  function n6ToggleTheme(){n6SetTheme(document.body.dataset.theme==='dark'?'light':'dark')}
  n6SetTheme(localStorage.getItem(n6ThemeKey)==='light'?'light':'dark');
  document.getElementById('n6ThemeBtn').addEventListener('click',n6OpenAccount);
  document.getElementById('n6MobileTheme').addEventListener('click',n6OpenAccount);
  const n6More=document.getElementById('n6MoreMenu');
  document.getElementById('n6MoreBtn').addEventListener('click',()=>{n6More.hidden=!n6More.hidden});
  n6More.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>{n6More.hidden=true;switchPanel(b.dataset.panel)}));

/* Owner-style account interface, independent of Admin business records */
const n6AccountModal=document.getElementById('n6AccountModal');
const n6AccountForm=document.getElementById('n6AccountForm');
const n6AccountLogout=document.getElementById('n6AccountLogout');
const n6AccountUser=document.getElementById('n6AccountUsername');
const n6AccountPassword=document.getElementById('n6AccountPassword');
const n6AccountSessionKey='n6csAdmin:preview-account-name';
function n6ReadAccount(){try{return sessionStorage.getItem(n6AccountSessionKey)||''}catch(e){return ''}}
function n6RenderAccount(){var me=null;try{var k=(window.N6_API||{}).userKey||'n6:api:user';me=JSON.parse(window.localStorage.getItem(k)||'null')}catch(e){}var name=me?(me.full_name||me.username):n6ReadAccount();var roleLabel=me?(' · '+(me.role||(me.tier!=null?'Tier '+me.tier:'Admin'))):'';document.getElementById('n6AccountName').textContent=name||'Admin CS';document.getElementById('n6AccountStatus').textContent=name?('Masuk'+roleLabel):'Belum masuk';n6AccountForm.hidden=!!name;n6AccountLogout.hidden=!name;}
function n6OpenAccount(){n6RenderAccount();document.getElementById('n6MoreMenu').hidden=true;n6AccountModal.classList.add('show')}
function n6CloseAccount(){n6AccountModal.classList.remove('show')}
document.getElementById('n6AccountClose').addEventListener('click',n6CloseAccount);
n6AccountModal.addEventListener('click',e=>{if(e.target===n6AccountModal)n6CloseAccount()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')n6CloseAccount()});
document.getElementById('n6ChooseLight').addEventListener('click',()=>n6SetTheme('light'));
document.getElementById('n6ChooseDark').addEventListener('click',()=>n6SetTheme('dark'));
document.getElementById('n6ShowPassword').addEventListener('click',()=>{const shown=n6AccountPassword.type==='password';n6AccountPassword.type=shown?'text':'password';document.getElementById('n6ShowPassword').textContent=shown?'Sembunyikan':'Lihat'});
n6AccountForm.addEventListener('submit',e=>{e.preventDefault();const name=n6AccountUser.value.trim();if(!name||n6AccountPassword.value.length<6)return;try{sessionStorage.setItem(n6AccountSessionKey,name)}catch(e){showToast('Sesi browser tidak tersedia');return}n6AccountPassword.value='';n6AccountPassword.type='password';document.getElementById('n6ShowPassword').textContent='Lihat';n6RenderAccount();showToast('Sesi aktif')});
n6AccountLogout.addEventListener('click',()=>{const cfg=(window.N6_API||{});if(cfg.enabled===true){try{localStorage.removeItem(cfg.tokenKey||'n6:api:token');localStorage.removeItem(cfg.refreshKey||'n6:api:refresh');localStorage.removeItem(cfg.userKey||'n6:api:user')}catch(e){}window.location.replace(window.location.pathname);return}try{sessionStorage.removeItem(n6AccountSessionKey)}catch(e){}n6AccountUser.value='';n6AccountPassword.value='';n6RenderAccount();showToast('Keluar dari sesi')});
n6RenderAccount();

  n6StorageStatus();

  
/* N6 data-driven operational indicators. This script does not mutate business records. */
const n6TargetKey=STORE_PREFIX+'indicator-targets:v1';
const n6DefaultTargets={new:10,tickets:5,messages:3,unpaid:5};
function n6Targets(){try{return {...n6DefaultTargets,...JSON.parse(localStorage.getItem(n6TargetKey)||'{}')}}catch(e){return {...n6DefaultTargets}}}
function n6ScopedClients(){const coach=document.getElementById('n6CoachFilter').value;return coach?clients.filter(c=>c.coach===coach):clients}
function n6AnalyticsData(){
 const scope=n6ScopedClients(),period=Number(document.getElementById('n6Period').value)||30;
 const now=todayISO(),start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-period+1);
 const joiners=scope.filter(c=>c.joinDate && new Date(c.joinDate+'T00:00:00')>=start && c.joinDate<=now);
 const active=scope.filter(c=>clientStatus(c)==='Aktif').length;
 const expiring=scope.filter(c=>{const end=(programCache[c.id]||{}).endDate;return end&&daysBetween(now,end)>=0&&daysBetween(now,end)<=7}).length;
 const unpaid=scope.filter(c=>c.paymentStatus&&c.paymentStatus!=='Lunas').length;
 const waiting=scope.filter(c=>{const m=lastMessage(c.id);return m&&m.sender==='client'}).length;
 const scopeIds=new Set(scope.map(c=>c.id));const relatedTickets=tickets.filter(t=>!document.getElementById('n6CoachFilter').value||scopeIds.has(t.clientId));
 const open=relatedTickets.filter(t=>t.status!=='Selesai').length;
 const paid=scope.filter(c=>c.paymentStatus==='Lunas').length;
 const billed=scope.reduce((a,c)=>a+(Number(c.price)||0),0),received=scope.reduce((a,c)=>a+(Number(c.amountPaid)||0),0);
 return {scope,period,start,joiners,active,expiring,unpaid,waiting,open,paid,billed,received};
}
function n6RenderAnalytics(){
 const sel=document.getElementById('n6CoachFilter'),previous=sel.value,names=[...new Set([...coachRoster.map(c=>c.name),...clients.map(c=>c.coach)].filter(Boolean))].sort();
 const signature=names.join('|');if(sel.dataset.names!==signature){sel.innerHTML='<option value="">Semua Coach</option>'+names.map(n=>'<option value="'+escapeHtml(n)+'">'+escapeHtml(n)+'</option>').join('');sel.value=previous;sel.dataset.names=signature}
 const d=n6AnalyticsData(),t=n6Targets(),percent=d.scope.length?Math.round(d.active/d.scope.length*100):0;
 const metrics=[['Klien baru',d.joiners.length,'Target ≥ '+t.new,d.joiners.length<t.new?'warn':'good'],['Klien aktif',d.active,percent+'% dari klien terdaftar',''],['Program berakhir ≤7 hari',d.expiring,'Perlu tindak lanjut',''],['Tiket terbuka',d.open,'Batas ≤ '+t.tickets,d.open>t.tickets?'warn':'good'],['Pesan menunggu',d.waiting,'Batas ≤ '+t.messages,d.waiting>t.messages?'warn':'good'],['Belum lunas',d.unpaid,'Batas ≤ '+t.unpaid,d.unpaid>t.unpaid?'warn':'good'],['Pembayaran lunas',d.paid,'Klien dengan status lunas',''],['Nilai paket tercatat','Rp '+d.billed.toLocaleString('id-ID'),'Total nilai paket (bukan kas masuk)','']];
 document.getElementById('n6MetricGrid').innerHTML=metrics.map(([label,value,hint,status])=>'<div class="n6-metric '+status+'"><div class="n6-label">'+label+'</div><div class="n6-value">'+value+'</div><div class="n6-hint">'+hint+'</div></div>').join('');
 const count=d.period<=7?7:d.period<=30?6:6,buckets=Array(count).fill(0),labels=[];
 for(let i=0;i<count;i++){const a=new Date(d.start);a.setDate(a.getDate()+Math.floor(i*d.period/count));const b=new Date(d.start);b.setDate(b.getDate()+Math.floor((i+1)*d.period/count));buckets[i]=d.joiners.filter(c=>{const x=new Date(c.joinDate+'T00:00:00');return x>=a&&x<b}).length;labels.push(a.toLocaleDateString('id-ID',{day:'numeric',month:'short'}))}
 const max=Math.max(1,...buckets);document.getElementById('n6SignupChart').innerHTML=buckets.map((v,i)=>'<div class="n6-bar-col"><b>'+v+'</b><i style="height:'+Math.max(3,Math.round(v/max*100))+'px"></i><small>'+labels[i]+'</small></div>').join('');
 const statuses=['Aktif','Akan Berakhir','Nonaktif'],statusCounts=statuses.map(x=>d.scope.filter(c=>clientStatus(c)===x).length);
 document.getElementById('n6StatusChart').innerHTML=statuses.map((name,i)=>'<div class="n6-status-row"><div class="n6-status-top"><span>'+name+'</span><b>'+statusCounts[i]+'</b></div><div class="n6-progress"><i style="width:'+(d.scope.length?statusCounts[i]/d.scope.length*100:0)+'%"></i></div></div>').join('');
}
function n6ExportCsv(){const d=n6AnalyticsData(),rows=[['Indikator','Nilai'],['Periode hari',d.period],['Klien baru',d.joiners.length],['Klien aktif',d.active],['Program akan berakhir',d.expiring],['Tiket terbuka',d.open],['Pesan menunggu',d.waiting],['Pembayaran belum lunas',d.unpaid],['Nilai paket tercatat',d.billed]];const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='n6-indikator-'+todayISO()+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
document.getElementById('n6Period').addEventListener('change',n6RenderAnalytics);
document.getElementById('n6CoachFilter').addEventListener('change',n6RenderAnalytics);
document.getElementById('n6Csv').addEventListener('click',n6ExportCsv);
document.getElementById('n6TargetsBtn').addEventListener('click',()=>{const p=document.getElementById('n6TargetsPanel');p.hidden=!p.hidden;if(!p.hidden){const t=n6Targets();document.getElementById('n6TargetNew').value=t.new;document.getElementById('n6TargetTickets').value=t.tickets;document.getElementById('n6TargetMessages').value=t.messages;document.getElementById('n6TargetUnpaid').value=t.unpaid}});
document.getElementById('n6SaveTargets').addEventListener('click',()=>{const v={new:Number(document.getElementById('n6TargetNew').value),tickets:Number(document.getElementById('n6TargetTickets').value),messages:Number(document.getElementById('n6TargetMessages').value),unpaid:Number(document.getElementById('n6TargetUnpaid').value)};if(Object.values(v).some(x=>!Number.isFinite(x)||x<0)){showToast('Batas harus angka positif');return}try{localStorage.setItem(n6TargetKey,JSON.stringify(v));n6RenderAnalytics();showToast('Batas indikator tersimpan')}catch(e){showToast('Batas gagal disimpan')}});
const n6OriginalRenderBeranda=renderBeranda;
renderBeranda=function(){n6OriginalRenderBeranda();n6RenderAnalytics()};

// Accept coach roster/schedule/day-off changes made in the Owner dashboard
// when both dashboards are hosted on the same origin.
function n6RefreshSharedCoachData(){
  const read=(key,fallback)=>{try{const v=localStorage.getItem(STORE_PREFIX+key);return v===null?fallback:JSON.parse(v)}catch(e){return fallback}};
  const roster=read('coachRoster',coachRoster),schedule=read('coachSchedule',coachSchedule),off=read('coachDayOff',coachDayOff);
  if(Array.isArray(roster))coachRoster=roster;
  if(schedule && typeof schedule==='object' && !Array.isArray(schedule))coachSchedule=schedule;
  if(off && typeof off==='object' && !Array.isArray(off))coachDayOff=off;
  populateCoachFilters();populateFormSelects();renderAll();
}
window.addEventListener('storage',e=>{
  if(['coachRoster','coachSchedule','coachDayOff'].some(k=>e.key===STORE_PREFIX+k))n6RefreshSharedCoachData();
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)n6RefreshSharedCoachData();});
/* ================= INIT ================= */
  (async function init(){
    await loadAllData();
    populateCoachFilters();
    populateFormSelects();
    renderAll();
    if (pendingArchiveNotice > 0){
      showToast(pendingArchiveNotice + ' klien nonaktif >7 hari otomatis dipindah ke Arsip');
    }
  })();
})();
