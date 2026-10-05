/** Pembuat data contoh (seed) dan nilai awal state. */

import { DEFAULT_ACCTS } from './catalog.js';
import { TODAY, addDays, toISO } from './utils.js';

function rng(seed) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** Membuat transaksi contoh dan saldo awal rekening. */
function seedData() {
  const y = TODAY.getFullYear(), cm = TODAY.getMonth(), r = rng(42);
  let k = 0;
  const tx = [];
  const add = (type, cat, amount, date, desc, acct) => {
    k++;
    tx.push({ id: 's' + k, ts: k, type, cat, amount, date, desc, acct });
  };
  const D = (m, d) => toISO(new Date(y, m, d));
  const AC = ['bca', 'gopay', 'mandiri', 'ovo'];
  const shares = [['makan', .32, 'Makan & jajan'], ['transport', .2, 'Transportasi'], ['belanja', .15, 'Belanja bulanan'], ['tagihan', .12, 'Tagihan bulanan'], ['hiburan', .08, 'Hiburan'], ['kesehatan', .06, 'Kesehatan'], ['lain_out', .07, 'Lain-lain']];
  for (let m = 0; m < cm; m++) {
    add('in', 'gaji', 6500000, D(m, 25), 'Gaji Bulanan', 'bca');
    add('in', r() > .5 ? 'freelance' : 'bonus', Math.round((.6 + r() * 2) * 10) * 100000, D(m, 12), 'Pendapatan tambahan', 'bca');
    const out = 5200000 + Math.round(r() * 24) * 100000;
    shares.forEach((s, i) => add('out', s[0], Math.round(out * s[1] * (.9 + r() * .2) / 1000) * 1000, D(m, 3 + i * 3), s[2], AC[i % 4]));
  }
  const dd = d => toISO(new Date(y, cm, Math.min(d, TODAY.getDate())));
  [['in', 'gaji', 5000000, 16, 'Gaji Bulanan', 'bca'], ['in', 'freelance', 1200000, 15, 'Proyek desain freelance', 'mandiri'], ['in', 'bonus', 1500000, 10, 'Bonus kinerja', 'bca'], ['in', 'penjualan', 1050000, 6, 'Penjualan barang bekas', 'gopay'],
    ['out', 'makan', 120000, 21, 'Makan siang restoran', 'gopay'], ['out', 'makan', 96000, 17, 'Kopi & jajan', 'ovo'], ['out', 'makan', 800000, 8, 'Makan warung bulanan', 'bca'], ['out', 'makan', 1000000, 3, 'Katering harian', 'bca'],
    ['out', 'transport', 75000, 20, 'Gojek', 'gopay'], ['out', 'transport', 250000, 14, 'Bensin', 'bca'], ['out', 'transport', 435000, 9, 'Servis motor', 'mandiri'], ['out', 'transport', 500000, 4, 'Bensin bulanan', 'bca'],
    ['out', 'belanja', 350000, 20, 'Belanja bulanan supermarket', 'bca'], ['out', 'belanja', 380000, 13, 'Supermarket', 'mandiri'], ['out', 'belanja', 215000, 8, 'Pakaian', 'ovo'],
    ['out', 'tagihan', 350000, 5, 'Listrik', 'bca'], ['out', 'tagihan', 320000, 7, 'Internet', 'bca'], ['out', 'tagihan', 86000, 3, 'Air', 'bca'],
    ['out', 'hiburan', 99000, 12, 'Netflix', 'ovo'], ['out', 'hiburan', 49000, 12, 'Spotify', 'ovo'], ['out', 'hiburan', 356000, 9, 'Bioskop & nongkrong', 'gopay'],
    ['out', 'kesehatan', 250000, 10, 'Dokter', 'bca'], ['out', 'kesehatan', 128000, 10, 'Obat & vitamin', 'mandiri'],
    ['out', 'lain_out', 300000, 2, 'Donasi', 'bca'], ['out', 'lain_out', 141000, 4, 'Lain-lain', 'gopay']
  ].forEach(a => add(a[0], a[1], a[2], dd(a[3]), a[4], a[5]));
  const eff = {};
  tx.forEach(t => eff[t.acct] = (eff[t.acct] || 0) + (t.type === 'in' ? t.amount : -t.amount));
  const opening = {};
  DEFAULT_ACCTS.forEach(a => opening[a.id] = a.target - (eff[a.id] || 0));
  return { tx, opening };
}

/** State awal aplikasi berisi data contoh. */
export function defaults() {
  const { tx, opening } = seedData();
  return { v: 1, txs: tx, opening, accounts: DEFAULT_ACCTS.map(a => ({ id: a.id, n: a.n, type: a.type, no: a.no, c: a.c })), name: 'Denis', theme: 'dark', hide: false,
    budgets: { makan: 2500000, transport: 1500000, belanja: 1200000, tagihan: 900000, hiburan: 700000, kesehatan: 500000, lain_out: 500000 },
    bills: [{ id: 'b1', n: 'Listrik', amt: 350000, due: addDays(4), i: 'bolt', c: '#fbbf24' }, { id: 'b2', n: 'Internet', amt: 320000, due: addDays(7), i: 'wifi', c: '#10b981' }, { id: 'b3', n: 'Cicilan Motor', amt: 1200000, due: addDays(9), i: 'car', c: '#ef4444' }, { id: 'b4', n: 'Langganan Spotify', amt: 49000, due: addDays(12), i: 'music', c: '#60a5fa' }],
    goals: [{ id: 'g1', n: 'Dana Darurat', saved: 5000000, target: 10000000, i: 'shield', c: '#10b981' }, { id: 'g2', n: 'Liburan', saved: 2500000, target: 10000000, i: 'plane', c: '#8b5cf6' }, { id: 'g3', n: 'Upgrade Laptop', saved: 3000000, target: 15000000, i: 'laptop', c: '#fbbf24' }],
    invest: [{ id: 'i1', n: 'Reksa Dana', val: 3500000, ret: 12, i: 'coins', c: '#10b981' }, { id: 'i2', n: 'Saham', val: 2800000, ret: 8, i: 'chart', c: '#60a5fa' }, { id: 'i3', n: 'Emas', val: 1200000, ret: 5, i: 'coins', c: '#fbbf24' }, { id: 'i4', n: 'Crypto', val: 750000, ret: 15, i: 'trend', c: '#fb923c' }] };
}
