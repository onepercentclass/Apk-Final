/* Menu: Laporan (ringkasan dari /reports/summary; fallback hitung lokal saat offline) */
Haylen.pages.laporan = {
  title: "Laporan",
  async render(el) {
    const { api, ui } = Haylen;
    const d = await api.reports();
    let boxes;
    if (d) {
      boxes = [
        { label: "Total Member", value: d.total_member ?? 0 },
        { label: "Member Aktif", value: d.member_aktif ?? 0 },
        { label: "Jumlah Jadwal Kelas", value: d.jumlah_jadwal ?? 0 },
      ];
      if (d.pemasukan !== undefined) {
        boxes.push(
          { label: "Pemasukan", value: ui.rupiah(d.pemasukan) },
          { label: "Pengeluaran", value: ui.rupiah(d.pengeluaran) },
          { label: "Laba", value: ui.rupiah(d.laba) }
        );
      }
    } else {
      // Mode offline: hitung dari localStorage seperti sebelumnya
      const [tx, members, schedules] = await Promise.all([api.list("transactions"), api.list("members"), api.list("schedules")]);
      const inc = tx.filter((t) => t.tipe === "Pemasukan").reduce((a, t) => a + t.jumlah, 0);
      const out = tx.filter((t) => t.tipe === "Pengeluaran").reduce((a, t) => a + t.jumlah, 0);
      const showMoney = Haylen.access.feature("laporan_bisnis") === "full";
      boxes = [
        { label: "Total Member", value: members.length },
        { label: "Member Aktif", value: members.filter((m) => m.status === "Aktif").length },
        { label: "Jumlah Jadwal Kelas", value: schedules.length },
      ];
      if (showMoney) boxes.push({ label: "Pemasukan", value: ui.rupiah(inc) }, { label: "Pengeluaran", value: ui.rupiah(out) }, { label: "Laba", value: ui.rupiah(inc - out) });
    }
    el.innerHTML = `
      <div class="page-head"><div><h2>Laporan</h2><p>Ringkasan performa bisnis renang Anda.</p></div></div>
      <div class="summary-grid">${boxes.map((b) => `<div class="summary-box"><small>${b.label}</small><strong>${ui.esc(b.value)}</strong></div>`).join("")}</div>`;
  },
};
