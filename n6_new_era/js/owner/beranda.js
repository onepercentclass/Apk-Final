// N6 New Era — owner: beranda pendapatan.
import { get } from '../core/api.js';
import { statCardHTML } from '../ui/stat-card.js';
import { caught } from '../core/logger.js';
import { esc, formatRupiah } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Beranda</h1><div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');
  try {
    const [finance, clients] = await Promise.all([
      get('/finance/summary').catch((e) => { caught(e, 'owner finance'); return null; }),
      get('/clients', { limit: 1 }).catch((e) => { caught(e, 'owner clients'); return null; }),
    ]);
    const cards = [
      { label: 'Pendapatan', value: finance && finance.revenue != null ? formatRupiah(finance.revenue) : '-' },
      { label: 'Total Klien', value: String(clients ? clients.total ?? '-' : '-') },
    ];
    body.innerHTML = '<div class="card-grid">' + cards.map(statCardHTML).join('') + '</div>';
  } catch (e) {
    caught(e, 'owner beranda load');
    body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    body.querySelector('#retryBtn').addEventListener('click', () => render(container));
  }
}
