// N6 New Era — router. Routing ?role=&menu= dipertahankan untuk kompatibilitas.
import { tierToRole, logout } from './auth.js';
import { caught } from './logger.js';
import { esc } from './utils.js';

// Setiap entri: slug, label, pemuat modul, fungsi render, argumen tambahan.
const REGISTRY = {
  'owner': [
    { slug: 'beranda', label: 'Beranda', load: () => import('../owner/beranda.js') },
    { slug: 'klien', label: 'Klien', load: () => import('../shared/clients/clients.js'), fn: 'renderClients', args: { mode: 'full' } },
    { slug: 'jadwal-klien', label: 'Jadwal Klien', load: () => import('../shared/schedule/schedule.js'), fn: 'renderClientSchedule' },
    { slug: 'jadwal-coach', label: 'Jadwal Coach', load: () => import('../shared/schedule/schedule.js'), fn: 'renderCoachSchedule' },
    { slug: 'harga', label: 'Harga', load: () => import('../shared/pricing/pricing.js'), fn: 'renderPricing', args: { mode: 'edit' } },
    { slug: 'komisi', label: 'Komisi', load: () => import('../owner/komisi.js') },
    { slug: 'keuangan', label: 'Keuangan', load: () => import('../owner/keuangan.js') },
    { slug: 'tiket', label: 'Tiket', load: () => import('../shared/messaging/messaging.js'), fn: 'renderTickets' },
    { slug: 'pesan', label: 'Pesan', load: () => import('../shared/messaging/messaging.js'), fn: 'renderMessages' },
    { slug: 'anggota', label: 'Anggota', load: () => import('../shared/members/members.js') },
    { slug: 'password', label: 'Password', load: () => import('../shared/password/password.js') },
  ],
  'admin': [
    { slug: 'beranda', label: 'Beranda', load: () => import('../admin/beranda.js') },
    { slug: 'klien', label: 'Klien', load: () => import('../shared/clients/clients.js'), fn: 'renderClients', args: { mode: 'full' } },
    { slug: 'jadwal-klien', label: 'Jadwal Klien', load: () => import('../shared/schedule/schedule.js'), fn: 'renderClientSchedule' },
    { slug: 'jadwal-coach', label: 'Jadwal Coach', load: () => import('../shared/schedule/schedule.js'), fn: 'renderCoachSchedule' },
    { slug: 'harga', label: 'Harga', load: () => import('../shared/pricing/pricing.js'), fn: 'renderPricing', args: { mode: 'read' } },
    { slug: 'tiket', label: 'Tiket', load: () => import('../shared/messaging/messaging.js'), fn: 'renderTickets' },
    { slug: 'pesan', label: 'Pesan', load: () => import('../shared/messaging/messaging.js'), fn: 'renderMessages' },
    { slug: 'password', label: 'Password', load: () => import('../shared/password/password.js') },
  ],
  'head-coach': [
    { slug: 'beranda', label: 'Beranda', load: () => import('../head-coach/beranda.js') },
    { slug: 'program', label: 'Program', load: () => import('../head-coach/program.js') },
    { slug: 'monitoring', label: 'Monitoring', load: () => import('../head-coach/monitoring.js') },
    { slug: 'pesan', label: 'Pesan', load: () => import('../shared/messaging/messaging.js'), fn: 'renderMessages' },
    { slug: 'coach', label: 'Coach', load: () => import('../head-coach/coach.js') },
    { slug: 'klien', label: 'Klien', load: () => import('../shared/clients/clients.js'), fn: 'renderClients', args: { mode: 'full' } },
    { slug: 'koreksi', label: 'Koreksi', load: () => import('../head-coach/koreksi.js') },
    { slug: 'atlet', label: 'Atlet', load: () => import('../head-coach/atlet.js') },
    { slug: 'password', label: 'Password', load: () => import('../shared/password/password.js') },
  ],
  'coach': [
    { slug: 'beranda', label: 'Beranda', load: () => import('../coach/beranda.js') },
    { slug: 'klien', label: 'Klien', load: () => import('../shared/clients/clients.js'), fn: 'renderClients', args: { mode: 'read' } },
    { slug: 'informasi', label: 'Informasi', load: () => import('../coach/informasi.js') },
    { slug: 'absensi', label: 'Absensi', load: () => import('../coach/absensi.js') },
    { slug: 'password', label: 'Password', load: () => import('../shared/password/password.js') },
  ],
  'client': [
    { slug: 'laporan', label: 'Laporan', load: () => import('../client/laporan.js') },
    { slug: 'performa', label: 'Performa', load: () => import('../client/performa.js') },
    { slug: 'chat', label: 'Chat', load: () => import('../shared/messaging/messaging.js'), fn: 'renderMessages' },
    { slug: 'password', label: 'Password', load: () => import('../shared/password/password.js') },
  ],
};

let cleanup = null;
let currentKey = '';

function readParams() {
  const q = new URLSearchParams(window.location.search);
  const params = {};
  for (const [k, v] of q.entries()) params[k] = v;
  return params;
}

export function navigate(role, menu, extra = {}) {
  const q = new URLSearchParams({ role, menu, ...extra });
  const url = window.location.pathname + '?' + q.toString();
  window.history.pushState({}, '', url);
  render();
}

function shell(container, user, role, menus, active) {
  const name = esc(user.full_name || user.username || '');
  container.innerHTML =
    '<header class="topbar"><div class="topbar-title">N6</div>' +
    '<div class="topbar-user"><span>' + name + '</span>' +
    '<button class="btn btn-ghost" id="btnLogout">Keluar</button></div></header>' +
    '<main class="page" id="page"></main>' +
    '<nav class="bottomnav" aria-label="Menu utama">' +
    menus.map((m) =>
      '<button class="bottomnav-item' + (m.slug === active ? ' is-active' : '') + '"' +
      ' data-menu="' + m.slug + '">' + esc(m.label) + '</button>'
    ).join('') +
    '</nav>';
  container.querySelector('#btnLogout').addEventListener('click', async () => {
    await logout();
    window.location.replace(window.location.pathname);
  });
  container.querySelectorAll('.bottomnav-item').forEach((b) => {
    b.addEventListener('click', () => navigate(role, b.dataset.menu));
  });
  return container.querySelector('#page');
}

export async function render() {
  const app = document.getElementById('app');
  const params = readParams();
  const { getUser } = await import('./store.js');
  const user = getUser();
  if (!user) return;

  let role = params.role;
  const expected = tierToRole(user.tier);
  if (role !== expected) {
    navigate(expected, 'beranda');
    return;
  }
  const menus = REGISTRY[role] || [];
  let entry = menus.find((m) => m.slug === params.menu);
  if (!entry) {
    navigate(role, menus[0] ? menus[0].slug : 'beranda');
    return;
  }

  const key = role + '/' + entry.slug + JSON.stringify(params);
  if (key === currentKey) return;
  currentKey = key;

  if (cleanup) {
    try { cleanup(); } catch (e) { caught(e, 'cleanup'); }
    cleanup = null;
  }

  const page = shell(app, user, role, menus, entry.slug);
  page.innerHTML = '<div class="loading" role="status">Memuat…</div>';

  try {
    const mod = await entry.load();
    const fn = mod[entry.fn || 'render'];
    page.innerHTML = '';
    const ctx = { user, role, params, navigate, query: params };
    const maybeCleanup = await fn(page, { ...ctx, ...(entry.args || {}) });
    if (typeof maybeCleanup === 'function') cleanup = maybeCleanup;
  } catch (e) {
    caught(e, 'router render ' + key);
    page.innerHTML =
      '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    page.querySelector('#retryBtn').addEventListener('click', () => {
      currentKey = '';
      render();
    });
  }
}

export function initRouter() {
  window.addEventListener('popstate', () => { currentKey = ''; render(); });
}
