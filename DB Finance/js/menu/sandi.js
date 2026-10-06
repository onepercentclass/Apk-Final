/** Menu Ganti Password (semua peran yang sudah login). */

import { USE_API } from '../config.js';
import { api } from '../services/api.js';
import { pageHead } from '../ui/components.js';
import { toast } from '../ui/toast.js';

/** Halaman Ganti Password. */
export function renderSandi() {
  if (!USE_API) {
    return `${pageHead('Ganti Password', 'Keamanan akun', { month: false })}
      <div class="card"><div class="card-h"><h3>Ganti Password</h3></div>
      <p class="mu">Membutuhkan koneksi ke server (mode API).</p></div>`;
  }
  return `${pageHead('Ganti Password', 'Keamanan akun', { month: false })}
  <div class="card" style="max-width:520px"><div class="card-h"><h3>Ganti Password</h3></div>
    <form id="sandiForm" autocomplete="off">
      <div class="field"><label>Password saat ini</label>
        <input type="password" id="sandiLama" autocomplete="current-password" required></div>
      <div class="field"><label>Password baru</label>
        <input type="password" id="sandiBaru" autocomplete="new-password" required minlength="8"></div>
      <div class="field"><label>Ulangi password baru</label>
        <input type="password" id="sandiBaru2" autocomplete="new-password" required minlength="8"></div>
      <p id="sandiMsg" class="form-msg"></p>
      <button class="btn pri" type="submit">Simpan Password Baru</button>
    </form>
  </div>`;
}

/** Binding setelah render. */
export function bindSandi() {
  if (!USE_API) return;
  const form = document.getElementById('sandiForm');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const msg = document.getElementById('sandiMsg');
    msg.textContent = '';
    const baru = document.getElementById('sandiBaru').value;
    if (baru !== document.getElementById('sandiBaru2').value) {
      msg.textContent = 'Ulangi password baru tidak sama.';
      return;
    }
    try {
      await api.put('/auth/password', {
        current_password: document.getElementById('sandiLama').value,
        new_password: baru,
      });
      msg.textContent = 'Password berhasil diganti.';
      form.reset();
      toast('Password berhasil diganti.');
    } catch (err) { msg.textContent = 'Gagal: ' + err.message; }
  });
}
