/* Daftar endpoint server. Path relatif terhadap APP_CONFIG.api.baseUrl. */
const ENDPOINTS = {
  login: '/auth/login',
  me: '/auth/me',
  snapshot: '/snapshot',                  // seluruh data sesuai hak akses tier
  collections: {
    products: '/produk',
    materials: '/bahan-baku',
    suppliers: '/supplier',
    customers: '/customer',
    sales: '/penjualan',
    purchases: '/pembelian',
    recipes: '/resep',
    productions: '/produksi',
    onlineOrders: '/online',
  },
  finance: '/keuangan',
};
