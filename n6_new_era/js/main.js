/* N6 New Era — titik masuk aplikasi. Alur boot sesuai design_vnpc.md bagian 3. */
import { initLogger, caught } from './core/logger.js';
import { currentUser } from './core/auth.js';
import { renderLogin } from './core/auth.js';
import { render, initRouter } from './core/router.js';
import { THEME_KEY } from './core/config.js';

initLogger();

function applyTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    const dark = saved === 'dark' ||
      (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
  } catch (e) { caught(e, 'applyTheme'); }
}

async function boot() {
  applyTheme();
  const bootEl = document.getElementById('n6-boot');
  const appEl = document.getElementById('app');
  let user = null;
  try {
    user = await currentUser();
  } catch (e) {
    caught(e, 'boot currentUser');
  }
  bootEl.remove();
  appEl.hidden = false;
  if (!user) {
    renderLogin(appEl, () => {
      appEl.innerHTML = '';
      initRouter();
      render();
    });
    return;
  }
  appEl.hidden = false;
  initRouter();
  render();
}

boot();
