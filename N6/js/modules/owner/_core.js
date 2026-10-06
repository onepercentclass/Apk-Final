/**
 * N6 modules - owner / _core
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__

  /* ================= KATALOG PROGRAM (default — bisa diubah lewat storage 'programCatalog') ================= */
/*__N6_UNIT__*/  const DEFAULT_PROGRAM_CATALOG = [
    { id:'run-start', label:'Run-Start', category:'Online', mode:'fixed', unit:'3 Bulan', price:334000, komisiPerSesi:0 },
    { id:'privat-online', label:'Private Online', category:'Online', mode:'fixed', unit:'1 Bulan', price:800000, komisiPerSesi:0 },
    { id:'single-session', label:'Single Session Training', category:'Offline', mode:'fixed', unit:'1x Pertemuan', price:170000, komisiPerSesi:80000 },
    { id:'running-class', label:'Running Class (5–20 orang)', category:'Offline', mode:'configurable', unit:'per orang', ratePerSesi:65000, defaultMeetings:2, defaultWeeks:4, komisiPerSesi:0 },
    { id:'semi-private', label:'Semi Private (2 orang)', category:'Offline', mode:'configurable', unit:'per paket', ratePerSesi:190000, defaultMeetings:2, defaultWeeks:4, komisiPerSesi:0 },
    { id:'private-offline', label:'Private Offline', category:'Offline', mode:'configurable', unit:'per paket', ratePerSesi:150000, defaultMeetings:2, defaultWeeks:4, komisiPerSesi:0 },
    { id:'korporat', label:'Kerja Sama Korporat (Karyawan)', category:'Kerja Sama', mode:'custom', komisiPerSesi:0 },
    { id:'event-pacer', label:'Kerja Sama Event (Pacer)', category:'Kerja Sama', mode:'custom', komisiPerSesi:0 }
  ];
/*__N6_UNIT__*/  const DEFAULT_COACH_ROSTER = [];
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
/*__N6_UNIT__*/  function todayDayName(){
    const jsDay = new Date().getDay(); // 0=Minggu
    const idx = jsDay === 0 ? 6 : jsDay - 1;
    return DAYS[idx];
  }

  // Coach schedule is shared with Admin CS on the SAME browser origin.
  // Other Owner records stay in the Owner namespace; never overwrite Admin client records.
/*__N6_UNIT__*/  const N6_SHARED_COACH_KEYS = new Set(['coachSchedule','coachDayOff']); // coachRoster dihapus, diambil dari Kelola Anggota via API
/*__N6_UNIT__*/  const N6_ADMIN_PREFIX = 'n6csAdmin:';
/*__N6_UNIT__*/  const N6_OWNER_PREFIX = 'n6Owner:';
  // Key yang didukung API — data ini lintas role via backend.
/*__N6_UNIT__*/  const N6_API_KEYS = new Set(['clients','tickets','messages']);
/*__N6_UNIT__*/  async function storeGet(key){
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
/*__N6_UNIT__*/  async function storeSet(key,value){
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
/*__N6_UNIT__*/  let expenses = [];
/*__N6_UNIT__*/  let activeChatClientId = null;
/*__N6_UNIT__*/  let activeSlot = null; // { coachId, day, blockKey }
/*__N6_UNIT__*/  let pendingArchiveNotice = 0;

/*__N6_UNIT__*/  function catalogById(id){ return programCatalog.find(p => p.id === id); }
/*__N6_UNIT__*/  function coachById(id){ return coachRoster.find(c => String(c.id) === String(id)); }

/*__N6_UNIT__*/  function seedDemoIfEmpty(){
    // Data dummy dinonaktifkan — dashboard selalu mulai kosong, tanpa klien contoh.
    return false;
  }

/*__N6_UNIT__*/  async function fetchCoachesFromApi(){
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
/*__N6_UNIT__*/  async function loadAllData(){
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

/*__N6_UNIT__*/  async function persistClients(){ await storeSet('clients', JSON.stringify(clients)); }
/*__N6_UNIT__*/  async function persistTickets(){ await storeSet('tickets', JSON.stringify(tickets)); }
/*__N6_UNIT__*/  async function persistChat(id){ await storeSet('chat:' + id, JSON.stringify(chatCache[id] || [])); }
/*__N6_UNIT__*/  async function persistProgram(id){ await storeSet('program:' + id, JSON.stringify(programCache[id] || {})); }
/*__N6_UNIT__*/  async function persistCoachRoster(){ /* dihapus: coachRoster dari API Kelola Anggota */ }
/*__N6_UNIT__*/  async function persistCoachSchedule(){ await storeSet('coachSchedule', JSON.stringify(coachSchedule)); }
/*__N6_UNIT__*/  async function persistCoachDayOff(){ await storeSet('coachDayOff', JSON.stringify(coachDayOff)); }
/*__N6_UNIT__*/  async function persistExpenses(){ await storeSet('expenses', JSON.stringify(expenses)); }
/*__N6_UNIT__*/  async function persistCatalog(){ await storeSet('programCatalog', JSON.stringify(programCatalog)); }
/*__N6_UNIT__*/  function clientSessionCount(c){
    const meta = c.packageMeta || {};
    if (meta.mode === 'configurable') return Number(meta.totalSessions) || 0;
    if (c.programId === 'single-session') return 1;
    return 0; // program bulanan (Run-Start, Private Online) & kerja sama nego tidak dihitung per sesi
  }
/*__N6_UNIT__*/  function programKomisiPerSesi(programId){
    const p = catalogById(programId);
    return p && p.komisiPerSesi != null ? Number(p.komisiPerSesi) : 0;
  }
/*__N6_UNIT__*/  function clientCommissionAmount(c){
    return clientSessionCount(c) * programKomisiPerSesi(c.programId);
  }
/*__N6_UNIT__*/  function coachRevenue(coachName){
    return clients.filter(c => c.coach === coachName).reduce((sum, c) => sum + (Number(c.price) || 0), 0);
  }
/*__N6_UNIT__*/  function coachSessionCount(coachName){
    return clients.filter(c => c.coach === coachName).reduce((sum, c) => sum + clientSessionCount(c), 0);
  }
/*__N6_UNIT__*/  function coachCommissionAmount(coach){
    return clients.filter(c => c.coach === coach.name).reduce((sum, c) => sum + clientCommissionAmount(c), 0);
  }
/*__N6_UNIT__*/  function totalRevenue(){ return clients.reduce((sum, c) => sum + (Number(c.price) || 0), 0); }
/*__N6_UNIT__*/  function totalCommission(){ return coachRoster.reduce((sum, c) => sum + coachCommissionAmount(c), 0); }
/*__N6_UNIT__*/  function totalExpenses(){ return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0); }
/*__N6_UNIT__*/  function netProfit(){ return totalRevenue() - totalCommission() - totalExpenses(); }

  /* ================= DERIVED HELPERS ================= */
