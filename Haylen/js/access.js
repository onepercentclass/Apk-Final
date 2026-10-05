/* Sistem akses berdasarkan tier. Tier 0 = semua fitur; tier lebih besar = lebih terbatas.
   Isi tier identik dengan backend/tiers/tier{n}.json (salinan bawaan untuk mode localStorage). */
(function () {
  const L = { none: 0, view: 1, limited: 2, manage: 3, full: 4 };

  const TIERS = {
    0: {
      tier: 0, name: "Owner",
      menus: { dashboard: "full", member: "full", kelas_program: "full", coach: "full", jadwal: "full", transaksi: "view", laporan: "full", fasilitas: "full", pengaturan: "full" },
      features: { lihat_omzet_laba: "full", kelola_member: "full", kelola_program: "full", kelola_coach: "full", jadwal_kelas: "full", absensi: "view", transaksi: "view", laporan_bisnis: "full", pengaturan_sistem: "full" },
    },
    1: {
      tier: 1, name: "Admin",
      menus: { dashboard: "limited", member: "full", kelas_program: "full", coach: "full", jadwal: "full", transaksi: "manage", laporan: "limited", fasilitas: "full", pengaturan: "limited" },
      features: { lihat_omzet_laba: "limited", kelola_member: "full", kelola_program: "full", kelola_coach: "full", jadwal_kelas: "full", absensi: "manage", transaksi: "manage", laporan_bisnis: "limited", pengaturan_sistem: "limited" },
    },
    2: {
      tier: 2, name: "Coach",
      menus: { dashboard: "limited", member: "limited", kelas_program: "none", coach: "none", jadwal: "full", transaksi: "none", laporan: "none", fasilitas: "none", pengaturan: "none" },
      features: { lihat_omzet_laba: "none", kelola_member: "limited", kelola_program: "none", kelola_coach: "none", jadwal_kelas: "full", absensi: "full", transaksi: "none", laporan_bisnis: "none", pengaturan_sistem: "none" },
    },
    3: {
      tier: 3, name: "Reserved",
      menus: { dashboard: "view", member: "none", kelas_program: "none", coach: "none", jadwal: "none", transaksi: "none", laporan: "none", fasilitas: "none", pengaturan: "none" },
      features: { lihat_omzet_laba: "none", kelola_member: "none", kelola_program: "none", kelola_coach: "none", jadwal_kelas: "none", absensi: "none", transaksi: "none", laporan_bisnis: "none", pengaturan_sistem: "none" },
    },
  };

  const Access = {
    tier: null,
    async load() {
      const n = Haylen.config.CURRENT_TIER;
      let data = null;
      try { data = await Haylen.api.tier(n); } catch (e) { data = null; }
      this.tier = data || TIERS[n] || TIERS[3];
      return this.tier;
    },
    menuLevel(menu) { return (this.tier && this.tier.menus[menu]) || "none"; },
    feature(name) { return (this.tier && this.tier.features[name]) || "none"; },
    canOpen(menu) { return this.menuLevel(menu) !== "none"; },
    // aksi: view | add | edit | delete
    can(menu, action) {
      const lv = L[this.menuLevel(menu)] || 0;
      if (action === "view") return lv >= 1;
      if (action === "add" || action === "edit") return lv >= 2;
      if (action === "delete") return lv >= 3;
      return false;
    },
  };

  Haylen.access = Access;
})();
