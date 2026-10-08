// N6 New Era — coach: informasi (gaji, evaluasi).
import { get } from '../core/api.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { caught } from '../core/logger.js';
import { esc, formatRupiah } from '../core/utils.js';

export async function render(container, ctx = {}) {
  container.innerHTML = '<h1 class="page-title">Informasi</h1><div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');
  try {
    const data = await get('/dashboards/coach/me');
    const salary = data && (data.salary_per_session ?? data.gaji_per_sesi);
    const evaluation = data && (data.evaluation ?? data.evaluasi);
    if (salary == null && !evaluation) {
      body.innerHTML = emptyStateHTML({ title: 'Belum ada informasi', desc: 'Rincian gaji dan evaluasi muncul di sini.' });
      return;
    }
    body.innerHTML =
      (salary != null ? '<div class="stat-card"><p class="stat-card-value">' + esc(formatRupiah(salary)) + '</p><p class="stat-card-label">Gaji per Sesi</p></div>' : '') +
      (evaluation ? '<h2>Evaluasi Head Coach</h2><p>' + esc(typeof evaluation === 'string' ? evaluation : JSON.stringify(evaluation)) + '</p>' : '');
  } catch (e) {
    caught(e, 'coach informasi load');
    body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    body.querySelector('#retryBtn').addEventListener('click', () => render(container, ctx));
  }
}
