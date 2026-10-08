// N6 New Era — badge: label status. Warna selalu ditemani teks (aturan 20).
import { esc } from '../core/utils.js';

const KIND = {
  'aktif': 'green', 'nonaktif': 'red', 'terarsip': 'amber',
  'dibayar': 'green', 'tertunda': 'amber', 'ditolak': 'red',
  'disetujui': 'green', 'baru': 'blue',
};

export function badgeHTML(status) {
  const s = String(status || '-').toLowerCase();
  const kind = KIND[s] || 'neutral';
  return '<span class="badge badge-' + kind + '">' + esc(status || '-') + '</span>';
}
