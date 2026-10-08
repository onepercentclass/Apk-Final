// N6 New Era — owner: keuangan (pendapatan per kategori, pengeluaran).
import { get, post, del, ApiError } from '../core/api.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { caught } from '../core/logger.js';
import { esc, formatRupiah, formatTanggal } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Keuangan</h1>' +
    '<div class="page-actions"><button class="btn btn-primary" id="addBtn">Catat Pengeluaran</button></div>' +
    '<div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');

  async function load() {
    body.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const [summary, expenses] = await Promise.all([
        get('/finance/summary').catch((e) => { caught(e, 'keuangan summary'); return null; }),
        get('/finance/expenses', { limit: 50 }).catch((e) => { caught(e, 'keuangan expenses'); return []; }),
      ]);
      const items = (expenses && expenses.items) || [];
      let html = '';
      if (summary && summary.by_category) {
        html += '<h2>Pendapatan per Kategori</h2>' + Object.entries(summary.by_category).map(([k, v]) =>
          '<div class="price-row"><span>' + esc(k) + '</span><strong>' + esc(formatRupiah(v)) + '</strong></div>'
        ).join('');
      }
      html += '<h2>Pengeluaran</h2>';
      html += items.length ? items.map((x) =>
        '<div class="msg"><p class="msg-text">' + esc(x.note || x.description || '-') + ' — ' +
        esc(formatRupiah(x.amount)) + '</p>' +
        '<p class="msg-meta">' + esc(formatTanggal(x.created_at)) +
        ' <button class="btn btn-danger" data-del="' + x.id + '">Hapus</button></p></div>'
      ).join('') : emptyStateHTML({ title: 'Belum ada pengeluaran' });
      body.innerHTML = html;
      body.querySelectorAll('[data-del]').forEach((b) =>
        b.addEventListener('click', () => onDelete(b.dataset.del))
      );
    } catch (e) {
      caught(e, 'keuangan load');
      body.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      body.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  async function onDelete(id) {
    const ok = await confirmDialog({ title: 'Hapus pengeluaran', message: 'Hapus catatan ini?', confirmLabel: 'Hapus' });
    if (!ok) return;
    try {
      await del('/finance/expenses/' + id);
      toast('Pengeluaran dihapus.', 'success');
      load();
    } catch (e) {
      caught(e, 'hapus pengeluaran');
      toast('Gagal: ' + friendly(e), 'error');
    }
  }

  container.querySelector('#addBtn').addEventListener('click', async () => {
    const note = prompt('Keterangan:');
    if (!note) return;
    const amount = Number(String(prompt('Jumlah (Rp):')).replace(/[^0-9]/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) { toast('Jumlah tidak valid.', 'error'); return; }
    try {
      await post('/finance/expenses', { note: note.trim(), amount });
      toast('Pengeluaran dicatat.', 'success');
      load();
    } catch (e) {
      caught(e, 'catat pengeluaran');
      toast('Gagal: ' + friendly(e), 'error');
    }
  });

  function friendly(e) {
    return e instanceof ApiError && e.body && e.body.detail ? e.body.detail : 'terjadi gangguan, coba lagi.';
  }

  await load();
}
