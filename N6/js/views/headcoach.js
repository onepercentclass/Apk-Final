/**
 * N6 view - headcoach
 *
 * The markup that used to sit inside <body> in headcoach.html, kept byte for byte.
 * Nothing was renamed, reordered or removed. The tier gate in js/core/access.js
 * works purely off the data-panel / data-client-tab attributes that already exist
 * on the navigation elements.
 *
 * Original <body> tag: <body data-theme="dark">
 */

export const BODY_ATTR = '<body data-theme="dark">';

export const VIEW_HEADCOACH = `
<div class="app">
<div class="sidebar-overlay" id="sidebarOverlay"></div>
<!-- SIDEBAR -->
<aside class="sidebar" id="sidebar">
<div class="side-brand"><div class="brand-logo"><img alt="Logo NUMBER SIX" class="logo-white" src="assets/img/logo-white.png"/><img alt="Logo NUMBER SIX" class="logo-black" src="assets/img/logo-black.png"/></div>
<div class="txt"><b>NUMBER SIX</b><span>Head Coach · Akses</span></div>
<button aria-label="Tutup menu" class="sidebar-close" id="sidebarClose">
<svg fill="none" height="18" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="18"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<nav class="side-nav" id="sideNav"><button data-panel="hub"><span style="font-size:17px;width:18px">◫</span> Beranda</button><button data-panel="hcmanual"><span style="font-size:17px;width:18px">▤</span> Buat Program</button><button data-panel="hcmonitor"><span style="font-size:17px;width:18px">◉</span> Monitoring Klien</button><button data-panel="hcclientchat"><span aria-hidden="true" class="ic">✉</span> Pesan</button>
<button data-panel="coach">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M20.5 9.5 12 4 3.5 9.5 12 15l8.5-5.5z"></path><path d="M7 12.5V17c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5"></path></svg>
        Coach
      </button>
<button data-panel="klien">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Klien
      </button>
<button data-panel="koreksi">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        Koreksi
      </button>
<button data-panel="atlet">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"></path><path d="M17 5h3a2 2 0 0 1-2 4h-1M7 5H4a2 2 0 0 0 2 4h1"></path></svg>
        Atlet Binaan
      </button>
<div style="border-top:1px solid rgba(255,255,255,0.08);margin:8px 0 4px"></div>
<button data-panel="sandi" type="button">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
<span>Ganti Password</span>
</button></nav>
<div class="side-foot">
<b id="hcSideFootName">Head Coach</b>
      Head Coach — N6 Running Training
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
<input placeholder="Cari coach, klien..."/>
</div>
<div class="bell">
<svg fill="none" height="18" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="18"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
</div>
<div class="avatar-name"><b id="hcTopbarName">Head Coach</b><span>Head Coach</span></div>
</div>
<div class="hc-account-wrap"><button aria-expanded="false" aria-label="Akun Head Coach" class="hc-account-toggle" id="hcAccountToggle" title="Akun Head Coach" type="button"><svg fill="none" height="23" stroke="currentColor" stroke-width="1.8" viewbox="0 0 24 24" width="23"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"></path></svg></button><div class="hc-account-menu" hidden="" id="hcAccountMenu"><div class="hc-account-menu-title">Head Coach <small>Pengaturan akun</small></div><div class="hc-account-menu-actions"><div class="hc-theme"><button aria-pressed="true" id="hcDark" type="button">☾ Dark</button><button aria-pressed="false" id="hcLight" type="button">☀ Light</button></div></div><p class="hc-muted" id="hcSessionLabel">Belum login</p><form autocomplete="off" class="hc-account-form" id="hcLoginForm" style="margin-top:15px"><label>Username<input id="hcUsername" maxlength="50" placeholder="Nama pengguna" required=""/></label><label>Password<input id="hcPassword" placeholder="Password tidak disimpan" required="" type="password"/></label><button class="btn-primary" type="submit">Login</button><button class="btn-outline" id="hcLogout" type="button">Logout</button></form><button hidden="" id="hcAccountLight" type="button"></button><button hidden="" id="hcAccountDark" type="button"></button></div></div>
</header>
<main class="content">
<div class="content-inner">
<section class="panel" id="panel-hub"><div class="hc-hub-head"><div><h1>Beranda Head Coach</h1><p>Program, progres, kepatuhan latihan dan perhatian klien berdasarkan data tercatat.</p></div><div class="hc-hub-actions"><button class="btn-outline" id="hcRefresh">↻ Perbarui Data</button><button class="btn-outline" hidden="" id="hcExport" style="display:none!important">↓ Ekspor Cadangan</button><button class="btn-primary" id="hcGoBuilder">+ Buat Program</button></div></div><div class="hc-kpis" id="hcKpis"></div><div class="hc-cols"><div><div class="card"><div class="card-head"><h3>Tren Volume Latihan &amp; Kepatuhan</h3><div class="hc-filter"><select id="hcPeriod"><option value="4">4 Minggu</option><option selected="" value="8">8 Minggu</option><option value="12">12 Minggu</option></select><select id="hcCoachFilter"><option value="">Semua Coach</option></select></div></div><div class="card-body"><canvas class="hc-chart" id="hcTrend"></canvas><p class="hc-muted">Volume berasal dari laporan sesi yang dicatat. Kepatuhan = sesi selesai / sesi terencana pada program.</p></div></div><div class="card"><div class="card-head"><h3>Progres Seluruh Klien</h3><div class="hc-filter"><input id="hcSearch" placeholder="Cari nama klien..."/><select id="hcStatusFilter"><option value="">Semua status</option><option value="ontrack">Sesuai target</option><option value="attention">Perlu evaluasi</option><option value="nodata">Belum ada laporan</option></select></div></div><div class="card-body"><div class="hc-list" id="hcClientList"></div></div></div></div><div><div class="card"><div class="card-head"><h3>Prioritas Minggu Ini</h3></div><div class="card-body hc-list" id="hcPriorities"></div></div><div class="card"><div class="card-head"><h3>Distribusi Status Program</h3></div><div class="card-body"><canvas class="hc-chart" id="hcDistribution" style="height:190px"></canvas><div class="hc-muted" id="hcLegend"></div></div></div><div class="card"><div class="card-head"><h3>Aktivitas Terbaru</h3></div><div class="card-body hc-list" id="hcActivity"></div></div></div></div></section>
<section class="panel" id="panel-hcmanual"><div class="hc-hub-head"><div><h1>Buat Program</h1><p>Isi identitas klien secara manual, kemudian susun latihan mingguan untuk diunduh dan dikirim melalui WhatsApp.</p></div></div><div class="hc-banner">Program ini hanya untuk dokumen JPG/PDF. Tidak otomatis menambah klien, mengirim pesan WhatsApp, atau mengubah data monitoring.</div><div class="card"><div class="card-head"><h3>01 · Identitas &amp; Target Klien</h3></div><div class="card-body"><form class="hc-form" id="mForm"><label>Nama Klien<input id="mClient" maxlength="100" placeholder="Nama lengkap klien" required=""/></label><label>Nama Coach<input id="mCoach" maxlength="100" placeholder="Nama coach penanggung jawab" required=""/></label><label>Umur (tahun)<input id="mAge" max="100" min="10" placeholder="Contoh: 28" required="" type="number"/></label><label>Jarak yang Dikejar<select id="mDistance"><option>1.500 m</option><option>3K</option><option>5K</option><option>10K</option><option>Half Marathon</option><option>Marathon</option><option>Lainnya</option></select></label><label>PB Sekarang<input id="mPb" placeholder="Contoh: 00:52:30" required=""/></label><label>PB Target<input id="mTarget" placeholder="Contoh: 00:45:00" required=""/></label><label>Jenis Program<select id="mPhase"><option>Persiapan Umum</option><option>Persiapan Khusus</option><option>Prakompetisi</option></select></label><label>Tanggal Mulai<input id="mStart" type="date"/></label><label>Tanggal Selesai<input id="mEnd" type="date"/></label><div class="wide hc-hub-actions"><button class="btn-primary" type="submit">Lanjut · Susun Program →</button><button class="btn-outline" id="mReset" type="button">Kosongkan Form</button></div></form></div></div><div class="card" id="mPaceCard"><div class="card-head"><h3>03 · Persentase Pace &amp; HR</h3><button class="btn-outline" id="mPaceToggle" type="button">Buka Kalkulator Pace</button></div><div class="card-body" hidden="" id="mPaceBody"><p class="hc-muted">Atur intensitas pace dan jarak secara terpisah pada setiap baris. HR ditampilkan sebagai estimasi berdasarkan usia dan intensitas yang dipilih.</p><div class="hc-form" style="margin-top:14px"><label>PB Acuan (MM:SS / HH:MM:SS)<input id="mPacePb" placeholder="25:00"/></label><label>Jarak PB Acuan (meter)<input id="mPaceBase" min="100" step="100" type="number" value="5000"/></label><label>Usia (tahun)<input id="mPaceAge" max="100" min="10" placeholder="28" type="number"/></label></div><div style="overflow-x:auto;margin-top:18px"><table class="m-pace-table" style="min-width:680px"><thead><tr><th>BARIS</th><th>INTENSITAS PACE</th><th>JARAK</th><th>PACE/KM</th><th>WAKTU JARAK</th><th>HR (BPM)</th></tr></thead><tbody id="mPaceRows"></tbody></table></div><div class="hc-hub-actions" style="margin-top:14px"><button class="btn-outline" id="mPaceAddDistance" type="button">+ Jarak Custom</button><button class="btn-primary" id="mPaceRun" type="button">Hitung 10 Baris</button><button class="btn-primary" id="mPaceJpg" type="button">↓ Unduh JPG</button><button class="btn-outline" id="mPacePdf" type="button">↓ Unduh PDF</button></div><p class="hc-muted" style="margin-top:10px">HR dihitung sebagai perkiraan berdasarkan usia dan persentase intensitas yang dipilih; bukan hasil pengukuran individual.</p><div aria-live="polite" id="mPaceResult"></div></div></div></section><section class="panel" id="panel-hcmanualweeks"><div class="hc-hub-head"><div><h1>Susun Program Mingguan</h1><p>Pilih jenis latihan; estimasi HR minimum dan maksimum akan menyesuaikan usia.</p></div><button class="btn-outline" id="mBack" type="button">← Ubah Identitas</button></div><div class="hc-banner" id="mSummary"></div><div class="card"><div class="card-head"><h3>02 · Rencana Latihan</h3><div class="hc-hub-actions"><button class="btn-outline" id="mTrainToggle" type="button">+ Tambah Jenis Latihan</button><button class="btn-outline" id="mAddWeek" type="button">+ Tambah Minggu</button></div></div><div class="card-body"><div hidden="" id="mTrainEditor" style="padding:16px;border:1px solid var(--line);border-radius:10px;margin-bottom:14px;background:var(--white)"><h3 style="margin-bottom:10px">Kelola Jenis Latihan</h3><div class="hc-form"><label>Nama Jenis Latihan Baru<input id="mTrainName" maxlength="65" placeholder="Contoh: Fartlek Progresif"/></label><div class="wide hc-hub-actions"><button class="btn-primary" id="mTrainSave" type="button">Simpan Jenis Latihan</button><button class="btn-outline" id="mTrainClose" type="button">Tutup</button></div></div><p class="hc-muted" style="margin-top:10px">Jenis latihan baru langsung tersedia pada dropdown setiap hari dan disimpan di browser.</p><div class="hc-muted" id="mTrainList"></div></div><div class="m-week-tabs" id="mTabs"></div><div id="mDays"></div><div class="hc-hub-actions" style="margin-top:20px"><button class="btn-outline" id="mPrev" type="button">← Minggu Sebelumnya</button><button class="btn-outline" id="mNext" type="button">Minggu Berikutnya →</button><button class="btn-primary" id="mJpg" type="button">↓ Unduh JPG</button><button class="btn-outline" id="mPdf" type="button">↓ Unduh PDF</button></div><p class="hc-muted" style="margin-top:12px">Hanya minggu yang memiliki latihan atau keterangan yang akan diekspor. Setiap minggu dicetak sebagai satu halaman A4 pada PDF.</p></div></div></section><section class="panel" id="panel-hcclientchat"><div class="hc-hub-head"><div><h1>Pesan</h1><p>Komunikasi dan koreksi program dengan klien, Admin CS, dan Owner.</p></div></div>
<div class="hc-banner">Pilih penerima dan percakapan. Klien dapat dicari berdasarkan nama tanpa mengetik ID. Pesan memakai penyimpanan browser yang tersedia; komunikasi antarperangkat membutuhkan backend yang terhubung.</div>
<div class="card"><div class="card-head"><h3>Percakapan</h3></div><div class="card-body">
<div class="m-msg-controls"><label>Tujuan Pesan<select id="mRecipient"><option value="client">Klien</option><option value="admin">Admin CS</option><option value="owner">Owner</option></select></label>
<label id="mClientFilterWrap">Cari Nama Klien<input autocomplete="off" id="mClientFilter" placeholder="Ketik nama klien..." type="search"/><select aria-label="Pilih klien dari hasil pencarian" id="mClientPick" size="5"></select><small class="hc-muted" id="mClientCount"></small></label></div>
<div class="m-chat-thread" id="mChatThread"><p class="hc-muted">Pilih klien atau tujuan percakapan.</p></div>
<label style="display:block;font-weight:700;margin-top:14px">Tulis Pesan / Koreksi Program<textarea id="mChatText" placeholder="Tulis pesan..." rows="4"></textarea></label>
<div class="hc-hub-actions" style="margin-top:10px"><button class="btn-primary" id="mSendChat" type="button">Kirim Pesan</button><button class="btn-outline" id="mRefreshChat" type="button">↻ Perbarui Percakapan</button></div>
</div></div></section><section class="panel" id="panel-hcprogram"><div class="hc-hub-head"><div><h1>Buat Program</h1><p>Susun rencana latihan berdasarkan kondisi atlet, PB dan fase persiapan. Ekspor siap cetak dalam PDF atau JPG.</p></div><button class="btn-outline" id="hcGoHub">← Kembali ke Analitik</button></div><div class="hc-banner">Setelah program disimpan, JPG program dibuat otomatis. Anda juga dapat mengunduh PDF siap cetak. Unduh atau bagikan JPG ke klien; pratinjau juga tersedia pada halaman klien jika kedua halaman menggunakan penyimpanan website yang sama. Pengiriman lintas perangkat memerlukan backend.</div><div class="hc-cols"><div><div class="card"><div class="card-head"><h3>Identitas Atlet &amp; Rencana Program</h3></div><div class="card-body"><form class="hc-form" id="hcProgramForm"><label>Klien<select id="hcpClient" required=""><option value="">Pilih klien</option></select></label><label>Coach Penanggung Jawab<select id="hcpCoach"><option value="">Pilih coach</option></select></label><label>Umur (tahun)<input id="hcpAge" max="100" min="5" placeholder="Contoh: 27" required="" type="number"/></label><label>PB Sekarang<input id="hcpPbCurrent" placeholder="Contoh: 10K — 52:30" required=""/></label><label>PB yang Dikejar<input id="hcpPbTarget" placeholder="Contoh: 10K — 45:00" required=""/></label><label>Fase Program<select id="hcpPhase" required=""><option value="Persiapan Umum">Persiapan Umum</option><option value="Persiapan Khusus">Persiapan Khusus</option><option value="Prakompetisi">Prakompetisi</option></select></label><label>Target Utama<select id="hcpGoal"><option>5K</option><option>10K</option><option>Half Marathon</option><option>Marathon</option><option>Base Building</option><option>Recovery</option><option>Lainnya</option></select></label><label>Mulai<input id="hcpStart" required="" type="date"/></label><label class="wide">Rencana latihan / jadwal (bebas)<textarea id="hcpDailyPlan" placeholder="Senin: Easy Run 6 km
Selasa: Interval 6 × 400 m
Rabu: Recovery / istirahat
..." rows="9"></textarea></label><label class="wide">Fokus &amp; Catatan Coach<textarea id="hcpNotes" placeholder="Fokus teknik, intensitas, recovery, penyesuaian individual..." rows="3"></textarea></label><div class="wide hc-mini-grid" id="hcWeekPreview" style="display:none"></div><div class="wide hc-hub-actions"><button class="btn-primary" type="submit">Simpan &amp; Unduh JPG</button><button class="btn-outline" id="hcpCreatePdf" type="button">Simpan &amp; Unduh PDF</button><button class="btn-outline" id="hcpReset" type="button">Reset Form</button></div><input id="hcpAthleteName" placeholder="Nama atlet / klien" type="hidden"/><input id="hcpName" placeholder="Contoh: Persiapan 10K — 8 minggu" type="hidden"/><input id="hcpWeeks" max="52" min="1" type="hidden" value="8"/><input id="hcpVolume" min="0" placeholder="Opsional" step="0.1" type="hidden"/><input id="hcpSessions" max="14" min="1" type="hidden" value="4"/></form></div></div></div><div><div class="card" style="display:none"><div class="card-head"><h3>Arsip Program · JPG / PDF</h3></div><div class="card-body hc-list" id="hcSavedPrograms"></div></div><div class="card"><div class="card-head"><h3>Evaluasi Hasil Latihan</h3></div><div class="card-body"><form class="hc-form" id="hcLogForm"><label class="wide">Program<select id="hclProgram" required=""><option value="">Pilih program</option></select></label><label>Tanggal<input id="hclDate" required="" type="date"/></label><label>Status<select id="hclStatus"><option value="selesai">Selesai</option><option value="parsial">Parsial</option><option value="terlewat">Terlewat</option></select></label><label>Jarak (km)<input id="hclKm" min="0" placeholder="0" step="0.01" type="number"/></label><label>Durasi (menit)<input id="hclMinutes" min="0" placeholder="0" type="number"/></label><label>RPE (1–10)<input id="hclRpe" max="10" min="1" placeholder="Opsional" type="number"/></label><label>Kondisi<select id="hclWellbeing"><option value="baik">Baik</option><option value="lelah">Kelelahan</option><option value="keluhan">Ada keluhan</option></select></label><label class="wide">Catatan / Feedback<textarea id="hclNotes" placeholder="Observasi sesi dan tindak lanjut" rows="3"></textarea></label><button class="btn-primary wide" type="submit">Simpan Hasil Latihan</button></form></div></div></div></div></section>
<section class="panel" id="panel-hcmonitor"><div class="hc-hub-head"><div><h1>Monitoring Klien</h1><p>Pusat pemantauan terpadu: kondisi, laporan smartwatch, tindak lanjut, progres dan prioritas klien.</p></div><button class="btn-outline" id="hcMonitorExport">↓ Ekspor CSV</button></div><div class="hc-banner">Indikator merupakan alat pemantauan, bukan diagnosis medis. Keluhan atau tanda kelelahan perlu dievaluasi oleh tenaga profesional yang sesuai.</div><div class="n6-ops-grid" id="n6MonitorKpis"></div><div class="card"><div class="card-head"><h3>Manajemen &amp; Prioritas Klien</h3><div class="n6-controls"><input id="n6MonitorSearch" placeholder="Cari nama klien..."/><select id="n6MonitorStatus"><option value="">Semua kondisi</option><option value="normal">Normal</option><option value="cedera">Cedera</option><option value="bermasalah">Bermasalah</option><option value="belum">Belum dinilai</option></select><select id="n6MonitorSort"><option value="priority">Prioritas penanganan</option><option value="name">Nama A–Z</option><option value="recent">Laporan terbaru</option></select></div></div><div class="card-body n6-table-wrap"><table class="n6-ops-table"><thead><tr><th>Klien</th><th>Kondisi</th><th>Laporan terakhir</th><th>Jumlah laporan</th><th>Evaluasi terakhir</th><th>Tindak lanjut</th><th>Aksi</th></tr></thead><tbody id="n6MonitorRows"></tbody></table></div></div><div class="card"><div class="card-head"><h3>Grafik Distribusi Kondisi Klien</h3></div><div class="card-body"><div id="n6HealthBars"></div><p class="n6-subtle">Grafik berdasarkan penilaian Head Coach yang tersimpan, bukan diagnosis medis.</p></div></div><div class="card"><div class="card-head"><h3>Ringkasan Klien</h3><select id="hcmClient" style="width:auto;min-width:200px"><option value="">Pilih klien</option></select></div><div class="card-body" id="hcClientDetail"><div class="hc-empty">Pilih klien untuk melihat perkembangan.</div></div></div><div class="card"><div class="card-head"><h3>Log Latihan Tercatat</h3></div><div class="card-body hc-table-scroll"><table><thead><tr><th>Tanggal</th><th>Klien</th><th>Program</th><th>Status</th><th>Jarak</th><th>RPE</th><th>Kondisi</th><th>Catatan</th></tr></thead><tbody id="hcLogTable"></tbody></table></div></div></section>
<!-- ===================== PANEL: COACH ===================== -->
<section class="panel" id="panel-coach">
<div class="subtabs" data-group="coachpanel">
<button class="subtab-btn active" data-sub="daftar">Daftar Coach</button>
<button class="subtab-btn" data-sub="operasional">Absensi &amp; Perizinan</button><button class="subtab-btn" data-sub="kalender">Kalender Tim</button>
<button class="subtab-btn" data-sub="absensi">Absensi Tim</button>
<button class="subtab-btn" data-sub="evaluasi">Evaluasi</button>
</div>
<div class="subpanel active" id="coachpanel-daftar">
<div class="card">
<div class="card-head"><h3>Daftar Coach (3)</h3><button class="btn-outline n6-print-btn" id="hcPrintCoach">Cetak PDF · Daftar Coach</button></div>
<div class="card-body" id="coachListBody"></div>
</div>
</div>
<div class="subpanel" id="coachpanel-kalender">
<div class="card">
<div class="card-head">
<h3>Kalender Jadwal Coach &amp; Klien — 30 Hari ke Depan</h3>
<select id="calCoachFilter" style="width:auto; min-width:160px;">
<option value="">Semua Coach</option>
</select>
</div>
<div class="card-body">
<div class="note-sync" style="display:flex; align-items:center; gap:8px; font-size:11.5px; color:var(--asphalt); background:var(--paper-dim); padding:9px 14px; border-radius:6px; margin-bottom:16px;">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
                  Pilih satu coach di atas untuk memantau jadwal &amp; klien coach tersebut per hari, atau biarkan "Semua Coach" untuk melihat jadwal tim. Jadwal sesi diatur oleh Admin CS saat klien pertama kali mendaftar; Anda dapat menyetujui perubahan lewat tab "Koreksi".
                </div>
<div class="cal-header">
<div class="range" id="calRange">-</div>
<div class="cal-legend" id="calLegendTeam"></div>
</div>
<div class="cal-grid" id="calGrid"></div>
<div class="cal-detail" id="calDetail"></div>
</div>
</div>
</div>
<div class="subpanel" id="coachpanel-absensi">
<div class="card">
<div class="card-head"><h3>Absensi Seluruh Coach</h3><button class="btn-outline n6-print-btn" id="hcPrintAttendance">Cetak PDF · Absensi Bulanan</button></div>
<div class="card-body" id="teamAttendanceBody"></div>
</div>
</div>
<div class="subpanel" id="coachpanel-operasional"><div class="hc-hub-head"><div><h2>Absensi &amp; Perizinan Coach</h2><p>Rekap kehadiran, keterlambatan, izin, sakit, reschedule dan riwayat tindakan.</p></div></div><div class="hc-att-kpis" id="hcAttKpis"></div><div class="card"><div class="card-head"><h3>Catat Absensi Coach</h3></div><div class="card-body"><form class="hc-att-form" id="hcAttForm"><label>Coach<select id="hcAttCoach" required=""><option value="">Pilih coach</option></select></label><label>Tanggal<input id="hcAttDate" required="" type="date"/></label><label>Status<select id="hcAttStatus"><option>Hadir</option><option>Terlambat</option><option>Izin</option><option>Sakit</option><option>Tanpa keterangan</option><option>Reschedule</option><option>Libur</option></select></label><label>Waktu / sesi<input id="hcAttTime" placeholder="Contoh: 06:00–07:00" type="text"/></label><label class="wide">Keterangan<textarea id="hcAttNote" placeholder="Alasan, pengganti jadwal, atau tindak lanjut" rows="2"></textarea></label><button class="btn-primary" type="submit">Simpan Absensi</button></form><p class="hc-muted" style="margin-top:12px">Entri baru disimpan di browser ini. Untuk data lintas perangkat diperlukan server bersama.</p></div></div><div class="card"><div class="card-head"><h3>Riwayat Absensi</h3><div class="hc-att-filters"><input id="hcAttSearch" placeholder="Cari coach"/><input id="hcAttMonth" type="month"/><select id="hcAttFilter"><option value="">Semua status</option><option>Hadir</option><option>Terlambat</option><option>Izin</option><option>Sakit</option><option>Tanpa keterangan</option><option>Reschedule</option><option>Libur</option></select><button class="btn-outline" id="hcAttPdf" type="button">↓ Unduh PDF</button></div></div><div class="card-body hc-table-scroll"><table><thead><tr><th>Tanggal</th><th>Coach</th><th>Status</th><th>Waktu</th><th>Keterangan</th><th>Aksi</th></tr></thead><tbody id="hcAttRows"></tbody></table></div></div><div class="hc-att-duo"><div class="card"><div class="card-head"><h3>Pengajuan Reschedule</h3></div><div class="card-body" id="hcAttReschedule"></div></div><div class="card"><div class="card-head"><h3>Izin &amp; Cuti Coach</h3></div><div class="card-body" id="hcAttLeave"></div></div></div></div><div class="subpanel" id="coachpanel-evaluasi">
<div class="card">
<div class="card-head"><h3>Beri Skor &amp; Feedback Coach</h3></div>
<div class="card-body">
<form id="evalForm">
<div class="form-grid">
<select id="evalCoach" required="">
<option value="">Pilih coach</option>
</select>
<input id="evalScore" placeholder="Score (0-100)" required="" type="text"/>
<textarea class="full" id="evalKomentar" placeholder="Catatan / feedback untuk coach" required=""></textarea>
</div>
<button class="btn-primary" type="submit">Kirim Feedback</button>
</form>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Riwayat Evaluasi</h3></div>
<div class="card-body" id="evalHistoryList"></div>
</div>
</div>
</section>
<!-- ===================== PANEL: KLIEN ===================== -->
<section class="panel" id="panel-klien">
<div class="card n6-health-card"><div class="card-head"><h3>Penilaian Kondisi Klien</h3><span class="n6-subtle">Penilaian operasional oleh Head Coach, bukan diagnosis medis.</span></div><div class="card-body"><div class="n6-health-form"><label>Klien<select id="n6HealthClient"><option value="">Pilih klien</option></select></label><label>Status<select id="n6HealthStatus"><option value="normal">Normal</option><option value="cedera">Cedera (dilaporkan)</option><option value="bermasalah">Bermasalah / perlu evaluasi</option></select></label><label>Tanggal<input id="n6HealthDate" type="date"/></label><label class="wide">Catatan &amp; tindak lanjut<textarea id="n6HealthNote" placeholder="Keluhan, penyesuaian latihan, rencana tindak lanjut..." rows="3"></textarea></label><button class="btn-primary" id="n6HealthSave" type="button">Simpan Penilaian</button></div><div class="n6-health-history" id="n6HealthHistory"></div></div></div><div class="subtabs" data-group="klienpanel">
<button class="subtab-btn active" data-sub="semua">Semua Klien</button>
<button class="subtab-btn" data-sub="perhatian">Bermasalah &amp; Cedera</button>
</div>
<div class="subpanel active" id="klienpanel-semua">
<div class="card">
<div class="card-head">
<h3>Semua Klien (8)</h3>
<select id="klienFilterCoach" style="width:auto; min-width:150px;">
<option value="">Semua Coach</option>
</select>
</div>
<div class="card-body" id="allClientsList"></div>
</div>
</div>
<div class="subpanel" id="klienpanel-perhatian">
<div class="card">
<div class="card-head"><h3>Klien Bermasalah &amp; Cedera</h3></div>
<div class="card-body" id="flaggedClientsList"></div>
</div>
</div>
</section>
<!-- ===================== PANEL: ATLET BINAAN ===================== -->
<section class="panel" id="panel-atlet">
<div class="subtabs" data-group="atletpanel">
<button class="subtab-btn active" data-sub="daftar">Daftar Atlet</button>
<button class="subtab-btn" data-sub="prestasi">Prestasi &amp; Hasil Lomba</button>
</div>
<div class="subpanel active" id="atletpanel-daftar">
<div class="card">
<div class="card-head"><h3>Podium Musim Ini</h3></div>
<div class="card-body">
<div class="podium-grid" id="podiumSummary"></div>
</div>
</div>
<div class="card">
<div class="card-head">
<h3>Daftar Atlet Binaan</h3>
<button class="btn-primary" onclick="openAthleteModal(null)" style="margin-top:0;" type="button">+ Tambah Atlet</button>
</div>
<div class="card-body" id="athleteList"></div>
</div>
</div>
<div class="subpanel" id="atletpanel-prestasi">
<div class="card">
<div class="card-head">
<h3>Prestasi &amp; Hasil Lomba</h3>
<button class="btn-primary" onclick="openAchievementModal(null)" style="margin-top:0;" type="button">+ Catat Prestasi</button>
</div>
<div class="card-body">
<select id="filterAthleteAchv" style="width:auto; min-width:180px; margin-bottom:16px;">
<option value="">Semua Atlet</option>
</select>
<div id="achievementList"></div>
</div>
</div>
</div>
</section>
<!-- ===================== PANEL: PERSETUJUAN ===================== -->
<section class="panel" id="panel-koreksi">
<div class="subtabs" data-group="koreksipanel">
<button class="subtab-btn active" data-sub="hasil">Hasil Latihan Klien</button>
<button class="subtab-btn" data-sub="reschedule">Reschedule</button>
<button class="subtab-btn" data-sub="cuti">Cuti Coach</button>
<button class="subtab-btn" data-sub="template">Template Koreksi</button>
</div>
<div class="subpanel active" id="koreksipanel-hasil">
<div class="card">
<div class="card-head"><h3>Hasil Latihan Klien</h3></div>
<div class="card-body">
<div class="note-box">
                  Menampilkan hasil latihan <b>semua klien</b> minggu berjalan (Senin–Minggu), dikelompokkan per hari supaya cepat dikoreksi satu per satu tanpa perlu memilih klien dulu. Begitu minggu berganti, tampilan ini otomatis memuat data minggu baru — riwayat lengkap tiap klien tetap tersimpan di halaman Klien &gt; Rapor.
                </div>
<div class="day-tabs-row" id="dayTabs"></div>
<div class="koreksi-toolbar">
<select id="filterCoachKoreksi"></select>
<label class="toggle-label">
<input checked="" id="onlyPendingToggle" type="checkbox"/>
                    Hanya tampilkan yang belum direview
                  </label>
</div>
<div class="stat-grid" style="margin-top:16px; margin-bottom:0;">
<div class="stat-card"><div class="label">Belum Direview</div><div class="value red" id="countPending">-</div></div>
<div class="stat-card"><div class="label">Sudah Direview</div><div class="value green" id="countReviewed">-</div></div>
<div class="stat-card"><div class="label">Total Hari Ini</div><div class="value" id="countTotal">-</div></div>
</div>
</div>
</div>
<div class="card">
<div class="card-head"><h3 id="submissionListTitle">Hari Ini</h3></div>
<div class="card-body" id="submissionList"></div>
</div>
</div>
<div class="subpanel" id="koreksipanel-reschedule">
<div class="card">
<div class="card-head"><h3>Pengajuan Reschedule</h3></div>
<div class="card-body" id="rescheduleApprovalList"></div>
</div>
</div>
<div class="subpanel" id="koreksipanel-cuti">
<div class="card">
<div class="card-head"><h3>Pengajuan Cuti Coach</h3></div>
<div class="card-body" id="cutiApprovalList"></div>
</div>
</div>
<div class="subpanel" id="koreksipanel-template">
<div class="card">
<div class="card-head">
<h3>Template Kata Koreksi</h3>
<button class="btn-primary" onclick="openTemplateModal('koreksi', null)" style="margin-top:0;" type="button">+ Tambah Template</button>
</div>
<div class="card-body">
<div class="note-box" style="margin-bottom:0;">
                  Template ini muncul sebagai tombol cepat di bawah setiap kolom koreksi pada tab "Hasil Latihan Klien". Setiap template punya <b>kode</b> — ketik kodenya pada kolom kode kecil di sebelah kolom koreksi lalu klik "Terapkan" untuk langsung mengisi teks lengkapnya.
                </div>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Daftar Template</h3></div>
<div class="card-body" id="koreksiTemplateList"></div>
</div>
</div>
</section>
<section class="panel" id="panel-sandi">
<div id="n6SandiRoot"></div>
</section>
<!-- ===================== PANEL: PROGRAM LARI ===================== -->
<div hidden="" id="legacyProgramCompatibility"><section class="panel" id="legacy-program">
<div class="subtabs" data-group="programpanel">
<button class="subtab-btn active" data-sub="buat">Buat Program</button>
<button class="subtab-btn" data-sub="kirim">Riwayat Terkirim</button>
<button class="subtab-btn" data-sub="kelola">Kelola Template Program</button>
</div>
<div class="subpanel active" id="programpanel-buat">
<div class="card">
<div class="card-head"><h3>1. Pilih Template Program Lari</h3></div>
<div class="card-body" id="programTplPickList"></div>
</div>
<div class="card">
<div class="card-head"><h3>2. Lengkapi &amp; Kirim ke Admin/CS</h3></div>
<div class="card-body">
<form id="programBuildForm">
<div class="form-grid">
<select id="programClient" required="">
<option value="">Pilih klien tujuan</option>
</select>
<input id="programNamaTpl" placeholder="Nama program" readonly="" required="" style="background:var(--paper-dim);" type="text"/>
<textarea class="full" id="programKeterangan" placeholder="Keterangan program akan terisi otomatis setelah memilih template di atas — silakan edit sesuai kebutuhan klien ini." required="" rows="5"></textarea>
</div>
<button class="btn-primary" type="submit">Kirim Program ke Admin/CS</button>
</form>
</div>
</div>
</div>
<div class="subpanel" id="programpanel-kirim">
<div class="card">
<div class="card-head"><h3>Riwayat Program Terkirim</h3></div>
<div class="card-body" id="sentProgramList"></div>
</div>
</div>
<div class="subpanel" id="programpanel-kelola">
<div class="card">
<div class="card-head">
<h3>Template Program Lari</h3>
<button class="btn-primary" onclick="openTemplateModal('program', null)" style="margin-top:0;" type="button">+ Tambah Template</button>
</div>
<div class="card-body">
<div class="note-box" style="margin-bottom:0;">
                  Template di sini muncul sebagai pilihan cepat saat membuat program baru. Ubah atau tambah sesuai jenis program yang sering Anda kirimkan ke Admin/CS.
                </div>
</div>
</div>
<div class="card">
<div class="card-head"><h3>Daftar Template Program</h3></div>
<div class="card-body" id="programTemplateList"></div>
</div>
</div>
</section>
<!-- ===================== PANEL: CHAT TIM ===================== --></div>
<section class="panel" hidden="" id="panel-chat" style="display:none!important">
<div class="subtabs" data-group="chatpanel">
<button class="subtab-btn active" data-sub="admin">Admin</button>
<button class="subtab-btn" data-sub="owner">Owner</button>
</div>
<div class="subpanel active" id="chatpanel-admin">
<div class="card">
<div class="card-head"><h3>Chat dengan Admin</h3></div>
<div class="card-body">
<div class="chat-role-note">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
                  Percakapan ini tersimpan dan akan tersinkron dengan dashboard Admin ketika terhubung ke penyimpanan yang sama.
                </div>
<div class="chat-shell">
<div class="chat-thread" id="chatThreadAdmin"></div>
<div class="chat-input-row">
<textarea id="chatInputAdmin" placeholder="Tulis pesan untuk Admin..."></textarea>
<button class="btn-primary" onclick="sendInternalChat('admin')" style="margin-top:0;" type="button">Kirim</button>
</div>
</div>
</div>
</div>
</div>
<div class="subpanel" id="chatpanel-owner">
<div class="card">
<div class="card-head"><h3>Chat dengan Owner</h3></div>
<div class="card-body">
<div class="chat-role-note">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
                  Percakapan ini tersimpan dan akan tersinkron dengan dashboard Owner ketika terhubung ke penyimpanan yang sama.
                </div>
<div class="chat-shell">
<div class="chat-thread" id="chatThreadOwner"></div>
<div class="chat-input-row">
<textarea id="chatInputOwner" placeholder="Tulis pesan untuk Owner..."></textarea>
<button class="btn-primary" onclick="sendInternalChat('owner')" style="margin-top:0;" type="button">Kirim</button>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- ===================== PANEL: AKUN USER ===================== -->
</div>
</main>
</div>
<nav class="bottom-nav" id="bottomNav">
<button class="active" data-panel="hub">
<svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M3 12l9-9 9 9"></path><path d="M5 10v10h14V10"></path></svg>
<span>Beranda</span>
</button>
<button data-panel="koreksi">
<svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
<span>Koreksi</span>
</button>
<button data-panel="klien">
<svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
<span>Klien</span>
</button>
<button id="moreNavBtn" type="button">
<svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><circle cx="5" cy="12" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="19" cy="12" r="1.5"></circle></svg>
<span>Lainnya</span>
</button>
<button data-panel="hcmanual"><span style="font-size:19px">▤</span><span>Buat Program</span></button><button data-panel="hcclientchat">✉ Pesan</button></nav>
<div class="more-sheet-overlay" id="moreSheetOverlay">
<div class="more-sheet" id="moreSheet">
<div class="more-sheet-handle"></div>
<div class="more-sheet-title">Menu Lainnya</div>
<button data-panel="coach" type="button">
<svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M20.5 9.5 12 4 3.5 9.5 12 15l8.5-5.5z"></path><path d="M7 12.5V17c0 1.5 2.2 3 5 3s5-1.5 5-3v-4.5"></path></svg>
<span>Coach</span>
</button>
<button data-panel="atlet" type="button">
<svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"></path><path d="M17 5h3a2 2 0 0 1-2 4h-1M7 5H4a2 2 0 0 0 2 4h1"></path></svg>
<span>Atlet Binaan</span>
</button>
</div>
</div>
<div class="modal-overlay" id="clientDetailModal" onclick="if(event.target===this) closeClientDetail()">
<div class="modal-box">
<div class="modal-head">
<h3 id="clientDetailTitle">Detail Klien</h3>
<button class="modal-close" onclick="closeClientDetail()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body" id="clientDetailBody"></div>
</div>
</div>
<div class="modal-overlay" id="templateModal" onclick="if(event.target===this) closeTemplateModal()">
<div class="modal-box">
<div class="modal-head">
<h3 id="templateModalTitle">Tambah Template</h3>
<button class="modal-close" onclick="closeTemplateModal()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<form id="templateForm">
<div class="form-grid">
<input class="full" id="tplCode" maxlength="6" placeholder="Kode (angka, misal: 1)" type="text"/>
<input class="full" id="tplLabel" placeholder="Judul singkat template" required="" type="text"/>
<textarea class="full" id="tplText" placeholder="Isi teks lengkap yang akan dimasukkan otomatis" required="" rows="4"></textarea>
</div>
<button class="btn-primary" type="submit">Simpan Template</button>
</form>
</div>
</div>
</div>
<div class="modal-overlay" id="athleteModal" onclick="if(event.target===this) closeAthleteModal()">
<div class="modal-box">
<div class="modal-head">
<h3 id="athleteModalTitle">Tambah Atlet</h3>
<button class="modal-close" onclick="closeAthleteModal()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<form id="athleteForm">
<div class="form-grid">
<input class="full" id="athName" placeholder="Nama atlet" required="" type="text"/>
<select id="athKategori" required="">
<option value="">Kategori</option>
<option value="Elite Putra">Elite Putra</option>
<option value="Elite Putri">Elite Putri</option>
<option value="Veteran">Veteran</option>
<option value="Junior">Junior</option>
</select>
<select id="athCoach" required="">
<option value="">Coach pembina</option>
</select>
<textarea class="full" id="athCatatan" placeholder="Catatan (opsional): fokus latihan, target lomba, dsb." rows="3"></textarea>
</div>
<button class="btn-primary" type="submit">Simpan Atlet</button>
</form>
</div>
</div>
</div>
<div class="modal-overlay" id="achievementModal" onclick="if(event.target===this) closeAchievementModal()">
<div class="modal-box">
<div class="modal-head">
<h3 id="achievementModalTitle">Catat Prestasi</h3>
<button class="modal-close" onclick="closeAchievementModal()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<form id="achievementForm">
<div class="form-grid">
<select class="full" id="achAthlete" required="">
<option value="">Pilih atlet</option>
</select>
<input id="achEvent" placeholder="Nama lomba (misal: Jakarta Marathon 2026)" required="" type="text"/>
<input id="achTanggal" required="" type="date"/>
<input id="achKategori" placeholder="Kategori lomba (misal: Half Marathon Elite)" type="text"/>
<select id="achPosisi" required="">
<option value="">Posisi / hasil</option>
<option value="Juara 1">Juara 1</option>
<option value="Juara 2">Juara 2</option>
<option value="Juara 3">Juara 3</option>
<option value="Finisher">Finisher</option>
<option value="DNF">DNF (Tidak Selesai)</option>
</select>
<input id="achWaktu" placeholder="Waktu tempuh (misal: 1:05:23)" type="text"/>
<textarea class="full" id="achCatatan" placeholder="Catatan tambahan (opsional)" rows="3"></textarea>
</div>
<button class="btn-primary" type="submit">Simpan Prestasi</button>
</form>
</div>
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
<div class="toast" id="toast">Tersimpan</div>

<div class="modal-overlay" id="coachDetailModal" onclick="if(event.target===this) closeCoachDetail()">
<div class="modal-box">
<div class="modal-head">
<h3 id="coachDetailTitle">Detail Coach</h3>
<button class="modal-close" onclick="closeCoachDetail()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body" id="coachDetailBody"></div>
</div>
</div>

<!-- N6: script block moved to js/modules/headcoach + js/dist/headcoach.js -->


<!-- N6: script block moved to js/modules/headcoach + js/dist/headcoach.js -->

<!-- N6: script block moved to js/modules/headcoach + js/dist/headcoach.js -->

<!-- N6: script block moved to js/modules/headcoach + js/dist/headcoach.js -->

<!-- N6: script block moved to js/modules/headcoach + js/dist/headcoach.js -->

<!-- N6: script block moved to js/modules/headcoach + js/dist/headcoach.js -->
`;

export default VIEW_HEADCOACH;
