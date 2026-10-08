// N6 New Era — modal: dialog konfirmasi/aksi. Fokus terkurung, tutup via Escape.
import { esc } from '../core/utils.js';

export function modal({ title, bodyHTML, actions = [] }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML =
    '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
    '<h2 class="modal-title">' + esc(title) + '</h2>' +
    '<div class="modal-body">' + bodyHTML + '</div>' +
    '<div class="modal-actions"></div></div>';

  const box = overlay.querySelector('.modal-actions');
  const close = () => overlay.remove();
  actions.forEach((a) => {
    const b = document.createElement('button');
    b.className = 'btn ' + (a.kind === 'primary' ? 'btn-primary' : a.kind === 'danger' ? 'btn-danger' : 'btn-ghost');
    b.textContent = a.label;
    b.addEventListener('click', () => { if (a.onClick) a.onClick(); if (!a.keepOpen) close(); });
    box.appendChild(b);
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  document.body.appendChild(overlay);
  const first = overlay.querySelector('.modal-actions .btn');
  if (first) first.focus();
  return close;
}

// Konfirmasi ganda untuk aksi destruktif.
export function confirmDialog({ title, message, confirmLabel = 'Hapus' }) {
  return new Promise((resolve) => {
    const close = modal({
      title,
      bodyHTML: '<p>' + esc(message) + '</p>',
      actions: [
        { label: 'Batal', kind: 'ghost', onClick: () => resolve(false) },
        { label: confirmLabel, kind: 'danger', onClick: () => resolve(true) },
      ],
    });
    void close;
  });
}
