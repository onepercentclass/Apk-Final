/**
 * DB Accounting - Centralized Logger (adopsi dari N6 Fase F)
 *
 * Level: debug, info, warn, error
 * Debug aktif via ?debug=1 atau localStorage['dbacc:debug']='1'
 * Default production: warn dan error saja.
 *
 * Penggunaan: logger.info('kategori', 'pesan', data?)
 *              logger.caught('kategori', e, 'konteks')
 */

(function() {
  'use strict';

  var LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

  function isDebugEnabled() {
    try {
      if (window.localStorage && window.localStorage.getItem('dbacc:debug') === '1') return true;
      var params = new URLSearchParams(window.location.search);
      return params.get('debug') === '1';
    } catch (e) {
      return false;
    }
  }

  var currentLevel = isDebugEnabled() ? 'debug' : 'warn';

  function shouldLog(level) {
    return LEVELS[level] >= LEVELS[currentLevel];
  }

  function formatArgs(cat, msg, data) {
    var args = ['[dbacc][' + cat + ']', msg];
    if (data !== undefined) args.push(data);
    return args;
  }

  var logger = {
    level: currentLevel,

    debug: function(cat, msg, data) {
      if (shouldLog('debug')) console.debug.apply(console, formatArgs(cat, msg, data));
    },

    info: function(cat, msg, data) {
      if (shouldLog('info')) console.info.apply(console, formatArgs(cat, msg, data));
    },

    warn: function(cat, msg, data) {
      if (shouldLog('warn')) console.warn.apply(console, formatArgs(cat, msg, data));
    },

    error: function(cat, msg, data) {
      if (shouldLog('error')) console.error.apply(console, formatArgs(cat, msg, data));
    },

    caught: function(cat, err, context) {
      if (shouldLog('warn')) {
        console.warn.apply(console, formatArgs(cat, 'caught: ' + (context || ''), err));
      }
    }
  };

  window.logger = logger;
})();
