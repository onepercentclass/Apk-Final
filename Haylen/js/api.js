/* Akses data: otomatis ke server (USE_API=true) atau localStorage (USE_API=false) */
(function () {
  const cfg = Haylen.config;
  const S = Haylen.storage;

  // Nama resource lokal -> endpoint server
  const ENDPOINTS = {
    members: "/members",
    programs: "/programs",
    coaches: "/coaches",
    schedules: "/schedules",
    transactions: "/transactions",
    facilities: "/facilities",
    settings: "/settings",
    dashboard: "/dashboard/summary",
    tier: "/tiers",
    accessMe: "/access/me",
    login: "/auth/login",
  };

  async function http(method, path, body) {
    const token = localStorage.getItem(cfg.STORAGE_PREFIX + "token");
    const res = await fetch(cfg.API_BASE + path, {
      method,
      headers: Object.assign(
        { "Content-Type": "application/json" },
        token ? { Authorization: "Bearer " + token } : {}
      ),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      let detail = "Request gagal (" + res.status + ")";
      try { const d = await res.json(); if (d && d.detail) detail = d.detail; } catch (e) {}
      const err = new Error(detail);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }

  Haylen.api = {
    endpoints: ENDPOINTS,
    async login(username, password) {
      if (!cfg.USE_API) return { access_token: "local", tier: cfg.CURRENT_TIER };
      return http("POST", ENDPOINTS.login, { username, password });
    },
    async me() {
      return http("GET", "/auth/me");
    },
    async list(resource) {
      return cfg.USE_API ? http("GET", ENDPOINTS[resource]) : S.list(resource);
    },
    async create(resource, data) {
      return cfg.USE_API ? http("POST", ENDPOINTS[resource], data) : S.create(resource, data);
    },
    async update(resource, id, data) {
      return cfg.USE_API ? http("PUT", ENDPOINTS[resource] + "/" + id, data) : S.update(resource, id, data);
    },
    async remove(resource, id) {
      return cfg.USE_API ? http("DELETE", ENDPOINTS[resource] + "/" + id) : S.remove(resource, id);
    },
    async dashboard() {
      return cfg.USE_API ? http("GET", ENDPOINTS.dashboard) : S.get("dashboard");
    },
    async tier(n) {
      return cfg.USE_API ? http("GET", ENDPOINTS.tier + "/" + n) : null;
    },
    // Hak akses user ini dari backend (satu-satunya sumber konfigurasi tier).
    async accessMe() {
      return cfg.USE_API ? http("GET", ENDPOINTS.accessMe) : null;
    },
    // Kelola akun (owner only di server).
    async accounts() {
      return http("GET", "/accounts");
    },
    async createAccount(data) {
      return http("POST", "/accounts", data);
    },
    async updateAccount(id, data) {
      return http("PATCH", "/accounts/" + id, data);
    },
    async setAccountTier(id, tier) {
      return http("PUT", "/accounts/" + id + "/tier", { tier });
    },
    async deactivateAccount(id) {
      return http("DELETE", "/accounts/" + id);
    },
    // Ganti password sendiri.
    async changePassword(current_password, new_password) {
      return http("PUT", "/auth/password", { current_password, new_password });
    },
  };
})();
