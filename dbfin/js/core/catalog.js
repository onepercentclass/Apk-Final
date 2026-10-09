/** Data statis: kategori transaksi, jenis rekening, preset bank, dan warna. */

export const CAT = {
  in: [{ id: 'gaji', n: 'Gaji', i: 'briefcase', c: '#34d399' }, { id: 'bonus', n: 'Bonus', i: 'gift', c: '#60a5fa' }, { id: 'freelance', n: 'Freelance', i: 'laptop', c: '#a78bfa' }, { id: 'investasi', n: 'Investasi', i: 'trend', c: '#38bdf8' }, { id: 'transfer_in', n: 'Transfer', i: 'swap', c: '#2dd4bf' }, { id: 'penjualan', n: 'Penjualan', i: 'store', c: '#fbbf24' }, { id: 'lain_in', n: 'Lainnya', i: 'dots', c: '#94a3b8' }],
  out: [{ id: 'makan', n: 'Makan & Minuman', i: 'utensils', c: '#3b82f6' }, { id: 'transport', n: 'Transportasi', i: 'car', c: '#fb923c' }, { id: 'belanja', n: 'Belanja', i: 'cart', c: '#f43f5e' }, { id: 'tagihan', n: 'Tagihan', i: 'receipt', c: '#10b981' }, { id: 'hiburan', n: 'Hiburan', i: 'music', c: '#a855f7' }, { id: 'kesehatan', n: 'Kesehatan', i: 'heart', c: '#ef4444' }, { id: 'lain_out', n: 'Lainnya', i: 'dots', c: '#94a3b8' }]
};

export const catById = id => [...CAT.in, ...CAT.out].find(c => c.id === id) || { n: 'Lainnya', i: 'dots', c: '#94a3b8' };

export const DEFAULT_ACCTS = [{ id: 'bca', n: 'BCA', type: 'bank', no: '•••• 1234', target: 7500000, c: '#2563eb' }, { id: 'mandiri', n: 'Mandiri', type: 'bank', no: '•••• 5678', target: 3200000, c: '#f59e0b' }, { id: 'gopay', n: 'GoPay', type: 'ewallet', no: '•••• 9012', target: 750000, c: '#10b981' }, { id: 'ovo', n: 'OVO', type: 'ewallet', no: '•••• 3456', target: 1000000, c: '#8b5cf6' }];

export const TYPE_LBL = { bank: 'Bank', ewallet: 'E-Wallet', tunai: 'Tunai', lain: 'Lainnya' };

export const PRESET = [['BCA', 'bank', '#2563eb'], ['Mandiri', 'bank', '#f59e0b'], ['BNI', 'bank', '#f97316'], ['BRI', 'bank', '#3b82f6'], ['BSI', 'bank', '#14b8a6'], ['CIMB Niaga', 'bank', '#ef4444'], ['Permata', 'bank', '#84cc16'], ['Jago', 'bank', '#fbbf24'], ['SeaBank', 'bank', '#f97316'], ['Jenius', 'bank', '#38bdf8'], ['GoPay', 'ewallet', '#10b981'], ['OVO', 'ewallet', '#8b5cf6'], ['DANA', 'ewallet', '#3b82f6'], ['ShopeePay', 'ewallet', '#f97316'], ['LinkAja', 'ewallet', '#ef4444'], ['Tunai', 'tunai', '#22c55e']];

export const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#64748b'];

export const abbr = n => {
  const w = String(n).trim().split(/\s+/).filter(Boolean);
  return ((w.length > 1 ? w.slice(0, 3).map(x => x[0]).join('') : String(n).trim().slice(0, 3)).toUpperCase()) || '?';
};

export const maskNo = no => {
  const d = String(no || '').replace(/\D/g, '');
  return d.length >= 4 ? '•••• ' + d.slice(-4) : String(no || '');
};
