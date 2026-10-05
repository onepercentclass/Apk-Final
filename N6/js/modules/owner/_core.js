/**
 * N6 modules - owner / _core
 * menu label : shared core / boot / state
 * minimum tier: n/a
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/owner/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/owner.js. Concatenating every fragment in manifest
 * order reproduces owner.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__

  /* ================= KATALOG PROGRAM (default — bisa diubah lewat storage 'programCatalog') ================= */
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
/*__N6_UNIT__*/  const N6_SHARED_COACH_KEYS = new Set(['coachRoster','coachSchedule','coachDayOff']);
/*__N6_UNIT__*/  const N6_ADMIN_PREFIX = 'n6csAdmin:';
/*__N6_UNIT__*/  const N6_OWNER_PREFIX = 'n6Owner:';
/*__N6_UNIT__*/  async function storeGet(key){
    if (N6_SHARED_COACH_KEYS.has(key)) {
      try { const v=localStorage.getItem(N6_ADMIN_PREFIX+key); if(v!==null)return v; } catch(e){}
    }
    try { return localStorage.getItem(N6_OWNER_PREFIX+key); } catch(e){ return null; }
  }
/*__N6_UNIT__*/  async function storeSet(key,value){
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
/*__N6_UNIT__*/  function coachById(id){ return coachRoster.find(c => c.id === id); }

/*__N6_UNIT__*/  function seedDemoIfEmpty(){
    // Data dummy dinonaktifkan — dashboard selalu mulai kosong, tanpa klien contoh.
    return false;
  }

  /* ================= LOAD DATA ================= */
/*__N6_UNIT__*/  async function persistClients(){ await storeSet('clients', JSON.stringify(clients)); }
/*__N6_UNIT__*/  async function persistTickets(){ await storeSet('tickets', JSON.stringify(tickets)); }
/*__N6_UNIT__*/  async function persistChat(id){ await storeSet('chat:' + id, JSON.stringify(chatCache[id] || [])); }
/*__N6_UNIT__*/  async function persistProgram(id){ await storeSet('program:' + id, JSON.stringify(programCache[id] || {})); }
/*__N6_UNIT__*/  async function persistCoachRoster(){ await storeSet('coachRoster', JSON.stringify(coachRoster)); }
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
/*__N6_UNIT__*/  function programSinglePrice(p){
    if (p.price != null) return Number(p.price) || 0;
    if (p.mode === 'configurable') return (Number(p.ratePerSesi)||0) * (Number(p.defaultMeetings)||2) * (Number(p.defaultWeeks)||4);
    return 0;
  }
/*__N6_UNIT__*/  function togglePfFields(){
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
/*__N6_UNIT__*/  let teamPayments = {};
/*__N6_UNIT__*/  let teamMonth = todayISO().slice(0,7);
/*__N6_UNIT__*/  function teamRoster(){
    const result=[...coachRoster];
    clients.forEach(c=>{if(c.coach&&!result.some(r=>r.name.toLowerCase()===c.coach.toLowerCase()))result.push({id:'client-coach-'+c.coach,name:c.coach});});
    return result;
  }
/*__N6_UNIT__*/  function teamClients(month, coachName){
    const last=month+'-'+String(new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate()).padStart(2,'0');
    return clients.filter(c=>String(c.coach||'').trim().toLowerCase()===String(coachName).trim().toLowerCase() &&
      c.status!=='Selesai' && clientStatus(c)!=='Nonaktif' &&
      (c.joinDate||c.createdAt||'0000-00-00').slice(0,10)<=last &&
      (!(programCache[c.id]||{}).endDate||(programCache[c.id]||{}).endDate>=month+'-01'));
  }
/*__N6_UNIT__*/  function teamKey(month,coach){return month+'|'+coach.id;}
  // Gunakan slot yang benar-benar tersimpan pada halaman Jadwal Coach.
  // Perhitungan dibatasi tanggal aktif klien dan hari libur coach.
/*__N6_UNIT__*/  function teamScheduledSessions(month,coach,entries){return teamScheduleBreakdown(month,coach,entries).total;}
/*__N6_UNIT__*/  function teamCommissionRows(month,coach,entries,breakdown){
    return entries.map(c=>{
      const program=catalogById(c.programId);
      const rate=Math.max(0,Number(program?.komisiPerSesi)||0);
      const sessions=breakdown.counts[String(c.id)]||0;
      // Komisi periode mengikuti jadwal bulan tersebut dan tarif Harga & Program.
      return {client:c,program,rate,sessions,amount:rate*sessions};
    });
  }
/*__N6_UNIT__*/  function teamSnapshot(month,coach){
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
/*__N6_UNIT__*/  let finFilterMode = 'all'; // 'all' = bulan ini | 'month' = custom bulan
/*__N6_UNIT__*/  let finSelectedMonth = todayISO().slice(0,7); // 'YYYY-MM'
/*__N6_UNIT__*/  const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

/*__N6_UNIT__*/  function financeRangeStart(){ return (finFilterMode === 'month' ? finSelectedMonth : todayISO().slice(0,7)) + '-01'; }
/*__N6_UNIT__*/  function financeRangeEnd(){ const selected=finFilterMode==='month'?finSelectedMonth:todayISO().slice(0,7); const [y,m]=selected.split('-').map(Number); return selected+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0'); }
/*__N6_UNIT__*/  function inFinanceRange(dateStr){ return !!dateStr && dateStr >= financeRangeStart() && dateStr <= financeRangeEnd(); }
/*__N6_UNIT__*/  function financeFilteredClients(){ return clients.filter(c => inFinanceRange(c.joinDate)); }
/*__N6_UNIT__*/  function financeRevenue(){ return financeFilteredClients().reduce((s,c) => s + (Number(c.price)||0), 0); }
  // Gunakan sumber perhitungan yang sama dengan halaman Komisi Coach:
  // sesi terjadwal pada bulan bersangkutan × nominal komisi per sesi.
  // Pembayaran yang telah dikonfirmasi memakai snapshot nominal terkunci.
/*__N6_UNIT__*/  function financeCommissionRows(){
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
/*__N6_UNIT__*/  function financeCommission(){
    return financeCommissionRows().reduce((sum, row) => sum + row.amount, 0);
  }
/*__N6_UNIT__*/  function financePeriodLabel(){
    const selected = finFilterMode === 'month' ? finSelectedMonth : todayISO().slice(0,7);
    const [y,m] = selected.split('-').map(Number);
    return 'Menampilkan laporan bulan ' + BULAN_ID[m-1] + ' ' + y + '.';
  }

/*__N6_UNIT__*/  function renderPerforma(){ /* Digabung ke renderKomisi */ }

  /* ================= RENDER: TIKET ================= */
/*__N6_UNIT__*/  let ticketFilter = 'semua';
/*__N6_UNIT__*/  let autoIssueMap = {};
/*__N6_UNIT__*/  let deletedAutoTickets = [];
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
/*__N6_UNIT__*/  const LOGO_DATA = "assets/img/logo-report.png";
/*__N6_UNIT__*/  function nowPrintLabel(){const d=new Date();return {tanggal:d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),jam:d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})};}
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
/*__N6_UNIT__*/  function switchPanel(name){
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

/*__N6_UNIT__*/  const sidebarEl = document.getElementById('sidebar');
/*__N6_UNIT__*/  const sidebarOverlay = document.getElementById('sidebarOverlay');
/*__N6_UNIT__*/  function openSidebar(){ sidebarEl.classList.add('open'); sidebarOverlay.classList.add('show'); document.getElementById('mobileMoreBtn').setAttribute('aria-expanded','true'); }
/*__N6_UNIT__*/  const ANALYTICS_COLORS=['var(--accent)','#6656ee','#3ed3a0','#f5b957','#df79cb','#6fc8ed','#97a4ff'];
/*__N6_UNIT__*/  const aMoney=n=>'Rp'+Math.round(n||0).toLocaleString('id-ID');
/*__N6_UNIT__*/  const aShort=n=>Math.abs(n)>=1e9?(n/1e9).toFixed(1)+'M':Math.abs(n)>=1e6?(n/1e6).toFixed(1)+'jt':Math.abs(n)>=1e3?(n/1e3).toFixed(0)+'rb':String(Math.round(n));
/*__N6_UNIT__*/  const aEsc=s=>escapeHtml(String(s??''));
/*__N6_UNIT__*/  function aMonths(n){const d=new Date(),out=[];for(let i=n-1;i>=0;i--){const x=new Date(d.getFullYear(),d.getMonth()-i,1);out.push({key:x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0'),label:x.toLocaleDateString('id-ID',{month:'short',year:'2-digit'})});}return out;}
/*__N6_UNIT__*/  function aProgress(label,value,max,detail,color){const pct=max?Math.max(0,Math.min(100,value/max*100)):0;return `<div><div class="progress-line"><span>${aEsc(label)}</span><strong>${aEsc(detail)}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${color||'#328bff'}"></div></div></div>`;}
