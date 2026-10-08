// N6 New Era — jadwal. Satu modul menggantikan 2 modul identik jadwal-coach-export.js.
import { get, ApiError } from '../../core/api.js';
import { emptyStateHTML } from '../../ui/empty-state.js';
import { toast } from '../../ui/toast.js';
import { caught } from '../../core/logger.js';
import { esc, formatTanggal } from '../../core/utils.js';

function scheduleListHTML(items) {
  if (!items.length) {
    return emptyStateHTML({ title: 'Belum ada jadwal', desc: 'Jadwal 30 hari ke depan akan muncul di sini.' });
  }
  return '<div class="schedule-list">' + items.map((s) =>
    '<div class="schedule-item"><strong>' + esc(formatTanggal(s.date || s.scheduled_on)) + '</strong>' +
    '<span>' + esc(s.title || s.session || '') + '</span>' +
    (s.coach_name ? '<span class="muted">' + esc(s.coach_name) + '</span>' : '') +
    '</div>'
  ).join('') + '</div>';
}

async function fetchList(path, list) {
  list.innerHTML = '<div class="loading">Memuat…</div>';
  try {
    const data = await get(path, { limit: 100 });
    const items = (data && data.items) || [];
    list.innerHTML = scheduleListHTML(items);
  } catch (e) {
    caught(e, 'jadwal load ' + path);
    list.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    list.querySelector('#retryBtn').addEventListener('click', () => fetchList(path, list));
  }
}

export async function renderClientSchedule(container) {
  container.innerHTML = '<h1 class="page-title">Jadwal Klien</h1><div id="list"></div>';
  await fetchList('/schedules/clients', container.querySelector('#list'));
}

export async function renderCoachSchedule(container) {
  container.innerHTML = '<h1 class="page-title">Jadwal Coach</h1>' +
    '<div class="page-actions"><button class="btn" id="dlBtn">Unduh (JPG)</button></div>' +
    '<div id="list"></div>';
  const list = container.querySelector('#list');
  await fetchList('/schedules/coach', list);
  container.querySelector('#dlBtn').addEventListener('click', () => {
    toast('Ekspor JPG belum tersedia di versi ini.', 'info');
  });
}
