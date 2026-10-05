/* Klien HTTP tipis untuk backend FastAPI. Hanya dipakai bila APP_CONFIG.api.enabled = true. */
const api = {
  token(){
    try{ return localStorage.getItem(TOKEN_KEY); }catch(e){ return null; }
  },
  setToken(token){
    try{ token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY); }catch(e){}
  },
  async request(method, path, body){
    const { baseUrl, timeoutMs } = APP_CONFIG.api;
    const headers = { 'Content-Type': 'application/json' };
    const token = api.token();
    if(token) headers.Authorization = 'Bearer ' + token;
    const res = await fetch(baseUrl + path, {
      method, headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if(!res.ok) throw new Error(`API ${method} ${path} gagal (${res.status})`);
    return res.status === 204 ? null : res.json();
  },
  get(path){ return api.request('GET', path); },
  put(path, body){ return api.request('PUT', path, body); },
  post(path, body){ return api.request('POST', path, body); },
  del(path){ return api.request('DELETE', path); },
  async login(username, password){
    const data = await api.post(ENDPOINTS.login, { username, password });
    api.setToken(data.accessToken);
    return data;
  },
};
