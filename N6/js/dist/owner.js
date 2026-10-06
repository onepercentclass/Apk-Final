/**
 * N6 dist bundle - owner
 *
 * GENERATED FILE - do not edit. Source of truth is js/modules/owner/*.js
 * Rebuilt by tools/build.ps1; concatenation is byte-identical to the
 * original <script> block in owner.html.
 */


(function(){
  /* ================= KATALOG PROGRAM (default — bisa diubah lewat storage 'programCatalog') ================= */
  const DEFAULT_PROGRAM_CATALOG = [
    { id:'run-start', label:'Run-Start', category:'Online', mode:'fixed', unit:'3 Bulan', price:334000, komisiPerSesi:0 },
    { id:'privat-online', label:'Private Online', category:'Online', mode:'fixed', unit:'1 Bulan', price:800000, komisiPerSesi:0 },
    { id:'single-session', label:'Single Session Training', category:'Offline', mode:'fixed', unit:'1x Pertemuan', price:170000, komisiPerSesi:80000 },
    { id:'running-class', label:'Running Class (5–20 orang)', category:'Offline', mode:'configurable', unit:'per orang', ratePerSesi:65000, defaultMeetings:2, defaultWeeks:4, komisiPerSesi:0 },
    { id:'semi-private', label:'Semi Private (2 orang)', category:'Offline', mode:'configurable', unit:'per paket', ratePerSesi:190000, defaultMeetings:2, defaultWeeks:4, komisiPerSesi:0 },
    { id:'private-offline', label:'Private Offline', category:'Offline', mode:'configurable', unit:'per paket', ratePerSesi:150000, defaultMeetings:2, defaultWeeks:4, komisiPerSesi:0 },
    { id:'korporat', label:'Kerja Sama Korporat (Karyawan)', category:'Kerja Sama', mode:'custom', komisiPerSesi:0 },
    { id:'event-pacer', label:'Kerja Sama Event (Pacer)', category:'Kerja Sama', mode:'custom', komisiPerSesi:0 }
  ];
  const DEFAULT_COACH_ROSTER = [];
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
  function todayDayName(){
    const jsDay = new Date().getDay(); // 0=Minggu
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    return DAYS[idx];
  }

  // Coach schedule is shared with Admin CS on the SAME browser origin.
  // Other Owner records stay in the Owner namespace; never overwrite Admin client records.
  const N6_SHARED_COACH_KEYS = new Set(['coachSchedule','coachDayOff']); // coachRoster dihapus, diambil dari Kelola Anggota via API
  const N6_ADMIN_PREFIX = 'n6csAdmin:';
  const N6_OWNER_PREFIX = 'n6Owner:';
  // Key yang didukung API — data ini lintas role via backend.
  const N6_API_KEYS = new Set(['clients','tickets','messages']);
  async function storeGet(key){
    // Coba via repository API dulu untuk key yang didukung.
    if (N6_API_KEYS.has(key) && window.storage) {
      try {
        const r = await window.storage.get(key, true);
        if (r && r.value != null) return r.value;
      } catch (e) { /* fallback ke localStorage */ }
    }
    if (N6_SHARED_COACH_KEYS.has(key)) {
      try { const v=localStorage.getItem(N6_ADMIN_PREFIX+key); if(v!==null)return v; } catch(e){}
    }
    try { return localStorage.getItem(N6_OWNER_PREFIX+key); } catch(e){ return null; }
  }
  async function storeSet(key,value){
    // Tulis ke API untuk key yang didukung (best-effort), selalu tulis lokal juga.
    if (N6_API_KEYS.has(key) && window.storage) {
      try { await window.storage.set(key, value, true); } catch (e) { /* abaikan */ }
    }
    if(N6_SHARED_COACH_KEYS.has(key)){
      try{localStorage.setItem(N6_ADMIN_PREFIX+key,value);
        if(localStorage.getItem(N6_ADMIN_PREFIX+key)!==value)throw Error('Verification failed');
        return true;
      }catch(e){showToast('Gagal menyimpan jadwal bersama. Periksa penyimpanan browser.');return false;}
    }
    try{localStorage.setItem(N6_OWNER_PREFIX+key,value);return true;}catch(e){showToast('Penyimpanan browser tidak tersedia');return false;}
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
  let expenses = [];
  let activeChatClientId = null;
  let activeSlot = null; // { coachId, day, blockKey }
  let pendingArchiveNotice = 0;

  function catalogById(id){ return programCatalog.find(p => p.id === id); }
  function coachById(id){ return coachRoster.find(c => c.id === id); }

  function seedDemoIfEmpty(){
    // Data dummy dinonaktifkan — dashboard selalu mulai kosong, tanpa klien contoh.
    return false;
  }

  async function fetchCoachesFromApi(){
    try {
      const token = window.localStorage.getItem('n6:api:token');
      if (!token) return [];
      const res = await fetch('https://api.denisbergkam.com/api/n6/v1/accounts?tier=3&limit=200', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) return [];
      const page = await res.json();
      const items = (page && page.items) || [];
      return items.map(a => ({
        id: a.coach_id || a.id,
        accountId: a.id,
        name: a.full_name || a.username,
        username: a.username,
        phone: a.phone || '',
        email: a.email || '',
      }));
    } catch (e) { return []; }
  }

  /* ================= LOAD DATA ================= */
  async function loadAllData(){
    const catalogRaw = await storeGet('programCatalog');
    try{ programCatalog = catalogRaw ? JSON.parse(catalogRaw) : []; }catch(e){ programCatalog = []; }
    if (!programCatalog.length){ programCatalog = DEFAULT_PROGRAM_CATALOG; await storeSet('programCatalog', JSON.stringify(programCatalog)); }

    // coachRoster diambil dari Kelola Anggota (API /accounts?tier=3), bukan localStorage.
    coachRoster = await fetchCoachesFromApi();

    const schedRaw = await storeGet('coachSchedule');
    try{ coachSchedule = schedRaw ? JSON.parse(schedRaw) : {}; }catch(e){ coachSchedule = {}; }

    const dayOffRaw = await storeGet('coachDayOff');
    try{ coachDayOff = dayOffRaw ? JSON.parse(dayOffRaw) : {}; }catch(e){ coachDayOff = {}; }

    const expenseRaw = await storeGet('expenses');
    try{ expenses = expenseRaw ? JSON.parse(expenseRaw) : []; }catch(e){ expenses = []; }

    const clientsRaw = await storeGet('clients');
    try{ clients = clientsRaw ? JSON.parse(clientsRaw) : []; }catch(e){ clients = []; }

    const deletedRaw=await storeGet('deletedAutoTickets');
    try{deletedAutoTickets=deletedRaw?JSON.parse(deletedRaw):[];}catch(e){deletedAutoTickets=[];}
    const ticketsRaw = await storeGet('tickets');
    try{ tickets = ticketsRaw ? JSON.parse(ticketsRaw) : []; }catch(e){ tickets = []; }

    try{teamPayments=JSON.parse(await storeGet('teamPayments')||'{}')||{};}catch(e){teamPayments={};}
    const archiveRaw = await storeGet('archivedClients');
    try{ archivedClients = archiveRaw ? JSON.parse(archiveRaw) : []; }catch(e){ archivedClients = []; }

    const seeded = seedDemoIfEmpty();

    chatCache = {}; reportsCache = {}; programCache = {};
    for (const c of clients){
      if (!seeded || chatCache[c.id] === undefined){
        const cRaw = await storeGet('chat:' + c.id);
        try{ chatCache[c.id] = cRaw ? JSON.parse(cRaw) : (chatCache[c.id] || []); }catch(e){ chatCache[c.id] = chatCache[c.id] || []; }
      }
      if (reportsCache[c.id] === undefined){
        const rRaw = await storeGet('reports:' + c.id);
        try{ reportsCache[c.id] = rRaw ? JSON.parse(rRaw) : (reportsCache[c.id] || {}); }catch(e){ reportsCache[c.id] = reportsCache[c.id] || {}; }
      }
      if (programCache[c.id] === undefined){
        const pRaw = await storeGet('program:' + c.id);
        try{ programCache[c.id] = pRaw ? JSON.parse(pRaw) : (programCache[c.id] || { pbStart:'', pbEnd:'', startDate:'', endDate:'' }); }catch(e){ programCache[c.id] = programCache[c.id] || { pbStart:'', pbEnd:'', startDate:'', endDate:'' }; }
      }
    }

    if (seeded){
      await storeSet('clients', JSON.stringify(clients));
      for (const c of clients){
        await storeSet('chat:' + c.id, JSON.stringify(chatCache[c.id] || []));
        await storeSet('reports:' + c.id, JSON.stringify(reportsCache[c.id] || {}));
        await storeSet('program:' + c.id, JSON.stringify(programCache[c.id] || {}));
      }
    }

    // Auto-arsip: klien Nonaktif (program sudah berakhir) 10 hari berturut-turut otomatis dipindah ke Arsip
    const stillActive = [];
    let autoArchivedCount = 0;
    for (const c of clients){
      const p = programCache[c.id] || {};
      if (p.endDate && /^\d{4}-\d{2}-\d{2}$/.test(String(p.endDate)) && daysBetween(p.endDate, todayISO()) >= 10){
        // Idempotent archive: do not create duplicate archive records for the same client.
        if (!archivedClients.some(a => String(a.id) === String(c.id))) archivedClients.push({ ...c, archivedAt: todayISO(), programSnapshot: p });
        autoArchivedCount++;
      } else {
        stillActive.push(c);
      }
    }
    if (autoArchivedCount > 0){
      clients = stillActive;
      await storeSet('clients', JSON.stringify(clients));
      await storeSet('archivedClients', JSON.stringify(archivedClients));
    }
    pendingArchiveNotice = autoArchivedCount;
  }

  async function persistClients(){ await storeSet('clients', JSON.stringify(clients)); }
  async function persistTickets(){ await storeSet('tickets', JSON.stringify(tickets)); }
  async function persistChat(id){ await storeSet('chat:' + id, JSON.stringify(chatCache[id] || [])); }
  async function persistProgram(id){ await storeSet('program:' + id, JSON.stringify(programCache[id] || {})); }
  async function persistCoachRoster(){ /* dihapus: coachRoster dari API Kelola Anggota */ }
  async function persistCoachSchedule(){ await storeSet('coachSchedule', JSON.stringify(coachSchedule)); }
  async function persistCoachDayOff(){ await storeSet('coachDayOff', JSON.stringify(coachDayOff)); }
  async function persistExpenses(){ await storeSet('expenses', JSON.stringify(expenses)); }
  async function persistCatalog(){ await storeSet('programCatalog', JSON.stringify(programCatalog)); }
  function clientSessionCount(c){
    const meta = c.packageMeta || {};
    if (meta.mode === 'configurable') return Number(meta.totalSessions) || 0;
    if (c.programId === 'single-session') return 1;
    return 0; // program bulanan (Run-Start, Private Online) & kerja sama nego tidak dihitung per sesi
  }
  function programKomisiPerSesi(programId){
    const p = catalogById(programId);
    return p && p.komisiPerSesi != null ? Number(p.komisiPerSesi) : 0;
  }
  function clientCommissionAmount(c){
    return clientSessionCount(c) * programKomisiPerSesi(c.programId);
  }
  function coachRevenue(coachName){
    return clients.filter(c => c.coach === coachName).reduce((sum, c) => sum + (Number(c.price) || 0), 0);
  }
  function coachSessionCount(coachName){
    return clients.filter(c => c.coach === coachName).reduce((sum, c) => sum + clientSessionCount(c), 0);
  }
  function coachCommissionAmount(coach){
    return clients.filter(c => c.coach === coach.name).reduce((sum, c) => sum + clientCommissionAmount(c), 0);
  }
  function totalRevenue(){ return clients.reduce((sum, c) => sum + (Number(c.price) || 0), 0); }
  function totalCommission(){ return coachRoster.reduce((sum, c) => sum + coachCommissionAmount(c), 0); }
  function totalExpenses(){ return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0); }
  function netProfit(){ return totalRevenue() - totalCommission() - totalExpenses(); }

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
    document.getElementById('statTotalRevenue').textContent = formatRupiah(totalRevenue());
    document.getElementById('statProfit').textContent = formatRupiah(netProfit());
    document.getElementById('statTotalKlien').textContent = clients.length;
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
    renderTopPerformer();

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

  function renderTopPerformer(){
    const box = document.getElementById('topPerformerBox');
    if (!coachRoster.length){ box.innerHTML = '<div class="list-empty">Belum ada coach terdaftar.</div>'; return; }
    const ranked = [...coachRoster].map(c => ({ coach:c, revenue: coachRevenue(c.name), komisi: coachCommissionAmount(c), klien: clients.filter(x=>x.coach===c.name).length }))
      .sort((a,b) => b.revenue - a.revenue);
    const top = ranked[0];
    if (!top || top.revenue === 0){ box.innerHTML = '<div class="list-empty">Belum ada pendapatan tercatat bulan ini.</div>'; return; }
    box.innerHTML = `
      <div class="client-row" style="cursor:default;">
        <div><div class="name">🏆 ${escapeHtml(top.coach.name)}</div><div class="meta">${top.klien} klien aktif — komisi ${formatRupiah(top.komisi)} (${coachSessionCount(top.coach.name)}x sesi)</div></div>
        <div class="client-tags"><span class="badge green">${formatRupiah(top.revenue)}</span></div>
      </div>`;
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
          <div class="meta">${escapeHtml(c.programLabel || 'Belum ada program')} — Coach ${escapeHtml(c.coach || '-')}</div>
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

  /* ================= ARSIP KLIEN (auto, Nonaktif >10 hari) ================= */
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
    configWrap.style.display = 'none'; fixedWrap.style.display = 'none'; customWrap.style.display = 'none';
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
    const c = clients.find(x => String(x.id) === String(id));
    if (!c) return;
    const p = programCache[id] || {};
    const meta = c.packageMeta || {};
    document.getElementById('clientFormTitle').textContent = 'Edit Klien';
    document.getElementById('fClientId').value = c.id;
    document.getElementById('fName').value = c.name;
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
    if (!name){ document.getElementById('clientFormError').style.display = 'block'; return; }
    let id = document.getElementById('fClientId').value;
    const isNew = !id;
    if (isNew){
      let base = slugify(name) || 'klien';
      id = base; let n = 2;
      while (clients.some(c => c.id === id)){ id = base + '-' + n; n++; }
    }

    const progId = document.getElementById('fProgram').value;
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

    const data = {
      id, name,
      phone: document.getElementById('fPhone').value.trim(),
      coach: document.getElementById('fCoach').value,
      programId: progId, programLabel, packageMeta, price, priceLabel,
      status: 'Aktif',
      joinDate: isNew ? todayISO() : (clients.find(c=>String(c.id)===String(id))||{}).joinDate || todayISO(),
      paymentStatus: document.getElementById('fPaymentStatus').value,
      amountPaid: parseInt(document.getElementById('fAmountPaid').value, 10) || 0,
      invoiceNumber: (clients.find(c=>String(c.id)===String(id))||{}).invoiceNumber || '',
      notes: document.getElementById('fNotes').value.trim()
    };
    if (isNew){ clients.push(data); }
    else { const idx = clients.findIndex(c => String(c.id) === String(id)); if (idx >= 0) clients[idx] = { ...clients[idx], ...data }; }

    programCache[id] = {
      pbStart: document.getElementById('fPbStart').value.trim(),
      pbEnd: document.getElementById('fPbEnd').value.trim(),
      startDate: document.getElementById('fStart').value,
      endDate: document.getElementById('fEnd').value
    };
    if (!chatCache[id]) chatCache[id] = [];
    if (!reportsCache[id]) reportsCache[id] = {};

    await persistClients();
    await persistProgram(id);
    if (isNew){ await storeSet('chat:' + id, JSON.stringify(chatCache[id])); await storeSet('reports:' + id, JSON.stringify(reportsCache[id])); }

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
  function ensureInvoiceNumber(c){
    if (!c.invoiceNumber){
      c.invoiceNumber = 'INV/N6/' + todayISO().replace(/-/g,'') + '/' + c.id.slice(0,6).toUpperCase();
      persistClients();
    }
    return c.invoiceNumber;
  }

  window.downloadInvoice = function(id){
    const c = clients.find(x => x.id === id);
    if (!c){ showToast('Klien tidak ditemukan'); return; }
    const p = programCache[c.id] || {};
    const invoiceNo = ensureInvoiceNumber(c);

    const W = 900, H = 1273;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // background
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);

    // header bar
    ctx.fillStyle = '#111110'; ctx.fillRect(0, 0, W, 150);
    ctx.fillStyle = '#D62828'; ctx.fillRect(50, 42, 66, 66);
    ctx.fillStyle = '#FFFFFF'; ctx.font = '800 26px Arial'; ctx.textAlign = 'center';
    ctx.fillText('N6', 83, 84);
    ctx.textAlign = 'left';
    ctx.font = '800 24px Arial'; ctx.fillText('NUMBER SIX RUNNING TRAINING', 134, 68);
    ctx.font = '400 14px Arial'; ctx.fillStyle = '#C9C7BE';
    ctx.fillText('n6sport.id  ·  WA 0851-4726-7786', 134, 92);
    ctx.textAlign = 'right'; ctx.fillStyle = '#FFFFFF'; ctx.font = '800 34px Arial';
    ctx.fillText('INVOICE', W - 50, 80);
    ctx.font = '400 14px Arial'; ctx.fillStyle = '#C9C7BE';
    ctx.fillText(invoiceNo, W - 50, 105);
    ctx.textAlign = 'left';

    let y = 200;
    // meta row: tanggal + status
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('TANGGAL INVOICE', 50, y);
    ctx.fillStyle = '#111110'; ctx.font = '600 15px Arial';
    ctx.fillText(formatDateID(todayISO()), 50, y + 22);

    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('STATUS PEMBAYARAN', 330, y);
    const pay = c.paymentStatus || 'Belum Lunas';
    const payColor = pay === 'Lunas' ? '#1E8E3E' : pay === 'DP Sebagian' ? '#B7791F' : '#D62828';
    const payBg = pay === 'Lunas' ? '#E8F5EC' : pay === 'DP Sebagian' ? '#FBF1DF' : '#FCEBEB';
    roundRectPath(ctx, 330, y + 10, 150, 30, 15);
    ctx.fillStyle = payBg; ctx.fill();
    ctx.fillStyle = payColor; ctx.font = '800 13px Arial'; ctx.textAlign = 'center';
    ctx.fillText(pay.toUpperCase(), 405, y + 30);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('COACH PENDAMPING', 610, y);
    ctx.fillStyle = '#111110'; ctx.font = '600 15px Arial';
    ctx.fillText(c.coach || '-', 610, y + 22);

    y += 70;
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(W - 50, y); ctx.stroke();
    y += 40;

    // ditagihkan kepada
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('DITAGIHKAN KEPADA', 50, y);
    y += 26;
    ctx.fillStyle = '#111110'; ctx.font = '800 22px Arial';
    ctx.fillText(c.name, 50, y);
    y += 26;
    ctx.fillStyle = '#3B3A36'; ctx.font = '400 14px Arial';
    ctx.fillText(c.phone || '-', 50, y);
    y += 20;
    ctx.fillText('Periode program: ' + formatDateID(p.startDate) + ' – ' + formatDateID(p.endDate), 50, y);

    y += 50;
    // table header
    ctx.fillStyle = '#F5F3EE'; ctx.fillRect(50, y, W - 100, 40);
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('DESKRIPSI PROGRAM', 66, y + 25);
    ctx.textAlign = 'right'; ctx.fillText('BIAYA', W - 66, y + 25); ctx.textAlign = 'left';
    y += 40;

    // table row
    const rowTop = y;
    ctx.fillStyle = '#111110'; ctx.font = '700 16px Arial';
    ctx.fillText(c.programLabel || '-', 66, y + 30);
    ctx.font = '400 13px Arial'; ctx.fillStyle = '#6E6C64';
    let detailLine = '';
    const meta = c.packageMeta || {};
    if (meta.mode === 'configurable') detailLine = meta.totalSessions + 'x pertemuan (' + meta.meetings + 'x/minggu × ' + meta.weeks + ' minggu)';
    else if (meta.mode === 'fixed') detailLine = 'Paket tetap';
    else if (meta.mode === 'custom') detailLine = (meta.partnerName ? meta.partnerName + ' — ' : '') + (meta.count ? meta.count + ' peserta' : '') + (meta.note ? ' · ' + meta.note : '');
    let extraLines = detailLine ? wrapText(ctx, detailLine, 66, y + 52, 560, 18) : 0;
    ctx.textAlign = 'right'; ctx.fillStyle = '#111110'; ctx.font = '700 16px Arial';
    ctx.fillText(formatRupiah(c.price || 0), W - 66, y + 30);
    ctx.textAlign = 'left';
    y = rowTop + Math.max(60, 40 + extraLines * 18);

    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(W - 50, y); ctx.stroke();
    y += 34;

    // totals
    const price = c.price || 0;
    const paid = c.amountPaid || 0;
    const remaining = Math.max(0, price - paid);
    function totalRow(label, value, bold){
      ctx.fillStyle = bold ? '#111110' : '#6E6C64';
      ctx.font = (bold ? '800 20px' : '400 14px') + ' Arial';
      ctx.fillText(label, 480, y);
      ctx.textAlign = 'right'; ctx.fillText(value, W - 66, y); ctx.textAlign = 'left';
      y += bold ? 34 : 26;
    }
    totalRow('Total Tagihan', formatRupiah(price), false);
    if (pay === 'DP Sebagian'){
      totalRow('Sudah Dibayar', formatRupiah(paid), false);
      totalRow('SISA TAGIHAN', formatRupiah(remaining), true);
    } else if (pay === 'Lunas'){
      totalRow('TOTAL DIBAYAR', formatRupiah(price), true);
    } else {
      totalRow('TOTAL TAGIHAN', formatRupiah(price), true);
    }

    // footer
    const footY = H - 130;
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(50, footY); ctx.lineTo(W - 50, footY); ctx.stroke();
    ctx.fillStyle = '#3B3A36'; ctx.font = '600 14px Arial';
    ctx.fillText('Terima kasih telah bergabung bersama N6 Running Training.', 50, footY + 34);
    ctx.fillStyle = '#6E6C64'; ctx.font = '400 12.5px Arial';
    ctx.fillText('Pertanyaan seputar invoice ini bisa hubungi Admin CS via WhatsApp 0851-4726-7786.', 50, footY + 56);
    ctx.fillText('Dokumen ini dibuat otomatis oleh sistem Admin CS N6 — ' + formatDateID(todayISO()) + '.', 50, footY + 78);

    const link = document.createElement('a');
    link.download = 'Invoice-' + slugify(c.name) + '-' + todayISO() + '.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.93);
    link.click();
    showToast('Invoice diunduh');
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
      </div>
      ${c.notes ? `<div class="note-box">Catatan internal: ${escapeHtml(c.notes)}</div>` : ''}
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

  /* ================= RENDER: HARGA & PROGRAM (owner bisa edit) ================= */
  // Program lama tetap dapat dibaca; saat diedit, disimpan sebagai satu harga tetap.
  function programSinglePrice(p){
    if (p.price != null) return Number(p.price) || 0;
    if (p.mode === 'configurable') return (Number(p.ratePerSesi)||0) * (Number(p.defaultMeetings)||2) * (Number(p.defaultWeeks)||4);
    return 0;
  }
  function renderPriceList(){
    document.getElementById('priceListBody').innerHTML = ['Online','Offline','Kerja Sama'].map(cat => {
      const items = programCatalog.filter(p => p.category === cat);
      if (!items.length) return '';
      const rows = items.map(p => {
        const price = programSinglePrice(p), commission = Number(p.komisiPerSesi)||0;
        return `<div class="price-list-item">
          <div><div class="nm">${escapeHtml(p.label)}</div><div class="ct">${escapeHtml(p.unit || '')}</div><div class="ct">Komisi coach: ${formatRupiah(commission)} / sesi</div></div>
          <div style="display:flex;align-items:center;gap:10px"><div class="pv">${price ? formatRupiah(price) : 'Harga belum diatur'}</div><button class="btn-sm" onclick="openProgramForm('${p.id}')">Edit</button></div>
        </div>`;
      }).join('');
      return `<h3 style="font-size:12px;color:var(--asphalt);text-transform:uppercase;letter-spacing:.03em;margin:14px 0 4px">${cat}</h3>${rows}`;
    }).join('') || '<div class="list-empty">Belum ada program. Tambahkan lewat tombol di atas.</div>';
  }
  function togglePfFields(){
    document.getElementById('pfFixedWrap').style.display = 'block';
    document.getElementById('pfUnitWrap').style.display = 'block';
  }
  window.openProgramForm = function(id){
    const p = id ? catalogById(id) : null;
    document.getElementById('programFormTitle').textContent = p ? 'Edit Program' : 'Tambah Program';
    document.getElementById('pfProgramId').value = p ? p.id : '';
    document.getElementById('pfLabel').value = p ? p.label : '';
    document.getElementById('pfCategory').value = p ? p.category : 'Online';
    document.getElementById('pfPrice').value = p ? (programSinglePrice(p) || '') : '';
    document.getElementById('pfUnit').value = p ? (p.unit || '') : '';
    document.getElementById('pfKomisi').value = p && p.komisiPerSesi != null ? p.komisiPerSesi : 0;
    document.getElementById('programFormError').style.display = 'none';
    document.getElementById('btnDeleteProgram').style.display = p ? 'block' : 'none';
    togglePfFields();
    document.getElementById('programFormModal').classList.add('show');
  };
  window.closeProgramForm = function(){ document.getElementById('programFormModal').classList.remove('show'); };
  async function saveProgramForm(){
    const label = document.getElementById('pfLabel').value.trim();
    const price = Number(document.getElementById('pfPrice').value);
    const komisi = Number(document.getElementById('pfKomisi').value || 0);
    const error = document.getElementById('programFormError');
    if (!label || !document.getElementById('pfPrice').value || !Number.isFinite(price) || price < 0 || !Number.isFinite(komisi) || komisi < 0 || komisi > price){
      error.style.display = 'block'; return;
    }
    error.style.display = 'none';
    let id = document.getElementById('pfProgramId').value;
    const isNew = !id;
    if (isNew){ let base = slugify(label) || 'program'; id = base; let n = 2; while (catalogById(id)){ id = base + '-' + n; n++; } }
    const data = { id, label, category: document.getElementById('pfCategory').value,
      mode:'fixed', unit:document.getElementById('pfUnit').value.trim(),
      price:Math.round(price), komisiPerSesi:Math.round(komisi) };
    if (isNew) programCatalog.push(data);
    else { const idx = programCatalog.findIndex(x => x.id === id); programCatalog[idx] = data; }
    await persistCatalog();
    closeProgramForm();
    showToast(isNew ? 'Program baru ditambahkan' : 'Harga program diperbarui');
    populateFormSelects(); renderAll();
  }
  window.deleteProgramConfirm = function(){
    const id = document.getElementById('pfProgramId').value;
    const p = catalogById(id);
    if (!p) return;
    if (!confirm('Hapus program "' + p.label + '"? Klien yang sudah pakai program ini tidak akan berubah datanya, tapi program tidak bisa dipilih lagi untuk klien baru.')) return;
    programCatalog = programCatalog.filter(x => x.id !== id);
    persistCatalog().then(() => {
      closeProgramForm();
      showToast('Program dihapus');
      populateFormSelects();
      renderAll();
    });
  };

  /* ================= RENDER: KOMISI COACH ================= */
  // Rekap pembayaran per bulan; nominal dikunci setelah konfirmasi.
  let teamPayments = {};
  let teamMonth = todayISO().slice(0,7);
  function teamRoster(){
    const result=[...coachRoster];
    clients.forEach(c=>{if(c.coach&&!result.some(r=>r.name.toLowerCase()===c.coach.toLowerCase()))result.push({id:'client-coach-'+c.coach,name:c.coach});});
    return result;
  }
  function teamClients(month, coachName){
    const last=month+'-'+String(new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate()).padStart(2,'0');
    return clients.filter(c=>String(c.coach||'').trim().toLowerCase()===String(coachName).trim().toLowerCase() &&
      c.status!=='Selesai' && clientStatus(c)!=='Nonaktif' &&
      (c.joinDate||c.createdAt||'0000-00-00').slice(0,10)<=last &&
      (!(programCache[c.id]||{}).endDate||(programCache[c.id]||{}).endDate>=month+'-01'));
  }
  function teamKey(month,coach){return month+'|'+coach.id;}
  // Gunakan slot yang benar-benar tersimpan pada halaman Jadwal Coach.
  // Perhitungan dibatasi tanggal aktif klien dan hari libur coach.
  function teamScheduleBreakdown(month,coach,entries){
    const sched=coachSchedule[coach.id]||{};
    const off=new Set(coachDayOff[coach.id]||[]);
    const [year,mon]=month.split('-').map(Number);
    const last=new Date(year,mon,0).getDate();
    const names=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const counts=Object.fromEntries(entries.map(c=>[String(c.id),0]));
    let total=0;
    const norm=s=>String(s||'').trim().toLocaleLowerCase('id-ID');
    for(let day=1;day<=last;day++){
      const date=month+'-'+String(day).padStart(2,'0');
      if(off.has(date))continue;
      const weekday=names[new Date(year,mon-1,day).getDay()];
      Object.entries(sched).forEach(([key,slot])=>{
        if(!key.startsWith(weekday+'|')||!slot?.client)return;
        if(!Array.isArray(slot.completedDates)||!slot.completedDates.includes(date))return;
        // Slots lama menyimpan satu nama/ID; slot multi-klien lama menyimpan
        // nama dipisahkan koma. Format baru dapat menyimpan clientIds.
        const rawIds=Array.isArray(slot.clientIds)?slot.clientIds:[];
        const tokens=[...rawIds.map(String), ...String(slot.client||'').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean)];
        const matched=new Set();
        entries.forEach(c=>{
          const start=(programCache[c.id]||{}).startDate||c.joinDate||c.createdAt||'0000-00-00';
          const end=(programCache[c.id]||{}).endDate||'9999-12-31';
          const activeOnDate=date>=String(start).slice(0,10)&&date<=String(end).slice(0,10);
          const referenced=tokens.some(token=>norm(token)===norm(c.name)||String(token)===String(c.id));
          if(activeOnDate&&referenced&&!matched.has(String(c.id))){
            counts[String(c.id)]=(counts[String(c.id)]||0)+1; matched.add(String(c.id)); total++;
          }
        });
      });
    }
    return {total,counts};
  }
  function teamScheduledSessions(month,coach,entries){return teamScheduleBreakdown(month,coach,entries).total;}
  function teamCommissionRows(month,coach,entries,breakdown){
    return entries.map(c=>{
      const program=catalogById(c.programId);
      const rate=Math.max(0,Number(program?.komisiPerSesi)||0);
      const sessions=breakdown.counts[String(c.id)]||0;
      // Komisi periode mengikuti jadwal bulan tersebut dan tarif Harga & Program.
      return {client:c,program,rate,sessions,amount:rate*sessions};
    });
  }
  function teamSnapshot(month,coach){
    const entries=teamClients(month,coach.name);
    const breakdown=teamScheduleBreakdown(month,coach,entries);
    const commissionRows=teamCommissionRows(month,coach,entries,breakdown);
    const enrolled=entries.filter(c=>(c.joinDate||c.createdAt||'').slice(0,7)===month);
    return {clients:entries.length,active:entries.length,
      sessions:breakdown.total,
      revenue:enrolled.reduce((n,c)=>n+(Number(c.price)||0),0),
      amount:commissionRows.reduce((n,r)=>n+r.amount,0),
      tickets:tickets.filter(t=>entries.some(c=>c.id===t.clientId)).length};
  }
  function teamHtmlProgram(){
    const ps=programCatalog.filter(p=>p.komisiPerSesi!=null||p.mode==='configurable'||p.id==='single-session');
    document.getElementById('komisiProgramBody').innerHTML=ps.length?ps.map(p=>`<div class="price-list-item"><div><div class="nm">${escapeHtml(p.label)}</div><div class="ct">Harga ${formatRupiah(programSinglePrice(p))}</div></div><div style="display:flex;align-items:center;gap:10px"><div class="pv">${p.komisiPerSesi?formatRupiah(p.komisiPerSesi)+'/sesi':'Belum diatur'}</div><button class="btn-sm" onclick="openProgramForm('${p.id}')">Atur</button></div></div>`).join(''):'<div class="list-empty">Belum ada program per sesi.</div>';
  }
  function renderKomisi(){
    const monthInput=document.getElementById('teamMonth');if(!monthInput)return;
    if(!monthInput.value)monthInput.value=teamMonth;
    teamMonth=monthInput.value;
    const coachFilter=document.getElementById('teamCoach');const prev=coachFilter.value;
    coachFilter.innerHTML='<option value="">Semua Coach</option>'+teamRoster().map(c=>`<option value="${escapeHtml(String(c.id))}">${escapeHtml(c.name)}</option>`).join('');
    if([...coachFilter.options].some(o=>o.value===prev))coachFilter.value=prev;
    const roster=teamRoster().filter(c=>!coachFilter.value||String(c.id)===coachFilter.value);
    let total=0,paid=0,unpaid=0,visible=0;
    const rows=roster.map(c=>{
      const record=teamPayments[teamKey(teamMonth,c)];
      const snap=record?.snapshot||teamSnapshot(teamMonth,c);
      const when=record?.paidAt||'';
      visible++;total+=snap.amount;if(record?.paidAt)paid+=snap.amount;else unpaid+=snap.amount;
      const safeId=encodeURIComponent(String(c.id));
      return `<tr><td class="strong">${escapeHtml(c.name)}</td><td>${snap.active}</td><td>${snap.sessions}x</td><td>${formatRupiah(snap.revenue)}</td><td class="strong">${formatRupiah(snap.amount)}</td><td>${snap.tickets}</td><td><span class="badge ${record?.paidAt?'green':'amber'}">${record?.paidAt?'Sudah Dibayar':'Belum Dibayar'}</span></td><td class="muted">${when?new Date(when).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'—'}</td><td style="text-align:right;white-space:nowrap">${record?.paidAt?`<button class="btn-sm" onclick="reviseTeamPayment(decodeURIComponent('${safeId}'))">Koreksi Status</button>`:`<button class="btn-primary" onclick="confirmTeamPayment(decodeURIComponent('${safeId}'))">Dibayar</button>`}</td></tr>`;
    }).filter(Boolean);
    document.getElementById('komisiBody').innerHTML=rows.length?rows.join(''):'<tr><td colspan="9" class="muted" style="text-align:center;padding:22px">Tidak ada data untuk filter ini.</td></tr>';
    document.getElementById('teamTotal').textContent=formatRupiah(total);
    document.getElementById('teamPaid').textContent=formatRupiah(paid);
    document.getElementById('teamUnpaid').textContent=formatRupiah(unpaid);
    document.getElementById('teamCount').textContent=visible;
    const [y,m]=teamMonth.split('-').map(Number);
    document.getElementById('teamPeriodNote').textContent=`Periode ${BULAN_ID[m-1]} ${y} • Data performa dan komisi mengikuti bulan yang dipilih. Status pembayaran tetap tersimpan sebagai rekap.`;
    teamHtmlProgram();
  }
  function n6PaymentApproval(coach,month,snap){
    return new Promise(resolve=>{
      const overlay=document.getElementById('n6PayModal');
      const details=document.getElementById('n6PayDetails');
      const entries=teamClients(month,coach.name);
      const breakdown=teamScheduleBreakdown(month,coach,entries);
      const programRows=teamCommissionRows(month,coach,entries,breakdown).map(r=>
        `<tr><td>${escapeHtml(r.client.name)}</td><td>${escapeHtml(r.program?.label||r.client.programLabel||'Program')}<br><small>${r.sessions} sesi × ${formatRupiah(r.rate)}</small></td><td style="text-align:right">${formatRupiah(r.amount)}</td></tr>`
      ).join('');
      const [y,m]=month.split('-').map(Number);
      details.innerHTML=`<p style="color:var(--asphalt);margin-bottom:14px">${escapeHtml(coach.name)} • ${BULAN_ID[m-1]} ${y}</p><div class="detail-grid"><div class="detail-item"><div class="l">Klien aktif</div><div class="v">${snap.active}</div></div><div class="detail-item"><div class="l">Sesi terjadwal</div><div class="v">${snap.sessions}</div></div></div><div style="overflow-x:auto"><table style="min-width:0;width:100%;font-size:12px"><thead><tr><th>Klien</th><th>Program</th><th style="text-align:right">Komisi</th></tr></thead><tbody>${programRows||'<tr><td colspan="3">Tidak ada pendaftaran periode ini</td></tr>'}</tbody></table></div><div style="padding:16px;border-radius:9px;background:var(--paper);display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:15px"><strong>Total komisi</strong><strong style="font-size:23px;color:var(--accent)">${formatRupiah(snap.amount)}</strong></div>`;
      const approve=document.getElementById('n6PayApprove'),cancel=document.getElementById('n6PayCancel'),close=document.getElementById('n6PayClose');
      const finish=value=>{overlay.classList.remove('show');approve.disabled=false;approve.removeEventListener('click',yes);cancel.removeEventListener('click',no);close.removeEventListener('click',no);overlay.removeEventListener('click',outside);resolve(value)};
      approve.disabled=snap.amount<=0;approve.title=snap.amount<=0?'Atur nominal komisi di Harga & Program terlebih dahulu':'';
      const yes=()=>finish(true),no=()=>finish(false),outside=e=>{if(e.target===overlay)no()};
      approve.addEventListener('click',yes);cancel.addEventListener('click',no);close.addEventListener('click',no);overlay.addEventListener('click',outside);overlay.classList.add('show');
    });
  }
  window.confirmTeamPayment=async function(id){
    const coach=teamRoster().find(c=>String(c.id)===String(id));if(!coach)return;
    const month=document.getElementById('teamMonth').value,key=teamKey(month,coach);
    if(teamPayments[key]?.paidAt){showToast('Pembayaran sudah dikonfirmasi');return;}
    const snap=teamSnapshot(month,coach);
    if(!await n6PaymentApproval(coach,month,snap))return;
    if(snap.amount<=0){showToast('Total komisi Rp0. Atur komisi pada Harga & Program dan periksa paket klien sebelum pembayaran.');return;}
    const entry={coachId:coach.id,coachName:coach.name,month,snapshot:snap,paidAt:new Date().toISOString(),history:[...(teamPayments[key]?.history||[]),{action:'Konfirmasi pembayaran',at:new Date().toISOString(),amount:snap.amount}]};
    const next={...teamPayments,[key]:entry};
    if(!await storeSet('teamPayments',JSON.stringify(next))){showToast('Gagal menyimpan pembayaran. Jangan ulangi transfer sebelum memeriksa catatan.');return;}
    teamPayments=next;renderKomisi();showToast('Pembayaran berhasil dicatat dan dikunci');
  };
  window.reviseTeamPayment=async function(id){
    const coach=teamRoster().find(c=>String(c.id)===String(id));if(!coach)return;
    const month=document.getElementById('teamMonth').value,key=teamKey(month,coach),record=teamPayments[key];
    if(!record?.paidAt)return;
    const reason=prompt(`KOREKSI STATUS PEMBAYARAN\nCoach: ${coach.name}\nPeriode: ${month}\nNominal tercatat: ${formatRupiah(record.snapshot.amount)}\nDibayar: ${new Date(record.paidAt).toLocaleString('id-ID')}\n\nMasukkan alasan koreksi (wajib). Status akan kembali Belum Dibayar, tetapi bukti konfirmasi lama tetap ada di riwayat.`);
    if(reason===null)return;if(!reason.trim()){showToast('Alasan koreksi wajib diisi');return;}
    if(!confirm(`Kembalikan status ${coach.name} periode ${month} menjadi BELUM DIBAYAR? Riwayat pembayaran sebelumnya tetap tersimpan.`))return;
    const updated={...record,paidAt:null,history:[...(record.history||[]),{action:'Pembatalan konfirmasi',at:new Date().toISOString(),reason:reason.trim(),previousPaidAt:record.paidAt,amount:record.snapshot.amount}]};
    const next={...teamPayments,[key]:updated};
    if(!await storeSet('teamPayments',JSON.stringify(next))){showToast('Koreksi gagal disimpan');return;}
    teamPayments=next;renderKomisi();showToast('Status dikoreksi; riwayat tersimpan');
  };
  document.getElementById('teamMonth').addEventListener('change',renderKomisi);
  document.getElementById('teamCoach').addEventListener('change',renderKomisi);
  // Report printer: independent, paginated A4 document with readable columns and audit trail.
  function printN6Report({type,period,kpis,columns,rows,sections=[],notes=[],filename}){
    const esc=v=>escapeHtml(String(v??'—'));
    const css=`@page{size:A4 portrait;margin:16mm 15mm}*{box-sizing:border-box}html,body{margin:0!important;padding:0!important;width:100%!important;min-width:0!important;max-width:none!important;overflow:visible!important}body{font:9pt/1.55 Arial,Helvetica,sans-serif;color:#1b2b42;background:#fff;padding:0;-webkit-font-smoothing:antialiased}header{display:flex;align-items:flex-end;justify-content:space-between;gap:6mm;border-bottom:2.4pt solid #2159a9;padding-bottom:4mm;margin-bottom:8mm;break-inside:avoid}.header-left{display:flex;flex-direction:column;gap:2mm;min-width:0}.header-right{text-align:right;flex:0 0 auto}.brand{display:flex;align-items:center;gap:3mm;font-weight:800;color:#2159a9;font-size:11pt;letter-spacing:.5pt}.brand-mark{display:inline-flex;align-items:center;justify-content:center;width:16mm;height:14mm;flex:0 0 16mm}.brand-mark img{display:block;max-width:100%;max-height:100%;object-fit:contain}.brand-name{display:flex;flex-direction:column;gap:1mm}.brand-name small{font-size:6.6pt;letter-spacing:1pt;color:#64748b;font-weight:600}.eyebrow{font-size:7.4pt;color:#64748b;text-transform:uppercase;letter-spacing:.4pt}h1{font-size:16pt;margin:0;color:#132743;line-height:1.25}.meta{font-size:8.4pt;color:#5b6b82;margin-top:1.5mm}h2{font-size:10.5pt;color:#204d87;border-bottom:1pt solid #cbd8e9;padding-bottom:2mm;margin:8mm 0 3.5mm;break-after:avoid;letter-spacing:.2pt}.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(38mm,1fr));gap:3mm;margin-bottom:6mm}.kpi{min-width:0;border:1pt solid #d8e2ee;border-left:2.6pt solid #2159a9;border-radius:1.2mm;padding:3mm;break-inside:avoid;background:#fafcff}.kpi .label{font-size:7.2pt;color:#61738b;text-transform:uppercase;letter-spacing:.3pt;margin-bottom:1.4mm}.kpi .value{font-size:12.5pt;font-weight:800;color:#173c73;overflow-wrap:anywhere;line-height:1.2}.section{width:100%;max-width:100%;break-inside:auto}table{width:100%!important;max-width:100%!important;min-width:0!important;table-layout:fixed;border-collapse:collapse;font-size:8pt;margin-bottom:4mm}thead{display:table-header-group}th{background:#204c83;color:white;text-align:left;font-size:7.4pt;letter-spacing:.2pt;padding:2.3mm 1.8mm;overflow-wrap:anywhere}td{padding:2.1mm 1.8mm;border-bottom:0.6pt solid #e3e9f2;vertical-align:top;overflow-wrap:anywhere;word-break:break-word;white-space:normal!important}tr{break-inside:avoid;page-break-inside:avoid}tbody tr:nth-child(even){background:#f4f7fb}.num{text-align:right;font-variant-numeric:tabular-nums}.empty{text-align:center;color:#7a8aa0;padding:5mm}.note{font-size:7.6pt;color:#475569;background:#f2f6fc;border-left:2.4pt solid #2159a9;border-radius:1mm;padding:3mm;margin-top:3.5mm;overflow-wrap:anywhere;line-height:1.5}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:14mm;margin-top:11mm;break-inside:avoid}.signature{text-align:center;font-size:8.4pt;color:#33465e}.signature .line{margin:14mm 0 2mm;border-bottom:0.8pt solid #33465e}.footer{margin-top:8mm;border-top:0.8pt solid #d8e2ed;padding-top:2.6mm;display:flex;justify-content:space-between;gap:4mm;color:#6b7b90;font-size:7.2pt;break-inside:avoid}.section-break{break-before:page}.slot-extra-row{margin-bottom:9px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}table{page-break-inside:auto}thead{display:table-header-group}h2{break-after:avoid}}`;
    const table=(cols,data)=>`<table><colgroup>${cols.map(c=>`<col style="width:${c.width||((100/cols.length).toFixed(4)+'%')}">`).join('')}</colgroup><thead><tr>${cols.map(c=>`<th class="${c.numeric?'num':''}">${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${data.length?data.map(row=>`<tr>${cols.map((c,i)=>`<td class="${c.numeric?'num':''}">${esc(row[i])}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${cols.length}" class="empty">Tidak ada data pada periode ini.</td></tr>`}</tbody></table>`;
    const html=`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Number Six - ${esc(type)}</title><style>${css}</style><style id="n6-requested-polish">#panel-jadwalcoach #coachGuide{line-height:1.7}#panel-beranda .analytics-controls input[type=date]{width:auto;min-width:145px;background:#14243a;color:#f1f6ff;border:1px solid #304660;border-radius:7px;padding:9px}@media(max-width:640px){#panel-beranda .analytics-controls input[type=date]{width:100%;min-width:0}}</style>
</head><body><header><div class="header-left"><div class="brand"><span class="brand-mark"><img src="assets/img/logo-report-a4.png" alt="Logo Number Six"></span><span class="brand-name">NUMBER SIX<small>RUNNING • PERFORMANCE SYSTEM</small></span></div><div class="eyebrow">Laporan operasional • Dokumen internal</div></div><div class="header-right"><h1>${esc(type)}</h1><div class="meta">Periode: ${esc(period)}</div></div></header><div class="kpis">${kpis.map(([k,v])=>`<div class="kpi"><div class="label">${esc(k)}</div><div class="value">${esc(v)}</div></div>`).join('')}</div><section class="section"><h2>01 / Rincian utama</h2>${table(columns,rows)}</section>${sections.map((sec,i)=>`<section class="section ${sec.newPage?'section-break':''}"><h2>${String(i+2).padStart(2,'0')} / ${esc(sec.title)}</h2>${table(sec.columns,sec.rows)}</section>`).join('')}${notes.map(n=>`<div class="note">${esc(n)}</div>`).join('')}<div class="signatures"><div class="signature"><div>Diperiksa oleh</div><div class="line"></div>Administrasi / Keuangan</div><div class="signature"><div>Disetujui oleh</div><div class="line"></div>Owner</div></div><div class="footer"><span>NUMBER SIX RUNNING • Arsip internal • Lampirkan bukti transaksi asli</span><span>Dicetak: ${esc(nowPrintLabel().tanggal)} • ${esc(nowPrintLabel().jam)}</span></div></body></html>`;
    const w=window.open('','_blank');if(!w){showToast('Izinkan pop-up untuk mencetak PDF');return;}
    w.document.open();w.document.write(html);w.document.close();w.addEventListener('load',()=>{w.focus();setTimeout(()=>w.print(),350)},{once:true});
  }
  document.getElementById('teamPrintPdf').addEventListener('click',()=>{
    const month=document.getElementById('teamMonth').value,filter=document.getElementById('teamCoach').value;
    const roster=teamRoster().filter(c=>!filter||String(c.id)===filter);
    const data=roster.map(coach=>{const record=teamPayments[teamKey(month,coach)];return {coach:coach.name,...(record?.snapshot||teamSnapshot(month,coach)),paidAt:record?.paidAt||null,history:record?.history||[]};});
    const [y,m]=month.split('-').map(Number),period=`${BULAN_ID[m-1]} ${y}`,total=data.reduce((n,r)=>n+r.amount,0),paid=data.filter(r=>r.paidAt).reduce((n,r)=>n+r.amount,0);
    const audit=data.flatMap(r=>r.history.map(h=>[r.coach,h.action,new Date(h.at).toLocaleString('id-ID'),formatRupiah(h.amount||0),h.reason||'—']));
    printN6Report({type:'Laporan Performa & Komisi Coach',period:period+(filter?' • '+document.getElementById('teamCoach').selectedOptions[0]?.text:''),filename:'komisi-'+month,
      kpis:[['Total komisi',formatRupiah(total)],['Sudah dibayar',formatRupiah(paid)],['Belum dibayar',formatRupiah(total-paid)],['Jumlah coach',String(data.length)]],
      columns:[{label:'Coach',width:'21%'},{label:'Klien aktif',width:'11%',numeric:true},{label:'Sesi jadwal',width:'12%',numeric:true},{label:'Pendapatan',width:'18%',numeric:true},{label:'Komisi',width:'18%',numeric:true},{label:'Status',width:'20%'}],
      rows:data.map(r=>[r.coach,r.active,r.sessions,formatRupiah(r.revenue),formatRupiah(r.amount),r.paidAt?'Sudah dibayar':'Belum dibayar']),
      sections:[{title:'Bukti konfirmasi pembayaran',columns:[{label:'Coach',width:'28%'},{label:'Nominal',width:'22%',numeric:true},{label:'Waktu konfirmasi',width:'30%'},{label:'Status',width:'20%'}],rows:data.map(r=>[r.coach,formatRupiah(r.amount),r.paidAt?new Date(r.paidAt).toLocaleString('id-ID'):'—',r.paidAt?'Sudah dibayar':'Belum dibayar'])},{title:'Jejak perubahan status',columns:[{label:'Coach',width:'19%'},{label:'Aktivitas',width:'22%'},{label:'Waktu',width:'22%'},{label:'Nominal',width:'17%',numeric:true},{label:'Alasan',width:'20%'}],rows:audit}],
      notes:['Komisi final mengikuti sesi yang ditandai selesai pada bulan tersebut dan tarif komisi per sesi Harga & Program. Sesi adalah jadwal terencana, bukan verifikasi kehadiran. Pembayaran yang sudah dikonfirmasi menggunakan snapshot nominal tersimpan.','Laporan berasal dari data yang tersedia pada perangkat ini. Cocokkan dengan bukti transfer sebelum ditandatangani.']});
  });
  document.getElementById('finPrintPdf').addEventListener('click',()=>{
    const cs=financeFilteredClients(),es=financeFilteredExpenses(),cat=['Online','Offline','Kerja Sama'];
    const cats=cat.map(name=>{const ids=new Set(programCatalog.filter(p=>p.category===name).map(p=>p.id));const list=cs.filter(c=>ids.has(c.programId));return [name,String(list.length),formatRupiah(list.reduce((n,c)=>n+(Number(c.price)||0),0))];});
    const unknown=cs.filter(c=>!programCatalog.some(p=>p.id===c.programId));if(unknown.length)cats.push(['Program lainnya / arsip',String(unknown.length),formatRupiah(unknown.reduce((n,c)=>n+(Number(c.price)||0),0))]);
    const month=finFilterMode==='month'?finSelectedMonth:todayISO().slice(0,7);
    printN6Report({type:'Laporan Keuangan',period:financePeriodLabel(),filename:'keuangan-'+month,
      kpis:[['Total pendapatan',formatRupiah(financeRevenue())],['Komisi coach',formatRupiah(financeCommission())],['Pengeluaran lain',formatRupiah(financeExpenseTotal())],['Estimasi laba bersih',formatRupiah(financeProfit())]],
      columns:[{label:'Kategori program',width:'45%'},{label:'Jumlah klien',width:'20%',numeric:true},{label:'Total pendapatan',width:'35%',numeric:true}],rows:cats,
      sections:[{title:'Rincian pengeluaran lain',columns:[{label:'Tanggal',width:'20%'},{label:'Kategori',width:'24%'},{label:'Keterangan',width:'34%'},{label:'Nominal',width:'22%',numeric:true}],rows:es.map(e=>[formatDateID(e.date),e.category,e.desc,formatRupiah(e.amount)])},{title:'Rincian komisi berdasarkan jadwal coach',columns:[{label:'Coach',width:'28%'},{label:'Dasar perhitungan',width:'29%'},{label:'Periode',width:'19%'},{label:'Komisi final',width:'24%',numeric:true}],rows:financeCommissionRows().map(r=>[r.coach,'Komisi sesi selesai',r.month,formatRupiah(r.amount)])}],
      notes:['Estimasi laba bersih = pendapatan - estimasi komisi - pengeluaran lain. Nilai komisi mengikuti sesi selesai pada halaman Komisi Coach; pembayaran terkonfirmasi memakai snapshot tersimpan.','Laporan ini bukan laporan akuntansi teraudit. Periksa tanggal pendaftaran, transaksi, dan bukti pengeluaran sebelum pengesahan.']});
  });
  /* ================= RENDER: KEUANGAN ================= */
  let finFilterMode = 'all'; // 'all' = bulan ini | 'month' = custom bulan
  let finSelectedMonth = todayISO().slice(0,7); // 'YYYY-MM'
  const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  function financeRangeStart(){ return (finFilterMode === 'month' ? finSelectedMonth : todayISO().slice(0,7)) + '-01'; }
  function financeRangeEnd(){ const selected=finFilterMode==='month'?finSelectedMonth:todayISO().slice(0,7); const [y,m]=selected.split('-').map(Number); return selected+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0'); }
  function inFinanceRange(dateStr){ return !!dateStr && dateStr >= financeRangeStart() && dateStr <= financeRangeEnd(); }
  function financeFilteredClients(){ return clients.filter(c => inFinanceRange(c.joinDate)); }
  function financeFilteredExpenses(){ return expenses.filter(e => inFinanceRange(e.date)); }
  function financeRevenue(){ return financeFilteredClients().reduce((s,c) => s + (Number(c.price)||0), 0); }
  // Gunakan sumber perhitungan yang sama dengan halaman Komisi Coach:
  // sesi terjadwal pada bulan bersangkutan × nominal komisi per sesi.
  // Pembayaran yang telah dikonfirmasi memakai snapshot nominal terkunci.
  function financeCommissionRows(){
    const currentMonth = todayISO().slice(0,7);
    const savedMonths = Object.values(teamPayments).map(p => p.month).filter(Boolean);
    const joinedMonths = clients.map(c => (c.joinDate || c.createdAt || '').slice(0,7))
      .filter(m => /^\d{4}-\d{2}$/.test(m));
    const firstMonth = [...savedMonths, ...joinedMonths, currentMonth].sort()[0];
    const start = finFilterMode === 'month' ? finSelectedMonth : currentMonth;
    const end = start;
    const months = [];
    let [y, m] = start.split('-').map(Number);
    const [endY, endM] = end.split('-').map(Number);
    while (y < endY || (y === endY && m <= endM)) {
      months.push(y + '-' + String(m).padStart(2, '0'));
      if (++m > 12) { m = 1; y++; }
    }
    const roster = teamRoster();
    return months.flatMap(month => {
      const coaches = [...roster];
      Object.values(teamPayments).filter(p => p.month === month).forEach(p => {
        if (!coaches.some(c => String(c.id) === String(p.coachId))) {
          coaches.push({id:p.coachId, name:p.coachName || 'Coach arsip'});
        }
      });
      return coaches.map(coach => {
        const record = teamPayments[teamKey(month, coach)];
        const amount = record?.paidAt && record.snapshot
          ? Number(record.snapshot.amount) || 0
          : teamSnapshot(month, coach).amount;
        return {month, coach:coach.name, amount};
      }).filter(row => row.amount > 0);
    });
  }
  function financeCommission(){
    return financeCommissionRows().reduce((sum, row) => sum + row.amount, 0);
  }
  function financeExpenseTotal(){ return financeFilteredExpenses().reduce((s,e) => s + (Number(e.amount)||0), 0); }
  function financeProfit(){ return financeRevenue() - financeCommission() - financeExpenseTotal(); }
  function financePeriodLabel(){
    const selected = finFilterMode === 'month' ? finSelectedMonth : todayISO().slice(0,7);
    const [y,m] = selected.split('-').map(Number);
    return 'Menampilkan laporan bulan ' + BULAN_ID[m-1] + ' ' + y + '.';
  }

  function renderKeuangan(){
    document.getElementById('finPeriodLabel').textContent = financePeriodLabel();
    document.getElementById('revenueCategoryPeriod').textContent = financePeriodLabel();
    document.getElementById('finRevenue').textContent = formatRupiah(financeRevenue());
    document.getElementById('finCommission').textContent = formatRupiah(financeCommission());
    document.getElementById('finExpense').textContent = formatRupiah(financeExpenseTotal());
    document.getElementById('finProfit').textContent = formatRupiah(financeProfit());

    const periodClients = financeFilteredClients();
    const cats = ['Online','Offline','Kerja Sama'];
    document.getElementById('revenueByCategoryBody').innerHTML = cats.map(cat => {
      const catProgramIds = new Set(programCatalog.filter(p => p.category === cat).map(p => p.id));
      const revenue = periodClients.filter(c => catProgramIds.has(c.programId)).reduce((s,c) => s + (Number(c.price)||0), 0);
      const count = periodClients.filter(c => catProgramIds.has(c.programId)).length;
      return `<div class="price-list-item">
        <div><div class="nm">${cat}</div><div class="ct">${count} klien</div></div>
        <div class="pv">${formatRupiah(revenue)}</div>
      </div>`;
    }).join('');

    const rows = [...financeFilteredExpenses()].sort((a,b) => (b.date||'').localeCompare(a.date||''));
    document.getElementById('expenseBody').innerHTML = rows.length ? rows.map(e => `
      <tr>
        <td>${formatDateID(e.date)}</td>
        <td class="muted">${escapeHtml(e.category)}</td>
        <td>${escapeHtml(e.desc)}</td>
        <td class="right strong">${formatRupiah(e.amount)}</td>
        <td class="right"><button class="btn-danger-sm" onclick="deleteExpense('${e.id}')">Hapus</button></td>
      </tr>`).join('') : `<tr><td colspan="5" class="muted" style="text-align:center; padding:16px 0;">Belum ada pengeluaran pada periode ini.</td></tr>`;
  }
  window.openExpenseForm = function(){
    document.getElementById('exDate').value = todayISO();
    document.getElementById('exCategory').value = 'Operasional';
    document.getElementById('exDesc').value = '';
    document.getElementById('exAmount').value = '';
    document.getElementById('expenseFormModal').classList.add('show');
  };
  window.closeExpenseForm = function(){ document.getElementById('expenseFormModal').classList.remove('show'); };
  async function saveExpenseForm(){
    const desc = document.getElementById('exDesc').value.trim();
    const amount = parseInt(document.getElementById('exAmount').value, 10) || 0;
    if (!desc || !amount){ showToast('Lengkapi deskripsi dan nominal pengeluaran'); return; }
    expenses.push({ id:'ex-' + Date.now(), date: document.getElementById('exDate').value || todayISO(), category: document.getElementById('exCategory').value, desc, amount });
    await persistExpenses();
    closeExpenseForm();
    showToast('Pengeluaran dicatat');
    renderAll();
  }
  window.deleteExpense = function(id){
    expenses = expenses.filter(e => e.id !== id);
    persistExpenses().then(() => { showToast('Pengeluaran dihapus'); renderAll(); });
  };

  /* ================= RENDER: PERFORMA TIM ================= */
  function performaTicketStats(coachName){
    const coachClientIds = new Set(clients.filter(c => c.coach === coachName).map(c => c.id));
    const own = tickets.filter(t => coachClientIds.has(t.clientId));
    return { handled: own.length, done: own.filter(t => t.status === 'Selesai').length };
  }
  function renderPerforma(){ /* Digabung ke renderKomisi */ }

  /* ================= RENDER: TIKET ================= */
  let ticketFilter = 'semua';
  let autoIssueMap = {};
  let deletedAutoTickets = [];
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

  const LOGO_DATA = "assets/img/logo-report.png";
  function nowPrintLabel(){const d=new Date();return {tanggal:d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),jam:d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})};}
  function renderShareCoachOptions(){
    const sel=document.getElementById('shareScheduleCoach');if(!sel)return;
    const current=sel.value;
    sel.innerHTML='<option value="">Pilih coach...</option>'+coachRoster.map(c=>'<option value="'+escapeHtml(c.id)+'">'+escapeHtml(c.name)+'</option>').join('');
    if(coachRoster.some(c=>c.id===current))sel.value=current;
    else if(coachRoster.length)sel.value=coachRoster[0].id;
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
    if(logoImg.complete && logoImg.naturalWidth)ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
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
    // Daftar coach dihapus, kelola via Kelola Anggota.
    if (typeof showToast === 'function') showToast('Kelola coach via menu Kelola Anggota');
    if (typeof switchPanel === 'function') switchPanel('akun');
  };
  window.editCoach = function(id){
    // Daftar coach dihapus, kelola via Kelola Anggota.
    if (typeof showToast === 'function') showToast('Kelola coach via menu Kelola Anggota');
    if (typeof switchPanel === 'function') switchPanel('akun');
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

  /* ================= RENDER ALL ================= */
  function renderAll(){
    renderKomisi();
    renderKeuangan();
    renderPerforma();
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
  const panelTitles = { beranda:'Beranda', klien:'Klien', jadwalklien:'Jadwal Klien', jadwalcoach:'Jadwal Coach', harga:'Harga & Program', komisi:'Performa & Komisi', keuangan:'Keuangan', performa:'Performa Tim', tiket:'Tiket & Keluhan', pesan:'Pesan', akun:'Kelola Anggota', sandi:'Ganti Password' };
  function switchPanel(name){
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    if(name === 'performa') name = 'komisi';
    document.getElementById('panel-' + name).classList.add('active');
    document.querySelectorAll('.side-nav button, .bottom-nav button[data-panel]').forEach(b => b.classList.toggle('active', b.dataset.panel === name));
    document.getElementById('mobileMoreBtn').classList.toggle('more-active', !['beranda','klien','jadwalklien'].includes(name));
    document.getElementById('pageTitle').textContent = panelTitles[name] || name;
    closeSidebar();
  }
  window.switchPanel = switchPanel;
  document.querySelectorAll('.side-nav button, .bottom-nav button[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => switchPanel(btn.dataset.panel));
  });

  const sidebarEl = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  function openSidebar(){ sidebarEl.classList.add('open'); sidebarOverlay.classList.add('show'); document.getElementById('mobileMoreBtn').setAttribute('aria-expanded','true'); }
  function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarOverlay.classList.remove('show'); document.getElementById('mobileMoreBtn').setAttribute('aria-expanded','false'); }
  document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
  document.getElementById('mobileMoreBtn').addEventListener('click', openSidebar);
  document.addEventListener('keydown', e => {if(e.key === 'Escape') closeSidebar();});
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ================= SUBTABS (Tiket) ================= */
  document.querySelectorAll('.subtab-btn[data-sub]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-sub]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ticketFilter = btn.dataset.sub;
      renderTickets();
    });
  });

  /* ================= SUBTABS (Klien: Aktif / Arsip) ================= */
  document.querySelectorAll('.subtab-btn[data-klienview]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-klienview]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('#klienview-aktif, #klienview-arsip').forEach(p => p.classList.remove('active'));
      document.getElementById('klienview-' + btn.dataset.klienview).classList.add('active');
    });
  });

  /* ================= SUBTABS (Jadwal Coach: Mingguan / Kalender) ================= */
  document.getElementById('toggleCoachGuide')?.addEventListener('click',()=>{const box=document.getElementById('coachGuide'),btn=document.getElementById('toggleCoachGuide');const open=box.style.display!=='none';box.style.display=open?'none':'block';btn.textContent=open?'Lihat keterangan':'Sembunyikan keterangan';btn.setAttribute('aria-expanded',String(!open));});
  document.querySelectorAll('.subtab-btn[data-coachpage]').forEach(btn=>{btn.addEventListener('click',()=>{document.querySelectorAll('.subtab-btn[data-coachpage]').forEach(b=>b.classList.remove('active'));btn.classList.add('active');document.querySelectorAll('#coachpage-schedule,#coachpage-roster').forEach(p=>p.classList.remove('active'));document.getElementById('coachpage-'+btn.dataset.coachpage).classList.add('active');});});

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

  /* ================= FILTER KEUANGAN ================= */
  document.querySelectorAll('.subtab-btn[data-finfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.subtab-btn[data-finfilter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      finFilterMode = btn.dataset.finfilter;
      document.getElementById('finMonthPicker').style.display = finFilterMode === 'month' ? 'inline-block' : 'none';
      if (finFilterMode === 'month' && !document.getElementById('finMonthPicker').value){
        document.getElementById('finMonthPicker').value = finSelectedMonth;
      }
      renderKeuangan();
    });
  });
  document.getElementById('finMonthPicker').addEventListener('change', e => {
    if (!e.target.value) return;
    finSelectedMonth = e.target.value;
    renderKeuangan();
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
  document.getElementById('btnSaveSlot').addEventListener('click', saveSlot);
  document.getElementById('btnClearSlot').addEventListener('click', clearSlot);
  document.getElementById('klienSearchInput').addEventListener('input', renderClientList);
  document.getElementById('klienFilterCoach').addEventListener('change', renderClientList);
  document.getElementById('klienFilterStatus').addEventListener('change', renderClientList);
  document.getElementById('btnTambahProgram').addEventListener('click', () => openProgramForm());
  document.getElementById('btnSaveProgram').addEventListener('click', saveProgramForm);
  document.getElementById('btnDeleteProgram').addEventListener('click', deleteProgramConfirm);
  document.getElementById('btnTambahPengeluaran').addEventListener('click', openExpenseForm);
  document.getElementById('btnSaveExpense').addEventListener('click', saveExpenseForm);
  document.getElementById('globalSearch').addEventListener('input', (e) => {
    switchPanel('klien');
    document.getElementById('klienSearchInput').value = e.target.value;
    renderClientList();
  });


  /* Analytics: seluruh angka berasal dari state dashboard yang sama. */
  const ANALYTICS_COLORS=['var(--accent)','#6656ee','#3ed3a0','#f5b957','#df79cb','#6fc8ed','#97a4ff'];
  const aMoney=n=>'Rp'+Math.round(n||0).toLocaleString('id-ID');
  const aShort=n=>Math.abs(n)>=1e9?(n/1e9).toFixed(1)+'M':Math.abs(n)>=1e6?(n/1e6).toFixed(1)+'jt':Math.abs(n)>=1e3?(n/1e3).toFixed(0)+'rb':String(Math.round(n));
  const aEsc=s=>escapeHtml(String(s??''));
  function aMonths(n){const d=new Date(),out=[];for(let i=n-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push({key:x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0'),label:x.toLocaleDateString('id-ID',{month:'short',year:'2-digit'})});}return out;}
  function aSvg(values,labels,kind){const w=700,h=245,L=55,R=12,T=20,B=36,plotW=w-L-R,plotH=h-T-B,max=Math.max(1,...values)*1.16;let out=`<svg class="analytics-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Grafik ${kind==='bar'?'jumlah klien':'pendapatan'} per bulan">`;
    for(let i=0;i<=4;i++){let y=T+plotH*i/4;out+=`<line x1="${L}" x2="${w-R}" y1="${y}" y2="${y}" stroke="var(--chart-grid)" stroke-dasharray="3 5"/><text x="${L-8}" y="${y+4}" text-anchor="end">${aShort(max*(4-i)/4)}</text>`;}
    if(kind==='bar'){const step=plotW/values.length;values.forEach((v,i)=>{const bh=v/max*plotH,x=L+i*step+step*.18,y=T+plotH-bh;out+=`<rect x="${x}" y="${y}" width="${step*.64}" height="${bh}" rx="4" fill="var(--chart-fill)"><title>${aEsc(labels[i])}: ${v} klien</title></rect>`;});}
    else{const pts=values.map((v,i)=>[L+(values.length===1?plotW/2:i*plotW/(values.length-1)),T+plotH-v/max*plotH]);const path=pts.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ');const area=path+` L${pts.at(-1)[0]} ${T+plotH} L${pts[0][0]} ${T+plotH} Z`;out+=`<defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--chart-fill)" stop-opacity=".43"/><stop offset="1" stop-color="var(--chart-fill)" stop-opacity="0"/></linearGradient></defs><path d="${area}" fill="url(#revenueFill)"/><path d="${path}" fill="none" stroke="var(--chart-fill)" stroke-width="3" stroke-linejoin="round"/>`;pts.forEach((p,i)=>out+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--chart-point)"><title>${aEsc(labels[i])}: ${aMoney(values[i])}</title></circle>`);}
    labels.forEach((label,i)=>{const x=L+(kind==='bar'?(i+.5)*plotW/labels.length:labels.length===1?plotW/2:i*plotW/(labels.length-1));out+=`<text x="${x}" y="${h-9}" text-anchor="middle">${aEsc(label)}</text>`;});return out+'</svg>';}
  function aProgress(label,value,max,detail,color){const pct=max?Math.max(0,Math.min(100,value/max*100)):0;return `<div><div class="progress-line"><span>${aEsc(label)}</span><strong>${aEsc(detail)}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${color||'#328bff'}"></div></div></div>`;}
  function renderAnalytics(){
    const root=document.getElementById('analyticsPeriod');if(!root)return;
    const coachSelect=document.getElementById('analyticsCoach'),old=coachSelect.value;
    coachSelect.innerHTML='<option value="">Semua Coach</option>'+coachRoster.map(c=>`<option value="${aEsc(c.name)}">${aEsc(c.name)}</option>`).join('');coachSelect.value=old;
    const coach=coachSelect.value,today=todayISO();let from=today.slice(0,8)+'01',to=today;
    if(root.value==='custom'){from=document.getElementById('analyticsFrom').value||from;to=document.getElementById('analyticsTo').value||today;if(from>to){const t=from;from=to;to=t;}}
    document.getElementById('analyticsFrom').style.display=root.value==='custom'?'inline-block':'none';document.getElementById('analyticsTo').style.display=root.value==='custom'?'inline-block':'none';
    const historyMap=new Map();[...archivedClients,...clients].forEach(c=>{if(c&&c.id!=null)historyMap.set(String(c.id),c)});const history=[...historyMap.values()];
    const selected=history.filter(c=>{const d=String(c.joinDate||'').slice(0,10);return(!coach||c.coach===coach)&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&d>=from&&d<=to;});
    const months=[];let [yy,mm]=from.slice(0,7).split('-').map(Number),[ey,em]=to.slice(0,7).split('-').map(Number);while(yy<ey||(yy===ey&&mm<=em)){months.push({key:yy+'-'+String(mm).padStart(2,'0'),label:new Date(yy,mm-1,1).toLocaleDateString('id-ID',{month:'short',year:'2-digit'})});if(++mm>12){mm=1;yy++;}}
    const revenues=months.map(m=>selected.filter(c=>c.joinDate.slice(0,7)===m.key).reduce((s,c)=>s+(Number(c.price)||0),0)),counts=months.map(m=>selected.filter(c=>c.joinDate.slice(0,7)===m.key).length),sum=revenues.reduce((a,b)=>a+b,0);
    document.getElementById('analyticsRevenueTotal').textContent=aMoney(sum);document.getElementById('analyticsClientTotal').textContent=selected.length+' pendaftaran';
    document.getElementById('revenueChart').innerHTML=sum?aSvg(revenues,months.map(m=>m.label),'line')+'<p class="mini-note">Pendapatan per bulan dalam rentang yang dipilih.</p>':'<div class="analytics-empty">Belum ada pendapatan pada rentang ini.</div>';
    document.getElementById('growthChart').innerHTML=selected.length?aSvg(counts,months.map(m=>m.label),'bar')+'<p class="mini-note">Pendaftaran baru per bulan dalam rentang yang dipilih.</p>':'<div class="analytics-empty">Belum ada pendaftaran pada rentang ini.</div>';
    const cats=[...new Set(programCatalog.map(p=>p.category).filter(Boolean))],groups=cats.map(cat=>{const ids=new Set(programCatalog.filter(p=>p.category===cat).map(p=>p.id));return{label:cat,value:selected.filter(c=>ids.has(c.programId)).reduce((s,c)=>s+(Number(c.price)||0),0)}});const known=new Set(programCatalog.map(p=>p.id)),other=selected.filter(c=>!known.has(c.programId)).reduce((s,c)=>s+(Number(c.price)||0),0);if(other)groups.push({label:'Lainnya',value:other});const positive=groups.filter(g=>g.value>0);let cumulative=0;const gradient=positive.map((g,i)=>{let st=cumulative/sum*100;cumulative+=g.value;return`${ANALYTICS_COLORS[i%ANALYTICS_COLORS.length]} ${st}% ${cumulative/sum*100}%`}).join(',');
    document.getElementById('analyticsPrograms').innerHTML=sum?`<div class="donut-layout"><div class="donut-graphic" style="background:conic-gradient(${gradient})"><div class="donut-hole">${aShort(sum)}<small>Total pendapatan</small></div></div><div class="donut-legend">${positive.map((g,i)=>`<div><span><i class="legend-dot" style="background:${ANALYTICS_COLORS[i%ANALYTICS_COLORS.length]}"></i>${aEsc(g.label)}</span><strong>${(g.value/sum*100).toFixed(1)}%</strong></div>`).join('')}</div></div>`:'<div class="analytics-empty">Belum ada pendapatan pada rentang ini.</div>';
    const coaches=(coach?coachRoster.filter(c=>c.name===coach):coachRoster).map(c=>({name:c.name,count:selected.filter(x=>x.coach===c.name).length})).sort((a,b)=>b.count-a.count),maxCoach=Math.max(1,...coaches.map(c=>c.count));document.getElementById('analyticsCoaches').innerHTML=coaches.length?`<div class="analytics-progress">${coaches.map((c,i)=>aProgress(c.name,c.count,maxCoach,c.count+' klien',ANALYTICS_COLORS[i%ANALYTICS_COLORS.length])).join('')}</div>`:'<div class="analytics-empty">Belum ada coach terdaftar.</div>';
    const commission=selected.reduce((s,c)=>s+clientCommissionAmount(c),0),periodExpenses=expenses.filter(e=>e.date&&e.date>=from&&e.date<=to),exp=coach?null:periodExpenses.reduce((s,e)=>s+(Number(e.amount)||0),0),net=coach?null:sum-commission-exp;
    document.getElementById('analyticsFinance').innerHTML=`<div class="analytics-progress">${aProgress('Pendapatan',sum,Math.max(sum,commission,exp||0,1),aMoney(sum),'var(--chart-fill)')}${aProgress('Komisi final coach',commission,Math.max(sum,commission,exp||0,1),aMoney(commission),'#7869ff')}${coach?'<p class="mini-note">Pengeluaran umum dan laba bersih hanya ditampilkan pada filter Semua Coach agar tidak salah dialokasikan.</p>':aProgress('Pengeluaran lainnya',exp,Math.max(sum,commission,exp||0,1),aMoney(exp),'#f5b957')+`<div class="analytics-kpi"><small>Estimasi laba bersih periode ini</small><strong>${aMoney(net)}</strong></div>`}</div>`;
    const allSelected=clients.filter(c=>!coach||c.coach===coach),active=allSelected.filter(c=>clientStatus(c)==='Aktif').length,ending=allSelected.filter(c=>clientStatus(c)==='Akan Berakhir').length,total=allSelected.length,open=tickets.filter(t=>t.status!=='Selesai').length,done=tickets.filter(t=>t.status==='Selesai').length;
    document.getElementById('analyticsOperations').innerHTML=`<div class="analytics-progress">${aProgress('Klien aktif',active,total,active+' / '+total,'#3ed3a0')}${aProgress('Program akan berakhir',ending,total,ending+' klien','#f5b957')}${aProgress('Tiket selesai',done,open+done,done+' / '+(open+done),'#328bff')}${aProgress('Pesan menunggu balasan',waitingReplyCount(),Math.max(1,clients.length),waitingReplyCount()+' pesan','#a389ff')}</div><p class="mini-note">Operasional menggunakan kondisi terkini dashboard.</p>`;
    if(typeof window.renderBusinessHealth==='function')window.renderBusinessHealth({sum,newClients:selected.length,commission,active,ending,open,waiting:waitingReplyCount(),coach});
  }
  window.n6RefreshAnalytics=renderAnalytics;
  document.getElementById('analyticsPeriod').addEventListener('change',()=>{if(document.getElementById('analyticsPeriod').value==='custom'){const t=todayISO(),d=new Date(),f=new Date(d.getFullYear(),d.getMonth(),1);document.getElementById('analyticsFrom').value=document.getElementById('analyticsFrom').value||f.toISOString().slice(0,10);document.getElementById('analyticsTo').value=document.getElementById('analyticsTo').value||t;}renderAnalytics();});
  document.getElementById('analyticsFrom').addEventListener('change',renderAnalytics);document.getElementById('analyticsTo').addEventListener('change',renderAnalytics);
  document.getElementById('analyticsCoach').addEventListener('change',renderAnalytics);
  document.getElementById('analyticsExport').addEventListener('click',()=>{const mode=document.getElementById('analyticsPeriod').value,today=todayISO();let from=mode==='current'?today.slice(0,8)+'01':document.getElementById('analyticsFrom').value,to=mode==='current'?today:document.getElementById('analyticsTo').value;if(!from||!to){showToast('Tentukan rentang tanggal terlebih dahulu');return;}if(from>to){const t=from;from=to;to=t;}const coach=document.getElementById('analyticsCoach').value,history=new Map();[...archivedClients,...clients].forEach(c=>{if(c&&c.id!=null)history.set(String(c.id),c)});const rows=[['Tanggal','Bulan','Coach','Pendaftaran','Pendapatan','Estimasi Komisi']];[...history.values()].filter(c=>(!coach||c.coach===coach)&&c.joinDate>=from&&c.joinDate<=to).forEach(c=>rows.push([c.joinDate,c.joinDate.slice(0,7),coach||c.coach||'—',1,Number(c.price)||0,clientCommissionAmount(c)]));const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));link.download='number-six-analytics.csv';link.click();URL.revokeObjectURL(link.href);});
  const originalRenderBeranda=renderBeranda;renderBeranda=function(){originalRenderBeranda();renderAnalytics();};

  // Refresh from Admin CS after edits in another tab; never replace Owner client data.
  async function refreshSharedCoachSchedule(){
    const read = (key,fallback) => {try{const raw=localStorage.getItem(N6_ADMIN_PREFIX+key);return raw===null?fallback:JSON.parse(raw)}catch(e){return fallback}};
    const newRoster=read('coachRoster',coachRoster),newSchedule=read('coachSchedule',coachSchedule),newOff=read('coachDayOff',coachDayOff);
    if(Array.isArray(newRoster))coachRoster=newRoster;
    if(newSchedule && typeof newSchedule==='object' && !Array.isArray(newSchedule))coachSchedule=newSchedule;
    if(newOff && typeof newOff==='object' && !Array.isArray(newOff))coachDayOff=newOff;
    populateCoachFilters();populateFormSelects();renderAll();
    const status=document.getElementById('n6SyncStatus');
    if(status)status.textContent='Terakhir diperbarui: '+new Date().toLocaleTimeString('id-ID')+' · '+coachRoster.length+' coach · sinkronisasi satu browser & alamat situs.';
  }
  document.getElementById('n6SyncRefresh')?.addEventListener('click',refreshSharedCoachSchedule);
  window.addEventListener('storage',e=>{if(e.key && N6_SHARED_COACH_KEYS.has(e.key.slice(N6_ADMIN_PREFIX.length)) && e.key.startsWith(N6_ADMIN_PREFIX))refreshSharedCoachSchedule();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSharedCoachSchedule();});
  /* ================= INIT ================= */
  document.getElementById('btnDownloadCoachSchedule').addEventListener('click', async ()=>{
    const btn=document.getElementById('btnDownloadCoachSchedule');
    const coachId=document.getElementById('shareScheduleCoach').value;
    if(!coachId){showToast('Pilih coach terlebih dahulu');return;}
    btn.disabled=true;
    try{await downloadCoachScheduleImage(coachId,document.getElementById('shareScheduleStart').value);}
    catch(err){console.error('Gagal mengunduh jadwal:',err);showToast('Gagal membuat JPG jadwal. Silakan coba lagi.');}
    finally{btn.disabled=false;}
  });
  document.getElementById('shareScheduleStart').value=todayISO();
  (async function init(){
    await loadAllData();
    await refreshSharedCoachSchedule();
    populateCoachFilters();
    populateFormSelects();
    renderAll();
    if (pendingArchiveNotice > 0){
      showToast(pendingArchiveNotice + ' klien nonaktif >10 hari otomatis dipindah ke Arsip');
    }
  })();
})();
