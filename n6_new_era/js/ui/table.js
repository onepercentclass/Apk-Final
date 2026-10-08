// N6 New Era — table: tabel responsif; di layar sempit berubah jadi kartu.
import { esc } from '../core/utils.js';

// cols: [{key, label}], rows: [objek]. rowActions(row) -> HTML opsional.
export function tableHTML(cols, rows, rowActions) {
  const head = '<tr>' + cols.map((c) => '<th scope="col">' + esc(c.label) + '</th>').join('') +
    (rowActions ? '<th scope="col"><span class="sr-only">Aksi</span></th>' : '') + '</tr>';
  const body = rows.map((r) => {
    const cells = cols.map((c) =>
      '<td data-label="' + esc(c.label) + '">' + esc(r[c.key] ?? '-') + '</td>').join('');
    const act = rowActions ? '<td data-label="Aksi" class="cell-actions">' + rowActions(r) + '</td>' : '';
    return '<tr>' + cells + act + '</tr>';
  }).join('');
  return '<div class="table-wrap"><table class="table"><thead>' + head +
    '</thead><tbody>' + body + '</tbody></table></div>';
}
