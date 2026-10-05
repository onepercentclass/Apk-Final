/* Router + bootstrap. Sidebar dibangun dari daftar menu & disaring oleh tier. */
(function () {
  const { ui, icons, access, config } = Haylen;

  const MENUS = [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "member", label: "Member", icon: "member" },
    { key: "kelas_program", label: "Kelas & Program", icon: "program" },
    { key: "coach", label: "Coach", icon: "coach" },
    { key: "jadwal", label: "Jadwal", icon: "jadwal" },
    { key: "transaksi", label: "Transaksi", icon: "transaksi" },
    { key: "laporan", label: "Laporan", icon: "laporan" },
    { key: "fasilitas", label: "Fasilitas", icon: "fasilitas" },
    { key: "pengaturan", label: "Pengaturan", icon: "pengaturan" },
  ];

  // Menu yang tampil di navigasi bawah (handphone); sisanya lewat tombol "Menu"
  const BOTTOM = ["dashboard", "member", "jadwal", "transaksi"];
  const view = () => document.getElementById("view");

  const sidebar = () => document.getElementById("sidebar");
  const backdrop = () => document.getElementById("drawerBackdrop");
  function setDrawer(open) {
    sidebar().classList.toggle("open", open);
    backdrop().classList.toggle("show", open);
  }

  function drawBottom(active) {
    const items = MENUS.filter((m) => BOTTOM.includes(m.key) && access.canOpen(m.key));
    const html = items.map((m) =>
      `<button class="bn-item ${m.key === active ? "active" : ""}" data-menu="${m.key}"><span class="bn-ico">${icons[m.icon]}</span><span>${m.label}</span></button>`
    ).join("");
    const more = !BOTTOM.includes(active) && active ? "active" : "";
    document.getElementById("bottomNav").innerHTML = html +
      `<button class="bn-item ${more}" data-drawer="1"><span class="bn-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></span><span>Menu</span></button>`;
  }

  function drawMenu(active) {
    const nav = document.getElementById("menu");
    nav.innerHTML = MENUS.filter((m) => access.canOpen(m.key)).map((m) =>
      `<button class="menu-item ${m.key === active ? "active" : ""}" data-menu="${m.key}">${icons[m.icon]}<span>${m.label}</span></button>`
    ).join("");
  }

  Haylen.navigate = async function (key) {
    if (!Haylen.pages[key] || !access.canOpen(key)) {
      view().innerHTML = ui.denied(key);
      return;
    }
    location.hash = "#/" + key;
    drawMenu(key);
    drawBottom(key);
    setDrawer(false);
    window.scrollTo(0, 0);
    view().innerHTML = "";
    await Haylen.pages[key].render(view());
  };

  async function boot() {
    await access.load();
    const u = config.USER;
    document.getElementById("roleName").textContent = u.role;
    document.getElementById("userRole").textContent = u.role;
    document.getElementById("userName").textContent = u.name;
    document.getElementById("userAvatar").textContent = u.name.split(" ").map((w) => w[0]).slice(0, 2).join("");
    document.getElementById("todayLabel").textContent = ui.today();

    document.getElementById("menu").addEventListener("click", (e) => {
      const b = e.target.closest("[data-menu]");
      if (b) { Haylen.pendingAction = null; Haylen.navigate(b.dataset.menu); }
    });
    document.getElementById("bottomNav").addEventListener("click", (e) => {
      if (e.target.closest("[data-drawer]")) return setDrawer(true);
      const b = e.target.closest("[data-menu]");
      if (b) { Haylen.pendingAction = null; Haylen.navigate(b.dataset.menu); }
    });
    document.getElementById("menuToggle").onclick = () => setDrawer(!sidebar().classList.contains("open"));
    backdrop().onclick = () => setDrawer(false);
    window.addEventListener("resize", () => { if (window.innerWidth > 900) setDrawer(false); });

    const start = (location.hash.replace("#/", "") || "dashboard");
    Haylen.navigate(Haylen.pages[start] ? start : "dashboard");
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
