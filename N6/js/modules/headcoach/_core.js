/**
 * N6 modules - headcoach / _core
 * menu label : shared core / boot / state
 * minimum tier: n/a
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/headcoach/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/headcoach.js. Concatenating every fragment in manifest
 * order reproduces headcoach.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__

  /* ================= MOCK DATA ================= */
/*__N6_UNIT__*/  const coaches = [
    { id:'c1', name:"Rangga Saputra", clients:5, kehadiran:96, score:92, rating:4.8 },
    { id:'c2', name:"Dinda Ayu", clients:2, kehadiran:91, score:85, rating:4.6 },
    { id:'c3', name:"Fajar Nugroho", clients:1, kehadiran:78, score:68, rating:4.1 },
  ];

/*__N6_UNIT__*/  function slugify(name){ return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
/*__N6_UNIT__*/  function clientPortalUrl(name, staff){
    return 'dashboard-client.html?client=' + encodeURIComponent(slugify(name)) + (staff ? '&staff=1' : '');
  }

/*__N6_UNIT__*/  const clients = [
    { name:"Budi Hartono", coach:"Rangga Saputra", goal:"10K", status:"Normal" },
    { name:"Andi Prasetyo", coach:"Rangga Saputra", goal:"Turun Berat Badan", status:"Cedera", note:"Keluhan lutut sejak 5 Sep 2026, sudah dirujuk istirahat sementara." },
    { name:"Rina Marlina", coach:"Rangga Saputra", goal:"Half Marathon", status:"Normal" },
    { name:"Yoga Pratama", coach:"Rangga Saputra", goal:"5K", status:"Normal" },
    { name:"Citra Ayu", coach:"Rangga Saputra", goal:"Full Marathon", status:"Bermasalah", note:"2x absen tanpa keterangan bulan ini." },
    { name:"Sari Wijaya", coach:"Dinda Ayu", goal:"Half Marathon", status:"Normal" },
    { name:"Reza Firmansyah", coach:"Dinda Ayu", goal:"Full Marathon", status:"Normal" },
    { name:"Maya Putri", coach:"Fajar Nugroho", goal:"5K", status:"Bermasalah", note:"Belum aktif sejak mendaftar 2 minggu lalu." },
  ];

/*__N6_UNIT__*/  const chartData = {
    coachLabels: coaches.map(c => c.name.split(' ')[0]),
    scoreCoach: coaches.map(c => c.score),
    ratingCoach: coaches.map(c => c.rating),
    bulanLabel: ["Apr","Mei","Jun","Jul","Agu","Sep"],
    kehadiranTren: [90,91,89,93,92,92],
    statusKlien: { normal:5, bermasalah:2, cedera:1 }
  };

/*__N6_UNIT__*/  let teamActivityList = [
    { date:"10 Sep 2026", text:"Rangga Saputra menyelesaikan sesi dengan Budi Hartono." },
    { date:"09 Sep 2026", text:"Rangga Saputra mengajukan reschedule sesi Rina Marlina." },
    { date:"08 Sep 2026", text:"Fajar Nugroho tercatat terlambat pada sesi pagi." },
    { date:"05 Sep 2026", text:"Dinda Ayu mengajukan cuti 1 hari." },
    { date:"02 Sep 2026", text:"Andi Prasetyo (klien Rangga Saputra) dilaporkan mengalami cedera lutut." },
  ];

/*__N6_UNIT__*/  let rescheduleRequests = [
    { coach:"Rangga Saputra", sesi:"Rina Marlina — 16:00, 12 Sep 2026", baru:"13 Sep 2026, 17:00", alasan:"Klien ada acara mendadak", status:"Menunggu" },
    { coach:"Dinda Ayu", sesi:"Sari Wijaya — 16:00, 11 Sep 2026", baru:"12 Sep 2026, 16:00", alasan:"Hujan deras", status:"Menunggu" },
    { coach:"Rangga Saputra", sesi:"Yoga Pratama — 18:00, 10 Sep 2026", baru:"11 Sep 2026, 18:00", alasan:"Hujan deras", status:"Disetujui" },
  ];

/*__N6_UNIT__*/  let cutiRequests = [
    { coach:"Dinda Ayu", mulai:"20 Sep 2026", selesai:"21 Sep 2026", alasan:"Acara keluarga", status:"Menunggu" },
    { coach:"Rangga Saputra", mulai:"5 Agu 2026", selesai:"5 Agu 2026", alasan:"Sakit", status:"Disetujui" },
  ];

/*__N6_UNIT__*/  let evalHistory = [
    { coach:"Rangga Saputra", tanggal:"1 Sep 2026", score:92, komentar:"Konsisten dan komunikatif dengan klien." },
    { coach:"Dinda Ayu", tanggal:"1 Sep 2026", score:85, komentar:"Baik, perlu tingkatkan variasi program latihan." },
    { coach:"Fajar Nugroho", tanggal:"1 Sep 2026", score:68, komentar:"Kehadiran menurun bulan ini, perlu pembinaan lebih lanjut." },
  ];

/*__N6_UNIT__*/  let teamAttendance = [
    { coach:"Rangga Saputra", tanggal:"10 Sep 2026", status:"Tepat Waktu" },
    { coach:"Dinda Ayu", tanggal:"10 Sep 2026", status:"Tepat Waktu" },
    { coach:"Fajar Nugroho", tanggal:"10 Sep 2026", status:"Terlambat" },
    { coach:"Rangga Saputra", tanggal:"09 Sep 2026", status:"Tepat Waktu" },
    { coach:"Dinda Ayu", tanggal:"09 Sep 2026", status:"Tepat Waktu" },
    { coach:"Fajar Nugroho", tanggal:"08 Sep 2026", status:"Terlambat" },
    { coach:"Rangga Saputra", tanggal:"08 Sep 2026", status:"Tepat Waktu" },
  ];

  /* ---------- TEMPLATE KATA KOREKSI (kolom keterangan cepat) ---------- */
/*__N6_UNIT__*/  let koreksiTemplates = [
    { code:'1', label:'Bagus & Perlu Ditingkatkan', text:'Latihan hari ini sudah bagus dan menunjukkan progres yang baik. Namun tetap ada beberapa bagian teknik dan pace yang masih perlu ditingkatkan lagi ke depannya — pertahankan konsistensinya, ya!' },
    { code:'2', label:'Kualitas Kurang Baik', text:'Kualitas latihan hari ini masih kurang baik untuk hari ini dan perlu dievaluasi lebih lanjut. Mohon perhatikan kembali instruksi program yang sudah diberikan, dan segera hubungi coach apabila ada kendala saat latihan.' },
    { code:'3', label:'Sangat Baik', text:'Latihan hari ini sangat baik! Pace, durasi, dan konsistensi sudah sesuai target program. Pertahankan ritme dan semangat ini untuk sesi-sesi berikutnya.' },
    { code:'4', label:'Perlu Istirahat', text:'Terlihat ada tanda kelelahan pada hasil latihan hari ini. Disarankan mengambil waktu istirahat yang cukup sebelum melanjutkan sesi berikutnya agar terhindar dari risiko cedera.' },
  ];

  /* ---------- TEMPLATE PROGRAM LARI (untuk Program Builder) ---------- */
/*__N6_UNIT__*/  let programTemplates = [
    { label:'Program Pemula 5K (8 Minggu)', text:'Program latihan bertahap selama 8 minggu untuk pelari pemula dengan target menyelesaikan 5K dengan nyaman. Fokus pada pembentukan kebiasaan lari, kombinasi jalan-lari, dan penguatan otot dasar.' },
    { label:'Program 10K Peningkatan Pace', text:'Program 8–10 minggu untuk pelari yang sudah terbiasa 5K dan ingin meningkatkan jarak ke 10K sekaligus memperbaiki pace rata-rata. Termasuk sesi interval dan tempo run mingguan.' },
    { label:'Program Half Marathon (Persiapan)', text:'Program persiapan half marathon (21K) selama 12 minggu, terdiri dari long run mingguan bertahap, latihan kekuatan, dan pengaturan strategi pace untuk race day.' },
    { label:'Program Full Marathon (Persiapan)', text:'Program persiapan full marathon (42K) selama 16 minggu dengan progresi jarak long run, sesi recovery terjadwal, dan simulasi race day menjelang hari-H.' },
    { label:'Program Penurunan Berat Badan', text:'Program kombinasi lari dan latihan kardio ringan yang difokuskan pada pembakaran kalori secara konsisten dan aman, disesuaikan dengan kondisi fisik dan target klien.' },
  ];

/*__N6_UNIT__*/  let sentPrograms = [];
/*__N6_UNIT__*/  let selectedProgramTplIndex = null;

  /* ---------- CHAT INTERNAL: HEAD COACH <-> ADMIN / OWNER ---------- */
/*__N6_UNIT__*/  let internalChats = {
    admin: [
      { sender:'admin', text:'Selamat pagi Coach, ada jadwal klien baru yang perlu dikonfirmasi minggu ini.', at:'2026-09-09T08:10:00' }
    ],
    owner: []
  };

  /* ================= HELPERS ================= */
/*__N6_UNIT__*/  function scoreTone(score){ return score >= 85 ? 'green' : score >= 70 ? 'amber' : 'red'; }
/*__N6_UNIT__*/  function statusTone(status){
    if (status === 'Normal') return 'green';
    if (status === 'Bermasalah') return 'amber';
    if (status === 'Cedera') return 'red';
    if (status === 'Tepat Waktu') return 'green';
    if (status === 'Terlambat') return 'amber';
    if (status === 'Latihan Sedang Berjalan') return 'blue';
    if (status === 'Disetujui') return 'green';
    if (status === 'Ditolak') return 'red';
    return 'neutral';
  }
/*__N6_UNIT__*/  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  window.showToast = showToast;
/*__N6_UNIT__*/  function escapeHtmlHC(str){
    return String(str == null ? '' : str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  /* ================= RENDER: HOME ================= */
/*__N6_UNIT__*/  const CHART_RED = '#D62828', CHART_INK = '#111110', CHART_ASPHALT = '#6E6C64',
        CHART_GREEN = '#1E8E3E', CHART_AMBER = '#B7791F', CHART_GRID = '#F0EEE7';

/*__N6_UNIT__*/  let chartModalInstance = null;
  window.openChartModal = function(key, title){
    document.getElementById('chartModalTitle').textContent = title;
    document.getElementById('chartModal').classList.add('show');
    if (chartModalInstance){ chartModalInstance.destroy(); chartModalInstance = null; }
    chartModalInstance = new Chart(document.getElementById('chartModalCanvas'), buildChartConfig(key));
  };
  window.closeChartModal = function(){
    document.getElementById('chartModal').classList.remove('show');
    if (chartModalInstance){ chartModalInstance.destroy(); chartModalInstance = null; }
  };

  /* ================= RENDER: COACH LIST + DETAIL ================= */
/*__N6_UNIT__*/  const COACH_COLORS = { "Rangga Saputra": "#D62828", "Dinda Ayu": "#2563AE", "Fajar Nugroho": "#B7791F" };

/*__N6_UNIT__*/  function getTeamSessionsForDate(date){
    const result = [];
    coaches.forEach(c => {
      getCoachSessionsForDate(c.name, date).forEach(s => result.push({ coach: c.name, ...s }));
    });
    return result;
  }

/*__N6_UNIT__*/  const DOW_LABEL = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
/*__N6_UNIT__*/  const MONTH_LABEL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
/*__N6_UNIT__*/  let selectedTeamCalDate = null;

/*__N6_UNIT__*/  function fmtCalDate(d){ return d.getDate() + ' ' + MONTH_LABEL[d.getMonth()] + ' ' + d.getFullYear(); }
/*__N6_UNIT__*/  function sameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

/*__N6_UNIT__*/  let athletes = [];   // Tidak ada endpoint — user kelola manual via UI
/*__N6_UNIT__*/  let athleteIdCounter = 1;

/*__N6_UNIT__*/  let achievementIdCounter = 6;

/*__N6_UNIT__*/  function posisiTone(posisi){
    if (posisi === 'Juara 1') return 'green';
    if (posisi === 'Juara 2') return 'blue';
    if (posisi === 'Juara 3') return 'amber';
    if (posisi === 'DNF') return 'red';
    return 'neutral';
  }

/*__N6_UNIT__*/  function populateAthleteCoachSelect(){
    document.getElementById('athCoach').innerHTML = '<option value="">Coach pembina</option>' +
      coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

/*__N6_UNIT__*/  function fmtAchvDate(tanggal){
    if (!tanggal) return '-';
    const [y,m,d] = tanggal.split('-');
    return parseInt(d,10) + ' ' + MONTH_LABEL[parseInt(m,10)-1] + ' ' + y;
  }

/*__N6_UNIT__*/  const DAY_NAMES = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

/*__N6_UNIT__*/  const FIRST_NAMES = ["Budi","Andi","Rina","Yoga","Citra","Sari","Reza","Maya","Dewi","Bayu","Nadia","Rizky","Agus","Wulan","Doni","Fitri","Hendra","Sinta","Galih","Putri","Indra","Lina","Tia","Dian","Yudi","Rara","Fajar","Wahyu"];
/*__N6_UNIT__*/  const LAST_NAMES = ["Hartono","Prasetyo","Marlina","Pratama","Ayu","Wijaya","Firmansyah","Putri","Lestari","Setiawan","Ramadhan","Salim","Kurniawan","Handayani","Gunawan","Dewi","Permana","Kusuma","Anggraini","Puspita","Santoso","Kirana"];
/*__N6_UNIT__*/  const LOCATIONS = ["GBK Senayan","Online","Lapangan A. Yani","Taman Menteng","Online","Stadion Madya","Online"];

/*__N6_UNIT__*/  function generateSubmissions(){
    const list = [];
    let id = 0;
    FIRST_NAMES.forEach((fn, i) => {
      const name = fn + ' ' + LAST_NAMES[i % LAST_NAMES.length];
      const coach = coaches[i % coaches.length].name;
      const loc = LOCATIONS[i % LOCATIONS.length];
      const dayIndex = i % 7;
      const reviewed = (i % 3 === 0);
      list.push({
        id: id++,
        client: name,
        clientId: slugify(name),
        coach: coach,
        loc: loc,
        dayIndex: dayIndex,
        link: 'https://strava.com/activities/' + (800000 + i * 137),
        reviewed: reviewed,
        koreksi: reviewed ? 'Bagus, pertahankan konsistensi pace-nya!' : ''
      });
    });
    return list;
  }
/*__N6_UNIT__*/  let submissions = generateSubmissions();

/*__N6_UNIT__*/  function getMonday(d){
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0,0,0,0);
    return date;
  }
/*__N6_UNIT__*/  const koreksiMonday = getMonday(new Date());
/*__N6_UNIT__*/  const koreksiWeekDates = [];
  for (let i=0;i<7;i++){ const d = new Date(koreksiMonday); d.setDate(d.getDate()+i); koreksiWeekDates.push(d); }
/*__N6_UNIT__*/  const todayIndex = (new Date().getDay() + 6) % 7;
/*__N6_UNIT__*/  let selectedDayIndex = todayIndex;

/*__N6_UNIT__*/  function renderProgramTplPickList(){
    const body = document.getElementById('programTplPickList');
    if (!body) return;
    if (!programTemplates.length){
      body.innerHTML = '<div class="cal-empty">Belum ada template program. Tambahkan lewat tab "Kelola Template Program".</div>';
      return;
    }
    body.innerHTML = programTemplates.map((t, i) => `
      <div class="program-tpl-card ${selectedProgramTplIndex === i ? 'selected' : ''}" onclick="pickProgramTpl(${i})">
        <div class="name">${t.label}</div>
        <div class="desc">${t.text}</div>
      </div>
    `).join('');
  }
  window.pickProgramTpl = function(i){
    selectedProgramTplIndex = i;
    const t = programTemplates[i];
    document.getElementById('programNamaTpl').value = t.label;
    document.getElementById('programKeterangan').value = t.text;
    renderProgramTplPickList();
  };

/*__N6_UNIT__*/  function renderProgramTemplateList(){
    const body = document.getElementById('programTemplateList');
    if (!body) return;
    if (!programTemplates.length){ body.innerHTML = '<div class="cal-empty">Belum ada template program.</div>'; return; }
    body.innerHTML = programTemplates.map((t, i) => `
      <div class="tpl-manage-item">
        <div class="tpl-manage-body">
          <div class="lbl">${t.label}</div>
          <div class="txt">${t.text}</div>
        </div>
        <div class="tpl-manage-actions">
          <button class="icon-btn" onclick="openTemplateModal('program', ${i})" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn danger" onclick="deleteTemplate('program', ${i})" title="Hapus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

/*__N6_UNIT__*/  function fmtProgramTime(){
    return new Date().toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }

/*__N6_UNIT__*/  const PROGRAMS_STORAGE_KEY = 'programs:n6-shared';
/*__N6_UNIT__*/  async function syncProgramsToStorage(){
    if (!window.storage) return;
    try{ await window.storage.set(PROGRAMS_STORAGE_KEY, JSON.stringify(sentPrograms), true); }
    catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — data tetap tersimpan lokal */ }
  }
/*__N6_UNIT__*/  async function loadProgramsFromStorage(){
    if (!window.storage) return;
    try{
      const raw = await window.storage.get(PROGRAMS_STORAGE_KEY, true);
      if (raw && raw.value) sentPrograms = JSON.parse(raw.value);
    }catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — memakai data lokal */ }
    renderSentProgramList();
  }

/*__N6_UNIT__*/  function programStatusBadge(status){
    if (status === 'diproses') return '<span class="badge blue">Sedang Diproses Admin</span>';
    if (status === 'terkirim') return '<span class="badge green">Sudah Dikirim ke Klien</span>';
    return '<span class="badge amber">Menunggu Diproses Admin</span>';
  }

/*__N6_UNIT__*/  function renderSentProgramList(){
    const body = document.getElementById('sentProgramList');
    if (!body) return;
    if (!sentPrograms.length){ body.innerHTML = '<div class="cal-empty">Belum ada program yang dikirim ke Admin/CS.</div>'; return; }
    body.innerHTML = sentPrograms.slice().reverse().map(p => `
      <div class="sent-program-item">
        <div class="sent-program-top"><span class="who">${p.client}</span>${programStatusBadge(p.status)}</div>
        <div class="sent-program-name">${p.tplName}</div>
        <div class="sent-program-desc">${p.keterangan}</div>
        <div class="sent-program-when">Dikirim ${p.at}</div>
      </div>
    `).join('');
  }

/*__N6_UNIT__*/  function renderChatThread(role){
    const el = document.getElementById(role === 'admin' ? 'chatThreadAdmin' : 'chatThreadOwner');
    if (!el) return;
    const msgs = internalChats[role] || [];
    if (!msgs.length){
      el.innerHTML = '<div class="chat-empty">Belum ada percakapan dengan ' + (role === 'admin' ? 'Admin' : 'Owner') + '.</div>';
      return;
    }
    el.innerHTML = msgs.map(m => {
      const mine = m.sender === 'headcoach';
      const who = mine ? 'Anda' : (role === 'admin' ? 'Admin' : 'Owner');
      const time = new Date(m.at).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
      return `<div class="chat-bubble-row ${mine ? 'me' : ''}"><div class="chat-bubble">${escapeHtmlHC(m.text)}<span class="meta">${who} · ${time}</span></div></div>`;
    }).join('');
    el.scrollTop = el.scrollHeight;
  }

/*__N6_UNIT__*/  function statusTag(status){ return `<span class="badge ${statusTone(status)}">${status}</span>`; }
  window.setRescheduleStatus = function(i, status){
    rescheduleRequests[i].status = status;
    renderRescheduleApproval();
    showToast('Reschedule ' + rescheduleRequests[i].coach + ' ditandai: ' + status);
  };

/*__N6_UNIT__*/  const navButtons = document.querySelectorAll('[data-panel]');
/*__N6_UNIT__*/  const panels = document.querySelectorAll('.panel');
/*__N6_UNIT__*/  const pageTitle = document.getElementById('pageTitle');
/*__N6_UNIT__*/  const MORE_SHEET_PANELS = ['coach', 'atlet', 'chat', 'akun'];
/*__N6_UNIT__*/  const moreNavBtn = document.getElementById('moreNavBtn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-panel');
      navButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-panel') === target));
      moreNavBtn.classList.toggle('active', MORE_SHEET_PANELS.includes(target));
      panels.forEach(p => p.classList.remove('active'));
      const chosenPanel=document.getElementById('panel-' + target);if(chosenPanel)chosenPanel.classList.add('active');
      pageTitle.textContent = TITLES[target];
      closeSidebar();
      closeMoreSheet();
      document.querySelector('.content').scrollTop = 0;
    });
  });

  /* ================= NAV: "LAINNYA" BOTTOM SHEET (mobile) ================= */
/*__N6_UNIT__*/  const moreSheetOverlay = document.getElementById('moreSheetOverlay');
/*__N6_UNIT__*/  function openMoreSheet(){ moreSheetOverlay.classList.add('show'); }
/*__N6_UNIT__*/  function closeMoreSheet(){ moreSheetOverlay.classList.remove('show'); }
  moreNavBtn.addEventListener('click', openMoreSheet);
  moreSheetOverlay.addEventListener('click', (e) => { if (e.target === moreSheetOverlay) closeMoreSheet(); });

  /* ================= NAV: SUB TABS ================= */
  document.querySelectorAll('.subtabs').forEach(group => {
    const groupName = group.getAttribute('data-group');
    const section = group.closest('.panel');
    const btns = group.querySelectorAll('.subtab-btn');
    const subpanels = section.querySelectorAll('.subpanel');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        subpanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(groupName + '-' + btn.getAttribute('data-sub')).classList.add('active');
      });
    });
  });

  /* ================= MOBILE SIDEBAR TOGGLE ================= */
/*__N6_UNIT__*/  const sidebarEl = document.getElementById('sidebar');
/*__N6_UNIT__*/  const sidebarOverlay = document.getElementById('sidebarOverlay');
/*__N6_UNIT__*/  function openSidebar(){ sidebarEl.classList.add('open'); sidebarOverlay.classList.add('show'); }
