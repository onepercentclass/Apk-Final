/* ============================= API CLIENT =============================
   Klien HTTP untuk backend FastAPI di API_CONFIG.BASE_URL.
   STATUS: NONAKTIF (API_CONFIG.USE_API=false) -> semua pemanggilan
   dibatalkan lebih awal dan penyimpanan memakai localStorage
   (lihat js/core-store.js). Nyalakan flag untuk memakai server.

   Kontrak endpoint (mirror backend/app — lihat backend/README.md):
     GET    /health
     POST   /auth/register            {name,email,password}
     POST   /auth/login               {email,password} -> {token,tier}
     GET    /companies                (header tier) -> meta list
     POST   /companies                {name,industry,...}
     GET    /companies/{id}           -> payload perusahaan penuh
     PUT    /companies/{id}           -> simpan payload perusahaan
     GET    /companies/{id}/journal
     POST   /companies/{id}/sales | /purchases | /cashbank | /journal
     GET    /companies/{id}/reports/labarugi | /neraca | /pajak
   ==================================================================== */
const ApiClient = (() => {
  function enabled() {
    return typeof API_CONFIG !== 'undefined' && API_CONFIG.USE_API === true;
  }

  function guard() {
    if (!enabled()) throw new Error('API nonaktif (USE_API=false) — memakai localStorage.');
  }

  async function request(path, options) {
    guard();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), API_CONFIG.TIMEOUT_MS || 8000);
    try {
      const res = await fetch(API_CONFIG.BASE_URL + path, Object.assign(
        { headers: { 'Content-Type': 'application/json' }, signal: ctrl.signal },
        options || {}
      ));
      if (!res.ok) throw new Error('API ' + res.status + ' ' + path);
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

  return { enabled, request, get, post, put, endpoints, ping, listCompanies, getCompany, saveCompany, getAccount, saveAccount };
})();
