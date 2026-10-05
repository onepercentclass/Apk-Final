/**
 * N6 modules - coach / klien
 * menu label : Klien
 * minimum tier: 3
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/coach/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/coach.js. Concatenating every fragment in manifest
 * order reproduces coach.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__
  let schedule = [
    { time:"06:00", client:"Budi Hartono", loc:"GBK Senayan", status:"Selesai", attendance:"hadir" },
    { time:"07:00", client:"Andi Prasetyo", loc:"GBK Senayan", status:"Berlangsung", attendance:null },
    { time:"16:00", client:"Rina Marlina", loc:"Online", status:"Terjadwal", attendance:null },
    { time:"18:00", client:"Yoga Pratama", loc:"Online", status:"Terjadwal", attendance:null },
  ];

/*__N6_UNIT__*/  const gajiSesiList = [
    // September 2026
    { tanggal:"10 Sep 2026", bulan:9, tahun:2026, paket:"Privat", klien:"Budi Hartono", gajiSesi:150000, potongan:0, ket:"" },
    { tanggal:"09 Sep 2026", bulan:9, tahun:2026, paket:"Semi Privat", klien:"Andi Prasetyo", gajiSesi:150000, potongan:15000, ket:"Telat 15 menit" },
    { tanggal:"08 Sep 2026", bulan:9, tahun:2026, paket:"Kelas Running", klien:"Rina Marlina", gajiSesi:120000, potongan:0, ket:"" },
    { tanggal:"06 Sep 2026", bulan:9, tahun:2026, paket:"Pacer / Persiapan Race", klien:"Yoga Pratama", gajiSesi:120000, potongan:0, ket:"" },
    { tanggal:"05 Sep 2026", bulan:9, tahun:2026, paket:"Privat", klien:"Budi Hartono", gajiSesi:150000, potongan:0, ket:"" },
    { tanggal:"04 Sep 2026", bulan:9, tahun:2026, paket:"Semi Privat", klien:"Andi Prasetyo", gajiSesi:150000, potongan:0, ket:"" },
    { tanggal:"02 Sep 2026", bulan:9, tahun:2026, paket:"Korporat (5-20 Orang)", klien:"Citra Ayu", gajiSesi:120000, potongan:30000, ket:"Sesi dibatalkan mendadak oleh klien" },
    { tanggal:"01 Sep 2026", bulan:9, tahun:2026, paket:"Kelas Running", klien:"Rina Marlina", gajiSesi:120000, potongan:0, ket:"" },
    // Agustus 2026
    { tanggal:"28 Agu 2026", bulan:8, tahun:2026, paket:"Privat", klien:"Budi Hartono", gajiSesi:150000, potongan:0, ket:"" },
    { tanggal:"21 Agu 2026", bulan:8, tahun:2026, paket:"Pacer / Persiapan Race", klien:"Yoga Pratama", gajiSesi:120000, potongan:0, ket:"" },
    { tanggal:"14 Agu 2026", bulan:8, tahun:2026, paket:"Semi Privat", klien:"Andi Prasetyo", gajiSesi:150000, potongan:0, ket:"" },
    { tanggal:"07 Agu 2026", bulan:8, tahun:2026, paket:"Kelas Running", klien:"Rina Marlina", gajiSesi:120000, potongan:20000, ket:"Sesi dipersingkat" },
    // Juli 2026
    { tanggal:"24 Jul 2026", bulan:7, tahun:2026, paket:"Privat", klien:"Budi Hartono", gajiSesi:150000, potongan:0, ket:"" },
    { tanggal:"17 Jul 2026", bulan:7, tahun:2026, paket:"Semi Privat", klien:"Andi Prasetyo", gajiSesi:150000, potongan:0, ket:"" },
    { tanggal:"10 Jul 2026", bulan:7, tahun:2026, paket:"Korporat (5-20 Orang)", klien:"Citra Ayu", gajiSesi:120000, potongan:0, ket:"" },
  ];

/*__N6_UNIT__*/  const upcomingSchedule = [
    { date:"Senin, 14 Sep 2026", time:"06:00", client:"Budi Hartono", loc:"GBK Senayan" },
    { date:"Selasa, 15 Sep 2026", time:"16:00", client:"Rina Marlina", loc:"Online" },
    { date:"Rabu, 16 Sep 2026", time:"07:00", client:"Andi Prasetyo", loc:"GBK Senayan" },
    { date:"Kamis, 17 Sep 2026", time:"18:00", client:"Yoga Pratama", loc:"Online" },
    { date:"Sabtu, 19 Sep 2026", time:"09:00", client:"Citra Ayu", loc:"Online" },
  ];

  // Aturan sesi otomatis untuk kalender 30 hari (disimulasikan dari pola jadwal mingguan coach)
/*__N6_UNIT__*/  function getSessionsForDate(date){
    const dow = date.getDay(); // 0=Minggu ... 6=Sabtu
    if (dow === 1) return [{ time:"06:00", client:"Budi Hartono", loc:"GBK Senayan" }];
    if (dow === 2) return [{ time:"16:00", client:"Rina Marlina", loc:"Online" }];
    if (dow === 3) return [{ time:"07:00", client:"Andi Prasetyo", loc:"GBK Senayan" }];
    if (dow === 4) return [{ time:"18:00", client:"Yoga Pratama", loc:"Online" }];
    if (dow === 5) return [{ time:"06:00", client:"Budi Hartono", loc:"GBK Senayan" }, { time:"16:00", client:"Rina Marlina", loc:"Online" }];
    if (dow === 6) return [{ time:"09:00", client:"Citra Ayu", loc:"Online" }];
    return []; // Minggu libur
  }

/*__N6_UNIT__*/  let logs = [
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

/*__N6_UNIT__*/  function renderClients(){
    document.getElementById('clientList').innerHTML = clients.map(c => `
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
/*__N6_UNIT__*/  function renderProgress(){
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
/*__N6_UNIT__*/  function renderRaporSelect(){
    const sel = document.getElementById('raporClientSelect');
    sel.innerHTML = clients.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    sel.addEventListener('change', () => renderRaporDetail(sel.value));
    renderRaporDetail(clients[0].name);
  }
/*__N6_UNIT__*/  function renderRaporDetail(name){
    const r = raporData[name];
    document.getElementById('raporStats').innerHTML = `
      <div class="rapor-stat"><div class="l">Total Sesi</div><div class="v">${r.sesi}</div></div>
      <div class="rapor-stat"><div class="l">Total Jarak</div><div class="v">${r.totalJarak}</div></div>
      <div class="rapor-stat"><div class="l">Rata-rata Pace</div><div class="v">${r.avgPace}</div></div>
      <div class="rapor-stat"><div class="l">Kehadiran</div><div class="v">${r.kehadiran}</div></div>
    `;
    document.getElementById('raporNote').innerHTML = `<b>Catatan Coach:</b> ${r.catatan}`;
  }

  /* ================= RENDER: HISTORY ================= */
/*__N6_UNIT__*/  function renderLogs(){
    document.getElementById('logList').innerHTML = logs.map(l => `
      <div class="log-item">
        <div class="log-item-top"><span>${l.client}</span><span class="date">${l.date}</span></div>
        <div class="stats">${l.distance} · ${l.pace} · <span class="badge neutral">${l.loc || '-'}</span></div>
        <div class="note">${l.note || ''}</div>
      </div>
    `).join('');
  }

  /* ================= NAV: MAIN TABS ================= */
/*__N6_UNIT__*/  const LOGO_DATA = "assets/img/logo-report.png";
  document.getElementById('downloadRaporBtn').addEventListener('click', function(){
    const name = document.getElementById('raporClientSelect').value;
    const r = raporData[name];
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
    doc.text('Coach: Rangga Saputra   ·   Periode: September 2026', marginX, y);
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
