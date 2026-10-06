/* Menu: Kelola Anggota (owner only — dibatasi juga di server).
   Daftar akun, tambah anggota (tier default paling bawah), ubah tier,
   nonaktifkan/aktifkan kembali. */
Haylen.pages.akun = {
  title: "Kelola Anggota",
  async render(el) {
    const { ui, api, config } = Haylen;
    const TIER_LABEL = { 0: "Owner", 1: "Admin", 2: "Coach" };
    if (!config.USE_API) {
      el.innerHTML = `<div class="card"><h3>Kelola Anggota</h3><p>Membutuhkan koneksi ke server (mode API).</p></div>`;
      return;
    }

    const HAY_CSS = `
      <style>
      .hay-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
      .hay-stat{background:#fff;border:1px solid #e8eaf0;border-radius:14px;padding:14px 16px}
      .hay-stat .n{font-size:26px;font-weight:800;color:var(--navy,#1a2340)}
      .hay-stat .l{font-size:12px;color:var(--muted,#8a8fa3);margin-top:2px}
      .hay-stat .n.green{color:#0f8a5d}.hay-stat .n.red{color:#b91c1c}
      .hay-av{width:36px;height:36px;border-radius:50%;background:var(--navy,#1a2340);color:#fff;
        display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex:none}
      .hay-row{display:flex;align-items:center;gap:12px}
      .hay-uname{font-weight:700;font-size:13.5px}
      .hay-fname{font-size:12px;color:var(--muted,#8a8fa3);margin-top:2px}
      .hay-msg{font-size:13px;margin:10px 0;min-height:18px;font-weight:600}
      .hay-msg.ok{color:#0f8a5d}.hay-msg.err{color:#b91c1c}
      .hay-tier-sel{font-size:12.5px;padding:6px 10px;border-radius:9px;max-width:150px}
      .hay-empty{padding:36px 20px;text-align:center;color:var(--muted,#8a8fa3);font-size:13px}
      .hay-fgrid{display:grid;grid-template-columns:1fr 1fr;gap:0 12px}
      @media(max-width:560px){.hay-stats{grid-template-columns:1fr 1fr}.hay-fgrid{grid-template-columns:1fr}}
      </style>`;

    el.innerHTML = HAY_CSS + `
      <div class="hay-stats">
        <div class="stat-card t-blue" style="min-height:0"><div class="stat-top">Total Anggota</div><div class="stat-value" id="hayStatTotal">–</div></div>
        <div class="stat-card t-green" style="min-height:0"><div class="stat-top">Aktif</div><div class="stat-value" id="hayStatAktif">–</div></div>
        <div class="stat-card t-orange" style="min-height:0"><div class="stat-top">Nonaktif</div><div class="stat-value" id="hayStatNonaktif">–</div></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Tambah Anggota Baru
          <small>Akun baru otomatis mendapat tier Coach (paling bawah). Tier dapat diubah setelah akun dibuat.</small></h3>
        </div>
        <div class="card-body">
          <form id="akunAddForm" autocomplete="off">
            <div class="hay-fgrid">
              <div class="field"><label>Username *</label>
                <input id="akunUsername" required minlength="3" maxlength="60" placeholder="cth: coach.budi"></div>
              <div class="field"><label>Nama lengkap *</label>
                <input id="akunNama" required maxlength="120" placeholder="cth: Budi Santoso"></div>
              <div class="field"><label>Password awal *</label>
                <input id="akunPass" type="password" required minlength="8" autocomplete="new-password" placeholder="Minimal 8 karakter"></div>
              <div class="field"><label>Tier awal</label><select id="akunTier">
                <option value="1">Admin</option><option value="2" selected>Coach</option>
              </select></div>
            </div>
            <p id="akunAddMsg" class="hay-msg"></p>
            <button class="btn" type="submit">Tambah Anggota</button>
          </form>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h3>Daftar Akun</h3><div class="spacer"></div>
          <button class="btn sm" id="akunReload">Muat ulang</button></div>
        <div class="card-body"><div class="table-wrap"><table class="table">
          <thead><tr><th>Akun</th><th>Tier</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead>
          <tbody id="akunBody"></tbody>
        </table></div>
        <p id="akunInfo" style="font-size:12px;color:var(--muted,#8a8fa3);margin:10px 0 0"></p></div>
      </div>`;

    const esc = ui.escape || ((s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])));
    let me = null;
    try { me = await api.me(); } catch (e) {}

    const initials = (name) => String(name || "?").trim().split(/\s+/).map((w) => w.charAt(0)).join("").slice(0, 2).toUpperCase() || "?";
    const tierBadge = (t) => t === 0
      ? `<span class="badge red">Owner</span>`
      : t === 1 ? `<span class="badge blue">Admin</span>`
      : `<span class="badge yellow">Coach</span>`;

    async function load() {
      const tbody = el.querySelector("#akunBody");
      try {
        const data = await api.accounts();
        const items = data.items || [];
        const aktif = items.filter((a) => a.is_active).length;
        el.querySelector("#hayStatTotal").textContent = items.length;
        el.querySelector("#hayStatAktif").textContent = aktif;
        el.querySelector("#hayStatNonaktif").textContent = items.length - aktif;
        el.querySelector("#akunInfo").textContent = `Menampilkan ${items.length} dari ${data.total || 0} akun`;
        tbody.innerHTML = items.map((a) => {
          const isSelf = me && me.id === a.id;
          const tierCell = a.tier === 0
            ? `${tierBadge(0)} <span style="font-size:11.5px;color:var(--muted,#8a8fa3)">(kunci)</span>`
            : `${tierBadge(a.tier)}<div style="margin-top:6px"><select class="hay-tier-sel" data-tier="${a.id}">${[1, 2].map((t) =>
                `<option value="${t}"${t === a.tier ? " selected" : ""}>${TIER_LABEL[t]}</option>`).join("")}</select></div>`;
          const status = a.is_active ? `<span class="badge green">Aktif</span>` : `<span class="badge red">Nonaktif</span>`;
          const aksi = isSelf ? `<span style="font-size:12px;color:var(--muted,#8a8fa3)">akun ini</span>`
            : a.is_active ? `<button class="btn danger sm" data-off="${a.id}">Nonaktifkan</button>`
            : `<button class="btn sm" data-on="${a.id}">Aktifkan</button>`;
          return `<tr><td><div class="hay-row"><span class="hay-av">${esc(initials(a.name || a.username))}</span>` +
            `<div><div class="hay-uname">${esc(a.username)}</div>` +
            `<div class="hay-fname">${esc(a.name || "")}</div></div></div></td>` +
            `<td>${tierCell}</td><td>${status}</td><td><div class="actions">${aksi}</div></td></tr>`;
        }).join("") || `<tr><td colspan="4"><div class="hay-empty">Belum ada anggota.<br>Tambahkan anggota pertama lewat form di atas.</div></td></tr>`;

        tbody.querySelectorAll("[data-tier]").forEach((sel) => sel.addEventListener("change", async () => {
          const id = sel.getAttribute("data-tier"), tier = parseInt(sel.value, 10);
          if (!ui.confirm(`Ubah tier menjadi ${TIER_LABEL[tier]}?`)) { load(); return; }
          try { await api.setAccountTier(id, tier); ui.toast("Tier berhasil diubah."); }
          catch (e) { ui.toast("Gagal: " + e.message); }
          load();
        }));
        tbody.querySelectorAll("[data-off]").forEach((b) => b.addEventListener("click", async () => {
          if (!ui.confirm("Nonaktifkan akun ini? Ia tidak bisa masuk sampai diaktifkan kembali.")) return;
          try { await api.deactivateAccount(b.getAttribute("data-off")); ui.toast("Akun dinonaktifkan."); }
          catch (e) { ui.toast("Gagal: " + e.message); }
          load();
        }));
        tbody.querySelectorAll("[data-on]").forEach((b) => b.addEventListener("click", async () => {
          try { await api.updateAccount(b.getAttribute("data-on"), { is_active: true }); ui.toast("Akun diaktifkan."); }
          catch (e) { ui.toast("Gagal: " + e.message); }
          load();
        }));
      } catch (e) {
        tbody.innerHTML = `<tr><td colspan="4"><div class="hay-empty" style="color:#b91c1c">Gagal memuat: ${esc(e.message)}</div></td></tr>`;
      }
    }

    el.querySelector("#akunReload").addEventListener("click", load);
    el.querySelector("#akunAddForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = el.querySelector("#akunAddMsg");
      msg.className = "hay-msg";
      msg.textContent = "";
      try {
        const created = await api.createAccount({
          username: el.querySelector("#akunUsername").value.trim(),
          name: el.querySelector("#akunNama").value.trim(),
          password: el.querySelector("#akunPass").value,
          tier: parseInt(el.querySelector("#akunTier").value, 10),
        });
        msg.classList.add("ok");
        msg.textContent = `Anggota "${created.username}" ditambahkan (${TIER_LABEL[created.tier]}).`;
        e.target.reset();
        el.querySelector("#akunTier").value = "2";
        load();
      } catch (err) {
        msg.classList.add("err");
        msg.textContent = "Gagal: " + err.message;
      }
    });

    load();
  },
};
