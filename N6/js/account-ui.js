/**
 * N6 - Kelola Anggota (owner) & Ganti Password (semua peran)
 *
 * Classic script (bukan ES module) yang dimuat setelah role bundle via
 * ROLE_ASSETS di js/core/bundles.js. Sengaja classic agar bisa memakai
 * pola yang sama dengan bundle: DOM sudah terpasang, tinggal inisialisasi.
 *
 * Konfigurasi API dibaca dari window.N6_API yang dipasang js/app.js saat boot:
 *   { enabled, base, tokenKey }
 * - enabled: false (mode lokal) -> panel menampilkan pemberitahuan saja.
 * - base: "https://.../api/n6/v1" (tanpa trailing slash)
 *
 * Endpoint yang dipakai (semuanya sudah ada di unified-backend):
 *   GET    accounts            daftar akun (halaman, limit default 50)
 *   POST   accounts            tambah akun {username, full_name, password, email?, tier?}
 *                              tier default di server = TIER_MAX (paling bawah)
 *   PUT    accounts/{id}/tier  ubah tier {tier: 1..4} (owner only)
 *   PATCH  accounts/{id}       {is_active} untuk mengaktifkan kembali
 *   DELETE accounts/{id}       nonaktifkan akun (owner only)
 *   PUT    auth/password       ganti password sendiri {current_password, new_password}
 */
(function () {
  'use strict';

  var TIER_LABEL = { 0: 'Owner', 1: 'Admin', 2: 'Head Coach', 3: 'Coach', 4: 'Client' };
  var TIER_CHOICES = [1, 2, 3, 4]; // tier 0 tidak bisa diberikan lewat API (by design)

  function cfg() { return window.N6_API || {}; }
  function apiBase() { return String(cfg().base || '').replace(/\/+$/, ''); }
  function token() {
    try { return window.localStorage.getItem(cfg().tokenKey || 'n6:api:token'); }
    catch (e) { return null; }
  }
  function apiReady() { return cfg().enabled === true && !!token(); }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = (s === null || s === undefined) ? '' : String(s);
    return d.innerHTML;
  }

  async function api(path, opts) {
    opts = opts || {};
    var res = await fetch(apiBase() + '/' + String(path).replace(/^\/+/, ''), {
      method: opts.method || 'GET',
      headers: Object.assign(
        { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() },
        opts.headers || {}
      ),
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    var data = null;
    try { data = await res.json(); } catch (e) { /* body kosong / bukan JSON */ }
    if (!res.ok) {
      var msg = (data && (data.detail || data.message)) || ('HTTP ' + res.status);
      var err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function noticeHtml(text) {
    return '<div class="n6-card"><div class="card-body"><p class="account-note">' +
      esc(text) + '</p></div></div>';
  }

  function toast(msg, isErr) {
    if (typeof window.showToast === 'function') { window.showToast(msg); return; }
    alert(msg);
  }

  /* ================= GANTI PASSWORD (semua peran) ================= */

  function initGantiPassword() {
    var root = document.getElementById('n6SandiRoot');
    if (!root) {
      var panel = document.getElementById('panel-sandi');
      if (!panel) return;
      root = panel;
    }
    if (!apiReady()) {
      root.innerHTML = noticeHtml(
        'Ganti password membutuhkan koneksi ke server (mode API). ' +
        'Aktifkan API dan masuk terlebih dahulu.');
      return;
    }
    root.innerHTML =
      '<div class="crumb">Akun</div>' +
      '<div class="title" style="margin-bottom:16px">Ganti Password</div>' +
      '<div class="n6-card" style="max-width:520px"><div class="card-body">' +
      '<form id="n6SandiForm" autocomplete="off">' +
      '<label class="field-label">Password saat ini</label>' +
      '<input type="password" id="n6SandiLama" class="n6-login__input" style="width:100%;margin-bottom:12px" autocomplete="current-password" required minlength="1"/>' +
      '<label class="field-label">Password baru</label>' +
      '<input type="password" id="n6SandiBaru" class="n6-login__input" style="width:100%;margin-bottom:12px" autocomplete="new-password" required minlength="8"/>' +
      '<label class="field-label">Ulangi password baru</label>' +
      '<input type="password" id="n6SandiBaru2" class="n6-login__input" style="width:100%;margin-bottom:16px" autocomplete="new-password" required minlength="8"/>' +
      '<div id="n6SandiMsg" class="account-note" style="margin-bottom:12px"></div>' +
      '<button type="submit" class="btn-primary">Simpan Password Baru</button>' +
      '</form></div></div>';

    var form = document.getElementById('n6SandiForm');
    var msg = document.getElementById('n6SandiMsg');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var lama = document.getElementById('n6SandiLama').value;
      var baru = document.getElementById('n6SandiBaru').value;
      var baru2 = document.getElementById('n6SandiBaru2').value;
      msg.textContent = '';
      if (baru !== baru2) { msg.textContent = 'Ulangi password baru tidak sama.'; return; }
      if (baru.length < 8) { msg.textContent = 'Password baru minimal 8 karakter.'; return; }
      try {
        await api('auth/password', {
          method: 'PUT',
          body: { current_password: lama, new_password: baru },
        });
        msg.textContent = 'Password berhasil diganti.';
        form.reset();
        toast('Password berhasil diganti.');
      } catch (err) {
        msg.textContent = 'Gagal: ' + err.message;
      }
    });
  }

  /* ================= KELOLA ANGGOTA (owner) ================= */

  var akunState = { items: [], total: 0, offset: 0, limit: 50, loading: false };

  function tierBadge(tier) {
    return '<span class="n6-tier-badge">' + esc(TIER_LABEL[tier] || ('Tier ' + tier)) + '</span>';
  }

  function tierSelectHtml(acc) {
    if (acc.tier === 0) return tierBadge(0) + ' <span class="account-note">(tidak bisa diubah)</span>';
    var opts = TIER_CHOICES.map(function (t) {
      return '<option value="' + t + '"' + (t === acc.tier ? ' selected' : '') + '>' +
        esc(TIER_LABEL[t]) + '</option>';
    }).join('');
    return '<select class="n6-tier-select" data-akun-tier="' + acc.id + '">' + opts + '</select>';
  }

  function renderAkunTable() {
    var tbody = document.getElementById('n6AkunBody');
    if (!tbody) return;
    if (!akunState.items.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted,#888)">Belum ada anggota.</td></tr>';
      return;
    }
    tbody.innerHTML = akunState.items.map(function (a) {
      var status = a.is_active
        ? '<span style="color:#3ed3a0">Aktif</span>'
        : '<span style="color:#e5484d">Nonaktif</span>';
      var aksi = a.is_active
        ? '<button class="btn-outline btn-sm" data-akun-off="' + a.id + '">Nonaktifkan</button>'
        : '<button class="btn-outline btn-sm" data-akun-on="' + a.id + '">Aktifkan</button>';
      // akun owner sendiri tidak bisa dinonaktifkan dari sini
      var selfRow = false;
      try {
        var me = JSON.parse(window.localStorage.getItem((window.N6_API || {}).userKey || 'n6:api:user') || 'null');
        selfRow = me && me.id === a.id;
      } catch (e) {}
      return '<tr>' +
        '<td><b>' + esc(a.username) + '</b><br><span class="account-note">' + esc(a.full_name) + '</span></td>' +
        '<td>' + esc(a.email || '-') + '</td>' +
        '<td>' + tierSelectHtml(a) + '</td>' +
        '<td>' + status + '</td>' +
        '<td style="text-align:right">' + (selfRow ? '<span class="account-note">akun ini</span>' : aksi) + '</td>' +
        '</tr>';
    }).join('');

    tbody.querySelectorAll('[data-akun-tier]').forEach(function (sel) {
      sel.addEventListener('change', async function () {
        var id = sel.getAttribute('data-akun-tier');
        var tier = parseInt(sel.value, 10);
        if (!confirm('Ubah tier akun ini menjadi ' + TIER_LABEL[tier] + '?')) { loadAkun(); return; }
        try {
          await api('accounts/' + id + '/tier', { method: 'PUT', body: { tier: tier } });
          toast('Tier berhasil diubah.');
          loadAkun();
        } catch (err) { toast('Gagal ubah tier: ' + err.message); loadAkun(); }
      });
    });
    tbody.querySelectorAll('[data-akun-off]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-akun-off');
        if (!confirm('Nonaktifkan akun ini? Ia tidak bisa masuk sampai diaktifkan kembali.')) return;
        try {
          await api('accounts/' + id, { method: 'DELETE' });
          toast('Akun dinonaktifkan.');
          loadAkun();
        } catch (err) { toast('Gagal: ' + err.message); }
      });
    });
    tbody.querySelectorAll('[data-akun-on]').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        var id = btn.getAttribute('data-akun-on');
        try {
          await api('accounts/' + id, { method: 'PATCH', body: { is_active: true } });
          toast('Akun diaktifkan kembali.');
          loadAkun();
        } catch (err) { toast('Gagal: ' + err.message); }
      });
    });

    var info = document.getElementById('n6AkunInfo');
    if (info) {
      var mulai = akunState.total ? (akunState.offset + 1) : 0;
      var sampai = Math.min(akunState.offset + akunState.items.length, akunState.total);
      info.textContent = 'Menampilkan ' + mulai + '-' + sampai + ' dari ' + akunState.total + ' akun';
    }
    var prev = document.getElementById('n6AkunPrev');
    var next = document.getElementById('n6AkunNext');
    if (prev) prev.disabled = akunState.offset <= 0;
    if (next) next.disabled = (akunState.offset + akunState.items.length) >= akunState.total;
  }

  async function loadAkun() {
    if (akunState.loading) return;
    akunState.loading = true;
    try {
      var data = await api('accounts?limit=' + akunState.limit + '&offset=' + akunState.offset);
      akunState.items = data.items || [];
      akunState.total = data.total || 0;
    } catch (err) {
      toast('Gagal memuat daftar akun: ' + err.message);
      akunState.items = [];
      akunState.total = 0;
    }
    akunState.loading = false;
    renderAkunTable();
  }

  function initKelolaAnggota() {
    var panel = document.getElementById('panel-akun');
    if (!panel) return; // bukan peran owner
    var root = document.getElementById('n6AkunRoot') || panel;
    if (!apiReady()) {
      root.innerHTML = noticeHtml(
        'Kelola Anggota membutuhkan koneksi ke server (mode API). ' +
        'Aktifkan API dan masuk sebagai Owner terlebih dahulu.');
      return;
    }
    root.innerHTML =
      '<div class="crumb">Owner</div>' +
      '<div class="title" style="margin-bottom:16px">Kelola Anggota</div>' +
      '<div class="n6-card" style="margin-bottom:16px"><div class="card-body">' +
      '<div class="title" style="font-size:15px;margin-bottom:12px">Tambah Anggota Baru</div>' +
      '<form id="n6AkunAddForm" autocomplete="off"><div class="form-grid">' +
      '<div><label class="field-label">Username *</label><input id="n6AkunUsername" required minlength="3" maxlength="64" placeholder="cth: coach.budi"/></div>' +
      '<div><label class="field-label">Nama lengkap *</label><input id="n6AkunNama" required maxlength="160" placeholder="cth: Budi Santoso"/></div>' +
      '<div><label class="field-label">Password awal *</label><input id="n6AkunPass" type="password" required minlength="8" autocomplete="new-password"/></div>' +
      '<div><label class="field-label">Tier</label><select id="n6AkunTier">' +
      TIER_CHOICES.map(function (t) {
        return '<option value="' + t + '"' + (t === 4 ? ' selected' : '') + '>' + esc(TIER_LABEL[t]) + '</option>';
      }).join('') +
      '</select></div>' +
      '<div class="full"><label class="field-label">Email (opsional)</label><input id="n6AkunEmail" type="email" maxlength="255" placeholder="nama@contoh.id"/></div>' +
      '</div>' +
      '<div id="n6AkunAddMsg" class="account-note" style="margin:8px 0"></div>' +
      '<button type="submit" class="btn-primary">Tambah Anggota</button> ' +
      '<span class="account-note">Tier default: Client (paling bawah).</span>' +
      '</form></div></div>' +
      '<div class="n6-card"><div class="card-body">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
      '<div class="title" style="font-size:15px">Daftar Akun</div>' +
      '<button class="btn-outline btn-sm" id="n6AkunReload">Muat ulang</button>' +
      '</div>' +
      '<div style="overflow-x:auto"><table style="min-width:720px"><thead><tr>' +
      '<th>Akun</th><th>Email</th><th>Tier</th><th>Status</th>' +
      '<th style="text-align:right">Aksi</th>' +
      '</tr></thead><tbody id="n6AkunBody"></tbody></table></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">' +
      '<span class="account-note" id="n6AkunInfo"></span>' +
      '<span><button class="btn-outline btn-sm" id="n6AkunPrev">&larr; Sebelumnya</button> ' +
      '<button class="btn-outline btn-sm" id="n6AkunNext">Berikutnya &rarr;</button></span>' +
      '</div></div></div>';

    document.getElementById('n6AkunReload').addEventListener('click', loadAkun);
    document.getElementById('n6AkunPrev').addEventListener('click', function () {
      if (akunState.offset > 0) { akunState.offset -= akunState.limit; loadAkun(); }
    });
    document.getElementById('n6AkunNext').addEventListener('click', function () {
      akunState.offset += akunState.limit; loadAkun();
    });

    document.getElementById('n6AkunAddForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var msg = document.getElementById('n6AkunAddMsg');
      msg.textContent = '';
      var body = {
        username: document.getElementById('n6AkunUsername').value.trim(),
        full_name: document.getElementById('n6AkunNama').value.trim(),
        password: document.getElementById('n6AkunPass').value,
        tier: parseInt(document.getElementById('n6AkunTier').value, 10),
      };
      var email = document.getElementById('n6AkunEmail').value.trim();
      if (email) body.email = email;
      try {
        var created = await api('accounts', { method: 'POST', body: body });
        msg.textContent = 'Anggota "' + created.username + '" ditambahkan dengan tier ' +
          (TIER_LABEL[created.tier] || created.tier) + '.';
        e.target.reset();
        document.getElementById('n6AkunTier').value = '4';
        akunState.offset = 0;
        loadAkun();
      } catch (err) {
        msg.textContent = 'Gagal: ' + err.message;
      }
    });

    loadAkun();
  }

  /* ================= judul panel (bundle tidak mengenal panel baru) ================= */

  function fixTitles() {
    var titles = { akun: 'Kelola Anggota', sandi: 'Ganti Password' };
    document.querySelectorAll('.side-nav button[data-panel], .bottom-nav button[data-panel]').forEach(function (btn) {
      var key = btn.getAttribute('data-panel');
      if (titles[key]) {
        btn.addEventListener('click', function () {
          var t = document.getElementById('pageTitle');
          if (t) t.textContent = titles[key];
        });
      }
    });
  }

  /* ================= boot ================= */

  /* ============ CLIENT: suntik ke dropdown akun (bundle render #root) ============ */

  function initClientMenu() {
    var menu = document.getElementById('clientAccountMenu');
    if (!menu || document.getElementById('n6ClientSandiBtn')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'n6ClientSandiBtn';
    btn.className = 'theme-picker';
    btn.style.cssText = 'width:100%;text-align:left;';
    btn.innerHTML = '<span>🔑 &nbsp;Ganti Password</span>';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      openSandiDialog();
    });
    var foot = menu.querySelector('.account-menu-foot');
    if (foot) menu.insertBefore(btn, foot);
    else menu.appendChild(btn);
  }

  function openSandiDialog() {
    closeSandiDialog();
    var ov = document.createElement('div');
    ov.id = 'n6SandiDialog';
    ov.className = 'modal-overlay';
    ov.style.display = 'flex';
    ov.innerHTML =
      '<div class="modal-box" role="dialog" aria-label="Ganti Password">' +
      '<div class="modal-head"><h3>Ganti Password</h3>' +
      '<button class="modal-close" id="n6SandiDlgClose" type="button">✕</button></div>' +
      '<div class="modal-body"><div id="n6SandiDlgRoot"></div></div></div>';
    document.body.appendChild(ov);
    document.getElementById('n6SandiDlgClose').addEventListener('click', closeSandiDialog);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeSandiDialog(); });
    // pakai form yang sama: pindahkan root sementara
    var holder = document.createElement('div');
    holder.id = 'n6SandiRoot';
    document.getElementById('n6SandiDlgRoot').appendChild(holder);
    initGantiPassword();
  }

  function closeSandiDialog() {
    var ov = document.getElementById('n6SandiDialog');
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
  }

  function init() {
    // panel mungkin belum ada bila view diganti; tunggu sebentar
    if (!document.getElementById('panel-sandi') && !document.getElementById('panel-akun')) {
      // peran client: menu akun di-render oleh bundle
      var tries = 0;
      var t = setInterval(function () {
        tries++;
        initClientMenu();
        if (document.getElementById('n6ClientSandiBtn') || tries > 40) clearInterval(t);
      }, 250);
      return;
    }
    initGantiPassword();
    initKelolaAnggota();
    fixTitles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
