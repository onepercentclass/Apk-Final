/**
 * N6 modules - owner / klien-invoice
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function roundRectPath(ctx, x, y, w, h, r){
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
/*__N6_UNIT__*/  function wrapText(ctx, text, x, y, maxWidth, lineHeight){
    const words = String(text).split(' ');
    let line = '', lines = 0;
    for (let i = 0; i < words.length; i++){
      const test = line + words[i] + ' ';
      if (ctx.measureText(test).width > maxWidth && line){
        ctx.fillText(line.trim(), x, y + lines * lineHeight);
        line = words[i] + ' ';
        lines++;
      } else { line = test; }
    }
    ctx.fillText(line.trim(), x, y + lines * lineHeight);
    return lines + 1;
  }
/*__N6_UNIT__*/  function ensureInvoiceNumber(c){
    if (!c.invoiceNumber){
      c.invoiceNumber = 'INV/N6/' + todayISO().replace(/-/g,'') + '/' + c.id.slice(0,6).toUpperCase();
      persistClients();
    }
    return c.invoiceNumber;
  }

/*__N6_UNIT__*/  window.downloadInvoice = function(id){
    const c = clients.find(x => String(x.id) === String(id));
    if (!c){ showToast('Klien tidak ditemukan'); return; }
    const p = programCache[c.id] || {};
    const invoiceNo = ensureInvoiceNumber(c);

    const W = 900, H = 1273;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // background
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);

    // header bar
    ctx.fillStyle = '#111110'; ctx.fillRect(0, 0, W, 150);
    ctx.fillStyle = '#D62828'; ctx.fillRect(50, 42, 66, 66);
    ctx.fillStyle = '#FFFFFF'; ctx.font = '800 26px Arial'; ctx.textAlign = 'center';
    ctx.fillText('N6', 83, 84);
    ctx.textAlign = 'left';
    ctx.font = '800 24px Arial'; ctx.fillText('NUMBER SIX RUNNING TRAINING', 134, 68);
    ctx.font = '400 14px Arial'; ctx.fillStyle = '#C9C7BE';
    ctx.fillText('n6sport.id  ·  WA 0851-4726-7786', 134, 92);
    ctx.textAlign = 'right'; ctx.fillStyle = '#FFFFFF'; ctx.font = '800 34px Arial';
    ctx.fillText('INVOICE', W - 50, 80);
    ctx.font = '400 14px Arial'; ctx.fillStyle = '#C9C7BE';
    ctx.fillText(invoiceNo, W - 50, 105);
    ctx.textAlign = 'left';

    let y = 200;
    // meta row: tanggal + status
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('TANGGAL INVOICE', 50, y);
    ctx.fillStyle = '#111110'; ctx.font = '600 15px Arial';
    ctx.fillText(formatDateID(todayISO()), 50, y + 22);

    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('STATUS PEMBAYARAN', 330, y);
    const pay = c.paymentStatus || 'Belum Lunas';
    const payColor = pay === 'Lunas' ? '#1E8E3E' : pay === 'DP Sebagian' ? '#B7791F' : '#D62828';
    const payBg = pay === 'Lunas' ? '#E8F5EC' : pay === 'DP Sebagian' ? '#FBF1DF' : '#FCEBEB';
    roundRectPath(ctx, 330, y + 10, 150, 30, 15);
    ctx.fillStyle = payBg; ctx.fill();
    ctx.fillStyle = payColor; ctx.font = '800 13px Arial'; ctx.textAlign = 'center';
    ctx.fillText(pay.toUpperCase(), 405, y + 30);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('COACH PENDAMPING', 610, y);
    ctx.fillStyle = '#111110'; ctx.font = '600 15px Arial';
    ctx.fillText(c.coach || '-', 610, y + 22);

    y += 70;
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(W - 50, y); ctx.stroke();
    y += 40;

    // ditagihkan kepada
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('DITAGIHKAN KEPADA', 50, y);
    y += 26;
    ctx.fillStyle = '#111110'; ctx.font = '800 22px Arial';
    ctx.fillText(c.name, 50, y);
    y += 26;
    ctx.fillStyle = '#3B3A36'; ctx.font = '400 14px Arial';
    ctx.fillText(c.phone || '-', 50, y);
    y += 20;
    ctx.fillText('Periode program: ' + formatDateID(p.startDate) + ' – ' + formatDateID(p.endDate), 50, y);

    y += 50;
    // table header
    ctx.fillStyle = '#F5F3EE'; ctx.fillRect(50, y, W - 100, 40);
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 12px Arial';
    ctx.fillText('DESKRIPSI PROGRAM', 66, y + 25);
    ctx.textAlign = 'right'; ctx.fillText('BIAYA', W - 66, y + 25); ctx.textAlign = 'left';
    y += 40;

    // table row
    const rowTop = y;
    ctx.fillStyle = '#111110'; ctx.font = '700 16px Arial';
    ctx.fillText(c.programLabel || '-', 66, y + 30);
    ctx.font = '400 13px Arial'; ctx.fillStyle = '#6E6C64';
    let detailLine = '';
    const meta = c.packageMeta || {};
    if (meta.mode === 'configurable') detailLine = meta.totalSessions + 'x pertemuan (' + meta.meetings + 'x/minggu × ' + meta.weeks + ' minggu)';
    else if (meta.mode === 'fixed') detailLine = 'Paket tetap';
    else if (meta.mode === 'custom') detailLine = (meta.partnerName ? meta.partnerName + ' — ' : '') + (meta.count ? meta.count + ' peserta' : '') + (meta.note ? ' · ' + meta.note : '');
    let extraLines = detailLine ? wrapText(ctx, detailLine, 66, y + 52, 560, 18) : 0;
    ctx.textAlign = 'right'; ctx.fillStyle = '#111110'; ctx.font = '700 16px Arial';
    ctx.fillText(formatRupiah(c.price || 0), W - 66, y + 30);
    ctx.textAlign = 'left';
    y = rowTop + Math.max(60, 40 + extraLines * 18);

    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(50, y); ctx.lineTo(W - 50, y); ctx.stroke();
    y += 34;

    // totals
    const price = c.price || 0;
    const paid = c.amountPaid || 0;
    const remaining = Math.max(0, price - paid);
    function totalRow(label, value, bold){
      ctx.fillStyle = bold ? '#111110' : '#6E6C64';
      ctx.font = (bold ? '800 20px' : '400 14px') + ' Arial';
      ctx.fillText(label, 480, y);
      ctx.textAlign = 'right'; ctx.fillText(value, W - 66, y); ctx.textAlign = 'left';
      y += bold ? 34 : 26;
    }
    totalRow('Total Tagihan', formatRupiah(price), false);
    if (pay === 'DP Sebagian'){
      totalRow('Sudah Dibayar', formatRupiah(paid), false);
      totalRow('SISA TAGIHAN', formatRupiah(remaining), true);
    } else if (pay === 'Lunas'){
      totalRow('TOTAL DIBAYAR', formatRupiah(price), true);
    } else {
      totalRow('TOTAL TAGIHAN', formatRupiah(price), true);
    }

    // footer
    const footY = H - 130;
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(50, footY); ctx.lineTo(W - 50, footY); ctx.stroke();
    ctx.fillStyle = '#3B3A36'; ctx.font = '600 14px Arial';
    ctx.fillText('Terima kasih telah bergabung bersama N6 Running Training.', 50, footY + 34);
    ctx.fillStyle = '#6E6C64'; ctx.font = '400 12.5px Arial';
    ctx.fillText('Pertanyaan seputar invoice ini bisa hubungi Admin CS via WhatsApp 0851-4726-7786.', 50, footY + 56);
    ctx.fillText('Dokumen ini dibuat otomatis oleh sistem Admin CS N6 — ' + formatDateID(todayISO()) + '.', 50, footY + 78);

    const link = document.createElement('a');
    link.download = 'Invoice-' + slugify(c.name) + '-' + todayISO() + '.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.93);
    link.click();
    showToast('Invoice diunduh');
  };

  /* ================= DETAIL KLIEN ================= */
