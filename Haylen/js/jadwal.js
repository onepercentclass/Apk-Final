/* Menu: Jadwal (termasuk absensi) */
Haylen.pages.jadwal = {
  title: "Jadwal",
  render(el) {
    return Haylen.crud.render(el, {
      menu: "jadwal", resource: "schedules", title: "Jadwal", subtitle: "Jadwal kelas dan absensi.", addLabel: "Tambah Jadwal",
      columns: [
        { key: "kelas", label: "Kelas" }, { key: "coach", label: "Coach" }, { key: "hari", label: "Hari" },
        { key: "jam", label: "Jam" }, { key: "kolam", label: "Kolam" }, { key: "absensi", label: "Absensi", type: "badge" },
      ],
      fields: [
        { key: "kelas", label: "Kelas" }, { key: "coach", label: "Coach" },
        { key: "hari", label: "Hari", options: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"] },
        { key: "jam", label: "Jam", type: "time" }, { key: "kolam", label: "Kolam" },
        { key: "absensi", label: "Absensi", options: ["Belum", "Hadir"] },
      ],
    });
  },
};
