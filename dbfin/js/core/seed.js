/** Nilai awal state kosong (tanpa data contoh). */

/** State awal aplikasi: kosong, tanpa data contoh.
 * Pengguna mengisi sendiri lewat menu Transaksi, Rekening, Anggaran, dll. */
export function defaults() {
  return {
    v: 1,
    txs: [],
    opening: {},
    accounts: [],
    name: 'Pengguna',
    theme: 'dark',
    hide: false,
    budgets: {},
    bills: [],
    goals: [],
    invest: [],
  };
}
