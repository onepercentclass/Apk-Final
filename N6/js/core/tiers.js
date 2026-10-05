/**
 * N6 - tier access matrix (FRONTEND MIRROR)
 *
 * GENERATED FILE - do not edit by hand.
 * Source of truth: backend/tiers/tier-*.json (one file per role tier).
 * Regenerate with:  powershell -ExecutionPolicy Bypass -File tools/build.ps1
 *
 * Access rule
 * -----------
 *   tier 0 = owner     -> full access to every menu and every action
 *   tier 1 = admin
 *   tier 2 = headcoach
 *   tier 3 = coach
 *   tier 4 = client
 *
 * Each tier file lists the menus that role may open and, per domain, the
 * actions it may perform. There is no separate tier-0 JSON: owner is the
 * implicit "everything is allowed" case.
 */

/** tier 3 - Coach */
export const TIER_03_COACH = {
  tier: 3,
  role: 'coach',
  label: 'Coach',
  description: 'Runs day-to-day sessions: attendance, assigned clients, own messages and read-only program access.',
  menus: ['home', 'klien', 'info', 'jadwal'],
  actions: {
    accounts: [],
    attendance: ['view', 'manage'],
    client_schedule: ['view', 'manage'],
    clients: ['view', 'update'],
    coach_schedule: ['view'],
    commissions: [],
    corrections: ['view'],
    finance: [],
    messages: ['view', 'send'],
    monitoring: ['view'],
    pricing: [],
    programs: ['view'],
    reports: ['view', 'export'],
    tickets: []
  },
};

/** tier 4 - Client */
export const TIER_04_CLIENT = {
  tier: 4,
  role: 'client',
  label: 'Client',
  description: 'Athlete portal. Own data only, reached through a per-client link. Nothing here exposes another client.',
  menus: ['laporan', 'performa', 'chat'],
  actions: {
    accounts: [],
    athletes: [],
    attendance: [],
    client_schedule: [],
    clients: [],
    coach_schedule: [],
    commissions: [],
    corrections: [],
    finance: [],
    messages: ['view', 'send'],
    monitoring: [],
    own_profile: ['view', 'update'],
    pricing: [],
    programs: [],
    reports: ['view', 'export'],
    tickets: []
  },
};

/** tier 1 - Admin CS */
export const TIER_01_ADMIN = {
  tier: 1,
  role: 'admin',
  label: 'Admin CS',
  description: 'Customer service / operations. Sees everything the head coach and below can see, plus client records, coach scheduling and pricing.',
  menus: ['beranda', 'klien', 'jadwalklien', 'jadwalcoach', 'harga', 'tiket', 'pesan'],
  actions: {
    accounts: ['view'],
    attendance: ['view'],
    client_schedule: ['view', 'manage'],
    clients: ['view', 'create', 'update', 'archive', 'export'],
    coach_schedule: ['view', 'manage', 'requests'],
    commissions: [],
    corrections: ['view'],
    finance: [],
    messages: ['view', 'send'],
    monitoring: ['view'],
    pricing: ['view', 'manage'],
    programs: ['view'],
    reports: ['view', 'generate', 'export'],
    tickets: ['view', 'reply', 'close']
  },
};

/** tier 2 - Head Coach */
export const TIER_02_HEADCOACH = {
  tier: 2,
  role: 'headcoach',
  label: 'Head Coach',
  description: 'Builds training programs, monitors the athlete squad and coaches, and can issue corrections.',
  menus: ['hub', 'hcmanual', 'hcmonitor', 'hcclientchat', 'coach', 'klien', 'koreksi', 'atlet'],
  actions: {
    accounts: [],
    athletes: ['view', 'manage'],
    attendance: ['view'],
    client_schedule: ['view'],
    clients: ['view', 'update'],
    coach_schedule: ['view', 'manage', 'requests'],
    commissions: [],
    corrections: ['view', 'manage'],
    finance: [],
    messages: ['view', 'send'],
    monitoring: ['view'],
    pricing: ['view'],
    programs: ['view', 'manage', 'publish'],
    reports: ['view', 'generate', 'export'],
    tickets: ['view']
  },
};

export const TIERS = {
  3: TIER_03_COACH,  4: TIER_04_CLIENT,  1: TIER_01_ADMIN,  2: TIER_02_HEADCOACH
};

export default TIERS;
