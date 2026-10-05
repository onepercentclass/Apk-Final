/**
 * N6 - small, dependency-free helpers
 *
 * The original dashboards each carried their own copy of these functions
 * (escapeHtml, todayISO, formatRupiah, ...). Those copies are still in the
 * role bundles and still work; this module is what new code uses.
 */

export const MONTHS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

export const MONTHS_ID_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export const DAYS_ID = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

/** Escape a value for interpolation into HTML text or a quoted attribute. */
export function escapeHtml(value) {
  const s = value == null ? '' : String(value);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Local date as YYYY-MM-DD. Deliberately not toISOString(), which is UTC. */
export function todayISO(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Local time as HH:MM. */
export function nowHM(d = new Date()) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}

/** Whole days between two ISO dates. */
export function daysBetween(fromISO, toISO) {
  const a = new Date(`${fromISO}T00:00:00`);
  const b = new Date(`${toISO}T00:00:00`);
  return Math.round((b - a) / 86400000);
}

/** "12 Mei 2026". Returns '-' for empty input, matching the original. */
export function formatDateID(dateStr) {
  if (!dateStr) return '-';
  const d = toLocalDate(dateStr);
  if (!d) return String(dateStr);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

/** Parse YYYY-MM-DD (or an ISO timestamp) without UTC shifting. */
export function toLocalDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const s = String(value);
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Rp1.234.567" */
export function formatRupiah(n) {
  const v = Number(n) || 0;
  return `Rp${v.toLocaleString('id-ID')}`;
}

/** Compact rupiah for dense table cells: "Rp1,2 jt". */
export function formatRupiahShort(n) {
  const v = Number(n) || 0;
  if (Math.abs(v) >= 1e9) return `Rp${(v / 1e9).toFixed(1).replace('.', ',')} M`;
  if (Math.abs(v) >= 1e6) return `Rp${(v / 1e6).toFixed(1).replace('.', ',')} jt`;
  if (Math.abs(v) >= 1e3) return `Rp${(v / 1e3).toFixed(0)} rb`;
  return `Rp${v}`;
}

/** Turn "Budi Santoso" into "budi-santoso", for slugs and filenames. */
export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Monday-based weekday name for a date or ISO string. */
export function dayNameID(value = new Date()) {
  const d = toLocalDate(value) || new Date();
  const jsDay = d.getDay(); // 0 = Sunday
  return DAYS_ID[jsDay === 0 ? 6 : jsDay - 1];
}

/** Deep clone via structuredClone, falling back to JSON for older engines. */
export function clone(value) {
  if (value == null) return value;
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

/** Structured deep merge; arrays are replaced, not concatenated. */
export function deepMerge(base, patch) {
  if (Array.isArray(patch) || patch == null) return patch;
  if (typeof patch !== 'object') return patch;
  const out = base && typeof base === 'object' && !Array.isArray(base) ? { ...base } : {};
  for (const [k, v] of Object.entries(patch)) {
    out[k] = v && typeof v === 'object' && !Array.isArray(v) ? deepMerge(out[k], v) : v;
  }
  return out;
}

/** Stable, dependency-free unique id for local records. */
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/** Coerce anything a form or API can produce into a finite number. */
export function toNumber(value, fallback = 0) {
  const n = typeof value === 'string' ? Number(value.replace(/[^\d.-]/g, '')) : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Coerce to boolean, treating "false"/0/"" as false. */
export function toBool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'string') return !/^(false|0|no|off)$/i.test(value);
  return Boolean(value);
}

/** RFC-ish YYYY-MM for `<input type="month">` values. */
export function currentMonth(d = new Date()) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

/** Every ISO date in [fromISO, toISO] inclusive. */
export function eachDayISO(fromISO, toISO) {
  const out = [];
  const end = toLocalDate(toISO);
  if (!end) return out;
  for (let d = toLocalDate(fromISO); d && d <= end; d.setDate(d.getDate() + 1)) {
    out.push(todayISO(d));
  }
  return out;
}

/** Non-blocking error toast. Replaced at runtime by a role's own showToast. */
let toastHandler = null;
export function setToastHandler(fn) {
  toastHandler = typeof fn === 'function' ? fn : null;
}
export function notify(message, kind = 'info') {
  if (toastHandler) return toastHandler(message, kind);
  if (typeof console !== 'undefined') console.log(`[n6:${kind}] ${message}`);
}