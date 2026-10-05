/* ============================= TIERS =============================
   Sistem akses menu berbasis tier.
   - tier 0 (Owner)      : SEMUA menu.
   - tier 1/2/3          : subset menu (lihat tiers/tier-{n}.json).
   Sumber kanonis = file JSON di /tiers (dipakai juga oleh backend).
   File ini memuat tier aktif saat boot; bila fetch gagal (mis. dibuka
   via file://) dipakai fallback tier 0 inline sehingga aplikasi tetap
   berjalan identik seperti semula.
   ================================================================ */
const TierAccess = (() => {
  const FALLBACK_TIER_0 = {
    tier: 0,
    name: 'Owner',
    roleLabel: 'Super Admin',
    description: 'Pemilik — akses penuh seluruh menu dan pengaturan.',
    menus: ['dashboard', 'transaksi', 'penjualan', 'pembelian', 'kasbank', 'jurnal', 'persediaan', 'asettetap', 'kontak', 'laporan', 'pajak', 'perusahaan', 'pengaturan'],
    permissions: { view: true, create: true, edit: true, del: true, expo: true, manageUsers: true, manageSettings: true },
  };

  let def = FALLBACK_TIER_0;

  function tierPath(t) {
    return (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.TIER_JSON_PATH : 'tiers/tier-{tier}.json').replace('{tier}', t);
  }

  async function init() {
    const t = (typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.CURRENT_TIER : 0) || 0;
    if (t === 0) { def = FALLBACK_TIER_0; return def; }
    try {
      const res = await fetch(tierPath(t));
      if (res.ok) { def = await res.json(); return def; }
    } catch (e) { /* abaikan: pakai fallback */ }
    try {
      const res0 = await fetch(tierPath(0));
      if (res0.ok) { const j0 = await res0.json(); if (t === 0) def = j0; }
    } catch (e) { /* abaikan */ }
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

// Dipakai core-shell.js saat render sidebar. Tier 0 = NAV penuh (identik aslinya).
function visibleNav() { return TierAccess.visibleNav(); }
