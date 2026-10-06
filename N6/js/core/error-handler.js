/**
 * N6 - Error Handler Terpusat (Fase G)
 *
 * Format error konsisten dan global error catching.
 * Terintegrasi dengan logger dari Fase F.
 */

import { logger } from './logger.js';

/**
 * Format error menjadi objek konsisten.
 */
export function formatError(modul, fungsi, error) {
  return {
    modul: modul || 'unknown',
    fungsi: fungsi || 'unknown',
    pesan: error?.message || String(error),
    stack: error?.stack || null,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  };
}

/**
 * Laporkan error ke logger dengan format konsisten.
 */
export function reportError(modul, fungsi, error) {
  const formatted = formatError(modul, fungsi, error);
  logger.error(formatted.modul, `[${formatted.fungsi}] ${formatted.pesan}`, {
    stack: formatted.stack,
    timestamp: formatted.timestamp,
  });
  return formatted;
}

/**
 * Pasang global error handlers. Dipanggil sekali dari app.js.
 * - window.onerror: tangkap uncaught exceptions
 * - unhandledrejection: tangkap unhandled promise rejections
 */
export function installGlobalHandlers() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    const formatted = formatError('global', 'onerror', event.error || event.message);
    logger.error('global', `[onerror] ${formatted.pesan}`, {
      stack: formatted.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
    // Tampilkan toast user-friendly jika tersedia
    if (typeof window.showToast === 'function') {
      window.showToast('Terjadi kesalahan. Coba muat ulang halaman.');
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const formatted = formatError('global', 'unhandledrejection', event.reason);
    logger.error('global', `[unhandledrejection] ${formatted.pesan}`, {
      stack: formatted.stack,
    });
  });

  logger.info('error-handler', 'Global error handlers terpasang');
}

export default { formatError, reportError, installGlobalHandlers };
