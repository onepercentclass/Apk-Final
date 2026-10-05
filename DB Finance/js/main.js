/** Titik masuk aplikasi. */
import { USE_API } from './config.js';
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
  try {
    await loadAccess();
  } catch (err) {
    console.error(err);
    $('#app').textContent = USE_API
      ? 'Tidak dapat memuat hak akses dari server. Pastikan sudah login dan server dapat dijangkau.'
      : 'Tidak dapat memuat file tier. Jalankan aplikasi lewat server HTTP, bukan membuka index.html langsung.';
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
