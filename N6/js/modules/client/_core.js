/**
 * N6 modules - client / _core
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
try{document.documentElement.setAttribute('data-client-theme',localStorage.getItem('n6-client-theme')==='dark'?'dark':'light');}catch(e){document.documentElement.setAttribute('data-client-theme','light');}})();

/*__N6_UNIT__*/  function getClientIdFromUrl(){
    const params = new URLSearchParams(window.location.search);
    return params.get('client') || '';
  }

/*__N6_UNIT__*/  async function storeGet(key){
    try{ const r = await window.storage.get(key, true); return r ? r.value : null; }
    catch(e){ return null; }
  }
/*__N6_UNIT__*/  async function storeSet(key, value){
    try{ await window.storage.set(key, value, true); return true; }
    catch(e){ return false; }
  }
/*__N6_UNIT__*/  function todayISO(){
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

/*__N6_UNIT__*/  let clientId = getClientIdFromUrl();
/*__N6_UNIT__*/  let clientName = 'Client';
/*__N6_UNIT__*/  let reports = {};
/*__N6_UNIT__*/  let scores = {};
/*__N6_UNIT__*/  let chatMessages = [];
/*__N6_UNIT__*/  let programInfo = { pbStart: '', pbEnd: '', startDate: '', endDate: '' };
/*__N6_UNIT__*/  const today = new Date();
/*__N6_UNIT__*/  let calYear = today.getFullYear();
/*__N6_UNIT__*/  let calMonth = today.getMonth();

