// N6 New Era — klien. Satu modul menggantikan 4 versi menu Klien.
// mode: 'full' (owner/admin/head-coach) atau 'read' (coach).
import { get, post, patch, del, ApiError } from '../../core/api.js';
import { tableHTML } from '../../ui/table.js';
import { badgeHTML } from '../../ui/badge.js';
import { emptyStateHTML } from '../../ui/empty-state.js';
import { confirmDialog } from '../../ui/modal.js';
import { toast } from '../../ui/toast.js';
import { caught } from '../../core/logger.js';
import { esc, formatTanggal } from '../../core/utils.js';

export async function renderClients(container, ctx = {}) {
  const mode = ctx.mode || 'full';
  container.innerHTML = '<h1 class="page-title">Klien</h1>' +
    '<div class="page-actions">' +
    (mode === 'full' ? '<button class="btn btn-primary" id="addBtn">Tambah Klien</button>' : '') +
    '<button class="btn" id="archBtn">Terarsip</button></div>' +
    '<div id="list"><div class="loading">Memuat…</div></div>';
  const list = container.querySelector('#list');
  let showArchived = false;

  async function load() {
    list.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const data = await get('/clients', { limit: 200, archived: showArchived ? 1 : 0 });
      const items = (data && data.items) || [];
      if (!items.length) {
        list.innerHTML = emptyStateHTML({
          title: showArchived ? 'Tidak ada klien terarsip' : 'Belum ada klien',
          desc: showArchived ? '' : 'Tambah klien pertama lewat tombol di atas.',
        });
        return;
      }
      list.innerHTML = tableHTML(
        [
          { key: 'name', label: 'Nama' },
          { key: 'status', label: 'Status' },
          { key: 'phone', label: 'Telepon' },
          { key: 'joined_on', label: 'Bergabung' },
        ],
        items.map((c) => ({ ...c, joined_on: formatTanggal(c.joined_on) })),
        mode === 'full'
          ? (c) =>
            (showArchived
              ? '<button class="btn" data-act="restore" data-id="' + c.id + '">Pulihkan</button>' +
                '<button class="btn btn-danger" data-act="del" data-id="' + c.id + '">Hapus Permanen</button>'
              : '<button class="btn" data-act="detail" data-id="' + c.id + '">Detail</button>' +
                '<button class="btn" data-act="archive" data-id="' + c.id + '">Arsipkan</button>')
          : null
      );
      list.querySelectorAll('[data-act]').forEach((b) =>
        b.addEventListener('click', () => onAction(b.dataset.act, b.dataset.id, items))
      );
    } catch (e) {
      caught(e, 'klien load');
      list.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      list.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  async function onAction(act, id, items) {
    const c = items.find((x) => String(x.id) === String(id));
    try {
      if (act === 'detail') {
        showDetail(c);
      } else if (act === 'archive') {
        await post('/clients/' + id + '/archive', {});
        toast('Klien diarsipkan.', 'success');
      } else if (act === 'restore') {
        await post('/clients/' + id + '/archive', { undo: true });
        toast('Klien dipulihkan.', 'success');
      } else if (act === 'del') {
        const ok1 = await confirmDialog({
          title: 'Hapus permanen', message: 'Hapus ' + (c ? c.name : 'klien') + ' selamanya?',
          confirmLabel: 'Hapus',
        });
        if (!ok1) return;
        const ok2 = await confirmDialog({
          title: 'Konfirmasi kedua', message: 'Data tidak bisa dikembalikan.',
          confirmLabel: 'Ya, hapus permanen',
        });
        if (!ok2) return;
        await del('/clients/' + id);
        toast('Klien dihapus permanen.', 'success');
      }
      load();
    } catch (e) {
      caught(e, 'klien aksi');
      toast('Gagal: ' + friendly(e), 'error');
    }
  }

  async function showDetail(c) {
    if (!c) return;
    const { modal } = await import('../../ui/modal.js');
    modal({
      title: c.name || 'Detail Klien',
      bodyHTML:
        '<p>Status: ' + badgeHTML(c.status) + '</p>' +
        '<p>Telepon: ' + esc(c.phone || '-') + '</p>' +
        '<p>Email: ' + esc(c.email || '-') + '</p>' +
        '<p>Bergabung: ' + esc(formatTanggal(c.joined_on)) + '</p>' +
        (c.notes ? '<p>Catatan: ' + esc(c.notes) + '</p>' : ''),
      actions: [{ label: 'Tutup', kind: 'ghost' }],
    });
  }

  container.querySelector('#archBtn').addEventListener('click', () => {
    showArchived = !showArchived;
    container.querySelector('#archBtn').textContent = showArchived ? 'Aktif' : 'Terarsip';
    load();
  });
  const addBtn = container.querySelector('#addBtn');
  if (addBtn) addBtn.addEventListener('click', async () => {
    const name = prompt('Nama klien:');
    if (!name) return;
    try {
      await post('/clients', { name: name.trim() });
      toast('Klien ditambahkan.', 'success');
      load();
    } catch (e) {
      caught(e, 'tambah klien');
      toast('Gagal: ' + friendly(e), 'error');
    }
  });

  function friendly(e) {
    return e instanceof ApiError && e.body && e.body.detail ? e.body.detail : 'terjadi gangguan, coba lagi.';
  }

  await load();
}
