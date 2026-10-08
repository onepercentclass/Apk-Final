// N6 New Era — client: laporan latihan.
import { get, post, ApiError } from '../core/api.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { toast } from '../ui/toast.js';
import { caught } from '../core/logger.js';
import { esc, formatTanggal } from '../core/utils.js';

export async function render(container, ctx = {}) {
  const clientId = ctx.user && ctx.user.client_id;
  container.innerHTML = '<h1 class="page-title">Laporan Latihan</h1>' +
    '<form id="repForm" class="send-form">' +
    '<input type="text" name="text" placeholder="Tulis laporan latihan…" required aria-label="Tulis laporan">' +
    '<button type="submit" class="btn btn-primary">Kirim</button></form>' +
    '<div id="list"><div class="loading">Memuat…</div></div>';
  const list = container.querySelector('#list');
  const form = container.querySelector('#repForm');

  async function load() {
    list.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const data = await get('/portal/reports');
      const items = (data && data.items) || data || [];
      const arr = Array.isArray(items) ? items : [];
      if (!arr.length) {
        list.innerHTML = emptyStateHTML({ title: 'Belum ada laporan', desc: 'Kirim laporan latihan pertamamu.' });
        return;
      }
      list.innerHTML = arr.map((r) =>
        '<div class="msg"><p class="msg-text">' + esc(r.text || r.note || '') + '</p>' +
        '<p class="msg-meta">' + esc(formatTanggal(r.created_at)) + '</p></div>'
      ).join('');
    } catch (e) {
      caught(e, 'laporan load');
      list.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      list.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const text = form.text.value.trim();
    if (!text) return;
    try {
      await post('/portal/reports', { text, client_id: clientId });
      form.reset();
      toast('Laporan terkirim.', 'success');
      load();
    } catch (e) {
      caught(e, 'kirim laporan');
      toast('Gagal: ' + (e instanceof ApiError && e.body && e.body.detail ? e.body.detail : 'terjadi gangguan, coba lagi.'), 'error');
    }
  });

  await load();
}
