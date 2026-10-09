// N6 New Era — jadwal.
import { get, put, ApiError } from '../../core/api.js';
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
  // Backend /schedules/clients mengembalikan Page { items: [{client_id, client_name, slots}] }.
  const items = (data && data.items) || [];
  // Jika items adalah ClientScheduleRead (punya slots), flatten jadi list jadwal
  if (items.length && items[0].slots !== undefined) {
    const flat = [];
    for (const c of items) {
      for (const s of (c.slots || [])) {
        flat.push({
          date: s.date || s.scheduled_on,
          title: (c.client_name || '') + (s.title ? ' - ' + s.title : ''),
          coach_name: s.coach_name || '',
          weekday: s.weekday,
          start_time: s.start_time,
        });
      }
    }
    return flat;
  }
  const slots = (data && data.slots) || items;
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
  container.innerHTML = '<h1 class="page-title">Jadwal Klien</h1>' +
    '<div class="page-actions"><label class="field"><span>Klien</span><select id="clientSel"><option value="">Pilih klien…</option></select></label></div>' +
    '<div id="slotList"></div>' +
    '<h2>Tambah Jadwal</h2>' +
    '<form id="slotForm">' +
    '<label class="field"><span>Hari</span><select name="weekday" required>' +
    '<option value="1">Senin</option><option value="2">Selasa</option><option value="3">Rabu</option>' +
    '<option value="4">Kamis</option><option value="5">Jumat</option><option value="6">Sabtu</option>' +
    '<option value="7">Minggu</option></select></label>' +
    '<label class="field"><span>Jam mulai</span><input type="time" name="start_time" required></label>' +
    '<label class="field"><span>Jam selesai</span><input type="time" name="end_time"></label>' +
    '<label class="field"><span>Lokasi</span><input type="text" name="location" maxlength="160"></label>' +
    '<label class="field"><span>Kategori</span><input type="text" name="training_category" maxlength="80"></label>' +
    '<label class="field"><span>Catatan</span><input type="text" name="note"></label>' +
    '<button type="submit" class="btn btn-primary">Tambah</button></form>' +
    '<div id="list"></div>';

  const sel = container.querySelector('#clientSel');
  const slotList = container.querySelector('#slotList');
  const form = container.querySelector('#slotForm');
  const list = container.querySelector('#list');
  let currentSlots = [];
  let currentClientId = null;

  const dayNames = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  function renderSlots() {
    if (!currentSlots.length) {
      slotList.innerHTML = emptyStateHTML({ title: 'Belum ada jadwal', desc: 'Tambahkan jadwal via form di bawah.' });
      return;
    }
    slotList.innerHTML = '<div class="schedule-list">' + currentSlots.map((s, i) =>
      '<div class="schedule-item"><strong>' + esc(dayNames[s.weekday] || '') + ' ' + esc(s.start_time || '') +
      (s.end_time ? '–' + esc(s.end_time) : '') + '</strong>' +
      '<span>' + esc(s.training_category || '') + (s.location ? ' @ ' + esc(s.location) : '') + '</span>' +
      (s.note ? '<span class="muted">' + esc(s.note) + '</span>' : '') +
      ' <button class="btn-sm" data-del="' + i + '">Hapus</button></div>'
    ).join('') + '</div>';
    slotList.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentSlots.splice(parseInt(btn.dataset.del), 1);
        renderSlots();
      });
    });
  }

  async function loadClient(id) {
    currentClientId = id;
    currentSlots = [];
    if (!id) { renderSlots(); return; }
    try {
      const data = await get('/schedules/clients/' + id);
      currentSlots = (data && data.slots) || [];
    } catch (e) {
      caught(e, 'jadwal klien load');
      currentSlots = [];
    }
    renderSlots();
  }

  async function saveSlots() {
    if (!currentClientId) return;
    try {
      await put('/schedules/clients/' + currentClientId, { slots: currentSlots });
      toast('Jadwal tersimpan.', 'success');
    } catch (e) {
      caught(e, 'jadwal klien save');
      toast('Gagal menyimpan.', 'error');
    }
  }

  // Load client list
  try {
    const data = await get('/clients', { limit: 200 });
    const clients = (data && data.items) || [];
    sel.innerHTML = '<option value="">Pilih klien…</option>' +
      clients.map(c => '<option value="' + c.id + '">' + esc(c.name || c.full_name || ('#' + c.id)) + '</option>').join('');
  } catch (e) {
    caught(e, 'jadwal klien daftar klien');
  }

  sel.addEventListener('change', () => loadClient(sel.value));
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!currentClientId) { toast('Pilih klien dulu.', 'error'); return; }
    const fd = new FormData(form);
    currentSlots.push({
      weekday: parseInt(fd.get('weekday')),
      start_time: fd.get('start_time'),
      end_time: fd.get('end_time') || null,
      location: fd.get('location') || null,
      training_category: fd.get('training_category') || null,
      note: fd.get('note') || null,
      active: true,
    });
    form.reset();
    renderSlots();
    await saveSlots();
  });

  renderSlots();
  await fetchList('/schedules/clients', {}, list);
}

export async function renderCoachSchedule(container, ctx = {}) {
  const role = ctx.role || '';
  container.innerHTML = '<h1 class="page-title">Jadwal Coach</h1>' +
    '<div id="coachPick"></div><div id="list"></div>';
  const list = container.querySelector('#list');
  const pick = container.querySelector('#coachPick');

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
