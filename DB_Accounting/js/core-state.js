/* ============================= STATE ============================= */
const S={
  db:null,dbReady:false,
  companies:[],          // meta list [{id,name,industry,color,initial}]
  activeId:null,
  data:{},               // companyId -> full data object (lazy-loaded / cached)
  route:'dashboard',
  routeParam:null,
  theme:'dark',
  downloads:null,
  account:null,      // {name,email,passwordHash,createdAt} dari db — akun lokal aplikasi
  session:null,      // {name,email,ts} dari localStorage — status login perangkat ini
  authMode:'login',  // 'login' | 'register'
  acctMenuOpen:false,
};

