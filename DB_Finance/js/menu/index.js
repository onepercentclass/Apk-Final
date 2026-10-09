/**
 * Registry menu. Urutan di sini = urutan di sidebar.
 * `id` adalah key akses yang dipakai backend (GET /access/me) — vocabulary
 * key -> komponen UI. Keputusan "tier X boleh apa" HANYA ada di backend.
 */
import { renderBeranda } from './beranda.js';
import { renderTransaksi, bindPencarianTransaksi } from './transaksi.js';
import { renderAnggaran } from './anggaran.js';
import { renderRekening } from './rekening.js';
import { renderLaporan } from './laporan.js';
import { renderInvestasi } from './investasi.js';
import { renderTagihan } from './tagihan.js';
import { renderTujuan } from './tujuan.js';
import { renderPengaturan } from './pengaturan.js';
import { renderAkun, bindAkun } from './akun.js';
import { renderSandi, bindSandi } from './sandi.js';
import { renderAkunCenter, bindAkunCenter } from './akun-center.js';

export const MENUS = [
  { id: 'home', label: 'Beranda', icon: 'home', render: renderBeranda },
  { id: 'tx', label: 'Transaksi', icon: 'list', render: renderTransaksi, afterRender: bindPencarianTransaksi },
  { id: 'budget', label: 'Anggaran', icon: 'wallet', render: renderAnggaran },
  { id: 'accounts', label: 'Rekening & Dompet', icon: 'card', render: renderRekening },
  { id: 'report', label: 'Laporan', icon: 'chart', render: renderLaporan },
  { id: 'invest', label: 'Investasi', icon: 'trend', render: renderInvestasi },
  { id: 'bills', label: 'Tagihan & Pengingat', icon: 'bell', render: renderTagihan },
  { id: 'goals', label: 'Tujuan Keuangan', icon: 'target', render: renderTujuan },
  { id: 'settings', label: 'Pengaturan', icon: 'gear', render: renderPengaturan },
  { id: 'akun-center', label: 'Akun Saya', icon: 'user', render: renderAkunCenter, afterRender: bindAkunCenter },
  { id: 'akun', label: 'Kelola Anggota', icon: 'user', render: renderAkun, afterRender: bindAkun },
  { id: 'sandi', label: 'Ganti Password', icon: 'shield', render: renderSandi, afterRender: bindSandi },
];

/** Navigasi bawah di mobile: [id, label, ikon]. */
export const MOBILE_MENUS = [
  ['home', 'Beranda', 'home'],
  ['tx', 'Transaksi', 'list'],
  ['budget', 'Anggaran', 'wallet'],
  ['report', 'Laporan', 'chart'],
  ['settings', 'Profil', 'user'],
];
