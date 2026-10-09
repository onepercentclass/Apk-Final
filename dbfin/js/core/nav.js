/** Kerangka render aplikasi: sidebar, topbar, navigasi bawah, perpindahan halaman, dan commit state. */

import { can } from '../access/access.js';
import { registerActions } from './actions.js';
import { initials, urgent } from './calc.js';
import { ic } from './icons.js';
import { S, U, save } from './store.js';
import { isDark } from './theme.js';
import { $, esc, shiftMK } from './utils.js';
import { drawCharts, resetCharts } from '../ui/charts.js';
import { logoImg } from '../ui/components.js';
import { closeModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

let MENUS = [];
let MOBILE = [];

/** Dipanggil sekali dari main.js agar nav.js tidak bergantung langsung pada file menu. */
export function setMenus(menus, mobile) {
  MENUS = menus;
  MOBILE = mobile;
}

export const menuOrder = () => MENUS.map(m => m.id);

const navItems = () => MENUS.filter(m => can(m.id)).map(m => [m.id, m.label, m.icon]);
const mobileNavItems = () => MOBILE.filter(m => can(m[0]));

/** Menu akun (Kelola Anggota & Ganti Password) di-render terpisah di bawah sidebar. */
const ACCOUNT_IDS = ['akun-center', 'akun', 'sandi'];
const mainNavItems = () => navItems().filter(n => !ACCOUNT_IDS.includes(n[0]));
const accountNavItems = () => navItems().filter(n => ACCOUNT_IDS.includes(n[0]));
const navBtn = n => `<button class="nv ${U.page === n[0] ? 'on' : ''}" data-act="nav" data-v="${n[0]}">${ic(n[2], 20)}${n[1]}</button>`;

/** Isi halaman aktif. */
export function renderPage() {
  resetCharts();
  const menu = MENUS.find(m => m.id === U.page);
  $('#page').innerHTML = menu.render();
  drawCharts();
  if (menu.afterRender) menu.afterRender();
}

/** Merender seluruh kerangka aplikasi lalu isi halaman aktif. */
export function render() {
  document.body.dataset.page = U.page;
  const mOn = id => U.page === id || (id === 'settings' && ['invest', 'bills', 'goals', 'accounts'].includes(U.page));
  const accNav = accountNavItems();
  $('#app').innerHTML = `
 <aside class="sidebar"><div class="brand"><div class="logo">${logoImg()}</div><div><b>DB Track</b></div></div>
  <nav class="sb-nav" aria-label="Navigasi utama">${mainNavItems().map(navBtn).join('')}</nav>
  ${accNav.length ? `<div class="sb-account"><div class="sb-sep" role="separator"></div><nav aria-label="Akun">${accNav.map(navBtn).join('')}<button class="nv" data-act="logout">${ic('logout', 20)}Keluar</button></nav></div>` : ''}
  <div class="sb-card"><span class="g-t">${ic('target', 26)}</span><b>Disiplin hari ini, kebebasan finansial nanti.</b><button class="btn pri full" data-act="nav" data-v="goals">Atur Tujuan Keuangan</button></div></aside>
 <div class="main"><header class="topbar">
  <div class="tb-brand"><div class="logo">${logoImg()}</div><span>DB Track</span></div>
  <label class="srch" style="margin:0">${ic('search', 18)}<input id="gs" type="search" placeholder="Cari transaksi, kategori, atau lainnya…" aria-label="Cari"></label>
  <div class="tb-sp"></div>
  <button class="btn pri only-d" data-act="add" data-v="out">${ic('plus', 16)}Transaksi</button>
  <button class="iconbtn" data-act="nav" data-v="bills" aria-label="Pengingat tagihan">${ic('bell', 19)}${urgent() ? '<span class="dot"></span>' : ''}</button>
  <button class="iconbtn" data-act="toggle-theme" aria-label="Ganti tema">${ic(isDark() ? 'sun' : 'moon', 19)}</button>
  <div class="userchip"><div class="avatar">${esc(initials())}</div><div><b>${esc(S.name)}</b><small>Premium</small></div></div>
 </header><main class="page" id="page"></main></div>
 <nav class="bnav" aria-label="Navigasi">${mobileNavItems().map(n => `<button class="${mOn(n[0]) ? 'on' : ''}" data-act="nav" data-v="${n[0]}">${ic(n[2], 22)}${n[1]}</button>`).join('')}</nav>
 <button class="fab" data-act="add" data-v="out" aria-label="Tambah transaksi">${ic('plus', 26)}</button>`;
  renderPage();
}

/** Pindah halaman. Menolak menu yang tidak diizinkan tier pengguna. */
export function go(p) {
  if (!can(p)) {
    toast('Anda tidak memiliki akses ke menu ini');
    return;
  }
  U.page = p;
  closeModal();
  render();
  window.scrollTo(0, 0);
}

/** Simpan state lalu render ulang. */
export function commit() {
  save();
  render();
}

registerActions({
  nav: v => go(v),
  month: v => {
    U.month = shiftMK(U.month, (U.page === 'report' && U.rmode === 'year' ? 12 : 1) * Number(v));
    render();
  },
  logout: () => {
    if (confirm('Keluar dari aplikasi?')) {
      localStorage.removeItem('claisrox-token');
      location.reload();
    }
  },
});
