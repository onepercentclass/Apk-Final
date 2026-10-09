// N6 New Era — ganti password. Satu modul untuk 5 role.
import { get, put, patch, ApiError } from '../../core/api.js';
import { toast } from '../../ui/toast.js';
import { caught } from '../../core/logger.js';
import { esc } from '../../core/utils.js';

export async function render(container, ctx = {}) {
  const isClient = ctx.role === 'client';
  container.innerHTML =
    (isClient ? '<h1 class="page-title">Profil</h1><div id="profileSec"></div>' : '') +
    '<h1 class="page-title">Ganti Password</h1>' +
    '<form id="pwForm" class="pw-form" novalidate>' +
    '<label class="field"><span>Password saat ini</span>' +
    '<input type="password" name="current" autocomplete="current-password" required></label>' +
    '<label class="field"><span>Password baru (min. 8 karakter)</span>' +
    '<input type="password" name="next" autocomplete="new-password" required minlength="8"></label>' +
    '<label class="field"><span>Ulangi password baru</span>' +
    '<input type="password" name="next2" autocomplete="new-password" required></label>' +
    '<p class="form-error" id="pwError" role="alert" hidden></p>' +
    '<button type="submit" class="btn btn-primary" id="pwBtn">Simpan Password</button>' +
    '</form>';

  // Profile edit for client (Bug49)
  if (isClient) {
    const sec = container.querySelector('#profileSec');
    try {
      const me = await get('/portal/me');
      sec.innerHTML = '<form id="profileForm">' +
        '<label class="field"><span>Nama</span><input type="text" name="full_name" value="' + esc(me.full_name || '') + '"></label>' +
        '<label class="field"><span>Email</span><input type="email" name="email" value="' + esc(me.email || '') + '"></label>' +
        '<label class="field"><span>Telepon</span><input type="text" name="phone" value="' + esc(me.phone || '') + '"></label>' +
        '<button type="submit" class="btn btn-primary">Simpan Profil</button></form>';
      const pf = sec.querySelector('#profileForm');
      pf.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const fd = new FormData(pf);
        try {
          await patch('/portal/me', {
            full_name: fd.get('full_name') || null,
            email: fd.get('email') || null,
            phone: fd.get('phone') || null,
          });
          toast('Profil tersimpan.', 'success');
        } catch (e) {
          caught(e, 'simpan profil');
          toast('Gagal menyimpan profil.', 'error');
        }
      });
    } catch (e) {
      caught(e, 'profil load');
    }
  }

  const form = container.querySelector('#pwForm');
  const errEl = container.querySelector('#pwError');
  const btn = container.querySelector('#pwBtn');

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    errEl.hidden = true;
    const cur = form.current.value;
    const next = form.next.value;
    const next2 = form.next2.value;
    if (next !== next2) {
      errEl.textContent = 'Ulangi password baru tidak sama.';
      errEl.hidden = false;
      return;
    }
    if (next.length < 8) {
      errEl.textContent = 'Password baru minimal 8 karakter.';
      errEl.hidden = false;
      return;
    }
    btn.disabled = true;
    try {
      await put('/auth/password', { current_password: cur, new_password: next });
      toast('Password berhasil diganti.', 'success');
      form.reset();
    } catch (e) {
      caught(e, 'ganti password');
      errEl.textContent = e instanceof ApiError && e.body && e.body.detail
        ? e.body.detail
        : 'Gagal mengganti password, coba lagi.';
      errEl.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });
}
