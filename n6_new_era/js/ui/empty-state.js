// N6 New Era — empty-state: status kosong dengan ajakan aksi yang jelas.
import { esc } from '../core/utils.js';

export function emptyStateHTML({ title, desc = '', actionLabel = '', actionId = '' }) {
  return '<div class="empty-state">' +
    '<p class="empty-state-title">' + esc(title) + '</p>' +
    (desc ? '<p class="empty-state-desc">' + esc(desc) + '</p>' : '') +
    (actionLabel ? '<button class="btn btn-primary" id="' + esc(actionId) + '">' + esc(actionLabel) + '</button>' : '') +
    '</div>';
}
