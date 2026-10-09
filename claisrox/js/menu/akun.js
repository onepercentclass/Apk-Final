/* Menu: Kelola Anggota (owner only — dibatasi juga di server).
   Daftar akun, tambah anggota (tier default paling bawah), ubah tier,
   nonaktifkan/aktifkan kembali. */
const AKUN_TIER_LABEL = { 0: "Owner", 1: "Manager", 2: "Staf Produksi & Gudang", 3: "Kasir & Toko Online" };
const AKUN_TIER_CHOICES = [1, 2, 3]; // tier 0 dikunci, tidak bisa diberikan via API
const AKUN_TIER_PILL = { 0: "pill-red", 1: "pill-amber", 2: "pill-muted", 3: "pill-green" };

function akunEsc(s){
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function clxAvatar(name){
  const init = String(name || "?").trim().split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";
  return `<span class="clx-avatar">${akunEsc(init)}</span>`;
}

const CLX_CSS = `
<style>
.clx-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 16px}
.clx-user{display:flex;align-items:center;gap:10px}
.clx-avatar{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#3b82f6;color:#fff;font-size:12px;font-weight:700;flex:none}
.clx-uname{font-weight:700}
.clx-tier{display:flex;flex-direction:column;gap:6px;align-items:flex-start}
.clx-sel{width:auto;max-width:190px;font-size:12px;padding:6px 8px}
.clx-msg{min-height:1.2em;font-size:13px;font-weight:600}
.clx-msg.ok{color:var(--ok,#2e9e5b)}
.clx-msg.err{color:var(--bad,#d33)}
.clx-actions{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}
.clx-empty{text-align:center;padding:28px 12px}
@media(max-width:560px){.clx-stats{grid-template-columns:1fr}}
</style>`;

async function renderAkun(){
  const root = document.getElementById('akunRoot');
  if(!root) return;
  if(!APP_CONFIG.api.enabled){
    root.innerHTML = `<div class="card"><div class="card-head"><h3>Kelola Anggota</h3></div>
      <div class="card-body"><p>Membutuhkan koneksi ke server (mode API).</p></div></div>`;
    return;
  }
  root.innerHTML = CLX_CSS + `
    <div class="page-head"><div>
      <div class="page-title">Kelola Anggota</div>
      <div class="page-sub">Daftar akun, tambah anggota baru, dan atur tier per anggota</div>
    </div>
      <button class="btn btn-sm btn-ghost" id="akunReloadTop">Muat ulang</button>
    </div>
    <div class="clx-stats">
      <div class="card stat-card"><div class="stat-top"><div class="stat-icon">👥</div><div class="stat-label">Total Anggota</div></div><div class="stat-value" id="clxStatTotal">–</div></div>
      <div class="card stat-card"><div class="stat-top"><div class="stat-icon">✅</div><div class="stat-label">Aktif</div></div><div class="stat-value" id="clxStatAktif">–</div></div>
      <div class="card stat-card"><div class="stat-top"><div class="stat-icon">⛔</div><div class="stat-label">Nonaktif</div></div><div class="stat-value" id="clxStatNonaktif">–</div></div>
    </div>
    <div class="card"><div class="card-head"><h3>Tambah Anggota Baru</h3></div>
      <div class="card-body">
        <form id="akunAddForm" autocomplete="off">
          <div class="form-row">
            <div><label>Username *</label><input class="input" id="akunUsername" required minlength="3" maxlength="50" placeholder="cth: kasir.ani"></div>
            <div><label>Nama lengkap *</label><input class="input" id="akunNama" required maxlength="100" placeholder="cth: Ani Wijaya"></div>
            <div><label>Password awal *</label><input class="input" id="akunPass" type="password" required minlength="8" autocomplete="new-password" placeholder="Minimal 8 karakter"></div>
            <div><label>Tier awal</label><select class="input" id="akunTier">
              <option value="1">Manager</option>
              <option value="2">Staf Produksi &amp; Gudang</option>
              <option value="3" selected>Kasir &amp; Toko Online</option>
            </select>
            <div class="cell-muted" style="font-size:12px;margin-top:4px">Default: Kasir &amp; Toko Online (tier paling bawah). Tier 0/Owner dikunci.</div></div>
          </div>
          <p id="akunAddMsg" class="clx-msg"></p>
          <button class="btn btn-primary" type="submit">+ Tambah Anggota</button>
        </form>
      </div>
    </div>
    <div class="card"><div class="card-head"><h3>Daftar Akun</h3>
      <span class="cell-muted" id="akunInfo" style="font-size:12px"></span></div>
      <div class="card-body"><div class="table-wrap"><table>
        <thead><tr><th>Akun</th><th>Tier</th><th>Status</th><th style="text-align:right">Aksi</th></tr></thead>
        <tbody id="akunBody"></tbody>
      </table></div></div>
    </div>`;

  let me = null;
  try { me = await api.me(); } catch(e){ if(window.logger) window.logger.caught('akun', e, 'loadMe'); }

  function paintStats(items, total){
    const aktif = items.filter((a) => a.is_active).length;
    const set = (id, v) => { const el = root.querySelector("#" + id); if(el) el.textContent = v; };
    set("clxStatTotal", total);
    set("clxStatAktif", aktif);
    set("clxStatNonaktif", items.length - aktif);
  }

  async function load(){
    const tbody = root.querySelector("#akunBody");
    try{
      const data = await api.accounts();
      const items = data.items || [];
      const total = data.total ?? items.length;
      root.querySelector("#akunInfo").textContent = `Menampilkan ${items.length} dari ${total} akun`;
      paintStats(items, total);
      tbody.innerHTML = items.map((a) => {
        const isSelf = me && (me.username === a.username);
        const tierCell = a.tier === 0
          ? `<div class="clx-tier"><span class="pill pill-red">Owner</span><span class="cell-muted" style="font-size:12px">Dikunci — tidak bisa diubah</span></div>`
          : `<div class="clx-tier"><span class="pill ${AKUN_TIER_PILL[a.tier] || "pill-muted"}">${akunEsc(AKUN_TIER_LABEL[a.tier] || a.tier)}</span>` +
            `<select class="input clx-sel" data-tier="${a.id}">${AKUN_TIER_CHOICES.map((t) =>
              `<option value="${t}"${t === a.tier ? " selected" : ""}>${akunEsc(AKUN_TIER_LABEL[t])}</option>`).join("")}</select></div>`;
        const status = a.is_active
          ? `<span class="pill pill-green">Aktif</span>`
          : `<span class="pill pill-red">Nonaktif</span>`;
        const aksi = isSelf ? `<span class="cell-muted">akun ini</span>`
          : (a.is_active ? `<button class="btn btn-sm btn-danger" data-off="${a.id}">Nonaktifkan</button>`
          : `<button class="btn btn-sm btn-primary" data-on="${a.id}">Aktifkan</button>`) +
          ` <button class="btn btn-sm btn-danger" data-hard="${a.id}" title="Hapus permanen">Hapus</button>`;
        return `<tr><td><div class="clx-user">${clxAvatar(a.name || a.username)}` +
          `<div><div class="clx-uname">${akunEsc(a.username)}</div>` +
          `<div class="cell-muted" style="font-size:12px">${akunEsc(a.name)}</div></div></div></td>` +
          `<td>${tierCell}</td><td>${status}</td>` +
          `<td><div class="clx-actions">${aksi}</div></td></tr>`;
      }).join("") || `<tr><td colspan="4"><div class="clx-empty cell-muted">Belum ada anggota.<br>Tambahkan anggota pertama lewat form di atas.</div></td></tr>`;

      tbody.querySelectorAll("[data-tier]").forEach((sel) => sel.addEventListener("change", async () => {
        const id = sel.getAttribute("data-tier"), tier = parseInt(sel.value, 10);
        if(!confirm(`Ubah tier menjadi ${AKUN_TIER_LABEL[tier]}?`)){ load(); return; }
        try{ await api.setAccountTier(id, tier); toast("Tier berhasil diubah.", "success"); }
        catch(e){ toast("Gagal: " + e.message); }
        load();
      }));
      tbody.querySelectorAll("[data-off]").forEach((b) => b.addEventListener("click", async () => {
        if(!confirm("Nonaktifkan akun ini? Ia tidak bisa masuk sampai diaktifkan kembali.")) return;
        try{ await api.deactivateAccount(b.getAttribute("data-off")); toast("Akun dinonaktifkan.", "success"); }
        catch(e){ toast("Gagal: " + e.message); }
        load();
      }));
      tbody.querySelectorAll("[data-on]").forEach((b) => b.addEventListener("click", async () => {
        try{ await api.updateAccount(b.getAttribute("data-on"), { is_active: true }); toast("Akun diaktifkan.", "success"); }
        catch(e){ toast("Gagal: " + e.message); }
        load();
      }));
      tbody.querySelectorAll("[data-hard]").forEach((b) => b.addEventListener("click", async () => {
        if(!confirm("HAPUS PERMANEN akun ini? Data tidak bisa dikembalikan!")) return;
        try{ await api.deleteAccountHard(b.getAttribute("data-hard")); toast("Akun dihapus permanen.", "success"); }
        catch(e){ toast("Gagal: " + e.message); }
        load();
      }));
    }catch(e){
      tbody.innerHTML = `<tr><td colspan="4" style="color:var(--bad,#d33)">Gagal memuat: ${akunEsc(e.message)}</td></tr>`;
    }
  }

  root.querySelector("#akunReloadTop").addEventListener("click", load);
  root.querySelector("#akunAddForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = root.querySelector("#akunAddMsg");
    msg.className = "clx-msg";
    msg.textContent = "";
    try{
      const created = await api.createAccount({
        username: root.querySelector("#akunUsername").value.trim(),
        name: root.querySelector("#akunNama").value.trim(),
        password: root.querySelector("#akunPass").value,
        tier: parseInt(root.querySelector("#akunTier").value, 10),
      });
      msg.className = "clx-msg ok";
      msg.textContent = `Anggota "${created.username}" ditambahkan sebagai ${AKUN_TIER_LABEL[created.tier] || created.tier}.`;
      e.target.reset();
      root.querySelector("#akunTier").value = "3";
      load();
    }catch(err){
      msg.className = "clx-msg err";
      msg.textContent = "Gagal: " + err.message;
    }
  });

  load();
}
