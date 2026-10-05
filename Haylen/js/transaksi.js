/* Menu: Transaksi */
Haylen.pages.transaksi = {
  title: "Transaksi",
  render(el) {
    const { ui } = Haylen;
    return Haylen.crud.render(el, {
      menu: "transaksi", resource: "transactions", title: "Transaksi", subtitle: "Catatan pemasukan dan pengeluaran.", addLabel: "Input Transaksi",
      columns: [
        { key: "tanggal", label: "Tanggal" }, { key: "member", label: "Member" }, { key: "keterangan", label: "Keterangan" },
        { key: "jumlah", label: "Jumlah", type: "money" }, { key: "tipe", label: "Tipe", type: "badge" },
      ],
      fields: [
        { key: "tanggal", label: "Tanggal", type: "date" }, { key: "member", label: "Member", default: "-" },
        { key: "keterangan", label: "Keterangan" }, { key: "jumlah", label: "Jumlah", type: "number" },
        { key: "tipe", label: "Tipe", options: ["Pemasukan", "Pengeluaran"] },
      ],
      summary: (rows) => {
        const inc = rows.filter((r) => r.tipe === "Pemasukan").reduce((a, r) => a + r.jumlah, 0);
        const out = rows.filter((r) => r.tipe === "Pengeluaran").reduce((a, r) => a + r.jumlah, 0);
        return [
          { label: "Total Pemasukan", value: ui.rupiah(inc) },
          { label: "Total Pengeluaran", value: ui.rupiah(out) },
          { label: "Saldo", value: ui.rupiah(inc - out) },
        ];
      },
    });
  },
};
