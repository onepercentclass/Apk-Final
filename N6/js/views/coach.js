/**
 * N6 view - coach
 *
 * The markup that used to sit inside <body> in coach.html, kept byte for byte.
 * Nothing was renamed, reordered or removed. The tier gate in js/core/access.js
 * works purely off the data-panel / data-client-tab attributes that already exist
 * on the navigation elements.
 *
 * Original <body> tag: <body data-theme="dark">
 */

export const BODY_ATTR = '<body data-theme="dark">';

export const VIEW_COACH = `
<div class="app">
<div class="sidebar-overlay" id="sidebarOverlay"></div>
<!-- SIDEBAR -->
<aside class="sidebar" id="sidebar">
<div class="side-brand">
<div class="mark n6-real-logo"><img alt="Logo N6 NUMBER SIX" src="assets/img/logo-manual-program.png"/></div>
<div class="txt"><b>NUMBER SIX</b><span>Coach</span></div>
<button aria-label="Tutup menu" class="sidebar-close" id="sidebarClose">
<svg fill="none" height="18" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="18"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<nav class="side-nav" id="sideNav">
<button class="active" data-panel="home">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M3 12l9-9 9 9"></path><path d="M5 10v10h14V10"></path></svg>
        Beranda
      </button>
<button data-panel="klien">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Klien
      </button>
<button data-panel="info">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
        Informasi
      </button>
<button data-panel="jadwal">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><rect height="18" rx="2" width="18" x="3" y="4"></rect><path d="M16 2v4M8 2v4M3 10h18"></path><path d="M9 16l2 2 4-4"></path></svg>
        Absensi
      </button>
<div style="border-top:1px solid rgba(255,255,255,0.08);margin:8px 0 4px"></div>
<button data-panel="sandi">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
<span>Ganti Password</span>
</button>
</nav>
<div class="side-foot">
<b id="coachSideFootName">Coach</b>
      <span id="coachSideFootRole">N6 Running Training</span>
    </div>
</aside>
<!-- MAIN -->
<div class="main">
<header class="topbar">
<div style="display:flex; align-items:center; gap:12px;">
<button aria-label="Buka menu" class="hamburger" id="hamburgerBtn">
<svg fill="none" height="20" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="20"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>
</button>
<div>
<div class="crumb">Dashboard</div>
<div class="title" id="pageTitle">Beranda</div>
</div>
</div>
<div class="topbar-right">
<div class="search">
<svg fill="none" height="15" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="15"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
<input placeholder="Cari klien..."/>
</div>
<div class="bell">
<svg fill="none" height="18" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="18"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
</div>
<div class="coach-account-wrap" id="coachAccountWrap"><button aria-controls="coachAccountMenu" aria-expanded="false" aria-label="Buka menu akun" class="coach-account-trigger" id="coachAccountBtn" type="button"><svg aria-hidden="true" fill="none" height="21" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 24 24" width="21"><circle cx="12" cy="8" r="4"></circle><path d="M4 21v-2a8 8 0 0 1 16 0v2"></path></svg></button><div class="coach-account-menu" hidden="" id="coachAccountMenu"><div class="coach-account-profile"><div class="coach-account-avatar" id="coachMenuAvatar">--</div><div><strong id="coachMenuName">Coach</strong><small id="coachMenuRole">N6 Running Training</small></div></div><div class="coach-account-divider"></div><div class="coach-account-label">Tampilan dashboard</div><div class="coach-account-theme"><button id="coachThemeDark" type="button">☾ Dark</button><button id="coachThemeLight" type="button">☀ Light</button></div><div class="coach-account-divider"></div><button class="coach-account-logout" id="coachLogoutBtn" type="button">⏻ Keluar</button></div></div></div>
</header>
<main class="content">
<div class="content-inner">
<!-- ===================== PANEL: HOME ===================== -->
<section class="panel active" id="panel-home">
<div class="stat-grid">
<div class="stat-card">
<div class="label">Klien Aktif</div>
<div class="value" id="statKlienAktif">—</div>
<div class="sub" id="statKlienAktifSub">—</div>
</div>
<div class="stat-card">
<div class="label">Sesi Hari Ini</div>
<div class="value red" id="statSesiHariIni">—</div>
<div class="sub" id="statSesiHariIniSub">—</div>
</div>
<div class="stat-card">
<div class="label">Kehadiran Bulan Ini</div>
<div class="value green" id="statKehadiran">—</div>
<div class="sub" id="statKehadiranSub">Dari total sesi terjadwal</div>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Pencapaian &amp; Performa Klien</h3></div>
<div class="card-body">
<div class="chart-grid">
<div class="chart-card clickable" onclick="openChartModal('pencapaian','Klien Capai Target per Bulan')">
<span class="chart-expand-icon"><svg fill="none" height="15" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="15"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg></span>
<h4>Klien Capai Target per Bulan</h4>
<div class="chart-sub">Jumlah klien yang mencapai target latihannya</div>
<div class="chart-wrap"><canvas id="chartPencapaian"></canvas></div>
</div>
<div class="chart-card clickable" onclick="openChartModal('performa','Tren Performa Klien')">
<span class="chart-expand-icon"><svg fill="none" height="15" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="15"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg></span>
<h4>Tren Performa Klien</h4>
<div class="chart-sub">Rata-rata peningkatan performa (%) klien binaan</div>
<div class="chart-wrap"><canvas id="chartPerforma"></canvas></div>
</div>
<div class="chart-card clickable" onclick="openChartModal('statusKlien','Status Klien: Bermasalah &amp; Cedera')">
<span class="chart-expand-icon"><svg fill="none" height="15" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="15"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg></span>
<h4>Status Klien: Bermasalah &amp; Cedera</h4>
<div class="chart-sub">Distribusi kondisi klien binaan saat ini</div>
<div class="chart-wrap"><canvas id="chartStatusKlien"></canvas></div>
</div>
<div class="chart-card clickable" onclick="openChartModal('profesional','Tingkat Profesional Coach')">
<span class="chart-expand-icon"><svg fill="none" height="15" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="15"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"></path></svg></span>
<h4>Tingkat Profesional Coach</h4>
<div class="chart-sub">Penilaian Head Coach atas 5 aspek utama</div>
<div class="chart-wrap"><canvas id="chartProfesional"></canvas></div>
</div>
<div class="chart-card span-2">
<h4>Score &amp; Rating Coach</h4>
<div class="chart-sub">Skor performa keseluruhan dan rating dari klien</div>
<div class="score-row">
<div class="score-box">
<div class="lbl">Score Coach</div>
<div class="big">87<span style="font-size:15px; color:var(--asphalt);">/100</span></div>
<div class="progress-track" style="margin-top:8px;"><div class="progress-fill" style="width:87%;"></div></div>
</div>
<div class="score-box">
<div class="lbl">Rating dari Klien</div>
<div class="big" style="color:var(--ink);">4.8<span style="font-size:15px; color:var(--asphalt);">/5.0</span></div>
<div class="stars" id="coachStars"></div>
</div>
<div class="score-box" style="flex:2; min-width:220px;">
<div class="lbl">Tren Rating 6 Bulan Terakhir</div>
<div class="chart-wrap" style="height:100px;"><canvas id="chartRatingTren"></canvas></div>
</div>
</div>
</div>
</div>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Jadwal Hari Ini</h3></div>
<div class="card-body">
<table>
<thead>
<tr><th>Jam</th><th>Klien</th><th>Lokasi</th><th>Status</th><th style="text-align:right;">Absensi</th></tr>
</thead>
<tbody id="scheduleBodyHome"></tbody>
</table>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Jadwal Pertemuan Terdekat</h3></div>
<div class="card-body">
<table>
<thead>
<tr><th>Tanggal</th><th>Jam</th><th>Klien</th><th style="text-align:right;">Lokasi</th></tr>
</thead>
<tbody id="upcomingBody"></tbody>
</table>
</div>
</div>
</section>
<!-- ===================== PANEL: KLIEN SAYA ===================== -->
<section class="panel" id="panel-klien">
<div class="subtabs" data-group="klien">
<button class="subtab-btn active" data-sub="daftar">Daftar Klien</button>
<button class="subtab-btn" data-sub="progress">Progress</button>
<button class="subtab-btn" data-sub="rapor">Rapor</button>
<button class="subtab-btn" data-sub="log">Log Latihan</button>
</div>
<div class="subpanel active" id="klien-daftar">
<div class="card">
<div class="card-head"><h3>Klien (5)</h3></div>
<div class="card-body" id="clientList"></div>
</div>
</div>
<div class="subpanel" id="klien-progress">
<div class="card">
<div class="card-head"><h3>Progress Klien Menuju Target</h3></div>
<div class="card-body" id="progressList"></div>
</div>
</div>
<div class="subpanel" id="klien-rapor">
<div class="card">
<div class="card-head"><h3>Rapor Klien</h3></div>
<div class="card-body">
<div class="form-grid" style="margin-bottom:18px;">
<select class="full" id="raporClientSelect"></select>
</div>
<div class="rapor-grid" id="raporStats"></div>
<div class="rapor-note" id="raporNote"></div>
<button class="btn-outline" id="downloadRaporBtn">Unduh Rapor (PDF)</button>
</div>
</div>
</div>
<div class="subpanel" id="klien-log">
<div class="card">
<div class="card-head"><h3>Input Log Latihan Baru</h3></div>
<div class="card-body">
<form id="logForm">
<div class="form-grid">
<select id="logClient" required="">
<option value="">Pilih klien</option>
</select>
<select id="logLokasi" required="">
<option value="">Pilih lokasi latihan</option>
<option>GBK Senayan</option>
<option>Online</option>
<option>Lapangan Dekat Rumah Klien</option>
</select>
<input id="logJarak" placeholder="Jarak (km)" required="" type="text"/>
<input id="logPace" placeholder="Pace (menit/km)" required="" type="text"/>
<input class="full" id="logCatatan" placeholder="Catatan singkat" type="text"/>
</div>
<button class="btn-primary" type="submit">Simpan Log</button>
</form>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Riwayat Log Terbaru</h3></div>
<div class="card-body" id="logList"></div>
</div>
</div>
</section>
<!-- ===================== PANEL: INFO ===================== -->
<section class="panel" id="panel-info">
<div class="subtabs" data-group="info">
<button class="subtab-btn active" data-sub="gaji">Gaji</button>
<button class="subtab-btn" data-sub="history">History</button>
<button class="subtab-btn" data-sub="rapor">Rapor</button>
</div>
<div class="subpanel" id="info-history">
<div class="card">
<div class="card-head"><h3>Riwayat Aktivitas</h3></div>
<div class="card-body" id="historyList"></div>
</div>
</div>
<div class="subpanel active" id="info-gaji">
<div class="sensitive-note">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><rect height="10" rx="2" width="18" x="3" y="11"></rect><path d="M7 11V8a5 5 0 0 1 10 0v3"></path></svg>
              Data gaji bersifat rahasia — hanya Anda dan Admin/Owner yang dapat melihat rincian ini.
            </div>
<div class="filter-bar">
<span class="filter-label">Filter Periode:</span>
<select id="gajiFilterBulan"></select>
<select id="gajiFilterTahun"></select>
</div>
<div class="stat-grid cols-4">
<div class="stat-card">
<div class="label">Diterima Bulan Ini</div>
<div class="value green" id="gajiTotalBulan">-</div>
</div>
<div class="stat-card">
<div class="label">Bonus</div>
<div class="value" id="gajiBonusBulan" style="color:var(--blue);">-</div>
<div class="sub" id="gajiBonusKet"></div>
</div>
<div class="stat-card">
<div class="label">Total Potongan Bulan Ini</div>
<div class="value red" id="gajiPotonganBulan">-</div>
</div>
<div class="stat-card">
<div class="label">Jumlah Sesi Bulan Ini</div>
<div class="value" id="gajiJumlahSesi">-</div>
</div>
</div>
<div class="card">
<div class="card-head">
<h3 id="gajiPeriodeLabel">Rincian Gaji per Sesi</h3>
<button class="btn-outline" id="downloadSlipBtn" style="margin-top:0;">Cetak / Unduh Slip Gaji (PDF)</button>
</div>
<div class="card-body">
<table>
<thead>
<tr>
<th>Tanggal</th><th>Klien Hadir</th><th style="text-align:right;">Diterima</th>
</tr>
</thead>
<tbody id="gajiSesiBody"></tbody>
</table>
<div class="cal-empty" style="margin-top:10px;">Ketuk salah satu baris untuk melihat rincian lengkap.</div>
</div>
</div>
</div>
<div class="subpanel" id="info-rapor">
<div class="card">
<div class="card-head"><h3>Rapor Evaluasi dari Head Coach</h3></div>
<div class="card-body" id="coachRaporList"></div>
</div>
</div>
</section>
<!-- ===================== PANEL: JADWAL & ABSENSI ===================== -->
<section class="panel" id="panel-jadwal">
<div class="subtabs" data-group="jadwal">
<button class="subtab-btn" data-sub="absensicoach">Absensi Coach</button>
<button class="subtab-btn" data-sub="jadwalcoach">Jadwal Coach</button>
<button class="subtab-btn active" data-sub="absensi">Absensi</button>
<button class="subtab-btn" data-sub="reschedule">Reschedule</button>
<button class="subtab-btn" data-sub="cuti">Cuti Coach</button>
</div>
<div class="subpanel" id="jadwal-reschedule">
<div class="card">
<div class="card-head"><h3>Ajukan Reschedule Sesi</h3></div>
<div class="card-body">
<form id="rescheduleForm">
<div class="form-grid">
<select id="rsSesi" required="">
<option value="">Pilih sesi terjadwal</option>
</select>
<input id="rsTanggal" required="" type="date"/>
<input id="rsJam" placeholder="Jam baru (contoh: 17:00)" required="" type="text"/>
<input class="full" id="rsAlasan" placeholder="Alasan reschedule" type="text"/>
</div>
<button class="btn-primary" type="submit">Ajukan Reschedule</button>
</form>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Riwayat Pengajuan</h3></div>
<div class="card-body">
<table>
<thead><tr><th>Sesi Awal</th><th>Jadwal Baru</th><th>Alasan</th><th style="text-align:right;">Status</th></tr></thead>
<tbody id="rescheduleBody"></tbody>
</table>
</div>
</div>
</div>
<div class="subpanel" id="jadwal-cuti">
<div class="card">
<div class="card-head"><h3>Ajukan Cuti</h3></div>
<div class="card-body">
<form id="cutiForm">
<div class="form-grid">
<input id="cutiMulai" required="" type="date"/>
<input id="cutiSelesai" required="" type="date"/>
<input class="full" id="cutiAlasan" placeholder="Alasan cuti" type="text"/>
</div>
<button class="btn-primary" type="submit">Ajukan Cuti</button>
</form>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Riwayat Cuti</h3></div>
<div class="card-body">
<table>
<thead><tr><th>Mulai</th><th>Selesai</th><th>Alasan</th><th style="text-align:right;">Status</th></tr></thead>
<tbody id="cutiBody"></tbody>
</table>
</div>
</div>
</div>
<div class="subpanel" id="jadwal-jadwalcoach">
<div class="card">
<div class="card-head"><h3>Tandai Waktu Tidak Bisa Mengajar</h3></div>
<div class="card-body">
<div class="sync-note" style="background:var(--amber-tint); color:var(--amber);">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><path d="M12 9v4M12 17h.01"></path><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
                  Tandai tanggal &amp; jam Anda berhalangan mengajar. Tanda ini akan otomatis muncul di kalender agar Admin tahu jadwal Anda tidak tersedia saat mengatur sesi klien baru.
                </div>
<form id="unavailableForm">
<div class="form-grid">
<input id="uaTanggal" required="" type="date"/>
<label style="display:flex; align-items:center; gap:8px; font-size:13.5px; color:var(--ink); border:1px solid var(--line); border-radius:6px; padding:10px 12px;">
<input id="uaSepanjangHari" style="width:auto; accent-color:var(--red);" type="checkbox"/> Sepanjang hari (tidak bisa mengajar penuh)
                    </label>
<input id="uaJamMulai" placeholder="Jam mulai (contoh: 14:00)" type="text"/>
<input id="uaJamSelesai" placeholder="Jam selesai (contoh: 18:00)" type="text"/>
<input class="full" id="uaAlasan" placeholder="Alasan (opsional, contoh: acara keluarga)" type="text"/>
</div>
<button class="btn-primary" type="submit">Tandai Tidak Tersedia</button>
</form>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Daftar Waktu Tidak Tersedia</h3></div>
<div class="card-body" id="unavailableBody"></div>
</div>
<div class="card">
<div class="card-head"><h3>Kalender Jadwal — 30 Hari ke Depan</h3></div>
<div class="card-body">
<div class="cal-header">
<div class="range" id="calRange">-</div>
<div class="cal-legend">
<span class="cal-legend-item"><span class="dot" style="background:var(--red);"></span>Ada sesi latihan</span>
<span class="cal-legend-item"><span class="dot" style="background:var(--amber);"></span>Coach tidak bisa mengajar</span>
</div>
</div>
<div class="cal-grid" id="calGrid"></div>
<div class="cal-detail" id="calDetail"></div>
</div>
</div>
</div>
<div class="subpanel active" id="jadwal-absensi">
<div class="card">
<div class="card-head"><h3>Absensi Sesi Hari Ini</h3></div>
<div class="card-body">
<table>
<thead>
<tr><th>Jam</th><th>Klien</th><th>Lokasi</th><th>Status</th><th style="text-align:right;">Absensi</th></tr>
</thead>
<tbody id="scheduleBodyAbsensi"></tbody>
</table>
</div>
</div>
</div>
<div class="subpanel" id="jadwal-absensicoach">
<div class="sync-note">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><path d="M21 12a9 9 0 1 1-2.64-6.36"></path><path d="M21 3v6h-6"></path></svg>
              Absensi yang Anda kirim di sini akan otomatis masuk ke Dashboard Admin, lalu direview dan diberi skor performa oleh Admin/Head Coach.
            </div>
<div class="periode-box">
<div class="seg">
<div class="l">Periode Kontrak Mulai</div>
<div class="v" id="periodeMulai">-</div>
</div>
<div class="arrow">→</div>
<div class="seg">
<div class="l">Periode Kontrak Selesai</div>
<div class="v" id="periodeSelesai">-</div>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Input Absensi Sesi</h3></div>
<div class="card-body">
<form id="coachAttendanceForm">
<div class="form-grid">
<select id="acSesi" required="">
<option value="">Pilih sesi hari ini</option>
<option>06:00 — Budi Hartono</option>
<option>07:00 — Andi Prasetyo</option>
<option>16:00 — Rina Marlina</option>
<option>18:00 — Yoga Pratama</option>
</select>
<select id="acStatus" required="">
<option value="">Pilih status kehadiran</option>
<option>Tepat Waktu</option>
<option>Terlambat</option>
<option>Latihan Sedang Berjalan</option>
</select>
<input class="full" id="acCatatan" placeholder="Catatan (opsional, contoh: alasan terlambat)" type="text"/>
</div>
<button class="btn-primary" type="submit">Kirim Absensi ke Admin</button>
</form>
</div>
</div>
<div class="stat-grid">
<div class="stat-card">
<div class="label">Tepat Waktu</div>
<div class="value green" id="absensiCountHadir">-</div>
</div>
<div class="stat-card">
<div class="label">Terlambat</div>
<div class="value" id="absensiCountTerlambat" style="color:var(--amber);">-</div>
</div>
<div class="stat-card">
<div class="label">Latihan Sedang Berjalan</div>
<div class="value" id="absensiCountIzin" style="color:var(--blue);">-</div>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Riwayat Absensi &amp; Feedback Admin</h3></div>
<div class="card-body" id="coachAttendanceBody"></div>
</div>
</div>
</section>
<section class="panel" id="panel-sandi">
<div id="n6SandiRoot"></div>
</section>
<!-- ===================== PANEL: AKUN USER ===================== -->
</div>
</main>
</div>
<nav class="bottom-nav" id="bottomNav">
<button class="active" data-panel="home">
<svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M3 12l9-9 9 9"></path><path d="M5 10v10h14V10"></path></svg>
<span>Home</span>
</button>
<button data-panel="klien">
<svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
<span>Klien</span>
</button>
<button data-panel="info">
<svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
<span>Informasi</span>
</button>
<button data-panel="jadwal">
<svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><rect height="18" rx="2" width="18" x="3" y="4"></rect><path d="M16 2v4M8 2v4M3 10h18"></path><path d="M9 16l2 2 4-4"></path></svg>
<span>Absensi</span>
</button>
</nav>
</div>
<div class="toast" id="toast">Tersimpan</div>
<div class="modal-overlay" id="clientDetailModal" onclick="if(event.target===this) closeClientDetail()">
<div class="modal-box">
<div class="modal-head">
<h3 id="clientDetailTitle">Riwayat Latihan</h3>
<button class="modal-close" onclick="closeClientDetail()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body" id="clientDetailBody"></div>
</div>
</div>
<div class="modal-overlay" id="chartModal" onclick="if(event.target===this) closeChartModal()">
<div class="modal-box" style="max-width:600px;">
<div class="modal-head">
<h3 id="chartModalTitle">Grafik</h3>
<button class="modal-close" onclick="closeChartModal()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<div class="chart-wrap" style="height:320px;"><canvas id="chartModalCanvas"></canvas></div>
</div>
</div>
</div>
<div class="modal-overlay" id="gajiDetailModal" onclick="if(event.target===this) closeGajiDetail()">
<div class="modal-box">
<div class="modal-head">
<h3>Detail Gaji Sesi</h3>
<button class="modal-close" onclick="closeGajiDetail()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body" id="gajiDetailBody"></div>
</div>
</div>

<!-- N6: script block moved to js/modules/coach + js/dist/coach.js -->


<!-- N6: script block moved to js/modules/coach + js/dist/coach.js -->


<!-- N6: script block moved to js/modules/coach + js/dist/coach.js -->
`;

export default VIEW_COACH;
