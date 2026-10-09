/* ---- ACCOUNT CENTER (B6) ---- */
PAGES['akun-center'] = function() {
  return `
  <div class="page-title">Akun Saya</div>
  <div class="page-sub">Kelola anggota, password, dan tema dalam satu tempat.</div>
  <div class="tabs" style="margin:16px 0">
    <button class="tab on" data-act="ac-tab" data-v="anggota">Kelola Anggota</button>
    <button class="tab" data-act="ac-tab" data-v="sandi">Ganti Password</button>
    <button class="tab" data-act="ac-tab" data-v="tema">Tema</button>
  </div>
  <div id="ac-anggota"></div>
  <div id="ac-sandi" hidden></div>
  <div id="ac-tema" hidden>
    <div class="card card-pad" style="max-width:480px">
      <h3>Tampilan</h3>
      <p class="muted">Pilih tema aplikasi.</p>
      <div class="row" style="gap:8px">
        <button class="btn" data-act="ac-theme" data-v="light">Terang</button>
        <button class="btn" data-act="ac-theme" data-v="dark">Gelap</button>
      </div>
      <hr style="margin:18px 0">
      <h3>Sesi</h3>
      <button class="btn btn-danger" data-act="ac-logout">Keluar dari aplikasi</button>
    </div>
  </div>`;
};

function bindAkunCenter() {
  // Render konten tab
  document.getElementById('ac-anggota').innerHTML = PAGES.akun();
  document.getElementById('ac-sandi').innerHTML = PAGES.sandi();
  // Trigger afterRender jika ada
  if (typeof loadAkunPage === 'function') setTimeout(loadAkunPage, 0);
}

// Register actions
if (typeof registerActions === 'function') {
  registerActions({
    'ac-tab': (v) => {
      document.querySelectorAll('.tabs .tab').forEach(x => x.classList.remove('on'));
      document.querySelector(`[data-v="${v}"]`).classList.add('on');
      ['anggota', 'sandi', 'tema'].forEach(k => {
        document.getElementById('ac-' + k).hidden = (k !== v);
      });
    },
    'ac-theme': (v) => {
      document.documentElement.setAttribute('data-theme', v);
      try { localStorage.setItem('dbacc-theme', v); } catch (e) {}
      toast('Tema diubah ke ' + v);
    },
    'ac-logout': () => {
      if (confirm('Keluar dari aplikasi?')) {
        try { localStorage.removeItem('dbacc-token'); } catch (e) {}
        location.reload();
      }
    }
  });
}

// Auto-bind setelah render
setTimeout(bindAkunCenter, 0);
