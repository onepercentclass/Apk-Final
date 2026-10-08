// N6 New Era — stat-card: kartu angka ringkas untuk dashboard.
import { esc } from '../core/utils.js';

export function statCardHTML({ label, value, sub = '' }) {
  return '<div class="stat-card">' +
    '<p class="stat-card-value">' + esc(value) + '</p>' +
    '<p class="stat-card-label">' + esc(label) + '</p>' +
    (sub ? '<p class="stat-card-sub">' + esc(sub) + '</p>' : '') +
    '</div>';
}
