/* Menu: Kelola Anggota (owner only — dibatasi juga di server).
   Daftar akun, tambah anggota (tier default paling bawah), ubah tier,
   nonaktifkan/aktifkan kembali. */
const AKUN_TIER_LABEL = { 0: "Owner", 1: "Manager", 2: "Staf Produksi & Gudang", 3: "Kasir & Toko Online" };
const AKUN_TIER_CHOICES = [1, 2, 3]; // tier 0 dikunci, tidak bisa diberikan via API

function akunEsc(s){
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

async function renderAkun(){
  const root = document.getElementById('akunRoot');
  if(!root) return;
  if(!APP_CONFIG.api.enabled){
    root.innerHTML = `<div class="card"><div class="card-head"><h3>Kelola Anggota</h3></div>
      <div class="card-body"><p>Membutuhkan koneksi ke server (mode API).</p></div></div>`;
    return;
  }
  root.innerHTML = `
    <div class="page-head"><div>
      <div class="page-title">Kelola Anggota</div>
      <div class="page-sub">Daftar akun, tambah anggota baru, dan atur tier per anggota</div>
    </div></div>
    <div class="card"><div class="card-head"><h3>Tambah Anggota Baru</h3></div>
      <div class="card-body">
        <form id="akunAddForm" autocomplete="off">
          <div class="form-row">
            <div><label>Username *</label><input class="input" id="akunUsername" required minlength="3" maxlength="50"></div>
            <div><label>Nama lengkap *</label><input class="input" id="akunNama" required maxlength="100"></div>
            <div><label>Password awal *</label><input class="input" id="akunPass" type="password" required minlength="8" autocomplete="new-password"></div>
            <div><label>Tier</label><select class="input" id="akunTier">
              <option value="1">Manager</option>
              <option value="2">Staf Produksi &amp; Gudang</option>
              <option value="3" selected>Kasir &amp; Toko Online</option>
            </select></div>
          </div>
          <p id="akunAddMsg" style="min-height:1.2em"></p>
          <button class="btn btn-primary" type="submit">Tambah Anggota</button>
          <span class="cell-muted">Tier default: Kasir &amp; Toko Online (paling bawah).</span>
        </form>
      </div>
    </div>
    <div class="card"><div class="card-head"><h3>Daftar Akun</h3>
      <button class="btn btn-sm" id="akunReload">Muat ulang</button></div>
      <div class="card-body"><div class="table-wrap"><table>
        <thead><tr><th>Akun</th><th>Tier</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead>
        <tbody id="akunBody"></tbody>
      </table></div>
      <p class="cell-muted" id="akunInfo"></p></div>
    </div>`;

  let me = null;
  try { me = await api.me(); } catch(e){}

  async function load(){
    const tbody = root.querySelector("#akunBody");
    try{
      const data = await api.accounts();
      const items = data.items || [];
      root.querySelector("#akunInfo").textContent = `Menampilkan ${items.length} dari ${data.total || 0} akun`;
      tbody.innerHTML = items.map((a) => {
        const isSelf = me && (me.username === a.username);
        const tierCell = a.tier === 0
          ? `<span class="badge">Owner</span> <span class="cell-muted">(kunci)</span>`
          : `<select class="input" data-tier="${a.id}" style="width:auto">${AKUN_TIER_CHOICES.map((t) =>
              `<option value="${t}"${t === a.tier ? " selected" : ""}>${akunEsc(AKUN_TIER_LABEL[t])}</option>`).join("")}</select>`;
        const status = a.is_active ? `<span style="color:var(--ok,#2e9e5b)">Aktif</span>` : `<span style="color:var(--bad,#d33)">Nonaktif</span>`;
        const aksi = isSelf ? `<span class="cell-muted">akun ini</span>`
          : a.is_active ? `<button class="btn btn-sm" data-off="${a.id}">Nonaktifkan</button>`
          : `<button class="btn btn-sm" data-on="${a.id}">Aktifkan</button>`;
        return `<tr><td><b>${akunEsc(a.username)}</b><br><span class="cell-muted">${akunEsc(a.name)}</span></td>` +
          `<td>${tierCell}</td><td>${status}</td><td style="text-align:right">${aksi}</td></tr>`;
      }).join("") || `<tr><td colspan="4" class="cell-muted" style="text-align:center">Belum ada anggota.</td></tr>`;

      tbody.querySelectorAll("[data-tier]").forEach((sel) => sel.addEventListener("change", async () => {
        const id = sel.getAttribute("data-tier"), tier = parseInt(sel.value, 10);
        if(!confirm(`Ubah tier menjadi ${AKUN_TIER_LABEL[tier]}?`)){ load(); return; }
        try{ await api.setAccountTier(id, tier); toast("Tier berhasil diubah.", "success"); }
        catch(e){ toast("Gagal: " + e.message); }
        load();
      }));
      tbody.querySelectorAll("[data-off]").forEach((b) => b.addEventListener("click", async () => {
        if(!confirm("Nonaktifkan akun ini?")) return;
        try{ await api.deactivateAccount(b.getAttribute("data-off")); toast("Akun dinonaktifkan.", "success"); }
        catch(e){ toast("Gagal: " + e.message); }
        load();
      }));
      tbody.querySelectorAll("[data-on]").forEach((b) => b.addEventListener("click", async () => {
        try{ await api.updateAccount(b.getAttribute("data-on"), { is_active: true }); toast("Akun diaktifkan.", "success"); }
        catch(e){ toast("Gagal: " + e.message); }
        load();
      }));
    }catch(e){
      tbody.innerHTML = `<tr><td colspan="4" style="color:var(--bad,#d33)">Gagal memuat: ${akunEsc(e.message)}</td></tr>`;
    }
  }

  root.querySelector("#akunReload").addEventListener("click", load);
  root.querySelector("#akunAddForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = root.querySelector("#akunAddMsg");
    msg.textContent = "";
    try{
      const created = await api.createAccount({
        username: root.querySelector("#akunUsername").value.trim(),
        name: root.querySelector("#akunNama").value.trim(),
        password: root.querySelector("#akunPass").value,
        tier: parseInt(root.querySelector("#akunTier").value, 10),
      });
      msg.textContent = `Anggota "${created.username}" ditambahkan (${AKUN_TIER_LABEL[created.tier] || created.tier}).`;
      e.target.reset();
      root.querySelector("#akunTier").value = "3";
      load();
    }catch(err){ msg.textContent = "Gagal: " + err.message; }
  });

  load();
}
