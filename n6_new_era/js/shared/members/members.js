// N6 New Era — kelola anggota (owner). Daftar akun, ubah tier,
// aktif/nonaktif, hapus. Hapus permanen wajib konfirmasi ganda.
import { get, post, put, patch, del, ApiError } from '../../core/api.js';
import { tableHTML } from '../../ui/table.js';
import { badgeHTML } from '../../ui/badge.js';
import { emptyStateHTML } from '../../ui/empty-state.js';
import { confirmDialog } from '../../ui/modal.js';
import { toast } from '../../ui/toast.js';
import { caught } from '../../core/logger.js';
import { esc } from '../../core/utils.js';
import { TIER_ROLE } from '../../core/config.js';

const TIER_LABEL = { 1: 'Admin', 2: 'Head Coach', 3: 'Coach', 4: 'Client' };

function roleName(tier) {
  if (tier === 0) return 'Owner';
  return TIER_LABEL[tier] || ('Tier ' + tier);
}

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Kelola Anggota</h1>' +
    '<div class="page-actions"><button class="btn btn-primary" id="addBtn">Tambah Anggota</button></div>' +
    '<div id="list"><div class="loading">Memuat…</div></div>';
  const list = container.querySelector('#list');

  async function load() {
    list.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const data = await get('/accounts', { limit: 200 });
      const items = (data && data.items) || [];
      if (!items.length) {
        list.innerHTML = emptyStateHTML({ title: 'Belum ada anggota', desc: 'Tambah anggota pertama lewat tombol di atas.' });
        return;
      }
      list.innerHTML = tableHTML(
        [
          { key: 'username', label: 'Username' },
          { key: 'full_name', label: 'Nama' },
          { key: 'tierLabel', label: 'Role' },
          { key: 'statusLabel', label: 'Status' },
        ],
        items.map((a) => ({
          ...a,
          tierLabel: roleName(a.tier),
          statusLabel: a.is_active ? 'Aktif' : 'Nonaktif',
        })),
        (a) =>
          (a.tier === 0 ? '' :
            '<button class="btn" data-act="tier" data-id="' + a.id + '">Ubah Role</button>' +
            (a.is_active
              ? '<button class="btn" data-act="off" data-id="' + a.id + '">Nonaktifkan</button>'
              : '<button class="btn" data-act="on" data-id="' + a.id + '">Aktifkan</button>') +
            '<button class="btn btn-danger" data-act="del" data-id="' + a.id + '">Hapus</button>')
      );
      list.querySelectorAll('[data-act]').forEach((b) =>
        b.addEventListener('click', () => onAction(b.dataset.act, Number(b.dataset.id), items))
      );
    } catch (e) {
      caught(e, 'kelola anggota load');
      list.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      list.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  async function onAction(act, id, items) {
    const acc = items.find((a) => a.id === id);
    if (!acc) return;
    try {
      if (act === 'tier') {
        const next = prompt('Role baru untuk ' + acc.username + ' (1=Admin, 2=Head Coach, 3=Coach, 4=Client):', String(acc.tier));
        const t = Number(next);
        if (![1, 2, 3, 4].includes(t)) return;
        await put('/accounts/' + id + '/tier', { tier });
        toast('Role diperbarui.', 'success');
      } else if (act === 'off' || act === 'on') {
        await patch('/accounts/' + id, { is_active: act === 'on' });
        toast(acc.username + (act === 'on' ? ' diaktifkan.' : ' dinonaktifkan.'), 'success');
      } else if (act === 'del') {
        const ok1 = await confirmDialog({
          title: 'Hapus anggota',
          message: 'Nonaktifkan akun ' + acc.username + '?',
          confirmLabel: 'Nonaktifkan',
        });
        if (!ok1) return;
        const ok2 = await confirmDialog({
          title: 'Konfirmasi kedua',
          message: 'Yakin? Akun tidak bisa dipakai lagi.',
          confirmLabel: 'Ya, hapus',
        });
        if (!ok2) return;
        await del('/accounts/' + id);
        toast('Anggota dihapus.', 'success');
      }
      load();
    } catch (e) {
      caught(e, 'kelola anggota aksi');
      toast('Gagal: ' + friendly(e), 'error');
    }
  }

  container.querySelector('#addBtn').addEventListener('click', async () => {
    const username = prompt('Username:');
    if (!username) return;
    const fullName = prompt('Nama lengkap:') || username;
    const password = prompt('Password awal (min. 8 karakter):');
    if (!password || password.length < 8) { toast('Password minimal 8 karakter.', 'error'); return; }
    try {
      await post('/accounts', { username: username.trim(), full_name: fullName.trim(), password });
      toast('Anggota ditambahkan.', 'success');
      load();
    } catch (e) {
      caught(e, 'tambah anggota');
      toast('Gagal: ' + friendly(e), 'error');
    }
  });

  function friendly(e) {
    return e instanceof ApiError && e.body && e.body.detail ? e.body.detail : 'terjadi gangguan, coba lagi.';
  }

  await load();
}
