/**
 * N6 - application bootstrap
 *
 * The single entry point. Its whole job is to make the five original
 * dashboards behave like one application without touching their logic:
 *
 *   1. read the role out of the URL
 *   2. load that role's stylesheets, in cascade order
 *   3. inject that role's markup (js/views/<role>.js)
 *   4. apply the tier gate, so unauthorised navigation is gone before paint
 *   5. run the role bundle and its trailing scripts, in order
 *
 * Step 5 uses dynamically created classic <script> tags rather than ES module
 * imports on purpose. The role bundles are the original single-file IIFEs: they
 * read the DOM as soon as they run and they share one function scope with their
 * trailing scripts. A module import would give each file its own scope and
 * break them. Dynamic classic scripts keep execution order and share scope
 * exactly as the originals did.
 */

import { getRole } from './core/registry.js';
import { initRepository } from './core/storage.js';
import { CONFIG, apiEnabled } from './core/env.js';
import { enforce, setSession, getSession } from './core/access.js';
import { ensureApiLogin } from './core/login.js';
import * as router from './core/router.js';
import { whenStylesLoaded, loadScript, $, el } from './core/dom.js';
import { APP_NAME, APP_SUBTITLE, ROLE_PARAM } from './core/config.js';
import { EVENTS, bus } from './core/events.js';

const MOUNT_ID = 'n6-app';

/**
 * Konfigurasi API untuk classic script (mis. js/account-ui.js) yang tidak
 * bisa mengimpor ES module. Dipasang sebelum role bundle dimuat.
 */
window.N6_API = {
  enabled: apiEnabled(),
  base: String(CONFIG.API_BASE_URL).replace(/\/+$/, '') +
        String(CONFIG.API_PREFIX || '').replace(/\/+$/, ''),
  tokenKey: CONFIG.API_TOKEN_KEY,
  userKey: CONFIG.API_USER_KEY,
};

/** Render the splash shown while stylesheets and scripts arrive. */
function showBootScreen(role) {
  const mount = document.getElementById(MOUNT_ID);
  if (!mount) return;
  mount.innerHTML = '';
  mount.appendChild(el('div', { class: 'n6-boot', role: 'status', 'aria-live': 'polite' }, [
    el('div', { class: 'n6-boot__bar' }),
    el('p', { class: 'n6-boot__text', text: `Memuat ${role.label}…` }),
  ]));
}

function setBodyAttributes(viewModule, role) {
  // the original <body> tag carried data-theme="dark" on four of the five roles
  const attr = viewModule.BODY_ATTR || '';
  const theme = /data-theme="([^"]*)"/.exec(attr);
  document.body.setAttribute('data-role', role.key);
  document.body.setAttribute('data-tier', String(role.tier));
  if (theme) document.body.setAttribute('data-theme', theme[1]);
  const appTheme = /data-client-theme="([^"]*)"/.exec(attr);
  if (appTheme) document.documentElement.setAttribute('data-client-theme', appTheme[1]);
}

async function loadView(roleKey) {
  const mod = await import(`./views/${roleKey}.js`);
  return mod.default ?? mod[`VIEW_${roleKey.toUpperCase()}`];
}

async function boot() {
  const startedAt = performance.now();

  const route = router.init();
  // Role dianggap eksplisit hanya bila tertulis di URL (?role=...).
  // Tanpa itu, role BARU ditentukan setelah login dari tier user — jadi
  // jangan tampilkan seolah-olah ini dashboard owner sebelum login.
  const roleExplicit = new URL(window.location.href).searchParams.has(ROLE_PARAM);
  const role = getRole(route.role);
  setSession({ role: role.key });

  // Branding netral untuk layar login bila role belum ditentukan.
  const bootRole = roleExplicit ? role : { ...role, title: APP_NAME, label: APP_NAME };
  document.title = `${bootRole.title} — ${APP_SUBTITLE}`;

  // API login gate: with API_ENABLED=true this blocks the bootstrap until a
  // valid token exists (shows the login form when needed). Resolves
  // immediately in localStorage-only mode.
  await ensureApiLogin(bootRole);

  // Redirect ke view sesuai tier user (hindari coach buka view owner dll).
  // Bila role tidak eksplisit di URL, selalu arahkan ke role milik tier user.
  // Hanya bila API aktif dan tier diketahui.
  try {
    const ub = (getSession().backend) || {};
    const tierRole = { 0: 'owner', 1: 'admin', 2: 'headcoach', 3: 'coach', 4: 'client' }[ub.tier];
    if (tierRole && (!roleExplicit || tierRole !== role.key)) {
      const url = new URL(window.location.href);
      url.searchParams.set(ROLE_PARAM, tierRole);
      url.searchParams.delete('menu');
      window.location.replace(url.toString());
      return;
    }
  } catch (e) { /* abaikan, lanjut boot normal */ }

  document.title = `${role.title} — ${APP_NAME} ${APP_SUBTITLE}`;

  showBootScreen(role);

  // 1. stylesheets, in the order recorded by tools/build.ps1
  await whenStylesLoaded(role.assets.css);

  // 2. markup
  const view = await loadView(role.key);
  const mount = document.getElementById(MOUNT_ID);
  if (!mount) throw new Error(`missing #${MOUNT_ID}`);
  setBodyAttributes(view, role);
  mount.innerHTML = view;
  if (mount.dataset.clientId) {
    // client portal: the role code reads this off the query string itself
    mount.dataset.clientId = route.clientId || '';
  }

  // 3. tier gate, before any role code binds its listeners
  const gate = enforce(document, role.key);
  if (gate.locked.length) {
    const ub = (getSession().backend) || {};
    console.info(`[n6] user tier ${ub.tier} (${ub.role || '?'}) cannot open: ${gate.locked.join(', ')}`);
  }

  // 4. data layer (localStorage while the API is off)
  const repository = await initRepository(role.key);

  // 5. role bundle, then its trailing scripts, in order
  for (const src of role.assets.scripts) {
    await loadScript(src);
  }

  router.observeNavigation(document);

  // Terapkan menu dari URL (?menu=...) pada load awal — tanpa ini panel
  // tidak tampil bila user membuka link langsung ke menu tertentu.
  try {
    if (route.menu) {
      const btn = document.querySelector(`[data-panel="${route.menu}"]`);
      if (btn && !btn.hidden && !btn.dataset.n6Locked) btn.click();
    }
  } catch (e) { /* abaikan */ }

  bus.emit(EVENTS.READY, {
    role: role.key,
    tier: role.tier,
    session: getSession(),
    dataSource: repository.source,
    apiEnabled: apiEnabled(),
    gate,
    ms: Math.round(performance.now() - startedAt),
  });

  document.dispatchEvent(new CustomEvent('n6:ready', {
    detail: { role: role.key, tier: role.tier, dataSource: repository.source },
  }));

  console.info(
    `[n6] ${role.label} ready - tier ${role.tier}, data: ${repository.source}, ` +
    `api: ${apiEnabled() ? CONFIG.API_BASE_URL : 'disabled (localStorage)'}, ` +
    `${Math.round(performance.now() - startedAt)}ms`,
  );
}

boot().catch((err) => {
  console.error('[n6] boot failed', err);
  const mount = document.getElementById(MOUNT_ID);
  if (mount) {
    mount.innerHTML = '';
    mount.appendChild(el('div', { class: 'n6-boot n6-boot--error' }, [
      el('h1', { text: 'Gagal memuat dashboard' }),
      el('p', { text: String(err && err.message ? err.message : err) }),
      el('p', { class: 'n6-boot__hint', text: 'Pastikan folder css/, js/ dan assets/ berada di samping index.html.' }),
    ]));
  }
});

export { boot };