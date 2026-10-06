/** Menu Ganti Password (semua peran yang sudah login). */

import { USE_API } from '../config.js';
import { api } from '../services/api.js';
import { esc } from '../core/utils.js';
import { ic } from '../core/icons.js';
import { pageHead } from '../ui/components.js';
import { toast } from '../ui/toast.js';

const DBF_CSS = `
<style id="dbf-sandi-css">
.dbf-tips{background:var(--grbg,#10b98118);border:1px solid var(--gr,#04785733);border-radius:10px;padding:12px 14px;font-size:12.5px;color:var(--mu,#6b7280);margin-bottom:14px;display:flex;gap:10px;align-items:flex-start}
.dbf-tips svg{flex:none;color:var(--gr,#047857);margin-top:1px}
.dbf-pw-row{display:flex;gap:8px;align-items:center;margin-bottom:14px}
.dbf-pw-row input{flex:1;min-width:0}
.dbf-eye{background:none;border:1px solid var(--line,#e5e7eb);border-radius:8px;cursor:pointer;padding:9px 10px;color:var(--mu,#6b7280);flex:none;display:flex;align-items:center}
.dbf-eye:hover{border-color:var(--gr,#047857);color:var(--gr,#047857)}
.dbf-meter{height:6px;border-radius:4px;background:var(--line,#e5e7eb);margin:2px 0 6px;overflow:hidden}
.dbf-fill{height:100%;width:0;border-radius:4px;transition:width .25s ease,background .25s ease}
.dbf-hint{font-size:12px;color:var(--mu,#6b7280);margin-bottom:14px;min-height:16px}
.dbf-msg{font-size:13px;margin:10px 0;min-height:18px;font-weight:600}
.dbf-msg.ok{color:var(--gr,#047857)}
.dbf-msg.err{color:var(--rd,#dc2626)}
.dbf-field{margin-bottom:4px}
.dbf-field>label{display:block;font-size:12.5px;font-weight:600;margin-bottom:6px}
</style>`;

/** Halaman Ganti Password. */
export function renderSandi() {
  if (!USE_API) {
    return `${pageHead('Ganti Password', 'Keamanan akun', { month: false })}
      <div class="card"><div class="card-h"><h3>Ganti Password</h3></div>
      <p class="mu">Membutuhkan koneksi ke server (mode API).</p></div>`;
  }
  return `${DBF_CSS}${pageHead('Ganti Password', 'Keamanan akun', { month: false })}
  <div class="card" style="max-width:520px"><div class="card-h"><h3>Ganti Password</h3></div>
    <form id="sandiForm" autocomplete="off">
      <div class="dbf-tips">${ic('shield', 18)}<span>Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol
        dengan panjang minimal 8 karakter agar password sulit ditebak.</span></div>
      <div class="dbf-field"><label>Password saat ini</label>
        <div class="dbf-pw-row"><input type="password" id="sandiLama" autocomplete="current-password" required placeholder="Masukkan password lama Anda">
        <button type="button" class="dbf-eye" data-eye="sandiLama" title="Tampilkan/sembunyikan" aria-label="Tampilkan password">${ic('eye', 18)}</button></div></div>
      <div class="dbf-field"><label>Password baru</label>
        <div class="dbf-pw-row" style="margin-bottom:0"><input type="password" id="sandiBaru" autocomplete="new-password" required minlength="8" placeholder="Minimal 8 karakter">
        <button type="button" class="dbf-eye" data-eye="sandiBaru" title="Tampilkan/sembunyikan" aria-label="Tampilkan password">${ic('eye', 18)}</button></div>
        <div class="dbf-meter"><div class="dbf-fill" id="dbfPwFill"></div></div>
        <div class="dbf-hint" id="dbfPwHint">Kekuatan password akan muncul di sini.</div></div>
      <div class="dbf-field"><label>Ulangi password baru</label>
        <div class="dbf-pw-row"><input type="password" id="sandiBaru2" autocomplete="new-password" required minlength="8" placeholder="Ketik ulang password baru">
        <button type="button" class="dbf-eye" data-eye="sandiBaru2" title="Tampilkan/sembunyikan" aria-label="Tampilkan password">${ic('eye', 18)}</button></div></div>
      <p id="sandiMsg" class="dbf-msg"></p>
      <button class="btn pri" type="submit">${ic('check', 16)} Simpan Password Baru</button>
    </form>
  </div>`;
}

/** Binding setelah render. */
export function bindSandi() {
  if (!USE_API) return;
  const form = document.getElementById('sandiForm');
  if (!form) return;
  const msg = document.getElementById('sandiMsg');
  const baruInput = document.getElementById('sandiBaru');
  const pwFill = document.getElementById('dbfPwFill');
  const pwHint = document.getElementById('dbfPwHint');

  // Toggle tampil/sembunyi password
  form.querySelectorAll('[data-eye]').forEach(b => b.addEventListener('click', () => {
    const inp = document.getElementById(b.getAttribute('data-eye'));
    if (!inp) return;
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    b.innerHTML = ic(show ? 'eyeoff' : 'eye', 18);
  }));

  // Indikator kekuatan password real-time
  baruInput.addEventListener('input', () => {
    const v = baruInput.value;
    let score = 0;
    if (v.length >= 8) score++;
    if (v.length >= 12) score++;
    if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    const colors = ['#e5e7eb', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
    const labels = ['Terlalu pendek', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat', 'Sangat kuat'];
    pwFill.style.width = Math.min(100, score * 20) + '%';
    pwFill.style.background = colors[score];
    pwHint.textContent = v ? 'Kekuatan: ' + labels[score] : 'Kekuatan password akan muncul di sini.';
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    msg.className = 'dbf-msg';
    msg.textContent = '';
    const baru = baruInput.value;
    if (baru !== document.getElementById('sandiBaru2').value) {
      msg.classList.add('err');
      msg.textContent = 'Ulangi password baru tidak sama.';
      return;
    }
    if (baru.length < 8) {
      msg.classList.add('err');
      msg.textContent = 'Password baru minimal 8 karakter.';
      return;
    }
    try {
      await api.put('/auth/password', {
        current_password: document.getElementById('sandiLama').value,
        new_password: baru,
      });
      msg.classList.add('ok');
      msg.textContent = 'Password berhasil diganti.';
      form.reset();
      pwFill.style.width = '0';
      pwHint.textContent = 'Kekuatan password akan muncul di sini.';
      toast('Password berhasil diganti.');
    } catch (err) {
      msg.classList.add('err');
      msg.textContent = 'Gagal: ' + esc(err.message);
    }
  });
}
