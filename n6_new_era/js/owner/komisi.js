// N6 New Era — owner: performa & komisi coach.
import { get, put, post, ApiError } from '../core/api.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { toast } from '../ui/toast.js';
import { caught } from '../core/logger.js';
import { esc, formatRupiah } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Performa & Komisi</h1><div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');

  async function load() {
    body.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const data = await get('/commissions/summary');
      const items = (data && data.items) || [];
      if (!items.length) {
        body.innerHTML = emptyStateHTML({ title: 'Belum ada data komisi' });
        return;
      }
      body.innerHTML = items.map((c) =>
        '<div class="msg"><p class="msg-text">' + esc(c.coach_name || c.name || '-') + ' — ' +
        esc(formatRupiah(c.commission ?? c.amount)) + '</p>' +
        '<div class="ticket-actions"><button class="btn" data-act="rate" data-id="' + c.coach_id + '">Atur</button>' +
        '<button class="btn btn-primary" data-act="pay" data-id="' + c.coach_id + '">Bayar</button></div></div>'
      ).join('');
      body.querySelectorAll('[data-act]').forEach((b) =>
        b.addEventListener('click', () => onAction(b.dataset.act, b.dataset.id))
      );
    } catch (e) {
      caught(e, 'komisi load');
      body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      body.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  async function onAction(act, coachId) {
    try {
      if (act === 'rate') {
        const rate = Number(prompt('Komisi per sesi (Rp):'));
        if (!Number.isFinite(rate) || rate < 0) return;
        await put('/commissions/' + coachId, { rate_per_session: rate });
        toast('Komisi diperbarui.', 'success');
      } else if (act === 'pay') {
        await post('/commissions/' + coachId + '/payout', {});
        toast('Komisi dibayar.', 'success');
      }
      load();
    } catch (e) {
      caught(e, 'komisi aksi');
      toast('Gagal: ' + (e instanceof ApiError && e.body && e.body.detail ? e.body.detail : 'terjadi gangguan, coba lagi.'), 'error');
    }
  }

  await load();
}
