const NAV = [
  {id:'dashboard', label:'Beranda', icon:'home'},
  {id:'produk', label:'Produk & Stok', icon:'box'},
  {id:'bahan-baku', label:'Bahan Baku', icon:'drop'},
  {id:'resep', label:'Resep & Formulasi', icon:'flask'},
  {id:'produksi', label:'Produksi', icon:'factory'},
  {id:'supplier', label:'Supplier', icon:'truck'},
  {id:'customer', label:'Customer', icon:'users'},
  {id:'penjualan', label:'Penjualan', icon:'cart'},
  {id:'pembelian', label:'Pembelian', icon:'bag'},
  {id:'online', label:'Toko Online', icon:'store'},
  {id:'laporan', label:'Laporan', icon:'file'},
  {id:'keuangan', label:'Keuangan', icon:'coin'},
  {id:'akun', label:'Kelola Anggota', icon:'users'},
  {id:'sandi', label:'Ganti Password', icon:'lock'},
];
const ICONS = {
  home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  box:'<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
  drop:'<path d="M12 2s7 8.2 7 13a7 7 0 11-14 0c0-4.8 7-13 7-13z"/>',
  truck:'<rect x="1" y="6" width="14" height="11" rx="1"/><path d="M15 10h4l3 3v4h-7z"/><circle cx="6" cy="19" r="1.6"/><circle cx="17.5" cy="19" r="1.6"/>',
  users:'<circle cx="9" cy="8" r="3.2"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5"/><circle cx="17" cy="8.5" r="2.6"/><path d="M16 14.6c2.3.4 4 2.1 5 5.4"/>',
  cart:'<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h2l2.4 12.2a2 2 0 002 1.8h9.2a2 2 0 002-1.6L21 7H6"/>',
  bag:'<path d="M6 8h12l1 13H5z"/><path d="M9 8V6a3 3 0 016 0v2"/>',
  coin:'<circle cx="12" cy="12" r="9"/><path d="M9 12h6M12 8v8"/>',
  flask:'<path d="M9 2h6M10 2v6l-5.5 9.5A1.8 1.8 0 006 20.3h12a1.8 1.8 0 001.5-2.8L14 8V2"/><path d="M7.5 14h9"/>',
  factory:'<path d="M3 21V11l5 3.2V11l5 3.2V11l5 3v7z"/><path d="M3 21h17"/><path d="M8 21v-4M13 21v-4"/>',
  store:'<path d="M3 9.5l1.3-5.5h15.4L21 9.5"/><path d="M4 9.5V20h16V9.5"/><path d="M9.5 20v-6h5v6"/>',
  file:'<path d="M6 2h8l5 5v15H6z"/><path d="M14 2v5h5"/><path d="M9 13h6M9 17h6"/>',
  lock:'<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
};
function iconSvg(name){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]||''}</svg>`; }

function renderNav(){
  const el = document.getElementById('navList');
  el.innerHTML = '<div class="nav-group-label">Menu Utama</div>' + NAV.filter(n => Access.can(n.id)).map(n =>
    `<div class="nav-item" data-nav="${n.id}">${iconSvg(n.icon)}<span>${n.label}</span></div>`
  ).join('');
}
function goTo(view){
  if(!Access.can(view)) { toast('Anda tidak punya akses ke menu ini'); return; }
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+view).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active', n.dataset.nav===view));
  if(window.innerWidth<=760) document.getElementById('sidebar').classList.remove('open');
  renderAll();
}
document.addEventListener('click', (e)=>{
  const nav = e.target.closest('[data-nav]');
  if(nav){ e.preventDefault(); goTo(nav.dataset.nav); }
});
document.getElementById('menuBtn').addEventListener('click', ()=>document.getElementById('sidebar').classList.toggle('open'));
