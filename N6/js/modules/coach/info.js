/**
 * N6 modules - coach / info
 * menu label : Informasi
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
  function renderHistory(){
    document.getElementById('historyList').innerHTML = historyList.map(h => `
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
/*__N6_UNIT__*/  function populateGajiFilters(){
    const bulanSet = [...new Set(gajiSesiList.map(g => g.bulan))].sort((a,b)=>a-b);
    const tahunSet = [...new Set(gajiSesiList.map(g => g.tahun))].sort((a,b)=>a-b);
    const selBulan = document.getElementById('gajiFilterBulan');
    const selTahun = document.getElementById('gajiFilterTahun');
    selBulan.innerHTML = bulanSet.map(b => `<option value="${b}">${MONTH_NAMES[b-1]}</option>`).join('');
    selTahun.innerHTML = tahunSet.map(t => `<option value="${t}">${t}</option>`).join('');
    selBulan.value = gajiFilterState.bulan;
    selTahun.value = gajiFilterState.tahun;
    selBulan.addEventListener('change', () => { gajiFilterState.bulan = Number(selBulan.value); renderGaji(); });
    selTahun.addEventListener('change', () => { gajiFilterState.tahun = Number(selTahun.value); renderGaji(); });
  }

/*__N6_UNIT__*/  function renderGaji(){
    const filtered = getGajiFiltered();
    lastFilteredGaji = filtered;
    const bonus = getBonusForPeriod();
    const totalGaji = filtered.reduce((a,g) => a + g.gajiSesi, 0);
    const totalPotongan = filtered.reduce((a,g) => a + g.potongan, 0);
    const totalDiterima = totalGaji - totalPotongan + bonus.jumlah;

    document.getElementById('gajiPeriodeLabel').textContent =
      'Rincian Gaji per Sesi — ' + MONTH_NAMES[gajiFilterState.bulan-1] + ' ' + gajiFilterState.tahun;
    document.getElementById('gajiTotalBulan').textContent = fmtIDR(totalDiterima);
    document.getElementById('gajiBonusBulan').textContent = bonus.jumlah > 0 ? '+' + fmtIDR(bonus.jumlah) : fmtIDR(0);
    document.getElementById('gajiBonusKet').textContent = bonus.ket || '';
    document.getElementById('gajiPotonganBulan').textContent = fmtIDR(totalPotongan);
    document.getElementById('gajiJumlahSesi').textContent = filtered.length + ' sesi';

    if (!filtered.length){
      document.getElementById('gajiSesiBody').innerHTML = `<tr><td colspan="3" class="muted" style="text-align:center; padding:24px 0;">Tidak ada data gaji pada periode ini.</td></tr>`;
      return;
    }

    document.getElementById('gajiSesiBody').innerHTML = filtered.map((g, i) => {
      const diterima = g.gajiSesi - g.potongan;
      return `
      <tr style="cursor:pointer;" onclick="openGajiDetail(${i})">
        <td class="strong">${g.tanggal}</td>
        <td class="muted">${g.klien}</td>
        <td class="right strong">${fmtIDR(diterima)}</td>
      </tr>`;
    }).join('');
  }

  window.openGajiDetail = function(i){
    const g = lastFilteredGaji[i];
    if (!g) return;
    const diterima = g.gajiSesi - g.potongan;
    document.getElementById('gajiDetailBody').innerHTML = `
      <div class="progress-row"><div class="progress-row-top"><span class="pname">Tanggal Melatih</span><span class="pgoal">${g.tanggal}</span></div></div>
      <div class="progress-row"><div class="progress-row-top"><span class="pname">Paket</span><span class="pgoal">${g.paket}</span></div></div>
      <div class="progress-row"><div class="progress-row-top"><span class="pname">Klien Hadir</span><span class="pgoal">${g.klien}</span></div></div>
      <div class="progress-row"><div class="progress-row-top"><span class="pname">Gaji Sesi</span><span class="pgoal">${fmtIDR(g.gajiSesi)}</span></div></div>
      <div class="progress-row"><div class="progress-row-top"><span class="pname">Potongan</span><span class="pgoal" style="${g.potongan>0?'color:var(--red);':''}">${g.potongan>0 ? '-'+fmtIDR(g.potongan) : '-'}</span></div></div>
      <div class="progress-row"><div class="progress-row-top"><span class="pname">Diterima</span><span class="pgoal" style="font-weight:800; color:var(--ink);">${fmtIDR(diterima)}</span></div></div>
      ${g.ket ? `<div class="rapor-note" style="margin-top:12px;"><b>Catatan:</b> ${g.ket}</div>` : ''}
    `;
    document.getElementById('gajiDetailModal').classList.add('show');
  };
  window.closeGajiDetail = function(){
    document.getElementById('gajiDetailModal').classList.remove('show');
  };

  /* ================= PDF: HEADER & FOOTER BERSAMA (branding konsisten) ================= */
  // Header hitam + garis aksen merah di bawahnya, dipakai di semua PDF (Rapor & Slip Gaji)
/*__N6_UNIT__*/  function renderCoachRapor(){
    document.getElementById('coachRaporList').innerHTML = coachRaporList.map(r => `
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
/*__N6_UNIT__*/  function showToast(msg){
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  window.showToast = showToast;

  /* ================= SLIP GAJI BUTTON ================= */
  document.getElementById('downloadSlipBtn').addEventListener('click', downloadSlipGaji);

  /* ================= INIT ================= */
  renderSchedule();
  renderUpcoming();
  renderCharts();
  renderClients();
  renderProgress();
  renderRaporSelect();
  renderHistory();
  populateGajiFilters();
  renderGaji();
  renderCoachRapor();
  renderReschedule();
  renderCuti();
  renderCoachAttendance();
  renderUnavailableList();
  renderCalendar();
  renderLogs();
