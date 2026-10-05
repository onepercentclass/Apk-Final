/**
 * N6 - tier access gate
 *
 * SATU-SATUNYA sumber hak akses saat API aktif = backend.
 * Setelah login, js/core/login.js menyimpan matriks milik user yang login
 * (menus + actions, dihitung server dari tier di DB via GET /api/n6/v1/auth/me)
 * ke sesi di sini. Modul ini hanya MENYEMBUNYIKAN navigasi agar UI cocok
 * dengan yang akan diizinkan server.
 *
 * What this module is NOT: a security boundary. Anything a browser can be
 * asked to do, a user can be tricked into doing. The authoritative check is
 * the FastAPI dependency that loads backend tiers/*.json and answers 403.
 *
 * Mode lokal (API dimatikan): dashboard asli tidak punya gate, jadi semua
 * diizinkan — perilaku identik sebelum wiring API. Tidak ada keputusan
 * "tier X boleh apa" di frontend.
 */

import { ROLES, TIER, MENUS, getRole, resolveRole } from './registry.js';
import { EVENTS, bus } from './events.js';

/**
 * Current session.
 * `backend` = { tier, role, menus, actions } dari GET /api/n6/v1/auth/me,
 * diisi oleh js/core/login.js setelah login. null selama API mati.
 */
const session = {
  role: 'owner',
  userId: null,
  displayName: null,
  backend: null,
};

/** Explicit per-user overrides, e.g. a coach promoted to head coach. */
const overrides = new Map();

export function getSession() {
  return {
    ...session,
    tier: session.backend ? session.backend.tier : getRole(session.role).tier,
  };
}

export function setSession(patch = {}) {
  const before = session.role;
  if (patch.role) session.role = resolveRole(patch.role);
  if ('userId' in patch) session.userId = patch.userId;
  if ('displayName' in patch) session.displayName = patch.displayName;
  if ('backend' in patch) session.backend = patch.backend;
  if (before !== session.role) bus.emit(EVENTS.ROLE_CHANGED, getSession());
  return getSession();
}

export function currentTier() {
  return session.backend ? session.backend.tier : getRole(session.role).tier;
}

/** Raise or lower one user's tier for the current browser session. */
export function grantTier(userId, tier) {
  overrides.set(String(userId), Number(tier));
  return overrides.get(String(userId));
}

export function revokeTier(userId) {
  overrides.delete(String(userId));
}

/* ------------------------------------------------------------ predicates */

/** Matriks hak akses milik user yang login (dari backend), atau null. */
function backendMatrix() {
  return session.backend;
}

/** True for tier 0 (owner), which is allowed everywhere by definition. */
export function isOwner(roleKey = session.role) {
  const b = backendMatrix();
  if (b) return b.tier === TIER.OWNER;
  return getRole(roleKey).tier === TIER.OWNER;
}

/**
 * May the signed-in user open this menu?
 * API aktif: hanya bila menu ada di `menus` miliknya dari backend
 * (owner/tier 0: selalu ya). API mati: ya (dashboard asli tanpa gate).
 */
export function canAccessMenu(menuKey) {
  const b = backendMatrix();
  if (!b) return true;
  if (b.tier === TIER.OWNER) return true;
  return (b.menus || []).includes(menuKey);
}

/**
 * May the signed-in user perform `action` on `domain`?
 * `domain` = nama domain aksi backend (lihat js/core/tiers.js).
 * API aktif: hanya bila tercantum di `actions` miliknya dari backend
 * (owner/tier 0: selalu ya). API mati: ya.
 */
export function canPerform(domain, action) {
  const b = backendMatrix();
  if (!b) return true;
  if (b.tier === TIER.OWNER) return true;
  const allowed = (b.actions || {})[domain];
  return Array.isArray(allowed) ? allowed.includes(action) : false;
}

/* ------------------------------------------------------------------ DOM */

/** Every navigation element that can activate a menu. */
function navEntries(root = document) {
  return Array.from(root.querySelectorAll('[data-panel], [data-client-tab]'));
}

function entryKey(node) {
  return node.dataset.panel || node.dataset.clientTab || null;
}

/**
 * Remove navigation the signed-in user may not use.
 *
 * The elements carry the same `data-panel` / `data-client-tab` attributes the
 * dashboards already had, so nothing is renamed and the panels themselves stay
 * untouched - only the way in is taken away. Returns the keys that were hidden.
 */
export function applyToNavigation(root = document) {
  const hidden = [];
  for (const node of navEntries(root)) {
    const key = entryKey(node);
    if (!key) continue;
    if (canAccessMenu(key)) continue;

    node.hidden = true;
    node.style.setProperty('display', 'none', 'important');
    node.setAttribute('aria-hidden', 'true');
    node.dataset.n6Locked = String(currentTier());
    hidden.push(key);
  }
  if (hidden.length) {
    bus.emit(EVENTS.ACCESS_DENIED, { role: session.role, tier: currentTier(), menus: hidden });
  }
  return hidden;
}

/**
 * Pick the first menu the user is allowed to open and show it.
 * The originals hard-coded `.active` on whichever entry was first, which is
 * correct for a single-role dashboard and wrong for a gated one.
 */
export function revealEntryPanel(root = document) {
  const candidates = navEntries(root).filter((n) => entryKey(n));
  const allowed = candidates.find((n) => canAccessMenu(entryKey(n)));

  if (!allowed) return null;

  const firstVisible = candidates.find((n) => !n.hidden && !n.dataset.n6Locked);
  if (firstVisible && firstVisible !== allowed) {
    firstVisible.classList.remove('active');
    firstVisible.removeAttribute('aria-current');
  }

  const key = entryKey(allowed);
  allowed.classList.add('active');
  allowed.setAttribute('aria-current', 'page');

  // desktop side-nav keys map 1:1 onto #panel-<key>
  const panel = root.querySelector(`#panel-${key}`);
  if (panel) {
    for (const other of root.querySelectorAll('.panel')) other.classList.remove('active');
    panel.classList.add('active');
  }

  const crumb = root.querySelector('.topbar .title, .topbar h1');
  const label = MENUS[key]?.label ?? key;
  if (crumb) crumb.textContent = label;

  bus.emit(EVENTS.PANEL_CHANGED, { role: session.role, key, panel: panel?.id ?? null });
  return { key, element: allowed, panel };
}

/**
 * Guard a single control. Used for buttons inside a panel that perform an
 * action the tier does not allow. Disabled rather than removed, so the layout
 * does not shift and the reason stays visible on hover.
 */
export function guardControl(node, domain, action) {
  if (!node || canPerform(domain, action)) return node;
  node.disabled = true;
  node.setAttribute('aria-disabled', 'true');
  node.dataset.n6Action = `${domain}.${action}`;
  node.title = node.title
    ? `${node.title} — tidak tersedia untuk peran ini`
    : 'Tidak tersedia untuk peran ini';
  return node;
}

/** Guard every control that opts in with data-n6-action="domain.action". */
export function guardActions(root = document) {
  for (const node of root.querySelectorAll('[data-n6-action]')) {
    const [domain, action] = String(node.dataset.n6Action).split('.');
    guardControl(node, domain, action);
  }
}

/** Run the whole gate. Called once by js/app.js before the role bundle loads. */
export function enforce(root = document, roleKey = session.role) {
  const locked = applyToNavigation(root);
  const entry = revealEntryPanel(root);
  guardActions(root);
  return { role: roleKey, tier: currentTier(), locked, entry };
}

export default {
  getSession, setSession, currentTier, grantTier, revokeTier,
  isOwner, canAccessMenu, canPerform,
  applyToNavigation, revealEntryPanel, guardControl, guardActions, enforce,
};
