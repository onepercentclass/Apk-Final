// N6 New Era — owner: keuangan (pendapatan per kategori, pengeluaran).
import { get, post, del, ApiError } from '../core/api.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { confirmDialog, modal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { caught } from '../core/logger.js';
import { esc, formatRupiah, formatTanggal } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Keuangan</h1>' +
    '<div class="page-actions"><button class="btn btn-primary" id="addBtn">Catat Pengeluaran</button> ' +
    '<button class="btn" id="genReportBtn">Generate Laporan Bulanan</button></div>' +
    '<div id="body"><div class="loading">Memuat…</div></div>';
  const body = container.querySelector('#body');

  container.querySelector('#genReportBtn').addEventListener('click', async () => {
    if (!confirm('Generate laporan bulanan untuk periode berjalan?')) return;
    try {
      await post('/reports/monthly', {});
      toast('Laporan bulanan digenerate.', 'success');
    } catch (e) {
      caught(e, 'generate laporan');
      toast('Gagal generate laporan.', 'error');
    }
  });

  async function load() {
    body.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const [summary, expenses] = await Promise.all([
        get('/finance/summary').catch((e) => { caught(e, 'keuangan summary'); return null; }),
        get('/finance/expenses', { limit: 50 }).catch((e) => { caught(e, 'keuangan expenses'); return []; }),
      ]);
      const items = (expenses && expenses.items) || [];
      let html = '';
      const cats = summary && summary.revenue_by_category;
      if (cats && cats.length) {
        const rows = Array.isArray(cats)
          ? cats.map((c) => '<div class="price-row"><span>' + esc(c.category || c.name || '-') + '</span><strong>' + esc(formatRupiah(c.amount ?? c.total ?? 0)) + '</strong></div>').join('')
          : Object.entries(cats).map(([k, v]) =>
              '<div class="price-row"><span>' + esc(k) + '</span><strong>' + esc(formatRupiah(v)) + '</strong></div>').join('');
        html += '<h2>Pendapatan per Kategori</h2>' + rows;
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

  container.querySelector('#addBtn').addEventListener('click', () => {
    const bodyHTML =
      '<label class="field"><span>Keterangan</span><input type="text" id="expNote" required></label>' +
      '<label class="field"><span>Kategori</span><input type="text" id="expCat" placeholder="mis. operasional" required></label>' +
      '<label class="field"><span>Jumlah (Rp)</span><input type="number" id="expAmount" min="1" required></label>';
    const close = modal({
      title: 'Catat Pengeluaran',
      bodyHTML,
      actions: [
        { label: 'Batal', kind: 'ghost' },
        {
          label: 'Simpan', kind: 'primary', keepOpen: true, onClick: async () => {
            const note = document.getElementById('expNote').value.trim();
            const category = document.getElementById('expCat').value.trim();
            const amount = Number(document.getElementById('expAmount').value);
            if (!note || !category || !Number.isFinite(amount) || amount <= 0) {
              toast('Isi keterangan, kategori, dan jumlah yang valid.', 'error');
              return;
            }
            try {
              await post('/finance/expenses', { note, category, amount });
              toast('Pengeluaran dicatat.', 'success');
              close();
              load();
            } catch (e) {
              caught(e, 'catat pengeluaran');
              toast('Gagal: ' + friendly(e), 'error');
            }
          },
        },
      ],
    });
  });

  function friendly(e) {
    if (!(e instanceof ApiError) || !e.body || !e.body.detail) return 'terjadi gangguan, coba lagi.';
    const d = e.body.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d) && d.length && d[0].msg) {
      const loc = d[0].loc ? d[0].loc[d[0].loc.length - 1] : '';
      return (loc ? loc + ': ' : '') + d[0].msg;
    }
    return 'terjadi gangguan, coba lagi.';
  }

  await load();
}
