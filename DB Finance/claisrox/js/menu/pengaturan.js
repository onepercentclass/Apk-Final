/** Menu Pengaturan: profil, tema, sembunyikan saldo, dan reset data. */

import { registerActions } from '../core/actions.js';
import { initials, urgent } from '../core/calc.js';
import { ic } from '../core/icons.js';
import { commit } from '../core/nav.js';
import { defaults } from '../core/seed.js';
import { S, U, replaceState } from '../core/store.js';
import { applyTheme, isDark } from '../core/theme.js';
import { TODAY_S, esc } from '../core/utils.js';
import { pageHead } from '../ui/components.js';
import { openForm } from '../ui/form.js';
import { confirmBox } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

/** Halaman Pengaturan. */
export function renderPengaturan() {
  const T = [['dark', 'Gelap'], ['light', 'Terang'], ['system', 'Sistem']];
  return `${pageHead('Pengaturan', 'Profil dan tampilan aplikasi', { month: false })}
 <div class="two-c">
 <div><div class="card prof"><div class="avatar">${esc(initials())}</div><div style="flex:1"><h2>${esc(S.name)}</h2><p>Premium</p></div><button class="btn sm" data-act="name-edit">Ubah</button></div>
 <div class="card" style="margin-top:14px"><div class="card-h"><h3>Tema Tampilan</h3></div><div class="seg s3">${T.map(t => `<button class="${S.theme === t[0] ? 'on' : ''}" data-act="theme" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>
  <div class="set" style="margin-top:8px"><div class="m"><b>Sembunyikan saldo</b><small>Tampilkan saldo sebagai titik-titik</small></div><button class="sw ${S.hide ? 'on' : ''}" data-act="hide" role="switch" aria-checked="${S.hide}" aria-label="Sembunyikan saldo"></button></div></div></div>
 <div><div class="card"><div class="card-h"><h3>Fitur Lainnya</h3></div>
  <button class="set" data-act="nav" data-v="accounts"><span class="ci n">${ic('card')}</span><span class="m"><b>Rekening & Dompet</b><small>${S.accounts.length} rekening · ubah bank dan saldo</small></span>${ic('chr', 18)}</button>
  <button class="set" data-act="nav" data-v="invest" style="border-top:1px solid var(--bd)"><span class="ci g">${ic('trend')}</span><span class="m"><b>Investasi</b><small>Portofolio dan imbal hasil</small></span>${ic('chr', 18)}</button>
  <button class="set" data-act="nav" data-v="bills" style="border-top:1px solid var(--bd)"><span class="ci r">${ic('bell')}</span><span class="m"><b>Tagihan & Pengingat</b><small>${urgent()} tagihan dalam 7 hari</small></span>${ic('chr', 18)}</button>
  <button class="set" data-act="nav" data-v="goals" style="border-top:1px solid var(--bd)"><span class="ci b">${ic('target')}</span><span class="m"><b>Tujuan Keuangan</b><small>${S.goals.length} tujuan aktif</small></span>${ic('chr', 18)}</button></div>
 <div class="card" style="margin-top:14px"><div class="card-h"><h3>Data</h3></div><p class="mu" style="font-size:13px;margin-bottom:12px">Data tersimpan di peramban perangkat ini saja. Unduh backup secara berkala.</p><button class="btn pri full" data-act="export" style="margin-bottom:10px">Unduh Laporan & Backup</button><button class="btn danger" data-act="reset">Atur ulang ke data contoh</button></div></div></div>`;
}

registerActions({
  hide: () => {
    S.hide = !S.hide;
    commit();
  },
  theme: v => {
    S.theme = v;
    applyTheme();
    commit();
  },
  'toggle-theme': () => {
    S.theme = isDark() ? 'light' : 'dark';
    applyTheme();
    commit();
  },
  'name-edit': () => openForm('Ubah Nama', [{ k: 'n', l: 'Nama lengkap', t: 'text', v: S.name }], 'Simpan', v => {
    if (!v.n) {
      toast('Nama tidak boleh kosong');
      return false;
    }
    S.name = v.n;
  }),
  reset: () => confirmBox('Semua data akan diganti dengan data contoh. Lanjutkan?', () => {
    const th = S.theme;
    replaceState({ ...defaults(), theme: th });
    U.month = TODAY_S.slice(0, 7);
    commit();
    toast('Data diatur ulang');
  }, 'Atur ulang'),
});
