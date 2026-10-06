/**
 * N6 modules - headcoach / bootstrap
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  const navButtons = document.querySelectorAll('[data-panel]');
/*__N6_UNIT__*/  const panels = document.querySelectorAll('.panel');
/*__N6_UNIT__*/  const pageTitle = document.getElementById('pageTitle');
/*__N6_UNIT__*/  const TITLES = { hub:'Beranda',hcprogram:'Buat Program',hcmanual:'Buat Program',hcclientchat:'Chat dengan Klien',hcmonitor:'Monitoring Klien',home:'Beranda', coach:'Coach', klien:'Klien', atlet:'Atlet Binaan', koreksi:'Koreksi',  chat:'Chat Tim', akun:'Pengaturan & Akun' };
/*__N6_UNIT__*/  const MORE_SHEET_PANELS = ['coach', 'atlet', 'chat', 'akun'];
/*__N6_UNIT__*/  const moreNavBtn = document.getElementById('moreNavBtn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-panel');
      navButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-panel') === target));
      moreNavBtn.classList.toggle('active', MORE_SHEET_PANELS.includes(target));
      panels.forEach(p => p.classList.remove('active'));
      const chosenPanel=document.getElementById('panel-' + target);if(chosenPanel)chosenPanel.classList.add('active');
      pageTitle.textContent = TITLES[target];
      closeSidebar();
      closeMoreSheet();
      document.querySelector('.content').scrollTop = 0;
    });
  });

  /* ================= NAV: "LAINNYA" BOTTOM SHEET (mobile) ================= */
/*__N6_UNIT__*/  const moreSheetOverlay = document.getElementById('moreSheetOverlay');
/*__N6_UNIT__*/  function openMoreSheet(){ moreSheetOverlay.classList.add('show'); }
/*__N6_UNIT__*/  function closeMoreSheet(){ moreSheetOverlay.classList.remove('show'); }
  moreNavBtn.addEventListener('click', openMoreSheet);
  moreSheetOverlay.addEventListener('click', (e) => { if (e.target === moreSheetOverlay) closeMoreSheet(); });

  /* ================= NAV: SUB TABS ================= */
  document.querySelectorAll('.subtabs').forEach(group => {
    const groupName = group.getAttribute('data-group');
    const section = group.closest('.panel');
    const btns = group.querySelectorAll('.subtab-btn');
    const subpanels = section.querySelectorAll('.subpanel');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        subpanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(groupName + '-' + btn.getAttribute('data-sub')).classList.add('active');
      });
    });
  });

  /* ================= MOBILE SIDEBAR TOGGLE ================= */
/*__N6_UNIT__*/  const sidebarEl = document.getElementById('sidebar');
/*__N6_UNIT__*/  const sidebarOverlay = document.getElementById('sidebarOverlay');
/*__N6_UNIT__*/  function openSidebar(){ sidebarEl.classList.add('open'); sidebarOverlay.classList.add('show'); }
/*__N6_UNIT__*/  function closeSidebar(){ sidebarEl.classList.remove('open'); sidebarOverlay.classList.remove('show'); }
  document.getElementById('hamburgerBtn').addEventListener('click', openSidebar);
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  /* ================= INIT ================= */
  // Muat data dari API terlebih dahulu, lalu render. Bila API kosong/error,
  // setiap panel menampilkan empty state "Belum ada data" (tanpa fallback dummy).
  loadAllData();
  loadProgramsFromStorage();
  loadInternalChat('admin');
  loadInternalChat('owner');
