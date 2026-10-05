/* Menu: Coach */
Haylen.pages.coach = {
  title: "Coach",
  render(el) {
    return Haylen.crud.render(el, {
      menu: "coach", resource: "coaches", title: "Coach", subtitle: "Kelola data pelatih.", addLabel: "Tambah Coach",
      columns: [
        { key: "nama", label: "Nama" }, { key: "telepon", label: "Telepon" },
        { key: "spesialisasi", label: "Spesialisasi" }, { key: "status", label: "Status", type: "badge" },
      ],
      fields: [
        { key: "nama", label: "Nama" }, { key: "telepon", label: "Telepon" },
        { key: "spesialisasi", label: "Spesialisasi" },
        { key: "status", label: "Status", options: ["Aktif", "Nonaktif"] },
      ],
    });
  },
};
