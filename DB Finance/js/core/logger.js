/**
 * DB Finance - Centralized Logger (adopsi dari N6 Fase F)
 *
 * Level: debug, info, warn, error
 * Debug aktif via ?debug=1 atau localStorage['dbfin:debug']='1'
 * Default production: warn dan error saja.
 *
 * Penggunaan:
 *   import { logger } from './core/logger.js';
 *   logger.info('kategori', 'pesan', data?)
 *   logger.caught('kategori', err, 'konteks')
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

function isDebugEnabled() {
  try {
    if (window.localStorage && window.localStorage.getItem('dbfin:debug') === '1') return true;
    return new URLSearchParams(window.location.search).get('debug') === '1';
  } catch {
    return false;
  }
}

const currentLevel = isDebugEnabled() ? 'debug' : 'warn';
const shouldLog = (level) => LEVELS[level] >= LEVELS[currentLevel];
const fmt = (cat, msg, data) => {
  const args = ['[dbfin][' + cat + ']', msg];
  if (data !== undefined) args.push(data);
  return args;
};

export const logger = {
  level: currentLevel,
  debug: (cat, msg, data) => { if (shouldLog('debug')) console.debug(...fmt(cat, msg, data)); },
  info: (cat, msg, data) => { if (shouldLog('info')) console.info(...fmt(cat, msg, data)); },
  warn: (cat, msg, data) => { if (shouldLog('warn')) console.warn(...fmt(cat, msg, data)); },
  error: (cat, msg, data) => { if (shouldLog('error')) console.error(...fmt(cat, msg, data)); },
  caught: (cat, err, context) => { if (shouldLog('warn')) console.warn(...fmt(cat, 'caught: ' + (context || ''), err)); },
};

export default logger;
