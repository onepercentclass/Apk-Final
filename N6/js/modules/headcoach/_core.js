/**
 * N6 modules - headcoach / _core
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__

  /* ================= API CLIENT ================= */
/*__N6_UNIT__*/  function n6ApiCfg(){ return window.N6_API || {}; }
/*__N6_UNIT__*/  function n6ApiBase(){ return String(n6ApiCfg().base || 'https://api.denisbergkam.com/api/n6').replace(/\/+$/, ''); }
/*__N6_UNIT__*/  function n6ApiToken(){
    try { return window.localStorage.getItem(n6ApiCfg().tokenKey || 'n6:api:token'); }
    catch(e){ return null; }
  }
/*__N6_UNIT__*/  function n6ApiReady(){ return n6ApiCfg().enabled === true && !!n6ApiToken(); }

/*__N6_UNIT__*/  async function n6Api(path){
    const res = await fetch(n6ApiBase() + '/' + String(path).replace(/^\/+/, ''), {
      headers: { 'Authorization': 'Bearer ' + n6ApiToken() }
    });
    if (!res.ok) throw new Error('API ' + res.status + ' ' + path);
    return res.json();
  }

/*__N6_UNIT__*/  function fmtTanggal(iso){
    if (!iso) return '-';
    try {
      const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
      return d.getDate() + ' ' + MONTH_LABEL[d.getMonth()] + ' ' + d.getFullYear();
    } catch(e){ return iso; }
  }

  /* ================= DATA (dari API, bukan dummy) ================= */
/*__N6_UNIT__*/  let coaches = [];
/*__N6_UNIT__*/  let clients = [];
/*__N6_UNIT__*/  let rescheduleRequests = [];
/*__N6_UNIT__*/  let teamAttendance = [];
/*__N6_UNIT__*/  let cutiRequests = [];   // Fase 3: belum ada endpoint cuti
/*__N6_UNIT__*/  let evalHistory = [];    // Fase 3: belum ada endpoint evaluasi

/*__N6_UNIT__*/  function slugify(name){ return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
/*__N6_UNIT__*/  function clientPortalUrl(name, staff){
    return 'dashboard-client.html?client=' + encodeURIComponent(slugify(name)) + (staff ? '&staff=1' : '');
  }

  /* Fase 3: diisi dari GET dashboards/headcoach/team; kosong -> grafik tampil kosong (tanpa fallback dummy). */
/*__N6_UNIT__*/  const chartData = {
    coachLabels: [],
    scoreCoach: [],
    ratingCoach: [],
    bulanLabel: [],
    kehadiranTren: [],
    statusKlien: { normal:0, bermasalah:0, cedera:0 }
  };

/*__N6_UNIT__*/  let teamActivityList = [];   // Fase 3: diisi dari GET dashboards/headcoach/team (activities)

  /* rescheduleRequests, cutiRequests, evalHistory, teamAttendance dideklarasikan di atas (diisi dari API) */

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

  /* ================= LOADERS (API) ================= */
/*__N6_UNIT__*/  const REQ_STATUS_LABEL = { menunggu:'Menunggu', disetujui:'Disetujui', ditolak:'Ditolak' };
/*__N6_UNIT__*/  const ATT_STATUS_LABEL = { hadir:'Tepat Waktu', izin:'Izin', sakit:'Sakit', alpha:'Alpha' };

/*__N6_UNIT__*/  function coachNameById(id){
    const c = coaches.find(x => String(x.id) === String(id));
    return c ? c.name : '-';
  }
/*__N6_UNIT__*/  function clientNameById(id){
    const c = clients.find(x => String(x.id) === String(id));
    return c ? c.name : '-';
  }

/*__N6_UNIT__*/  async function loadCoaches(){
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

/*__N6_UNIT__*/  async function loadClients(){
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
    // Expose ke window agar modul legacy (Monitoring Klien) bisa baca data API.
    try {
      if (typeof window !== 'undefined') {
        window.n6ApiClients = clients;
      }
    } catch (e) {}
  }

/*__N6_UNIT__*/  async function loadRescheduleRequests(){
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

/*__N6_UNIT__*/  async function loadTeamAttendance(){
    const page = await n6Api('attendance?limit=200');
    const items = (page && page.items) || [];
    teamAttendance = items.map(a => ({
      coach: a.coach_id != null ? coachNameById(a.coach_id) : '-',
      client: a.client_id != null ? clientNameById(a.client_id) : '-',
      tanggal: fmtTanggal(a.session_on),
      status: ATT_STATUS_LABEL[a.status] || a.status,
    }));
  }

/*__N6_UNIT__*/  async function loadTeamDashboard(){
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

/*__N6_UNIT__*/  function setLoading(sel){
    const el = document.getElementById(sel);
    if (el) el.innerHTML = '<div class="cal-empty">Memuat data...</div>';
  }

/*__N6_UNIT__*/  async function loadAllData(){
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

