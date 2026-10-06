/** Menu Kelola Anggota (owner only — dibatasi juga di server).
 * Daftar akun, tambah anggota (tier default paling bawah), ubah tier,
 * nonaktifkan/aktifkan kembali. */

import { USE_API } from '../config.js';
import { api } from '../services/api.js';
import { esc } from '../core/utils.js';
import { ic } from '../core/icons.js';
import { pageHead } from '../ui/components.js';
import { confirmBox } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

const TIER_LABEL = { 0: 'Owner', 1: 'Tier 1', 2: 'Tier 2', 3: 'Tier 3' };
const TIER_ASSIGNABLE = [1, 2, 3]; // tier 0 dikunci, tidak bisa diberikan via API

/** Halaman Kelola Anggota. */
export function renderAkun() {
  if (!USE_API) {
    return `${pageHead('Kelola Anggota', 'Manajemen akun pengguna', { month: false })}
      <div class="card"><div class="card-h"><h3>Kelola Anggota</h3></div>
      <p class="mu">Membutuhkan koneksi ke server (mode API).</p></div>`;
  }
  return `${pageHead('Kelola Anggota', 'Tambah anggota dan atur tier', { month: false })}
  <div class="card"><div class="card-h"><h3>Tambah Anggota Baru</h3></div>
    <form id="akunAddForm" autocomplete="off">
      <div class="form-grid">
        <div class="field"><label>Username *</label><input id="akunUsername" required minlength="3" maxlength="64" placeholder="cth: budi"></div>
        <div class="field"><label>Nama lengkap *</label><input id="akunNama" required maxlength="120" placeholder="cth: Budi Santoso"></div>
        <div class="field"><label>Password awal *</label><input id="akunPass" type="password" required minlength="8" autocomplete="new-password"></div>
        <div class="field"><label>Tier</label><select id="akunTier">
          ${TIER_ASSIGNABLE.map(t => `<option value="${t}"${t === 3 ? ' selected' : ''}>${TIER_LABEL[t]}</option>`).join('')}
        </select></div>
      </div>
      <p id="akunAddMsg" class="form-msg"></p>
      <button class="btn pri" type="submit">${ic('plus', 16)}Tambah Anggota</button>
      <span class="mu"> Tier default: Tier 3 (paling bawah).</span>
    </form>
  </div>
  <div class="card" style="margin-top:14px"><div class="card-h"><h3>Daftar Akun</h3>
    <button class="btn sm" id="akunReload">Muat ulang</button></div>
    <div id="akunList"><p class="mu">Memuat…</p></div>
    <p class="mu" id="akunInfo"></p>
  </div>`;
}

function tierCell(a) {
  if (a.tier === 0) return `<span class="badge">Owner</span> <span class="mu">(kunci)</span>`;
  return `<select data-tier="${a.id}" aria-label="Tier ${esc(a.username)}">${
    TIER_ASSIGNABLE.map(t => `<option value="${t}"${t === a.tier ? ' selected' : ''}>${TIER_LABEL[t]}</option>`).join('')
  }</select>`;
}

/** Binding setelah render. */
export function bindAkun() {
  if (!USE_API) return;
  const list = document.getElementById('akunList');
  if (!list) return;

  async function load() {
    try {
      const data = await api.get('/accounts');
      const items = data.items || [];
      document.getElementById('akunInfo').textContent =
        `Menampilkan ${items.length} dari ${data.total || 0} akun`;
      list.innerHTML = items.map(a => {
        const status = a.is_active ? '<span class="ok">Aktif</span>' : '<span class="bad">Nonaktif</span>';
        const aksi = a.tier === 0 ? '<span class="mu">—</span>'
          : a.is_active ? `<button class="btn sm" data-off="${a.id}">Nonaktifkan</button>`
          : `<button class="btn sm" data-on="${a.id}">Aktifkan</button>`;
        return `<div class="set"><span class="ci n">${ic('user')}</span><span class="m"><b>${esc(a.username)}</b><small>${esc(a.name)}</small></span>
          <span style="display:flex;gap:8px;align-items:center">${tierCell(a)}${status}${aksi}</span></div>`;
      }).join('') || '<p class="mu" style="text-align:center">Belum ada anggota.</p>';

      list.querySelectorAll('[data-tier]').forEach(sel => sel.addEventListener('change', () => {
        const id = sel.getAttribute('data-tier'), tier = parseInt(sel.value, 10);
        confirmBox(`Ubah tier akun ini menjadi ${TIER_LABEL[tier]}?`, async () => {
          try {
            await api.put(`/accounts/${id}/tier`, { tier });
            toast('Tier berhasil diubah.');
          } catch (e) { toast('Gagal: ' + e.message); }
          load();
        }, 'Ubah');
      }));
      list.querySelectorAll('[data-off]').forEach(b => b.addEventListener('click', () => {
        confirmBox('Nonaktifkan akun ini? Ia tidak bisa masuk sampai diaktifkan kembali.', async () => {
          try {
            await api.delete(`/accounts/${b.getAttribute('data-off')}`);
            toast('Akun dinonaktifkan.');
          } catch (e) { toast('Gagal: ' + e.message); }
          load();
        }, 'Nonaktifkan');
      }));
      list.querySelectorAll('[data-on]').forEach(b => b.addEventListener('click', async () => {
        try {
          await api.patch(`/accounts/${b.getAttribute('data-on')}`, { is_active: true });
          toast('Akun diaktifkan kembali.');
        } catch (e) { toast('Gagal: ' + e.message); }
        load();
      }));
    } catch (e) {
      list.innerHTML = `<p class="bad">Gagal memuat: ${esc(e.message)}</p>`;
    }
  }

  document.getElementById('akunReload').addEventListener('click', load);
  document.getElementById('akunAddForm').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = document.getElementById('akunAddMsg');
    msg.textContent = '';
    try {
      const created = await api.post('/accounts', {
        username: document.getElementById('akunUsername').value.trim(),
        name: document.getElementById('akunNama').value.trim(),
        password: document.getElementById('akunPass').value,
        tier: parseInt(document.getElementById('akunTier').value, 10),
      });
      msg.textContent = `Anggota "${created.username}" ditambahkan (${TIER_LABEL[created.tier]}).`;
      e.target.reset();
      document.getElementById('akunTier').value = '3';
      load();
    } catch (err) { msg.textContent = 'Gagal: ' + err.message; }
  });

  load();
}
