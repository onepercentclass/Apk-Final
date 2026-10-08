// N6 New Era — pesan & tiket. Satu komponen percakapan dipakai
// owner, admin, head-coach, client.
import { get, post, ApiError } from '../../core/api.js';
import { emptyStateHTML } from '../../ui/empty-state.js';
import { badgeHTML } from '../../ui/badge.js';
import { toast } from '../../ui/toast.js';
import { caught } from '../../core/logger.js';
import { esc, formatTanggal } from '../../core/utils.js';

export async function renderMessages(container, ctx = {}) {
  container.innerHTML = '<h1 class="page-title">Pesan</h1>' +
    '<div id="list"><div class="loading">Memuat…</div></div>' +
    '<form id="sendForm" class="send-form">' +
    '<input type="text" name="text" placeholder="Tulis pesan…" required aria-label="Tulis pesan">' +
    '<button type="submit" class="btn btn-primary">Kirim</button></form>';
  const list = container.querySelector('#list');
  const form = container.querySelector('#sendForm');

  async function load() {
    try {
      const data = await get('/messages', { limit: 50 });
      const items = (data && data.items) || [];
      if (!items.length) {
        list.innerHTML = emptyStateHTML({ title: 'Belum ada percakapan' });
        return;
      }
      list.innerHTML = '<div class="msg-list">' + items.map((m) =>
        '<div class="msg"><p class="msg-text">' + esc(m.text || m.body || '') + '</p>' +
        '<p class="msg-meta">' + esc(m.sender_name || '') + ' · ' + esc(formatTanggal(m.created_at)) + '</p></div>'
      ).join('') + '</div>';
    } catch (e) {
      caught(e, 'pesan load');
      list.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      list.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const text = form.text.value.trim();
    if (!text) return;
    try {
      await post('/messages', { text });
      form.reset();
      toast('Pesan terkirim.', 'success');
      load();
    } catch (e) {
      caught(e, 'kirim pesan');
      toast('Gagal: ' + friendly(e), 'error');
    }
  });

  function friendly(e) {
    return e instanceof ApiError && e.body && e.body.detail ? e.body.detail : 'terjadi gangguan, coba lagi.';
  }

  await load();
}

export async function renderTickets(container) {
  container.innerHTML = '<h1 class="page-title">Tiket & Keluhan</h1>' +
    '<div id="list"><div class="loading">Memuat…</div></div>';
  const list = container.querySelector('#list');

  async function load() {
    try {
      const data = await get('/tickets', { limit: 50 });
      const items = (data && data.items) || [];
      if (!items.length) {
        list.innerHTML = emptyStateHTML({ title: 'Tidak ada tiket', desc: 'Semua keluhan sudah ditangani.' });
        return;
      }
      list.innerHTML = items.map((t) =>
        '<div class="ticket"><div class="ticket-head"><strong>' + esc(t.subject || ('Tiket #' + t.id)) + '</strong> ' +
        badgeHTML(t.status) + '</div>' +
        '<p class="ticket-meta">' + esc(formatTanggal(t.created_at)) + '</p>' +
        '<div class="ticket-actions">' +
        '<button class="btn" data-act="reply" data-id="' + t.id + '">Balas</button>' +
        '<button class="btn" data-act="close" data-id="' + t.id + '">Tutup</button>' +
        '</div></div>'
      ).join('');
      list.querySelectorAll('[data-act]').forEach((b) =>
        b.addEventListener('click', () => onAction(b.dataset.act, b.dataset.id))
      );
    } catch (e) {
      caught(e, 'tiket load');
      list.innerHTML = '<div class="page-error"><p>Terjadi gangguan, coba lagi.</p>' +
        '<button class="btn btn-primary" id="retryBtn">Coba Lagi</button></div>';
      list.querySelector('#retryBtn').addEventListener('click', load);
    }
  }

  async function onAction(act, id) {
    try {
      if (act === 'reply') {
        const text = prompt('Balasan:');
        if (!text) return;
        await post('/tickets/' + id + '/reply', { text: text.trim() });
        toast('Balasan terkirim.', 'success');
      } else if (act === 'close') {
        await post('/tickets/' + id + '/close', {});
        toast('Tiket ditutup.', 'success');
      }
      load();
    } catch (e) {
      caught(e, 'tiket aksi');
      toast('Gagal: ' + (e instanceof ApiError && e.body && e.body.detail ? e.body.detail : 'terjadi gangguan, coba lagi.'), 'error');
    }
  }

  await load();
}
