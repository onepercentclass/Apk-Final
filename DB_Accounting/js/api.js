/* ============================= API CLIENT =============================
   Klien HTTP untuk backend FastAPI di API_CONFIG.BASE_URL.
   STATUS: AKTIF (API_CONFIG.USE_API=true) -> data dari server
   (unified-backend, namespace /api/dbacc). Bila USE_API=false,
   semua pemanggilan dibatalkan dan penyimpanan memakai localStorage
   (lihat js/core-store.js).

   Auth: JWT Bearer. Token disimpan di localStorage key "dbacc_token"
   (getToken/setToken/clearToken). Setiap request otomatis membawa
   header Authorization bila token ada. Bila server menjawab 401,
   token dihapus dan layar login ditampilkan.

   Kontrak endpoint (unified-backend/app/apps/dbacc):
     POST   /auth/register            {name,email,password} -> {token,tier,name,email} (403 bila user sudah ada)
     POST   /auth/login               {email,password} -> {token,tier,name,email}
     GET    /auth/me                  -> {tier,menus}
     GET    /companies                -> meta list
     POST   /companies                {name,industry,...}
     GET    /companies/{id}           -> payload perusahaan penuh
     PUT    /companies/{id}           -> simpan payload perusahaan
     GET    /companies/{id}/journal
     POST   /companies/{id}/sales | /purchases | /cashbank | /journal
     GET    /companies/{id}/reports/labarugi | /neraca | /pajak
   ==================================================================== */
const ApiClient = (() => {
  const TOKEN_KEY = 'dbacc_token';

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
  }
  function setToken(t) {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch (e) { /* abaikan */ }
  }
  function clearToken() { setToken(null); }

  function enabled() {
    return typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API === true;
  }

  function guard() {
    if (!enabled()) throw new Error('API nonaktif (USE_API=false) — memakai localStorage.');
  }

  // 401 global: token kedaluwarsa/tidak valid -> hapus token, tampilkan login.
  // showAuth() hanya dipanggil bila aplikasi sedang tampil (shell terlihat),
  // agar tidak me-render ulang layar login saat proses login/boot.
  function handleUnauthorized() {
    clearToken();
    try {
      const sh = document.getElementById('shell');
      const appVisible = sh && sh.style.display !== 'none';
      if (appVisible && typeof showAuth === 'function') showAuth();
    } catch (e) { /* abaikan */ }
  }

  async function request(path, options) {
    guard();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), API_CONFIG.TIMEOUT_MS || 8000);
    try {
      const opt = Object.assign({}, options || {});
      const headers = Object.assign({ 'Content-Type': 'application/json' }, opt.headers || {});
      const tok = getToken();
      if (tok) headers['Authorization'] = 'Bearer ' + tok;
      opt.headers = headers;
      opt.signal = ctrl.signal;
      const res = await fetch(API_CONFIG.BASE_URL + path, opt);
      if (res.status === 401) handleUnauthorized();
      if (!res.ok) {
        const err = new Error('API ' + res.status + ' ' + path);
        err.status = res.status;
        try {
          const body = await res.json();
          if (body && body.detail) err.detail = body.detail;
        } catch (e) { /* abaikan */ }
        throw err;
      }
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  const get = (path) => request(path, { method: 'GET' });
  const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
  const put = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) });

  const endpoints = {
    health: () => '/health',
    register: () => '/auth/register',
    login: () => '/auth/login',
    companies: () => '/companies',
    company: (id) => '/companies/' + id,
    sales: (id) => '/companies/' + id + '/sales',
    purchases: (id) => '/companies/' + id + '/purchases',
    cashbank: (id) => '/companies/' + id + '/cashbank',
    journal: (id) => '/companies/' + id + '/journal',
    report: (id, kind) => '/companies/' + id + '/reports/' + kind,
  };

  // Wrapper bernama (semua no-op selama USE_API=false).
  const ping = () => get(endpoints.health());
  const listCompanies = () => get(endpoints.companies());
  const getCompany = (id) => get(endpoints.company(id));
  const saveCompany = (id, payload) => put(endpoints.company(id), payload);
  const getAccount = () => get('/auth/me');
  const saveAccount = (acc) => post('/auth/profile', acc);

  // Kelola Anggota (owner) + Ganti Password — butuh mode API & login.
  const accounts = () => get('/accounts');
  const createAccount = (data) => post('/accounts', data);
  const updateAccount = (id, data) => request('/accounts/' + id, { method: 'PATCH', body: JSON.stringify(data) });
  const setAccountTier = (id, tier) => put('/accounts/' + id + '/tier', { tier });
  const deactivateAccount = (id) => request('/accounts/' + id, { method: 'DELETE' });
  const deleteAccountHard = (id) => request('/accounts/' + id + '/hard', { method: 'DELETE' });
  const changePassword = (current_password, new_password) => put('/auth/password', { current_password, new_password });

  return { enabled, getToken, setToken, clearToken, request, get, post, put, endpoints, ping, listCompanies, getCompany, saveCompany, getAccount, saveAccount, accounts, createAccount, updateAccount, setAccountTier, deactivateAccount, deleteAccountHard, changePassword };
})();
