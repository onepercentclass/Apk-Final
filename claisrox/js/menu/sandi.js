/* Menu: Ganti Password (semua peran yang sudah login). */
async function renderSandi(){
  const root = document.getElementById('sandiRoot');
  if(!root) return;
  if(!APP_CONFIG.api.enabled){
    root.innerHTML = `<div class="card"><div class="card-head"><h3>Ganti Password</h3></div>
      <div class="card-body"><p>Membutuhkan koneksi ke server (mode API).</p></div></div>`;
    return;
  }
  root.innerHTML = `
    <div class="page-head"><div>
      <div class="page-title">Ganti Password</div>
      <div class="page-sub">Ubah password akun Anda sendiri</div>
    </div></div>
    <div class="card" style="max-width:520px"><div class="card-head"><h3>Ganti Password</h3></div>
      <div class="card-body">
        <form id="sandiForm" autocomplete="off">
          <div class="form-row" style="grid-template-columns:1fr">
            <div><label>Password saat ini</label>
              <input class="input" type="password" id="sandiLama" autocomplete="current-password" required></div>
            <div><label>Password baru</label>
              <input class="input" type="password" id="sandiBaru" autocomplete="new-password" required minlength="8"></div>
            <div><label>Ulangi password baru</label>
              <input class="input" type="password" id="sandiBaru2" autocomplete="new-password" required minlength="8"></div>
          </div>
          <p id="sandiMsg" style="min-height:1.2em"></p>
          <button class="btn btn-primary" type="submit">Simpan Password Baru</button>
        </form>
      </div>
    </div>`;
  root.querySelector("#sandiForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = root.querySelector("#sandiMsg");
    msg.textContent = "";
    const baru = root.querySelector("#sandiBaru").value;
    if(baru !== root.querySelector("#sandiBaru2").value){ msg.textContent = "Ulangi password baru tidak sama."; return; }
    try{
      await api.changePassword(root.querySelector("#sandiLama").value, baru);
      msg.textContent = "Password berhasil diganti.";
      e.target.reset();
      toast("Password berhasil diganti.", "success");
    }catch(err){ msg.textContent = "Gagal: " + err.message; }
  });
}
