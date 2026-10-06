/**
 * N6 dist bundle - coach
 *
 * GENERATED FILE - do not edit. Source of truth is js/modules/coach/*.js
 * Rebuilt by tools/build.sh; concatenation is byte-identical to the
 * original <script> block in coach.html.
 * Build: git:f99262a
 */


(function(){
  /* ================= API CLIENT ================= */
  function n6ApiCfg(){ return window.N6_API || {}; }
  function n6ApiBase(){ return String(n6ApiCfg().base || 'https://api.denisbergkam.com/api/n6').replace(/\/+$/, ''); }
  function n6ApiToken(){
    try { return window.localStorage.getItem(n6ApiCfg().tokenKey || 'n6:api:token'); }
    catch(e){ return null; }
  }
  function n6ApiUser(){
    try { return JSON.parse(window.localStorage.getItem(n6ApiCfg().userKey || 'n6:api:user') || 'null'); }
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
  function fmtTanggalID(iso){
    if (!iso) return '-';
    try {
      const d = new Date(String(iso).length <= 10 ? iso + 'T00:00:00' : iso);
      const MON = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
      return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
    } catch(e){ return String(iso); }
  }

  /* ================= DATA (dari API, bukan dummy) ================= */
  // Jadwal hari ini — dari GET /schedules/coach (template mingguan, difilter ke hari ini)
  let schedule = [];
  let scheduleSlots = []; // template mingguan penuh (untuk jadwal terdekat & kalender)
  // Urutan hari API: 1=Senin..7=Minggu ; JS getDay(): 0=Minggu..6=Sabtu
  function apiWeekday(jsDay){ return ((jsDay + 6) % 7) + 1; }
  async function loadSchedule(){
    const data = await n6Api('schedules/coach');
    const slots = (data && data.slots) || [];
    scheduleSlots = slots.filter(s => s.active !== false);
    const todayWd = apiWeekday(new Date().getDay());
    schedule = scheduleSlots
      .filter(s => s.weekday === todayWd)
      .sort((a,b) => String(a.start_time || '').localeCompare(String(b.start_time || '')))
      .map(s => ({
        time: s.start_time || '--:--',
        client: s.note || s.training_category || '—',
        loc: s.location || '—',
        status: 'Terjadwal',
        attendance: null
      }));
  }

  // Klien binaan — dari GET /clients (backend otomatis memfilter milik coach yang login)
  let clients = [];
  let clientsRaw = [];
  async function loadClients(){
    const page = await n6Api('clients?limit=200');
    const items = (page && page.items) || [];
    clientsRaw = items;
    clients = items.map(c => ({
      id: c.id,
      name: c.name,
      goal: c.notes || '—',
      last: '—',
      type: '—',
      produk: '—',
      status: c.status === 'aktif' ? 'Aktif' : (c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : '—'),
      mulai: c.joined_on ? fmtTanggalID(c.joined_on) : '—',
      selesai: '—'
    }));
  }

  // Progres klien — dari GET /dashboards/coach/me → { progress: [{client_id, name, pct, last_session, note}] }
  // Endpoint agregat dibuat di backend Fase 3; bila belum ada (404) → kosong + empty state, tanpa fallback dummy.
  let clientProgress = [];
  let coachDashboard = null;
  async function loadCoachDashboard(){
    const data = await n6Api('dashboards/coach/me');
    coachDashboard = data || {};
    const goalById = {};
    clients.forEach(c => { if (c.id != null) goalById[c.id] = c.goal; });
    const items = coachDashboard.progress || [];
    clientProgress = items.map(p => ({
      id: p.client_id != null ? p.client_id : null,
      name: p.name || '—',
      goal: goalById[p.client_id] || '—',
      progress: p.pct != null ? Math.max(0, Math.min(100, Math.round(Number(p.pct)))) : 0,
      note: p.note || '—'
    }));
    chartData = buildChartDataFromDashboard(coachDashboard);
  }

  // Statistik home — dari data API (bukan angka hardcoded di HTML).
  // Gagal/kosong → "—", tanpa fallback dummy.
  function renderHomeStats(){
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const hasData = (coachDashboard && Object.keys(coachDashboard).length) || clients.length || schedule.length;

    // Klien Aktif
    let aktif = null;
    if (coachDashboard && coachDashboard.clients && coachDashboard.clients.aktif != null) {
      aktif = Number(coachDashboard.clients.aktif);
    } else if (clients.length) {
      aktif = clients.filter(c => c.status === 'Aktif').length;
    }
    set('statKlienAktif', aktif != null ? String(aktif) : '—');
    // Klien baru bulan ini (dari joined_on mentah)
    let baruBulanIni = null;
    if (clientsRaw.length) {
      const now = new Date(), ym = now.getFullYear() + '-' + now.getMonth();
      baruBulanIni = clientsRaw.filter(c => {
        if (!c.joined_on) return false;
        const d = new Date(c.joined_on.length <= 10 ? c.joined_on + 'T00:00:00' : c.joined_on);
        return !isNaN(d) && (d.getFullYear() + '-' + d.getMonth()) === ym;
      }).length;
    }
    set('statKlienAktifSub', baruBulanIni != null ? (baruBulanIni + ' baru bulan ini') : '—');

    // Sesi Hari Ini
    set('statSesiHariIni', hasData ? String(schedule.length) : '—');
    set('statSesiHariIniSub', hasData ? (schedule.length ? 'Terjadwal hari ini' : 'Tidak ada sesi hari ini') : '—');

    // Kehadiran — rata-rata progres klien dari dashboard agregat
    let hadirPct = null;
    const progs = (coachDashboard && coachDashboard.progress) || [];
    if (progs.length) {
      const vals = progs.map(p => Number(p.pct)).filter(v => !isNaN(v));
      if (vals.length) hadirPct = Math.round(vals.reduce((a,b) => a + b, 0) / vals.length);
    }
    set('statKehadiran', hadirPct != null ? hadirPct + '%' : '—');
  }

  // Dropdown klien (form log) — dari GET /clients
  function populateLogClient(){
    const sel = document.getElementById('logClient');
    if (!sel) return;
    sel.innerHTML = '<option value="">Pilih klien</option>' +
      clients.map(c => `<option value="${String(c.name || '').replace(/"/g,'&quot;')}">${String(c.name || '—').replace(/</g,'&lt;')}</option>`).join('');
  }

  // Dropdown sesi (form reschedule) — dari GET /schedules/coach (slot hari ini)
  function populateRsSesi(){
    const sel = document.getElementById('rsSesi');
    if (!sel) return;
    const opts = schedule.map(s => {
      const label = (s.client || '—') + ' — ' + (s.time || '--:--');
      const esc = String(label).replace(/</g,'&lt;').replace(/"/g,'&quot;');
      return `<option value="${esc}">${esc}</option>`;
    }).join('');
    sel.innerHTML = '<option value="">Pilih sesi terjadwal</option>' + opts;
  }

  // Rapor per klien — dari GET /dashboards/clients/{id}/progress → { client, sessions, report, history }
  // Belum ada endpoint → hasil null → empty state "Belum ada data", bukan dummy.
  let raporCache = {};   // clientId -> { sesi, totalJarak, avgPace, kehadiran, catatan } | null
  let raporCurrentId = null;
  function normalizeRapor(data){
    if (!data || typeof data !== 'object') return null;
    const sessions = data.sessions || {};
    const report = data.report || {};
    const sesi = sessions.total != null ? Number(sessions.total) : null;
    if (sesi == null && report.total_jarak == null && report.avg_pace == null && report.totalJarak == null && report.avgPace == null) return null;
    return {
      sesi: sesi != null ? sesi : '—',
      totalJarak: report.total_jarak || report.totalJarak || '—',
      avgPace: report.avg_pace || report.avgPace || '—',
      kehadiran: sessions.pct != null ? Math.round(Number(sessions.pct)) + '%' : '—',
      catatan: report.catatan || report.note || '—'
    };
  }

  // Data grafik — dari GET /dashboards/coach/me (distribusi status + tren performa).
  // Belum ada endpoint → grafik kosong, bukan dummy. Rating: endpoint tidak menyediakan → tampil "-".
  let chartData = emptyChartData();
  function emptyChartData(){
    return {
      bulanLabel: ['—'],
      pencapaianKlien: [0],
      performaLabel: ['—'],
      performaTren: [0],
      statusKlien: { normal: 0, bermasalah: 0, cedera: 0 },
      profesional: { labels: [], values: [] },
      ratingTren: []
    };
  }
  function buildChartDataFromDashboard(d){
    const byStatus = (d && d.clients && d.clients.by_status) || {};
    const num = v => (v == null || isNaN(Number(v)) ? 0 : Number(v));
    const items = (d && d.progress) || [];
    const labels = items.map(p => String(p.name || '—').split(' ')[0]);
    return {
      bulanLabel: ['—'],
      pencapaianKlien: [0],
      performaLabel: labels.length ? labels : ['—'],
      performaTren: items.length ? items.map(p => num(p.pct)) : [0],
      statusKlien: {
        normal: num(byStatus.aktif) + num(byStatus.normal),
        bermasalah: num(byStatus.bermasalah) + num(byStatus.nonaktif) + num(byStatus.tidak_aktif),
        cedera: num(byStatus.cedera)
      },
      profesional: { labels: [], values: [] },
      ratingTren: []
    };
  }

  // Riwayat absensi sesi klien — dari GET /attendance (difilter milik coach oleh backend)
  let coachAttendanceList = [];
  const ATT_LABEL = { hadir:'Hadir', izin:'Izin', sakit:'Sakit', alpha:'Alpha' };
  async function loadCoachAttendance(){
    const page = await n6Api('attendance?limit=200');
    const items = (page && page.items) || [];
    const nameById = {};
    clients.forEach(c => { if (c.id != null) nameById[c.id] = c.name; });
    coachAttendanceList = items.map(a => ({
      tanggal: fmtTanggalID(a.session_on),
      sesi: nameById[a.client_id] || ('Klien #' + a.client_id),
      status: ATT_LABEL[a.status] || a.status,
      ket: a.note || '-',
      feedback: null
    }));
  }
  const coachPeriode = (() => { const y = new Date().getFullYear(); return { mulai:"1 Januari " + y, selesai:"31 Desember " + y }; })();

  // Riwayat aktivitas — TIDAK ADA endpoint khusus → kosong + empty state, bukan dummy.
  const historyList = [];

  // Komisi coach — dari GET /commissions/summary?period=YYYY-MM (satu baris per coach per bulan)
  let gajiSummary = null;
  let gajiCoachName = '';
  function currentPeriodKey(){
    return gajiFilterState.tahun + '-' + String(gajiFilterState.bulan).padStart(2,'0');
  }
  async function loadGaji(){
    const data = await n6Api('commissions/summary?period=' + currentPeriodKey());
    const rows = (data && data.rows) || [];
    const me = n6ApiUser();
    const myCoachId = me && me.coach_id != null ? me.coach_id : null;
    gajiSummary = myCoachId != null ? (rows.find(r => String(r.coach_id) === String(myCoachId)) || null) : null;
    gajiCoachName = (me && (me.full_name || me.username)) || 'Coach';
  }
  async function refreshGaji(){
    renderGajiLoading();
    try { await loadGaji(); }
    catch(e){ console.warn('[coach] gaji', e); gajiSummary = null; }
    renderGaji();
  }
  function renderGajiLoading(){
    const el = document.getElementById('gajiSesiBody');
    if (el) el.innerHTML = '<tr><td colspan="3" class="muted" style="text-align:center; padding:24px 0;">Memuat data...</td></tr>';
  }

  // Rapor kinerja coach — TIDAK ADA endpoint evaluasi → kosong + empty state, bukan dummy.
  const coachRaporList = [];

  // Pengajuan reschedule — dari GET /schedules/coach/requests (endpoint sudah ada).
  const REQ_STATUS_LABEL = { menunggu:'Menunggu', disetujui:'Disetujui', ditolak:'Ditolak' };
  let rescheduleRequests = [];
  async function loadRescheduleRequests(){
    const page = await n6Api('schedules/coach/requests?limit=200');
    const items = (page && page.items) || [];
    const nameById = {};
    clients.forEach(c => { if (c.id != null) nameById[c.id] = c.name; });
    rescheduleRequests = items.map(r => ({
      id: r.id,
      sesi: (nameById[r.client_id] || 'Klien') + (r.current_start ? ' — ' + r.current_start : ''),
      baru: r.requested_on ? fmtTanggalID(r.requested_on) : '—',
      alasan: r.reason || '-',
      status: REQ_STATUS_LABEL[r.status] || r.status || 'Menunggu'
    }));
  }

  // Pengajuan cuti — TIDAK ADA endpoint → kosong + empty state (sesuai keputusan).
  let cutiRequests = [];

  // Tanda waktu coach tidak bisa mengajar (agar Admin tahu saat mengatur jadwal klien baru)
  // Data input user lokal — mulai kosong, diisi via UI. Bukan dummy.
  let coachUnavailable = [];
  let unavailIdSeq = 1;

  // Jadwal pertemuan terdekat — dibangun dari template mingguan GET /schedules/coach.
  let upcomingSchedule = [];
  const DOW_ID_FULL = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  function buildUpcomingSchedule(){
    const out = [];
    const today = new Date(); today.setHours(0,0,0,0);
    for (let i = 0; i < 14 && out.length < 10; i++){
      const d = new Date(today); d.setDate(d.getDate() + i);
      const wd = apiWeekday(d.getDay());
      scheduleSlots
        .filter(s => s.weekday === wd)
        .sort((a,b) => String(a.start_time || '').localeCompare(String(b.start_time || '')))
        .forEach(s => out.push({
          date: DOW_ID_FULL[d.getDay()] + ', ' + fmtTanggalID(d.toISOString().slice(0,10)),
          time: s.start_time || '--:--',
          client: s.note || s.training_category || '—',
          loc: s.location || '—'
        }));
    }
    upcomingSchedule = out;
  }

  // Sesi per tanggal (kalender 30 hari) — dari template mingguan GET /schedules/coach, bukan pola hardcoded.
  function getSessionsForDate(date){
    const wd = apiWeekday(date.getDay());
    return scheduleSlots
      .filter(s => s.weekday === wd)
      .sort((a,b) => String(a.start_time || '').localeCompare(String(b.start_time || '')))
      .map(s => ({
        time: s.start_time || '--:--',
        client: s.note || s.training_category || '—',
        loc: s.location || '—'
      }));
  }

  // Log latihan — dari data absensi nyata (GET /attendance); jarak/pace tidak ada sumbernya → '—'.
  // Form tambah log tetap jalan (unshift ke array ini).
  let logs = [];
  function buildLogsFromAttendance(){
    logs = coachAttendanceList.map(a => ({
      client: a.sesi,
      date: a.tanggal,
      distance: '—',
      pace: '—',
      loc: '—',
      note: a.ket && a.ket !== '-' ? a.ket : ''
    }));
  }

  const fmtIDR = n => "Rp" + n.toLocaleString('id-ID');

  /* ================= ICONS ================= */
  const ICONS = {
    hadir: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>',
    tidak: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    izin:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    trophy:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3a2 2 0 0 1-2 4M7 5H4a2 2 0 0 0 2 4"/></svg>'
  };

  /* ================= RENDER: SCHEDULE / ABSENSI ================= */
  function statusBadge(status){
    const tone = status === "Selesai" ? "green" : status === "Terjadwal" ? "amber" : "neutral";
    return `<span class="badge ${tone}">${status}</span>`;
  }
  function attendanceButtons(idx, current){
    return `
      <div class="att-btns">
        <button class="att-btn hadir ${current==='hadir'?'active':''}" title="Hadir" onclick="markAttendance(${idx}, 'hadir')">${ICONS.hadir}</button>
        <button class="att-btn tidak ${current==='tidak'?'active':''}" title="Tidak Hadir" onclick="markAttendance(${idx}, 'tidak')">${ICONS.tidak}</button>
        <button class="att-btn izin ${current==='izin'?'active':''}" title="Izin" onclick="markAttendance(${idx}, 'izin')">${ICONS.izin}</button>
      </div>`;
  }
  function renderSchedule(){
    const homeEl = document.getElementById('scheduleBodyHome');
    const absEl = document.getElementById('scheduleBodyAbsensi');
    let rowsHtml;
    if (!schedule.length){
      rowsHtml = '<tr><td colspan="5" class="muted" style="text-align:center; padding:24px 0;">Belum ada data</td></tr>';
    } else {
      rowsHtml = schedule.map((s, i) => `
      <tr>
        <td class="muted">${s.time}</td>
        <td class="strong">${s.client}</td>
        <td class="muted">${s.loc}</td>
        <td>${statusBadge(s.status)}</td>
        <td class="right">${attendanceButtons(i, s.attendance)}</td>
      </tr>
    `).join('');
    }
    if (homeEl) homeEl.innerHTML = rowsHtml;
    if (absEl) absEl.innerHTML = rowsHtml;
    // Isi opsi sesi pada form absensi dari jadwal hari ini (bukan dummy)
    const sel = document.getElementById('acSesi');
    if (sel){
      sel.innerHTML = '<option value="">Pilih sesi hari ini</option>' +
        schedule.map(s => {
          const label = s.time + ' — ' + s.client;
          return `<option value="${label}">${label}</option>`;
        }).join('');
    }
  }
  function renderScheduleLoading(){
    const html = '<tr><td colspan="5" class="muted" style="text-align:center; padding:24px 0;">Memuat data...</td></tr>';
    const homeEl = document.getElementById('scheduleBodyHome');
    const absEl = document.getElementById('scheduleBodyAbsensi');
    if (homeEl) homeEl.innerHTML = html;
    if (absEl) absEl.innerHTML = html;
  }
  window.markAttendance = function(idx, value){
    if (!schedule[idx]) return;
    schedule[idx].attendance = schedule[idx].attendance === value ? null : value;
    if (schedule[idx].attendance === 'hadir') schedule[idx].status = 'Selesai';
    renderSchedule();
    showToast(schedule[idx].attendance ? ('Absensi ' + schedule[idx].client + ' dicatat') : 'Absensi dibatalkan');
  };

  /* ================= RENDER: JADWAL PERTEMUAN TERDEKAT ================= */
  function renderUpcoming(){
    const body = document.getElementById('upcomingBody');
    if (!upcomingSchedule.length){
      body.innerHTML = '<tr><td colspan="4" class="muted" style="text-align:center; padding:24px 0;">Belum ada data</td></tr>';
      return;
    }
    body.innerHTML = upcomingSchedule.map(u => `
      <tr>
        <td class="strong">${u.date}</td>
        <td class="muted">${u.time}</td>
        <td class="strong">${u.client}</td>
        <td class="muted right">${u.loc}</td>
      </tr>
    `).join('');
  }

  /* ================= RENDER: PRESTASI CHARTS ================= */
  const CHART_RED = '#D62828';
  const CHART_INK = '#111110';
  const CHART_ASPHALT = '#6E6C64';
  const CHART_GREEN = '#1E8E3E';
  const CHART_AMBER = '#B7791F';
  const CHART_GRID = '#F0EEE7';

  function buildChartConfig(key){
    if (key === 'pencapaian') return {
      type: 'bar',
      data: {
        labels: chartData.bulanLabel,
        datasets: [{ data: chartData.pencapaianKlien, backgroundColor: CHART_RED, borderRadius: 4, maxBarThickness: 28 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display:false } },
        scales: {
          x: { grid: { display:false }, ticks:{ color: CHART_ASPHALT, font:{size:11} } },
          y: { beginAtZero:true, ticks:{ stepSize:1, color: CHART_ASPHALT, font:{size:11} }, grid:{ color: CHART_GRID } }
        }
      }
    };
    if (key === 'performa') return {
      type: 'line',
      data: {
        labels: chartData.performaLabel,
        datasets: [{
          data: chartData.performaTren, borderColor: CHART_RED, backgroundColor: 'rgba(214,40,40,0.08)',
          fill:true, tension:0.35, pointRadius:3, pointBackgroundColor: CHART_RED
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label: (c)=>c.parsed.y+'%' } } },
        scales:{
          x:{ grid:{display:false}, ticks:{ color:CHART_ASPHALT, font:{size:11} } },
          y:{ ticks:{ callback:(v)=>v+'%', color:CHART_ASPHALT, font:{size:11} }, grid:{ color:CHART_GRID } }
        }
      }
    };
    if (key === 'statusKlien') return {
      type:'doughnut',
      data:{
        labels:['Aktif Normal','Bermasalah','Cedera'],
        datasets:[{
          data:[chartData.statusKlien.normal, chartData.statusKlien.bermasalah, chartData.statusKlien.cedera],
          backgroundColor:[CHART_GREEN, CHART_AMBER, CHART_RED], borderWidth:0
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:false, cutout:'62%',
        plugins:{ legend:{ position:'bottom', labels:{ boxWidth:10, font:{size:11}, color:CHART_INK } } }
      }
    };
    if (key === 'profesional') return {
      type:'radar',
      data:{
        labels: chartData.profesional.labels,
        datasets:[{
          data: chartData.profesional.values, borderColor: CHART_RED, backgroundColor:'rgba(214,40,40,0.12)',
          pointBackgroundColor: CHART_RED, pointRadius:3
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false } },
        scales:{
          r:{ min:0, max:100, ticks:{ display:false, stepSize:25 }, grid:{ color:CHART_GRID }, pointLabels:{ font:{size:10.5}, color:CHART_ASPHALT } }
        }
      }
    };
    if (key === 'ratingTren') return {
      type:'line',
      data:{
        labels: chartData.bulanLabel,
        datasets:[{
          data: chartData.ratingTren, borderColor: CHART_INK, backgroundColor:'transparent',
          tension:0.35, pointRadius:2.5, pointBackgroundColor:CHART_INK, borderWidth:2
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false} },
        scales:{
          x:{ display:false },
          y:{ min:4, max:5, ticks:{ stepSize:0.5, color:CHART_ASPHALT, font:{size:10} }, grid:{ color:CHART_GRID } }
        }
      }
    };
  }

  function renderCharts(){
    new Chart(document.getElementById('chartPencapaian'), buildChartConfig('pencapaian'));
    new Chart(document.getElementById('chartPerforma'), buildChartConfig('performa'));
    new Chart(document.getElementById('chartStatusKlien'), buildChartConfig('statusKlien'));
    new Chart(document.getElementById('chartProfesional'), buildChartConfig('profesional'));
    new Chart(document.getElementById('chartRatingTren'), buildChartConfig('ratingTren'));

    // Star rating — endpoint tidak menyediakan rating → tampilkan "-" dan bintang kosong
    const ratingBox = document.getElementById('coachStars').closest('.score-box');
    const ratingBig = ratingBox ? ratingBox.querySelector('.big') : null;
    if (ratingBig) ratingBig.innerHTML = '-';
    const rating = chartData.ratingTren.length ? chartData.ratingTren[chartData.ratingTren.length-1] : null;
    const full = rating != null ? Math.floor(rating) : 0;
    const starsHtml = Array.from({length:5}, (_, i) => {
      const cls = i < full ? 'filled' : 'empty';
      return `<svg class="${cls}" viewBox="0 0 24 24" stroke-width="1.5"><polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 16.8 5.5 21 7.5 13.5 2 9 9 9"/></svg>`;
    }).join('');
    document.getElementById('coachStars').innerHTML = starsHtml;
  }

  /* ================= MODAL: POPUP GRAFIK (untuk tampilan mobile) ================= */
  let chartModalInstance = null;
  window.openChartModal = function(key, title){
    document.getElementById('chartModalTitle').textContent = title;
    document.getElementById('chartModal').classList.add('show');
    if (chartModalInstance) { chartModalInstance.destroy(); chartModalInstance = null; }
    const canvas = document.getElementById('chartModalCanvas');
    chartModalInstance = new Chart(canvas, buildChartConfig(key));
  };
  window.closeChartModal = function(){
    document.getElementById('chartModal').classList.remove('show');
    if (chartModalInstance) { chartModalInstance.destroy(); chartModalInstance = null; }
  };

  /* ================= RENDER: CLIENTS ================= */
  function typeBadge(type){ return `<span class="badge neutral">${type}</span>`; }
  function clientStatusBadge(status){ return `<span class="badge ${status==='Aktif'?'green':'amber'}">${status}</span>`; }
  function renderClients(){
    const el = document.getElementById('clientList');
    const head = document.querySelector('#klien-daftar .card-head h3');
    if (head) head.textContent = 'Klien (' + clients.length + ')';
    if (!clients.length){
      el.innerHTML = '<div class="cal-empty">Belum ada data</div>';
      return;
    }
    el.innerHTML = clients.map(c => `
      <div class="client-row">
        <div>
          <div class="name">${c.name}</div>
          <div class="meta">Target: ${c.goal} · Sesi terakhir: ${c.last}</div>
          <div class="meta">Program: ${c.mulai} — ${c.selesai}</div>
        </div>
        <div class="client-tags">
          <span class="badge neutral">${c.produk}</span>
          ${typeBadge(c.type)}${clientStatusBadge(c.status)}
        </div>
      </div>
    `).join('');
  }

  /* ================= RENDER: PROGRESS ================= */
  function renderProgress(){
    const el = document.getElementById('progressList');
    if (!clientProgress.length){
      el.innerHTML = '<div class="cal-empty">Belum ada data</div>';
      return;
    }
    el.innerHTML = clientProgress.map(p => `
      <div class="progress-row">
        <div class="progress-row-top">
          <span class="pname">${p.name}</span>
          <span class="pgoal">Target: ${p.goal} · ${p.progress}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${p.progress}%"></div></div>
        <div class="progress-note">${p.note}</div>
        <button class="btn-outline" style="margin-top:10px; padding:8px 16px; font-size:12px;" onclick="openClientDetail('${p.name}')">Detail Klien</button>
      </div>
    `).join('');
  }

  /* ================= MODAL: DETAIL KLIEN (riwayat catatan latihan) ================= */
  window.openClientDetail = function(name){
    document.getElementById('clientDetailTitle').textContent = 'Riwayat Latihan — ' + name;
    const history = logs.filter(l => l.client === name);
    const body = document.getElementById('clientDetailBody');
    if (!history.length){
      body.innerHTML = `<div class="modal-empty">Belum ada catatan latihan untuk klien ini.</div>`;
    } else {
      body.innerHTML = history.map(l => `
        <div class="log-item">
          <div class="log-item-top"><span>${l.date}</span><span class="date">${l.loc}</span></div>
          <div class="stats">${l.distance} · ${l.pace}</div>
          <div class="note">${l.note || '-'}</div>
        </div>
      `).join('');
    }
    document.getElementById('clientDetailModal').classList.add('show');
  };
  window.closeClientDetail = function(){
    document.getElementById('clientDetailModal').classList.remove('show');
  };

  /* ================= RENDER: RAPOR KLIEN ================= */
  function renderRaporSelect(){
    const sel = document.getElementById('raporClientSelect');
    if (!clients.length){
      sel.innerHTML = '<option value="">Belum ada klien</option>';
      document.getElementById('raporStats').innerHTML = '<div class="cal-empty">Belum ada data</div>';
      document.getElementById('raporNote').innerHTML = '';
      return;
    }
    sel.innerHTML = clients.map(c => `<option value="${c.id != null ? c.id : ''}">${c.name}</option>`).join('');
    sel.onchange = () => loadAndRenderRapor(sel.value);
    loadAndRenderRapor(clients[0].id);
  }
  async function loadAndRenderRapor(clientId){
    raporCurrentId = clientId;
    const statsEl = document.getElementById('raporStats');
    const noteEl = document.getElementById('raporNote');
    if (clientId == null || clientId === ''){
      statsEl.innerHTML = '<div class="cal-empty">Belum ada data</div>';
      noteEl.innerHTML = '';
      return;
    }
    if (Object.prototype.hasOwnProperty.call(raporCache, clientId)){
      renderRaporDetail(raporCache[clientId]);
      return;
    }
    statsEl.innerHTML = '<div class="cal-empty">Memuat data...</div>';
    noteEl.innerHTML = '';
    let data = null;
    try {
      const res = await n6Api('dashboards/clients/' + encodeURIComponent(clientId) + '/progress');
      data = normalizeRapor(res);
    } catch(e){
      // Endpoint belum ada (404) atau gagal → empty state, bukan dummy
      console.warn('[coach] rapor', e);
      data = null;
    }
    // Abaikan hasil basi bila user sudah pindah klien saat fetch berjalan
    if (raporCurrentId !== clientId) return;
    raporCache[clientId] = data;
    renderRaporDetail(data);
  }
  function renderRaporDetail(r){
    if (!r){
      document.getElementById('raporStats').innerHTML = '<div class="cal-empty">Belum ada data</div>';
      document.getElementById('raporNote').innerHTML = '';
      return;
    }
    document.getElementById('raporStats').innerHTML = `
      <div class="rapor-stat"><div class="l">Total Sesi</div><div class="v">${r.sesi}</div></div>
      <div class="rapor-stat"><div class="l">Total Jarak</div><div class="v">${r.totalJarak}</div></div>
      <div class="rapor-stat"><div class="l">Rata-rata Pace</div><div class="v">${r.avgPace}</div></div>
      <div class="rapor-stat"><div class="l">Kehadiran</div><div class="v">${r.kehadiran}</div></div>
    `;
    document.getElementById('raporNote').innerHTML = `<b>Catatan Coach:</b> ${r.catatan}`;
  }

  /* ================= RENDER: HISTORY ================= */
  function renderHistory(){
    const el = document.getElementById('historyList');
    if (!historyList.length){
      el.innerHTML = '<div class="cal-empty">Belum ada data</div>';
      return;
    }
    el.innerHTML = historyList.map(h => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-body">
          <div class="act">${h.activity}</div>
          <div class="date">${h.date} · ${h.type}</div>
        </div>
      </div>
    `).join('');
  }

  /* ================= RENDER: GAJI ================= */
  const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  let gajiFilterState = { bulan: 9, tahun: 2026 };

  function populateGajiFilters(){
    const now = new Date();
    const years = [now.getFullYear(), now.getFullYear() - 1];
    const selBulan = document.getElementById('gajiFilterBulan');
    const selTahun = document.getElementById('gajiFilterTahun');
    selBulan.innerHTML = MONTH_NAMES.map((m, i) => `<option value="${i+1}">${m}</option>`).join('');
    selTahun.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
    gajiFilterState = { bulan: now.getMonth() + 1, tahun: now.getFullYear() };
    selBulan.value = gajiFilterState.bulan;
    selTahun.value = gajiFilterState.tahun;
    selBulan.onchange = () => { gajiFilterState.bulan = Number(selBulan.value); refreshGaji(); };
    selTahun.onchange = () => { gajiFilterState.tahun = Number(selTahun.value); refreshGaji(); };
  }

  function renderGaji(){
    const label = MONTH_NAMES[gajiFilterState.bulan-1] + ' ' + gajiFilterState.tahun;
    document.getElementById('gajiPeriodeLabel').textContent = 'Rincian Komisi — ' + label;
    const row = gajiSummary;
    if (!row){
      document.getElementById('gajiTotalBulan').textContent = '-';
      document.getElementById('gajiBonusBulan').textContent = '-';
      document.getElementById('gajiBonusKet').textContent = 'Belum ada data';
      document.getElementById('gajiPotonganBulan').textContent = '-';
      document.getElementById('gajiJumlahSesi').textContent = '-';
      document.getElementById('gajiSesiBody').innerHTML = '<tr><td colspan="3" class="muted" style="text-align:center; padding:24px 0;">Belum ada data</td></tr>';
      return;
    }
    const amount = Number(row.amount || 0);
    document.getElementById('gajiTotalBulan').textContent = fmtIDR(amount);
    document.getElementById('gajiBonusBulan').textContent = '-';
    document.getElementById('gajiBonusKet').textContent = 'Belum ada data bonus';
    document.getElementById('gajiPotonganBulan').textContent = '-';
    document.getElementById('gajiJumlahSesi').textContent = '-';
    document.getElementById('gajiSesiBody').innerHTML = `
      <tr style="cursor:pointer;" onclick="openGajiDetail()">
        <td class="strong">${label}</td>
        <td class="muted">${row.paid ? 'Lunas' + (row.paid_on ? ' · ' + fmtTanggalID(row.paid_on) : '') : 'Belum dibayar'}</td>
        <td class="right strong">${fmtIDR(amount)}</td>
      </tr>`;
  }

  window.openGajiDetail = function(){
    const row = gajiSummary;
    if (!row) return;
    const label = MONTH_NAMES[gajiFilterState.bulan-1] + ' ' + gajiFilterState.tahun;
    const gross = Number(row.gross || 0);
    const amount = Number(row.amount || 0);
    const ratePct = row.rate != null ? (Number(row.rate) * 100).toFixed(1).replace('.', ',') + '%' : '-';
    document.getElementById('gajiDetailBody').innerHTML = `
      <div class="progress-row"><div class="progress-row-top"><span class="pname">Periode</span><span class="pgoal">${label}</span></div></div>
      <div class="progress-row"><div class="progress-row-top"><span class="pname">Total Nilai Sesi (Gross)</span><span class="pgoal">${fmtIDR(gross)}</span></div></div>
      <div class="progress-row"><div class="progress-row-top"><span class="pname">Tarif Komisi</span><span class="pgoal">${ratePct}</span></div></div>
      <div class="progress-row"><div class="progress-row-top"><span class="pname">Komisi Diterima</span><span class="pgoal" style="font-weight:800; color:var(--ink);">${fmtIDR(amount)}</span></div></div>
      <div class="progress-row"><div class="progress-row-top"><span class="pname">Status Pembayaran</span><span class="pgoal">${row.paid ? 'Lunas' + (row.paid_on ? ' (' + fmtTanggalID(row.paid_on) + ')' : '') : 'Belum dibayar'}</span></div></div>
    `;
    document.getElementById('gajiDetailModal').classList.add('show');
  };
  window.closeGajiDetail = function(){
    document.getElementById('gajiDetailModal').classList.remove('show');
  };

  /* ================= PDF: HEADER & FOOTER BERSAMA (branding konsisten) ================= */
  // Header hitam + garis aksen merah di bawahnya, dipakai di semua PDF (Rapor & Slip Gaji)
  function pdfHeader(doc, subtitle){
    const pageW = doc.internal.pageSize.getWidth();
    const headerH = 66;
    doc.setFillColor(17,17,16); // --ink
    doc.rect(0, 0, pageW, headerH, 'F');
    // Logo N6 putih (transparan), rasio asli dijaga agar tidak gepeng, mengikuti ukuran teks
    const logoW = 66, logoH = 34.1;
    const logoX = 30, logoY = (headerH - logoH) / 2;
    try { doc.addImage(LOGO_DATA, 'PNG', logoX, logoY, logoW, logoH); } catch(e){ if(window.logger) window.logger.caught('coach/keuangan', 'operasi', e); }
    const textX = logoX + logoW + 16;
    doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.setTextColor(255,255,255);
    doc.text('NUMBER SIX RUNNING', textX, 34);
    doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(200,198,190);
    doc.text(subtitle, textX, 47);
    doc.setFillColor(214,40,40); // --red garis aksen
    doc.rect(0, headerH, pageW, 3, 'F');
    return headerH + 3;
  }
  // Footer dengan waktu & tanggal cetak otomatis
  function pdfFooter(doc){
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const now = new Date();
    const tanggal = now.toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
    const jam = now.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) + ' WIB';
    doc.setDrawColor(225,222,214);
    doc.line(40, pageH-38, pageW-40, pageH-38);
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(140,138,130);
    doc.text('Dicetak otomatis oleh sistem pada ' + tanggal + ', pukul ' + jam, 40, pageH-24);
    doc.setFont('helvetica','bold');
    doc.text('NUMBER SIX RUNNING', pageW-40, pageH-24, { align:'right' });
  }

  function downloadSlipGaji(){
    const row = gajiSummary;
    if (!row){ showToast('Belum ada data komisi pada periode ini'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'pt', format:'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const marginX = 40;

    const headerSubtitle = 'Komisi Coach';
    let y = pdfHeader(doc, headerSubtitle);
    y += 26;

    const label = MONTH_NAMES[gajiFilterState.bulan-1] + ' ' + gajiFilterState.tahun;
    const gross = Number(row.gross || 0);
    const amount = Number(row.amount || 0);
    const ratePct = row.rate != null ? (Number(row.rate) * 100).toFixed(1).replace('.', ',') + '%' : '-';

    doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(17,17,16);
    doc.text(gajiCoachName, marginX, y);
    y += 15;
    doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(110,108,100);
    doc.text('Coach — N6 Running Training', marginX, y);
    y += 13;
    doc.text('Periode: ' + label, marginX, y);
    y += 20;

    const body = [[
      label,
      'Komisi periode ' + label + ' (tarif ' + ratePct + ')',
      fmtIDR(gross),
      '-',
      fmtIDR(amount)
    ]];

    doc.autoTable({
      startY: y,
      margin: { left: marginX, right: marginX, top: 85, bottom: 60 },
      head: [['Tanggal', 'Paket / Klien', 'Gaji Sesi', 'Potongan', 'Diterima']],
      body: body.length ? body : [['-', 'Tidak ada data pada periode ini', '-', '-', '-']],
      styles: { font:'helvetica', fontSize:9.5, cellPadding:7, textColor:[40,38,34], lineColor:[231,228,219], lineWidth:0.6, valign:'middle' },
      headStyles: { fillColor:[17,17,16], textColor:[255,255,255], fontStyle:'bold', fontSize:9, halign:'left' },
      alternateRowStyles: { fillColor:[250,250,247] },
      columnStyles: {
        2:{ halign:'right' },
        3:{ halign:'right', textColor:[214,40,40] },
        4:{ halign:'right', fontStyle:'bold', textColor:[17,17,16] }
      },
      didDrawPage: function(data){
        if (data.pageNumber > 1){ pdfHeader(doc, headerSubtitle); }
        pdfFooter(doc);
      }
    });

    y = doc.lastAutoTable.finalY + 24;

    // Kotak ringkasan total, dengan warna berbeda agar mudah dibaca
    const boxW = 232;
    const boxX = pageW - marginX - boxW;
    if (y + 100 > doc.internal.pageSize.getHeight() - 60){
      doc.addPage(); pdfHeader(doc, headerSubtitle); pdfFooter(doc); y = 85 + 20;
    }
    doc.setDrawColor(231,228,219); doc.setFillColor(250,250,247); doc.setLineWidth(0.8);
    doc.roundedRect(boxX, y, boxW, 98, 4, 4, 'FD');
    let sy = y + 20;
    doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(60,58,54);
    doc.text('Total Nilai Sesi (Gross)', boxX+14, sy); doc.text(fmtIDR(gross), boxX+boxW-14, sy, { align:'right' });
    sy += 16;
    doc.setTextColor(37,99,174);
    doc.text('Tarif Komisi', boxX+14, sy); doc.text(ratePct, boxX+boxW-14, sy, { align:'right' });
    sy += 16;
    doc.setTextColor(214,40,40);
    doc.text('Status', boxX+14, sy); doc.text(row.paid ? 'Lunas' : 'Belum dibayar', boxX+boxW-14, sy, { align:'right' });
    sy += 8;
    doc.setDrawColor(214,40,40); doc.line(boxX+14, sy+6, boxX+boxW-14, sy+6);
    sy += 24;
    doc.setFont('helvetica','bold'); doc.setFontSize(12.5); doc.setTextColor(17,17,16);
    doc.text('Komisi Diterima', boxX+14, sy); doc.text(fmtIDR(amount), boxX+boxW-14, sy, { align:'right' });

    y += 98 + 22;
    doc.setFont('helvetica','italic'); doc.setFontSize(8.5); doc.setTextColor(150,40,40);
    doc.text('Dokumen ini bersifat rahasia dan hanya untuk Coach yang bersangkutan, Admin, dan Owner.', marginX, y);

    pdfFooter(doc);

    doc.save('slip-komisi-' + currentPeriodKey() + '.pdf');
    showToast('Slip komisi berhasil diunduh');
  }

  /* ================= RENDER: COACH RAPOR ================= */
  function renderCoachRapor(){
    const el = document.getElementById('coachRaporList');
    if (!coachRaporList.length){
      el.innerHTML = '<div class="cal-empty">Belum ada data</div>';
      return;
    }
    el.innerHTML = coachRaporList.map(r => `
      <div class="progress-row">
        <div class="progress-row-top">
          <span class="pname">${r.periode}</span>
          <span class="pgoal">Kehadiran ${r.kehadiran} · Kepuasan ${r.kepuasan}</span>
        </div>
        <div class="progress-note">${r.catatan}</div>
      </div>
    `).join('');
  }

  /* ================= RENDER: RESCHEDULE ================= */
  function statusBadgeGeneric(status){
    const tone = status === "Disetujui" ? "green" : status === "Ditolak" ? "red" : "amber";
    return `<span class="badge ${tone}">${status}</span>`;
  }
  function renderReschedule(){
    const body = document.getElementById('rescheduleBody');
    if (!rescheduleRequests.length){
      body.innerHTML = '<tr><td colspan="4" class="muted" style="text-align:center; padding:24px 0;">Belum ada data</td></tr>';
      return;
    }
    body.innerHTML = rescheduleRequests.map(r => `
      <tr>
        <td class="strong">${r.sesi}</td>
        <td class="muted">${r.baru}</td>
        <td class="muted">${r.alasan || '-'}</td>
        <td class="right">${statusBadgeGeneric(r.status)}</td>
      </tr>
    `).join('');
  }

  /* ================= RENDER: CUTI ================= */
  function renderCuti(){
    const body = document.getElementById('cutiBody');
    if (!cutiRequests.length){
      body.innerHTML = '<tr><td colspan="4" class="muted" style="text-align:center; padding:24px 0;">Belum ada data</td></tr>';
      return;
    }
    body.innerHTML = cutiRequests.map(c => `
      <tr>
        <td class="strong">${c.mulai}</td>
        <td class="muted">${c.selesai}</td>
        <td class="muted">${c.alasan || '-'}</td>
        <td class="right">${statusBadgeGeneric(c.status)}</td>
      </tr>
    `).join('');
  }

  /* ================= RENDER: ABSENSI COACH ================= */
  function coachAttendanceBadge(status){
    const s = String(status || '');
    let tone = 'blue';
    if (s === 'Hadir' || s === 'Tepat Waktu') tone = 'green';
    else if (s === 'Alpha') tone = 'red';
    else if (s === 'Terlambat' || s === 'Izin' || s === 'Sakit') tone = 'amber';
    return `<span class="badge ${tone}">${status}</span>`;
  }
  function feedbackScoreBadge(feedback){
    if (!feedback) return `<span class="badge neutral">Menunggu Review</span>`;
    const tone = feedback.score >= 85 ? 'green' : feedback.score >= 70 ? 'amber' : 'red';
    return `<span class="badge ${tone}">Score ${feedback.score}</span>`;
  }
  function setStatLabel(valueId, text){
    const v = document.getElementById(valueId);
    const card = v && v.closest('.stat-card');
    const lab = card && card.querySelector('.label');
    if (lab) lab.textContent = text;
  }
  function renderCoachAttendance(){
    document.getElementById('periodeMulai').textContent = coachPeriode.mulai;
    document.getElementById('periodeSelesai').textContent = coachPeriode.selesai;

    // Label disesuaikan dengan status API (hadir/izin/sakit/alpha)
    setStatLabel('absensiCountHadir', 'Hadir');
    setStatLabel('absensiCountTerlambat', 'Alpha (Mangkir)');
    setStatLabel('absensiCountIzin', 'Izin / Sakit');

    const hadir = coachAttendanceList.filter(a => a.status === 'Hadir').length;
    const alpha = coachAttendanceList.filter(a => a.status === 'Alpha').length;
    const izin = coachAttendanceList.filter(a => a.status === 'Izin' || a.status === 'Sakit').length;
    document.getElementById('absensiCountHadir').textContent = hadir + 'x';
    document.getElementById('absensiCountTerlambat').textContent = alpha + 'x';
    document.getElementById('absensiCountIzin').textContent = izin + 'x';

    if (!coachAttendanceList.length){
      document.getElementById('coachAttendanceBody').innerHTML = '<div class="cal-empty">Belum ada data</div>';
      return;
    }
    document.getElementById('coachAttendanceBody').innerHTML = coachAttendanceList.map(a => `
      <div class="attendance-item">
        <div class="attendance-item-top">
          <div class="attendance-date">${a.tanggal} · ${a.sesi || ''}</div>
          <div class="attendance-badges">
            ${coachAttendanceBadge(a.status)}
            ${feedbackScoreBadge(a.feedback)}
          </div>
        </div>
        ${a.ket && a.ket !== '-' ? `<div class="attendance-comment">${a.ket}</div>` : ''}
        ${a.feedback && a.feedback.komentar ? `<div class="attendance-comment">${a.feedback.komentar}</div>` : ''}
      </div>
    `).join('');
  }

  /* ================= RENDER: KALENDER 30 HARI (REAL-TIME) ================= */
  const DOW_LABEL = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const MONTH_LABEL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  let selectedCalDate = null;

  function fmtCalDate(d){
    return d.getDate() + ' ' + MONTH_LABEL[d.getMonth()] + ' ' + d.getFullYear();
  }
  function sameDay(a,b){
    return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  }
  function toDateKey(d){
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function fmtDateKeyLabel(key){
    const [y,m,d] = key.split('-').map(Number);
    return fmtCalDate(new Date(y, m-1, d));
  }
  function getUnavailableForDate(d){
    const key = toDateKey(d);
    return coachUnavailable.filter(u => u.tanggal === key);
  }

  /* ================= RENDER: WAKTU TIDAK BISA MENGAJAR ================= */
  function renderUnavailableList(){
    const body = document.getElementById('unavailableBody');
    if (!coachUnavailable.length){
      body.innerHTML = `<div class="cal-empty">Belum ada waktu yang ditandai tidak tersedia.</div>`;
      return;
    }
    const sorted = [...coachUnavailable].sort((a,b) => a.tanggal.localeCompare(b.tanggal));
    body.innerHTML = sorted.map(u => `
      <div class="attendance-item">
        <div class="attendance-item-top">
          <span class="attendance-date">${fmtDateKeyLabel(u.tanggal)}</span>
          <div class="attendance-badges">
            <span class="badge amber">${u.allDay ? 'Sepanjang Hari' : (u.jamMulai + '–' + u.jamSelesai)}</span>
            <button type="button" class="att-btn tidak" title="Hapus tanda" onclick="removeUnavailable(${u.id})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        ${u.alasan ? `<div class="attendance-comment">${u.alasan}</div>` : ''}
      </div>
    `).join('');
  }

  window.removeUnavailable = function(id){
    coachUnavailable = coachUnavailable.filter(u => u.id !== id);
    renderUnavailableList();
    renderCalendar();
    showToast('Tanda tidak tersedia dihapus');
  };

  function renderCalendar(){
    const today = new Date();
    today.setHours(0,0,0,0);
    const horizonEnd = new Date(today); horizonEnd.setDate(horizonEnd.getDate() + 29); // 30 hari termasuk hari ini

    // mulai grid dari hari Senin minggu ini, tampilkan 6 minggu (42 hari) agar grid rapi
    const startOffset = (today.getDay() + 6) % 7; // 0 jika Senin
    const gridStart = new Date(today); gridStart.setDate(gridStart.getDate() - startOffset);

    document.getElementById('calRange').textContent =
      fmtCalDate(today) + ' — ' + fmtCalDate(horizonEnd);

    let dowHtml = DOW_LABEL.map(d => `<div class="cal-dow">${d}</div>`).join('');
    let cellsHtml = '';
    for (let i=0; i<42; i++){
      const d = new Date(gridStart); d.setDate(d.getDate() + i);
      const sessions = getSessionsForDate(d);
      const unavail = getUnavailableForDate(d);
      const isToday = sameDay(d, today);
      const inWindow = d >= today && d <= horizonEnd;
      const outside = !inWindow;
      const isSelected = selectedCalDate && sameDay(d, selectedCalDate);
      const classes = ['cal-cell'];
      if (outside) classes.push('outside');
      if (unavail.length && inWindow) classes.push('unavailable');
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      if ((sessions.length || unavail.length) && inWindow) classes.push('has-session');
      const dotsHtml = ((sessions.length || unavail.length) && inWindow) ? `<div class="dots">${
        sessions.map(()=>'<span class="dot-session"></span>').join('') +
        unavail.map(()=>'<span class="dot-unavail"></span>').join('')
      }</div>` : '';
      cellsHtml += `<div class="${classes.join(' ')}" data-date="${d.toISOString()}" onclick="selectCalDay('${d.toISOString()}')">
          <div class="num">${d.getDate()}</div>
          ${dotsHtml}
        </div>`;
    }
    document.getElementById('calGrid').innerHTML = dowHtml + cellsHtml;

    if (!selectedCalDate) selectedCalDate = today;
    renderCalDetail(selectedCalDate);
  }

  function renderCalDetail(date){
    const sessions = getSessionsForDate(date);
    const unavail = getUnavailableForDate(date);
    const dateLabel = fmtCalDate(date);

    let html = `<h4>${dateLabel}</h4>`;

    if (unavail.length){
      html += unavail.map(u => `
        <div class="rapor-note" style="background:var(--amber-tint); color:#6B4A10; border-color:var(--amber); margin-bottom:12px;">
          <b>⛔ Tidak bisa mengajar</b> ${u.allDay ? '(Sepanjang hari)' : '(' + u.jamMulai + '–' + u.jamSelesai + ')'}${u.alasan ? ' — ' + u.alasan : ''}
        </div>`).join('');
    }

    if (!sessions.length){
      html += `<div class="cal-empty">Tidak ada jadwal latihan pada hari ini.</div>`;
    } else {
      html += `
        <table>
          <tbody>
            ${sessions.map(s => `
              <tr><td class="muted" style="width:60px;">${s.time}</td><td class="strong">${s.client}</td><td class="muted right">${s.loc}</td></tr>
            `).join('')}
          </tbody>
        </table>`;
    }

    document.getElementById('calDetail').innerHTML = html;
  }

  window.selectCalDay = function(isoString){
    selectedCalDate = new Date(isoString);
    renderCalendar();
  };

  /* ================= RENDER: LOGS ================= */
  function renderLogs(){
    const el = document.getElementById('logList');
    if (!logs.length){
      el.innerHTML = '<div class="cal-empty">Belum ada data</div>';
      return;
    }
    el.innerHTML = logs.map(l => `
      <div class="log-item">
        <div class="log-item-top"><span>${l.client}</span><span class="date">${l.date}</span></div>
        <div class="stats">${l.distance} · ${l.pace} · <span class="badge neutral">${l.loc || '-'}</span></div>
        <div class="note">${l.note || ''}</div>
      </div>
    `).join('');
  }

  /* ================= NAV: MAIN TABS ================= */
  const navButtons = document.querySelectorAll('[data-panel]');
  const panels = document.querySelectorAll('.panel');
  const pageTitle = document.getElementById('pageTitle');
  const TITLES = { home:'Beranda', klien:'Klien', info:'Informasi', jadwal:'Absensi', akun:'Akun User' };
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-panel');
      navButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-panel') === target));
      panels.forEach(p => p.classList.remove('active'));
      document.getElementById('panel-' + target).classList.add('active');
      pageTitle.textContent = TITLES[target];
      closeSidebar();
      document.querySelector('.content').scrollTop = 0;
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

  /* ================= FORM: LOG LATIHAN ================= */
  document.getElementById('logForm').addEventListener('submit', function(e){
    e.preventDefault();
    const client = document.getElementById('logClient').value;
    const loc = document.getElementById('logLokasi').value;
    const jarak = document.getElementById('logJarak').value.trim();
    const pace = document.getElementById('logPace').value.trim();
    const catatan = document.getElementById('logCatatan').value.trim();
    if (!client || !loc || !jarak || !pace) return;
    logs.unshift({ client, date:'Baru saja', distance: jarak + ' km', pace: pace + '/km', loc, note: catatan });
    renderLogs();
    this.reset();
    showToast('Log latihan tersimpan');
  });

  /* ================= FORM: RESCHEDULE ================= */
  document.getElementById('rescheduleForm').addEventListener('submit', function(e){
    e.preventDefault();
    const sesi = document.getElementById('rsSesi').value;
    const tanggal = document.getElementById('rsTanggal').value;
    const jam = document.getElementById('rsJam').value.trim();
    const alasan = document.getElementById('rsAlasan').value.trim();
    if (!sesi || !tanggal || !jam) return;
    rescheduleRequests.unshift({ sesi, baru: tanggal + ', ' + jam, alasan, status:'Menunggu' });
    renderReschedule();
    this.reset();
    showToast('Pengajuan reschedule terkirim');
  });

  /* ================= FORM: CUTI ================= */
  document.getElementById('cutiForm').addEventListener('submit', function(e){
    e.preventDefault();
    const mulai = document.getElementById('cutiMulai').value;
    const selesai = document.getElementById('cutiSelesai').value;
    const alasan = document.getElementById('cutiAlasan').value.trim();
    if (!mulai || !selesai) return;
    cutiRequests.unshift({ mulai, selesai, alasan, status:'Menunggu' });
    renderCuti();
    this.reset();
    showToast('Pengajuan cuti terkirim');
  });

  /* ================= FORM: WAKTU TIDAK BISA MENGAJAR ================= */
  document.getElementById('uaSepanjangHari').addEventListener('change', function(){
    const jamMulai = document.getElementById('uaJamMulai');
    const jamSelesai = document.getElementById('uaJamSelesai');
    jamMulai.disabled = this.checked;
    jamSelesai.disabled = this.checked;
    if (this.checked){ jamMulai.value = ''; jamSelesai.value = ''; }
  });

  document.getElementById('unavailableForm').addEventListener('submit', function(e){
    e.preventDefault();
    const tanggal = document.getElementById('uaTanggal').value;
    const allDay = document.getElementById('uaSepanjangHari').checked;
    const jamMulai = document.getElementById('uaJamMulai').value.trim();
    const jamSelesai = document.getElementById('uaJamSelesai').value.trim();
    const alasan = document.getElementById('uaAlasan').value.trim();
    if (!tanggal){ showToast('Pilih tanggal terlebih dahulu'); return; }
    if (!allDay && (!jamMulai || !jamSelesai)){ showToast('Isi jam mulai & selesai, atau centang Sepanjang Hari'); return; }
    coachUnavailable.push({
      id: unavailIdSeq++, tanggal, allDay,
      jamMulai: allDay ? '' : jamMulai,
      jamSelesai: allDay ? '' : jamSelesai,
      alasan
    });
    this.reset();
    document.getElementById('uaJamMulai').disabled = false;
    document.getElementById('uaJamSelesai').disabled = false;
    renderUnavailableList();
    renderCalendar();
    showToast('Waktu tidak tersedia ditandai — Admin akan melihatnya di kalender');
  });

  /* ================= FORM: ABSENSI COACH (self check-in ke Admin) ================= */
  document.getElementById('coachAttendanceForm').addEventListener('submit', function(e){
    e.preventDefault();
    const sesi = document.getElementById('acSesi').value;
    const status = document.getElementById('acStatus').value;
    const catatan = document.getElementById('acCatatan').value.trim();
    if (!sesi || !status) return;
    const today = new Date();
    const tanggal = today.getDate() + ' ' + ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][today.getMonth()] + ' ' + today.getFullYear();
    coachAttendanceList.unshift({ tanggal, sesi, status, ket: catatan || '-', feedback: null });
    renderCoachAttendance();
    this.reset();
    showToast('Absensi terkirim ke Admin, menunggu review');
  });

  /* ================= RAPOR PDF EXPORT ================= */
  const LOGO_DATA = "assets/img/logo-report.png";
  document.getElementById('downloadRaporBtn').addEventListener('click', function(){
    const sel = document.getElementById('raporClientSelect');
    const id = sel.value;
    const name = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : 'Klien';
    const r = raporCache[id];
    if (!r){ showToast('Belum ada data rapor untuk klien ini'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'pt', format:'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const marginX = 40;

    const headerSubtitle = 'Rapor Perkembangan Klien';
    let y = pdfHeader(doc, headerSubtitle);
    y += 28;

    doc.setFont('helvetica','bold'); doc.setFontSize(17); doc.setTextColor(17,17,16);
    doc.text(name, marginX, y);
    y += 18;
    doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(110,108,100);
    doc.text('Coach: ' + ((n6ApiUser() && (n6ApiUser().full_name || n6ApiUser().username)) || 'Coach') + '   ·   Periode: ' + MONTH_NAMES[new Date().getMonth()] + ' ' + new Date().getFullYear(), marginX, y);
    y += 22;

    doc.autoTable({
      startY: y,
      margin: { left: marginX, right: marginX },
      theme: 'grid',
      body: [
        ['Total Sesi', String(r.sesi)],
        ['Total Jarak', r.totalJarak],
        ['Rata-rata Pace', r.avgPace],
        ['Kehadiran', r.kehadiran],
      ],
      styles: { font:'helvetica', fontSize:10.5, cellPadding:9, lineColor:[231,228,219], lineWidth:0.6, textColor:[40,38,34] },
      columnStyles: {
        0:{ fontStyle:'bold', cellWidth:170, fillColor:[245,243,238], textColor:[17,17,16] },
        1:{ textColor:[17,17,16] }
      }
    });

    y = doc.lastAutoTable.finalY + 26;

    // Kotak Catatan Coach dengan aksen merah agar menonjol
    doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(214,40,40);
    doc.text('CATATAN COACH', marginX, y);
    doc.setDrawColor(214,40,40); doc.setLineWidth(1.6);
    doc.line(marginX, y+6, marginX+96, y+6);
    y += 18;

    doc.setFont('helvetica','normal'); doc.setFontSize(10.5);
    const noteLines = doc.splitTextToSize(r.catatan, pageW - marginX*2 - 28);
    const noteBoxH = noteLines.length * 14 + 24;
    doc.setDrawColor(248,214,214); doc.setFillColor(252,235,235);
    doc.roundedRect(marginX, y, pageW - marginX*2, noteBoxH, 4, 4, 'FD');
    doc.setTextColor(90,25,25);
    doc.text(noteLines, marginX+14, y+20);

    pdfFooter(doc);

    doc.save('rapor-' + name.replace(/\s+/g,'-').toLowerCase() + '.pdf');
    showToast('Rapor PDF berhasil diunduh');
  });

  /* ================= TOAST ================= */
  let toastTimer;
  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  window.showToast = showToast;

  /* ================= SLIP GAJI BUTTON ================= */
  document.getElementById('downloadSlipBtn').addEventListener('click', downloadSlipGaji);

  /* ================= INIT ================= */
  async function loadAllData(){
    // Skeleton saat memuat
    renderScheduleLoading();
    renderGajiLoading();
    const clientEl = document.getElementById('clientList');
    if (clientEl) clientEl.innerHTML = '<div class="cal-empty">Memuat data...</div>';
    const attEl = document.getElementById('coachAttendanceBody');
    if (attEl) attEl.innerHTML = '<div class="cal-empty">Memuat data...</div>';

    if (n6ApiReady()){
      try { await loadSchedule(); }
      catch(e){ console.warn('[coach] jadwal', e); schedule = []; scheduleSlots = []; }
      renderSchedule();
      buildUpcomingSchedule();
      populateRsSesi();
      try { await loadClients(); }
      catch(e){ console.warn('[coach] klien', e); clients = []; clientsRaw = []; }
      renderClients();
      renderRaporSelect();
      populateLogClient();
      // Dashboard agregat (progres + grafik) — dari GET /dashboards/coach/me (backend Fase 3).
      // Endpoint belum ada → kosong + empty state; kode tetap jalan sebelum backend di-deploy.
      try { await loadCoachDashboard(); }
      catch(e){ console.warn('[coach] dashboard', e); clientProgress = []; chartData = emptyChartData(); coachDashboard = null; }
      renderHomeStats();
      try { await loadCoachAttendance(); }
      catch(e){ console.warn('[coach] absensi', e); coachAttendanceList = []; }
      renderCoachAttendance();
      buildLogsFromAttendance();
      try { await loadRescheduleRequests(); }
      catch(e){ console.warn('[coach] reschedule', e); rescheduleRequests = []; }
    } else {
      // Tanpa token API: tampilkan empty state, tanpa fallback dummy.
      schedule = []; scheduleSlots = []; clients = []; clientsRaw = []; coachAttendanceList = [];
      clientProgress = []; chartData = emptyChartData(); coachDashboard = null;
      upcomingSchedule = []; logs = []; rescheduleRequests = [];
      renderSchedule(); renderClients(); renderRaporSelect(); renderCoachAttendance();
      populateRsSesi(); populateLogClient(); renderHomeStats();
    }

    populateGajiFilters();
    if (n6ApiReady()){ await refreshGaji(); }
    else { gajiSummary = null; renderGaji(); }

    // Progres & grafik tersambung ke GET /dashboards/coach/me (Fase 3).
    // Reschedule tersambung ke GET /schedules/coach/requests; histori, rapor coach,
    // cuti belum ada endpoint → empty state.
    renderUpcoming();
    renderCharts();
    renderProgress();
    renderHistory();
    renderCoachRapor();
    renderReschedule();
    renderCuti();
    renderUnavailableList();
    renderCalendar();
    renderLogs();
  }
  loadAllData();
})();
