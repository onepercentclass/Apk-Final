/* Menu: Pengaturan */
Haylen.pages.pengaturan = {
  title: "Pengaturan",
  render(el) {
    return Haylen.crud.render(el, {
      menu: "pengaturan", resource: "settings", title: "Pengaturan", subtitle: "Pengaturan sistem AquaFlow.", addLabel: "Tambah Pengaturan",
      columns: [{ key: "kunci", label: "Pengaturan" }, { key: "nilai", label: "Nilai" }],
      fields: [{ key: "kunci", label: "Pengaturan" }, { key: "nilai", label: "Nilai" }],
    });
  },
};
