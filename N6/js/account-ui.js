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

  /* ===== N6 Account UI: memakai komponen bawaan tema (card, badge, btn) ===== */
  var ACCOUNT_CSS = [
    '.n6a-wrap{max-width:860px}',
    '.n6a-stat-note{font-size:12px;color:var(--asphalt);margin-bottom:16px}',
    '.n6a-pw-meter{height:6px;border-radius:4px;background:var(--line,#eee);margin:8px 0 14px;overflow:hidden}',
    '.n6a-pw-fill{height:100%;width:0;border-radius:4px;transition:width .25s ease,background .25s ease}',
    '.n6a-pw-row{display:flex;align-items:center;gap:8px;margin-bottom:14px}',
    '.n6a-pw-row input{flex:1}',
    '.n6a-eye{background:none;border:1px solid var(--line);border-radius:6px;cursor:pointer;padding:9px 11px;font-size:14px;line-height:1;color:var(--asphalt)}',
    '.n6a-eye:hover{border-color:var(--ink);color:var(--ink)}',
    '.n6a-msg{font-size:12.5px;margin:10px 0;min-height:18px;font-weight:600}',
    '.n6a-msg.ok{color:var(--green,#16a34a)}.n6a-msg.err{color:var(--red,#dc2626)}',
    '.n6a-tier-sel{font-size:12px;padding:6px 8px;border-radius:6px;max-width:150px}',
    '.n6a-row-user{display:flex;align-items:center;gap:12px}',
    '.n6a-avatar{width:36px;height:36px;border-radius:50%;background:var(--ink);color:var(--white);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex:none}',
    '.n6a-uname{font-weight:700;font-size:13.5px}',
    '.n6a-fname{font-size:12px;color:var(--asphalt);margin-top:2px}',
    '.n6a-actions{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}',
    '.n6a-empty{padding:40px 20px;text-align:center;color:var(--asphalt);font-size:13px}',
    '.n6a-pager{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-top:1px solid #F0EEE7;flex-wrap:wrap;gap:8px}',
    '.n6a-wrap input[type=password],.n6a-wrap input[type=email],.n6a-wrap input[type=text],.n6a-wrap select{width:100%;border:1px solid var(--line);border-radius:6px;padding:10px 12px;font-size:13.5px;background:var(--white);color:var(--ink);box-sizing:border-box}',
    '.n6a-wrap input:focus,.n6a-wrap select:focus{outline:none;border-color:var(--ink)}',
    '.n6a-wrap .field-label{margin-bottom:6px}',
    '@media(max-width:640px){.n6a-wrap{max-width:none}}',
  ].join('\n');
  function injectAccountCss() {
    if (document.getElementById('n6akun-css')) return;
    var st = document.createElement('style');
    st.id = 'n6akun-css';
    st.textContent = ACCOUNT_CSS;
    document.head.appendChild(st);
  }

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
    return '<div class="note-box">' + esc(text) + '</div>';
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
      '<div class="n6a-wrap">' +
      '<div class="note-box">Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol ' +
      'dengan panjang minimal 8 karakter agar password sulit ditebak.</div>' +
      '<div class="card"><div class="card-head"><h3>Ganti Password</h3></div><div class="card-body">' +
      '<form id="n6SandiForm" autocomplete="off">' +
      '<label class="field-label">Password saat ini</label>' +
      '<div class="n6a-pw-row"><input type="password" id="n6SandiLama" autocomplete="current-password" required placeholder="Masukkan password lama Anda"/>' +
      '<button type="button" class="n6a-eye" data-eye="n6SandiLama" title="Tampilkan/sembunyikan">&#128065;</button></div>' +
      '<label class="field-label">Password baru</label>' +
      '<div class="n6a-pw-row" style="margin-bottom:0"><input type="password" id="n6SandiBaru" autocomplete="new-password" required minlength="8" placeholder="Minimal 8 karakter"/>' +
      '<button type="button" class="n6a-eye" data-eye="n6SandiBaru" title="Tampilkan/sembunyikan">&#128065;</button></div>' +
      '<div class="n6a-pw-meter"><div class="n6a-pw-fill" id="n6PwFill"></div></div>' +
      '<div class="n6a-stat-note" id="n6PwHint">Kekuatan password akan muncul di sini.</div>' +
      '<label class="field-label">Ulangi password baru</label>' +
      '<div class="n6a-pw-row"><input type="password" id="n6SandiBaru2" autocomplete="new-password" required minlength="8" placeholder="Ketik ulang password baru"/>' +
      '<button type="button" class="n6a-eye" data-eye="n6SandiBaru2" title="Tampilkan/sembunyikan">&#128065;</button></div>' +
      '<div id="n6SandiMsg" class="n6a-msg"></div>' +
      '<button type="submit" class="btn-primary">Simpan Password Baru</button>' +
      '</form></div></div></div>';

    var form = document.getElementById('n6SandiForm');
    var msg = document.getElementById('n6SandiMsg');
    var pwFill = document.getElementById('n6PwFill');
    var pwHint = document.getElementById('n6PwHint');
    var baruInput = document.getElementById('n6SandiBaru');

    // toggle tampil/sembunyi
    root.querySelectorAll('[data-eye]').forEach(function (b) {
      b.addEventListener('click', function () {
        var inp = document.getElementById(b.getAttribute('data-eye'));
        if (!inp) return;
        inp.type = inp.type === 'password' ? 'text' : 'password';
      });
    });

    // indikator kekuatan password
    baruInput.addEventListener('input', function () {
      var v = baruInput.value, score = 0;
      if (v.length >= 8) score++;
      if (v.length >= 12) score++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      var pct = Math.min(100, score * 20);
      var colors = ['#e5e5e5', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
      var labels = ['Terlalu pendek', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat', 'Sangat kuat'];
      pwFill.style.width = pct + '%';
      pwFill.style.background = colors[score];
      pwHint.textContent = v ? ('Kekuatan: ' + labels[score]) : 'Kekuatan password akan muncul di sini.';
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var lama = document.getElementById('n6SandiLama').value;
      var baru = baruInput.value;
      var baru2 = document.getElementById('n6SandiBaru2').value;
      msg.className = 'n6a-msg';
      msg.textContent = '';
      if (baru !== baru2) { msg.className = 'n6a-msg err'; msg.textContent = 'Ulangi password baru tidak sama.'; return; }
      if (baru.length < 8) { msg.className = 'n6a-msg err'; msg.textContent = 'Password baru minimal 8 karakter.'; return; }
      try {
        await api('auth/password', {
          method: 'PUT',
          body: { current_password: lama, new_password: baru },
        });
        msg.className = 'n6a-msg ok';
        msg.textContent = 'Password berhasil diganti.';
        form.reset();
        pwFill.style.width = '0';
        pwHint.textContent = 'Kekuatan password akan muncul di sini.';
        toast('Password berhasil diganti.');
      } catch (err) {
        msg.className = 'n6a-msg err';
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
    return '<select class="n6a-tier-sel" data-akun-tier="' + acc.id + '">' + opts + '</select>';
  }

  function tierBadgeCls(tier) {
    // pakai badge bawaan tema: owner=red, admin=blue, headcoach=amber, coach=neutral, client=neutral
    if (tier === 0) return 'red';
    if (tier === 1) return 'blue';
    if (tier === 2) return 'amber';
    return 'neutral';
  }

  function avatarHtml(name) {
    var initials = String(name || '?').trim().split(/\s+/).map(function (w) {
      return w.charAt(0);
    }).join('').slice(0, 2).toUpperCase() || '?';
    return '<div class="n6a-avatar">' + esc(initials) + '</div>';
  }

  function renderAkunTable() {
    var tbody = document.getElementById('n6AkunBody');
    if (!tbody) return;
    if (!akunState.items.length) {
      tbody.innerHTML = '<tr><td colspan="4"><div class="n6a-empty">Belum ada anggota.<br>Tambahkan anggota pertama lewat form di atas.</div></td></tr>';
    } else {
      tbody.innerHTML = akunState.items.map(function (a) {
        var status = a.is_active
          ? '<span class="badge green">Aktif</span>'
          : '<span class="badge red">Nonaktif</span>';
        var aksi = a.is_active
          ? '<button class="btn-danger-sm" data-akun-off="' + a.id + '">Nonaktifkan</button>'
          : '<button class="btn-sm" data-akun-on="' + a.id + '">Aktifkan</button>';
        var selfRow = false;
        try {
          var me = JSON.parse(window.localStorage.getItem((window.N6_API || {}).userKey || 'n6:api:user') || 'null');
          selfRow = me && me.id === a.id;
        } catch (e) {}
        return '<tr>' +
          '<td style="padding-left:20px"><div class="n6a-row-user">' + avatarHtml(a.full_name || a.username) +
          '<div><div class="n6a-uname">' + esc(a.username) + '</div>' +
          '<div class="n6a-fname">' + esc(a.full_name || '') +
          (a.email ? ' &middot; ' + esc(a.email) : '') + '</div></div></div></td>' +
          '<td><span class="badge ' + tierBadgeCls(a.tier) + '">' + esc(TIER_LABEL[a.tier] || a.tier) + '</span>' +
          (a.tier === 0
            ? '<div class="n6a-fname" style="margin-top:6px">Tidak bisa diubah</div>'
            : '<div style="margin-top:6px">' + tierSelectHtml(a) + '</div>') + '</td>' +
          '<td>' + status + '</td>' +
          '<td class="right" style="padding-right:20px"><div class="n6a-actions">' +
          (selfRow ? '<span class="n6a-fname">akun ini</span>' : aksi) + '</div></td>' +
          '</tr>';
      }).join('');
    }

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
    var page = document.getElementById('n6AkunPage');
    if (page) {
      var totalPage = Math.max(1, Math.ceil(akunState.total / akunState.limit));
      var curPage = Math.floor(akunState.offset / akunState.limit) + 1;
      page.textContent = 'Halaman ' + curPage + ' dari ' + totalPage;
    }
    var prev = document.getElementById('n6AkunPrev');
    var next = document.getElementById('n6AkunNext');
    if (prev) prev.disabled = akunState.offset <= 0;
    if (next) next.disabled = (akunState.offset + akunState.items.length) >= akunState.total;
  }

  async function updateAkunStats() {
    try {
      var data = await api('accounts?limit=1000&offset=0');
      var items = data.items || [];
      var aktif = items.filter(function (a) { return a.is_active; }).length;
      var tim = items.filter(function (a) { return a.is_active && a.tier >= 1 && a.tier <= 3; }).length;
      var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
      set('n6StatTotal', items.length);
      set('n6StatAktif', aktif);
      set('n6StatNonaktif', items.length - aktif);
      set('n6StatTim', tim);
    } catch (e) {}
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
    updateAkunStats();
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
      '<div class="stat-grid" id="n6AkunStats">' +
      '<div class="stat-card"><div class="label">Total Anggota</div><div class="value" id="n6StatTotal">-</div></div>' +
      '<div class="stat-card"><div class="label">Aktif</div><div class="value green" id="n6StatAktif">-</div></div>' +
      '<div class="stat-card"><div class="label">Nonaktif</div><div class="value red" id="n6StatNonaktif">-</div></div>' +
      '<div class="stat-card"><div class="label">Admin & Coach</div><div class="value" id="n6StatTim">-</div></div>' +
      '</div>' +
      '<div class="card"><div class="card-head"><div><h3>Tambah Anggota Baru</h3>' +
      '<div class="sub-h">Akun baru otomatis mendapat tier Client (paling bawah). Tier bisa diubah setelah dibuat.</div></div></div>' +
      '<div class="card-body">' +
      '<form id="n6AkunAddForm" autocomplete="off"><div class="form-grid">' +
      '<div><label class="field-label">Username *</label><input id="n6AkunUsername" type="text" required minlength="3" maxlength="64" placeholder="cth: coach.budi"/></div>' +
      '<div><label class="field-label">Nama lengkap *</label><input id="n6AkunNama" type="text" required maxlength="160" placeholder="cth: Budi Santoso"/></div>' +
      '<div><label class="field-label">Password awal *</label><input id="n6AkunPass" type="password" required minlength="8" autocomplete="new-password" placeholder="Minimal 8 karakter"/></div>' +
      '<div><label class="field-label">Tier awal</label><select id="n6AkunTier">' +
      TIER_CHOICES.map(function (t) {
        return '<option value="' + t + '"' + (t === 4 ? ' selected' : '') + '>' + esc(TIER_LABEL[t]) + '</option>';
      }).join('') +
      '</select></div>' +
      '<div class="full"><label class="field-label">Email (opsional)</label><input id="n6AkunEmail" type="email" maxlength="255" placeholder="nama@contoh.id"/></div>' +
      '</div>' +
      '<div id="n6AkunAddMsg" class="n6a-msg"></div>' +
      '<button type="submit" class="btn-primary">Tambah Anggota</button>' +
      '</form></div></div>' +
      '<div class="card"><div class="card-head"><div><h3>Daftar Anggota</h3>' +
      '<div class="sub-h" id="n6AkunInfo">Memuat...</div></div>' +
      '<button class="btn-outline btn-sm" id="n6AkunReload">Muat ulang</button></div>' +
      '<div class="card-body" style="padding:0"><div style="overflow-x:auto">' +
      '<table><thead><tr>' +
      '<th style="padding-left:20px">Anggota</th><th>Tier</th><th>Status</th>' +
      '<th class="right" style="padding-right:20px">Aksi</th>' +
      '</tr></thead><tbody id="n6AkunBody"></tbody></table></div>' +
      '<div class="n6a-pager">' +
      '<span class="n6a-stat-note" style="margin:0" id="n6AkunPage"></span>' +
      '<span><button class="btn-sm" id="n6AkunPrev">&larr; Sebelumnya</button> ' +
      '<button class="btn-sm" id="n6AkunNext">Berikutnya &rarr;</button></span>' +
      '</div></div></div>';

    document.getElementById('n6AkunReload').addEventListener('click', loadAkun);
    document.getElementById('n6AkunPrev').addEventListener('click', function () {
      if (akunState.offset > 0) { akunState.offset -= akunState.limit; loadAkun(); }
    });
    document.getElementById('n6AkunNext').addEventListener('click', function () {
      if (akunState.offset + akunState.limit < akunState.total) { akunState.offset += akunState.limit; loadAkun(); }
    });

    document.getElementById('n6AkunAddForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var msg = document.getElementById('n6AkunAddMsg');
      msg.className = 'n6a-msg';
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
        msg.className = 'n6a-msg ok';
        msg.textContent = 'Anggota "' + created.username + '" ditambahkan sebagai ' +
          (TIER_LABEL[created.tier] || created.tier) + '.';
        e.target.reset();
        document.getElementById('n6AkunTier').value = '4';
        akunState.offset = 0;
        loadAkun();
      } catch (err) {
        msg.className = 'n6a-msg err';
        msg.textContent = 'Gagal: ' + err.message;
      }
    });

    loadAkun();
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
    injectAccountCss();
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
