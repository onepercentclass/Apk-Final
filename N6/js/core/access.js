/**
 * N6 - tier access gate
 *
 * Implements one rule, consistently, in one place:
 *
 *     a user at tier T may use any feature whose tier is >= T
 *
 * So owner (tier 0) reaches everything, and the client portal (tier 4) reaches
 * only what is marked tier 4. The tier numbers and the per-tier menu/action
 * lists come from backend/tiers/*.json, mirrored into js/core/tiers.js by
 * tools/build.ps1. Do not hand-edit that mirror.
 *
 * What this module is: a way to hide navigation the signed-in person has no
 * business opening, so the UI matches what the server will allow.
 *
 * What this module is NOT: a security boundary. Anything a browser can be
 * asked to do, a user can be tricked into doing. The authoritative check is
 * backend/app/api/deps.py::require, which loads the same JSON files and
 * answers with 403.
 */

import { ROLES, TIER, MENUS, getRole, resolveRole } from './registry.js';
import { EVENTS, bus } from './events.js';

/** Current session. Replaced by sign-in once the API is enabled. */
const session = {
  role: 'owner',
  userId: null,
  displayName: null,
};

/** Explicit per-user overrides, e.g. a coach promoted to head coach. */
const overrides = new Map();

export function getSession() {
  return { ...session, tier: getRole(session.role).tier };
}

export function setSession(patch = {}) {
  const before = session.role;
  if (patch.role) session.role = resolveRole(patch.role);
  if ('userId' in patch) session.userId = patch.userId;
  if ('displayName' in patch) session.displayName = patch.displayName;
  if (before !== session.role) bus.emit(EVENTS.ROLE_CHANGED, getSession());
  return getSession();
}

export function currentTier() {
  return getRole(session.role).tier;
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

/** True for tier 0 (owner), which is allowed everywhere by definition. */
export function isOwner(roleKey = session.role) {
  return getRole(roleKey).tier === TIER.OWNER;
}

/**
 * May this role open this menu?
 * Owner: yes. Everyone else: only if the menu is in their tier file.
 */
export function canAccessMenu(menuKey, roleKey = session.role) {
  const role = getRole(roleKey);
  if (role.tier === TIER.OWNER) return true;
  return role.tierDef ? role.tierDef.menus.includes(menuKey) : false;
}

/**
 * May this role perform `action` on `domain`?
 * `domain` matches the group names used in backend/tiers/*.json, e.g.
 * canPerform('clients', 'archive').
 */
export function canPerform(domain, action, roleKey = session.role) {
  const role = getRole(roleKey);
  if (role.tier === TIER.OWNER) return true;
  if (!role.tierDef) return false;
  const allowed = role.tierDef.actions?.[domain];
  return Array.isArray(allowed) ? allowed.includes(action) : false;
}

/**
 * Cross-check between the catalogue and the tier files.
 * Catches a menu that exists in MENUS but was forgotten in a tier JSON.
 */
export function auditAccessMatrix() {
  const problems = [];
  for (const [key, meta] of Object.entries(MENUS)) {
    for (const roleKey of meta.roles) {
      if (!canAccessMenu(key, roleKey)) {
        problems.push(`menu "${key}" is declared for role "${roleKey}" but is missing from its tier file`);
      }
    }
  }
  return problems;
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
 * Remove navigation the role may not use.
 *
 * The elements carry the same `data-panel` / `data-client-tab` attributes the
 * dashboards already had, so nothing is renamed and the panels themselves stay
 * untouched - only the way in is taken away. Returns the keys that were hidden.
 */
export function applyToNavigation(root = document, roleKey = session.role) {
  const hidden = [];
  for (const node of navEntries(root)) {
    const key = entryKey(node);
    if (!key) continue;
    if (canAccessMenu(key, roleKey)) continue;

    node.hidden = true;
    node.style.setProperty('display', 'none', 'important');
    node.setAttribute('aria-hidden', 'true');
    node.dataset.n6Locked = String(getRole(roleKey).tier);
    hidden.push(key);
  }
  if (hidden.length) {
    bus.emit(EVENTS.ACCESS_DENIED, { role: roleKey, tier: getRole(roleKey).tier, menus: hidden });
  }
  return hidden;
}

/**
 * Pick the first menu the role is allowed to open and show it.
 * The originals hard-coded `.active` on whichever entry was first, which is
 * correct for a single-role dashboard and wrong for a gated one.
 */
export function revealEntryPanel(root = document, roleKey = session.role) {
  const role = getRole(roleKey);
  const candidates = navEntries(root).filter((n) => entryKey(n));
  const allowed = candidates.find((n) => canAccessMenu(entryKey(n), roleKey));

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

  bus.emit(EVENTS.PANEL_CHANGED, { role: roleKey, key, panel: panel?.id ?? null });
  return { key, element: allowed, panel };
}

/**
 * Guard a single control. Used for buttons inside a panel that perform an
 * action the tier does not allow. Disabled rather than removed, so the layout
 * does not shift and the reason stays visible on hover.
 */
export function guardControl(node, domain, action, roleKey = session.role) {
  if (!node || canPerform(domain, action, roleKey)) return node;
  node.disabled = true;
  node.setAttribute('aria-disabled', 'true');
  node.dataset.n6Action = `${domain}.${action}`;
  node.title = node.title
    ? `${node.title} — tidak tersedia untuk peran ini`
    : 'Tidak tersedia untuk peran ini';
  return node;
}

/** Guard every control that opts in with data-n6-action="domain.action". */
export function guardActions(root = document, roleKey = session.role) {
  for (const node of root.querySelectorAll('[data-n6-action]')) {
    const [domain, action] = String(node.dataset.n6Action).split('.');
    guardControl(node, domain, action, roleKey);
  }
}

/** Run the whole gate. Called once by js/app.js before the role bundle loads. */
export function enforce(root = document, roleKey = session.role) {
  const locked = applyToNavigation(root, roleKey);
  const entry = revealEntryPanel(root, roleKey);
  guardActions(root, roleKey);
  const problems = auditAccessMatrix();
  if (problems.length) console.warn('[n6] access matrix drift:', problems);
  return { role: roleKey, tier: getRole(roleKey).tier, locked, entry, problems };
}

export default {
  getSession, setSession, currentTier, grantTier, revokeTier,
  isOwner, canAccessMenu, canPerform, auditAccessMatrix,
  applyToNavigation, revealEntryPanel, guardControl, guardActions, enforce,
};