/* Menu: Ganti Password (semua peran yang sudah login). */
Haylen.pages.sandi = {
  title: "Ganti Password",
  render(el) {
    const { ui, api, config } = Haylen;
    if (!config.USE_API) {
      el.innerHTML = `<div class="card"><h3>Ganti Password</h3><p>Membutuhkan koneksi ke server (mode API).</p></div>`;
      return;
    }

    const HAY_CSS = `
      <style>
      .hay-tips{background:#f6f8fd;border:1px solid #e4e9f5;border-left:3px solid var(--blue,#1d4ed8);
        border-radius:0 10px 10px 0;padding:12px 14px;font-size:12.5px;color:var(--muted,#8a8fa3);margin-bottom:16px}
      .hay-pwrow{display:flex;gap:8px;align-items:stretch}
      .hay-pwrow .field{flex:1;margin-bottom:0}
      .hay-eye{border:1px solid var(--line,#e5e7eb);background:#fff;border-radius:10px;cursor:pointer;
        padding:0 12px;font-size:16px;color:var(--muted,#8a8fa3);align-self:flex-end;height:42px}
      .hay-eye:hover{border-color:var(--navy,#1a2340);color:var(--navy,#1a2340)}
      .hay-meter{height:6px;border-radius:4px;background:#eef0f5;margin:8px 0 4px;overflow:hidden}
      .hay-fill{height:100%;width:0;border-radius:4px;transition:width .25s ease,background .25s ease}
      .hay-hint{font-size:11.5px;color:var(--muted,#8a8fa3);margin-bottom:14px}
      .hay-msg{font-size:13px;margin:10px 0;min-height:18px;font-weight:600}
      .hay-msg.ok{color:#0f8a5d}.hay-msg.err{color:#b91c1c}
      .hay-gap{margin-bottom:14px}
      </style>`;

    el.innerHTML = HAY_CSS + `
      <div class="card" style="max-width:520px"><div class="card-head"><h3>Ganti Password</h3></div>
        <div class="card-body">
          <div class="hay-tips">Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol
            dengan panjang minimal 8 karakter agar password sulit ditebak.</div>
          <form id="sandiForm" autocomplete="off">
            <div class="hay-gap"><div class="hay-pwrow">
              <div class="field"><label>Password saat ini</label>
                <input type="password" id="sandiLama" autocomplete="current-password" required placeholder="Masukkan password lama"></div>
              <button type="button" class="hay-eye" data-eye="sandiLama" title="Tampilkan/sembunyikan">&#128065;</button>
            </div></div>
            <div class="hay-pwrow">
              <div class="field"><label>Password baru</label>
                <input type="password" id="sandiBaru" autocomplete="new-password" required minlength="8" placeholder="Minimal 8 karakter"></div>
              <button type="button" class="hay-eye" data-eye="sandiBaru" title="Tampilkan/sembunyikan">&#128065;</button>
            </div>
            <div class="hay-meter"><div class="hay-fill" id="hayPwFill"></div></div>
            <div class="hay-hint" id="hayPwHint">Kekuatan password akan muncul di sini.</div>
            <div class="hay-gap"><div class="hay-pwrow">
              <div class="field"><label>Ulangi password baru</label>
                <input type="password" id="sandiBaru2" autocomplete="new-password" required minlength="8" placeholder="Ketik ulang password baru"></div>
              <button type="button" class="hay-eye" data-eye="sandiBaru2" title="Tampilkan/sembunyikan">&#128065;</button>
            </div></div>
            <p id="sandiMsg" class="hay-msg"></p>
            <button class="btn" type="submit">Simpan Password Baru</button>
          </form>
        </div>
      </div>`;

    const pwFill = el.querySelector("#hayPwFill");
    const pwHint = el.querySelector("#hayPwHint");
    const baruInput = el.querySelector("#sandiBaru");

    el.querySelectorAll("[data-eye]").forEach((b) => b.addEventListener("click", () => {
      const inp = el.querySelector("#" + b.getAttribute("data-eye"));
      if (inp) inp.type = inp.type === "password" ? "text" : "password";
    }));

    baruInput.addEventListener("input", () => {
      const v = baruInput.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (v.length >= 12) score++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      const colors = ["#e5e5e5", "#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];
      const labels = ["Terlalu pendek", "Lemah", "Cukup", "Kuat", "Sangat kuat", "Sangat kuat"];
      pwFill.style.width = Math.min(100, score * 20) + "%";
      pwFill.style.background = colors[score];
      pwHint.textContent = v ? "Kekuatan: " + labels[score] : "Kekuatan password akan muncul di sini.";
    });

    el.querySelector("#sandiForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = el.querySelector("#sandiMsg");
      msg.className = "hay-msg";
      msg.textContent = "";
      const baru = baruInput.value;
      if (baru !== el.querySelector("#sandiBaru2").value) {
        msg.classList.add("err");
        msg.textContent = "Ulangi password baru tidak sama.";
        return;
      }
      try {
        await api.changePassword(el.querySelector("#sandiLama").value, baru);
        msg.classList.add("ok");
        msg.textContent = "Password berhasil diganti.";
        e.target.reset();
        pwFill.style.width = "0";
        pwHint.textContent = "Kekuatan password akan muncul di sini.";
        ui.toast("Password berhasil diganti.");
      } catch (err) {
        msg.classList.add("err");
        msg.textContent = "Gagal: " + err.message;
      }
    });
  },
};
