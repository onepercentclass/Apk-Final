// N6 New Era — head coach: kelola coach + absensi.
import { get, post, del } from '../core/api.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { toast } from '../ui/toast.js';
import { caught } from '../core/logger.js';
import { esc, formatTanggal } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Coach</h1><div id="body"><div class="loading">Memuat…</div></div>' +
    '<h2>Catat Absensi</h2>' +
    '<form id="absForm">' +
    '<label class="field"><span>Klien</span><select name="client_id" id="absClient" required><option value="">Pilih klien…</option></select></label>' +
    '<label class="field"><span>Tanggal</span><input type="date" name="session_on" required></label>' +
    '<label class="field"><span>Status</span><select name="status">' +
    '<option value="hadir">Hadir</option><option value="izin">Izin</option>' +
    '<option value="sakit">Sakit</option><option value="alpha">Alpha</option></select></label>' +
    '<label class="field"><span>Catatan</span><input type="text" name="note"></label>' +
    '<button type="submit" class="btn btn-primary">Catat</button></form>' +
    '<h2>Riwayat Absensi</h2><div id="absList"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');
  const absList = container.querySelector('#absList');
  const form = container.querySelector('#absForm');

  // Load coaches
  try {
    const data = await get('/dashboards/headcoach/team');
    const coaches = (data && data.coaches) || [];
    if (!coaches.length) {
      body.innerHTML = emptyStateHTML({ title: 'Belum ada coach', desc: 'Daftar coach dalam tim muncul di sini.' });
    } else {
      body.innerHTML = coaches.map((c) =>
        '<div class="msg"><p class="msg-text">' + esc(c.name || '-') + '</p>' +
        '<p class="msg-meta">' + esc(String(c.client_count ?? 0)) + ' klien · kehadiran ' +
        esc(c.attendance_pct != null ? c.attendance_pct + '%' : '-') +
        (c.rating != null ? ' · rating ' + esc(String(c.rating)) : '') + '</p></div>'
      ).join('');
    }
  } catch (e) {
    caught(e, 'hc coach load');
    body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p></div>';
  }

  // Load clients for dropdown
  try {
    const d = await get('/clients', { limit: 200 });
    const clients = (d && d.items) || [];
    container.querySelector('#absClient').innerHTML = '<option value="">Pilih klien…</option>' +
      clients.map(c => '<option value="' + c.id + '">' + esc(c.name || ('#' + c.id)) + '</option>').join('');
  } catch (e) { caught(e, 'absensi clients'); }

  async function loadAbs() {
    absList.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const data = await get('/attendance', { limit: 50 });
      const items = (data && data.items) || [];
      if (!items.length) {
        absList.innerHTML = emptyStateHTML({ title: 'Belum ada absensi' });
        return;
      }
      absList.innerHTML = items.map(a =>
        '<div class="msg"><p class="msg-text">' + esc(a.client_name || ('#' + a.client_id)) + ' — ' + esc(a.status || '') + '</p>' +
        '<p class="msg-meta">' + esc(formatTanggal(a.session_on)) + (a.note ? ' · ' + esc(a.note) : '') +
        ' <button class="btn-sm" data-del="' + a.id + '">Batalkan</button></p></div>'
      ).join('');
      absList.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Batalkan absensi ini?')) return;
          try {
            await del('/attendance/' + btn.dataset.del);
            toast('Absensi dibatalkan.', 'success');
            loadAbs();
          } catch (e) { caught(e, 'absensi hapus'); toast('Gagal.', 'error'); }
        });
      });
    } catch (e) {
      caught(e, 'absensi load');
      absList.innerHTML = '<div class="page-error"><p>Gagal memuat.</p></div>';
    }
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    try {
      await post('/attendance', {
        client_id: parseInt(fd.get('client_id')),
        session_on: fd.get('session_on'),
        status: fd.get('status'),
        note: fd.get('note') || null,
      });
      toast('Absensi tercatat.', 'success');
      form.reset();
      loadAbs();
    } catch (e) { caught(e, 'absensi catat'); toast('Gagal mencatat.', 'error'); }
  });

  await loadAbs();
}
