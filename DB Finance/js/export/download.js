/** Pengunduhan berkas lewat Blob. */

import { toast } from '../ui/toast.js';

/** Mengunduh data sebagai berkas. */
export function dl(name, data, type) {
  try {
    const b = new Blob([data], { type });
    const u = URL.createObjectURL(b);
    const a = document.createElement('a');
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 3000);
    toast('Berkas diunduh: ' + name);
  }
  catch (e) {
    toast('Unduhan tidak tersedia di tampilan ini. Buka file HTML langsung di peramban.');
  }
}
