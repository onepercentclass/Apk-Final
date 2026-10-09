/** Fungsi bantu murni: format uang & tanggal, escape HTML, pemilih DOM, dan id unik. */

export const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const $ = (s, r = document) => r.querySelector(s);

export const pad = n => String(n).padStart(2, '0');

export const toISO = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

export const TODAY = new Date();

export const TODAY_S = toISO(TODAY);

export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export const MSHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const num = n => Math.round(n).toLocaleString('id-ID');

export const fmt = n => (n < 0 ? '-' : '') + 'Rp ' + num(Math.abs(n));

export const compact = n => {
  const a = Math.abs(n);
  if (a >= 1e6) {
    return (Math.round(n / 1e5) / 10).toString().replace('.', ',') + ' jt';
  }
  if (a >= 1e3) {
    return Math.round(n / 1e3) + ' rb';
  }
  return String(n);
};

export const dlabel = s => {
  const [y, m, d] = s.split('-').map(Number);
  return d + ' ' + MSHORT[m - 1] + ' ' + y;
};

export const shiftMK = (mk, d) => {
  const [y, m] = mk.split('-').map(Number);
  const dt = new Date(y, m - 1 + d, 1);
  return dt.getFullYear() + '-' + pad(dt.getMonth() + 1);
};

export const addMonth = iso => {
  const [y, m, d] = iso.split('-').map(Number);
  const last = new Date(y, m + 1, 0).getDate();
  return toISO(new Date(y, m, Math.min(d, last)));
};

export const dayDiff = s => Math.round((new Date(s + 'T00:00:00') - new Date(TODAY_S + 'T00:00:00')) / 864e5);

export const addDays = n => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const sgn = v => (v > 0 ? '+' : '') + v + '%';

export const pc = (a, b) => b ? Math.round((a - b) / Math.abs(b) * 100) : 0;

export const money = v => String(v || '').replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
