/**
 * N6 modules - owner / account modal
 *
 * Mengelola modal akun (mobileAccountModal). API-aware:
 * - Mode API aktif: tampilkan info user asli dari localStorage,
 *   tombol Logout melakukan logout API sungguhan.
 * - Mode lokal (API mati): fallback ke sesi pratinjau sessionStorage.
 */

(function () {
  var modal = document.getElementById('mobileAccountModal');
  if (!modal) return;
  var btn = document.getElementById('mobileAccountBtn');
  var form = document.getElementById('accountDemoLogin');
  var logout = document.getElementById('accountDemoLogout');
  var display = document.getElementById('accountDisplayName');
  var roleEl = document.getElementById('accountRoleName');
  var status = document.getElementById('accountStatus');
  var input = document.getElementById('accountNameInput');
  var password = document.getElementById('accountPasswordInput');
  var toggle = document.getElementById('accountPasswordToggle');
  var previewNote = document.getElementById('accountPreviewNote');
  var previewHint = document.getElementById('accountPreviewHint');

  if (toggle && password) {
    toggle.addEventListener('click', function () {
      var show = password.type === 'password';
      password.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'Sembunyikan' : 'Lihat';
      toggle.setAttribute('aria-label', show ? 'Sembunyikan password' : 'Tampilkan password');
    });
  }

  function apiCfg() { return window.N6_API || {}; }
  function apiEnabled() { return apiCfg().enabled === true; }

  function readApiUser() {
    try {
      var k = apiCfg().userKey || 'n6:api:user';
      return JSON.parse(window.localStorage.getItem(k) || 'null');
    } catch (e) { return null; }
  }

  var previewKey = 'n6_preview_account_name';
  function readPreview() {
    try { return window.sessionStorage.getItem(previewKey) || ''; } catch (e) { return ''; }
  }

  var TIER_LABEL = { 0: 'Owner', 1: 'Admin', 2: 'Head Coach', 3: 'Coach', 4: 'Client' };

  function render() {
    if (apiEnabled()) {
      // Sembunyikan semua elemen mode pratinjau
      if (previewNote) previewNote.hidden = true;
      if (previewHint) previewHint.hidden = true;
      var me = readApiUser();
      if (me) {
        display.textContent = me.full_name || me.username || 'Pengguna';
        if (roleEl) roleEl.textContent = TIER_LABEL[me.tier] || me.role || '-';
        status.textContent = 'Masuk sebagai ' + (me.username || '');
        form.hidden = true;
        logout.hidden = false;
        logout.textContent = 'Logout';
      } else {
        display.textContent = 'Tamu';
        if (roleEl) roleEl.textContent = '-';
        status.textContent = 'Belum masuk';
        form.hidden = true; // login lewat gerbang utama, bukan modal
        logout.hidden = true;
      }
      return;
    }
    // Mode lokal: pratinjau sederhana
    if (previewNote) previewNote.hidden = false;
    if (previewHint) previewHint.hidden = false;
    var name = readPreview();
    display.textContent = name || 'Owner';
    if (roleEl) roleEl.textContent = 'Owner';
    status.textContent = name ? 'Masuk · sesi pratinjau' : 'Belum masuk';
    form.hidden = !!name;
    logout.hidden = !name;
  }

  function close() {
    modal.classList.remove('show');
    if (btn) { btn.classList.remove('account-open'); btn.setAttribute('aria-expanded', 'false'); }
  }

  if (btn) {
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', function () {
      render();
      modal.classList.add('show');
      btn.classList.add('account-open');
      btn.setAttribute('aria-expanded', 'true');
    });
  }
  var closeBtn = document.getElementById('closeAccountModal');
  if (closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (apiEnabled()) return; // login via gerbang utama
    var name = input.value.trim();
    if (!name || password.value.length < 6) return;
    try { window.sessionStorage.setItem(previewKey, name); } catch (err) {}
    password.value = '';
    password.type = 'password';
    toggle.textContent = 'Lihat';
    render();
  });

  logout.addEventListener('click', function () {
    if (apiEnabled()) {
      // Logout API sungguhan: hapus token lalu muat ulang ke gerbang login
      try {
        var cfg = apiCfg();
        window.localStorage.removeItem(cfg.tokenKey || 'n6:api:token');
        window.localStorage.removeItem(cfg.refreshKey || 'n6:api:refresh');
        window.localStorage.removeItem(cfg.userKey || 'n6:api:user');
      } catch (err) {}
      window.location.replace(window.location.pathname);
      return;
    }
    try { window.sessionStorage.removeItem(previewKey); } catch (err) {}
    input.value = '';
    password.value = '';
    render();
  });

  render();
})();
