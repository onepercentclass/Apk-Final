/**
 * N6 - role and menu registry
 *
 * The single place that answers "which role am I, what may I open, and which
 * files does that role need".
 *
 * Menu keys and labels come straight from the `data-panel` / `data-client-tab`
 * attributes that the five original dashboards already put on their navigation
 * elements, so this registry describes the existing UI rather than inventing a
 * parallel one. Asset order comes from the generated js/core/bundles.js.
 */

import { ROLE_ASSETS } from './bundles.js';
import { DEFAULT_ROLE } from './config.js';

/**
 * Tier ladder. A user at tier T may use any feature whose tier is >= T, so
 * tier 0 (owner) reaches everything. Do not renumber: backend/tiers/*.json
 * and the FastAPI dependency both hard-code these numbers.
 */
export const TIER = Object.freeze({
  OWNER: 0,
  ADMIN: 1,
  HEADCOACH: 2,
  COACH: 3,
  CLIENT: 4,
});

/**
 * Every role the application knows about.
 *
 *   tier        number used by the access rule
 *   entryMenu   the sidebar entry that is active on first paint
 *   selectors   the attribute pairs that identify this role's nav entries
 */
export const ROLES = Object.freeze({
  owner: {
    tier: TIER.OWNER,
    label: 'Owner',
    title: 'Dashboard Owner',
    entryMenu: 'beranda',
    selectors: ['[data-panel]'],
    tierFile: null,
    note: 'Full access. No backend/tiers JSON: owner is the implicit "everything" case.',
  },
  admin: {
    tier: TIER.ADMIN,
    label: 'Admin CS',
    title: 'Dashboard Admin CS',
    entryMenu: 'beranda',
    selectors: ['[data-panel]'],
    tierFile: 'tier-1-admin.json',
  },
  headcoach: {
    tier: TIER.HEADCOACH,
    label: 'Head Coach',
    title: 'Dashboard Head Coach',
    entryMenu: 'hub',
    selectors: ['[data-panel]'],
    tierFile: 'tier-2-headcoach.json',
  },
  coach: {
    tier: TIER.COACH,
    label: 'Coach',
    title: 'Dashboard Coach',
    entryMenu: 'home',
    selectors: ['[data-panel]'],
    tierFile: 'tier-3-coach.json',
  },
  client: {
    tier: TIER.CLIENT,
    label: 'Client',
    title: 'Dashboard Client',
    entryMenu: 'laporan',
    selectors: ['[data-client-tab]', '.bottom-nav [data-tab]'],
    tierFile: 'tier-4-client.json',
  },
});

export const ROLE_KEYS = Object.freeze(Object.keys(ROLES));

/**
 * Menu catalogue. `tier` is the highest (least privileged) tier that is still
 * allowed to open the menu, which is what the "owner sees everything" rule
 * is built on. `roles` lists the dashboards that actually render it.
 */
export const MENUS = Object.freeze({
  komisi:      { label: 'Performa & Komisi',  tier: TIER.OWNER,     roles: ['owner'], group: 'owner' },
  keuangan:    { label: 'Keuangan',           tier: TIER.OWNER,     roles: ['owner'], group: 'owner' },
  beranda:     { label: 'Beranda',            tier: TIER.OWNER,     roles: ['owner'], group: 'owner' },
  klien:       { label: 'Klien',              tier: TIER.ADMIN,     roles: ['owner', 'admin', 'headcoach', 'coach'], group: 'admin' },
  jadwalklien: { label: 'Jadwal Klien',       tier: TIER.ADMIN,     roles: ['owner', 'admin'], group: 'admin' },
  jadwalcoach: { label: 'Jadwal Coach',       tier: TIER.ADMIN,     roles: ['owner', 'admin'], group: 'admin' },
  harga:       { label: 'Harga & Program',    tier: TIER.ADMIN,     roles: ['owner', 'admin'], group: 'admin' },
  tiket:       { label: 'Tiket & Keluhan',    tier: TIER.ADMIN,     roles: ['owner', 'admin'], group: 'admin' },
  pesan:       { label: 'Pesan',              tier: TIER.ADMIN,     roles: ['owner', 'admin'], group: 'admin' },
  hub:         { label: 'Beranda',            tier: TIER.HEADCOACH, roles: ['headcoach'], group: 'headcoach' },
  hcmanual:    { label: 'Buat Program',       tier: TIER.HEADCOACH, roles: ['headcoach'], group: 'headcoach' },
  hcmonitor:   { label: 'Monitoring Klien',   tier: TIER.HEADCOACH, roles: ['headcoach'], group: 'headcoach' },
  hcclientchat:{ label: 'Pesan',              tier: TIER.HEADCOACH, roles: ['headcoach'], group: 'headcoach' },
  coach:       { label: 'Coach',              tier: TIER.HEADCOACH, roles: ['headcoach'], group: 'headcoach' },
  koreksi:     { label: 'Koreksi',            tier: TIER.HEADCOACH, roles: ['headcoach'], group: 'headcoach' },
  atlet:       { label: 'Atlet Binaan',       tier: TIER.HEADCOACH, roles: ['headcoach'], group: 'headcoach' },
  home:        { label: 'Beranda',            tier: TIER.COACH,     roles: ['coach'], group: 'coach' },
  info:        { label: 'Informasi',          tier: TIER.COACH,     roles: ['coach'], group: 'coach' },
  jadwal:      { label: 'Absensi',            tier: TIER.COACH,     roles: ['coach'], group: 'coach' },
  laporan:     { label: 'Laporan',            tier: TIER.CLIENT,    roles: ['client'], group: 'client' },
  performa:    { label: 'Performa',           tier: TIER.CLIENT,    roles: ['client'], group: 'client' },
  chat:        { label: 'Chat',               tier: TIER.CLIENT,    roles: ['client'], group: 'client' },
});

export const MENU_KEYS = Object.freeze(Object.keys(MENUS));

/** Normalise anything a caller might pass into a known role key. */
export function resolveRole(value) {
  if (!value) return DEFAULT_ROLE;
  const key = String(value).trim().toLowerCase();
  if (ROLES[key]) return key;
  const byLabel = ROLE_KEYS.find((r) => ROLES[r].label.toLowerCase() === key);
  if (byLabel) return byLabel;
  const numeric = Number(key);
  if (Number.isInteger(numeric) && ROLE_KEYS.includes(numeric)) return numeric;
  const byTier = ROLE_KEYS.find((r) => ROLES[r].tier === numeric);
  return byLabel || byTier || DEFAULT_ROLE;
}

/** Full descriptor for a role: identity, catalogue menus, and asset list.
 * Hak akses per user TIDAK ada di sini — saat API aktif ia datang dari
 * backend (GET /api/n6/v1/auth/me) dan disimpan di sesi oleh
 * js/core/access.js. `menus` di bawah murni vocabulary katalog. */
export function getRole(roleKey) {
  const key = resolveRole(roleKey);
  const role = ROLES[key];
  return {
    key,
    ...role,
    assets: ROLE_ASSETS[key] || { css: [], scripts: [] },
    menus: MENU_KEYS.filter((m) => MENUS[m].roles.includes(key)),
  };
}

/** Menus the given role may open, in catalogue order. */
export function menusForRole(roleKey) {
  return getRole(roleKey).menus;
}

/** Label for a menu key, falling back to the raw key. */
export function menuLabel(key) {
  return MENUS[key]?.label ?? key;
}

/** True when the role's markup contains the given menu at all. */
export function roleHasMenu(roleKey, menuKey) {
  return MENUS[menuKey]?.roles.includes(resolveRole(roleKey)) ?? false;
}

export { ROLE_ASSETS };