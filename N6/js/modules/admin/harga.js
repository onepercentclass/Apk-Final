/**
 * N6 modules - admin / harga
 * menu label : Harga & Program
 * minimum tier: 1
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/admin/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/admin.js. Concatenating every fragment in manifest
 * order reproduces admin.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__

  /* ================= LOAD DATA ================= */
/*__N6_UNIT__*/  function ensureInvoiceNumber(c){
    if (!c.invoiceNumber){
      c.invoiceNumber = 'INV/N6/' + todayISO().replace(/-/g,'') + '/' + c.id.slice(0,6).toUpperCase();
      persistClients();
    }
    return c.invoiceNumber;
  }

  window.downloadInvoice = async function(id){
    const c = clients.find(x => x.id === id);
    if (!c){ showToast('Klien tidak ditemukan'); return; }
    const p = programCache[c.id] || {};
    const invoiceNo = ensureInvoiceNumber(c);

    // preload logo dulu supaya drawImage tidak kosong
    const logoImg = new Image();
    await new Promise((resolve) => { logoImg.onload = resolve; logoImg.onerror = resolve; logoImg.src = LOGO_DATA; });

    const pay = c.paymentStatus || 'Belum Lunas';
    const meta = c.packageMeta || {};
    let detailLine = '';
    if (meta.mode === 'configurable') detailLine = meta.totalSessions + 'x pertemuan (' + meta.meetings + 'x/minggu × ' + meta.weeks + ' minggu)';
    else if (meta.mode === 'fixed') detailLine = 'Paket tetap — ' + ((catalogById(c.programId) || {}).unit || '');
    else if (meta.mode === 'custom') detailLine = (meta.partnerName ? meta.partnerName + ' — ' : '') + (meta.count ? meta.count + ' peserta' : '') + (meta.note ? ' · ' + meta.note : '');
    const noteText = 'Invoice ini dicetak otomatis oleh sistem dan sah tanpa tanda tangan basah. Pertanyaan seputar invoice ini bisa menghubungi Admin CS via WhatsApp 0851-4726-7786.';

    // ===== KANVAS RASIO A4 POTRAIT (210:297mm), resolusi cetak layak (150dpi) =====
    const W = 1240, H = 1754, marginX = 70;

    // ukur teks lebih dulu di canvas sementara (untuk word-wrap yang presisi sebelum digambar)
    const measureCanvas = document.createElement('canvas');
    const mctx = measureCanvas.getContext('2d');
    mctx.font = '400 16px Arial';
    const detailLines = detailLine ? wrapLines(mctx, detailLine, 278) : [];
    mctx.font = 'italic 400 16px Arial';
    const noteLines = wrapLines(mctx, noteText, W - marginX * 2);

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);

    // ===== HEADER (hitam padat + garis merah + logo & judul rapat-sejajar) =====
    const headerH = 148, stripH = 7;
    ctx.fillStyle = '#111110'; ctx.fillRect(0, 0, W, headerH);
    const logoW = 130, logoH = logoW * (168 / 325);
    const logoX = marginX, logoY = (headerH - logoH) / 2;
    ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    const textX = logoX + logoW + 20;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF'; ctx.font = '800 34px Arial';
    ctx.fillText('NUMBER SIX RUNNING', textX, 72);
    ctx.fillStyle = '#C9C7BE'; ctx.font = '400 17px Arial';
    ctx.fillText('Invoice Klien', textX, 100);
    ctx.fillStyle = '#D62828'; ctx.fillRect(0, headerH, W, stripH);

    // ===== BARIS IDENTITAS: KIRI (Ditagihkan Kepada) & KANAN (Meta Invoice) =====
    const topY = 200;

    ctx.fillStyle = '#6E6C64'; ctx.font = '700 14px Arial';
    ctx.fillText('DITAGIHKAN KEPADA', marginX, topY);
    ctx.fillStyle = '#111110'; ctx.font = '800 28px Arial';
    ctx.fillText(c.name, marginX, topY + 34);
    ctx.fillStyle = '#6E6C64'; ctx.font = '400 16px Arial';
    ctx.fillText((c.programLabel || 'Klien') + ' — ' + (c.phone || '-'), marginX, topY + 62);
    ctx.fillText('Periode program: ' + formatDateID(p.startDate) + ' – ' + formatDateID(p.endDate), marginX, topY + 86);
    let leftBottom = topY + 86;
    if (c.packageMeta && c.packageMeta.pairLabel){
      ctx.fillText('Peserta Semi Private bersama: ' + c.packageMeta.pairLabel, marginX, topY + 110);
      leftBottom = topY + 110;
    }

    const metaX = 780;
    function metaBlock(label, value, yy){
      ctx.fillStyle = '#6E6C64'; ctx.font = '700 13px Arial'; ctx.textAlign = 'left';
      ctx.fillText(label, metaX, yy);
      ctx.fillStyle = '#111110'; ctx.font = '600 18px Arial';
      ctx.fillText(value, metaX, yy + 24);
    }
    metaBlock('NO. INVOICE', invoiceNo.length > 24 ? invoiceNo.slice(0, 24) + '…' : invoiceNo, topY);
    metaBlock('TANGGAL', formatDateID(todayISO()), topY + 48);
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 13px Arial';
    ctx.fillText('STATUS PEMBAYARAN', metaX, topY + 96);
    const payColor = pay === 'Lunas' ? '#1E8E3E' : pay === 'DP Sebagian' ? '#B7791F' : '#D62828';
    const payBg = pay === 'Lunas' ? '#E8F5EC' : pay === 'DP Sebagian' ? '#FBF1DF' : '#FCEBEB';
    roundRectPath(ctx, metaX, topY + 104, 130, 32, 16);
    ctx.fillStyle = payBg; ctx.fill();
    ctx.fillStyle = payColor; ctx.font = '800 14px Arial'; ctx.textAlign = 'center';
    ctx.fillText(pay.toUpperCase(), metaX + 65, topY + 125);
    ctx.textAlign = 'left';
    const rightBottom = topY + 136;

    const dividerY = Math.max(leftBottom, rightBottom) + 40;
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(marginX, dividerY); ctx.lineTo(W - marginX, dividerY); ctx.stroke();

    // ===== TABEL RINCIAN PROGRAM (grid hitam-putih, konsisten dgn Laporan Keuangan Coach) =====
    const tableTop = dividerY + 40;
    const tableX0 = marginX, tableX1 = W - marginX;
    const col1X = tableX0, col2X = tableX0 + 480, col3X = col2X + 310;
    const headerRowH = 48;

    ctx.fillStyle = '#111110'; ctx.fillRect(tableX0, tableTop, tableX1 - tableX0, headerRowH);
    ctx.fillStyle = '#FFFFFF'; ctx.font = '700 15px Arial'; ctx.textAlign = 'left';
    ctx.fillText('DESKRIPSI PROGRAM', col1X + 20, tableTop + 30);
    ctx.fillText('RINCIAN', col2X + 20, tableTop + 30);
    ctx.textAlign = 'right'; ctx.fillText('BIAYA', tableX1 - 20, tableTop + 30); ctx.textAlign = 'left';

    const rowY = tableTop + headerRowH;
    const rowH = Math.max(80, 40 + detailLines.length * 21 + 24);

    ctx.fillStyle = '#FAFAF7'; ctx.fillRect(tableX0, rowY, tableX1 - tableX0, rowH);
    ctx.fillStyle = '#111110'; ctx.font = '800 21px Arial';
    ctx.fillText(c.programLabel || '-', col1X + 20, rowY + 34);
    ctx.fillStyle = '#6E6C64'; ctx.font = '400 16px Arial';
    detailLines.forEach((line, i) => ctx.fillText(line, col2X + 20, rowY + 34 + i * 21));
    ctx.fillStyle = '#111110'; ctx.font = '800 24px Arial'; ctx.textAlign = 'right';
    ctx.fillText(formatRupiah(c.price || 0), tableX1 - 20, rowY + 34);
    ctx.textAlign = 'left';

    const tableBottom = rowY + rowH;
    ctx.strokeStyle = '#E7E4DB'; ctx.lineWidth = 1;
    [tableTop, rowY, tableBottom].forEach(ly => { ctx.beginPath(); ctx.moveTo(tableX0, ly); ctx.lineTo(tableX1, ly); ctx.stroke(); });
    [tableX0, col2X, col3X, tableX1].forEach(lx => { ctx.beginPath(); ctx.moveTo(lx, tableTop); ctx.lineTo(lx, tableBottom); ctx.stroke(); });

    // ===== KOTAK RINGKASAN TOTAL (kanan, konsisten dgn Laporan Keuangan Coach) =====
    const price = c.price || 0;
    const paid = c.amountPaid || 0;
    const remaining = Math.max(0, price - paid);
    const boxW = 460, boxX = tableX1 - boxW, boxTop = tableBottom + 36;
    const boxH = pay === 'DP Sebagian' ? 158 : 96;

    ctx.fillStyle = '#FAFAF7'; ctx.strokeStyle = '#E7E4DB'; ctx.lineWidth = 1;
    roundRectPath(ctx, boxX, boxTop, boxW, boxH, 8);
    ctx.fill(); ctx.stroke();

    if (pay === 'DP Sebagian'){
      ctx.fillStyle = '#6E6C64'; ctx.font = '400 17px Arial';
      ctx.fillText('Total Tagihan', boxX + 24, boxTop + 36);
      ctx.textAlign = 'right'; ctx.fillText(formatRupiah(price), boxX + boxW - 24, boxTop + 36); ctx.textAlign = 'left';
      ctx.fillStyle = '#2563AE';
      ctx.fillText('Sudah Dibayar', boxX + 24, boxTop + 66);
      ctx.textAlign = 'right'; ctx.fillText('+' + formatRupiah(paid), boxX + boxW - 24, boxTop + 66); ctx.textAlign = 'left';
      ctx.strokeStyle = '#D62828'; ctx.beginPath(); ctx.moveTo(boxX + 24, boxTop + 84); ctx.lineTo(boxX + boxW - 24, boxTop + 84); ctx.stroke();
      ctx.fillStyle = '#111110'; ctx.font = '800 24px Arial';
      ctx.fillText('Sisa Tagihan', boxX + 24, boxTop + 124);
      ctx.textAlign = 'right'; ctx.fillText(formatRupiah(remaining), boxX + boxW - 24, boxTop + 124); ctx.textAlign = 'left';
    } else {
      // Label dibuat singkat (status "Lunas" sudah ditampilkan di badge atas) supaya tidak pernah bertabrakan dengan nominal, sepanjang apa pun angkanya
      const label = pay === 'Lunas' ? 'Total Dibayar' : 'Total Tagihan';
      ctx.fillStyle = '#111110'; ctx.font = '800 24px Arial';
      ctx.fillText(label, boxX + 24, boxTop + 58);
      ctx.textAlign = 'right'; ctx.fillText(formatRupiah(price), boxX + boxW - 24, boxTop + 58); ctx.textAlign = 'left';
    }

    // ===== CATATAN =====
    const noteTop = boxTop + boxH + 42;
    ctx.fillStyle = '#8C2020'; ctx.font = 'italic 400 16px Arial';
    noteLines.forEach((line, i) => ctx.fillText(line, marginX, noteTop + i * 22));

    // ===== FOOTER (identik dgn Laporan Keuangan Coach: garis tipis + waktu cetak + brand) =====
    const printLabel = nowPrintLabel();
    const footerY = H - 60;
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(marginX, footerY - 22); ctx.lineTo(W - marginX, footerY - 22); ctx.stroke();
    ctx.fillStyle = '#8C8A82'; ctx.font = '400 14px Arial'; ctx.textAlign = 'left';
    ctx.fillText('Dicetak otomatis oleh sistem pada ' + printLabel.tanggal + ', pukul ' + printLabel.jam, marginX, footerY);
    ctx.fillStyle = '#111110'; ctx.font = '700 14px Arial'; ctx.textAlign = 'right';
    ctx.fillText('NUMBER SIX RUNNING', W - marginX, footerY);
    ctx.textAlign = 'left';

    const link = document.createElement('a');
    link.download = 'Invoice-' + slugify(c.name) + '-' + todayISO() + '.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.93);
    link.click();
    showToast('Invoice diunduh');
  };

  // Sinkronkan pilihan coach dengan daftar coach aktual, termasuk setelah tambah/edit/hapus.
/*__N6_UNIT__*/  function renderPriceList(){
    document.getElementById('priceListBody').innerHTML = ['Online','Offline','Kerja Sama'].map(cat => {
      const items = programCatalog.filter(p => p.category === cat);
      if (!items.length) return '';
      const rows = items.map(p => {
        let pv = '', ct = p.unit || '';
        if (p.mode === 'fixed') pv = formatRupiah(p.price);
        else if (p.mode === 'configurable'){ pv = formatRupiah(p.ratePerSesi); ct = 'per sesi — pertemuan/minggu & durasi bisa diatur saat pendaftaran'; }
        else { pv = 'Nego'; ct = 'Harga disesuaikan kebutuhan kerja sama'; }
        return `<div class="price-list-item">
          <div><div class="nm">${escapeHtml(p.label)}</div><div class="ct">${escapeHtml(ct)}</div></div>
          <div class="pv">${pv}${p.mode==='configurable' ? '<small>/sesi</small>' : ''}</div>
        </div>`;
      }).join('');
      return `<h3 style="font-size:12px; color:var(--asphalt); text-transform:uppercase; letter-spacing:0.03em; margin:14px 0 4px;">${cat}</h3>${rows}`;
    }).join('');
  }

  /* ================= RENDER: TIKET ================= */
