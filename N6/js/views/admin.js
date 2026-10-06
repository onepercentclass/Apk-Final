/**
 * N6 view - admin
 *
 * The markup that used to sit inside <body> in admin.html, kept byte for byte.
 * Nothing was renamed, reordered or removed. The tier gate in js/core/access.js
 * works purely off the data-panel / data-client-tab attributes that already exist
 * on the navigation elements.
 *
 * Original <body> tag: <body data-theme="dark">
 */

export const BODY_ATTR = '<body data-theme="dark">';

export const VIEW_ADMIN = `
<div class="app">
<div class="sidebar-overlay" id="sidebarOverlay"></div>
<!-- SIDEBAR -->
<aside class="sidebar" id="sidebar">
<div class="side-brand">
<div class="brand-logo"><img alt="Logo NUMBER SIX" class="logo-white" src="assets/img/logo-white.png"/><img alt="Logo NUMBER SIX" class="logo-black" src="assets/img/logo-black.png"/></div>
<div class="txt"><b>NUMBER SIX</b><span>Admin · Akses</span></div>
<button aria-label="Tutup menu" class="sidebar-close" id="sidebarClose">
<svg fill="none" height="18" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="18"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<nav class="side-nav" id="sideNav">
<button class="active" data-panel="beranda">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M3 12l9-9 9 9"></path><path d="M5 10v10h14V10"></path></svg>
        Beranda
      </button>
<button data-panel="klien">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Klien
      </button>
<button data-panel="jadwalklien">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><rect height="18" rx="2" width="18" x="3" y="4"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>
        Jadwal Klien
      </button>
<button data-panel="jadwalcoach">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 3"></path></svg>
        Jadwal Coach
      </button>
<button data-panel="harga">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        Daftar Harga
      </button>
<button data-panel="tiket">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5a2 2 0 0 1 0 4v1a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1a2 2 0 0 1 0-4z"></path></svg>
        Tiket &amp; Keluhan
        <span class="nav-dot" id="navDotTiket" style="display:none;">0</span>
</button>
<button data-panel="pesan">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.3-.2-3.3-.6L3 20l1-4.2C3.4 14.5 3 13.3 3 12c0-4.4 4-8 9-8s9 3.6 9 8z"></path></svg>
        Pesan
        <span class="nav-dot" id="navDotPesan" style="display:none;">0</span>
</button>
</nav>
<div style="border-top:1px solid rgba(255,255,255,0.08);margin:8px 12px 4px"></div>
<button data-panel="sandi">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        Ganti Password
      </button>
<div class="side-foot">
<b>Admin CS</b>
      Customer Service — N6 Running Training
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
<input id="globalSearch" placeholder="Cari nama klien..."/>
</div>
<div class="bell" id="bellIcon">
<svg fill="none" height="18" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="18"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
</div>
<button aria-label="Buka akun dan pengaturan" class="n6-theme-btn" id="n6ThemeBtn" title="Akun" type="button">♙</button>
</div>
</header>
<main class="content">
<div class="content-inner">
<!-- ===================== PANEL: BERANDA ===================== -->
<section class="panel active" id="panel-beranda">
<div class="n6-tools">
<div class="n6-heading"><strong>NUMBER SIX</strong><span>Ringkasan operasional Admin CS</span></div>
<div class="n6-actions"><input accept=".json,application/json" hidden="" id="n6ImportFile" type="file"/></div>
</div>
<div class="sync-note" id="n6StorageNotice" style="display:none"></div>
<div class="stat-grid">
<div class="stat-card"><div class="label">Total Klien</div><div class="value" id="statTotalKlien">0</div></div>
<div class="stat-card"><div class="label">Klien Baru (7 Hari)</div><div class="value green" id="statKlienBaru">0</div></div>
<div class="stat-card"><div class="label">Tiket Terbuka</div><div class="value red" id="statTiketTerbuka">0</div></div>
<div class="stat-card"><div class="label">Pesan Menunggu Balasan</div><div class="value red" id="statPesanMenunggu">0</div></div>
</div>
<div class="stat-grid n6-extra-stats">
<div class="stat-card"><div class="label">Total Coach</div><div class="value" id="n6TotalCoach">0</div></div>
<div class="stat-card"><div class="label">Program Akan Berakhir (7 Hari)</div><div class="value" id="n6Expiring">0</div></div>
<div class="stat-card"><div class="label">Pembayaran Belum Lunas</div><div class="value" id="n6Unpaid">0</div></div>
<div class="stat-card"><div class="label">Klien Terarsip</div><div class="value" id="n6Archived">0</div></div>
</div>
<div class="card n6-insights">
<div class="card-head"><div><h3>Analitik Operasional</h3><div class="sub-h">Dihitung langsung dari data Coach, Klien, pembayaran, dan tiket yang tersimpan.</div></div><div class="n6-analytics-filters"><select aria-label="Periode pendaftaran" id="n6Period"><option value="7">7 Hari</option><option selected="" value="30">30 Hari</option><option value="90">90 Hari</option><option value="180">6 Bulan</option></select><select aria-label="Filter coach" id="n6CoachFilter"><option value="">Semua Coach</option></select><button class="btn-sm" id="n6Csv" type="button">Ekspor CSV</button><button class="btn-sm" id="n6TargetsBtn" type="button">⚙ Batas Indikator</button></div></div>
<div class="card-body"><div class="n6-metric-grid" id="n6MetricGrid"></div><div class="n6-chart-layout"><div class="n6-chart-panel"><h4>Pendaftaran menurut periode</h4><div class="n6-bars" id="n6SignupChart"></div></div><div class="n6-chart-panel"><h4>Distribusi status klien</h4><div id="n6StatusChart"></div></div></div><p class="n6-data-note">Indikator berdasarkan data yang tersedia. Tidak ada estimasi otomatis untuk data yang belum dicatat.</p></div>
</div>
<div class="card" hidden="" id="n6TargetsPanel"><div class="card-head"><h3>Atur Batas Indikator</h3></div><div class="card-body"><div class="form-grid"><div><label class="field-label">Target klien baru / periode</label><input id="n6TargetNew" min="0" type="number" value="10"/></div><div><label class="field-label">Batas tiket terbuka</label><input id="n6TargetTickets" min="0" type="number" value="5"/></div><div><label class="field-label">Batas pesan menunggu</label><input id="n6TargetMessages" min="0" type="number" value="3"/></div><div><label class="field-label">Batas pembayaran belum lunas</label><input id="n6TargetUnpaid" min="0" type="number" value="5"/></div></div><button class="btn-primary" id="n6SaveTargets" style="margin-top:14px" type="button">Simpan Batas</button></div></div>
<div class="card">
<div class="card-head"><h3>Perlu Perhatian</h3></div>
<div class="card-body" id="attentionList"></div>
</div>
<div class="card">
<div class="card-head">
<h3>Coach Kosong Hari Ini</h3>
<button class="btn-sm" onclick="switchPanel('jadwalcoach')">Buka Jadwal Coach</button>
</div>
<div class="card-body" id="coachKosongToday"></div>
</div>
<div class="card">
<div class="card-head">
<h3>Pesan Terbaru</h3>
<button class="btn-sm" onclick="switchPanel('pesan')">Buka Semua Pesan</button>
</div>
<div class="card-body" id="recentMessagesList"></div>
</div>
<div class="card">
<div class="card-head"><h3>Pendaftaran Terbaru</h3></div>
<div class="card-body" id="recentClientsList"></div>
</div>
</section>
<!-- ===================== PANEL: KLIEN ===================== -->
<section class="panel" id="panel-klien">
<div class="note-box">Halaman ini adalah pusat data klien. Data klien tersimpan pada browser ini. Sinkronisasi ke Dashboard Client dan Coach membutuhkan database bersama.</div>
<div class="subtabs" data-group="klienview">
<button class="subtab-btn active" data-klienview="aktif">Klien Aktif</button>
<button class="subtab-btn" data-klienview="arsip">Arsip (Nonaktif &gt;7 Hari) <span id="arsipCountBadge"></span></button>
</div>
<div class="subpanel active" id="klienview-aktif">
<div class="card">
<div class="card-head">
<h3 id="klienCountTitle">Semua Klien (0)</h3>
<button class="btn-primary" id="btnTambahKlien" style="margin-top:0;">+ Tambah Klien</button>
</div>
<div class="card-body">
<div class="filter-bar">
<input class="search-box" id="klienSearchInput" placeholder="Cari nama atau telepon..." type="text"/>
<select id="klienFilterCoach"><option value="">Semua Coach</option></select>
<select id="klienFilterStatus">
<option value="">Semua Status</option>
<option value="Aktif">Aktif</option>
<option value="Akan Berakhir">Akan Berakhir</option>
<option value="Nonaktif">Nonaktif</option>
</select>
</div>
<div id="clientListBody"></div>
</div>
</div>
</div>
<div class="subpanel" id="klienview-arsip">
<div class="sync-note">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
              Klien yang statusnya Nonaktif (program sudah berakhir) selama 7 hari berturut-turut otomatis dipindah ke sini dan hilang dari daftar Klien Aktif, Jadwal, dan statistik. Datanya tetap tersimpan — bisa dipulihkan kapan saja, atau dihapus permanen kalau memang sudah tidak diperlukan.
            </div>
<div class="card">
<div class="card-head"><h3>Klien Terarsip</h3></div>
<div class="card-body" id="archiveListBody"></div>
</div>
</div>
</section>
<!-- ===================== PANEL: JADWAL KLIEN ===================== -->
<section class="panel" id="panel-jadwalklien">
<div class="sync-note">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
            Jadwal &amp; paket program tiap klien diatur di sini saat pendaftaran. Coach dan Head Coach hanya bisa memantau, bukan mengubah tanggal atau harga.
          </div>
<div class="card">
<div class="card-head"><h3>Jadwal &amp; Paket Program Klien</h3></div>
<div class="card-body" style="overflow-x:auto;">
<table>
<thead><tr><th>Klien</th><th>Program</th><th>Coach</th><th>Mulai</th><th>Selesai</th><th>Paket</th><th>Status</th></tr></thead>
<tbody id="jadwalBody"></tbody>
</table>
</div>
</div>
</section>
<!-- ===================== PANEL: JADWAL COACH ===================== -->
<section class="panel" id="panel-jadwalcoach">
<div class="n6-sync-toolbar"><div><strong>Jadwal Coach bersama Admin CS</strong><p id="n6SyncStatus">Membaca roster, pola mingguan, dan tanggal libur dari penyimpanan bersama.</p></div><button class="btn-sm" id="n6SyncRefresh" type="button">↻ Perbarui Jadwal</button></div>
<div class="sync-note">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
            Ketersediaan tiap coach diatur oleh Admin CS di sini — sehingga saat klien baru mendaftar, Admin bisa langsung tahu coach mana yang kosong dan menempatkannya di sesi yang tepat.
          </div>
<div class="card">
<div class="card-head">
<div><h3>Jadwal Coach</h3><div class="sub-h">Atur pola rutin, cek kalender real-time, dan kelola daftar coach.</div></div>
<button aria-expanded="false" class="btn-sm" id="toggleCoachGuide" type="button">Lihat keterangan</button>
</div>
<div class="card-body">
<div class="note-box" id="coachGuide" style="display:none;margin-bottom:0;">
<strong>Cara kerja halaman ini</strong><br/>
                Pola Mingguan menjadi jadwal dasar yang berulang setiap minggu. Slot kosong dapat langsung dipilih untuk menambahkan client atau keterangan seperti sesi trial. Kalender 30 Hari digunakan untuk tanggal aktual dan hari libur coach. Daftar Coach dipisahkan agar halaman tetap ringkas.
              </div>
</div>
</div>
<div class="card">
<div class="card-body">
<div class="subtabs" id="coachPageTabs">
<button class="subtab-btn active" data-coachpage="schedule" type="button">Jadwal &amp; Ketersediaan</button>
<button class="subtab-btn" data-coachpage="roster" type="button">Daftar Coach</button>
<button class="subtab-btn" data-coachpage="izin" type="button">Izin Coach</button><button class="subtab-btn" data-coachpage="reschedule" type="button">Reschedule Jadwal</button><button class="subtab-btn" data-coachpage="cuti" type="button">Izin Cuti</button></div>
<div class="subpanel active" id="coachpage-schedule">
<div class="card-head" style="padding:0 0 14px;border-bottom:0;"><h3>Ketersediaan Coach</h3></div>
<div class="subtabs">
<button class="subtab-btn active" data-jcview="mingguan" type="button">Pola Mingguan (rutin)</button>
<button class="subtab-btn" data-jcview="bulanan" type="button">Kalender 30 Hari (real-time)</button>
</div>
<div class="subpanel active" id="jcview-mingguan">
<div class="subtabs" id="dayTabs"></div>
<div style="overflow-x:auto;">
<table class="sched-table" id="schedTable"></table>
</div>
<div class="legend" style="display:flex; gap:16px; margin-top:14px; font-size:11.5px; color:var(--asphalt); flex-wrap:wrap;">
<span><span class="badge green">Kosong</span> = coach tersedia, bisa diisi klien baru</span>
<span><span class="badge red">Terisi</span> = klik untuk lihat/ubah/kosongkan</span>
</div>
<div class="note-box" style="margin-top:14px; margin-bottom:0;">Pola mingguan ini berulang tiap minggu (mis. "Senin Pagi" selalu sama tiap minggu). Untuk melihat tanggal riil sebulan penuh dan menandai coach libur di tanggal tertentu, buka tab "Kalender 30 Hari".</div>
</div>
<div class="subpanel" id="jcview-bulanan">
<div class="cal-head">
<div class="range" id="coachCalRange">-</div>
<div class="cal-nav">
<button aria-label="Bulan sebelumnya" id="coachCalPrev" type="button">←</button>
<button id="coachCalToday" type="button">Hari Ini</button>
<button aria-label="Bulan berikutnya" id="coachCalNext" type="button">→</button>
</div>
</div>
<div class="cal-grid" id="coachCalGrid"></div>
<div class="legend" style="display:flex; gap:16px; margin-top:14px; font-size:11.5px; color:var(--asphalt); flex-wrap:wrap; align-items:center;">
<span><i class="cal-legend-dot" style="background:var(--green);"></i>Ada slot kosong</span>
<span><i class="cal-legend-dot" style="background:var(--red);"></i>Penuh</span>
<span><i class="cal-legend-dot" style="background:var(--amber);"></i>Ada coach libur tanggal ini</span>
</div>
<div class="cal-detail" id="coachCalDetail"><p class="modal-empty">Klik salah satu tanggal untuk lihat detail ketersediaan tiap coach.</p></div>
</div>
</div>
<div class="subpanel" id="coachpage-roster">
<div class="card-head" style="padding:0 0 14px;"><div><h3>Daftar Coach</h3><div class="sub-h">Kelola nama dan nomor coach tanpa memenuhi halaman jadwal.</div></div><button class="btn-outline" id="btnTambahCoach" style="margin-top:0;">+ Tambah Coach</button></div>
<div id="coachRosterList"></div>
</div>
<div class="subpanel" id="coachpage-izin"><h3>Izin Coach</h3><p class="n6-request-hint">Catat izin ketidakhadiran coach untuk sesi tertentu dan kelola status pengajuannya.</p><div class="n6-report-tools"><label>Periode laporan<input aria-label="Bulan laporan izin" data-n6-report-month="izin" type="month"/></label><button class="btn-primary n6-report-btn" data-n6-report="izin" type="button">Cetak PDF Bulanan</button><small>Pilih bulan, lalu gunakan “Simpan sebagai PDF” pada dialog cetak browser. Laporan mencakup semua status pengajuan.</small></div><form class="n6-request-form" data-n6-form="izin"><label>Coach<select data-n6-coaches="" name="coach" required=""></select></label><label>Tanggal izin<input name="tanggal" required="" type="date"/></label><label>Jam sesi<input name="jam" required="" type="time"/></label><label>Klien / sesi terkait<input name="klien" placeholder="Nama klien atau sesi" type="text"/></label><label class="wide">Alasan<textarea name="alasan" placeholder="Jelaskan alasan izin" required=""></textarea></label><div class="wide"><button class="btn-primary" type="submit">Simpan Izin Coach</button></div></form><div data-n6-list="izin"></div></div>
<div class="subpanel" id="coachpage-reschedule"><h3>Reschedule Jadwal</h3><p class="n6-request-hint">Catat jadwal lama dan jadwal pengganti; persetujuan tidak otomatis memindahkan slot jadwal.</p><div class="n6-report-tools"><label>Periode laporan<input aria-label="Bulan laporan reschedule" data-n6-report-month="reschedule" type="month"/></label><button class="btn-primary n6-report-btn" data-n6-report="reschedule" type="button">Cetak PDF Bulanan</button><small>Pilih bulan, lalu gunakan “Simpan sebagai PDF” pada dialog cetak browser. Laporan mencakup semua status pengajuan.</small></div><form class="n6-request-form" data-n6-form="reschedule"><label>Coach<select data-n6-coaches="" name="coach" required=""></select></label><label>Klien / sesi<input name="klien" placeholder="Nama klien" required="" type="text"/></label><label>Jadwal lama<input name="lama" required="" type="datetime-local"/></label><label>Jadwal baru<input name="baru" required="" type="datetime-local"/></label><label class="wide">Alasan<textarea name="alasan" placeholder="Alasan perubahan jadwal" required=""></textarea></label><div class="wide"><button class="btn-primary" type="submit">Ajukan Reschedule</button></div></form><div data-n6-list="reschedule"></div></div>
<div class="subpanel" id="coachpage-cuti"><h3>Izin Cuti Coach</h3><p class="n6-request-hint">Catat rentang cuti dan keputusan persetujuan.</p><div class="n6-report-tools"><label>Periode laporan<input aria-label="Bulan laporan cuti" data-n6-report-month="cuti" type="month"/></label><button class="btn-primary n6-report-btn" data-n6-report="cuti" type="button">Cetak PDF Bulanan</button><small>Pilih bulan, lalu gunakan “Simpan sebagai PDF” pada dialog cetak browser. Laporan mencakup semua status pengajuan.</small></div><form class="n6-request-form" data-n6-form="cuti"><label>Coach<select data-n6-coaches="" name="coach" required=""></select></label><label>Mulai cuti<input name="mulai" required="" type="date"/></label><label>Selesai cuti<input name="selesai" required="" type="date"/></label><label>Jenis cuti<select name="jenis"><option>Cuti tahunan</option><option>Sakit</option><option>Keperluan keluarga</option><option>Lainnya</option></select></label><label class="wide">Alasan<textarea name="alasan" placeholder="Keterangan cuti" required=""></textarea></label><div class="wide"><button class="btn-primary" type="submit">Ajukan Izin Cuti</button></div></form><div data-n6-list="cuti"></div></div>
</div>
</div>
<div class="card" id="coachShareCard">
<div class="card-head"><h3>Bagikan Jadwal ke Calon Klien</h3></div>
<div class="card-body">
<div class="sync-note">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
                Pilih coach, lalu unduh jadwal 30 hari ke depan sebagai gambar (JPG). Admin CS bisa langsung kirim ke calon klien via WhatsApp — klien tinggal lihat zona waktu mana yang masih kosong untuk latihan.
              </div>
<div class="form-grid">
<div><label class="field-label">Pilih Coach</label><select id="shareScheduleCoach"></select></div>
<div><label class="field-label">Mulai Tanggal</label><input id="shareScheduleStart" type="date"/></div>
</div>
<button class="btn-primary" id="btnDownloadCoachSchedule" style="width:100%; margin-top:12px;">Unduh Jadwal 30 Hari (JPG)</button>
</div>
</div>
</section>
<!-- ===================== PANEL: DAFTAR HARGA ===================== -->
<section class="panel" id="panel-harga">
<div class="sync-note">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
            Tarif dasar di halaman ini nantinya diatur penuh oleh Owner (termasuk komisi coach). Admin CS memakai tarif ini sebagai acuan saat mendaftarkan klien.
          </div>
<div class="card">
<div class="card-head"><h3>Daftar Harga Program N6</h3></div>
<div class="card-body" id="priceListBody"></div>
</div>
</section>
<!-- ===================== PANEL: TIKET & KELUHAN ===================== -->
<section class="panel" id="panel-tiket">
<div class="subtabs" data-group="tiketpanel">
<button class="subtab-btn active" data-sub="semua">Semua</button>
<button class="subtab-btn" data-sub="baru">Baru</button>
<button class="subtab-btn" data-sub="diproses">Diproses</button>
<button class="subtab-btn" data-sub="selesai">Selesai</button>
</div>
<div class="card">
<div class="card-head">
<h3>Tiket &amp; Keluhan Klien</h3>
<button class="btn-outline" id="btnTambahTiket" style="margin-top:0;">+ Tiket Manual</button>
</div>
<div class="card-body" id="ticketListBody"></div>
</div>
</section>
<!-- ===================== PANEL: PESAN ===================== -->
<section class="panel" id="panel-pesan">
<div class="card">
<div class="card-head">
<h3>Percakapan dengan Klien</h3>
<button class="btn-outline" id="btnBroadcast" style="margin-top:0;">Broadcast Pesan</button>
</div>
<div class="card-body" id="messageListBody"></div>
</div>
</section>
<section class="panel" id="panel-sandi">
<div id="n6SandiRoot"></div>
</section>
</div>
</main>
<!-- BOTTOM NAV (mobile) -->
<nav aria-label="Navigasi mobile" class="bottom-nav" id="bottomNav">
<button class="active" data-panel="beranda"><span class="n6-nav-ico">⌂</span><span>Beranda</span></button>
<button data-panel="klien"><span class="n6-nav-ico">♙</span><span>Klien</span></button>
<button data-panel="jadwalklien"><span class="n6-nav-ico">▦</span><span>Jadwal</span></button>
<button id="n6MoreBtn" type="button"><span class="n6-nav-ico">☷</span><span>Lainnya</span><span class="nav-dot" id="navDotTiketMobile" style="display:none">0</span><span class="nav-dot" id="navDotPesanMobile" style="display:none">0</span></button>
<button aria-label="Buka akun dan tema" id="n6MobileTheme" title="Akun" type="button"><span class="n6-nav-ico">♙</span></button>
</nav>
<div class="n6-more-menu" hidden="" id="n6MoreMenu">
<button data-panel="jadwalcoach">Jadwal Coach</button><button data-panel="harga">Daftar Harga</button><button data-panel="tiket">Tiket &amp; Keluhan</button><button data-panel="pesan">Pesan</button>
</div>
</div>
</div>
<!-- MODAL: TAMBAH/EDIT KLIEN -->
<div class="modal-overlay" id="clientFormModal" onclick="if(event.target===this) closeClientForm()">
<div class="modal-box">
<div class="modal-head">
<h3 id="clientFormTitle">Tambah Klien</h3>
<button class="modal-close" onclick="closeClientForm()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<input id="fClientId" type="hidden"/>
<div class="form-grid">
<div class="full"><label class="field-label" id="fNameLabel">Nama Lengkap</label><input id="fName" placeholder="Nama klien" type="text"/></div>
<!-- Field khusus program Semi Private: nama & link terpisah untuk 2 orang -->
<div class="full" id="fSemiWrap" style="display:none;">
<div class="sync-note" style="background:var(--red-tint); color:var(--red); margin-bottom:10px;">
            Program Semi Private diikuti 2 orang. Isi nama orang kedua — sistem akan membuatkan 2 data klien terpisah, masing-masing dengan link dashboard sendiri.
          </div>
<label class="field-label">Nama Klien 2</label>
<input id="fName2" placeholder="Nama peserta ke-2" type="text"/>
</div>
<div><label class="field-label">No. Telepon / WhatsApp</label><input id="fPhone" placeholder="08xxxxxxxxxx" type="tel"/></div>
<div><label class="field-label">Coach Pendamping</label><select id="fCoach"></select></div>
<div class="full"><label class="field-label">Program</label><select id="fProgram"></select></div>
<!-- Field untuk program configurable (Running Class / Semi Private / Private Offline) -->
<div class="full" id="fConfigWrap" style="display:none;">
<div class="form-grid">
<div><label class="field-label">Pertemuan / Minggu</label><input id="fMeetings" max="7" min="1" type="number" value="2"/></div>
<div><label class="field-label">Durasi (Minggu)</label><input id="fWeeks" max="12" min="1" type="number" value="4"/></div>
</div>
<div class="price-box" id="fPriceBoxConfig"></div>
</div>
<!-- Field untuk program fixed -->
<div class="full" id="fFixedWrap" style="display:none;">
<div class="price-box" id="fPriceBoxFixed"></div>
</div>
<!-- Field untuk kerja sama korporat / event -->
<div class="full" id="fCustomWrap" style="display:none;">
<div class="form-grid">
<div class="full"><label class="field-label" id="fCustomNameLabel">Nama Perusahaan/Event</label><input id="fCustomName" placeholder="mis. PT Sinar Abadi / Jakarta Night Run 2026" type="text"/></div>
<div><label class="field-label" id="fCustomCountLabel">Jumlah Peserta/Pacer</label><input id="fCustomCount" min="1" placeholder="mis. 25" type="number"/></div>
<div><label class="field-label">Nilai Kerjasama (Rp)</label><input id="fCustomValue" min="0" placeholder="mis. 15000000" type="number"/></div>
<div class="full"><label class="field-label">Catatan Kerjasama</label><textarea id="fCustomNote" placeholder="Detail kesepakatan, PIC, tanggal, dsb."></textarea></div>
</div>
</div>
<div><label class="field-label">Tanggal Mulai</label><input id="fStart" type="date"/></div>
<div><label class="field-label">Tanggal Selesai</label><input id="fEnd" type="date"/></div>
<div><label class="field-label">PB Awal (opsional)</label><input id="fPbStart" placeholder="mis. 25:30" type="text"/></div>
<div><label class="field-label">PB Akhir (opsional)</label><input id="fPbEnd" placeholder="mis. 23:10" type="text"/></div>
<div><label class="field-label">Status Pembayaran</label>
<select id="fPaymentStatus">
<option value="Belum Lunas">Belum Lunas</option>
<option value="DP Sebagian">DP Sebagian</option>
<option value="Lunas">Lunas</option>
</select>
</div>
<div><label class="field-label">Jumlah Dibayar (Rp, opsional)</label><input id="fAmountPaid" min="0" placeholder="mis. 500000" type="number"/></div>
<div class="full"><label class="field-label">Catatan Internal</label><textarea id="fNotes" placeholder="Catatan untuk tim CS/coach (tidak terlihat klien)"></textarea></div>
</div>
<p id="clientFormError" style="color:var(--red); font-size:12px; margin-top:10px; display:none;">Nama klien wajib diisi.</p>
<button class="btn-primary" id="btnSaveClient" style="width:100%; margin-top:16px;">Simpan Klien</button>
<div id="invoiceActionWrap" style="display:none; margin-top:10px;">
<button class="btn-outline" id="btnDownloadInvoice" style="width:100%; margin-top:0;" type="button">
          Unduh Invoice (JPG)
        </button>
<p style="font-size:11px; color:var(--asphalt); margin-top:6px; text-align:center;">Invoice dibuat dari data klien &amp; paket di atas — pastikan sudah disimpan dulu sebelum diunduh.</p>
</div>
</div>
</div>
</div>
<!-- MODAL: DETAIL KLIEN -->
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
<!-- MODAL: TIKET MANUAL -->
<div class="modal-overlay" id="ticketFormModal" onclick="if(event.target===this) closeTicketForm()">
<div class="modal-box">
<div class="modal-head">
<h3>Tambah Tiket Manual</h3>
<button class="modal-close" onclick="closeTicketForm()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<div class="form-grid">
<div class="full"><label class="field-label">Klien</label><select id="tClient"></select></div>
<div class="full"><label class="field-label">Judul</label><input id="tSubject" placeholder="mis. Komplain jadwal sesi" type="text"/></div>
<div><label class="field-label">Prioritas</label>
<select id="tPriority"><option value="Rendah">Rendah</option><option selected="" value="Sedang">Sedang</option><option value="Tinggi">Tinggi</option></select>
</div>
<div><label class="field-label">Status</label>
<select id="tStatus"><option selected="" value="Baru">Baru</option><option value="Diproses">Diproses</option><option value="Selesai">Selesai</option></select>
</div>
<div class="full"><label class="field-label">Detail</label><textarea id="tDetail" placeholder="Jelaskan keluhan/permintaan klien"></textarea></div>
</div>
<button class="btn-primary" id="btnSaveTicket" style="width:100%; margin-top:16px;">Simpan Tiket</button>
</div>
</div>
</div>
<!-- MODAL: CHAT KLIEN -->
<div class="modal-overlay" id="chatModal" onclick="if(event.target===this) closeChatModal()">
<div class="modal-box" style="max-width:480px;">
<div class="modal-head">
<h3 id="chatModalTitle">Percakapan</h3>
<button class="modal-close" onclick="closeChatModal()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<div class="chat-thread" id="chatThread"></div>
<div class="template-row">
<select id="templateSelect">
<option value="">— Pakai template balasan cepat —</option>
<option value="Halo! Terima kasih sudah menghubungi N6 Running Training. Ada yang bisa kami bantu?">Sapaan pembuka</option>
<option value="Baik, jadwal sesi kamu sudah kami konfirmasi. Sampai jumpa di lapangan!">Konfirmasi jadwal</option>
<option value="Halo, ini pengingat pembayaran program kamu. Mohon segera diselesaikan ya agar sesi latihan tidak terganggu. Terima kasih!">Pengingat pembayaran</option>
<option value="Laporan latihan kamu sudah kami cek dan sudah diteruskan ke coach untuk evaluasi lebih lanjut ya.">Follow-up laporan latihan</option>
<option value="Mohon maaf atas ketidaknyamanannya. Tim kami sedang menindaklanjuti hal ini dan akan segera memberi kabar.">Permintaan maaf keluhan</option>
</select>
</div>
<div class="chat-input-row">
<input id="chatInput" placeholder="Balas sebagai CS/Coach..." type="text"/>
<button aria-label="Kirim" id="chatSendBtn" type="button">
<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" viewbox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
</button>
</div>
</div>
</div>
</div>
<!-- MODAL: BROADCAST -->
<div class="modal-overlay" id="broadcastModal" onclick="if(event.target===this) closeBroadcast()">
<div class="modal-box">
<div class="modal-head">
<h3>Broadcast Pesan ke Klien</h3>
<button class="modal-close" onclick="closeBroadcast()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<div class="form-grid">
<div class="full"><label class="field-label">Kirim ke</label>
<select id="bTarget">
<option value="all">Semua Klien</option>
<option value="coach">Klien dari Coach tertentu...</option>
</select>
</div>
<div class="full" id="bCoachWrap" style="display:none;"><label class="field-label">Pilih Coach</label><select id="bCoach"></select></div>
<div class="full"><label class="field-label">Isi Pesan</label><textarea id="bMessage" placeholder="Tulis pengumuman untuk klien, mis. info libur, promo, dsb."></textarea></div>
</div>
<p id="bTargetCount" style="font-size:11.5px; color:var(--asphalt); margin-top:8px;">Pesan akan dikirim ke 0 klien.</p>
<button class="btn-primary" id="btnSendBroadcast" style="width:100%; margin-top:12px;">Kirim Broadcast</button>
</div>
</div>
</div>
<!-- MODAL: TAMBAH/EDIT COACH -->
<div class="modal-overlay" id="coachFormModal" onclick="if(event.target===this) closeCoachForm()">
<div class="modal-box">
<div class="modal-head">
<h3 id="coachFormTitle">Tambah Coach</h3>
<button class="modal-close" onclick="closeCoachForm()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<input id="cfCoachId" type="hidden"/>
<div class="form-grid">
<div class="full"><label class="field-label">Nama Coach</label><input id="cfName" placeholder="Nama coach" type="text"/></div>
<div class="full"><label class="field-label">No. Telepon</label><input id="cfPhone" placeholder="08xxxxxxxxxx" type="tel"/></div>
</div>
<button class="btn-primary" id="btnSaveCoach" style="width:100%; margin-top:16px;">Simpan Coach</button>
</div>
</div>
</div>
<!-- MODAL: SLOT JADWAL COACH -->
<div class="modal-overlay" id="slotModal" onclick="if(event.target===this) closeSlotModal()">
<div class="modal-box" style="max-width:420px;">
<div class="modal-head">
<h3 id="slotModalTitle">Atur Slot</h3>
<button class="modal-close" onclick="closeSlotModal()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<div class="form-grid">
<div class="full"><label class="field-label">Klien (opsional, pilih dari daftar)</label><select id="slotClientSelect"><option value="">— Isi manual di bawah —</option></select></div>
<div class="full"><label class="field-label">Nama / Keterangan</label><input id="slotClientName" placeholder="mis. Dimas Prasetyo, atau 'Sesi Trial'" type="text"/></div>
<div class="full"><label class="field-label">Kategori latihan</label><select id="slotTrainingCategory"><option value="single-session">Single Session Training</option><option value="group-training">Group Training</option><option value="semi-private">Semi Privat Training</option><option value="private-training">Privat Training</option></select></div>
<div class="full"><label class="field-label">Lokasi</label><input id="slotLocation" list="slotLocationList" placeholder="mis. GBK Senayan, Lapangan Kampus, dll" type="text"/><datalist id="slotLocationList"></datalist></div>
<div class="full"><label class="field-label">Catatan</label><input id="slotNote" placeholder="mis. Bawa cone sendiri" type="text"/></div>
<div class="full"><label class="field-label">Tanggal sesi yang dicatat</label><input id="slotOccurrenceDate" type="date"/></div>
<div class="full"><label><input id="slotOccurrenceDone" type="checkbox"/> Sesi pada tanggal ini sudah selesai (komisi final)</label><small class="muted">Status berlaku untuk seluruh klien yang tercatat pada slot ini.</small></div>
</div>
<div id="slotAddClientAction" style="margin-top:12px; display:none;"><button class="btn-outline" onclick="beginAddSlotClient()" style="width:100%;" type="button">+ Tambahkan klien pada sesi ini</button></div>
<div style="display:flex; gap:8px; margin-top:16px;">
<button class="btn-primary" id="btnSaveSlot" style="flex:1;">Tandai Terisi</button>
<button class="btn-outline" id="btnClearSlot" style="flex:1;">Kosongkan Slot</button>
</div>
</div>
</div>
</div>
<div class="toast" id="toast">Tersimpan</div>
<!-- Admin CS account and appearance, inspired by Owner dashboard; preview-only session -->
<div aria-labelledby="n6AccountTitle" aria-modal="true" class="modal-overlay n6-account-overlay" id="n6AccountModal" role="dialog">
<div class="modal-box n6-account-dialog"><div class="modal-head"><h3 id="n6AccountTitle">Akun &amp; Pengaturan</h3><button aria-label="Tutup" class="modal-close" id="n6AccountClose" type="button">✕</button></div>
<div class="modal-body"><div class="n6-account-identity"><div class="n6-account-avatar">CS</div><div><strong id="n6AccountName">Admin CS</strong><div class="n6-account-caption" id="n6AccountStatus">Belum masuk · pratinjau</div></div></div>
<label class="field-label">Tampilan Dashboard</label><div aria-label="Pilih tema" class="n6-theme-options" role="group"><button id="n6ChooseLight" type="button">☀ Light · Biru</button><button id="n6ChooseDark" type="button">☾ Dark · Hijau</button></div>
<hr class="n6-account-divider"/><form autocomplete="off" class="n6-account-form" id="n6AccountForm"><label for="n6AccountUsername">Username</label><input autocomplete="username" id="n6AccountUsername" maxlength="50" placeholder="Username Admin CS" required="" type="text"/><label for="n6AccountPassword">Password</label><div class="n6-password-row"><input autocomplete="current-password" id="n6AccountPassword" minlength="6" placeholder="Minimal 6 karakter" required="" type="password"/><button id="n6ShowPassword" type="button">Lihat</button></div><button class="btn-primary" type="submit">Login</button></form><button class="btn-outline n6-account-logout" hidden="" id="n6AccountLogout" type="button">Logout</button><p class="n6-account-info">Mode pratinjau: login dan logout hanya mengubah status sesi pada browser ini. Password tidak disimpan atau diverifikasi. Untuk keamanan akses Admin CS, diperlukan autentikasi server.</p></div></div>
</div>

<!-- N6: script block moved to js/modules/admin + js/dist/admin.js -->


<!-- N6: script block moved to js/modules/admin + js/dist/admin.js -->


<!-- N6: script block moved to js/modules/admin + js/dist/admin.js -->

<!-- N6: script block moved to js/modules/admin + js/dist/admin.js -->
`;

export default VIEW_ADMIN;
