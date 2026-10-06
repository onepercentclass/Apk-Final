/**
 * N6 modules - coach / bootstrap
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  const navButtons = document.querySelectorAll('[data-panel]');
/*__N6_UNIT__*/  const panels = document.querySelectorAll('.panel');
/*__N6_UNIT__*/  const pageTitle = document.getElementById('pageTitle');
/*__N6_UNIT__*/  const TITLES = { home:'Beranda', klien:'Klien', info:'Informasi', jadwal:'Absensi', akun:'Akun User' };
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
/*__N6_UNIT__*/  const sidebarEl = document.getElementById('sidebar');
/*__N6_UNIT__*/  const sidebarOverlay = document.getElementById('sidebarOverlay');
/*__N6_UNIT__*/  function openSidebar(){ sidebarEl.classList.add('open'); sidebarOverlay.classList.add('show'); }
/*__N6_UNIT__*/  function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarOverlay.classList.remove('show'); }
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
/*__N6_UNIT__*/  const LOGO_DATA = "assets/img/logo-report.png";
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
/*__N6_UNIT__*/  let toastTimer;
/*__N6_UNIT__*/  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
/*__N6_UNIT__*/  window.showToast = showToast;

  /* ================= SLIP GAJI BUTTON ================= */
  document.getElementById('downloadSlipBtn').addEventListener('click', downloadSlipGaji);

  /* ================= INIT ================= */
/*__N6_UNIT__*/  async function loadAllData(){
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
