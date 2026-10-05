/* Menu: Dashboard */
(function () {
  const { ui, api, access, icons } = Haylen;

  const wave = (color) => `<svg class="stat-wave" viewBox="0 0 120 44"><path d="M0 30c15-18 30-18 45-6s30 12 45-4 20-8 30-4v28H0z" fill="${color}"/></svg>`;

  function statCard(tone, iconTone, icon, label, value, extra, note, waveColor, money) {
    return `
      <div class="stat-card ${tone}">
        <div class="stat-top"><span class="round-icon ${iconTone}">${icons[icon]}</span><span>${label}</span></div>
        <div class="stat-value ${money ? "money" : ""}">${value}</div>
        ${extra}
        <div class="stat-note">${note}</div>
        ${wave(waveColor)}
      </div>`;
  }

  function revenueChart(rt) {
    const W = 480, H = 200, left = 46, right = 30, top = 10, bottom = 160;
    const max = 60;
    const n = rt.values.length;
    const x = (i) => left + (i * (W - left - right - 10)) / (n - 1) + 5;
    const y = (v) => bottom - (v / max) * (bottom - top);
    let grid = "";
    for (let v = 0; v <= max; v += 10) {
      grid += `<line x1="${left}" x2="${W - right}" y1="${y(v)}" y2="${y(v)}" stroke="#eef0f5"/>
               <text x="${left - 8}" y="${y(v) + 3}" text-anchor="end">${v === 0 ? "0" : v + " jt"}</text>`;
    }
    const pts = rt.values.map((v, i) => `${x(i)},${y(v)}`);
    const area = `M${x(0)},${bottom} L${pts.join(" L")} L${x(n - 1)},${bottom} Z`;
    const dots = rt.values.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.6" fill="#fdb827" stroke="#fff" stroke-width="1.5"/>`).join("");
    const labels = rt.labels.map((l, i) => `<text x="${x(i)}" y="${bottom + 20}" text-anchor="middle">${l}</text>`).join("");
    return `<svg viewBox="0 0 ${W} ${H}">
      <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdb827" stop-opacity=".28"/><stop offset="1" stop-color="#fdb827" stop-opacity="0"/></linearGradient></defs>
      ${grid}<path d="${area}" fill="url(#revGrad)"/>
      <polyline points="${pts.join(" ")}" fill="none" stroke="#fdb827" stroke-width="2.4" stroke-linejoin="round"/>
      ${dots}${labels}</svg>`;
  }

  function donut(dist, total) {
    const r = 60, C = 2 * Math.PI * r;
    let acc = 0;
    const segs = dist.map((d) => {
      const len = (d.percent / 100) * C;
      const s = `<circle cx="75" cy="75" r="${r}" fill="none" stroke="${d.color}" stroke-width="22" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-acc}"/>`;
      acc += len;
      return s;
    }).join("");
    return `<div class="donut"><svg viewBox="0 0 150 150">${segs}</svg>
      <div class="donut-center"><strong>${total}</strong><span>Member</span></div></div>`;
  }

  async function render(el) {
    const d = await api.dashboard();
    const s = d.stats;
    const showMoney = access.feature("lihat_omzet_laba") !== "none";
    const showProfit = access.feature("lihat_omzet_laba") === "full";

    const cards = [
      statCard("t-yellow", "c-yellow", "users", "Total Member", s.totalMember.value, `<div>${ui.trend(s.totalMember.trend).replace("↑ ", "↑ ")}</div>`, s.totalMember.note, "#fdb827"),
      statCard("t-green", "c-green", "calendarCheck", "Kelas Aktif Hari Ini", s.kelasAktif.value, `<div>${ui.trend(s.kelasAktif.trend)}</div>`, s.kelasAktif.note, "#22c58b"),
      showMoney ? statCard("t-purple", "c-purple", "wallet", "Pendapatan Bulan Ini", ui.rupiah(s.pendapatan.value), `<div>${ui.trend(s.pendapatan.trend)}</div>`, s.pendapatan.note, "#a855f7", true) : "",
      statCard("t-orange", "c-orange", "member", "Total Coach", s.totalCoach.value, `<div>${ui.trend(s.totalCoach.trend)}</div>`, s.totalCoach.note, "#f59e0b"),
      statCard("t-blue", "c-blue", "star", "Tingkat Kehadiran Member", s.kehadiran.value + "%", `<div>${ui.trend(s.kehadiran.trend)}</div>`, s.kehadiran.note, "#3b82f6"),
    ].join("");

    const totalMember = d.distribution.reduce((a, b) => a + b.count, 0);
    const legend = d.distribution.map((x) => `
      <div class="legend-row"><i style="background:${x.color}"></i><span>${x.name}</span><b>${x.percent}%</b><b>${x.count}</b></div>`).join("");

    const maxM = Math.max(...d.popular.map((p) => p.members));
    const popular = d.popular.map((p, i) => `
      <div class="pop-item">
        <div class="rank" style="background:${p.rank}">${i + 1}</div>
        <div><div class="pop-line"><span>${p.name}</span><span>${p.members} member</span></div>
        <div class="bar"><i style="width:${Math.round((p.members / maxM) * 100)}%;background:${p.color}"></i></div></div>
      </div>`).join("");

    const acts = d.activities.map((a) => `
      <div class="act-item">
        <span class="round-icon ${a.tone}">${icons[a.icon]}</span>
        <div><div class="act-title">${a.title}</div><div class="act-sub">${a.sub}</div></div>
        <span class="act-time">${a.time}</span>
      </div>`).join("");

    const fin = d.finance;
    const finRows = fin.rows.map((r) => `
      <div class="fin-row">
        <span class="mini ${r.tone}">${icons[r.icon]}</span><span>${r.label}</span>
        <strong>${ui.rupiah(r.amount)}</strong>${ui.trend(r.trend)}
      </div>`).join("");

    const trendCard = showMoney ? `
      <div class="card">
        <div class="card-head">
          <span class="round-icon c-yellow">${icons.chart}</span>
          <div><h3>Tren Pendapatan</h3><small>Dalam 6 bulan terakhir</small></div>
          <span class="spacer"></span>
          <select class="select"><option>Pendapatan</option></select>
        </div>
        <div class="chart-box">${revenueChart(d.revenueTrend)}</div>
      </div>` : "";

    const financeCard = showMoney ? `
      <div class="card">
        <div class="card-head"><span class="round-icon c-yellow">${icons.coin}</span><div><h3>Ringkasan Keuangan</h3><small>${fin.period}</small></div></div>
        ${finRows}
        ${showProfit ? `<div class="profit"><span class="round-icon">${icons.wallet}</span>
          <div><small>Total Laba Bersih</small><strong>${ui.rupiah(fin.netProfit)}</strong></div>
          <div class="right">${ui.trend(fin.netTrend)}<br>dibanding bulan lalu</div></div>` : ""}
      </div>` : "";

    el.innerHTML = `
      <div class="stat-grid">${cards}</div>
      <div class="row-3">
        ${trendCard}
        <div class="card">
          <div class="card-head"><span class="round-icon c-yellow">${icons.star}</span><div><h3>Distribusi Member</h3><small>Berdasarkan program</small></div></div>
          <div class="donut-wrap">${donut(d.distribution, totalMember)}<div class="legend">${legend}</div></div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Quick Actions</h3></div>
          <div class="qa-grid">
            <button class="qa" data-go="member" data-act="add"><span class="round-icon c-orange">${icons.userPlus}</span>Tambah Member</button>
            <button class="qa" data-go="jadwal"><span class="round-icon c-purple">${icons.calendarCheck}</span>Atur Jadwal Kelas</button>
            <button class="qa" data-go="transaksi" data-act="add"><span class="round-icon c-green">${icons.dollar}</span>Input Transaksi</button>
            <button class="qa" data-go="laporan"><span class="round-icon c-blue">${icons.chart}</span>Lihat Laporan</button>
          </div>
        </div>
      </div>
      <div class="row-3b">
        <div class="card">
          <div class="card-head"><span class="round-icon c-yellow">${icons.star}</span><div><h3>Kelas Terpopuler</h3><small>Berdasarkan jumlah pendaftar</small></div></div>
          ${popular}
        </div>
        <div class="card">
          <div class="card-head"><span class="round-icon c-yellow">${icons.chart}</span><h3>Aktivitas Terbaru</h3><span class="spacer"></span><a href="#">Lihat Semua</a></div>
          ${acts}
        </div>
        ${financeCard}
      </div>`;

    el.querySelectorAll("[data-go]").forEach((b) => {
      b.onclick = () => {
        const target = b.dataset.go;
        if (!access.canOpen(target)) return ui.toast("Tier Anda tidak punya akses ke menu ini");
        Haylen.pendingAction = b.dataset.act || null;
        Haylen.navigate(target);
      };
    });
  }

  Haylen.pages.dashboard = { title: "Dashboard", render };
})();
