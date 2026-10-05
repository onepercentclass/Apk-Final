/* Lapisan data localStorage (dipakai selama USE_API = false) */
(function () {
  const PREFIX = Haylen.config.STORAGE_PREFIX;
  const key = (k) => PREFIX + k;

  const rupiah = (n) => n;

  // Data awal (seed)
  const SEED = {
    dashboard: {
      stats: {
        totalMember: { value: 248, trend: 12, note: "dibanding bulan lalu" },
        kelasAktif: { value: 18, trend: 6, note: "dari total 24 kelas" },
        pendapatan: { value: 48750000, trend: 18, note: "dibanding bulan lalu" },
        totalCoach: { value: 6, trend: 0, note: "tidak berubah" },
        kehadiran: { value: 92, trend: 4, note: "dibanding bulan lalu" },
      },
      revenueTrend: {
        labels: ["Nov 2024", "Des 2024", "Jan 2025", "Feb 2025", "Mar 2025", "Apr 2025"],
        values: [7, 16, 26, 36, 45, 51], // dalam juta
      },
      distribution: [
        { name: "Group Class", percent: 42, count: 104, color: "#fdb827" },
        { name: "Private Class", percent: 25, count: 62, color: "#a855f7" },
        { name: "Kids Class", percent: 18, count: 45, color: "#34c98b" },
        { name: "Adult Class", percent: 10, count: 25, color: "#3b82f6" },
        { name: "Competition", percent: 5, count: 12, color: "#f472b6" },
      ],
      popular: [
        { name: "Group Class Anak", members: 86, color: "#fdb827", rank: "#f5a623" },
        { name: "Private Class", members: 62, color: "#a855f7", rank: "#b075f2" },
        { name: "Adult Class", members: 41, color: "#22c58b", rank: "#34c98b" },
        { name: "Kids Class", members: 37, color: "#3b82f6", rank: "#f08a4b" },
        { name: "Competition", members: 12, color: "#f472b6", rank: "#a855f7" },
      ],
      activities: [
        { icon: "member", tone: "c-yellow", title: "Member baru mendaftar", sub: "Andi Pratama mendaftar kelas Group Class", time: "09:42" },
        { icon: "dollar", tone: "c-green", title: "Pembayaran diterima", sub: "Rp 1.200.000 (Private Class - 10 sesi)", time: "08:56" },
        { icon: "calendarCheck", tone: "c-purple", title: "Jadwal kelas dimulai", sub: "Group Class Anak - 08:00", time: "08:00" },
        { icon: "check", tone: "c-blue", title: "Coach menambahkan absensi", sub: "Raka Putra (Group Class Anak)", time: "07:45" },
        { icon: "trophy", tone: "c-orange", title: "Member menyelesaikan sesi", sub: "Siti Nurhaliza (Private Class)", time: "07:32" },
      ],
      finance: {
        period: "Bulan April 2025",
        rows: [
          { label: "Pendapatan Kelas", amount: 45200000, trend: 18, icon: "member", tone: "c-green" },
          { label: "Pendapatan Private", amount: 18750000, trend: 12, icon: "doc", tone: "c-purple" },
          { label: "Biaya Operasional", amount: 12400000, trend: -3, icon: "receipt", tone: "c-orange" },
          { label: "Lain-lain", amount: 3200000, trend: 5, icon: "doc", tone: "c-blue" },
        ],
        netProfit: 48750000,
        netTrend: 18,
      },
    },

    members: [
      { id: 1, nama: "Andi Pratama", telepon: "0812-3456-7801", program: "Group Class", status: "Aktif", bergabung: "2025-04-17" },
      { id: 2, nama: "Siti Nurhaliza", telepon: "0813-2200-1180", program: "Private Class", status: "Aktif", bergabung: "2025-03-02" },
      { id: 3, nama: "Raka Putra", telepon: "0857-8899-4412", program: "Kids Class", status: "Aktif", bergabung: "2025-02-11" },
      { id: 4, nama: "Dewi Lestari", telepon: "0821-7700-3321", program: "Adult Class", status: "Cuti", bergabung: "2024-12-20" },
      { id: 5, nama: "Fajar Ramadhan", telepon: "0878-1100-6620", program: "Competition", status: "Aktif", bergabung: "2024-11-05" },
    ],
    programs: [
      { id: 1, nama: "Group Class", kategori: "Reguler", harga: 450000, kuota: 20, status: "Aktif" },
      { id: 2, nama: "Private Class", kategori: "Privat", harga: 1200000, kuota: 1, status: "Aktif" },
      { id: 3, nama: "Kids Class", kategori: "Anak", harga: 400000, kuota: 12, status: "Aktif" },
      { id: 4, nama: "Adult Class", kategori: "Dewasa", harga: 500000, kuota: 15, status: "Aktif" },
      { id: 5, nama: "Competition", kategori: "Prestasi", harga: 750000, kuota: 10, status: "Aktif" },
    ],
    coaches: [
      { id: 1, nama: "Raka Putra", telepon: "0812-9000-1001", spesialisasi: "Kids Class", status: "Aktif" },
      { id: 2, nama: "Sinta Wulandari", telepon: "0812-9000-1002", spesialisasi: "Private Class", status: "Aktif" },
      { id: 3, nama: "Bagas Setiawan", telepon: "0812-9000-1003", spesialisasi: "Competition", status: "Aktif" },
      { id: 4, nama: "Lina Marlina", telepon: "0812-9000-1004", spesialisasi: "Adult Class", status: "Aktif" },
      { id: 5, nama: "Doni Saputra", telepon: "0812-9000-1005", spesialisasi: "Group Class", status: "Aktif" },
      { id: 6, nama: "Maya Anggraini", telepon: "0812-9000-1006", spesialisasi: "Group Class", status: "Aktif" },
    ],
    schedules: [
      { id: 1, kelas: "Group Class Anak", coach: "Raka Putra", hari: "Senin", jam: "08:00", kolam: "Kolam A", absensi: "Belum" },
      { id: 2, kelas: "Private Class", coach: "Sinta Wulandari", hari: "Senin", jam: "10:00", kolam: "Kolam B", absensi: "Belum" },
      { id: 3, kelas: "Adult Class", coach: "Lina Marlina", hari: "Selasa", jam: "19:00", kolam: "Kolam A", absensi: "Belum" },
      { id: 4, kelas: "Competition", coach: "Bagas Setiawan", hari: "Rabu", jam: "06:00", kolam: "Kolam Utama", absensi: "Belum" },
    ],
    transactions: [
      { id: 1, tanggal: "2025-04-17", member: "Andi Pratama", keterangan: "Pendaftaran Group Class", jumlah: 450000, tipe: "Pemasukan" },
      { id: 2, tanggal: "2025-04-17", member: "Siti Nurhaliza", keterangan: "Private Class - 10 sesi", jumlah: 1200000, tipe: "Pemasukan" },
      { id: 3, tanggal: "2025-04-16", member: "-", keterangan: "Biaya kimia kolam", jumlah: 850000, tipe: "Pengeluaran" },
    ],
    facilities: [
      { id: 1, nama: "Kolam Utama", jenis: "Kolam", kapasitas: 40, kondisi: "Baik" },
      { id: 2, nama: "Kolam A (Anak)", jenis: "Kolam", kapasitas: 20, kondisi: "Baik" },
      { id: 3, nama: "Ruang Ganti Putra", jenis: "Ruangan", kapasitas: 25, kondisi: "Baik" },
      { id: 4, nama: "Ruang Ganti Putri", jenis: "Ruangan", kapasitas: 25, kondisi: "Perlu Perawatan" },
    ],
    settings: [
      { id: 1, kunci: "Nama Sekolah", nilai: "AquaFlow Swimming School" },
      { id: 2, kunci: "Jam Operasional", nilai: "06:00 - 21:00" },
      { id: 3, kunci: "Mata Uang", nilai: "IDR" },
    ],
  };

  const Storage = {
    seed() {
      Object.keys(SEED).forEach((k) => {
        if (localStorage.getItem(key(k)) === null) {
          localStorage.setItem(key(k), JSON.stringify(SEED[k]));
        }
      });
    },
    get(name, fallback = null) {
      try {
        const raw = localStorage.getItem(key(name));
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set(name, value) {
      localStorage.setItem(key(name), JSON.stringify(value));
    },
    list(name) { return this.get(name, []); },
    create(name, item) {
      const rows = this.list(name);
      item.id = rows.reduce((m, r) => Math.max(m, r.id || 0), 0) + 1;
      rows.push(item);
      this.set(name, rows);
      return item;
    },
    update(name, id, patch) {
      const rows = this.list(name);
      const i = rows.findIndex((r) => r.id === id);
      if (i < 0) return null;
      rows[i] = Object.assign({}, rows[i], patch);
      this.set(name, rows);
      return rows[i];
    },
    remove(name, id) {
      this.set(name, this.list(name).filter((r) => r.id !== id));
      return true;
    },
    reset() {
      Object.keys(SEED).forEach((k) => localStorage.removeItem(key(k)));
      this.seed();
    },
  };

  Haylen.storage = Storage;
  Storage.seed();
})();
