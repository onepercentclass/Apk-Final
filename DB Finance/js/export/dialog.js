/** Dialog Unduh Laporan beserta aksinya. */

import { registerActions } from '../core/actions.js';
import { ic } from '../core/icons.js';
import { S, U } from '../core/store.js';
import { $, MONTHS, TODAY_S } from '../core/utils.js';
import { exportCSV } from './csv.js';
import { dl } from './download.js';
import { exportPDF } from './pdf.js';
import { openModal, shH } from '../ui/modal.js';

function monthsWithData() {
  const set = new Set(S.txs.map(t => t.date.slice(0, 7)));
  set.add(U.month);
  set.add(TODAY_S.slice(0, 7));
  return [...set].sort().reverse();
}

/** Membuka dialog Unduh Laporan. */
function openExport() {
  const opts = monthsWithData().map(m => `<option value="${m}" ${m === U.month ? 'selected' : ''}>${MONTHS[+m.slice(5, 7) - 1]} ${m.slice(0, 4)}</option>`).join('');
  openModal(`${shH('Unduh Laporan')}
 <label for="ex-mk">Pilih bulan</label><select id="ex-mk">${opts}</select>
 <div style="display:grid;gap:10px;margin-top:18px">
  <button class="btn full" data-act="ex-pdf" style="justify-content:flex-start;padding:14px"><span class="ci r">${ic('receipt')}</span><span style="text-align:left"><b style="display:block">Laporan PDF</b><small class="mu" style="font-weight:500">Ringkasan, anggaran, dan daftar transaksi</small></span></button>
  <button class="btn full" data-act="ex-csv" style="justify-content:flex-start;padding:14px"><span class="ci g">${ic('chart')}</span><span style="text-align:left"><b style="display:block">Google Sheets (CSV)</b><small class="mu" style="font-weight:500">Data bulan terpilih, siap diimpor ke Sheets</small></span></button>
  <button class="btn full" data-act="ex-all" style="justify-content:flex-start;padding:14px"><span class="ci b">${ic('download')}</span><span style="text-align:left"><b style="display:block">Backup semua data (CSV)</b><small class="mu" style="font-weight:500">Seluruh transaksi dari semua bulan</small></span></button>
  <button class="btn full" data-act="ex-json" style="justify-content:flex-start;padding:14px"><span class="ci n">${ic('shield')}</span><span style="text-align:left"><b style="display:block">Backup lengkap (JSON)</b><small class="mu" style="font-weight:500">Semua data: rekening, anggaran, tagihan, tujuan, investasi</small></span></button>
  <button class="btn full" data-act="ex-restore" style="justify-content:flex-start;padding:14px"><span class="ci g">${ic('aup')}</span><span style="text-align:left"><b style="display:block">Pulihkan dari backup</b><small class="mu" style="font-weight:500">Pilih berkas JSON hasil Backup lengkap</small></span></button>
  <input type="file" id="restore-file" accept=".json,application/json" hidden>
 </div>
 <p class="mu" style="font-size:12.5px;margin-top:16px;line-height:1.55">Cara membuka di Google Sheets: buka <a href="https://sheets.new" target="_blank" rel="noopener" style="color:var(--gr);font-weight:600">sheets.new</a>, lalu pilih <b>File &gt; Impor &gt; Upload</b> dan pilih berkas CSV yang diunduh.</p>`);
}

registerActions({
  export: openExport,
  'ex-pdf': () => exportPDF($('#ex-mk').value),
  'ex-csv': () => exportCSV($('#ex-mk').value),
  'ex-all': () => exportCSV('all'),
  'ex-json': () => dl('DBTrack-backup-lengkap-' + TODAY_S + '.json', JSON.stringify({ app: 'DBTrack', version: 1, exported: TODAY_S, data: S }, null, 1), 'application/json'),
  'ex-restore': () => {
    const f = $('#restore-file');
    if (f) {
      f.click();
    }
  },
});
