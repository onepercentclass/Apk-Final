// N6 New Era — coach: beranda performa.
import { get } from '../core/api.js';
import { statCardHTML } from '../ui/stat-card.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { caught } from '../core/logger.js';
import { esc } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Beranda</h1><div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');
  try {
    const data = await get('/dashboards/coach/me');
    if (!data) {
      body.innerHTML = emptyStateHTML({ title: 'Belum ada data', desc: 'Data performa muncul setelah sesi tercatat.' });
      return;
    }
    const cards = [
      { label: 'Klien Aktif', value: String(data.active_clients ?? data.client_count ?? '-') },
      { label: 'Sesi Bulan Ini', value: String(data.sessions_this_month ?? '-') },
      { label: 'Kehadiran', value: data.attendance_pct != null ? data.attendance_pct + '%' : '-' },
      { label: 'Rating', value: data.rating != null ? String(data.rating) : '-' },
    ];
    body.innerHTML = '<div class="card-grid">' + cards.map(statCardHTML).join('') + '</div>';
  } catch (e) {
    caught(e, 'coach beranda load');
    body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    body.querySelector('#retryBtn').addEventListener('click', () => render(container));
  }
}
