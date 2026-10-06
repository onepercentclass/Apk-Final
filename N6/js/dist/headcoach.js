/**
 * N6 dist bundle - headcoach
 *
 * GENERATED FILE - do not edit. Source of truth is js/modules/headcoach/*.js
 * Rebuilt by tools/build.ps1; concatenation is byte-identical to the
 * original <script> block in headcoach.html.
 */


(function(){
  /* ================= API CLIENT ================= */
  function n6ApiCfg(){ return window.N6_API || {}; }
  function n6ApiBase(){ return String(n6ApiCfg().base || 'https://api.denisbergkam.com/api/n6').replace(/\/+$/, ''); }
  function n6ApiToken(){
    try { return window.localStorage.getItem(n6ApiCfg().tokenKey || 'n6:api:token'); }
    catch(e){ return null; }
  }
  function n6ApiReady(){ return n6ApiCfg().enabled === true && !!n6ApiToken(); }

  async function n6Api(path){
    const res = await fetch(n6ApiBase() + '/' + String(path).replace(/^\/+/, ''), {
      headers: { 'Authorization': 'Bearer ' + n6ApiToken() }
    });
    if (!res.ok) throw new Error('API ' + res.status + ' ' + path);
    return res.json();
  }

  function fmtTanggal(iso){
    if (!iso) return '-';
    try {
      const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
      return d.getDate() + ' ' + MONTH_LABEL[d.getMonth()] + ' ' + d.getFullYear();
    } catch(e){ return iso; }
  }

  /* ================= DATA (dari API, bukan dummy) ================= */
  let coaches = [];
  let clients = [];
  let rescheduleRequests = [];
  let teamAttendance = [];
  let cutiRequests = [];   // Fase 3: belum ada endpoint cuti
  let evalHistory = [];    // Fase 3: belum ada endpoint evaluasi

  function slugify(name){ return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
  function clientPortalUrl(name, staff){
    return 'dashboard-client.html?client=' + encodeURIComponent(slugify(name)) + (staff ? '&staff=1' : '');
  }

  /* Fase 3: diisi dari GET dashboards/headcoach/team; kosong -> grafik tampil kosong (tanpa fallback dummy). */
  const chartData = {
    coachLabels: [],
    scoreCoach: [],
    ratingCoach: [],
    bulanLabel: [],
    kehadiranTren: [],
    statusKlien: { normal:0, bermasalah:0, cedera:0 }
  };

  let teamActivityList = [];   // Fase 3: diisi dari GET dashboards/headcoach/team (activities)

  /* rescheduleRequests, cutiRequests, evalHistory, teamAttendance dideklarasikan di atas (diisi dari API) */

  /* ---------- TEMPLATE KATA KOREKSI (kolom keterangan cepat) ---------- */
  let koreksiTemplates = [
    { code:'1', label:'Bagus & Perlu Ditingkatkan', text:'Latihan hari ini sudah bagus dan menunjukkan progres yang baik. Namun tetap ada beberapa bagian teknik dan pace yang masih perlu ditingkatkan lagi ke depannya — pertahankan konsistensinya, ya!' },
    { code:'2', label:'Kualitas Kurang Baik', text:'Kualitas latihan hari ini masih kurang baik untuk hari ini dan perlu dievaluasi lebih lanjut. Mohon perhatikan kembali instruksi program yang sudah diberikan, dan segera hubungi coach apabila ada kendala saat latihan.' },
    { code:'3', label:'Sangat Baik', text:'Latihan hari ini sangat baik! Pace, durasi, dan konsistensi sudah sesuai target program. Pertahankan ritme dan semangat ini untuk sesi-sesi berikutnya.' },
    { code:'4', label:'Perlu Istirahat', text:'Terlihat ada tanda kelelahan pada hasil latihan hari ini. Disarankan mengambil waktu istirahat yang cukup sebelum melanjutkan sesi berikutnya agar terhindar dari risiko cedera.' },
  ];

  /* ---------- TEMPLATE PROGRAM LARI (untuk Program Builder) ---------- */
  let programTemplates = [
    { label:'Program Pemula 5K (8 Minggu)', text:'Program latihan bertahap selama 8 minggu untuk pelari pemula dengan target menyelesaikan 5K dengan nyaman. Fokus pada pembentukan kebiasaan lari, kombinasi jalan-lari, dan penguatan otot dasar.' },
    { label:'Program 10K Peningkatan Pace', text:'Program 8–10 minggu untuk pelari yang sudah terbiasa 5K dan ingin meningkatkan jarak ke 10K sekaligus memperbaiki pace rata-rata. Termasuk sesi interval dan tempo run mingguan.' },
    { label:'Program Half Marathon (Persiapan)', text:'Program persiapan half marathon (21K) selama 12 minggu, terdiri dari long run mingguan bertahap, latihan kekuatan, dan pengaturan strategi pace untuk race day.' },
    { label:'Program Full Marathon (Persiapan)', text:'Program persiapan full marathon (42K) selama 16 minggu dengan progresi jarak long run, sesi recovery terjadwal, dan simulasi race day menjelang hari-H.' },
    { label:'Program Penurunan Berat Badan', text:'Program kombinasi lari dan latihan kardio ringan yang difokuskan pada pembakaran kalori secara konsisten dan aman, disesuaikan dengan kondisi fisik dan target klien.' },
  ];

  let sentPrograms = [];
  let selectedProgramTplIndex = null;

  /* ---------- CHAT INTERNAL: HEAD COACH <-> ADMIN / OWNER ---------- */
  let internalChats = {
    admin: [
      { sender:'admin', text:'Selamat pagi Coach, ada jadwal klien baru yang perlu dikonfirmasi minggu ini.', at:'2026-09-09T08:10:00' }
    ],
    owner: []
  };

  /* ================= LOADERS (API) ================= */
  const REQ_STATUS_LABEL = { menunggu:'Menunggu', disetujui:'Disetujui', ditolak:'Ditolak' };
  const ATT_STATUS_LABEL = { hadir:'Tepat Waktu', izin:'Izin', sakit:'Sakit', alpha:'Alpha' };

  function coachNameById(id){
    const c = coaches.find(x => String(x.id) === String(id));
    return c ? c.name : '-';
  }
  function clientNameById(id){
    const c = clients.find(x => String(x.id) === String(id));
    return c ? c.name : '-';
  }

  async function loadCoaches(){
    // Pakai endpoint dashboard (tier 2 boleh akses), bukan /accounts (khusus owner -> 403).
    const d = await n6Api('dashboards/headcoach/team');
    const items = (d && d.coaches) || [];
    coaches = items.map(c => ({
      id: c.coach_id,
      name: c.name || ('Coach #' + c.coach_id),
      clients: c.client_count || 0,
      kehadiran: c.attendance_pct,
      score: c.attendance_pct,
      rating: c.rating,
    }));
  }

  async function loadClients(){
    const [clientPage, flags] = await Promise.all([
      n6Api('clients?limit=200'),
      n6Api('monitoring/flags').catch(() => []),
    ]);
    const items = (clientPage && clientPage.items) || [];
    const flaggedById = {};
    (Array.isArray(flags) ? flags : []).forEach(f => {
      flaggedById[f.client_id] = f.note || f.flag_kehadiran || f.flag_komisi || 'Perlu perhatian';
    });
    const coachCount = {};
    clients = items.map(c => {
      const isFlagged = !!flaggedById[c.id];
      if (c.coach_id != null) coachCount[c.coach_id] = (coachCount[c.coach_id] || 0) + 1;
      return {
        id: c.id,
        name: c.name,
        coach: c.coach_id != null ? null : '-',  // diisi setelah lookup nama
        coach_id: c.coach_id,
        goal: '-',
        status: isFlagged ? 'Bermasalah' : 'Normal',
        note: flaggedById[c.id] || c.notes || '',
      };
    });
    // Isi nama coach & hitung klien per coach
    clients.forEach(c => {
      if (c.coach_id != null) c.coach = coachNameById(c.coach_id);
    });
    coaches.forEach(ch => { ch.clients = coachCount[ch.id] || 0; });
  }

  async function loadRescheduleRequests(){
    const page = await n6Api('schedules/coach/requests?limit=200');
    const items = (page && page.items) || [];
    rescheduleRequests = items.map(r => ({
      id: r.id,
      coach: r.coach_id != null ? coachNameById(r.coach_id) : '-',
      sesi: clientNameById(r.client_id) + (r.current_start ? ' — ' + r.current_start : ''),
      baru: fmtTanggal(r.requested_on),
      alasan: r.reason || '-',
      status: REQ_STATUS_LABEL[r.status] || r.status,
    }));
  }

  async function loadTeamAttendance(){
    const page = await n6Api('attendance?limit=200');
    const items = (page && page.items) || [];
    teamAttendance = items.map(a => ({
      coach: a.coach_id != null ? coachNameById(a.coach_id) : '-',
      client: a.client_id != null ? clientNameById(a.client_id) : '-',
      tanggal: fmtTanggal(a.session_on),
      status: ATT_STATUS_LABEL[a.status] || a.status,
    }));
  }

  async function loadTeamDashboard(){
    /* Fase 3: endpoint agregat headcoach. Kode defensif — fungsi ini TIDAK pernah throw:
       bila endpoint belum ada (404) atau error, chartData & teamActivityList dibiarkan
       kosong sehingga UI menampilkan empty state / grafik kosong, TANPA fallback dummy. */
    try {
      const data = await n6Api('dashboards/headcoach/team');

      // 1) Merge statistik per coach (cocokkan id dulu, lalu nama sebagai fallback)
      const list = Array.isArray(data && data.coaches) ? data.coaches : [];
      const byId = {};
      list.forEach(c => { byId[String(c.id)] = c; });
      const byName = (nm) => list.find(c =>
        c.name && nm && String(c.name).trim().toLowerCase() === String(nm).trim().toLowerCase());
      coaches.forEach(ch => {
        const agg = byId[String(ch.id)] || byName(ch.name);
        if (!agg) return;
        if (agg.attendance_pct !== null && agg.attendance_pct !== undefined){
          ch.kehadiran = agg.attendance_pct;
          ch.score = agg.attendance_pct;   // skor coach memakai attendance_pct dari endpoint
        }
        if (agg.rating !== null && agg.rating !== undefined) ch.rating = agg.rating;  // null -> tampil "-"
        if (agg.clients !== null && agg.clients !== undefined) ch.clients = agg.clients;
      });

      // 2) chartData: label + skor + rating per coach
      chartData.coachLabels = coaches.map(c => c.name.split(' ')[0]);
      chartData.scoreCoach = coaches.map(c => c.score);
      chartData.ratingCoach = coaches.map(c => c.rating);

      // 3) chartData: tren kehadiran tim
      if (data && data.attendance_trend){
        chartData.bulanLabel = Array.isArray(data.attendance_trend.labels) ? data.attendance_trend.labels : [];
        chartData.kehadiranTren = Array.isArray(data.attendance_trend.values) ? data.attendance_trend.values : [];
      }

      // 4) chartData: status klien (doughnut)
      if (data && data.client_status){
        chartData.statusKlien = {
          normal: data.client_status.normal || 0,
          bermasalah: data.client_status.bermasalah || 0,
          cedera: data.client_status.cedera || 0,
        };
      }

      // 5) Aktivitas terbaru tim
      teamActivityList = (Array.isArray(data && data.activities) ? data.activities : []).map(a => ({
        date: a.date || fmtTanggal(a.created_at) || '-',
        text: a.text || '',
      }));
    } catch(e){
      console.warn('[hc] dashboards/headcoach/team belum tersedia', e);
      // dibiarkan kosong -> empty state
    }
  }

  function setLoading(sel){
    const el = document.getElementById(sel);
    if (el) el.innerHTML = '<div class="cal-empty">Memuat data...</div>';
  }

  async function loadAllData(){
    if (!n6ApiReady()){
      ['coachAttentionList','clientAttentionList','teamActivityList','coachListBody',
       'teamAttendanceBody','rescheduleApprovalList','cutiApprovalList','evalHistoryList',
       'allClientsList','flaggedClientsList'].forEach(setLoading);
      return;
    }
    try {
      await loadCoaches();
      await loadClients();           // butuh coaches untuk lookup nama
      await loadTeamDashboard();     // Fase 3: agregat tim; internal try/catch, tak pernah throw
      await Promise.all([
        loadRescheduleRequests().catch(e => { console.warn('[hc] reschedule', e); rescheduleRequests = []; }),
        loadTeamAttendance().catch(e => { console.warn('[hc] attendance', e); teamAttendance = []; }),
      ]);
    } catch(e) {
      console.warn('[hc] gagal memuat data API', e);
      // Biarkan array kosong -> empty state "Belum ada data", tanpa fallback dummy.
    }
    renderAll();
  }

  function renderAll(){
    renderCoachAttention();
    renderClientAttention();
    renderCharts();
    renderTeamActivity();
    renderCoachList();
    renderTeamAttendance();
    renderTeamCalendarLegend();
    populateCalCoachFilter();
    renderTeamCalendar();
    populateEvalSelect();
    renderEvalHistory();
    populateKlienFilter();
    renderAllClients();
    renderFlaggedClients();
    populateAthleteCoachSelect();
    populateAthleteSelectsForAchv();
    renderAthleteList();
    renderPodiumSummary();
    renderAchievementList();
    renderDayTabs();
    populateCoachFilterKoreksi();
    renderSubmissionList();
    renderRescheduleApproval();
    renderCutiApproval();
    renderKoreksiTemplateList();
    populateProgramClientSelect();
    renderProgramTplPickList();
    renderProgramTemplateList();
  }

  /* ================= HELPERS ================= */
  function scoreTone(score){ return score >= 85 ? 'green' : score >= 70 ? 'amber' : 'red'; }
  function statusTone(status){
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
  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  window.showToast = showToast;
  function escapeHtmlHC(str){
    return String(str == null ? '' : str).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  /* ================= RENDER: HOME ================= */
  function fmtStat(v, suffix){ return (v === null || v === undefined) ? '-' : (v + (suffix || '')); }

  function renderCoachAttention(){
    const el = document.getElementById('coachAttentionList');
    if (!el) return;
    if (!coaches.length){ el.innerHTML = '<div class="cal-empty">Belum ada data coach.</div>'; return; }
    const withScore = coaches.filter(c => c.score !== null && c.score !== undefined);
    if (!withScore.length){ el.innerHTML = '<div class="cal-empty">Belum ada data performa coach.</div>'; return; }
    const flagged = withScore.filter(c => c.score < 75 || (c.kehadiran !== null && c.kehadiran < 85));
    el.innerHTML = flagged.length ? flagged.map(c => `
      <div class="attention-item">
        <div class="attention-dot ${c.score < 70 ? 'red' : 'amber'}"></div>
        <div class="attention-body">
          <div class="name">${c.name}</div>
          <div class="desc">Score ${c.score} · Kehadiran ${fmtStat(c.kehadiran, '%')} — perlu pembinaan lebih lanjut.</div>
        </div>
      </div>
    `).join('') : `<div class="cal-empty">Semua coach dalam performa baik.</div>`;
  }

  function renderClientAttention(){
    const el = document.getElementById('clientAttentionList');
    if (!el) return;
    if (!clients.length){ el.innerHTML = '<div class="cal-empty">Belum ada data klien.</div>'; return; }
    const flagged = clients.filter(c => c.status !== 'Normal');
    el.innerHTML = flagged.length ? flagged.map(c => `
      <div class="attention-item">
        <div class="attention-dot ${c.status === 'Cedera' ? 'red' : 'amber'}"></div>
        <div class="attention-body">
          <div class="name">${c.name} <span style="font-weight:400; color:var(--asphalt);">— Coach: ${c.coach}</span></div>
          <div class="desc">${c.note || c.status}</div>
        </div>
      </div>
    `).join('') : `<div class="cal-empty">Tidak ada klien bermasalah/cedera saat ini.</div>`;
  }

  function renderTeamActivity(){
    const el = document.getElementById('teamActivityList');
    if (!el) return;
    if (!teamActivityList.length){
      el.innerHTML = '<div class="cal-empty">Belum ada aktivitas tim.</div>';
      return;
    }
    el.innerHTML = teamActivityList.map(a => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-body">
          <div class="act">${a.text}</div>
          <div class="date">${a.date}</div>
        </div>
      </div>
    `).join('');
  }

  /* ================= CHARTS ================= */
  const CHART_RED = '#D62828', CHART_INK = '#111110', CHART_ASPHALT = '#6E6C64',
        CHART_GREEN = '#1E8E3E', CHART_AMBER = '#B7791F', CHART_GRID = '#F0EEE7';

  function buildChartConfig(key){
    if (key === 'scoreCoach') return {
      type:'bar',
      data:{ labels: chartData.coachLabels, datasets:[{ data: chartData.scoreCoach, backgroundColor: chartData.scoreCoach.map(s => s == null ? '#D8D5CC' : (s>=85?CHART_GREEN:s>=70?CHART_AMBER:CHART_RED)), borderRadius:4, maxBarThickness:36 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
        scales:{ x:{grid:{display:false}, ticks:{color:CHART_ASPHALT, font:{size:11}}}, y:{beginAtZero:true, max:100, ticks:{color:CHART_ASPHALT, font:{size:11}}, grid:{color:CHART_GRID}} } }
    };
    if (key === 'kehadiranTren') return {
      type:'line',
      data:{ labels: chartData.bulanLabel, datasets:[{ data: chartData.kehadiranTren, borderColor:CHART_RED, backgroundColor:'rgba(214,40,40,0.08)', fill:true, tension:0.35, pointRadius:3, pointBackgroundColor:CHART_RED }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{callbacks:{label:(c)=>(c.parsed.y == null ? '-' : c.parsed.y)+'%'}}},
        scales:{ x:{grid:{display:false}, ticks:{color:CHART_ASPHALT, font:{size:11}}}, y:{ticks:{callback:(v)=>v+'%', color:CHART_ASPHALT, font:{size:11}}, grid:{color:CHART_GRID}} } }
    };
    if (key === 'statusKlienTim') return {
      type:'doughnut',
      data:{ labels:['Normal','Bermasalah','Cedera'], datasets:[{ data:[chartData.statusKlien.normal, chartData.statusKlien.bermasalah, chartData.statusKlien.cedera], backgroundColor:[CHART_GREEN, CHART_AMBER, CHART_RED], borderWidth:0 }] },
      options:{ responsive:true, maintainAspectRatio:false, cutout:'62%', plugins:{legend:{position:'bottom', labels:{boxWidth:10, font:{size:11}, color:CHART_INK}}} }
    };
    if (key === 'ratingCoach') return {
      type:'bar',
      data:{ labels: chartData.coachLabels, datasets:[{ data: chartData.ratingCoach, backgroundColor: CHART_INK, borderRadius:4, maxBarThickness:36 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}, tooltip:{callbacks:{label:(c)=>(c.parsed.y == null ? '-' : c.parsed.y)+' / 5.0'}}},
        scales:{ x:{grid:{display:false}, ticks:{color:CHART_ASPHALT, font:{size:11}}}, y:{min:0, max:5, ticks:{color:CHART_ASPHALT, font:{size:11}}, grid:{color:CHART_GRID}} } }
    };
  }
  function renderCharts(){
    // Elemen chart legacy sudah dihapus dari DOM — skip bila tidak ada.
    [['chartScoreCoach','scoreCoach'],['chartKehadiranTren','kehadiranTren'],
     ['chartStatusKlienTim','statusKlienTim'],['chartRatingCoach','ratingCoach']].forEach(([id, key]) => {
      const cv = document.getElementById(id);
      if (cv) new Chart(cv, buildChartConfig(key));
    });
  }
  let chartModalInstance = null;
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
  function renderCoachList(){
    const el = document.getElementById('coachListBody');
    if (!coaches.length){ el.innerHTML = '<div class="cal-empty">Belum ada data coach.</div>'; return; }
    el.innerHTML = coaches.map(c => `
      <div class="coach-card" onclick="openCoachDetail('${c.id}')">
        <div class="coach-card-top">
          <div>
            <div class="coach-card-name">${c.name}</div>
            <div class="coach-card-meta">${c.clients} klien binaan</div>
          </div>
          <span class="badge ${c.score === null ? 'neutral' : scoreTone(c.score)}">Score ${fmtStat(c.score)}</span>
        </div>
        <div class="coach-card-stats">
          <div class="coach-card-stat">Kehadiran<b>${fmtStat(c.kehadiran, '%')}</b></div>
          <div class="coach-card-stat">Rating Klien<b>${fmtStat(c.rating)}</b></div>
          <div class="coach-card-stat">Klien Binaan<b>${c.clients}</b></div>
        </div>
      </div>
    `).join('');
  }
  window.openCoachDetail = function(id){
    const c = coaches.find(x => String(x.id) === String(id));
    if (!c) return;
    const myClients = clients.filter(cl => cl.coach === c.name);
    document.getElementById('coachDetailTitle').textContent = c.name;
    document.getElementById('coachDetailBody').innerHTML = `
      <div class="rapor-grid">
        <div class="rapor-stat"><div class="l">Score</div><div class="v">${fmtStat(c.score)}</div></div>
        <div class="rapor-stat"><div class="l">Kehadiran</div><div class="v">${fmtStat(c.kehadiran, '%')}</div></div>
        <div class="rapor-stat"><div class="l">Rating Klien</div><div class="v">${fmtStat(c.rating)}</div></div>
        <div class="rapor-stat"><div class="l">Klien Binaan</div><div class="v">${c.clients}</div></div>
      </div>
      <h4 style="font-size:13px; font-weight:700; margin-bottom:8px;">Klien Binaan</h4>
      ${myClients.length ? myClients.map(cl => `
        <div class="progress-row">
          <div class="progress-row-top"><span class="pname">${cl.name}</span><span class="pgoal">${cl.goal}</span></div>
          <div class="progress-note">Status: <span class="badge ${statusTone(cl.status)}" style="margin-left:4px;">${cl.status}</span>
            · <a href="${clientPortalUrl(cl.name, true)}" target="_blank" rel="noopener" style="font-weight:700; color:var(--ink);">Lihat Dashboard ↗</a>
          </div>
        </div>
      `).join('') : '<div class="cal-empty">Belum ada klien binaan.</div>'}
      <div class="cal-empty" style="margin-top:12px;">Gunakan tab "Evaluasi" untuk memberi skor & feedback ke coach ini.</div>
    `;
    document.getElementById('coachDetailModal').classList.add('show');
  };
  window.closeCoachDetail = function(){
    document.getElementById('coachDetailModal').classList.remove('show');
  };

  /* ================= RENDER: ABSENSI TIM ================= */
  function renderTeamAttendance(){
    const el = document.getElementById('teamAttendanceBody');
    if (!teamAttendance.length){ el.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    el.innerHTML = teamAttendance.map(a => `
      <div class="attendance-item">
        <div class="attendance-item-top">
          <div class="attendance-date">${a.tanggal} <span style="font-weight:400; color:var(--asphalt);">— ${a.coach}${a.client && a.client !== '-' ? ' · ' + a.client : ''}</span></div>
          <div class="attendance-badges"><span class="badge ${statusTone(a.status)}">${a.status}</span></div>
        </div>
      </div>
    `).join('');
  }

  /* ================= RENDER: KALENDER TIM (READ-ONLY) ================= */
  const COACH_COLOR_PALETTE = ["#D62828", "#2563AE", "#B7791F", "#1E8E3E", "#7B2D8E", "#0E7C7B"];
  function coachColor(name){
    const i = coaches.findIndex(c => c.name === name);
    return COACH_COLOR_PALETTE[(i < 0 ? 0 : i) % COACH_COLOR_PALETTE.length];
  }

  function getCoachSessionsForDate(coachName, date){
    const dow = date.getDay(); // 0=Minggu ... 6=Sabtu
    if (coachName === "Rangga Saputra"){
      if (dow === 1) return [{ time:"06:00", client:"Budi Hartono", loc:"GBK Senayan" }];
      if (dow === 2) return [{ time:"16:00", client:"Rina Marlina", loc:"Online" }];
      if (dow === 3) return [{ time:"07:00", client:"Andi Prasetyo", loc:"GBK Senayan" }];
      if (dow === 4) return [{ time:"18:00", client:"Yoga Pratama", loc:"Online" }];
      if (dow === 5) return [{ time:"06:00", client:"Budi Hartono", loc:"GBK Senayan" }, { time:"16:00", client:"Rina Marlina", loc:"Online" }];
      if (dow === 6) return [{ time:"09:00", client:"Citra Ayu", loc:"Online" }];
      return [];
    }
    if (coachName === "Dinda Ayu"){
      if (dow === 2) return [{ time:"16:00", client:"Sari Wijaya", loc:"Online" }];
      if (dow === 4) return [{ time:"18:00", client:"Reza Firmansyah", loc:"Online" }];
      if (dow === 6) return [{ time:"10:00", client:"Sari Wijaya", loc:"Online" }];
      return [];
    }
    if (coachName === "Fajar Nugroho"){
      if (dow === 3) return [{ time:"17:00", client:"Maya Putri", loc:"Online" }];
      return [];
    }
    return [];
  }

  function getTeamSessionsForDate(date){
    const result = [];
    coaches.forEach(c => {
      getCoachSessionsForDate(c.name, date).forEach(s => result.push({ coach: c.name, ...s }));
    });
    return result;
  }

  function getFilteredTeamSessionsForDate(date){
    const filterEl = document.getElementById('calCoachFilter');
    const filter = filterEl ? filterEl.value : '';
    const all = getTeamSessionsForDate(date);
    return filter ? all.filter(s => s.coach === filter) : all;
  }

  function populateCalCoachFilter(){
    const el = document.getElementById('calCoachFilter');
    if (!el) return;
    el.innerHTML = '<option value="">Semua Coach</option>' + coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    el.addEventListener('change', renderTeamCalendar);
  }

  const DOW_LABEL = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const MONTH_LABEL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  let selectedTeamCalDate = null;

  function fmtCalDate(d){ return d.getDate() + ' ' + MONTH_LABEL[d.getMonth()] + ' ' + d.getFullYear(); }
  function sameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

  function renderTeamCalendarLegend(){
    document.getElementById('calLegendTeam').innerHTML = coaches.map(c => `
      <span><span class="dot" style="background:${coachColor(c.name)};"></span>${c.name.split(' ')[0]}</span>
    `).join('');
  }

  function renderTeamCalendar(){
    const today = new Date(); today.setHours(0,0,0,0);
    const horizonEnd = new Date(today); horizonEnd.setDate(horizonEnd.getDate() + 29);
    const startOffset = (today.getDay() + 6) % 7;
    const gridStart = new Date(today); gridStart.setDate(gridStart.getDate() - startOffset);

    document.getElementById('calRange').textContent = fmtCalDate(today) + ' — ' + fmtCalDate(horizonEnd);

    let dowHtml = DOW_LABEL.map(d => `<div class="cal-dow">${d}</div>`).join('');
    let cellsHtml = '';
    for (let i=0; i<42; i++){
      const d = new Date(gridStart); d.setDate(d.getDate() + i);
      const sessions = getFilteredTeamSessionsForDate(d);
      const isToday = sameDay(d, today);
      const inWindow = d >= today && d <= horizonEnd;
      const outside = !inWindow;
      const isSelected = selectedTeamCalDate && sameDay(d, selectedTeamCalDate);
      const classes = ['cal-cell'];
      if (outside) classes.push('outside');
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      if (sessions.length && inWindow) classes.push('has-session');
      const uniqueCoaches = [...new Set(sessions.map(s => s.coach))];
      const dotsHtml = (uniqueCoaches.length && inWindow)
        ? `<div class="dots">${uniqueCoaches.map(c => `<span style="background:${coachColor(c)};"></span>`).join('')}</div>`
        : '';
      cellsHtml += `<div class="${classes.join(' ')}" onclick="selectTeamCalDay('${d.toISOString()}')">
          <div class="num">${d.getDate()}</div>
          ${dotsHtml}
        </div>`;
    }
    document.getElementById('calGrid').innerHTML = dowHtml + cellsHtml;

    if (!selectedTeamCalDate) selectedTeamCalDate = today;
    renderTeamCalDetail(selectedTeamCalDate);
  }

  function renderTeamCalDetail(date){
    const sessions = getFilteredTeamSessionsForDate(date);
    const dateLabel = fmtCalDate(date);
    if (!sessions.length){
      document.getElementById('calDetail').innerHTML = `<h4>${dateLabel}</h4><div class="cal-empty">Tidak ada jadwal latihan tim pada hari ini.</div>`;
      return;
    }
    document.getElementById('calDetail').innerHTML = `
      <h4>${dateLabel}</h4>
      <table>
        <tbody>
          ${sessions.map(s => `
            <tr>
              <td class="muted" style="width:56px;">${s.time}</td>
              <td class="strong">${s.client}</td>
              <td class="muted">${s.loc}</td>
              <td class="right"><span class="badge neutral" style="border-left:3px solid ${coachColor(s.coach)}; padding-left:8px;">${s.coach}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;
  }

  window.selectTeamCalDay = function(isoString){
    selectedTeamCalDate = new Date(isoString);
    renderTeamCalendar();
  };

  /* ================= RENDER: EVALUASI ================= */
  function populateEvalSelect(){
    document.getElementById('evalCoach').innerHTML =
      '<option value="">Pilih coach</option>' + coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }
  function renderEvalHistory(){
    const el = document.getElementById('evalHistoryList');
    // Fase 3: belum ada endpoint evaluasi — tampilkan data yang diinput user sesi ini, atau empty state.
    if (!evalHistory.length){ el.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    el.innerHTML = evalHistory.map(e => `
      <div class="review-item">
        <div class="review-item-top"><span class="who">${e.coach}</span><span class="when">${e.tanggal}</span></div>
        <div class="stats"><span class="badge ${scoreTone(e.score)}">Score ${e.score}</span></div>
        <div class="note">${e.komentar}</div>
      </div>
    `).join('');
  }
  document.getElementById('evalForm').addEventListener('submit', function(e){
    e.preventDefault();
    const coach = document.getElementById('evalCoach').value;
    const score = document.getElementById('evalScore').value.trim();
    const komentar = document.getElementById('evalKomentar').value.trim();
    if (!coach || !score || !komentar) return;
    evalHistory.unshift({ coach, tanggal:'Baru saja', score: Number(score), komentar });
    renderEvalHistory();
    this.reset();
    showToast('Feedback berhasil dikirim ke ' + coach);
  });

  /* ================= RENDER: KLIEN ================= */
  function populateKlienFilter(){
    document.getElementById('klienFilterCoach').innerHTML =
      '<option value="">Semua Coach</option>' + coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }
  function renderAllClients(){
    const filterEl = document.getElementById('klienFilterCoach');
    const filterVal = filterEl ? filterEl.value : '';
    const listEl = document.getElementById('allClientsList');
    if (!clients.length){ listEl.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    const list = filterVal ? clients.filter(c => c.coach === filterVal) : clients;
    if (!list.length){ listEl.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    listEl.innerHTML = list.map(c => `
      <div class="client-row" style="cursor:pointer;" onclick="openClientDetail(${c.id})">
        <div>
          <div class="name">${c.name}</div>
          <div class="meta">Coach: ${c.coach} · Target: ${c.goal}</div>
        </div>
        <div class="client-tags"><span class="badge ${statusTone(c.status)}">${c.status}</span></div>
      </div>
    `).join('');
  }
  const klienFilterEl = document.getElementById('klienFilterCoach');
  if (klienFilterEl) klienFilterEl.addEventListener('change', renderAllClients);

  function renderFlaggedClients(){
    const el = document.getElementById('flaggedClientsList');
    if (!clients.length){ el.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    const flagged = clients.filter(c => c.status !== 'Normal');
    el.innerHTML = flagged.length ? flagged.map(c => `
      <div class="client-row" style="cursor:pointer;" onclick="openClientDetail(${c.id})">
        <div>
          <div class="name">${c.name}</div>
          <div class="meta">Coach: ${c.coach} · ${c.note || ''}</div>
        </div>
        <div class="client-tags"><span class="badge ${statusTone(c.status)}">${c.status}</span></div>
      </div>
    `).join('') : `<div class="cal-empty">Tidak ada klien bermasalah/cedera saat ini.</div>`;
  }

  /* ================= ATLET BINAAN & PRESTASI ================= */
  let athletes = [];   // Tidak ada endpoint — user kelola manual via UI
  let athleteIdCounter = 1;

  let achievements = [];   // Tidak ada endpoint — user kelola manual via UI
  let achievementIdCounter = 1;

  function posisiTone(posisi){
    if (posisi === 'Juara 1') return 'green';
    if (posisi === 'Juara 2') return 'blue';
    if (posisi === 'Juara 3') return 'amber';
    if (posisi === 'DNF') return 'red';
    return 'neutral';
  }

  function athleteStats(athleteId){
    const list = achievements.filter(a => a.athleteId === athleteId);
    return {
      total: list.length,
      juara1: list.filter(a => a.posisi === 'Juara 1').length,
      juara2: list.filter(a => a.posisi === 'Juara 2').length,
      juara3: list.filter(a => a.posisi === 'Juara 3').length,
    };
  }

  function renderPodiumSummary(){
    const ranked = athletes.map(a => ({ athlete:a, stats:athleteStats(a.id) }))
      .sort((x, y) => (y.stats.juara1*3 + y.stats.juara2*2 + y.stats.juara3) - (x.stats.juara1*3 + x.stats.juara2*2 + x.stats.juara3))
      .slice(0, 3);
    const labels = ['🥇 Terbanyak Juara', '🥈 Peringkat 2', '🥉 Peringkat 3'];
    document.getElementById('podiumSummary').innerHTML = ranked.length ? ranked.map((r, i) => `
      <div class="podium-card">
        <div class="rank">${labels[i] || ('Peringkat ' + (i+1))}</div>
        <div class="name">${r.athlete.name}</div>
        <div class="cnt">${r.stats.total} prestasi</div>
        <div style="font-size:11px; color:var(--asphalt); margin-top:4px;">🥇${r.stats.juara1} · 🥈${r.stats.juara2} · 🥉${r.stats.juara3}</div>
      </div>
    `).join('') : '<div class="cal-empty">Belum ada data atlet.</div>';
  }

  function populateAthleteCoachSelect(){
    document.getElementById('athCoach').innerHTML = '<option value="">Coach pembina</option>' +
      coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

  function populateAthleteSelectsForAchv(){
    const opts = '<option value="">Pilih atlet</option>' + athletes.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
    document.getElementById('achAthlete').innerHTML = opts;
    document.getElementById('filterAthleteAchv').innerHTML = '<option value="">Semua Atlet</option>' +
      athletes.map(a => `<option value="${a.id}">${a.name}</option>`).join('');
  }

  function renderAthleteList(){
    const body = document.getElementById('athleteList');
    if (!athletes.length){ body.innerHTML = '<div class="cal-empty">Belum ada atlet binaan. Tambahkan atlet pertama Anda.</div>'; return; }
    body.innerHTML = athletes.map(a => {
      const s = athleteStats(a.id);
      return `
      <div class="athlete-card">
        <div>
          <div class="athlete-card-name">${a.name}</div>
          <div class="athlete-card-meta">${a.kategori} · Coach: ${a.coach}</div>
          ${a.catatan ? `<div class="athlete-card-meta" style="margin-top:6px;">${a.catatan}</div>` : ''}
          <div class="athlete-card-stats">
            <div class="athlete-card-stat">Total Lomba<b>${s.total}</b></div>
            <div class="athlete-card-stat">Juara 1<b>${s.juara1}</b></div>
            <div class="athlete-card-stat">Juara 2<b>${s.juara2}</b></div>
            <div class="athlete-card-stat">Juara 3<b>${s.juara3}</b></div>
          </div>
        </div>
        <div class="athlete-card-actions">
          <button class="icon-btn" onclick="viewAthleteAchievements('${a.id}')" title="Lihat Prestasi">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="icon-btn" onclick="openAthleteModal('${a.id}')" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn danger" onclick="deleteAthlete('${a.id}')" title="Hapus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');
  }

  window.viewAthleteAchievements = function(athleteId){
    document.querySelector('#panel-atlet .subtab-btn[data-sub="prestasi"]').click();
    document.getElementById('filterAthleteAchv').value = athleteId;
    renderAchievementList();
  };

  function fmtAchvDate(tanggal){
    if (!tanggal) return '-';
    const [y,m,d] = tanggal.split('-');
    return parseInt(d,10) + ' ' + MONTH_LABEL[parseInt(m,10)-1] + ' ' + y;
  }

  function renderAchievementList(){
    const filter = document.getElementById('filterAthleteAchv').value;
    let list = achievements.slice();
    if (filter) list = list.filter(a => a.athleteId === filter);
    list.sort((a,b) => b.tanggal.localeCompare(a.tanggal));
    const body = document.getElementById('achievementList');
    if (!list.length){ body.innerHTML = '<div class="cal-empty">Belum ada prestasi tercatat.</div>'; return; }
    body.innerHTML = list.map(ac => {
      const athlete = athletes.find(a => a.id === ac.athleteId);
      return `
      <div class="achv-item">
        <div class="achv-top">
          <span class="who">${athlete ? athlete.name : '(atlet dihapus)'}</span>
          <span class="badge ${posisiTone(ac.posisi)}">${ac.posisi}</span>
        </div>
        <div class="achv-event">${ac.event}${ac.kategori ? ' — ' + ac.kategori : ''}</div>
        <div class="achv-meta">${fmtAchvDate(ac.tanggal)}${ac.waktu ? ' · Waktu: ' + ac.waktu : ''}</div>
        ${ac.catatan ? `<div class="achv-note">${ac.catatan}</div>` : ''}
        <div class="achv-actions" style="margin-top:8px;">
          <button class="icon-btn" onclick="openAchievementModal('${ac.id}')" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn danger" onclick="deleteAchievement('${ac.id}')" title="Hapus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');
  }
  document.getElementById('filterAthleteAchv').addEventListener('change', renderAchievementList);

  let athleteEditingId = null;
  window.openAthleteModal = function(id){
    athleteEditingId = id;
    const a = id ? athletes.find(x => x.id === id) : null;
    document.getElementById('athleteModalTitle').textContent = a ? 'Edit Atlet' : 'Tambah Atlet';
    document.getElementById('athName').value = a ? a.name : '';
    document.getElementById('athKategori').value = a ? a.kategori : '';
    document.getElementById('athCoach').value = a ? a.coach : '';
    document.getElementById('athCatatan').value = a ? a.catatan || '' : '';
    document.getElementById('athleteModal').classList.add('show');
  };
  window.closeAthleteModal = function(){ document.getElementById('athleteModal').classList.remove('show'); };
  document.getElementById('athleteForm').addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('athName').value.trim();
    const kategori = document.getElementById('athKategori').value;
    const coach = document.getElementById('athCoach').value;
    const catatan = document.getElementById('athCatatan').value.trim();
    if (!name || !kategori || !coach) return;
    if (athleteEditingId){
      const a = athletes.find(x => x.id === athleteEditingId);
      Object.assign(a, { name, kategori, coach, catatan });
    } else {
      athletes.push({ id:'a' + (athleteIdCounter++), name, kategori, coach, catatan });
    }
    closeAthleteModal();
    renderAthleteList();
    renderPodiumSummary();
    populateAthleteSelectsForAchv();
    showToast('Data atlet disimpan.');
  });
  window.deleteAthlete = function(id){
    athletes = athletes.filter(a => a.id !== id);
    achievements = achievements.filter(a => a.athleteId !== id);
    renderAthleteList();
    renderPodiumSummary();
    populateAthleteSelectsForAchv();
    renderAchievementList();
    showToast('Atlet & riwayat prestasinya dihapus.');
  };

  let achievementEditingId = null;
  window.openAchievementModal = function(id){
    achievementEditingId = id;
    const ac = id ? achievements.find(x => x.id === id) : null;
    document.getElementById('achievementModalTitle').textContent = ac ? 'Edit Prestasi' : 'Catat Prestasi';
    document.getElementById('achAthlete').value = ac ? ac.athleteId : (document.getElementById('filterAthleteAchv').value || '');
    document.getElementById('achEvent').value = ac ? ac.event : '';
    document.getElementById('achTanggal').value = ac ? ac.tanggal : '';
    document.getElementById('achKategori').value = ac ? ac.kategori || '' : '';
    document.getElementById('achPosisi').value = ac ? ac.posisi : '';
    document.getElementById('achWaktu').value = ac ? ac.waktu || '' : '';
    document.getElementById('achCatatan').value = ac ? ac.catatan || '' : '';
    document.getElementById('achievementModal').classList.add('show');
  };
  window.closeAchievementModal = function(){ document.getElementById('achievementModal').classList.remove('show'); };
  document.getElementById('achievementForm').addEventListener('submit', function(e){
    e.preventDefault();
    const athleteId = document.getElementById('achAthlete').value;
    const event = document.getElementById('achEvent').value.trim();
    const tanggal = document.getElementById('achTanggal').value;
    const kategori = document.getElementById('achKategori').value.trim();
    const posisi = document.getElementById('achPosisi').value;
    const waktu = document.getElementById('achWaktu').value.trim();
    const catatan = document.getElementById('achCatatan').value.trim();
    if (!athleteId || !event || !tanggal || !posisi) return;
    if (achievementEditingId){
      const ac = achievements.find(x => x.id === achievementEditingId);
      Object.assign(ac, { athleteId, event, tanggal, kategori, posisi, waktu, catatan });
    } else {
      achievements.push({ id:'ac' + (achievementIdCounter++), athleteId, event, tanggal, kategori, posisi, waktu, catatan });
    }
    closeAchievementModal();
    renderAchievementList();
    renderAthleteList();
    renderPodiumSummary();
    showToast('Prestasi disimpan.');
  });
  window.deleteAchievement = function(id){
    achievements = achievements.filter(a => a.id !== id);
    renderAchievementList();
    renderAthleteList();
    renderPodiumSummary();
    showToast('Data prestasi dihapus.');
  };

  /* ================= RENDER: HASIL LATIHAN KLIEN (antrian harian, skalabel) ================= */
  const DAY_NAMES = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

  const FIRST_NAMES = ["Budi","Andi","Rina","Yoga","Citra","Sari","Reza","Maya","Dewi","Bayu","Nadia","Rizky","Agus","Wulan","Doni","Fitri","Hendra","Sinta","Galih","Putri","Indra","Lina","Tia","Dian","Yudi","Rara","Fajar","Wahyu"];
  const LAST_NAMES = ["Hartono","Prasetyo","Marlina","Pratama","Ayu","Wijaya","Firmansyah","Putri","Lestari","Setiawan","Ramadhan","Salim","Kurniawan","Handayani","Gunawan","Dewi","Permana","Kusuma","Anggraini","Puspita","Santoso","Kirana"];
  const LOCATIONS = ["GBK Senayan","Online","Lapangan A. Yani","Taman Menteng","Online","Stadion Madya","Online"];

  function generateSubmissions(){
    // Data dummy dinonaktifkan — menunggu endpoint API hasil latihan klien (Fase 3).
    return [];
  }
  let submissions = generateSubmissions();

  function getMonday(d){
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0,0,0,0);
    return date;
  }
  const koreksiMonday = getMonday(new Date());
  const koreksiWeekDates = [];
  for (let i=0;i<7;i++){ const d = new Date(koreksiMonday); d.setDate(d.getDate()+i); koreksiWeekDates.push(d); }
  const todayIndex = (new Date().getDay() + 6) % 7;
  let selectedDayIndex = todayIndex;

  function renderDayTabs(){
    document.getElementById('dayTabs').innerHTML = koreksiWeekDates.map((d, i) => {
      const pendingCount = submissions.filter(s => s.dayIndex === i && !s.reviewed).length;
      const classes = ['day-tab-btn'];
      if (i === selectedDayIndex) classes.push('active');
      if (i === todayIndex) classes.push('today');
      return `
      <button class="${classes.join(' ')}" onclick="selectKoreksiDay(${i})">
        <span class="dname">${DAY_NAMES[i]}${pendingCount ? ' <span class="badge red" style="margin-left:4px; padding:1px 6px;">'+pendingCount+'</span>' : ''}</span>
        <span class="ddate">${d.getDate()} ${MONTH_LABEL[d.getMonth()].slice(0,3)}</span>
      </button>`;
    }).join('');
  }

  function populateCoachFilterKoreksi(){
    document.getElementById('filterCoachKoreksi').innerHTML =
      '<option value="">Semua Coach</option>' + coaches.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  }

  function renderSubmissionList(){
    const coachFilter = document.getElementById('filterCoachKoreksi').value;
    const onlyPending = document.getElementById('onlyPendingToggle').checked;

    let list = submissions.filter(s => s.dayIndex === selectedDayIndex);
    if (coachFilter) list = list.filter(s => s.coach === coachFilter);
    const totalToday = list.length;
    const pendingCount = list.filter(s => !s.reviewed).length;
    const reviewedCount = totalToday - pendingCount;
    if (onlyPending) list = list.filter(s => !s.reviewed);

    document.getElementById('countPending').textContent = pendingCount;
    document.getElementById('countReviewed').textContent = reviewedCount;
    document.getElementById('countTotal').textContent = totalToday;

    const d = koreksiWeekDates[selectedDayIndex];
    document.getElementById('submissionListTitle').textContent =
      DAY_NAMES[selectedDayIndex] + ', ' + d.getDate() + ' ' + MONTH_LABEL[d.getMonth()] + ' ' + d.getFullYear();

    if (!list.length){
      document.getElementById('submissionList').innerHTML = `<div class="cal-empty">${onlyPending ? 'Semua hasil latihan hari ini sudah direview.' : 'Belum ada hasil latihan yang masuk untuk hari ini.'}</div>`;
      return;
    }

    document.getElementById('submissionList').innerHTML = list.map(s => `
      <div class="submission-item">
        <div class="submission-top">
          <div>
            <div class="submission-name">${s.client}</div>
            <div class="submission-meta">Coach: ${s.coach} · Lokasi: ${s.loc}</div>
          </div>
          <span class="badge ${s.reviewed ? 'green' : 'amber'}">${s.reviewed ? 'Sudah Direview' : 'Menunggu Review'}</span>
        </div>
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-top:4px;">
          <a class="week-review-link" href="${s.link}" target="_blank" rel="noopener" style="margin-top:0;">${s.link}</a>
          <a href="${clientPortalUrl(s.client, true)}" target="_blank" rel="noopener" style="font-size:11.5px; font-weight:700; color:var(--ink); white-space:nowrap;">Buka Dashboard Klien ↗</a>
        </div>
        ${s.reviewed
          ? `<div class="week-review-note"><b>Koreksi terkirim ke klien:</b> ${s.koreksi || '-'}</div>`
          : `<div class="correction-row" style="flex-direction:column; align-items:stretch;">
              <textarea class="correction-input" id="koreksi-${s.id}" placeholder="Tulis koreksi untuk klien di sini... (kolom ini bisa diisi keterangan panjang)"></textarea>
              <div class="tpl-chip-row">
                ${koreksiTemplates.map(t => `<button type="button" class="tpl-chip" onclick="applyTemplateToField('koreksi-${s.id}','${t.code}')">${t.code ? `<span class="code">${t.code}</span>` : ''}${t.label}</button>`).join('')}
              </div>
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:2px;">
                <input type="text" id="koreksicode-${s.id}" placeholder="Kode" style="width:76px; padding:7px 9px; font-size:12px;">
                <button type="button" class="btn-outline" style="margin-top:0; padding:7px 12px; font-size:11.5px;" onclick="applyTemplateCode('koreksi-${s.id}','koreksicode-${s.id}')">Terapkan Kode</button>
                <button class="btn-approve" style="margin-left:auto;" onclick="reviewSubmission(${s.id})">Tandai Direview &amp; Kirim</button>
              </div>
            </div>`}
      </div>
    `).join('');
  }

  window.selectKoreksiDay = function(i){
    selectedDayIndex = i;
    renderDayTabs();
    renderSubmissionList();
  };
  window.reviewSubmission = async function(id){
    const item = submissions.find(s => s.id === id);
    if (!item) return;
    const input = document.getElementById('koreksi-' + id);
    item.koreksi = input ? input.value.trim() : '';
    item.reviewed = true;
    renderDayTabs();
    renderSubmissionList();

    // Kirim koreksi ke thread chat klien (storage sama yang dipakai portal klien: chat:<clientId>)
    if (item.koreksi && window.storage){
      try{
        const key = 'chat:' + item.clientId;
        let existing = [];
        try{
          const raw = await window.storage.get(key, true);
          existing = raw && raw.value ? JSON.parse(raw.value) : [];
        }catch(e){ existing = []; }
        existing.push({ sender:'coach', text: item.koreksi, at: new Date().toISOString() });
        await window.storage.set(key, JSON.stringify(existing), true);
      }catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — koreksi tetap tersimpan lokal di atas */ }
    }

    showToast('Hasil latihan ' + item.client + ' ditandai direview' + (item.koreksi ? ' & koreksi terkirim ke chat klien' : ''));
  };
  document.getElementById('filterCoachKoreksi').addEventListener('change', renderSubmissionList);
  document.getElementById('onlyPendingToggle').addEventListener('change', renderSubmissionList);

  /* ================= TEMPLATE KATA KOREKSI: APPLY & CRUD ================= */
  window.applyTemplateToField = function(fieldId, code){
    const tpl = koreksiTemplates.find(t => t.code === code);
    const field = document.getElementById(fieldId);
    if (!tpl || !field) return;
    field.value = tpl.text;
    field.focus();
  };
  window.applyTemplateCode = function(fieldId, codeFieldId){
    const codeField = document.getElementById(codeFieldId);
    const code = codeField ? codeField.value.trim() : '';
    if (!code){ showToast('Masukkan kode template terlebih dahulu.'); return; }
    const tpl = koreksiTemplates.find(t => t.code === code);
    if (!tpl){ showToast('Kode template "' + code + '" tidak ditemukan.'); return; }
    const field = document.getElementById(fieldId);
    if (field){ field.value = tpl.text; field.focus(); }
    if (codeField) codeField.value = '';
  };

  function renderKoreksiTemplateList(){
    const body = document.getElementById('koreksiTemplateList');
    if (!body) return;
    if (!koreksiTemplates.length){ body.innerHTML = '<div class="cal-empty">Belum ada template. Tambahkan template pertama Anda.</div>'; return; }
    body.innerHTML = koreksiTemplates.map((t, i) => `
      <div class="tpl-manage-item">
        <div class="tpl-manage-body">
          <div><span class="tpl-code-badge">${t.code || '-'}</span><span class="lbl">${t.label}</span></div>
          <div class="txt">${t.text}</div>
        </div>
        <div class="tpl-manage-actions">
          <button class="icon-btn" onclick="openTemplateModal('koreksi', ${i})" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="icon-btn danger" onclick="deleteTemplate('koreksi', ${i})" title="Hapus">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  let tplEditing = { kind:null, index:null };
  window.openTemplateModal = function(kind, index){
    tplEditing = { kind:kind, index:index };
    const list = kind === 'koreksi' ? koreksiTemplates : programTemplates;
    const item = (index !== null && index !== undefined) ? list[index] : null;
    document.getElementById('templateModalTitle').textContent = item ? 'Edit Template' : 'Tambah Template';
    document.getElementById('tplCode').style.display = kind === 'koreksi' ? 'block' : 'none';
    document.getElementById('tplCode').value = item && item.code ? item.code : '';
    document.getElementById('tplLabel').value = item ? item.label : '';
    document.getElementById('tplLabel').placeholder = kind === 'koreksi' ? 'Judul singkat template (misal: Bagus & Perlu Ditingkatkan)' : 'Nama program (misal: Program Pemula 5K)';
    document.getElementById('tplText').value = item ? item.text : '';
    document.getElementById('tplText').placeholder = kind === 'koreksi' ? 'Isi teks koreksi lengkap yang akan otomatis mengisi kolom keterangan' : 'Keterangan/deskripsi program yang akan otomatis mengisi kolom saat template ini dipilih';
    document.getElementById('templateModal').classList.add('show');
  };
  window.closeTemplateModal = function(){
    document.getElementById('templateModal').classList.remove('show');
  };
  document.getElementById('templateForm').addEventListener('submit', function(e){
    e.preventDefault();
    const label = document.getElementById('tplLabel').value.trim();
    const text = document.getElementById('tplText').value.trim();
    const code = document.getElementById('tplCode').value.trim();
    if (!label || !text) return;
    const kind = tplEditing.kind;
    const list = kind === 'koreksi' ? koreksiTemplates : programTemplates;
    const obj = kind === 'koreksi' ? { code:code, label:label, text:text } : { label:label, text:text };
    if (tplEditing.index !== null && tplEditing.index !== undefined){
      list[tplEditing.index] = obj;
    } else {
      list.push(obj);
    }
    closeTemplateModal();
    if (kind === 'koreksi'){
      renderKoreksiTemplateList();
      renderSubmissionList();
    } else {
      renderProgramTemplateList();
      renderProgramTplPickList();
    }
    showToast('Template disimpan.');
  });
  window.deleteTemplate = function(kind, index){
    const list = kind === 'koreksi' ? koreksiTemplates : programTemplates;
    list.splice(index, 1);
    if (kind === 'koreksi'){
      renderKoreksiTemplateList();
      renderSubmissionList();
    } else {
      renderProgramTemplateList();
      renderProgramTplPickList();
    }
    showToast('Template dihapus.');
  };

  /* ================= PROGRAM LARI: BUILDER ================= */
  function renderProgramTplPickList(){
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

  function renderProgramTemplateList(){
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

  function populateProgramClientSelect(){
    const el = document.getElementById('programClient');
    if (!el) return;
    el.innerHTML = '<option value="">Pilih klien tujuan</option>' +
      clients.map(c => `<option value="${c.name}">${c.name} (Coach: ${c.coach})</option>`).join('');
  }

  function fmtProgramTime(){
    return new Date().toLocaleString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }

  const PROGRAMS_STORAGE_KEY = 'programs:n6-shared';
  async function syncProgramsToStorage(){
    if (!window.storage) return;
    try{ await window.storage.set(PROGRAMS_STORAGE_KEY, JSON.stringify(sentPrograms), true); }
    catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — data tetap tersimpan lokal */ }
  }
  async function loadProgramsFromStorage(){
    if (!window.storage) return;
    try{
      const raw = await window.storage.get(PROGRAMS_STORAGE_KEY, true);
      if (raw && raw.value) sentPrograms = JSON.parse(raw.value);
    }catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — memakai data lokal */ }
    renderSentProgramList();
  }

  function programStatusBadge(status){
    if (status === 'diproses') return '<span class="badge blue">Sedang Diproses Admin</span>';
    if (status === 'terkirim') return '<span class="badge green">Sudah Dikirim ke Klien</span>';
    return '<span class="badge amber">Menunggu Diproses Admin</span>';
  }

  function renderSentProgramList(){
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

  const programBuildFormEl = document.getElementById('programBuildForm');
  if (programBuildFormEl){
    programBuildFormEl.addEventListener('submit', function(e){
      e.preventDefault();
      const client = document.getElementById('programClient').value;
      const tplName = document.getElementById('programNamaTpl').value.trim();
      const keterangan = document.getElementById('programKeterangan').value.trim();
      if (!client){ showToast('Pilih klien tujuan terlebih dahulu.'); return; }
      if (!tplName){ showToast('Pilih salah satu template program di atas.'); return; }
      sentPrograms.push({ id:'p' + Date.now(), client:client, tplName:tplName, keterangan:keterangan, status:'pending', at:fmtProgramTime() });
      renderSentProgramList();
      syncProgramsToStorage();
      programBuildFormEl.reset();
      selectedProgramTplIndex = null;
      renderProgramTplPickList();
      showToast('Program "' + tplName + '" terkirim ke Admin/CS untuk ' + client + '.');
    });
  }

  /* ================= CHAT INTERNAL: HEAD COACH <-> ADMIN / OWNER ================= */
  function renderChatThread(role){
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

  async function loadInternalChat(role){
    if (window.storage){
      try{
        const key = 'internalchat:headcoach-' + role;
        const raw = await window.storage.get(key, true);
        if (raw && raw.value) internalChats[role] = JSON.parse(raw.value);
      }catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — memakai data lokal */ }
    }
    renderChatThread(role);
  }

  window.sendInternalChat = async function(role){
    const inputEl = document.getElementById(role === 'admin' ? 'chatInputAdmin' : 'chatInputOwner');
    const text = inputEl.value.trim();
    if (!text) return;
    const msg = { sender:'headcoach', text:text, at:new Date().toISOString() };
    internalChats[role] = internalChats[role] || [];
    internalChats[role].push(msg);
    inputEl.value = '';
    renderChatThread(role);
    if (window.storage){
      try{
        const key = 'internalchat:headcoach-' + role;
        await window.storage.set(key, JSON.stringify(internalChats[role]), true);
      }catch(e){ /* penyimpanan tidak tersedia di lingkungan ini — pesan tetap tersimpan lokal di atas */ }
    }
    showToast('Pesan terkirim ke ' + (role === 'admin' ? 'Admin' : 'Owner') + '.');
  };

  window.openClientDetail = function(id){
    const c = clients.find(x => String(x.id) === String(id));
    if (!c) return;
    document.getElementById('clientDetailTitle').textContent = c.name;
    document.getElementById('clientDetailBody').innerHTML = `
      <div class="progress-row">
        <div class="progress-row-top"><span class="pname">Coach</span><span class="pgoal">${c.coach}</span></div>
      </div>
      <div class="progress-row">
        <div class="progress-row-top"><span class="pname">Target</span><span class="pgoal">${c.goal}</span></div>
      </div>
      <div class="progress-row">
        <div class="progress-row-top"><span class="pname">Status</span><span class="badge ${statusTone(c.status)}">${c.status}</span></div>
      </div>
      ${c.note ? `<div class="rapor-note" style="margin-top:12px;"><b>Catatan:</b> ${c.note}</div>` : ''}
      <a href="${clientPortalUrl(c.name, true)}" target="_blank" rel="noopener" class="btn-outline" style="display:block; text-align:center; text-decoration:none; margin-top:16px;">Lihat Dashboard Lengkap Klien ↗</a>
    `;
    document.getElementById('clientDetailModal').classList.add('show');
  };
  window.closeClientDetail = function(){
    document.getElementById('clientDetailModal').classList.remove('show');
  };

  /* ================= RENDER: PERSETUJUAN ================= */
  function renderRescheduleApproval(){
    const el = document.getElementById('rescheduleApprovalList');
    if (!rescheduleRequests.length){ el.innerHTML = '<div class="cal-empty">Belum ada data.</div>'; return; }
    el.innerHTML = rescheduleRequests.map((r, i) => `
      <div class="review-item">
        <div class="review-item-top"><span class="who">${r.coach}</span><span class="when">${statusTag(r.status)}</span></div>
        <div class="stats">${r.sesi} → <b>${r.baru}</b></div>
        <div class="note">${r.alasan || '-'}</div>
        ${r.status === 'Menunggu' ? `
          <div class="action-btns">
            <button class="btn-approve" onclick="setRescheduleStatus(${i},'Disetujui')">Setujui</button>
            <button class="btn-reject" onclick="setRescheduleStatus(${i},'Ditolak')">Tolak</button>
          </div>` : ''}
      </div>
    `).join('');
  }
  function statusTag(status){ return `<span class="badge ${statusTone(status)}">${status}</span>`; }
  window.setRescheduleStatus = function(i, status){
    rescheduleRequests[i].status = status;
    renderRescheduleApproval();
    showToast('Reschedule ' + rescheduleRequests[i].coach + ' ditandai: ' + status);
  };

  function renderCutiApproval(){
    // Fase 3: belum ada endpoint cuti — tampilkan empty state, bukan data dummy.
    document.getElementById('cutiApprovalList').innerHTML =
      '<div class="cal-empty">Belum ada data.</div>';
  }
  window.setCutiStatus = function(i, status){
    if (cutiRequests[i]) cutiRequests[i].status = status;
    renderCutiApproval();
  };

  /* ================= NAV: MAIN TABS ================= */
  const navButtons = document.querySelectorAll('[data-panel]');
  const panels = document.querySelectorAll('.panel');
  const pageTitle = document.getElementById('pageTitle');
  const TITLES = { hub:'Beranda',hcprogram:'Buat Program',hcmanual:'Buat Program',hcclientchat:'Chat dengan Klien',hcmonitor:'Monitoring Klien',home:'Beranda', coach:'Coach', klien:'Klien', atlet:'Atlet Binaan', koreksi:'Koreksi',  chat:'Chat Tim', akun:'Pengaturan & Akun' };
  const MORE_SHEET_PANELS = ['coach', 'atlet', 'chat', 'akun'];
  const moreNavBtn = document.getElementById('moreNavBtn');
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
  const moreSheetOverlay = document.getElementById('moreSheetOverlay');
  function openMoreSheet(){ moreSheetOverlay.classList.add('show'); }
  function closeMoreSheet(){ moreSheetOverlay.classList.remove('show'); }
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
  const sidebarEl = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  function openSidebar(){ sidebarEl.classList.add('open'); sidebarOverlay.classList.add('show'); }
  function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarOverlay.classList.remove('show'); }
  document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ================= INIT ================= */
  // Muat data dari API terlebih dahulu, lalu render. Bila API kosong/error,
  // setiap panel menampilkan empty state "Belum ada data" (tanpa fallback dummy).
  loadAllData();
  loadProgramsFromStorage();
  loadInternalChat('admin');
  loadInternalChat('owner');
})();
