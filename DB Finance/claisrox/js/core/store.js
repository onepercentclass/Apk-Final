/** State aplikasi (S), state tampilan (U), dan persistensinya. */
import { USE_API } from '../config.js';
import { readLocal, writeLocal, pullState, pushState } from '../services/storage.js';
import { DEFAULT_ACCTS } from './catalog.js';
import { defaults } from './seed.js';
import { TODAY_S } from './utils.js';

function load() {
  const o = readLocal();
  if (o && Array.isArray(o.txs)) {
    if (o.name === 'Andi Pratama') o.name = 'Denis';
    if (!Array.isArray(o.accounts)) o.accounts = DEFAULT_ACCTS.map(a => ({ id: a.id, n: a.n, type: a.type, no: a.no, c: a.c }));
    o.opening = o.opening || {};
    return o;
  }
  return defaults();
}

export const S = load();
export const U = { page: 'home', month: TODAY_S.slice(0, 7), f: { q: '', type: 'all' }, rmode: 'month' };

/** Mengganti seluruh isi S tanpa mengubah referensinya, agar semua modul tetap melihat data terbaru. */
export function replaceState(next) {
  Object.keys(S).forEach(k => delete S[k]);
  Object.assign(S, next);
}

export function save() {
  writeLocal(S);
  if (USE_API) pushState(S).catch(err => console.error('Sinkron ke server gagal', err));
}

export async function syncFromServer() {
  try {
    replaceState(await pullState({ ...S }));
  } catch (err) {
    console.error('Server tidak terjangkau, memakai data lokal', err);
  }
}
