/**
 * N6 modules - coach / home
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
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
/*__N6_UNIT__*/  function populateLogClient(){
    const sel = document.getElementById('logClient');
    if (!sel) return;
    sel.innerHTML = '<option value="">Pilih klien</option>' +
      clients.map(c => `<option value="${String(c.name || '').replace(/"/g,'&quot;')}">${String(c.name || '—').replace(/</g,'&lt;')}</option>`).join('');
  }

  // Dropdown sesi (form reschedule) — dari GET /schedules/coach (slot hari ini)
/*__N6_UNIT__*/  function populateRsSesi(){
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
/*__N6_UNIT__*/  let raporCache = {};   // clientId -> { sesi, totalJarak, avgPace, kehadiran, catatan } | null
/*__N6_UNIT__*/  let raporCurrentId = null;
/*__N6_UNIT__*/  function normalizeRapor(data){
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
/*__N6_UNIT__*/  let chartData = emptyChartData();
/*__N6_UNIT__*/  function emptyChartData(){
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
/*__N6_UNIT__*/  function buildChartDataFromDashboard(d){
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
/*__N6_UNIT__*/  let coachAttendanceList = [];
/*__N6_UNIT__*/  const ATT_LABEL = { hadir:'Hadir', izin:'Izin', sakit:'Sakit', alpha:'Alpha' };
/*__N6_UNIT__*/  async function loadCoachAttendance(){
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
/*__N6_UNIT__*/  const coachPeriode = (() => { const y = new Date().getFullYear(); return { mulai:"1 Januari " + y, selesai:"31 Desember " + y }; })();

  // Riwayat aktivitas — TIDAK ADA endpoint khusus → kosong + empty state, bukan dummy.
/*__N6_UNIT__*/  const historyList = [];

  // Komisi coach — dari GET /commissions/summary?period=YYYY-MM (satu baris per coach per bulan)
/*__N6_UNIT__*/  let gajiSummary = null;
/*__N6_UNIT__*/  let gajiCoachName = '';
/*__N6_UNIT__*/  function currentPeriodKey(){
    return gajiFilterState.tahun + '-' + String(gajiFilterState.bulan).padStart(2,'0');
  }
