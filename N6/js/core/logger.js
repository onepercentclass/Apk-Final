/**
 * N6 - Centralized Logger (Fase F)
 *
 * Satu pintu untuk semua log dengan level dan kontrol via flag.
 * - Level: debug < info < warn < error
 * - Aktifkan debug via: ?debug=1 di URL atau localStorage['n6:debug']='1'
 * - Mode production (default): hanya warn + error yang tampil
 * - Mode debug: semua level tampil dengan konteks [modul][fungsi]
 *
 * Penggunaan dari classic scripts (role bundles):
 *   logger.debug('klien', 'loadAllData selesai', { count: 5 });
 *   logger.warn('saveClientForm', 'gagal simpan', err);
 *   logger.error('auth', 'login gagal', err);
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

function isDebugEnabled() {
  try {
    if (typeof window !== 'undefined') {
      // URL flag: ?debug=1
      const params = new URLSearchParams(window.location.search);
      if (params.get('debug') === '1') return true;
      // localStorage flag
      if (window.localStorage && window.localStorage.getItem('n6:debug') === '1') {
        return true;
      }
    }
  } catch (e) {
    // abaikan, default ke production mode
  }
  return false;
}

function shouldLog(level) {
  const threshold = isDebugEnabled() ? LEVELS.debug : LEVELS.warn;
  return LEVELS[level] >= threshold;
}

function formatMessage(modul, pesan, data) {
  const prefix = modul ? `[${modul}]` : '';
  if (data !== undefined) {
    return `${prefix} ${pesan}`;
  }
  return `${prefix} ${pesan}`;
}

export const logger = {
  debug(modul, pesan, data) {
    if (!shouldLog('debug')) return;
    if (data !== undefined) {
      console.debug(formatMessage(modul, pesan), data);
    } else {
      console.debug(formatMessage(modul, pesan));
    }
  },

  info(modul, pesan, data) {
    if (!shouldLog('info')) return;
    if (data !== undefined) {
      console.info(formatMessage(modul, pesan), data);
    } else {
      console.info(formatMessage(modul, pesan));
    }
  },

  warn(modul, pesan, data) {
    if (!shouldLog('warn')) return;
    if (data !== undefined) {
      console.warn(formatMessage(modul, pesan), data);
    } else {
      console.warn(formatMessage(modul, pesan));
    }
  },

  error(modul, pesan, data) {
    if (!shouldLog('error')) return;
    if (data !== undefined) {
      console.error(formatMessage(modul, pesan), data);
    } else {
      console.error(formatMessage(modul, pesan));
    }
  },

  /**
   * Helper untuk menggantikan catch(e){} kosong.
   * @param {string} modul - nama modul (misal: 'klien')
   * @param {string} konteks - deskripsi operasi (misal: 'persistClients')
   * @param {Error} err - error yang ditangkap
   */
  caught(modul, konteks, err) {
    this.warn(modul, `${konteks} gagal (diabaikan)`, err);
  }
};

// Expose globally untuk classic scripts (role bundles yang bukan ES module)
// app.js akan melakukan: window.logger = logger;
if (typeof window !== 'undefined') {
  window.logger = window.logger || logger;
}

export default logger;
