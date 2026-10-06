/**
 * N6 view - owner
 *
 * The markup that used to sit inside <body> in owner.html, kept byte for byte.
 * Nothing was renamed, reordered or removed. The tier gate in js/core/access.js
 * works purely off the data-panel / data-client-tab attributes that already exist
 * on the navigation elements.
 *
 * Original <body> tag: <body data-theme="dark">
 */

export const BODY_ATTR = '<body data-theme="dark">';

export const VIEW_OWNER = `
<div class="app">
<div class="sidebar-overlay" id="sidebarOverlay"></div>
<!-- SIDEBAR -->
<aside class="sidebar" id="sidebar">
<div class="side-brand">
<div class="brand-logo"><img alt="Logo NUMBER SIX" class="logo-white" src="assets/img/logo-white.png"/><img alt="Logo NUMBER SIX" class="logo-black" src="assets/img/logo-black.png"/></div>
<div class="txt"><b>NUMBER SIX</b><span>Owner · All Akses</span></div>
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
        Harga &amp; Program
      </button>
<button data-panel="komisi">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4z"></path></svg>
        Performa &amp; Komisi
      </button>
<button data-panel="keuangan">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        Keuangan
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
<button data-panel="akun">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        Kelola Anggota
      </button>
<button data-panel="sandi">
<svg class="ic" fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        Ganti Password
      </button>
</nav>
<div class="side-foot">
<b>Owner</b>
      Akses penuh — N6 Running Training
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
<button aria-label="Buka popup akun, login, logout dan pengaturan" class="desktop-account-trigger" id="desktopAccountBtn" title="Akun, login &amp; logout" type="button"><span aria-hidden="true">♙</span></button><div class="avatar-wrap">
<div class="avatar"><img alt="N6" class="logo-white" src="assets/img/logo-white.png"/><img alt="N6" class="logo-black" src="assets/img/logo-black.png"/></div>
<div class="avatar-name"><b>Owner</b><span>Akses Penuh</span></div>
</div>
</div>
</header>
<main class="content">
<div class="content-inner">
<!-- ===================== PANEL: BERANDA ===================== -->
<section class="panel active" id="panel-beranda">
<div class="analytics-heading"><div><h1>NUMBER SIX</h1></div><div class="analytics-controls"><select aria-label="Periode grafik" id="analyticsPeriod"><option selected="" value="current">Bulan Ini</option><option value="custom">Custom Waktu</option></select><input aria-label="Tanggal mulai" id="analyticsFrom" style="display:none;max-width:155px;" type="date"/><input aria-label="Tanggal akhir" id="analyticsTo" style="display:none;max-width:155px;" type="date"/><select aria-label="Filter coach" id="analyticsCoach"><option value="">Semua Coach</option></select><button class="btn-sm" id="analyticsExport">Ekspor CSV</button><button class="btn-sm" id="openKpiSettings" type="button">⚙ Batas Indikator</button></div></div><div aria-live="polite" class="health-grid" id="businessHealth"></div><details class="kpi-settings" id="kpiSettings"><summary>Pengaturan batas indikator</summary><div class="kpi-settings-grid"><label>Target pendapatan periode (Rp)<input id="kpiRevenueTarget" min="0" placeholder="Belum ditetapkan" step="100000" type="number"/></label><label>Target klien baru periode<input id="kpiClientsTarget" min="0" placeholder="Belum ditetapkan" step="1" type="number"/></label><label>Batas maksimal komisi (% pendapatan)<input id="kpiCommissionMax" max="100" min="0" placeholder="Belum ditetapkan" step="1" type="number"/></label><label>Batas maksimal tiket terbuka<input id="kpiTicketsMax" min="0" placeholder="Belum ditetapkan" step="1" type="number"/></label><label>Batas maksimal pesan menunggu<input id="kpiMessagesMax" min="0" placeholder="Belum ditetapkan" step="1" type="number"/></label><label>Batas maksimal program akan berakhir<input id="kpiEndingMax" min="0" placeholder="Belum ditetapkan" step="1" type="number"/></label></div><div class="kpi-actions"><button class="btn-primary" id="saveKpiSettings" type="button">Simpan batas</button><button class="btn-sm" id="resetKpiSettings" type="button">Kosongkan batas</button></div><p class="mini-note">Batas disimpan di browser ini saja; bukan sinkronisasi server. Indikator pendapatan/klien mengikuti periode dan filter coach. Tiket dan pesan dihitung keseluruhan.</p></details><div class="data-disclaimer">Grafik dihitung dari data klien, tanggal pendaftaran, program, coach, komisi dan pengeluaran pada dashboard ini. Tidak ada angka pertumbuhan atau target yang direkayasa; data yang belum tersedia ditampilkan apa adanya.</div>
<div class="analytics-grid" style="margin-bottom:16px"><div class="card"><div class="card-head"><div><h3>Revenue Overview</h3><div class="sub-h">Pendapatan pendaftaran aktif &amp; arsip per bulan • sesuai filter</div></div><span class="badge blue" id="analyticsRevenueTotal">Rp0</span></div><div class="card-body"><div class="analytics-chart-wrap" id="revenueChart"></div></div></div><div class="card"><div class="card-head"><h3>Pertumbuhan Klien</h3><span class="badge green" id="analyticsClientTotal">0 klien</span></div><div class="card-body"><div id="growthChart"></div><p class="mini-note">Jumlah pendaftaran baru per bulan, termasuk riwayat klien yang sudah diarsipkan; bukan jumlah klien aktif kumulatif.</p></div></div></div>
<div class="analytics-grid" style="margin-bottom:16px"><div class="card"><div class="card-head"><h3>Komposisi Pendapatan Program</h3></div><div class="card-body" id="analyticsPrograms"></div></div><div class="card"><div class="card-head"><h3>Performa Coach</h3><span class="sub-h">Klien ditangani</span></div><div class="card-body" id="analyticsCoaches"></div></div></div>
<div class="analytics-grid" style="margin-bottom:16px"><div class="card"><div class="card-head"><h3>Arus Keuangan</h3><span class="sub-h">Berdasarkan periode dan coach</span></div><div class="card-body" id="analyticsFinance"></div></div><div class="card"><div class="card-head"><h3>Progress Operasional</h3></div><div class="card-body" id="analyticsOperations"></div></div></div>
<div class="stat-grid">
<div class="stat-card"><div class="label">Total Pendapatan</div><div class="value green" id="statTotalRevenue">Rp0</div></div>
<div class="stat-card"><div class="label">Estimasi Laba Bersih</div><div class="value" id="statProfit">Rp0</div></div>
<div class="stat-card"><div class="label">Total Klien</div><div class="value" id="statTotalKlien">0</div></div>
<div class="stat-card"><div class="label">Klien Baru (7 Hari)</div><div class="value green" id="statKlienBaru">0</div></div>
<div class="stat-card"><div class="label">Tiket Terbuka</div><div class="value red" id="statTiketTerbuka">0</div></div>
<div class="stat-card"><div class="label">Pesan Menunggu Balasan</div><div class="value red" id="statPesanMenunggu">0</div></div>
</div>
<div class="card">
<div class="card-head">
<h3>Top Performer Bulan Ini</h3>
<button class="btn-sm" onclick="switchPanel('komisi')">Lihat Performa Tim</button>
</div>
<div class="card-body" id="topPerformerBox"></div>
</div>
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
<div class="note-box">Halaman ini adalah pusat data klien. Klien yang ditambahkan di sini otomatis muncul di Dashboard Client dan Dashboard Coach yang terhubung.</div>
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
              Klien yang statusnya Nonaktif (program sudah berakhir) selama 10 hari berturut-turut otomatis dipindah ke sini dan hilang dari daftar Klien Aktif, Jadwal, dan statistik. Datanya tetap tersimpan — bisa dipulihkan kapan saja, atau dihapus permanen kalau memang sudah tidak diperlukan.
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
<!-- ===================== PANEL: HARGA & PROGRAM ===================== -->
<section class="panel" id="panel-harga">
<div class="sync-note">
<svg fill="none" height="14" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="14"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4M12 8h.01"></path></svg>
            Perubahan harga di sini langsung berlaku di form pendaftaran klien milik Admin CS — satu sumber data untuk semua dashboard.
          </div>
<div class="card">
<div class="card-head">
<h3>Daftar Harga Program N6</h3>
<button class="btn-primary" id="btnTambahProgram" style="margin-top:0;">+ Tambah Program</button>
</div>
<div class="card-body" id="priceListBody"></div>
</div>
</section>
<!-- ===================== PANEL: KOMISI COACH ===================== -->
<section class="panel" id="panel-komisi">
<div class="card"><div class="card-body">
<div class="filter-bar">
<label class="field-label" for="teamMonth">Periode bulan</label><input aria-label="Filter bulan dan tahun" id="teamMonth" type="month"/>
<label class="field-label" for="teamCoach">Coach</label><select id="teamCoach"><option value="">Semua Coach</option></select>
<button class="btn-primary" id="teamPrintPdf" type="button">Simpan PDF</button>
</div><div class="sync-note" id="teamPeriodNote">Memuat rekap...</div>
</div></div>
<div class="stat-grid">
<div class="stat-card"><div class="label">Total Komisi Periode</div><div class="value" id="teamTotal">Rp0</div></div>
<div class="stat-card"><div class="label">Sudah Dibayar</div><div class="value green" id="teamPaid">Rp0</div></div>
<div class="stat-card"><div class="label">Belum Dibayar</div><div class="value red" id="teamUnpaid">Rp0</div></div>
<div class="stat-card"><div class="label">Jumlah Coach</div><div class="value" id="teamCount">0</div></div>
</div>
<div class="card"><div class="card-head"><h3>Performa &amp; Pembayaran Tiap Coach</h3><span class="sub-h">Konfirmasi atau koreksi status pembayaran per coach dan bulan. Semua perubahan status dicatat pada rekap PDF.</span></div>
<div class="card-body" style="overflow-x:auto"><table style="min-width:1060px"><thead><tr><th>Coach</th><th>Klien Aktif</th><th>Sesi Terjadwal</th><th>Pendapatan</th><th>Komisi</th><th>Tiket</th><th>Status</th><th>Waktu Bayar</th><th style="text-align:right;min-width:130px">Aksi</th></tr></thead><tbody id="komisiBody"></tbody></table></div>
</div>
<div class="card"><div class="card-head"><h3>Komisi per Program</h3><span class="sub-h">Atur nominal per sesi untuk periode berikutnya di sini.</span></div><div class="card-body" id="komisiProgramBody"></div></div>
<div class="note-box">Catatan: sesi dihitung dari jadwal mingguan coach pada bulan terpilih, bukan bukti sesi terlaksana. Komisi periode dihitung dari sesi terjadwal klien aktif pada bulan tersebut × tarif komisi per sesi di Harga &amp; Program. Pembayaran yang dikonfirmasi disimpan sebagai rekap tetap. Cetak PDF menggunakan dialog cetak browser (pilih Simpan sebagai PDF). Agar hasil PDF bersih tanpa judul/tanggal/URL bawaan browser di bagian atas dan bawah halaman, pada jendela cetak buka "Lainnya/More settings" lalu matikan opsi "Headers and footers" sebelum menyimpan. Untuk sinkronisasi lintas perangkat diperlukan database bersama.</div>
</section>
<!-- ===================== PANEL: KEUANGAN ===================== -->
<section class="panel" id="panel-keuangan">
<div class="subtabs" data-group="finfilter" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
<button class="subtab-btn active" data-finfilter="all">Bulan Ini</button>
<button class="subtab-btn" data-finfilter="month">Custom Bulan</button>
<input aria-label="Pilih bulan laporan" id="finMonthPicker" style="max-width:170px; display:none;" type="month"/>
<button class="btn-primary" id="finPrintPdf" style="margin:0;align-self:center;" type="button">Simpan PDF</button>
</div>
<div class="sync-note" id="finPeriodLabel">Menampilkan seluruh pendapatan sejak awal.</div>
<div class="stat-grid">
<div class="stat-card"><div class="label">Total Pendapatan</div><div class="value green" id="finRevenue">Rp0</div></div>
<div class="stat-card"><div class="label">Total Komisi Coach</div><div class="value red" id="finCommission">Rp0</div></div>
<div class="stat-card"><div class="label">Total Pengeluaran Lain</div><div class="value red" id="finExpense">Rp0</div></div>
<div class="stat-card"><div class="label">Estimasi Laba Bersih</div><div class="value" id="finProfit">Rp0</div></div>
</div>
<div class="card">
<div class="card-head"><h3>Pendapatan per Kategori Program</h3><span class="sub-h" id="revenueCategoryPeriod"></span></div>
<div class="card-body" id="revenueByCategoryBody"></div>
</div>
<div class="card">
<div class="card-head">
<h3>Catatan Pengeluaran</h3>
<button class="btn-outline" id="btnTambahPengeluaran" style="margin-top:0;">+ Tambah Pengeluaran</button>
</div>
<div class="card-body" style="overflow-x:auto;">
<table>
<thead><tr><th>Tanggal</th><th>Kategori</th><th>Deskripsi</th><th class="right">Nominal</th><th></th></tr></thead>
<tbody id="expenseBody"></tbody>
</table>
</div>
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
<section class="panel" id="panel-akun">
<div id="n6AkunRoot"></div>
</section>
<section class="panel" id="panel-sandi">
<div id="n6SandiRoot"></div>
</section>
</div>
</main>
<!-- BOTTOM NAV (mobile) -->
<nav aria-label="Navigasi utama mobile" class="bottom-nav" id="bottomNav">
<button aria-label="Beranda" class="active" data-panel="beranda"><svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><path d="m3 11 9-8 9 8"></path><path d="M5 10v11h14V10M9 21v-7h6v7"></path></svg><span>Beranda</span></button>
<button aria-label="Klien" data-panel="klien"><svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><circle cx="9" cy="8" r="3"></circle><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 5"></path></svg><span>Klien</span></button>
<button aria-label="Jadwal" data-panel="jadwalklien"><svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><rect height="16" rx="2" width="18" x="3" y="5"></rect><path d="M7 3v4M17 3v4M3 10h18M8 15h3"></path></svg><span>Jadwal</span></button>
<button aria-expanded="false" aria-label="Buka semua menu" id="mobileMoreBtn" type="button"><svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" viewbox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"></path></svg><span>Menu</span><span class="nav-dot" id="navDotTiketMobile" style="display:none">0</span><span class="nav-dot" id="navDotPesanMobile" style="display:none">0</span></button>
<button aria-haspopup="dialog" aria-label="Akun, masuk atau keluar" id="mobileAccountBtn" type="button"><svg fill="none" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 21v-2a8 8 0 0 1 16 0v2"></path></svg><span>Akun</span></button>
</nav>
</div>
</div>
<!-- AKUN MOBILE: Antarmuka sesi lokal, bukan autentikasi server -->
<div aria-labelledby="accountModalTitle" aria-modal="true" class="modal-overlay" id="mobileAccountModal" role="dialog">
<div class="modal-box account-modal-box">
<div class="modal-head"><h3 id="accountModalTitle">Akun</h3><button aria-label="Tutup" class="modal-close" id="closeAccountModal" type="button">✕</button></div>
<div class="modal-body">
<div class="account-identity"><div class="account-avatar"><img alt="Logo N6" src="assets/img/logo-white.png"/></div><div><strong id="accountDisplayName">Owner</strong><div class="account-secondary">Peran: <strong>Owner</strong></div><div class="account-secondary" id="accountStatus">Belum masuk</div></div></div>
<details class="appearance-settings"><summary>⚙ Pengaturan tampilan <span class="settings-chevron">⌄</span></summary><div class="appearance-inner"><p>Pilih tema dashboard. Preferensi disimpan pada perangkat ini.</p><div aria-label="Pilih tema tampilan" class="theme-switch" role="group"><button aria-pressed="true" id="themeDark" type="button">☾ Dark · Hijau</button><button aria-pressed="false" id="themeLight" type="button">☀ Light · Biru</button></div></div></details>
<p class="account-note">Mode pratinjau: login/logout hanya mengubah tampilan sesi. Password tidak disimpan atau diverifikasi. Untuk membatasi akses data, sambungkan autentikasi dan otorisasi Owner pada server.</p>
<form autocomplete="off" id="accountDemoLogin"><label class="field-label" for="accountNameInput">Username</label><input autocomplete="username" id="accountNameInput" maxlength="50" placeholder="Masukkan username" required="" type="text"/><label class="field-label" for="accountPasswordInput" style="margin-top:12px">Password</label><div class="n6-password-wrap"><input autocomplete="current-password" id="accountPasswordInput" minlength="6" placeholder="Masukkan password" required="" type="password"/><button aria-label="Tampilkan password" id="accountPasswordToggle" type="button">Lihat</button></div><div class="n6-login-hint">Pratinjau antarmuka: username dan password belum diverifikasi oleh server.</div><button class="btn-primary account-action" type="submit">Login</button></form>
<button class="btn-outline account-action" hidden="" id="accountDemoLogout" type="button">Logout</button>
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
<div class="full"><label class="field-label">Nama Lengkap</label><input id="fName" placeholder="Nama klien" type="text"/></div>
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
<!-- MODAL: TAMBAH/EDIT PROGRAM -->
<div class="modal-overlay" id="programFormModal" onclick="if(event.target===this) closeProgramForm()">
<div class="modal-box">
<div class="modal-head">
<h3 id="programFormTitle">Tambah Program</h3>
<button class="modal-close" onclick="closeProgramForm()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<input id="pfProgramId" type="hidden"/>
<div class="form-grid">
<div class="full"><label class="field-label">Nama Program</label><input id="pfLabel" placeholder="mis. Private Online" type="text"/></div>
<div><label class="field-label">Kategori</label>
<select id="pfCategory"><option value="Online">Online</option><option value="Offline">Offline</option><option value="Kerja Sama">Kerja Sama</option></select>
</div>
<div id="pfFixedWrap">
<div><label class="field-label">Harga (Rp)</label><input id="pfPrice" min="0" placeholder="mis. 800000" type="number"/></div>
</div>
<div id="pfUnitWrap">
<div><label class="field-label">Keterangan Durasi/Satuan</label><input id="pfUnit" placeholder="mis. 1 Bulan, 3 Bulan, 1x Pertemuan" type="text"/></div>
</div>
<div class="full">
<label class="field-label">Nominal Komisi Coach / Sesi (Rp)</label>
<input id="pfKomisi" min="0" placeholder="mis. 80000" step="5000" type="number"/>
<div style="font-size:11px; color:var(--asphalt); margin-top:5px;">Nominal komisi dipotong dari harga program untuk setiap sesi terjadwal. Total potongan mengikuti jumlah sesi; isi 0 jika tidak ada komisi.</div>
</div>
</div>
<p id="programFormError" style="color:var(--red); font-size:12px; margin-top:10px; display:none;">Nama program dan harga wajib diisi. Komisi tidak boleh melebihi harga.</p>
<button class="btn-primary" id="btnSaveProgram" style="width:100%; margin-top:16px;">Simpan Program</button>
<button class="btn-danger-sm" id="btnDeleteProgram" style="width:100%; margin-top:8px; display:none; padding:10px;">Hapus Program Ini</button>
</div>
</div>
</div>
<!-- MODAL: TAMBAH PENGELUARAN -->
<div class="modal-overlay" id="expenseFormModal" onclick="if(event.target===this) closeExpenseForm()">
<div class="modal-box">
<div class="modal-head">
<h3>Tambah Pengeluaran</h3>
<button class="modal-close" onclick="closeExpenseForm()">
<svg fill="none" height="16" stroke="currentColor" stroke-width="2" viewbox="0 0 24 24" width="16"><path d="M18 6L6 18M6 6l12 12"></path></svg>
</button>
</div>
<div class="modal-body">
<div class="form-grid">
<div><label class="field-label">Tanggal</label><input id="exDate" type="date"/></div>
<div><label class="field-label">Kategori</label>
<select id="exCategory">
<option value="Operasional">Operasional</option>
<option value="Sewa Lapangan">Sewa Lapangan</option>
<option value="Gaji &amp; Honor">Gaji &amp; Honor</option>
<option value="Marketing">Marketing</option>
<option value="Peralatan">Peralatan</option>
<option value="Lainnya">Lainnya</option>
</select>
</div>
<div class="full"><label class="field-label">Deskripsi</label><input id="exDesc" placeholder="mis. Sewa lapangan GBK bulan Sep" type="text"/></div>
<div class="full"><label class="field-label">Nominal (Rp)</label><input id="exAmount" min="0" placeholder="mis. 1500000" type="number"/></div>
</div>
<button class="btn-primary" id="btnSaveExpense" style="width:100%; margin-top:16px;">Simpan Pengeluaran</button>
</div>
</div>
</div>
<div class="toast" id="toast">Tersimpan</div>

<!-- N6: script block moved to js/modules/owner + js/dist/owner.js -->


<!-- N6: script block moved to js/modules/owner + js/dist/owner.js -->


<!-- N6: script block moved to js/modules/owner + js/dist/owner.js -->

<style id="n6-refinement">
/* Calmer desaturated blue, dark stays #1eb682 */
body[data-theme="light"]{--red:#547ca9;--red-dim:#41658e;--red-tint:#edf3f9;--blue:#547ca9;--blue-tint:#edf3f9;--accent:#547ca9;--chart-fill:#658bb5;--chart-point:#547ca9;--chart-area:#658bb526;--paper:#f5f7fa;--line:#e1e8f0;--ink-soft:#eaf0f6;background:#f5f7fa}
body[data-theme="light"] .sidebar{background:#355779;border-color:#355779}
body[data-theme="light"] .side-nav button{color:#e1ebf3}
body[data-theme="light"] .side-nav button.active{background:#f2f6fa;color:#355779;box-shadow:none}
body[data-theme="light"] .side-brand .mark{background:#edf3f9;color:#355779}
body[data-theme="light"] .progress-fill{background:linear-gradient(90deg,#527ba8,#91abc9)}
body[data-theme="light"] .stat-card,body[data-theme="light"] .card{border-color:#e1e8f0;box-shadow:0 5px 20px #3557790b}
body[data-theme="light"] .btn-primary,body[data-theme="light"] .subtab-btn.active{background:#547ca9;border-color:#547ca9}
body[data-theme="light"] .badge.blue{background:#edf3f9;color:#41658e}
body[data-theme="light"] .data-disclaimer,body[data-theme="light"] .sync-note,body[data-theme="light"] .note-box{background:#edf3f9;color:#41658e;border-color:#d6e3ef}
body[data-theme="light"] .bottom-nav button.active{background:#edf3f9;color:#41658e}
body[data-theme="light"] .analytics-controls select{background:#fff;border-color:#dce6ef;color:#28425e}
body[data-theme="light"] .side-nav button:hover{background:#ffffff20}
body[data-theme="light"] .side-nav button.active:hover{background:#fff}
body[data-theme="light"] .account-avatar{background:#547ca9}
.theme-switch{width:100%;justify-content:center;margin-top:8px}.theme-switch button{flex:1;justify-content:center}
.desktop-account-trigger{border:1px solid var(--line);border-radius:10px;background:var(--paper);color:var(--ink);width:36px;height:36px;cursor:pointer;font-size:18px;display:grid;place-items:center}
.appearance-settings{margin:0 0 16px;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--paper)}
.appearance-settings summary{cursor:pointer;padding:13px 15px;font-size:13px;font-weight:700;list-style:none;display:flex;justify-content:space-between}.appearance-settings summary::-webkit-details-marker{display:none}
.appearance-inner{padding:0 14px 15px}.appearance-inner p{font-size:12px;color:var(--asphalt)}
.health-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:16px 0 12px}.health-head h3{font-size:16px}.health-head p{font-size:12px;color:var(--asphalt);margin-top:3px}
.health-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:15px}.health-item{padding:17px;background:var(--white);border:1px solid var(--line);border-radius:12px;min-width:0}.health-item .health-label{font-size:12px;color:var(--asphalt)}.health-item strong{display:block;font-size:21px;margin:8px 0 4px;overflow-wrap:anywhere}.health-item .health-sub{font-size:11px;color:var(--asphalt)}.health-pill{font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;display:inline-block;margin-top:8px}.health-pill.ok{background:#e3f5eb;color:#216a4a}.health-pill.warn{background:#fff2dc;color:#986218}.health-pill.unset{background:var(--paper);color:var(--asphalt)}
.kpi-settings{border:1px solid var(--line);border-radius:12px;background:var(--white);margin-bottom:16px;padding:12px 16px}.kpi-settings summary{cursor:pointer;font-size:12px;font-weight:700;color:var(--asphalt)}.kpi-settings-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:15px 0}.kpi-settings-grid label{font-size:11px;color:var(--asphalt);font-weight:600}.kpi-settings-grid input{margin-top:6px;width:100%}.kpi-actions{display:flex;gap:8px;flex-wrap:wrap}
@media(max-width:900px){.desktop-account-trigger{display:none}.health-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.kpi-settings-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:540px){.health-grid{gap:9px}.health-item{padding:13px}.health-item strong{font-size:18px}.kpi-settings-grid{grid-template-columns:1fr}.health-head{align-items:flex-start}}
</style>

<!-- N6: script block moved to js/modules/owner + js/dist/owner.js -->

<div aria-labelledby="n6PayTitle" aria-modal="true" class="modal-overlay" id="n6PayModal" role="dialog"><div class="modal-box" style="max-width:510px"><div class="modal-head"><h3 id="n6PayTitle">Konfirmasi Pembayaran Coach</h3><button aria-label="Tutup" class="modal-close" id="n6PayClose" type="button">✕</button></div><div class="modal-body"><div id="n6PayDetails"></div><div class="note-box" style="margin-top:16px">Pastikan dana benar-benar sudah ditransfer sebelum menekan konfirmasi. Nominal dan waktu akan dicatat untuk rekap bulan ini.</div><div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap"><button class="btn-outline" id="n6PayCancel" type="button">Batal</button><button class="btn-primary" id="n6PayApprove" type="button">Ya, Sudah Dibayar</button></div></div></div></div>

<!-- N6: script block moved to js/modules/owner + js/dist/owner.js -->

<!-- N6: script block moved to js/modules/owner + js/dist/owner.js -->
`;

export default VIEW_OWNER;
