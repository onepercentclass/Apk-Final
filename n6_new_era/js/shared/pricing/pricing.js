// N6 New Era — daftar harga. Satu komponen, dua mode: read (admin, coach)
// dan edit (owner).
import { get, put, ApiError } from '../../core/api.js';
import { emptyStateHTML } from '../../ui/empty-state.js';
import { toast } from '../../ui/toast.js';
import { caught } from '../../core/logger.js';
import { esc, formatRupiah } from '../../core/utils.js';

export async function renderPricing(container, ctx = {}) {
  const editable = ctx.mode === 'edit';
  container.innerHTML = '<h1 class="page-title">Harga & Program</h1>' +
    '<div id="list"><div class="loading">Memuat…</div></div>';
  const list = container.querySelector('#list');

  async function load() {
    list.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const data = await get('/pricing');
      const programs = (data && data.programs) || [];
      const standalone = (data && data.standalone) || [];
      if (!programs.length && !standalone.length) {
        list.innerHTML = emptyStateHTML({ title: 'Daftar harga kosong' });
        return;
      }
      const row = (p) =>
        '<div class="price-row"><span>' + esc(p.name || p.title || '-') + '</span>' +
        '<strong>' + esc(formatRupiah(p.price)) + '</strong>' +
        (editable ? '<button class="btn" data-edit="' + p.id + '">Ubah</button>' : '') + '</div>';
      list.innerHTML =
        (programs.length ? '<h2>Program</h2>' + programs.map(row).join('') : '') +
        (standalone.length ? '<h2>Satuan</h2>' + standalone.map(row).join('') : '');
      if (editable) {
        list.querySelectorAll('[data-edit]').forEach((b) =>
          b.addEventListener('click', () => onEdit(b.dataset.edit, programs.concat(standalone)))
        );
      }
    } catch (e) {
      caught(e, 'harga load');
      list.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      list.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  async function onEdit(id, items) {
    const p = items.find((x) => String(x.id) === String(id));
    const val = prompt('Harga baru untuk ' + (p ? p.name : '') + ' (Rp):', p ? p.price : '');
    const price = Number(String(val).replace(/[^0-9]/g, ''));
    if (!Number.isFinite(price) || price <= 0) return;
    try {
      await put('/pricing/' + id, { price });
      toast('Harga diperbarui.', 'success');
      load();
    } catch (e) {
      caught(e, 'harga edit');
      toast('Gagal: ' + (e instanceof ApiError && e.body && e.body.detail ? e.body.detail : 'terjadi gangguan, coba lagi.'), 'error');
    }
  }

  await load();
}
