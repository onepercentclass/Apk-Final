/**
 * N6 modules - coach / _core
 * menu label : shared core / boot / state
 * minimum tier: n/a
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/coach/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/coach.js. Concatenating every fragment in manifest
 * order reproduces coach.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__

  /* ================= MOCK DATA ================= */
/*__N6_UNIT__*/  const clients = [
    { name:"Budi Hartono", goal:"10K", last:"Kemarin", type:"Offline", produk:"Privat", status:"Aktif", mulai:"1 Agu 2026", selesai:"30 Sep 2026" },
    { name:"Andi Prasetyo", goal:"Turun BB", last:"Hari ini", type:"Offline", produk:"Semi Privat", status:"Aktif", mulai:"15 Agu 2026", selesai:"15 Okt 2026" },
    { name:"Rina Marlina", goal:"Half Marathon", last:"2 hari lalu", type:"Online", produk:"Kelas Running", status:"Aktif", mulai:"1 Sep 2026", selesai:"31 Okt 2026" },
    { name:"Yoga Pratama", goal:"5K", last:"3 hari lalu", type:"Online", produk:"Pacer / Persiapan Race", status:"Aktif", mulai:"20 Agu 2026", selesai:"20 Sep 2026" },
    { name:"Citra Ayu", goal:"Full Marathon", last:"Kemarin", type:"Online", produk:"Korporat (5-20 Orang)", status:"Pending", mulai:"5 Sep 2026", selesai:"5 Jan 2027" },
  ];

/*__N6_UNIT__*/  const clientProgress = [
    { name:"Budi Hartono", goal:"10K", progress:72, note:"Pace membaik dari 6:40 → 6:10/km dalam 6 minggu." },
    { name:"Andi Prasetyo", goal:"Turun 8 kg", progress:45, note:"Sudah turun 3.6 kg dari target 8 kg." },
    { name:"Rina Marlina", goal:"Half Marathon", progress:60, note:"Latihan jarak jauh mingguan konsisten." },
    { name:"Yoga Pratama", goal:"5K", progress:88, note:"Tinggal fine-tuning pace menjelang race." },
    { name:"Citra Ayu", goal:"Full Marathon", progress:20, note:"Baru mulai fase base building." },
  ];

/*__N6_UNIT__*/  const raporData = {
    "Budi Hartono": { sesi:12, totalJarak:"86 km", avgPace:"6:15/km", kehadiran:"100%", catatan:"Progres sangat baik dan konsisten. Siap diarahkan untuk ikut race 10K bulan depan." },
    "Andi Prasetyo": { sesi:10, totalJarak:"48 km", avgPace:"7:20/km", kehadiran:"90%", catatan:"Penurunan berat badan sesuai target. Perlu jaga konsistensi jadwal latihan sore." },
    "Rina Marlina": { sesi:9, totalJarak:"64 km", avgPace:"6:50/km", kehadiran:"95%", catatan:"Volume latihan mingguan meningkat bertahap, siap lanjut ke fase build-up HM." },
    "Yoga Pratama": { sesi:11, totalJarak:"39 km", avgPace:"6:05/km", kehadiran:"100%", catatan:"Sangat siap untuk target 5K, tinggal jaga pola tidur menjelang race." },
    "Citra Ayu": { sesi:4, totalJarak:"22 km", avgPace:"7:45/km", kehadiran:"80%", catatan:"Masih tahap adaptasi. Perlu pendampingan lebih intens di fase awal." },
  };

  // Data untuk grafik Prestasi & Performa
/*__N6_UNIT__*/  const chartData = {
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

/*__N6_UNIT__*/  let coachAttendanceList = [
    { tanggal:"10 Sep 2026", sesi:"06:00 — Budi Hartono", status:"Tepat Waktu", ket:"-", feedback:{ score:95, komentar:"Konsisten datang lebih awal, pertahankan!" } },
    { tanggal:"09 Sep 2026", sesi:"07:00 — Andi Prasetyo", status:"Terlambat", ket:"Macet di jalan", feedback:{ score:70, komentar:"Mohon berangkat lebih awal untuk sesi pagi." } },
    { tanggal:"08 Sep 2026", sesi:"16:00 — Rina Marlina", status:"Latihan Sedang Berjalan", ket:"Check-in saat sesi berjalan karena kendala aplikasi", feedback:null },
    { tanggal:"05 Sep 2026", sesi:"06:00 — Budi Hartono", status:"Tepat Waktu", ket:"-", feedback:{ score:95, komentar:"Baik, sesuai jadwal." } },
    { tanggal:"04 Sep 2026", sesi:"07:00 — Andi Prasetyo", status:"Tepat Waktu", ket:"-", feedback:{ score:92, komentar:"Baik." } },
    { tanggal:"02 Sep 2026", sesi:"18:00 — Yoga Pratama", status:"Terlambat", ket:"Ban bocor", feedback:{ score:65, komentar:"Sudah 2x terlambat bulan ini, mohon diperhatikan." } },
  ];
/*__N6_UNIT__*/  const coachPeriode = { mulai:"1 Januari 2026", selesai:"31 Desember 2026" };

/*__N6_UNIT__*/  const historyList = [
    { date:"10 Sep 2026", activity:"Sesi latihan bersama Budi Hartono", type:"Sesi" },
    { date:"09 Sep 2026", activity:"Mengajukan reschedule sesi Rina Marlina", type:"Reschedule" },
    { date:"05 Sep 2026", activity:"Cuti 1 hari disetujui Head Coach", type:"Cuti" },
    { date:"01 Sep 2026", activity:"Menerima gaji periode Agustus 2026", type:"Gaji" },
    { date:"28 Agu 2026", activity:"Sesi latihan bersama Yoga Pratama", type:"Sesi" },
  ];

/*__N6_UNIT__*/  const bonusList = [
    { bulan:9, tahun:2026, jumlah:200000, ket:"Bonus kehadiran 100%" },
    { bulan:8, tahun:2026, jumlah:100000, ket:"Bonus referral klien baru" },
    { bulan:7, tahun:2026, jumlah:0, ket:"-" },
  ];

/*__N6_UNIT__*/  const coachRaporList = [
    { periode:"Agustus 2026", kehadiran:"96%", kepuasan:"4.8 / 5", catatan:"Konsisten dan komunikatif dengan klien. Pertahankan kualitas ini." },
    { periode:"Juli 2026", kehadiran:"93%", kepuasan:"4.6 / 5", catatan:"Perlu lebih tepat waktu untuk sesi pagi." },
  ];

/*__N6_UNIT__*/  let rescheduleRequests = [
    { sesi:"Rina Marlina — 16:00, 12 Sep 2026", baru:"13 Sep 2026, 17:00", alasan:"Klien ada acara mendadak", status:"Menunggu" },
    { sesi:"Yoga Pratama — 18:00, 10 Sep 2026", baru:"11 Sep 2026, 18:00", alasan:"Hujan deras", status:"Disetujui" },
  ];

/*__N6_UNIT__*/  let cutiRequests = [
    { mulai:"20 Sep 2026", selesai:"21 Sep 2026", alasan:"Acara keluarga", status:"Menunggu" },
    { mulai:"05 Agu 2026", selesai:"05 Agu 2026", alasan:"Sakit", status:"Disetujui" },
  ];

  // Tanda waktu coach tidak bisa mengajar (agar Admin tahu saat mengatur jadwal klien baru)
/*__N6_UNIT__*/  let coachUnavailable = [
    { id:1, tanggal:"2026-09-25", allDay:false, jamMulai:"14:00", jamSelesai:"18:00", alasan:"Menghadiri acara keluarga" },
    { id:2, tanggal:"2026-10-02", allDay:true, jamMulai:"", jamSelesai:"", alasan:"Cuti pribadi (sudah diajukan ke Admin)" },
  ];
/*__N6_UNIT__*/  let unavailIdSeq = 3;

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
/*__N6_UNIT__*/  const CHART_RED = '#D62828';
/*__N6_UNIT__*/  const CHART_INK = '#111110';
/*__N6_UNIT__*/  const CHART_ASPHALT = '#6E6C64';
/*__N6_UNIT__*/  const CHART_GREEN = '#1E8E3E';
/*__N6_UNIT__*/  const CHART_AMBER = '#B7791F';
/*__N6_UNIT__*/  const CHART_GRID = '#F0EEE7';

/*__N6_UNIT__*/  let chartModalInstance = null;
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
/*__N6_UNIT__*/  function typeBadge(type){ return `<span class="badge neutral">${type}</span>`; }
/*__N6_UNIT__*/  function clientStatusBadge(status){ return `<span class="badge ${status==='Aktif'?'green':'amber'}">${status}</span>`; }
/*__N6_UNIT__*/  const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
/*__N6_UNIT__*/  let gajiFilterState = { bulan: 9, tahun: 2026 };

/*__N6_UNIT__*/  function getGajiFiltered(){
    return gajiSesiList.filter(g => g.bulan === gajiFilterState.bulan && g.tahun === gajiFilterState.tahun);
  }
/*__N6_UNIT__*/  function getBonusForPeriod(){
    return bonusList.find(b => b.bulan === gajiFilterState.bulan && b.tahun === gajiFilterState.tahun) || { jumlah:0, ket:'-' };
  }

/*__N6_UNIT__*/  let lastFilteredGaji = [];

/*__N6_UNIT__*/  function pdfHeader(doc, subtitle){
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
/*__N6_UNIT__*/  function pdfFooter(doc){
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

/*__N6_UNIT__*/  function downloadSlipGaji(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit:'pt', format:'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const marginX = 40;

    const headerSubtitle = 'Gaji Coach';
    let y = pdfHeader(doc, headerSubtitle);
    y += 26;

    doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(17,17,16);
    doc.text('Rangga Saputra', marginX, y);
    y += 15;
    doc.setFont('helvetica','normal'); doc.setFontSize(9.5); doc.setTextColor(110,108,100);
    doc.text('Coach — N6 Running Training', marginX, y);
    y += 13;
    doc.text('Periode: ' + MONTH_NAMES[gajiFilterState.bulan-1] + ' ' + gajiFilterState.tahun, marginX, y);
    y += 20;

    const filtered = getGajiFiltered();
    const bonus = getBonusForPeriod();

    const body = filtered.map(g => {
      const diterima = g.gajiSesi - g.potongan;
      return [
        g.tanggal,
        g.paket + ' — ' + g.klien,
        fmtIDR(g.gajiSesi),
        g.potongan > 0 ? '-' + fmtIDR(g.potongan) : '-',
        fmtIDR(diterima)
      ];
    });

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

    const totalGaji = filtered.reduce((a,g) => a + g.gajiSesi, 0);
    const totalPotongan = filtered.reduce((a,g) => a + g.potongan, 0);
    const totalDiterima = totalGaji - totalPotongan + bonus.jumlah;

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
    doc.text('Total Gaji Sesi', boxX+14, sy); doc.text(fmtIDR(totalGaji), boxX+boxW-14, sy, { align:'right' });
    sy += 16;
    doc.setTextColor(37,99,174);
    doc.text('Bonus (' + (bonus.ket || '-') + ')', boxX+14, sy); doc.text('+' + fmtIDR(bonus.jumlah), boxX+boxW-14, sy, { align:'right' });
    sy += 16;
    doc.setTextColor(214,40,40);
    doc.text('Total Potongan', boxX+14, sy); doc.text('-' + fmtIDR(totalPotongan), boxX+boxW-14, sy, { align:'right' });
    sy += 8;
    doc.setDrawColor(214,40,40); doc.line(boxX+14, sy+6, boxX+boxW-14, sy+6);
    sy += 24;
    doc.setFont('helvetica','bold'); doc.setFontSize(12.5); doc.setTextColor(17,17,16);
    doc.text('Total Diterima', boxX+14, sy); doc.text(fmtIDR(totalDiterima), boxX+boxW-14, sy, { align:'right' });

    y += 98 + 22;
    doc.setFont('helvetica','italic'); doc.setFontSize(8.5); doc.setTextColor(150,40,40);
    doc.text('Dokumen ini bersifat rahasia dan hanya untuk Coach yang bersangkutan, Admin, dan Owner.', marginX, y);

    pdfFooter(doc);

    doc.save('slip-gaji-rangga-saputra-' + gajiFilterState.bulan + '-' + gajiFilterState.tahun + '.pdf');
    showToast('Slip gaji berhasil diunduh');
  }

  /* ================= RENDER: COACH RAPOR ================= */
/*__N6_UNIT__*/  function statusBadgeGeneric(status){
    const tone = status === "Disetujui" ? "green" : status === "Ditolak" ? "red" : "amber";
    return `<span class="badge ${tone}">${status}</span>`;
  }
/*__N6_UNIT__*/  function coachAttendanceBadge(status){
    const tone = status === 'Tepat Waktu' ? 'green' : status === 'Terlambat' ? 'amber' : 'blue';
    return `<span class="badge ${tone}">${status}</span>`;
  }
/*__N6_UNIT__*/  function feedbackScoreBadge(feedback){
    if (!feedback) return `<span class="badge neutral">Menunggu Review</span>`;
    const tone = feedback.score >= 85 ? 'green' : feedback.score >= 70 ? 'amber' : 'red';
    return `<span class="badge ${tone}">Score ${feedback.score}</span>`;
  }
/*__N6_UNIT__*/  const DOW_LABEL = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
/*__N6_UNIT__*/  const MONTH_LABEL = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
/*__N6_UNIT__*/  let selectedCalDate = null;

/*__N6_UNIT__*/  function fmtCalDate(d){
    return d.getDate() + ' ' + MONTH_LABEL[d.getMonth()] + ' ' + d.getFullYear();
  }
/*__N6_UNIT__*/  function sameDay(a,b){
    return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  }
/*__N6_UNIT__*/  function toDateKey(d){
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
/*__N6_UNIT__*/  function fmtDateKeyLabel(key){
    const [y,m,d] = key.split('-').map(Number);
    return fmtCalDate(new Date(y, m-1, d));
  }
/*__N6_UNIT__*/  function getUnavailableForDate(d){
    const key = toDateKey(d);
    return coachUnavailable.filter(u => u.tanggal === key);
  }

  /* ================= RENDER: WAKTU TIDAK BISA MENGAJAR ================= */
/*__N6_UNIT__*/  const navButtons = document.querySelectorAll('[data-panel]');
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
/*__N6_UNIT__*/  let toastTimer;
