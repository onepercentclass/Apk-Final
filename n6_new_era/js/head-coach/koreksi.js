// N6 New Era — head coach: koreksi (pengajuan reschedule/cuti).
import { get, put, ApiError } from '../core/api.js';
import { badgeHTML } from '../ui/badge.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { toast } from '../ui/toast.js';
import { caught } from '../core/logger.js';
import { esc, formatTanggal } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Koreksi</h1><div id="list"><div class="loading">Memuat…</div></div>';
  const list = container.querySelector('#list');

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

  await load();
}
