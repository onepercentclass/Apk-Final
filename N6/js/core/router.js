/**
 * N6 - router
 *
 * The five dashboards were five separate pages, each with its own navigation
 * logic. This is the thin layer that lets one index.html serve all five:
 *
 *   index.html?role=owner            -> owner dashboard
 *   index.html?role=admin            -> admin dashboard
 *   index.html?role=headcoach#klien  -> head coach, Klien panel selected
 *   index.html?role=client&client=42 -> athlete portal for client 42
 *
 * The router deliberately does NOT intercept clicks on the sidebar. The role
 * bundles already own that behaviour and are loaded verbatim; duplicating it
 * here would mean two code paths keeping the same panel state in sync.
 */

import { DEFAULT_ROLE, ROLE_PARAM, CLIENT_PARAM } from './config.js';
import { resolveRole } from './registry.js';
import { EVENTS, bus } from './events.js';

const listeners = new Set();
let state = { role: DEFAULT_ROLE, menu: null, clientId: null };

function readParams() {
  const url = new URL(window.location.href);
  const hash = window.location.hash.replace(/^#/, '');
  return {
    role: resolveRole(url.searchParams.get(ROLE_PARAM) || hash.split('/')[0] || DEFAULT_ROLE),
    menu: url.searchParams.get('menu') || (hash && !hash.includes('/') ? hash : null),
    clientId: url.searchParams.get(CLIENT_PARAM) || '',
  };
}

/** Initial state, derived from the URL only. */
export function init() {
  state = readParams();
  window.addEventListener('popstate', () => {
    state = readParams();
    notify('popstate');
  });
  return { ...state };
}

export function getState() {
  return { ...state };
}

/** Rewrite the address bar without adding a history entry per click. */
export function navigate(patch = {}, { replace = true } = {}) {
  const url = new URL(window.location.href);
  if ('role' in patch) url.searchParams.set(ROLE_PARAM, resolveRole(patch.role));
  if ('menu' in patch) url.searchParams.set('menu', patch.menu);
  if ('clientId' in patch && patch.clientId) url.searchParams.set(CLIENT_PARAM, patch.clientId);
  window.history[replace ? 'replaceState' : 'pushState']({}, '', url);
  state = readParams();
  notify('navigate');
}

/** Track menu changes so new modules can react without patching old code. */
export function onChange(handler) {
  if (typeof handler !== 'function') return () => {};
  listeners.add(handler);
  return () => listeners.delete(handler);
}

function notify(reason) {
  for (const handler of Array.from(listeners)) {
    try {
      handler(getState(), reason);
    } catch (err) {
      console.error('[n6] router listener threw', err);
    }
  }
  bus.emit(EVENTS.PANEL_CHANGED, getState());
}

/**
 * Observe sidebar clicks without taking them over. Used by js/app.js to keep
 * the URL in step with the panel the role bundle just switched to.
 */
export function observeNavigation(root = document) {
  root.addEventListener('click', (event) => {
    const node = event.target instanceof Element
      ? event.target.closest('[data-panel], [data-client-tab]')
      : null;
    if (!node || node.hidden || node.dataset.n6Locked) return;
    const key = node.dataset.panel || node.dataset.clientTab;
    if (!key) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('menu') !== key) {
      url.searchParams.set('menu', key);
      window.history.replaceState({}, '', url);
    }
  }, true);
}

export default { init, getState, navigate, onChange, observeNavigation };