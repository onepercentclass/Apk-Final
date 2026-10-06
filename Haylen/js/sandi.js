/* Menu: Ganti Password (semua peran yang sudah login). */
Haylen.pages.sandi = {
  title: "Ganti Password",
  render(el) {
    const { ui, api, config } = Haylen;
    if (!config.USE_API) {
      el.innerHTML = `<div class="card"><h3>Ganti Password</h3><p>Membutuhkan koneksi ke server (mode API).</p></div>`;
      return;
    }
    el.innerHTML = `
      <div class="card" style="max-width:520px"><div class="card-head"><h3>Ganti Password</h3></div>
        <div class="card-body">
          <form id="sandiForm" autocomplete="off">
            <div class="field"><label>Password saat ini</label>
              <input type="password" id="sandiLama" autocomplete="current-password" required></div>
            <div class="field"><label>Password baru</label>
              <input type="password" id="sandiBaru" autocomplete="new-password" required minlength="8"></div>
            <div class="field"><label>Ulangi password baru</label>
              <input type="password" id="sandiBaru2" autocomplete="new-password" required minlength="8"></div>
            <p id="sandiMsg" class="form-msg"></p>
            <button class="btn btn-primary" type="submit">Simpan Password Baru</button>
          </form>
        </div>
      </div>`;
    el.querySelector("#sandiForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = el.querySelector("#sandiMsg");
      msg.textContent = "";
      const baru = el.querySelector("#sandiBaru").value;
      if (baru !== el.querySelector("#sandiBaru2").value) { msg.textContent = "Ulangi password baru tidak sama."; return; }
      try {
        await api.changePassword(el.querySelector("#sandiLama").value, baru);
        msg.textContent = "Password berhasil diganti.";
        e.target.reset();
        ui.toast("Password berhasil diganti.");
      } catch (err) { msg.textContent = "Gagal: " + err.message; }
    });
  },
};
