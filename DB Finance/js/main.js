/** Titik masuk aplikasi. */
import { USE_API } from './config.js';
import { ensureLogin } from './login.js';
import { loadAccess, can, firstAllowed } from './access/access.js';
import { MENUS, MOBILE_MENUS } from './menu/index.js';
import { U, syncFromServer } from './core/store.js';
import { $ } from './core/utils.js';
import { setMenus, menuOrder, render } from './core/nav.js';
import { applyTheme } from './core/theme.js';
import { initEvents } from './core/events.js';
import { initTooltip } from './ui/tooltip.js';
import { initRestore } from './export/backup.js';
import './export/dialog.js'; // mendaftarkan aksi Unduh Laporan

async function start() {
  // 401 global (mis. token kedaluwarsa di tengah sesi): token sudah dibuang
  // oleh api.js — muat ulang agar login gate menampilkan form login.
  window.addEventListener('api:unauthorized', () => location.reload());

  // Mode API: wajib login dulu sebelum memuat hak akses / sinkronisasi.
  if (USE_API) {
    const loggedIn = await ensureLogin();
    if (!loggedIn) return;
  }

  try {
    // Mode API: hak akses dari backend. Mode lokal: vocabulary menu penuh
    // (pemegang perangkat = pemiliknya sendiri).
    await loadAccess(MENUS.map((m) => m.id));
  } catch (err) {
    console.error(err);
    $('#app').textContent = USE_API
      ? 'Tidak dapat memuat hak akses dari server. Pastikan sudah login dan server dapat dijangkau.'
      : 'Tidak dapat memuat hak akses.';
    return;
  }
  if (USE_API) await syncFromServer();

  setMenus(MENUS, MOBILE_MENUS);
  if (!can(U.page)) U.page = firstAllowed(menuOrder());

  initEvents();
  initTooltip();
  initRestore();
  applyTheme();
  render();
}

start();
