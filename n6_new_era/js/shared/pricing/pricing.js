// N6 New Era — daftar harga. Satu komponen, dua mode: read (admin, coach)
// dan edit (owner).
import { get, put, ApiError } from '../../core/api.js';
import { emptyStateHTML } from '../../ui/empty-state.js';
import { modal } from '../../ui/modal.js';
import { toast } from '../../ui/toast.js';
import { caught } from '../../core/logger.js';
import { esc, formatRupiah } from '../../core/utils.js';

export async function renderPricing(container, ctx = {}) {
  const editable = ctx.mode === 'edit';
  container.innerHTML = '<h1 class="page-title">Harga & Program</h1>' +
    (editable ? '<div class="page-actions"><button class="btn btn-primary" id="addBtn">Tambah Harga</button></div>' : '') +
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
          b.addEventListener('click', () => onEdit(b.dataset.edit, programs, standalone))
        );
      }
    } catch (e) {
      caught(e, 'harga load');
      list.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      list.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  async function onEdit(id, programs, standalone) {
    const p = programs.concat(standalone).find((x) => String(x.id) === String(id));
    if (!p) return;
    const bodyHTML =
      '<label class="field"><span>Harga baru untuk ' + esc(p.name || p.title || '') + ' (Rp)</span>' +
      '<input type="number" id="priceVal" min="1" value="' + esc(p.price || '') + '" required></label>';
    const close = modal({
      title: 'Ubah Harga',
      bodyHTML,
      actions: [
        { label: 'Batal', kind: 'ghost' },
        {
          label: 'Simpan', kind: 'primary', keepOpen: true, onClick: async () => {
            const price = Number(document.getElementById('priceVal').value);
            if (!Number.isFinite(price) || price <= 0) {
              toast('Harga tidak valid.', 'error');
              return;
            }
            p.price = price;
            try {
              await put('/pricing', { programs, standalone });
              toast('Harga diperbarui.', 'success');
              close();
              load();
            } catch (e) {
              caught(e, 'harga edit');
              toast('Gagal: ' + friendlyDetail(e), 'error');
            }
          },
        },
      ],
    });
  }

  function friendlyDetail(e) {
    if (!(e instanceof ApiError) || !e.body || !e.body.detail) return 'terjadi gangguan, coba lagi.';
    const d = e.body.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d) && d.length && d[0].msg) return d[0].msg;
    return 'terjadi gangguan, coba lagi.';
  }

  if (editable) {
    const addBtn = container.querySelector('#addBtn');
    if (addBtn) addBtn.addEventListener('click', () => {
      const bodyHTML =
        '<label class="field"><span>Nama program/harga</span><input type="text" id="newName" required></label>' +
        '<label class="field"><span>Harga (Rp)</span><input type="number" id="newPrice" min="1" required></label>' +
        '<label class="field"><span>Jenis</span><select id="newKind"><option value="programs">Program</option><option value="standalone">Satuan</option></select></label>';
      const close = modal({
        title: 'Tambah Harga',
        bodyHTML,
        actions: [
          { label: 'Batal', kind: 'ghost' },
          {
            label: 'Simpan', kind: 'primary', keepOpen: true, onClick: async () => {
              const name = document.getElementById('newName').value.trim();
              const price = Number(document.getElementById('newPrice').value);
              const kind = document.getElementById('newKind').value;
              if (!name || !Number.isFinite(price) || price <= 0) {
                toast('Isi nama dan harga yang valid.', 'error');
                return;
              }
              try {
                const data = await get('/pricing');
                const programs = (data && data.programs) || [];
                const standalone = (data && data.standalone) || [];
                (kind === 'programs' ? programs : standalone).push({ name, price });
                await put('/pricing', { programs, standalone });
                toast('Harga ditambahkan.', 'success');
                close();
                load();
              } catch (e) {
                caught(e, 'harga tambah');
                toast('Gagal: ' + friendlyDetail(e), 'error');
              }
            },
          },
        ],
      });
    });
  }

  await load();
}
