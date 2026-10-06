/**
 * N6 dist bundle - coach
 *
 * GENERATED FILE - do not edit. Source of truth is js/modules/coach/*.js
 * Rebuilt by tools/build.ps1; concatenation is byte-identical to the
 * original <script> block in coach.html.
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
  // Urutan hari API: 1=Senin..7=Minggu ; JS getDay(): 0=Minggu..6=Sabtu
  function apiWeekday(jsDay){ return ((jsDay + 6) % 7) + 1; }
  async function loadSchedule(){
    const data = await n6Api('schedules/coach');
    const slots = (data && data.slots) || [];
    const todayWd = apiWeekday(new Date().getDay());
    schedule = slots
      .filter(s => s.weekday === todayWd && s.active !== false)
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
  async function loadClients(){
    const page = await n6Api('clients?limit=200');
    const items = (page && page.items) || [];
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

  const clientProgress = [
    { name:"Budi Hartono", goal:"10K", progress:72, note:"Pace membaik dari 6:40 → 6:10/km dalam 6 minggu." },
    { name:"Andi Prasetyo", goal:"Turun 8 kg", progress:45, note:"Sudah turun 3.6 kg dari target 8 kg." },
    { name:"Rina Marlina", goal:"Half Marathon", progress:60, note:"Latihan jarak jauh mingguan konsisten." },
    { name:"Yoga Pratama", goal:"5K", progress:88, note:"Tinggal fine-tuning pace menjelang race." },
    { name:"Citra Ayu", goal:"Full Marathon", progress:20, note:"Baru mulai fase base building." },
  ];

  const raporData = {
    "Budi Hartono": { sesi:12, totalJarak:"86 km", avgPace:"6:15/km", kehadiran:"100%", catatan:"Progres sangat baik dan konsisten. Siap diarahkan untuk ikut race 10K bulan depan." },
    "Andi Prasetyo": { sesi:10, totalJarak:"48 km", avgPace:"7:20/km", kehadiran:"90%", catatan:"Penurunan berat badan sesuai target. Perlu jaga konsistensi jadwal latihan sore." },
    "Rina Marlina": { sesi:9, totalJarak:"64 km", avgPace:"6:50/km", kehadiran:"95%", catatan:"Volume latihan mingguan meningkat bertahap, siap lanjut ke fase build-up HM." },
    "Yoga Pratama": { sesi:11, totalJarak:"39 km", avgPace:"6:05/km", kehadiran:"100%", catatan:"Sangat siap untuk target 5K, tinggal jaga pola tidur menjelang race." },
    "Citra Ayu": { sesi:4, totalJarak:"22 km", avgPace:"7:45/km", kehadiran:"80%", catatan:"Masih tahap adaptasi. Perlu pendampingan lebih intens di fase awal." },
  };

  // Data untuk grafik Prestasi & Performa
  const chartData = {
    bulanLabel: ["Apr","Mei","Jun","Jul","Agu","Sep"],
    pencapaianKlien: [1, 2, 1, 3, 2, 3],
    performaTren: [4, 6, 7, 9, 11, 14], // % rata-rata peningkatan performa kumulatif
    statusKlien: { normal: 3, bermasalah: 1, cedera: 1 }, // dari 5 klien binaan
    profesional: {
      labels: ["Kedisiplinan","Komunikasi","Teknik Latihan","Kepemimpinan","Empati"],
      values: [92, 88, 85, 78, 90]
    },
    ratingTren: [4.5, 4.6, 4.7, 4.6, 4.8, 4.8]
  };

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
  const coachPeriode = { mulai:"1 Januari 2026", selesai:"31 Desember 2026" };

  const historyList = [
    { date:"10 Sep 2026", activity:"Sesi latihan bersama Budi Hartono", type:"Sesi" },
    { date:"09 Sep 2026", activity:"Mengajukan reschedule sesi Rina Marlina", type:"Reschedule" },
    { date:"05 Sep 2026", activity:"Cuti 1 hari disetujui Head Coach", type:"Cuti" },
    { date:"01 Sep 2026", activity:"Menerima gaji periode Agustus 2026", type:"Gaji" },
    { date:"28 Agu 2026", activity:"Sesi latihan bersama Yoga Pratama", type:"Sesi" },
  ];

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

  const bonusList = [
    { bulan:9, tahun:2026, jumlah:200000, ket:"Bonus kehadiran 100%" },
    { bulan:8, tahun:2026, jumlah:100000, ket:"Bonus referral klien baru" },
    { bulan:7, tahun:2026, jumlah:0, ket:"-" },
  ];

  const coachRaporList = [
    { periode:"Agustus 2026", kehadiran:"96%", kepuasan:"4.8 / 5", catatan:"Konsisten dan komunikatif dengan klien. Pertahankan kualitas ini." },
    { periode:"Juli 2026", kehadiran:"93%", kepuasan:"4.6 / 5", catatan:"Perlu lebih tepat waktu untuk sesi pagi." },
  ];

  let rescheduleRequests = [
    { sesi:"Rina Marlina — 16:00, 12 Sep 2026", baru:"13 Sep 2026, 17:00", alasan:"Klien ada acara mendadak", status:"Menunggu" },
    { sesi:"Yoga Pratama — 18:00, 10 Sep 2026", baru:"11 Sep 2026, 18:00", alasan:"Hujan deras", status:"Disetujui" },
  ];

  let cutiRequests = [
    { mulai:"20 Sep 2026", selesai:"21 Sep 2026", alasan:"Acara keluarga", status:"Menunggu" },
    { mulai:"05 Agu 2026", selesai:"05 Agu 2026", alasan:"Sakit", status:"Disetujui" },
  ];

  // Tanda waktu coach tidak bisa mengajar (agar Admin tahu saat mengatur jadwal klien baru)
  let coachUnavailable = [
    { id:1, tanggal:"2026-09-25", allDay:false, jamMulai:"14:00", jamSelesai:"18:00", alasan:"Menghadiri acara keluarga" },
    { id:2, tanggal:"2026-10-02", allDay:true, jamMulai:"", jamSelesai:"", alasan:"Cuti pribadi (sudah diajukan ke Admin)" },
  ];
  let unavailIdSeq = 3;

  const upcomingSchedule = [
    { date:"Senin, 14 Sep 2026", time:"06:00", client:"Budi Hartono", loc:"GBK Senayan" },
    { date:"Selasa, 15 Sep 2026", time:"16:00", client:"Rina Marlina", loc:"Online" },
    { date:"Rabu, 16 Sep 2026", time:"07:00", client:"Andi Prasetyo", loc:"GBK Senayan" },
    { date:"Kamis, 17 Sep 2026", time:"18:00", client:"Yoga Pratama", loc:"Online" },
    { date:"Sabtu, 19 Sep 2026", time:"09:00", client:"Citra Ayu", loc:"Online" },
  ];

  // Aturan sesi otomatis untuk kalender 30 hari (disimulasikan dari pola jadwal mingguan coach)
  function getSessionsForDate(date){
    const dow = date.getDay(); // 0=Minggu ... 6=Sabtu
    if (dow === 1) return [{ time:"06:00", client:"Budi Hartono", loc:"GBK Senayan" }];
    if (dow === 2) return [{ time:"16:00", client:"Rina Marlina", loc:"Online" }];
    if (dow === 3) return [{ time:"07:00", client:"Andi Prasetyo", loc:"GBK Senayan" }];
    if (dow === 4) return [{ time:"18:00", client:"Yoga Pratama", loc:"Online" }];
    if (dow === 5) return [{ time:"06:00", client:"Budi Hartono", loc:"GBK Senayan" }, { time:"16:00", client:"Rina Marlina", loc:"Online" }];
    if (dow === 6) return [{ time:"09:00", client:"Citra Ayu", loc:"Online" }];
    return []; // Minggu libur
  }

  let logs = [
    { client:"Budi Hartono", date:"Hari ini", distance:"8 km", pace:"6:10/km", loc:"GBK Senayan", note:"Progres bagus, HR stabil." },
    { client:"Andi Prasetyo", date:"Kemarin", distance:"5 km", pace:"7:30/km", loc:"GBK Senayan", note:"Sedikit keluhan lutut, kurangi intensitas." },
    { client:"Budi Hartono", date:"5 Sep 2026", distance:"7 km", pace:"6:20/km", loc:"GBK Senayan", note:"Latihan interval 400m x 8, pace mulai stabil." },
    { client:"Budi Hartono", date:"1 Sep 2026", distance:"6 km", pace:"6:35/km", loc:"GBK Senayan", note:"Fokus easy run untuk pemulihan setelah long run minggu lalu." },
    { client:"Andi Prasetyo", date:"4 Sep 2026", distance:"4 km", pace:"7:45/km", loc:"GBK Senayan", note:"Mulai program penurunan berat badan, kombinasi jalan-lari." },
    { client:"Rina Marlina", date:"8 Sep 2026", distance:"12 km", pace:"6:50/km", loc:"Online", note:"Long run mingguan, cocok untuk persiapan Half Marathon." },
    { client:"Rina Marlina", date:"1 Sep 2026", distance:"10 km", pace:"6:55/km", loc:"Online", note:"Tempo run, HR terkontrol di zona 3." },
    { client:"Yoga Pratama", date:"6 Sep 2026", distance:"5 km", pace:"6:05/km", loc:"Online", note:"Speed work 1km repeat x 4, siap untuk race 5K." },
    { client:"Citra Ayu", date:"2 Sep 2026", distance:"3 km", pace:"7:50/km", loc:"Online", note:"Sesi pertama, adaptasi ritme lari, kondisi masih perlu dipantau." },
  ];

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
    document.getElementById('upcomingBody').innerHTML = upcomingSchedule.map(u => `
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
        labels: chartData.bulanLabel,
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

    // Star rating
    const rating = chartData.ratingTren[chartData.ratingTren.length-1];
    const full = Math.floor(rating);
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
    document.getElementById('progressList').innerHTML = clientProgress.map(p => `
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
    sel.innerHTML = clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    sel.addEventListener('change', () => renderRaporDetail(sel.value));
    renderRaporDetail(clients[0].name);
  }
  function renderRaporDetail(name){
    const r = raporData[name];
    if (!r){
      // Fase 3: rapor per klien belum ada endpoint — tampilkan empty state, bukan dummy.
      document.getElementById('raporStats').innerHTML = '<div class="cal-empty">Belum ada data rapor untuk klien ini.</div>';
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
    document.getElementById('historyList').innerHTML = historyList.map(h => `
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
    try { doc.addImage(LOGO_DATA, 'PNG', logoX, logoY, logoW, logoH); } catch(e){}
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
    document.getElementById('coachRaporList').innerHTML = coachRaporList.map(r => `
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
    document.getElementById('rescheduleBody').innerHTML = rescheduleRequests.map(r => `
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
    document.getElementById('cutiBody').innerHTML = cutiRequests.map(c => `
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
    document.getElementById('logList').innerHTML = logs.map(l => `
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
    const name = document.getElementById('raporClientSelect').value;
    const r = raporData[name];
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
      catch(e){ console.warn('[coach] jadwal', e); schedule = []; }
      renderSchedule();
      try { await loadClients(); }
      catch(e){ console.warn('[coach] klien', e); clients = []; }
      renderClients();
      renderRaporSelect();
      try { await loadCoachAttendance(); }
      catch(e){ console.warn('[coach] absensi', e); coachAttendanceList = []; }
      renderCoachAttendance();
    } else {
      // Tanpa token API: tampilkan empty state, tanpa fallback dummy.
      schedule = []; clients = []; coachAttendanceList = [];
      renderSchedule(); renderClients(); renderRaporSelect(); renderCoachAttendance();
    }

    populateGajiFilters();
    if (n6ApiReady()){ await refreshGaji(); }
    else { gajiSummary = null; renderGaji(); }

    // Fase 3 (masih dummy, menunggu endpoint agregat): progress, grafik, histori, rapor coach, dsb.
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
