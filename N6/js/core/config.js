/**
 * N6 - application configuration
 *
 * Static, build-time constants. Anything that a deployment might want to
 * change lives in js/core/env.js instead, so this file stays a pure
 * description of the application rather than of one environment.
 */

/** Human readable product name, used in the page title and the report footer. */
export const APP_NAME = 'NUMBER SIX';

/** Sub-brand printed on exports. */
export const APP_SUBTITLE = 'RUNNING & PERFORMANCE SYSTEM';

/**
 * Key prefix for everything this app writes to localStorage.
 * The original dashboards stored under a mix of `n6Owner:`, `n6csAdmin:`,
 * `n6-client-theme`, `n6:...` and bare names. Those keys are preserved by
 * js/core/storage.js so existing browser data keeps working untouched.
 */
export const STORAGE_PREFIX = 'n6:';

/**
 * localStorage keys that belong to a specific role and must never be read by
 * another one. The original owner dashboard already segregated Owner records
 * from Admin CS records on the same origin; that isolation is kept here.
 */
export const ROLE_NAMESPACES = {
  owner: 'n6Owner:',
  admin: 'n6csAdmin:',
  headcoach: 'n6HeadCoach:',
  coach: 'n6Coach:',
  client: 'n6Client:',
};

/** Keys shared by every role on the same origin (coach roster, schedule, days off). */
export const SHARED_KEYS = ['coachRoster', 'coachSchedule', 'coachDayOff'];

/** Default role when the URL does not name one. */
export const DEFAULT_ROLE = 'owner';

/** Query parameter that selects the role. */
export const ROLE_PARAM = 'role';

/** Query parameter the client portal uses to identify the athlete. */
export const CLIENT_PARAM = 'client';

/** Where the athlete portal is expected to live once the API is enabled. */
export const CLIENT_PORTAL_PATH = 'portal.html';

/** Schema version for locally persisted state. Bump to invalidate old data. */
export const STATE_VERSION = 1;