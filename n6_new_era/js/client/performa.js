// N6 New Era — client: performa (grafik ringkas + kalender sederhana).
import { get } from '../core/api.js';
import { statCardHTML } from '../ui/stat-card.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { caught } from '../core/logger.js';
import { esc } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Performa</h1><div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');
  try {
    const data = await get('/portal/reports/summary');
    if (!data || (!data.total_sessions && !data.items)) {
      body.innerHTML = emptyStateHTML({ title: 'Belum ada data performa', desc: 'Data muncul setelah laporan latihan tercatat.' });
      return;
    }
    const cards = [
      { label: 'Total Sesi', value: String(data.total_sessions ?? '-') },
      { label: 'Bulan Ini', value: String(data.sessions_this_month ?? '-') },
      { label: 'Kepatuhan', value: data.adherence_pct != null ? data.adherence_pct + '%' : '-' },
    ];
    body.innerHTML = '<div class="card-grid">' + cards.map(statCardHTML).join('') + '</div>';
  } catch (e) {
    caught(e, 'performa load');
    body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    body.querySelector('#retryBtn').addEventListener('click', () => render(container));
  }
}
