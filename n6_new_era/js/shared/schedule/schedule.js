// N6 New Era — jadwal.
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

function slotsToItems(data) {
  // Backend /schedules/coach mengembalikan { slots: [...] }.
  const slots = (data && data.slots) || (data && data.items) || [];
  return slots.map((s) => ({
    date: s.date || s.scheduled_on,
    title: s.title || s.session || s.client_name || '',
    coach_name: s.coach_name || '',
  }));
}

async function fetchList(path, params, list) {
  list.innerHTML = '<div class="loading">Memuat…</div>';
  try {
    const data = await get(path, params);
    list.innerHTML = scheduleListHTML(slotsToItems(data));
  } catch (e) {
    caught(e, 'jadwal load ' + path);
    const msg = e instanceof ApiError && e.status === 404
      ? 'Data jadwal belum tersedia.'
      : 'Terjadi gangguan, coba lagi.';
    list.innerHTML = '<div class="page-error"><p>' + esc(msg) + '</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    list.querySelector('#retryBtn').addEventListener('click', () => fetchList(path, params, list));
  }
}

export async function renderClientSchedule(container) {
  // Backend belum menyediakan GET /schedules/clients (404).
  // Tampilkan empty state yang jelas alih-alih error generik.
  container.innerHTML = '<h1 class="page-title">Jadwal Klien</h1>' +
    emptyStateHTML({
      title: 'Jadwal klien belum tersedia',
      desc: 'Backend belum menyediakan data jadwal klien.',
    });
}

export async function renderCoachSchedule(container, ctx = {}) {
  const role = ctx.role || '';
  container.innerHTML = '<h1 class="page-title">Jadwal Coach</h1>' +
    '<div class="page-actions"><button class="btn" id="dlBtn">Unduh (JPG)</button></div>' +
    '<div id="coachPick"></div><div id="list"></div>';
  const list = container.querySelector('#list');
  const pick = container.querySelector('#coachPick');
  container.querySelector('#dlBtn').addEventListener('click', () => {
    toast('Ekspor JPG belum tersedia di versi ini.', 'info');
  });

  // Coach: backend menginfer coach_id dari token. Owner/admin: pilih coach.
  if (role === 'coach') {
    await fetchList('/schedules/coach', {}, list);
    return;
  }
  try {
    const data = await get('/accounts', { tier: 3, limit: 100 });
    const coaches = (data && data.items) || [];
    if (!coaches.length) {
      list.innerHTML = emptyStateHTML({ title: 'Belum ada coach' });
      return;
    }
    pick.innerHTML = '<label class="field"><span>Coach</span><select id="coachSel">' +
      coaches.map((c) => '<option value="' + c.id + '">' + esc(c.full_name || c.username) + '</option>').join('') +
      '</select></label>';
    const sel = pick.querySelector('#coachSel');
    const loadSel = () => fetchList('/schedules/coach', { coach_id: sel.value }, list);
    sel.addEventListener('change', loadSel);
    await loadSel();
  } catch (e) {
    caught(e, 'jadwal coach daftar coach');
    list.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    list.querySelector('#retryBtn').addEventListener('click', () => renderCoachSchedule(container, ctx));
  }
}
