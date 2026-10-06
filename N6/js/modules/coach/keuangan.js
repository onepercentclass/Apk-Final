/**
 * N6 modules - coach / keuangan
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
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

/*__N6_UNIT__*/  window.openGajiDetail = function(){
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
/*__N6_UNIT__*/  window.closeGajiDetail = function(){
    document.getElementById('gajiDetailModal').classList.remove('show');
  };

  /* ================= PDF: HEADER & FOOTER BERSAMA (branding konsisten) ================= */
  // Header hitam + garis aksen merah di bawahnya, dipakai di semua PDF (Rapor & Slip Gaji)
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
/*__N6_UNIT__*/  function renderCoachRapor(){
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
/*__N6_UNIT__*/  function statusBadgeGeneric(status){
    const tone = status === "Disetujui" ? "green" : status === "Ditolak" ? "red" : "amber";
    return `<span class="badge ${tone}">${status}</span>`;
  }
