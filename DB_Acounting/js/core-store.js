/* ============================= PERSISTENCE =============================
   Pengganti blok PERSISTENCE asli (yang bergantung pada host `claude`).
   Nama fungsi & perilaku LUAR dipertahankan: initDb / seedLocal /
   saveCompany / saveMeta. Perbedaannya hanya di LAPISAN SIMPAN:
     - Mode saat ini (USE_API=false): localStorage per browser.
     - Mode server   (USE_API=true) : sinkron ke ApiClient setelah simpan
       lokal (fire-and-forget; kegagalan jaringan tidak memblokir UI).
   Kunci localStorage berversi agar migrasi skema aman ke depan.
   ==================================================================== */
const LS_META = 'dbacc_meta_v1';
const LS_ACTIVE = 'dbacc_active_v1';
const LS_CO_PREFIX = 'dbacc_co_v1_';

function lsGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* kuota penuh: abaikan */ }
}

async function initDb() {
  S.db = null;
  S.dbReady = false;

  // Mode server (nonaktif saat ini): coba sinkron penuh dari API.
  if (typeof ApiClient !== 'undefined' && ApiClient.enabled()) {
    try {
      const metas = await ApiClient.listCompanies();
      if (metas && metas.length) {
        S.companies = metas;
        for (const m of S.companies) {
          try { S.data[m.id] = await ApiClient.getCompany(m.id); }
          catch (e) { S.data[m.id] = newCompanyData(m); }
        }
        S.activeId = S.companies[0].id;
        S.dbReady = true;
        return;
      }
    } catch (e) { /* jatuh ke localStorage */ }
  }

  // Mode lokal (aktif): baca dari localStorage; daftar kosong bila belum ada (tanpa data contoh).
  try {
    const meta = lsGet(LS_META);
    if (meta && meta.companies && meta.companies.length) {
      S.companies = meta.companies;
    } else {
      S.companies = [];
      lsSet(LS_META, { companies: S.companies });
    }
    const savedActive = lsGet(LS_ACTIVE);
    S.activeId = (savedActive && S.companies.some((c) => c.id === savedActive)) ? savedActive : (S.companies.length ? S.companies[0].id : null);
    for (const m of S.companies) {
      const cached = lsGet(LS_CO_PREFIX + m.id);
      if (cached && cached.id) { S.data[m.id] = cached; }
      else { S.data[m.id] = newCompanyData(m); lsSet(LS_CO_PREFIX + m.id, S.data[m.id]); }
    }
  } catch (e) { seedLocal(); }
}

function seedLocal() {
  // Tanpa data contoh: mulai dari daftar perusahaan kosong.
  S.companies = [];
  S.activeId = null;
}

async function saveCompany(id) {
  try { lsSet(LS_CO_PREFIX + id, S.data[id]); } catch (e) { /* abaikan */ }
  if (typeof ApiClient !== 'undefined' && ApiClient.enabled()) {
    ApiClient.saveCompany(id, S.data[id]).catch(() => { /* sinkronisasi belakangan */ });
  }
}

async function saveMeta() {
  try {
    lsSet(LS_META, { companies: S.companies });
    lsSet(LS_ACTIVE, S.activeId);
  } catch (e) { /* abaikan */ }
  if (typeof ApiClient !== 'undefined' && ApiClient.enabled()) {
    ApiClient.post(ApiClient.endpoints.companies(), { companies: S.companies }).catch(() => {});
  }
}
