// N6 New Era — admin: beranda operasional.
import { get } from '../core/api.js';
import { statCardHTML } from '../ui/stat-card.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { caught } from '../core/logger.js';
import { esc } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Beranda</h1><div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');
  try {
    const [clients, requests, tickets] = await Promise.all([
      get('/clients', { limit: 1 }).catch((e) => { caught(e, 'admin clients'); return null; }),
      get('/schedules/coach/requests', { limit: 1 }).catch((e) => { caught(e, 'admin requests'); return null; }),
      get('/tickets', { limit: 1 }).catch((e) => { caught(e, 'admin tickets'); return null; }),
    ]);
    const cards = [
      { label: 'Total Klien', value: String(clients ? clients.total ?? '-' : '-') },
      { label: 'Pengajuan Terbuka', value: String(requests ? requests.total ?? '-' : '-') },
      { label: 'Tiket Terbuka', value: String(tickets ? tickets.total ?? '-' : '-') },
    ];
    body.innerHTML = '<div class="card-grid">' + cards.map(statCardHTML).join('') + '</div>';
  } catch (e) {
    caught(e, 'admin beranda load');
    body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    body.querySelector('#retryBtn').addEventListener('click', () => render(container));
  }
}
