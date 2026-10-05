/* Menu: Member */
Haylen.pages.member = {
  title: "Member",
  render(el) {
    return Haylen.crud.render(el, {
      menu: "member", resource: "members", title: "Member", subtitle: "Kelola data member sekolah renang.", addLabel: "Tambah Member",
      columns: [
        { key: "nama", label: "Nama" }, { key: "telepon", label: "Telepon" }, { key: "program", label: "Program" },
        { key: "status", label: "Status", type: "badge" }, { key: "bergabung", label: "Bergabung" },
      ],
      fields: [
        { key: "nama", label: "Nama" }, { key: "telepon", label: "Telepon" },
        { key: "program", label: "Program", options: ["Group Class", "Private Class", "Kids Class", "Adult Class", "Competition"] },
        { key: "status", label: "Status", options: ["Aktif", "Cuti", "Nonaktif"] },
        { key: "bergabung", label: "Tanggal Bergabung", type: "date" },
      ],
    });
  },
};
