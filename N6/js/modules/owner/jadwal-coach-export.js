/**
 * N6 modules - owner / jadwal-coach-export
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  window.downloadCoachScheduleImage = async function(coachId, startStr){
    const coach = coachById(coachId);
    if (!coach){ showToast('Pilih coach terlebih dahulu'); return; }

    const startDate = startStr ? new Date(startStr + 'T00:00:00') : new Date(new Date().setHours(0,0,0,0));
    if (isNaN(startDate.getTime())){ showToast('Tanggal mulai tidak valid'); return; }

    const schedCheck = coachSchedule[coachId] || {};
    const offCheck = coachDayOff[coachId] || [];
    const noDataYet = !Object.keys(schedCheck).length && !offCheck.length;

    const logoImg = new Image();
    await new Promise((resolve) => { logoImg.onload = resolve; logoImg.onerror = resolve; logoImg.src = LOGO_DATA; });

    const MONTH_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const DOW_SHORT = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    const totalDays = 30;
    const jsStartDay = startDate.getDay();
    const startWd = jsStartDay === 0 ? 6 : jsStartDay - 1; // 0 = Senin
    const rows = Math.ceil((startWd + totalDays) / 7);

    // ===== KANVAS RASIO A4 POTRAIT (210:297mm ≈ 1:1.4142), resolusi cetak layak (150dpi) =====
    const W = 1240, H = 1754, marginX = 60;
    const headerH = 130, stripH = 6;
    const nameY = 195, subtitleY = nameY + 27, rangeY = subtitleY + 21;
    const dividerY = rangeY + 32;
    const dowY = dividerY + 42;
    const gridTop = dowY + 20;

    // Sisa tinggi di bawah grid (jarak + legenda 2 baris + footer 2 baris) dihitung tetap,
    // lalu tinggi tiap sel kalender dibagi rata supaya grid selalu pas mengisi satu halaman A4 penuh.
    const bottomFixed = 40 + 30 + 38 + 30 + 24 + 40; // gap+legend2baris+gap+footer2baris+padding bawah
    const cellH = (H - gridTop - bottomFixed) / rows;
    const gridBottom = gridTop + rows * cellH;
    const legendTop = gridBottom + 40;
    const footerDividerY = legendTop + 30 + 38;
    const footerLine1Y = footerDividerY + 30;
    const footerLine2Y = footerLine1Y + 24;

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);

    // ===== HEADER (konsisten dgn Laporan Keuangan Coach & Invoice) =====
    ctx.fillStyle = '#111110'; ctx.fillRect(0, 0, W, headerH);
    const logoW = 132, logoH = logoW * (168 / 325);
    const logoX = marginX, logoY = (headerH - logoH) / 2;
    if(logoImg.complete && logoImg.naturalWidth)ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    const textX = logoX + logoW + 20;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF'; ctx.font = '800 34px Arial';
    ctx.fillText('NUMBER SIX RUNNING', textX, 62);
    ctx.fillStyle = '#C9C7BE'; ctx.font = '400 17px Arial';
    ctx.fillText('Jadwal Latihan Coach', textX, 88);
    ctx.fillStyle = '#D62828'; ctx.fillRect(0, headerH, W, stripH);

    // ===== IDENTITAS COACH & RENTANG TANGGAL =====
    const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + totalDays - 1);
    ctx.fillStyle = '#111110'; ctx.font = '800 28px Arial';
    ctx.fillText(coach.name, marginX, nameY);
    ctx.fillStyle = '#6E6C64'; ctx.font = '400 16px Arial';
    ctx.fillText('Jadwal Latihan — 30 Hari ke Depan', marginX, subtitleY);
    ctx.fillText(formatDateID(dateStrOf(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) + ' – ' + formatDateID(dateStrOf(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())), marginX, rangeY);

    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(marginX, dividerY); ctx.lineTo(W - marginX, dividerY); ctx.stroke();

    // ===== HEADER HARI (SEN—MIN) =====
    const colW = (W - marginX * 2) / 7;
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 14px Arial'; ctx.textAlign = 'center';
    DOW_SHORT.forEach((d, i) => ctx.fillText(d.toUpperCase(), marginX + i * colW + colW / 2, dowY));
    ctx.textAlign = 'left';

    // ===== GRID 30 HARI (tinggi sel otomatis mengisi penuh sisa halaman A4) =====
    const sched = coachSchedule[coachId] || {};
    const todayStr = todayISO();

    // ukuran pil zona waktu dihitung dinamis dari cellH supaya selalu proporsional & terbaca jelas
    const pillAreaTop = 52, pillBottomPad = 16, pillGapV = 10, pillGapH = 10, pillSidePad = 14;
    const pillAreaH = cellH - pillAreaTop - pillBottomPad;
    const pillH = Math.max(28, (pillAreaH - pillGapV) / 2);
    const pillW = (colW - pillSidePad * 2 - pillGapH) / 2;

    for (let i = 0; i < rows * 7; i++){
      const col = i % 7, row = Math.floor(i / 7);
      const cx = marginX + col * colW, cy = gridTop + row * cellH;
      ctx.strokeStyle = '#E7E4DB'; ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, colW, cellH);

      const dayOffset = i - startWd;
      if (dayOffset < 0 || dayOffset >= totalDays) continue;

      const d = new Date(startDate); d.setDate(d.getDate() + dayOffset);
      const dateStr = dateStrOf(d.getFullYear(), d.getMonth(), d.getDate());
      const weekday = DAYS[col];
      const isToday = dateStr === todayStr;
      const off = isCoachOff(coachId, dateStr);

      if (isToday){
        ctx.fillStyle = '#F5F3EE'; ctx.fillRect(cx + 1, cy + 1, colW - 2, cellH - 2);
        ctx.lineWidth = 2.5; ctx.strokeStyle = '#111110'; ctx.strokeRect(cx + 1.5, cy + 1.5, colW - 3, cellH - 3);
      }

      ctx.fillStyle = '#111110'; ctx.font = (isToday ? '800' : '700') + ' 18px Arial';
      const dateLabel = String(d.getDate()) + (d.getDate() === 1 || dayOffset === 0 ? ' ' + MONTH_SHORT[d.getMonth()] : '');
      ctx.fillText(dateLabel, cx + pillSidePad, cy + 30);

      if (off){
        // Libur: blok warna hijau solid
        ctx.fillStyle = '#1E8E3E'; ctx.fillRect(cx + 2, cy + 2, colW - 4, cellH - 4);
        ctx.fillStyle = '#FFFFFF'; ctx.font = '800 16px Arial'; ctx.textAlign = 'center';
        ctx.fillText('LIBUR', cx + colW / 2, cy + cellH / 2 + 6);
        ctx.textAlign = 'left';
        continue;
      }

      const px0 = cx + pillSidePad, py0 = cy + pillAreaTop;
      BLOCKS.forEach((b, bi) => {
        const bc = bi % 2, br = Math.floor(bi / 2);
        const px = px0 + bc * (pillW + pillGapH), py = py0 + br * (pillH + pillGapV);
        const slot = sched[weekday + '|' + b.key];
        const filled = !!slot;
        const timeLabel = (filled && slot.timeStart && slot.timeEnd) ? (slot.timeStart + '–' + slot.timeEnd) : b.time;

        // Blok warna solid: putih = tersedia, merah = terisi/penuh
        ctx.fillStyle = filled ? '#D62828' : '#FFFFFF';
        roundRectPath(ctx, px, py, pillW, pillH, 5);
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = filled ? '#D62828' : '#C9C7BE';
        roundRectPath(ctx, px, py, pillW, pillH, 5);
        ctx.stroke();

        const textColor = filled ? '#FFFFFF' : '#111110';
        ctx.fillStyle = textColor; ctx.textAlign = 'center';
        ctx.font = '800 12px Arial';
        ctx.fillText(b.label.toUpperCase(), px + pillW / 2, py + pillH * 0.38);
        ctx.font = '700 10.5px Arial';
        ctx.fillText(filled ? 'TERISI' : 'TERSEDIA', px + pillW / 2, py + pillH * 0.62);
        ctx.font = '400 10px Arial';
        ctx.fillText(timeLabel, px + pillW / 2, py + pillH * 0.84);
        ctx.textAlign = 'left';
      });
    }

    // ===== LEGENDA =====
    function legendSwatch(x, yy, mode, label){
      const s = 26, sy = yy - 19;
      const bg = mode === 'off' ? '#1E8E3E' : mode === 'filled' ? '#D62828' : '#FFFFFF';
      const border = mode === 'off' ? '#1E8E3E' : mode === 'filled' ? '#D62828' : '#C9C7BE';
      ctx.fillStyle = bg; roundRectPath(ctx, x, sy, s, s, 4); ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = border; roundRectPath(ctx, x, sy, s, s, 4); ctx.stroke();
      ctx.fillStyle = '#3B3A36'; ctx.font = '400 14.5px Arial'; ctx.textAlign = 'left';
      ctx.fillText(label, x + s + 12, yy);
    }
    legendSwatch(marginX, legendTop, 'empty', 'Putih — Tersedia, bisa dipesan');
    legendSwatch(marginX + 340, legendTop, 'filled', 'Merah — Terisi / penuh');
    legendSwatch(marginX + 600, legendTop, 'off', 'Hijau — Coach libur sepanjang hari');
    ctx.fillStyle = '#8C8A82'; ctx.font = '400 13.5px Arial';
    ctx.fillText('Jam pada tiap sesi mengikuti jadwal yang sudah ditentukan Admin CS.', marginX, legendTop + 30);

    // ===== FOOTER =====
    const printLabel = nowPrintLabel();
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(marginX, footerDividerY); ctx.lineTo(W - marginX, footerDividerY); ctx.stroke();
    ctx.fillStyle = '#3B3A36'; ctx.font = '600 15px Arial';
    ctx.fillText('Tertarik ikut sesi latihan? Hubungi Admin CS N6 via WhatsApp 0851-4726-7786.', marginX, footerLine1Y);
    ctx.fillStyle = '#8C8A82'; ctx.font = '400 12.5px Arial';
    ctx.fillText('Dicetak otomatis oleh sistem pada ' + printLabel.tanggal + ', pukul ' + printLabel.jam, marginX, footerLine2Y);
    ctx.fillStyle = '#111110'; ctx.font = '700 13px Arial'; ctx.textAlign = 'right';
    ctx.fillText('NUMBER SIX RUNNING', W - marginX, footerLine2Y);
    ctx.textAlign = 'left';

    const link = document.createElement('a');
    link.download = 'Jadwal-' + slugify(coach.name) + '-30hari-' + todayISO() + '.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    link.click();
    showToast(noDataYet
      ? coach.name + ' belum punya jadwal tersimpan — semua sesi tampil Kosong. Tandai slot di tab "Pola Mingguan", klik Simpan, baru unduh lagi.'
      : 'Jadwal ' + coach.name + ' berhasil diunduh');
  };


  /* ================= JADWAL COACH (ROSTER + KETERSEDIAAN) ================= */
