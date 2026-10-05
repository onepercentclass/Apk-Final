/* Menu: Kelas & Program */
Haylen.pages.kelas_program = {
  title: "Kelas & Program",
  render(el) {
    return Haylen.crud.render(el, {
      menu: "kelas_program", resource: "programs", title: "Kelas & Program", subtitle: "Atur program dan kelas renang.", addLabel: "Tambah Program",
      columns: [
        { key: "nama", label: "Program" }, { key: "kategori", label: "Kategori" }, { key: "harga", label: "Harga", type: "money" },
        { key: "kuota", label: "Kuota" }, { key: "status", label: "Status", type: "badge" },
      ],
      fields: [
        { key: "nama", label: "Nama Program" }, { key: "kategori", label: "Kategori" },
        { key: "harga", label: "Harga", type: "number" }, { key: "kuota", label: "Kuota", type: "number" },
        { key: "status", label: "Status", options: ["Aktif", "Nonaktif"] },
      ],
    });
  },
};
