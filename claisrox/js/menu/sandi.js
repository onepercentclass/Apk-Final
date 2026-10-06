/* Menu: Ganti Password (semua peran yang sudah login). */
const SANDI_CSS = `
<style>
.clx-pw-tips{border-left:3px solid var(--ok,#2e9e5b);background:rgba(46,158,91,.08);padding:12px 16px;font-size:12.5px;border-radius:0 6px 6px 0;margin-bottom:16px}
.clx-pw-field{display:flex;align-items:center;gap:8px}
.clx-pw-field .input{flex:1;min-width:0}
.clx-eye{background:transparent;border:1px solid #3a3f47;border-radius:6px;cursor:pointer;padding:9px 11px;font-size:14px;line-height:1;color:#c9d1d9;flex:none}
.clx-eye:hover{border-color:#6b7280;color:#fff}
.clx-pw-meter{height:6px;border-radius:4px;background:#2b2f36;margin:8px 0 6px;overflow:hidden}
.clx-pw-fill{height:100%;width:0;border-radius:4px;transition:width .25s ease,background .25s ease}
.clx-pw-hint{font-size:12px;margin:0 0 14px}
.clx-msg{min-height:1.2em;font-size:13px;font-weight:600}
.clx-msg.ok{color:var(--ok,#2e9e5b)}
.clx-msg.err{color:var(--bad,#d33)}
</style>`;

function sandiEsc(s){
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

async function renderSandi(){
  const root = document.getElementById('sandiRoot');
  if(!root) return;
  if(!APP_CONFIG.api.enabled){
    root.innerHTML = `<div class="card"><div class="card-head"><h3>Ganti Password</h3></div>
      <div class="card-body"><p>Membutuhkan koneksi ke server (mode API).</p></div></div>`;
    return;
  }
  root.innerHTML = SANDI_CSS + `
    <div class="page-head"><div>
      <div class="page-title">Ganti Password</div>
      <div class="page-sub">Ubah password akun Anda sendiri</div>
    </div></div>
    <div class="clx-pw-tips">💡 Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol
      dengan panjang minimal 8 karakter agar password sulit ditebak.</div>
    <div class="card" style="max-width:520px"><div class="card-head"><h3>Ganti Password</h3></div>
      <div class="card-body">
        <form id="sandiForm" autocomplete="off">
          <div><label>Password saat ini</label>
            <div class="clx-pw-field"><input class="input" type="password" id="sandiLama" autocomplete="current-password" required placeholder="Masukkan password lama Anda">
            <button type="button" class="clx-eye" data-eye="sandiLama" title="Tampilkan/sembunyikan">👁</button></div></div>
          <div style="margin-top:12px"><label>Password baru</label>
            <div class="clx-pw-field"><input class="input" type="password" id="sandiBaru" autocomplete="new-password" required minlength="8" placeholder="Minimal 8 karakter">
            <button type="button" class="clx-eye" data-eye="sandiBaru" title="Tampilkan/sembunyikan">👁</button></div>
            <div class="clx-pw-meter"><div class="clx-pw-fill" id="sandiPwFill"></div></div>
            <p class="clx-pw-hint cell-muted" id="sandiPwHint">Kekuatan password akan muncul di sini.</p></div>
          <div><label>Ulangi password baru</label>
            <div class="clx-pw-field"><input class="input" type="password" id="sandiBaru2" autocomplete="new-password" required minlength="8" placeholder="Ketik ulang password baru">
            <button type="button" class="clx-eye" data-eye="sandiBaru2" title="Tampilkan/sembunyikan">👁</button></div></div>
          <p id="sandiMsg" class="clx-msg"></p>
          <button class="btn btn-primary" type="submit">Simpan Password Baru</button>
        </form>
      </div>
    </div>`;

  const baruInput = root.querySelector("#sandiBaru");
  const pwFill = root.querySelector("#sandiPwFill");
  const pwHint = root.querySelector("#sandiPwHint");

  root.querySelectorAll("[data-eye]").forEach((b) => b.addEventListener("click", () => {
    const inp = root.querySelector("#" + b.getAttribute("data-eye"));
    if(inp) inp.type = inp.type === "password" ? "text" : "password";
  }));

  baruInput.addEventListener("input", () => {
    const v = baruInput.value;
    let score = 0;
    if(v.length >= 8) score++;
    if(v.length >= 12) score++;
    if(/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
    if(/\d/.test(v)) score++;
    if(/[^A-Za-z0-9]/.test(v)) score++;
    const colors = ["#2b2f36", "#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];
    const labels = ["Terlalu pendek", "Lemah", "Cukup", "Kuat", "Sangat kuat", "Sangat kuat"];
    pwFill.style.width = Math.min(100, score * 20) + "%";
    pwFill.style.background = colors[score];
    pwHint.textContent = v ? "Kekuatan: " + labels[score] : "Kekuatan password akan muncul di sini.";
  });

  root.querySelector("#sandiForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = root.querySelector("#sandiMsg");
    msg.className = "clx-msg";
    msg.textContent = "";
    const baru = baruInput.value;
    if(baru !== root.querySelector("#sandiBaru2").value){
      msg.className = "clx-msg err";
      msg.textContent = "Ulangi password baru tidak sama.";
      return;
    }
    try{
      await api.changePassword(root.querySelector("#sandiLama").value, baru);
      msg.className = "clx-msg ok";
      msg.textContent = "Password berhasil diganti.";
      e.target.reset();
      pwFill.style.width = "0";
      pwHint.textContent = "Kekuatan password akan muncul di sini.";
      toast("Password berhasil diganti.", "success");
    }catch(err){
      msg.className = "clx-msg err";
      msg.textContent = "Gagal: " + err.message;
    }
  });
}
