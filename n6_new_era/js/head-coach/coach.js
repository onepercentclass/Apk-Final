// N6 New Era — head coach: kelola coach.
import { get } from '../core/api.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { caught } from '../core/logger.js';
import { esc } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Coach</h1><div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');
  try {
    const data = await get('/dashboards/headcoach/team');
    const coaches = (data && data.coaches) || [];
    if (!coaches.length) {
      body.innerHTML = emptyStateHTML({ title: 'Belum ada coach', desc: 'Daftar coach dalam tim muncul di sini.' });
      return;
    }
    body.innerHTML = coaches.map((c) =>
      '<div class="msg"><p class="msg-text">' + esc(c.name || '-') + '</p>' +
      '<p class="msg-meta">' + esc(String(c.client_count ?? 0)) + ' klien · kehadiran ' +
      esc(c.attendance_pct != null ? c.attendance_pct + '%' : '-') +
      (c.rating != null ? ' · rating ' + esc(String(c.rating)) : '') + '</p></div>'
    ).join('');
  } catch (e) {
    caught(e, 'hc coach load');
    body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    body.querySelector('#retryBtn').addEventListener('click', () => render(container));
  }
}
