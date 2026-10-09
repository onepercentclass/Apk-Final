// N6 New Era — fungsi murni tanpa dependensi.

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function formatRupiah(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 'Rp0';
  return 'Rp' + Math.round(v).toLocaleString('id-ID');
}

export function formatTanggal(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
