// N6 New Era — head coach: beranda tim.
import { get } from '../core/api.js';
import { statCardHTML } from '../ui/stat-card.js';
import { caught } from '../core/logger.js';
import { esc } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Beranda</h1><div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');
  try {
    const data = await get('/dashboards/headcoach/team');
    const coaches = (data && data.coaches) || [];
    const status = (data && data.client_status) || {};
    const aktif = status.aktif ?? Object.values(status).reduce((a, b) => a + (Number(b) || 0), 0);
    const cards = [
      { label: 'Coach', value: String(coaches.length) },
      { label: 'Klien Aktif', value: String(aktif) },
    ];
    body.innerHTML = '<div class="card-grid">' + cards.map(statCardHTML).join('') + '</div>' +
      (coaches.length ? '<h2>Tim Coach</h2>' + coaches.map((c) =>
        '<div class="msg"><p class="msg-text">' + esc(c.name || '-') + '</p>' +
        '<p class="msg-meta">' + esc(String(c.client_count ?? 0)) + ' klien · kehadiran ' +
        esc(c.attendance_pct != null ? c.attendance_pct + '%' : '-') + '</p></div>'
      ).join('') : '');
  } catch (e) {
    caught(e, 'hc beranda load');
    body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    body.querySelector('#retryBtn').addEventListener('click', () => render(container));
  }
}
