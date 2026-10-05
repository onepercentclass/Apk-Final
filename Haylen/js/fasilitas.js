/* Menu: Fasilitas */
Haylen.pages.fasilitas = {
  title: "Fasilitas",
  render(el) {
    return Haylen.crud.render(el, {
      menu: "fasilitas", resource: "facilities", title: "Fasilitas", subtitle: "Kolam dan fasilitas pendukung.", addLabel: "Tambah Fasilitas",
      columns: [
        { key: "nama", label: "Nama" }, { key: "jenis", label: "Jenis" },
        { key: "kapasitas", label: "Kapasitas" }, { key: "kondisi", label: "Kondisi", type: "badge" },
      ],
      fields: [
        { key: "nama", label: "Nama" }, { key: "jenis", label: "Jenis", options: ["Kolam", "Ruangan", "Peralatan"] },
        { key: "kapasitas", label: "Kapasitas", type: "number" },
        { key: "kondisi", label: "Kondisi", options: ["Baik", "Perlu Perawatan", "Rusak"] },
      ],
    });
  },
};
