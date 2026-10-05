/* Hak akses menu per tier. Sumber kebenaran: backend/app/tiers/tier_N.json.
   Tier 0 (owner) memakai wildcard '*' = semua menu, termasuk menu yang ditambahkan nanti. */
const Access = {
  session: null,                          // { username, name, tier, menus: [...] }

  async init(){
    if(!APP_CONFIG.api.enabled){
      Access.session = { ...APP_CONFIG.localSession, menus: ['*'] };
      return;
    }
    Access.session = await api.get(ENDPOINTS.me);
  },
  can(menuId){
    const menus = Access.session ? Access.session.menus : [];
    return menus.includes('*') || menus.includes(menuId);
  },
  firstAllowed(){
    const item = NAV.find(n => Access.can(n.id));
    return item ? item.id : null;
  },
};
