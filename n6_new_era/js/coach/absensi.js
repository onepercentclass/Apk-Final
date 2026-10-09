// N6 New Era — coach: absensi. Satu aksi utama: pengajuan.
// Riwayat tampil di bawah sebagai daftar sekunder.
import { get, post, ApiError } from '../core/api.js';
import { emptyStateHTML } from '../ui/empty-state.js';
import { badgeHTML } from '../ui/badge.js';
import { toast } from '../ui/toast.js';
import { caught } from '../core/logger.js';
import { esc, formatTanggal } from '../core/utils.js';

export async function render(container) {
  container.innerHTML = '<h1 class="page-title">Absensi</h1>' +
    '<form id="reqForm">' +
    '<label class="field"><span>Jenis pengajuan</span>' +
    '<select name="type"><option value="reschedule">Reschedule Sesi</option><option value="cuti">Cuti</option></select></label>' +
    '<label class="field"><span>Tanggal</span><input type="date" name="date" required></label>' +
    '<label class="field"><span>Alasan</span><input type="text" name="reason" required></label>' +
    '<button type="submit" class="btn btn-primary" id="reqBtn">Ajukan</button></form>' +
    '<h2>Riwayat Pengajuan</h2><div id="list"><div class="loading">Memuat…</div></div>';
  const list = container.querySelector('#list');
  const form = container.querySelector('#reqForm');

  async function load() {
    list.innerHTML = '<div class="loading">Memuat…</div>';
    try {
      const data = await get('/schedules/coach/requests', { limit: 50 });
      const items = (data && data.items) || [];
      if (!items.length) {
        list.innerHTML = emptyStateHTML({ title: 'Belum ada pengajuan' });
        return;
      }
      list.innerHTML = items.map((r) =>
        '<div class="msg"><p class="msg-text">' + esc(r.type || '') + ' — ' + esc(formatTanggal(r.date)) + '</p>' +
        '<p class="msg-meta">' + esc(r.reason || '') + ' · ' + badgeHTML(r.status) + '</p></div>'
      ).join('');
    } catch (e) {
      caught(e, 'absensi load');
      const msg = e instanceof ApiError && e.status === 403
        ? 'Akses riwayat ditolak oleh backend.'
        : 'Terjadi gangguan, coba lagi.';
      list.innerHTML = '<div class="page-error"><p>' + esc(msg) + '</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      list.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const btn = container.querySelector('#reqBtn');
    btn.disabled = true;
    try {
      await post('/schedules/coach/requests', {
        type: form.type.value, date: form.date.value, reason: form.reason.value.trim(),
      });
      toast('Pengajuan terkirim.', 'success');
      form.reset();
      load();
    } catch (e) {
      caught(e, 'pengajuan absensi');
      toast('Gagal: ' + (e instanceof ApiError && e.body && e.body.detail ? e.body.detail : 'terjadi gangguan, coba lagi.'), 'error');
    } finally {
      btn.disabled = false;
    }
  });

  await load();
}
