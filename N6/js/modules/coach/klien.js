/**
 * N6 modules - coach / klien
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderClients(){
    const el = document.getElementById('clientList');
    const head = document.querySelector('#klien-daftar .card-head h3');
    if (head) head.textContent = 'Klien (' + clients.length + ')';
    if (!clients.length){
      el.innerHTML = '<div class="cal-empty">Belum ada data</div>';
      return;
    }
    el.innerHTML = clients.map(c => `
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
    const el = document.getElementById('progressList');
    if (!clientProgress.length){
      el.innerHTML = '<div class="cal-empty">Belum ada data</div>';
      return;
    }
    el.innerHTML = clientProgress.map(p => `
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
/*__N6_UNIT__*/  window.openClientDetail = function(name){
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
/*__N6_UNIT__*/  window.closeClientDetail = function(){
    document.getElementById('clientDetailModal').classList.remove('show');
  };

  /* ================= RENDER: RAPOR KLIEN ================= */
/*__N6_UNIT__*/  function renderRaporSelect(){
    const sel = document.getElementById('raporClientSelect');
    if (!clients.length){
      sel.innerHTML = '<option value="">Belum ada klien</option>';
      document.getElementById('raporStats').innerHTML = '<div class="cal-empty">Belum ada data</div>';
      document.getElementById('raporNote').innerHTML = '';
      return;
    }
    sel.innerHTML = clients.map(c => `<option value="${c.id != null ? c.id : ''}">${c.name}</option>`).join('');
    sel.onchange = () => loadAndRenderRapor(sel.value);
    loadAndRenderRapor(clients[0].id);
  }
/*__N6_UNIT__*/  async function loadAndRenderRapor(clientId){
    raporCurrentId = clientId;
    const statsEl = document.getElementById('raporStats');
    const noteEl = document.getElementById('raporNote');
    if (clientId == null || clientId === ''){
      statsEl.innerHTML = '<div class="cal-empty">Belum ada data</div>';
      noteEl.innerHTML = '';
      return;
    }
    if (Object.prototype.hasOwnProperty.call(raporCache, clientId)){
      renderRaporDetail(raporCache[clientId]);
      return;
    }
    statsEl.innerHTML = '<div class="cal-empty">Memuat data...</div>';
    noteEl.innerHTML = '';
    let data = null;
    try {
      const res = await n6Api('dashboards/clients/' + encodeURIComponent(clientId) + '/progress');
      data = normalizeRapor(res);
    } catch(e){
      // Endpoint belum ada (404) atau gagal → empty state, bukan dummy
      console.warn('[coach] rapor', e);
      data = null;
    }
    // Abaikan hasil basi bila user sudah pindah klien saat fetch berjalan
    if (raporCurrentId !== clientId) return;
    raporCache[clientId] = data;
    renderRaporDetail(data);
  }
/*__N6_UNIT__*/  function renderRaporDetail(r){
    if (!r){
      document.getElementById('raporStats').innerHTML = '<div class="cal-empty">Belum ada data</div>';
      document.getElementById('raporNote').innerHTML = '';
      return;
    }
    document.getElementById('raporStats').innerHTML = `
      <div class="rapor-stat"><div class="l">Total Sesi</div><div class="v">${r.sesi}</div></div>
      <div class="rapor-stat"><div class="l">Total Jarak</div><div class="v">${r.totalJarak}</div></div>
      <div class="rapor-stat"><div class="l">Rata-rata Pace</div><div class="v">${r.avgPace}</div></div>
      <div class="rapor-stat"><div class="l">Kehadiran</div><div class="v">${r.kehadiran}</div></div>
    `;
    document.getElementById('raporNote').innerHTML = `<b>Catatan Coach:</b> ${r.catatan}`;
  }

  /* ================= RENDER: HISTORY ================= */
/*__N6_UNIT__*/  function renderHistory(){
    const el = document.getElementById('historyList');
    if (!historyList.length){
      el.innerHTML = '<div class="cal-empty">Belum ada data</div>';
      return;
    }
    el.innerHTML = historyList.map(h => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-body">
          <div class="act">${h.activity}</div>
          <div class="date">${h.date} · ${h.type}</div>
        </div>
      </div>
    `).join('');
  }

  /* ================= RENDER: GAJI ================= */
/*__N6_UNIT__*/  const MONTH_NAMES = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
/*__N6_UNIT__*/  let gajiFilterState = { bulan: 9, tahun: 2026 };

/*__N6_UNIT__*/  function populateGajiFilters(){
    const now = new Date();
    const years = [now.getFullYear(), now.getFullYear() - 1];
    const selBulan = document.getElementById('gajiFilterBulan');
    const selTahun = document.getElementById('gajiFilterTahun');
    selBulan.innerHTML = MONTH_NAMES.map((m, i) => `<option value="${i+1}">${m}</option>`).join('');
    selTahun.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
    gajiFilterState = { bulan: now.getMonth() + 1, tahun: now.getFullYear() };
    selBulan.value = gajiFilterState.bulan;
    selTahun.value = gajiFilterState.tahun;
    selBulan.onchange = () => { gajiFilterState.bulan = Number(selBulan.value); refreshGaji(); };
    selTahun.onchange = () => { gajiFilterState.tahun = Number(selTahun.value); refreshGaji(); };
  }

