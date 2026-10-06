/**
 * N6 modules - client / profil
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function showFatalError(msg){
    document.getElementById('root').innerHTML =
      '<div class="invalid-state"><h2>Terjadi kendala</h2><p>' + msg + '</p></div>';
  }

  /* ================= INFO PROGRAM (PB & TANGGAL) ================= */
/*__N6_UNIT__*/  function formatDateID(dateStr){
    if (!dateStr) return '';
    const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const [y,m,d] = dateStr.split('-');
    return parseInt(d,10) + ' ' + bulan[parseInt(m,10)-1] + ' ' + y;
  }

/*__N6_UNIT__*/  function pbValueHtml(val, isDate){
    if (!val) return '<div class="value empty">Belum diisi</div>';
    return '<div class="value">' + (isDate ? formatDateID(val) : escapeHtml(val)) + '</div>';
  }

/*__N6_UNIT__*/  function renderPbGrid(){
    const grid = document.getElementById('pbGrid');
    if (!grid) return;
    grid.innerHTML =
      '<div class="pb-item"><div class="label">PB Awal</div>' + pbValueHtml(programInfo.pbStart, false) + '</div>' +
      '<div class="pb-item"><div class="label">PB Akhir</div>' + pbValueHtml(programInfo.pbEnd, false) + '</div>' +
      '<div class="pb-item"><div class="label">Tanggal Mulai</div>' + pbValueHtml(programInfo.startDate, true) + '</div>' +
      '<div class="pb-item"><div class="label">Tanggal Selesai</div>' + pbValueHtml(programInfo.endDate, true) + '</div>';
  }

  /* ================= UNDUH RINGKASAN (JPG) ================= */
/*__N6_UNIT__*/  function downloadPdf(){
    const btn = document.getElementById('downloadPdfBtn');
    const originalLabel = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Menyiapkan gambar...';

    const dates = Object.keys(scores).sort();
    const scoreVals = dates.map(d => scores[d].score);
    const avg = scoreVals.length ? Math.round(scoreVals.reduce((a,b)=>a+b,0)/scoreVals.length) : '-';
    const best = scoreVals.length ? Math.max(...scoreVals) : '-';
    const totalReports = Object.keys(reports).length;

    // Bagi riwayat ke beberapa kolom & tentukan kepadatan font supaya ~30 hari tetap pas 1 lembar A3
    const totalEntries = dates.length;
    const columns = totalEntries <= 13 ? 1 : (totalEntries <= 32 ? 2 : 3);
    const rowsPerCol = Math.max(1, Math.ceil((totalEntries || 1) / columns));
    const densClass = rowsPerCol <= 8 ? 'dens-lg' : (rowsPerCol <= 15 ? 'dens-md' : (rowsPerCol <= 20 ? 'dens-sm' : 'dens-xs'));

    function formatDateShortID(dateStr){
      const bulan = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
      const [y,m,d] = dateStr.split('-');
      return parseInt(d,10) + ' ' + bulan[parseInt(m,10)-1];
    }

    function buildRow(d){
      const s = scores[d];
      return '<div class="sum-hist-row"><span class="d">' + formatDateShortID(d) + '</span>' +
        '<span class="s"><span class="score-pill">' + s.score + '</span></span>' +
        '<span class="n">' + escapeHtml(s.note || 'Tidak ada catatan') + '</span></div>';
    }

    let historyColsHtml = '';
    if (totalEntries === 0){
      historyColsHtml =
        '<div class="sum-history-col ' + densClass + '">' +
          '<div class="sum-history-col-head"><span class="d">Tanggal</span><span class="s">Skor</span><span class="n">Catatan Coach</span></div>' +
          '<div class="sum-history-rows"><div class="sum-hist-row empty">Belum ada skor tercatat.</div></div>' +
        '</div>';
    } else {
      for (let c = 0; c < columns; c++){
        const slice = dates.slice(c * rowsPerCol, (c + 1) * rowsPerCol);
        if (!slice.length) continue;
        historyColsHtml +=
          '<div class="sum-history-col ' + densClass + '">' +
            '<div class="sum-history-col-head"><span class="d">Tanggal</span><span class="s">Skor</span><span class="n">Catatan Coach</span></div>' +
            '<div class="sum-history-rows">' + slice.map(buildRow).join('') + '</div>' +
          '</div>';
      }
    }

    document.getElementById('printArea').innerHTML =
      '<div class="sum-header">' +
        '<img src="' + LOGO_B64 + '" alt="N6">' +
        '<div class="sum-titles">' +
          '<h1>Ringkasan Performa Latihan</h1>' +
          '<div class="sum-tagline">N6 Running Training</div>' +
        '</div>' +
        '<div class="sum-meta">' +
          '<div class="client">' + escapeHtml(clientName) + '</div>' +
          '<div>Dicetak ' + formatDateID(todayISO()) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="sum-body">' +
        '<div class="sum-section-title">Info Program</div>' +
        '<div class="sum-pb-grid">' +
          '<div class="sum-pb-item"><div class="label">PB Awal</div><div class="value">' + escapeHtml(programInfo.pbStart || '-') + '</div></div>' +
          '<div class="sum-pb-item"><div class="label">PB Akhir</div><div class="value">' + escapeHtml(programInfo.pbEnd || '-') + '</div></div>' +
          '<div class="sum-pb-item"><div class="label">Tanggal Mulai</div><div class="value">' + (formatDateID(programInfo.startDate) || '-') + '</div></div>' +
          '<div class="sum-pb-item"><div class="label">Tanggal Selesai</div><div class="value">' + (formatDateID(programInfo.endDate) || '-') + '</div></div>' +
        '</div>' +
        '<div class="sum-section-title">Ringkasan Skor</div>' +
        '<div class="sum-stats">' +
          '<div class="sum-stat"><div class="num">' + avg + '</div><div class="lbl">Rata-rata Skor</div></div>' +
          '<div class="sum-stat"><div class="num">' + best + '</div><div class="lbl">Skor Terbaik</div></div>' +
          '<div class="sum-stat"><div class="num">' + totalReports + '</div><div class="lbl">Total Laporan</div></div>' +
        '</div>' +
        '<div class="sum-section-title">Riwayat Skor per Tanggal (' + totalEntries + ' entri)</div>' +
        '<div class="sum-history-wrap">' + historyColsHtml + '</div>' +
        '<div class="sum-footer"><span class="brand">N6 RUNNING TRAINING</span><span>Dokumen ini dibuat otomatis dari dashboard client — Kertas A3 Potrait.</span></div>' +
      '</div>';

    const el = document.getElementById('printArea');
    html2canvas(el, { backgroundColor: '#FFFFFF', scale: 2, useCORS: true }).then(function(canvas){
      const jpgUrl = canvas.toDataURL('image/jpeg', 0.95);
      const a = document.createElement('a');
      a.href = jpgUrl;
      const safeName = (clientName || 'client').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      a.download = 'ringkasan-n6-' + (safeName || 'client') + '-' + todayISO() + '.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      btn.disabled = false;
      btn.innerHTML = originalLabel;
    }).catch(function(err){
      btn.disabled = false;
      btn.innerHTML = originalLabel;
      alert('Gagal membuat gambar ringkasan. Coba lagi. (' + (err && err.message ? err.message : 'error') + ')');
    });
  }

  (async function init(){
    try{
      if (clientId){
        let found = null;
        try {
          const cfg = window.N6_API || {};
          const userKey = cfg.userKey || 'n6:api:user';
          const meRaw = localStorage.getItem(userKey);
          if (meRaw) {
            const me = JSON.parse(meRaw);
            if (me && me.client_id != null && String(me.client_id) === String(clientId)) {
              found = { id: me.client_id, name: me.full_name || me.username || 'Client' };
            }
          }
        } catch(e){ if(window.logger) window.logger.caught('client/profil', 'operasi', e); }
        if (!found) {
          const clientsRaw = await storeGet('clients');
          let clients = [];
          try{ clients = clientsRaw ? JSON.parse(clientsRaw) : []; }catch(e){ clients = []; }
          if (clients && !Array.isArray(clients) && Array.isArray(clients.items)) {
            clients = clients.items;
          }
          found = clients.find(c => String(c.id) === String(clientId));
        }
        if (found){
          clientName = found.name;
          const rRaw = await storeGet('reports:' + clientId);
          const sRaw = await storeGet('scores:' + clientId);
          const cRaw = await storeGet('chat:' + clientId);
          const pRaw = await storeGet('program:' + clientId);
          try{ reports = rRaw ? JSON.parse(rRaw) : {}; }catch(e){ reports = {}; }
          try{ scores = sRaw ? JSON.parse(sRaw) : {}; }catch(e){ scores = {}; }
          try{ chatMessages = cRaw ? JSON.parse(cRaw) : []; }catch(e){ chatMessages = []; }
          try{ programInfo = pRaw ? JSON.parse(pRaw) : programInfo; }catch(e){ if(window.logger) window.logger.caught('client/profil', 'operasi', e); }
        } else {
          renderInvalid();
          return;
        }
      } else {
        renderInvalid();
        return;
      }

      renderShell();
      renderReportList();
      renderChart();
      renderCalendar();
      renderChatThread();
    }catch(e){
      showFatalError('Halaman gagal dimuat (' + (e && e.message ? e.message : 'unknown error') + '). Coba muat ulang.');
    }
  