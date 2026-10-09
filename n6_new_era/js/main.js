/* N6 New Era — titik masuk aplikasi. Alur boot sesuai design_vnpc.md bagian 3. */
import { initLogger, caught } from './core/logger.js';
import { currentUser } from './core/auth.js';
import { renderLogin } from './core/auth.js';
import { render, initRouter } from './core/router.js';

initLogger();

function applyTheme() {
  try {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
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
  initRouter();
  render();
}

boot();
