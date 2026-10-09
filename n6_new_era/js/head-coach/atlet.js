// N6 New Era — head coach: atlet binaan.
import { get, del } from '../core/api.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { toast } from '../ui/toast.js';
import { caught } from '../core/logger.js';
import { esc } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Atlet Binaan</h1><div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');

  async function load() {
    body.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const data = await get('/athletes', { limit: 100 });
      const items = (data && data.items) || [];
      if (!items.length) {
        body.innerHTML = emptyStateHTML({ title: 'Belum ada atlet binaan', desc: 'Daftar atlet dan prestasinya muncul di sini.' });
        return;
      }
      body.innerHTML = items.map((a) =>
        '<div class="msg"><p class="msg-text">' + esc(a.name || '-') + '</p>' +
        '<p class="msg-meta">' + esc(a.achievement || a.category || '') +
        ' <button class="btn-sm" data-del="' + a.client_id + '">Hapus</button></p></div>'
      ).join('');
      body.querySelectorAll('[data-del]').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Hapus atlet ini dari binaan?')) return;
          try {
            await del('/athletes/' + btn.dataset.del);
            toast('Atlet dihapus.', 'success');
            load();
          } catch (e) {
            caught(e, 'atlet hapus');
            toast('Gagal menghapus.', 'error');
          }
        });
      });
    } catch (e) {
      caught(e, 'atlet load');
      body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      body.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  await load();
}
