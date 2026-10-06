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
    { key: "akun", label: "Kelola Anggota", icon: "member" },
    { key: "sandi", label: "Ganti Password", icon: "pengaturan" },
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

  // Menu akun (Kelola Anggota & Ganti Password) di-render terpisah,
  // tepat di atas footer sidebar.
  const ACCOUNT_KEYS = ["akun", "sandi"];

  function menuItemHtml(m, active) {
    return `<button class="menu-item ${m.key === active ? "active" : ""}" data-menu="${m.key}">${icons[m.icon]}<span>${m.label}</span></button>`;
  }

  function drawMenu(active) {
    const main = MENUS.filter((m) => !ACCOUNT_KEYS.includes(m.key) && access.canOpen(m.key));
    const acct = MENUS.filter((m) => ACCOUNT_KEYS.includes(m.key) && access.canOpen(m.key));
    document.getElementById("menu").innerHTML = main.map((m) => menuItemHtml(m, active)).join("");
    const acctNav = document.getElementById("menuAccount");
    acctNav.innerHTML = acct.map((m) => menuItemHtml(m, active)).join("");
    acctNav.style.display = acct.length ? "" : "none";
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

  const TOKEN_KEY = config.STORAGE_PREFIX + "token"; // "haylen_token"

  /* Login gate: tampilkan form login sebelum app di-render (hanya mode API).
     Sukses -> token + profil user tersimpan, boot dilanjutkan. */
  function showLogin() {
    return new Promise((resolve) => {
      document.getElementById("app").style.display = "none";
      const back = document.createElement("div");
      back.className = "modal-back";
      back.innerHTML =
        '<div class="modal" role="dialog" aria-label="Login">' +
        '<h3>Masuk ke Haylen</h3>' +
        '<p style="font-size:12.5px;color:var(--muted);margin:-6px 0 14px">AquaFlow Swimming School</p>' +
        '<form id="haylenLoginForm" autocomplete="on">' +
        '<div class="field"><label>Username</label><input name="username" autocomplete="username" required></div>' +
        '<div class="field"><label>Password</label><input name="password" type="password" autocomplete="current-password" required></div>' +
        '<div class="field"><span id="haylenLoginError" style="color:#b91c1c;font-size:12px;font-weight:600"></span></div>' +
        '<button class="btn" type="submit" style="width:100%">Masuk</button>' +
        "</form></div>";
      document.body.appendChild(back);
      const form = back.querySelector("#haylenLoginForm");
      const errEl = back.querySelector("#haylenLoginError");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errEl.textContent = "";
        const fd = new FormData(form);
        try {
          const res = await Haylen.api.login(
            String(fd.get("username")).trim(),
            String(fd.get("password"))
          );
          localStorage.setItem(TOKEN_KEY, res.access_token);
          config.USER = { name: res.user.name, role: res.user.role };
          config.CURRENT_TIER = res.tier;
          back.remove();
          document.getElementById("app").style.display = "";
          resolve(true);
        } catch (err) {
          errEl.textContent = err && err.status === 401
            ? "Username atau password salah."
            : "Tidak dapat terhubung ke server. Coba lagi.";
        }
      });
      back.querySelector('input[name="username"]').focus();
    });
  }

  async function boot() {
    if (config.USE_API) {
      const token = localStorage.getItem(TOKEN_KEY);
      let needLogin = !token;
      if (token) {
        try {
          await Haylen.api.me(); // validasi token; 401 -> token basi
        } catch (e) {
          if (e && e.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            needLogin = true;
          }
        }
      }
      if (needLogin) {
        const ok = await showLogin();
        if (!ok) return;
      }
    }
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
    document.getElementById("menuAccount").addEventListener("click", (e) => {
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
