/* Penyimpanan data: localStorage (selalu, sebagai cache) + server bila API aktif. */
const COLLECTION_KEYS = ['products','materials','suppliers','customers','sales','purchases','recipes','productions','onlineOrders'];

let remoteSyncTimer = null;
let DATA = load();

function normalizeData(parsed){
  COLLECTION_KEYS.forEach(k => { parsed[k] = parsed[k] || []; });
  parsed.recipes = parsed.recipes.filter(r=> r.batchSize!==undefined);
  parsed.finance = parsed.finance || {modal:0, piutang:0, hutang:0};
  parsed.suppliers.forEach(s=>{ if(!s.createdAt) s.createdAt = todayISO(); });
  parsed.customers.forEach(c=>{ if(!c.createdAt) c.createdAt = todayISO(); });
  return parsed;
}
function load(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return normalizeData(JSON.parse(raw));
  }catch(e){ if(window.logger) window.logger.caught('storage', e, 'read'); }
  const seeded = seedData();
  persistLocal(seeded);
  return seeded;
}
function persistLocal(d){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
  catch(e){ if(window.logger) window.logger.caught('storage', e, 'write'); }
}
function save(d){
  persistLocal(d || DATA);
  if(APP_CONFIG.api.enabled) scheduleRemoteSync();
}

function scheduleRemoteSync(){
  clearTimeout(remoteSyncTimer);
  remoteSyncTimer = setTimeout(async ()=>{
    try{ await api.put(ENDPOINTS.snapshot, DATA); }
    catch(e){ if(window.logger) window.logger.caught('storage', e, 'sync'); toast('Gagal menyimpan ke server'); }
  }, APP_CONFIG.api.syncDebounceMs);
}
async function pullRemoteData(){
  DATA = normalizeData(await api.get(ENDPOINTS.snapshot));
  persistLocal(DATA);
}
