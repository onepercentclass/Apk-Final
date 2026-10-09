/** Path endpoint, relatif terhadap API_BASE. */
export const ENDPOINTS = {
  accessMe: '/access/me',
  state: '/state',
  /** Endpoint per menu. Kuncinya sama dengan id menu pada file tier. */
  menu: {
    tx: '/transactions',
    budget: '/budgets',
    accounts: '/accounts',
    invest: '/investments',
    bills: '/bills',
    goals: '/goals',
    settings: '/profile',
  },
};
