/* ============================= TIERS =============================
   Sistem akses menu berbasis tier.
   - tier 0 (Owner)      : SEMUA menu.
   - tier 1/2/3          : subset menu (dihitung server).

   SATU-SATUNYA sumber kebenaran = backend: GET /auth/me mengembalikan
   {tier, name, roleLabel, menus, permissions} yang dihitung server dari
   tier user di DB (bukan dari input client). File ini TIDAK lagi memuat
   file tier JSON lokal dan TIDAK menyimpan keputusan "tier X boleh apa".

   FALLBACK_TIER_0 di bawah hanya dipakai bila backend tak terjangkau /
   mode lokal (USE_API=false) — perangkat sendiri = pemiliknya.
   ================================================================ */
const TierAccess = (() => {
  const FALLBACK_TIER_0 = {
    tier: 0,
    name: 'Owner',
    roleLabel: 'Super Admin',
    description: 'Pemilik — akses penuh seluruh menu dan pengaturan.',
    menus: ['dashboard', 'transaksi', 'penjualan', 'pembelian', 'kasbank', 'jurnal', 'persediaan', 'asettetap', 'kontak', 'laporan', 'pajak', 'perusahaan', 'pengaturan', 'akun', 'sandi'],
    permissions: { view: true, create: true, edit: true, del: true, expo: true, manageUsers: true, manageSettings: true },
  };

  let def = FALLBACK_TIER_0;

  // Normalisasi response GET /auth/me agar bentuknya selalu lengkap.
  function normalize(me) {
    return {
      tier: me.tier,
      name: me.name || ('Tier ' + me.tier),
      roleLabel: me.roleLabel || me.name || ('Tier ' + me.tier),
      description: me.description || '',
      menus: Array.isArray(me.menus) ? me.menus.slice() : [],
      permissions: (me.permissions && typeof me.permissions === 'object') ? me.permissions : {},
    };
  }

  async function init() {
    // Mode API: hak akses selalu dari backend.
    if (typeof ApiClient !== 'undefined' && ApiClient.enabled()) {
      try {
        const me = await ApiClient.getAccount(); // GET /auth/me
        if (me && Array.isArray(me.menus)) { def = normalize(me); return def; }
      } catch (e) { /* backend tak terjangkau / belum login: pakai fallback */ }
    }
    def = FALLBACK_TIER_0;
    return def;
  }

  function allowedRoutes() { return def.menus.slice(); }

  // NAV didefinisikan di core-shell.js; fungsi ini dipanggil saat render (runtime).
  function visibleNav() {
    if (typeof NAV === 'undefined') return [];
    return NAV.filter((n) => def.menus.indexOf(n.r) !== -1);
  }

  function canAccess(route) { return def.menus.indexOf(route) !== -1; }
  function can(perm) { return !!(def.permissions && def.permissions[perm]); }
  function roleLabel() { return def.roleLabel || def.name || 'Pengguna'; }
  function current() { return def; }

  return { init, allowedRoutes, visibleNav, canAccess, can, roleLabel, current };
})();

// Dipakai core-shell.js saat render sidebar.
function visibleNav() { return TierAccess.visibleNav(); }
