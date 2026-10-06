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
    el.innerHTML = `
      <div class="card">
        <div class="card-head"><h3>Kelola Anggota</h3>
          <button class="btn" id="akunReload">Muat ulang</button></div>
        <div class="card-body">
          <h4>Tambah Anggota Baru</h4>
          <form id="akunAddForm" autocomplete="off">
            <div class="form-grid">
              <div class="field"><label>Username *</label><input id="akunUsername" required minlength="3" maxlength="60"></div>
              <div class="field"><label>Nama lengkap *</label><input id="akunNama" required maxlength="120"></div>
              <div class="field"><label>Password awal *</label><input id="akunPass" type="password" required minlength="8" autocomplete="new-password"></div>
              <div class="field"><label>Tier</label><select id="akunTier">
                <option value="1">Admin</option><option value="2" selected>Coach</option>
              </select></div>
            </div>
            <p id="akunAddMsg" class="form-msg"></p>
            <button class="btn btn-primary" type="submit">Tambah Anggota</button>
            <span class="muted">Tier default: Coach (paling bawah).</span>
          </form>
        </div>
      </div>
      <div class="card"><div class="card-head"><h3>Daftar Akun</h3></div>
        <div class="card-body"><div class="table-wrap"><table>
          <thead><tr><th>Akun</th><th>Tier</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead>
          <tbody id="akunBody"></tbody>
        </table></div>
        <p class="muted" id="akunInfo"></p></div>
      </div>`;

    const esc = ui.escape || ((s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])));
    let me = null;
    try { me = await api.me(); } catch (e) {}

    async function load() {
      const tbody = el.querySelector("#akunBody");
      try {
        const data = await api.accounts();
        const items = data.items || [];
        el.querySelector("#akunInfo").textContent = `Menampilkan ${items.length} dari ${data.total || 0} akun`;
        tbody.innerHTML = items.map((a) => {
          const isSelf = me && me.id === a.id;
          const tierCell = a.tier === 0
            ? `<span class="badge">Owner</span> <span class="muted">(kunci)</span>`
            : `<select data-tier="${a.id}">${[1, 2].map((t) =>
                `<option value="${t}"${t === a.tier ? " selected" : ""}>${TIER_LABEL[t]}</option>`).join("")}</select>`;
          const status = a.is_active ? `<span class="ok">Aktif</span>` : `<span class="bad">Nonaktif</span>`;
          const aksi = isSelf ? `<span class="muted">akun ini</span>`
            : a.is_active ? `<button class="btn btn-sm" data-off="${a.id}">Nonaktifkan</button>`
            : `<button class="btn btn-sm" data-on="${a.id}">Aktifkan</button>`;
          return `<tr><td><b>${esc(a.username)}</b><br><span class="muted">${esc(a.name)}</span></td>` +
            `<td>${tierCell}</td><td>${status}</td><td style="text-align:right">${aksi}</td></tr>`;
        }).join("") || `<tr><td colspan="4" class="muted" style="text-align:center">Belum ada anggota.</td></tr>`;

        tbody.querySelectorAll("[data-tier]").forEach((sel) => sel.addEventListener("change", async () => {
          const id = sel.getAttribute("data-tier"), tier = parseInt(sel.value, 10);
          if (!ui.confirm(`Ubah tier menjadi ${TIER_LABEL[tier]}?`)) { load(); return; }
          try { await api.setAccountTier(id, tier); ui.toast("Tier berhasil diubah."); }
          catch (e) { ui.toast("Gagal: " + e.message); }
          load();
        }));
        tbody.querySelectorAll("[data-off]").forEach((b) => b.addEventListener("click", async () => {
          if (!ui.confirm("Nonaktifkan akun ini?")) return;
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
        tbody.innerHTML = `<tr><td colspan="4" class="bad">Gagal memuat: ${esc(e.message)}</td></tr>`;
      }
    }

    el.querySelector("#akunReload").addEventListener("click", load);
    el.querySelector("#akunAddForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = el.querySelector("#akunAddMsg");
      msg.textContent = "";
      try {
        const created = await api.createAccount({
          username: el.querySelector("#akunUsername").value.trim(),
          name: el.querySelector("#akunNama").value.trim(),
          password: el.querySelector("#akunPass").value,
          tier: parseInt(el.querySelector("#akunTier").value, 10),
        });
        msg.textContent = `Anggota "${created.username}" ditambahkan (${TIER_LABEL[created.tier]}).`;
        e.target.reset();
        el.querySelector("#akunTier").value = "2";
        load();
      } catch (err) { msg.textContent = "Gagal: " + err.message; }
    });

    load();
  },
};
