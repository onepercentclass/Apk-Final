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

const DBF_CSS = `
<style id="dbf-akun-css">
.dbf-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.dbf-stat{background:var(--card,#fff);border:1px solid var(--line,#e5e7eb);border-radius:10px;padding:14px 16px}
.dbf-stat .lb{font-size:12px;color:var(--mu,#6b7280);margin-bottom:6px}
.dbf-stat .vl{font-size:24px;font-weight:800}
.dbf-stat .vl.g{color:var(--gr,#047857)}
.dbf-stat .vl.r{color:var(--rd,#dc2626)}
.dbf-tier-sel{font-size:12.5px;padding:6px 8px;border-radius:8px;max-width:130px;margin-top:6px}
.dbf-row{display:flex;align-items:center;gap:12px}
.dbf-av{width:38px;height:38px;border-radius:50%;background:var(--grbg,#10b98118);color:var(--gr,#047857);display:flex;align-items:center;justify-content:center;flex:none}
.dbf-un{font-weight:700;font-size:14px}
.dbf-fn{font-size:12px;color:var(--mu,#6b7280);margin-top:2px}
.dbf-right{margin-left:auto;display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
.dbf-msg{font-size:13px;margin:10px 0;min-height:18px;font-weight:600}
.dbf-msg.ok{color:var(--gr,#047857)}
.dbf-msg.err{color:var(--rd,#dc2626)}
.dbf-empty{padding:36px 16px;text-align:center;color:var(--mu,#6b7280)}
.dbf-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.dbf-sub{font-size:12px;color:var(--mu,#6b7280);margin-top:2px;font-weight:400}
@media(max-width:640px){.dbf-stats{grid-template-columns:1fr 1fr 1fr;gap:8px}.dbf-stat{padding:10px 12px}.dbf-stat .vl{font-size:19px}}
</style>`;

/** Halaman Kelola Anggota. */
export function renderAkun() {
  if (!USE_API) {
    return `${pageHead('Kelola Anggota', 'Manajemen akun pengguna', { month: false })}
      <div class="card"><div class="card-h"><h3>Kelola Anggota</h3></div>
      <p class="mu">Membutuhkan koneksi ke server (mode API).</p></div>`;
  }
  return `${DBF_CSS}${pageHead('Kelola Anggota', 'Tambah anggota dan atur tier', { month: false })}
  <div class="dbf-stats">
    <div class="dbf-stat"><div class="lb">Total Anggota</div><div class="vl" id="dbfStatTotal">–</div></div>
    <div class="dbf-stat"><div class="lb">Aktif</div><div class="vl g" id="dbfStatAktif">–</div></div>
    <div class="dbf-stat"><div class="lb">Nonaktif</div><div class="vl r" id="dbfStatNonaktif">–</div></div>
  </div>
  <div class="card"><div class="card-h"><div><h3>Tambah Anggota Baru</h3>
    <div class="dbf-sub">Akun baru otomatis mendapat Tier 3 (paling bawah). Tier bisa diubah setelah dibuat.</div></div></div>
    <form id="akunAddForm" autocomplete="off">
      <div class="form-grid">
        <div class="field"><label>Username *</label><input id="akunUsername" required minlength="3" maxlength="64" placeholder="cth: budi"></div>
        <div class="field"><label>Nama lengkap *</label><input id="akunNama" required maxlength="120" placeholder="cth: Budi Santoso"></div>
        <div class="field"><label>Password awal *</label><input id="akunPass" type="password" required minlength="8" autocomplete="new-password" placeholder="Minimal 8 karakter"></div>
        <div class="field"><label>Tier awal</label><select id="akunTier">
          ${TIER_ASSIGNABLE.map(t => `<option value="${t}"${t === 3 ? ' selected' : ''}>${TIER_LABEL[t]}</option>`).join('')}
        </select></div>
      </div>
      <p id="akunAddMsg" class="dbf-msg"></p>
      <button class="btn pri" type="submit">${ic('plus', 16)} Tambah Anggota</button>
    </form>
  </div>
  <div class="card" style="margin-top:14px"><div class="card-h"><div class="dbf-head" style="width:100%">
    <div><h3>Daftar Akun</h3><div class="dbf-sub" id="akunInfo">Memuat…</div></div>
    <button class="btn sm" id="akunReload">${ic('list', 14)} Muat ulang</button></div></div>
    <div id="akunList"><p class="mu" style="padding:12px 0">Memuat…</p></div>
  </div>`;
}

function tierBadge(tier) {
  if (tier === 0) return '<span class="badge r">Owner</span>';
  if (tier === 1) return '<span class="badge a">Tier 1</span>';
  return '<span class="badge">Tier ' + tier + '</span>';
}

function tierCell(a) {
  if (a.tier === 0) return `${tierBadge(0)} <span class="mu">(kunci)</span>`;
  return `${tierBadge(a.tier)}<br><select class="dbf-tier-sel" data-tier="${a.id}" aria-label="Ubah tier ${esc(a.username)}">${
    TIER_ASSIGNABLE.map(t => `<option value="${t}"${t === a.tier ? ' selected' : ''}>${TIER_LABEL[t]}</option>`).join('')
  }</select>`;
}

/** Binding setelah render. */
export function bindAkun() {
  if (!USE_API) return;
  const list = document.getElementById('akunList');
  if (!list) return;

  function setStat(id, v) {
    const e = document.getElementById(id);
    if (e) e.textContent = v;
  }

  async function updateStats() {
    try {
      const data = await api.get('/accounts?limit=1000&offset=0');
      const items = data.items || data || [];
      const aktif = items.filter(a => a.is_active !== false).length;
      setStat('dbfStatTotal', items.length);
      setStat('dbfStatAktif', aktif);
      setStat('dbfStatNonaktif', items.length - aktif);
    } catch (e) {
      console.warn('Gagal memuat statistik anggota:', e);
      setStat('dbfStatTotal', '–');
      setStat('dbfStatAktif', '–');
      setStat('dbfStatNonaktif', '–');
    }
  }

  async function load() {
    try {
      const data = await api.get('/accounts');
      const items = data.items || [];
      document.getElementById('akunInfo').textContent =
        `Menampilkan ${items.length} dari ${data.total || 0} akun`;
      list.innerHTML = items.map(a => {
        const status = a.is_active ? '<span class="badge">Aktif</span>' : '<span class="badge r">Nonaktif</span>';
        const aksi = a.tier === 0 ? '<span class="mu">—</span>'
          : a.is_active ? `<button class="btn sm danger" data-off="${a.id}">Nonaktifkan</button>`
          : `<button class="btn sm" data-on="${a.id}">Aktifkan</button>`;
        return `<div class="set"><span class="dbf-row"><span class="dbf-av">${ic('user', 20)}</span>
          <span><span class="dbf-un">${esc(a.username)}</span><div class="dbf-fn">${esc(a.name || '')}</div></span></span>
          <span class="dbf-right">${tierCell(a)}${status}${aksi}</span></div>`;
      }).join('') || '<div class="dbf-empty">Belum ada anggota.<br>Tambahkan anggota pertama lewat form di atas.</div>';

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
      list.innerHTML = `<p class="badge r">Gagal memuat: ${esc(e.message)}</p>`;
    }
  }

  document.getElementById('akunReload').addEventListener('click', () => { load(); updateStats(); });
  document.getElementById('akunAddForm').addEventListener('submit', async e => {
    e.preventDefault();
    const msg = document.getElementById('akunAddMsg');
    msg.className = 'dbf-msg';
    msg.textContent = '';
    try {
      const created = await api.post('/accounts', {
        username: document.getElementById('akunUsername').value.trim(),
        name: document.getElementById('akunNama').value.trim(),
        password: document.getElementById('akunPass').value,
        tier: parseInt(document.getElementById('akunTier').value, 10),
      });
      msg.classList.add('ok');
      msg.textContent = `Anggota "${created.username}" ditambahkan (${TIER_LABEL[created.tier]}).`;
      e.target.reset();
      document.getElementById('akunTier').value = '3';
      load();
      updateStats();
    } catch (err) {
      msg.classList.add('err');
      msg.textContent = 'Gagal: ' + err.message;
    }
  });

  load();
  updateStats();
}
