// N6 New Era — client: laporan latihan.
import { get, post, ApiError } from '../core/api.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { toast } from '../ui/toast.js';
import { caught } from '../core/logger.js';
import { esc, formatTanggal } from '../core/utils.js';

export async function render(container, ctx = {}) {
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
      const data = await get('/portal/training-logs');
      const items = (data && data.items) || data || [];
      const arr = Array.isArray(items) ? items : [];
      if (!arr.length) {
        list.innerHTML = emptyStateHTML({ title: 'Belum ada laporan', desc: 'Kirim laporan latihan pertamamu.' });
        return;
      }
      list.innerHTML = arr.map((r) =>
        '<div class="msg"><p class="msg-text">' + esc(r.content || '') + '</p>' +
        '<p class="msg-meta">' + esc(formatTanggal(r.log_date || r.created_at)) + '</p></div>'
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
      const today = new Date().toISOString().slice(0, 10);
      await post('/portal/training-logs', { log_date: today, content: text });
      form.reset();
      toast('Laporan terkirim.', 'success');
      load();
    } catch (e) {
      caught(e, 'kirim laporan');
      const msg = e instanceof ApiError && e.status === 405
        ? 'Fitur kirim laporan belum tersedia di backend.'
        : 'Gagal: ' + friendlyDetail(e);
      toast(msg, 'error');
    }
  });

  function friendlyDetail(e) {
    if (!(e instanceof ApiError) || !e.body || !e.body.detail) return 'terjadi gangguan, coba lagi.';
    const d = e.body.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d) && d.length && d[0].msg) return d[0].msg;
    return 'terjadi gangguan, coba lagi.';
  }

  await load();
}
