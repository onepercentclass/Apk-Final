/**
 * N6 modules - admin / _core
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
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
      } catch(e){ if(window.logger) window.logger.caught('admin/_core', 'operasi', e); }
    }
    try{ return localStorage.getItem(STORE_PREFIX + key); }
    catch(e){ return null; }
  }
/*__N6_UNIT__*/  async function storeSet(key, value){
    if (N6_API_KEYS.has(key) && typeof window !== 'undefined' && window.storage) {
      try { await window.storage.set(key, value, true); } catch(e){ if(window.logger) window.logger.caught('admin/_core', 'operasi', e); }
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

/*__N6_UNIT__*/  function catalogById(id){ return programCatalog.find(p => String(p.id) === String(id)); }
/*__N6_UNIT__*/  function coachById(id){ return coachRoster.find(c => String(c.id) === String(id)); }

  /* ================= LOAD DATA ================= */
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

/*__N6_UNIT__*/  async function loadAllData(){
    // Preserve the exact existing browser records. No demo data and no automatic archiving.
    const read = async (key, fallback) => {
      const raw=await storeGet(key);
      if(raw===null) return fallback;
      try { const parsed=JSON.parse(raw); return parsed!==null?parsed:fallback; }
      catch(err){ console.error('Data rusak pada '+key,err); showToast('Data '+key+' tidak terbaca. Jangan hapus cadangan.'); return fallback; }
    };
    programCatalog=await read('programCatalog',DEFAULT_PROGRAM_CATALOG);
    // coachRoster diambil dari Kelola Anggota (API /accounts?tier=3), bukan localStorage.
    coachRoster = await fetchCoachesFromApi();
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

/*__N6_UNIT__*/  async function persistClients(){ await storeSet('clients', JSON.stringify(clients)); }
/*__N6_UNIT__*/  async function persistTickets(){ await storeSet('tickets', JSON.stringify(tickets)); }
/*__N6_UNIT__*/  async function persistChat(id){ await storeSet('chat:' + id, JSON.stringify(chatCache[id] || [])); }
/*__N6_UNIT__*/  async function persistProgram(id){ await storeSet('program:' + id, JSON.stringify(programCache[id] || {})); }
/*__N6_UNIT__*/  async function persistCoachRoster(){ /* dihapus: coachRoster dari API Kelola Anggota */ }
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
