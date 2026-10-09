/* ============================= ROUTER / RENDER SHELL ============================= */
function navigate(route,param){
  // Penjagaan tier: rute di luar hak akses ditolak (tier 0 memiliki semua rute).
  if(typeof TierAccess!=='undefined' && !TierAccess.canAccess(route)){ toast('Menu tidak tersedia untuk tier Anda'); return; }
  S.route=route;S.routeParam=param;renderAll();window.scrollTo(0,0);
}

const NAV=[
  {r:'dashboard',label:'Beranda',icon:'home'},
  {r:'transaksi',label:'Transaksi',icon:'txn'},
  {r:'penjualan',label:'Penjualan',icon:'sales'},
  {r:'pembelian',label:'Pembelian',icon:'purchase'},
  {r:'kasbank',label:'Kas & Bank',icon:'bank'},
  {r:'jurnal',label:'Jurnal Umum',icon:'journal'},
  {r:'persediaan',label:'Persediaan',icon:'inv'},
  {r:'asettetap',label:'Aset Tetap',icon:'asset'},
  {r:'kontak',label:'Pelanggan & Supplier',icon:'people'},
  {r:'laporan',label:'Laporan',icon:'report'},
  {r:'pajak',label:'Manajemen Pajak',icon:'tax'},
  {r:'perusahaan',label:'Multi Perusahaan',icon:'multico'},
  {r:'pengaturan',label:'Pengaturan',icon:'settings'},
  {r:'akun-center',label:'Akun Saya',icon:'people'},
  {r:'akun',label:'Kelola Anggota',icon:'people'},
  {r:'sandi',label:'Ganti Password',icon:'key'},
];

// Menu akun (Kelola Anggota & Ganti Password) selalu di grup terpisah tepat di atas sidebar-foot.
const ACCOUNT_ROUTES=['akun-center','akun','sandi'];
function navItemHtml(n){
  return `<a class="navitem ${S.route===n.r?'active':''}" onclick="navigate('${n.r}');closeSidebarMobile();">${ic(n.icon,17)}<span>${n.label}</span></a>`;
}
function renderSidebar(){
  const c=co();
  const hasCo=!!(c&&c.id);
  const vis=visibleNav();
  const mainNav=vis.filter(n=>ACCOUNT_ROUTES.indexOf(n.r)===-1);
  const acctNav=vis.filter(n=>ACCOUNT_ROUTES.indexOf(n.r)!==-1);
  document.getElementById('sidebar').innerHTML=`
    <div class="brand">
      <div class="logomark"><img src="${LOGO_DATA_URI}" alt="DB Accounting"></div>
      <div><div class="brand-text">DB Accounting</div><div class="brand-sub">Accounting Suite</div></div>
    </div>
    <div class="company-picker" onclick="navigate('perusahaan')">
      ${hasCo?`<div class="co-badge" style="background:${c.color};color:${c.dark?'#111':'#fff'}">${esc(c.initial)}</div>
      <div><div class="cp-name">${esc(c.name)}</div><div class="cp-sub">${S.companies.length} perusahaan aktif</div></div>`
      :`<div class="co-badge" style="background:var(--border);color:var(--text-2)">&ndash;</div>
      <div><div class="cp-name">Belum ada perusahaan</div><div class="cp-sub">Klik untuk menambah</div></div>`}
      <div class="cp-arrow">${ic('chevdown',14)}</div>
    </div>
    <nav class="navlist">
      ${mainNav.map(navItemHtml).join('')}
    </nav>
    ${acctNav.length?`<nav class="navlist" style="flex:none;border-top:1px solid var(--border);padding-top:10px;margin-top:4px;">
      ${acctNav.map(navItemHtml).join('')}
    </nav>`:''}
    <div class="sidebar-foot">DB Accounting v1.0${hasCo?` &middot; ${esc(c.name)}`:''}</div>
  `;
}
function closeSidebarMobile(){document.getElementById('sidebar').classList.remove('open');}
function toggleSidebarMobile(){document.getElementById('sidebar').classList.toggle('open');}

function renderTopbar(){
  const pageMeta=NAV.find(n=>n.r===S.route);
  const name=(S.session&&S.session.name)||(S.account&&S.account.name)||'Pengguna';
  const email=(S.session&&S.session.email)||(S.account&&S.account.email)||'';
  const initials=name.trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()||'U';
  document.getElementById('topbar').innerHTML=`
    <div class="icon-btn menu-toggle" onclick="toggleSidebarMobile()">${ic('txn',16)}</div>
    <div class="searchbox">${ic('search',14)}<span>Cari transaksi, akun, pelanggan, dokumen...</span></div>
    <div class="topbar-right">
      <div class="icon-btn" title="Ganti tema" onclick="toggleTheme()">${ic(S.theme==='dark'?'sun':'moon',16)}</div>
      <div class="icon-btn" title="Notifikasi">${ic('bell',16)}</div>
      <div class="userchip" id="userchip" onclick="toggleAcctMenu(event)">
        <div class="avatar">${esc(initials)}</div>
        <div><div class="un">${esc(name)}</div><div class="ur">Super Admin</div></div>
        ${S.acctMenuOpen?`<div class="acct-menu" onclick="event.stopPropagation()">
          <div class="acct-menu-head"><div class="un">${esc(name)}</div><div class="ue">${esc(email)}</div></div>
          <div class="acct-menu-item" onclick="closeAcctMenu();openEditAccountModal()">${ic('edit',14)}Edit Profil</div>
          <div class="acct-menu-item danger" onclick="closeAcctMenu();logout()">${ic('x',14)}Keluar (Logout)</div>
        </div>`:''}
      </div>
    </div>
  `;
}
function toggleAcctMenu(e){
  e.stopPropagation();
  document.removeEventListener('click',closeAcctMenuOnce);
  S.acctMenuOpen=!S.acctMenuOpen;
  renderTopbar();
  if(S.acctMenuOpen) setTimeout(()=>document.addEventListener('click',closeAcctMenuOnce),0);
}
function closeAcctMenuOnce(){ closeAcctMenu(); }
function closeAcctMenu(){
  document.removeEventListener('click',closeAcctMenuOnce);
  if(S.acctMenuOpen){ S.acctMenuOpen=false; renderTopbar(); }
}
function openEditAccountModal(){
  openModal('Edit Profil Akun',`
    <div class="field"><label>Nama Lengkap</label><input type="text" id="ea_name" value="${esc(S.account.name)}"></div>
    <div class="field"><label>Email</label><input type="text" id="ea_email" value="${esc(S.account.email)}" disabled style="opacity:0.6;"></div>
    <div class="field"><label>Kata Sandi Baru (opsional)</label><input type="password" id="ea_pass" placeholder="Kosongkan jika tidak diubah"></div>
    <div class="hint">Email tidak dapat diubah pada versi ini.</div>
  `);
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="submitEditAccount()">Simpan</button>`);
}
async function submitEditAccount(){
  const name=document.getElementById('ea_name').value.trim();
  const newPassword=document.getElementById('ea_pass').value;
  if(!name){toast('Nama tidak boleh kosong');return;}
  if(newPassword && newPassword.length<6){toast('Kata sandi baru minimal 6 karakter');return;}
  await updateAccountProfile({name,newPassword});
  closeModal();renderAll();
}

function renderAll(){
  // Tanpa perusahaan: arahkan ke halaman perusahaan (empty state + tombol buat baru).
  if(!S.companies.length && S.route!=='perusahaan' &&
     (typeof TierAccess==='undefined' || TierAccess.canAccess('perusahaan'))){
    S.route='perusahaan';
  }
  renderSidebar();renderTopbar();
  const view=document.getElementById('view');
  try{
    view.innerHTML = PAGES[S.route] ? PAGES[S.route]() : PAGES.dashboard();
  }catch(e){
    if(window.logger) window.logger.error('shell', 'Gagal render halaman', e);
    view.innerHTML=`<div class="empty"><div class="et">Terjadi kesalahan menampilkan halaman</div><div class="es">${esc(e.message)}</div></div>`;
  }
}

/* ============================= PAGES ============================= */
const PAGES={};

