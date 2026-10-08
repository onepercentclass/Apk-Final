// N6 New Era — head coach: monitoring klien.
import { get } from '../core/api.js';
import { badgeHTML } from '../ui/badge.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { caught } from '../core/logger.js';
import { esc } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Monitoring Klien</h1><div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');
  try {
    const data = await get('/monitoring/clients', { limit: 100 });
    const items = (data && data.items) || [];
    if (!items.length) {
      body.innerHTML = emptyStateHTML({ title: 'Belum ada data monitoring', desc: 'Data klien yang dipantau muncul di sini.' });
      return;
    }
    body.innerHTML = items.map((c) =>
      '<div class="msg"><p class="msg-text">' + esc(c.name || c.client_name || '-') + ' ' + badgeHTML(c.flag || c.status) + '</p>' +
      '<p class="msg-meta">' + esc(c.note || c.summary || '') + '</p></div>'
    ).join('');
  } catch (e) {
    caught(e, 'monitoring load');
    body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
      '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
    body.querySelector('#retryBtn').addEventListener('click', () => render(container));
  }
}
