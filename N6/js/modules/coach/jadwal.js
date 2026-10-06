/**
 * N6 modules - coach / jadwal
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  async function loadGaji(){
    const data = await n6Api('commissions/summary?period=' + currentPeriodKey());
    const rows = (data && data.rows) || [];
    const me = n6ApiUser();
    const myCoachId = me && me.coach_id != null ? me.coach_id : null;
    gajiSummary = myCoachId != null ? (rows.find(r => String(r.coach_id) === String(myCoachId)) || null) : null;
    gajiCoachName = (me && (me.full_name || me.username)) || 'Coach';
  }
/*__N6_UNIT__*/  async function refreshGaji(){
    renderGajiLoading();
    try { await loadGaji(); }
    catch(e){ console.warn('[coach] gaji', e); gajiSummary = null; }
    renderGaji();
  }
/*__N6_UNIT__*/  function renderGajiLoading(){
    const el = document.getElementById('gajiSesiBody');
    if (el) el.innerHTML = '<tr><td colspan="3" class="muted" style="text-align:center; padding:24px 0;">Memuat data...</td></tr>';
  }

  // Rapor kinerja coach — TIDAK ADA endpoint evaluasi → kosong + empty state, bukan dummy.
/*__N6_UNIT__*/  const coachRaporList = [];

  // Pengajuan reschedule — dari GET /schedules/coach/requests (endpoint sudah ada).
/*__N6_UNIT__*/  const REQ_STATUS_LABEL = { menunggu:'Menunggu', disetujui:'Disetujui', ditolak:'Ditolak' };
/*__N6_UNIT__*/  let rescheduleRequests = [];
/*__N6_UNIT__*/  async function loadRescheduleRequests(){
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
/*__N6_UNIT__*/  let cutiRequests = [];

  // Tanda waktu coach tidak bisa mengajar (agar Admin tahu saat mengatur jadwal klien baru)
  // Data input user lokal — mulai kosong, diisi via UI. Bukan dummy.
/*__N6_UNIT__*/  let coachUnavailable = [];
/*__N6_UNIT__*/  let unavailIdSeq = 1;

  // Jadwal pertemuan terdekat — dibangun dari template mingguan GET /schedules/coach.
/*__N6_UNIT__*/  let upcomingSchedule = [];
/*__N6_UNIT__*/  const DOW_ID_FULL = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
/*__N6_UNIT__*/  function buildUpcomingSchedule(){
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
/*__N6_UNIT__*/  function getSessionsForDate(date){
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
/*__N6_UNIT__*/  let logs = [];
/*__N6_UNIT__*/  function buildLogsFromAttendance(){
    logs = coachAttendanceList.map(a => ({
      client: a.sesi,
      date: a.tanggal,
      distance: '—',
      pace: '—',
      loc: '—',
      note: a.ket && a.ket !== '-' ? a.ket : ''
    }));
  }

/*__N6_UNIT__*/  const fmtIDR = n => "Rp" + n.toLocaleString('id-ID');

  /* ================= ICONS ================= */
/*__N6_UNIT__*/  const ICONS = {
    hadir: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5"/></svg>',
    tidak: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    izin:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    trophy:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 5h3a2 2 0 0 1-2 4M7 5H4a2 2 0 0 0 2 4"/></svg>'
  };

  /* ================= RENDER: SCHEDULE / ABSENSI ================= */
/*__N6_UNIT__*/  function statusBadge(status){
    const tone = status === "Selesai" ? "green" : status === "Terjadwal" ? "amber" : "neutral";
    return `<span class="badge ${tone}">${status}</span>`;
  }
/*__N6_UNIT__*/  function attendanceButtons(idx, current){
    return `
      <div class="att-btns">
        <button class="att-btn hadir ${current==='hadir'?'active':''}" title="Hadir" onclick="markAttendance(${idx}, 'hadir')">${ICONS.hadir}</button>
        <button class="att-btn tidak ${current==='tidak'?'active':''}" title="Tidak Hadir" onclick="markAttendance(${idx}, 'tidak')">${ICONS.tidak}</button>
        <button class="att-btn izin ${current==='izin'?'active':''}" title="Izin" onclick="markAttendance(${idx}, 'izin')">${ICONS.izin}</button>
      </div>`;
  }
/*__N6_UNIT__*/  function renderSchedule(){
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
/*__N6_UNIT__*/  function renderScheduleLoading(){
    const html = '<tr><td colspan="5" class="muted" style="text-align:center; padding:24px 0;">Memuat data...</td></tr>';
    const homeEl = document.getElementById('scheduleBodyHome');
    const absEl = document.getElementById('scheduleBodyAbsensi');
    if (homeEl) homeEl.innerHTML = html;
    if (absEl) absEl.innerHTML = html;
  }
/*__N6_UNIT__*/  window.markAttendance = function(idx, value){
    if (!schedule[idx]) return;
    schedule[idx].attendance = schedule[idx].attendance === value ? null : value;
    if (schedule[idx].attendance === 'hadir') schedule[idx].status = 'Selesai';
    renderSchedule();
    showToast(schedule[idx].attendance ? ('Absensi ' + schedule[idx].client + ' dicatat') : 'Absensi dibatalkan');
  };

  /* ================= RENDER: JADWAL PERTEMUAN TERDEKAT ================= */
/*__N6_UNIT__*/  function renderUpcoming(){
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
/*__N6_UNIT__*/  const CHART_RED = '#D62828';
/*__N6_UNIT__*/  const CHART_INK = '#111110';
/*__N6_UNIT__*/  const CHART_ASPHALT = '#6E6C64';
/*__N6_UNIT__*/  const CHART_GREEN = '#1E8E3E';
/*__N6_UNIT__*/  const CHART_AMBER = '#B7791F';
/*__N6_UNIT__*/  const CHART_GRID = '#F0EEE7';

/*__N6_UNIT__*/  function buildChartConfig(key){
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

/*__N6_UNIT__*/  function renderCharts(){
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
/*__N6_UNIT__*/  let chartModalInstance = null;
/*__N6_UNIT__*/  window.openChartModal = function(key, title){
    document.getElementById('chartModalTitle').textContent = title;
    document.getElementById('chartModal').classList.add('show');
    if (chartModalInstance) { chartModalInstance.destroy(); chartModalInstance = null; }
    const canvas = document.getElementById('chartModalCanvas');
    chartModalInstance = new Chart(canvas, buildChartConfig(key));
  };
/*__N6_UNIT__*/  window.closeChartModal = function(){
    document.getElementById('chartModal').classList.remove('show');
    if (chartModalInstance) { chartModalInstance.destroy(); chartModalInstance = null; }
  };

  /* ================= RENDER: CLIENTS ================= */
/*__N6_UNIT__*/  function typeBadge(type){ return `<span class="badge neutral">${type}</span>`; }
/*__N6_UNIT__*/  function clientStatusBadge(status){ return `<span class="badge ${status==='Aktif'?'green':'amber'}">${status}</span>`; }
