/**
 * N6 modules - admin / harga
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderPriceList(){
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
/*__N6_UNIT__*/  let ticketFilter = 'semua';
/*__N6_UNIT__*/  let autoIssueMap = {};
