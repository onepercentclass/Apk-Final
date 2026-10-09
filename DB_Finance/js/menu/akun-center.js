/** Account Center — Kelola Anggota, Ganti Password, Tema, dan Keluar dalam satu halaman bertab. */

import { renderAkun, bindAkun } from './akun.js';
import { renderSandi, bindSandi } from './sandi.js';
import { isDark, applyTheme } from '../core/theme.js';
import { S, save } from '../core/store.js';
import { render } from '../core/nav.js';
import { ic } from '../core/icons.js';

export function renderAkunCenter() {
  return `
  <div class="page-head"><h2>Akun Saya</h2><p class="muted">Kelola anggota, password, tema, dan sesi dalam satu tempat.</p></div>
  <div class="tabs" role="tablist">
    <button class="tab on" data-tab="anggota" role="tab">Kelola Anggota</button>
    <button class="tab" data-tab="sandi" role="tab">Ganti Password</button>
    <button class="tab" data-tab="tema" role="tab">Tema</button>
  </div>
  <div id="ac-anggota" class="tabpane">${renderAkun()}</div>
  <div id="ac-sandi" class="tabpane" hidden>${renderSandi()}</div>
  <div id="ac-tema" class="tabpane" hidden>
    <div class="card card-pad" style="max-width:480px">
      <h3>Tampilan</h3>
      <p class="muted">Pilih tema aplikasi.</p>
      <div class="row" style="gap:8px">
        <button class="btn ${!isDark() ? 'pri' : ''}" data-theme="light">${ic('sun', 16)} Terang</button>
        <button class="btn ${isDark() ? 'pri' : ''}" data-theme="dark">${ic('moon', 16)} Gelap</button>
      </div>
      <hr style="margin:18px 0">
      <h3>Sesi</h3>
      <button class="btn danger" data-act="logout">${ic('logout', 16)} Keluar dari aplikasi</button>
    </div>
  </div>`;
}

export function bindAkunCenter() {
  const tabs = document.querySelectorAll('#page .tabs .tab');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('on'));
    t.classList.add('on');
    document.querySelectorAll('#page .tabpane').forEach(p => p.hidden = true);
    document.getElementById('ac-' + t.dataset.tab).hidden = false;
  }));
  bindAkun();
  bindSandi();
  document.querySelectorAll('#page [data-theme]').forEach(b => b.addEventListener('click', () => {
    S.theme = b.dataset.theme;
    applyTheme();
    save();
    render();
  }));
}
