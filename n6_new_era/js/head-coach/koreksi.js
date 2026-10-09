// N6 New Era — head coach: koreksi (pengajuan reschedule/cuti + koreksi latihan).
import { get, post, put, ApiError } from '../core/api.js';
import { badgeHTML } from '../ui/badge.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { toast } from '../ui/toast.js';
import { caught } from '../core/logger.js';
import { esc, formatTanggal } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Koreksi</h1>' +
    '<h2>Pengajuan Reschedule/Cuti</h2><div id="list"><div class="loading">Memuat…</div></div>' +
    '<h2>Koreksi Latihan</h2>' +
    '<form id="corrForm">' +
    '<label class="field"><span>Klien</span><select name="client_id" id="corrClient"><option value="">Pilih…</option></select></label>' +
    '<label class="field"><span>Field</span><input type="text" name="field" required maxlength="64" placeholder="mis: target_lari"></label>' +
    '<label class="field"><span>Nilai baru</span><input type="text" name="after_value"></label>' +
    '<label class="field"><span>Alasan</span><input type="text" name="reason"></label>' +
    '<button type="submit" class="btn btn-primary">Buat Koreksi</button></form>' +
    '<div id="corrList"><div class="loading">Memuat…</div></div>';
  const list = container.querySelector('#list');
  const corrList = container.querySelector('#corrList');
  const form = container.querySelector('#corrForm');

  async function load() {
    list.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const data = await get('/schedules/coach/requests', { limit: 50 });
      const items = (data && data.items) || [];
      if (!items.length) {
        list.innerHTML = emptyStateHTML({ title: 'Tidak ada pengajuan', desc: 'Pengajuan reschedule dan cuti coach muncul di sini.' });
        return;
      }
      list.innerHTML = items.map((r) =>
        '<div class="msg"><p class="msg-text">' + esc(r.coach_name || '') + ' — ' + esc(r.type || '') +
        ' ' + esc(formatTanggal(r.date)) + '</p>' +
        '<p class="msg-meta">' + esc(r.reason || '') + ' · ' + badgeHTML(r.status) + '</p>' +
        (String(r.status).toLowerCase() === 'baru' || String(r.status).toLowerCase() === 'pending'
          ? '<div class="ticket-actions"><button class="btn btn-primary" data-act="ok" data-id="' + r.id + '">Setujui</button>' +
            '<button class="btn btn-danger" data-act="no" data-id="' + r.id + '">Tolak</button></div>'
          : '') +
        '</div>'
      ).join('');
      list.querySelectorAll('[data-act]').forEach((b) =>
        b.addEventListener('click', () => decide(b.dataset.act, b.dataset.id))
      );
    } catch (e) {
      caught(e, 'koreksi load');
      list.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      list.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  async function decide(act, id) {
    try {
      await put('/schedules/coach/requests/' + id, { status: act === 'ok' ? 'disetujui' : 'ditolak' });
      toast(act === 'ok' ? 'Pengajuan disetujui.' : 'Pengajuan ditolak.', 'success');
      load();
    } catch (e) {
      caught(e, 'koreksi decide');
      toast('Gagal: ' + (e instanceof ApiError && e.body && e.body.detail ? e.body.detail : 'terjadi gangguan, coba lagi.'), 'error');
    }
  }

  async function loadCorr() {
    corrList.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const data = await get('/corrections', { limit: 50 });
      const items = (data && data.items) || [];
      if (!items.length) {
        corrList.innerHTML = emptyStateHTML({ title: 'Belum ada koreksi' });
        return;
      }
      corrList.innerHTML = items.map(c =>
        '<div class="msg"><p class="msg-text">' + esc(c.field || '') + ' → ' + esc(c.after_value || '') + '</p>' +
        '<p class="msg-meta">' + esc(c.reason || '') + ' · ' + badgeHTML(c.status) +
        (c.status === 'open' ? ' <button class="btn-sm" data-resolve="' + c.id + '">Selesaikan</button>' : '') + '</p></div>'
      ).join('');
      corrList.querySelectorAll('[data-resolve]').forEach(btn => {
        btn.addEventListener('click', async () => {
          try {
            await post('/corrections/' + btn.dataset.resolve + '/resolve', {});
            toast('Koreksi diselesaikan.', 'success');
            loadCorr();
          } catch (e) { caught(e, 'koreksi resolve'); toast('Gagal.', 'error'); }
        });
      });
    } catch (e) {
      caught(e, 'koreksi list');
      corrList.innerHTML = '<div class="page-error"><p>Gagal memuat.</p></div>';
    }
  }

  // Load clients for dropdown
  try {
    const d = await get('/clients', { limit: 200 });
    const clients = (d && d.items) || [];
    container.querySelector('#corrClient').innerHTML = '<option value="">Pilih…</option>' +
      clients.map(c => '<option value="' + c.id + '">' + esc(c.name || ('#' + c.id)) + '</option>').join('');
  } catch (e) { caught(e, 'koreksi clients'); }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    try {
      await post('/corrections', {
        client_id: fd.get('client_id') ? parseInt(fd.get('client_id')) : null,
        field: fd.get('field'),
        after_value: fd.get('after_value') || null,
        reason: fd.get('reason') || null,
      });
      toast('Koreksi dibuat.', 'success');
      form.reset();
      loadCorr();
    } catch (e) { caught(e, 'koreksi buat'); toast('Gagal membuat.', 'error'); }
  });

  await load();
  await loadCorr();
}
