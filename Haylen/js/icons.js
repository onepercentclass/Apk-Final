/* Kumpulan ikon SVG (stroke) */
(function () {
  const p = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  Haylen.icons = {
    dashboard: p('<rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor"/>'),
    member: p('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
    program: p('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>'),
    coach: p('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'),
    jadwal: p('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M9 15l2 2 4-4"/>'),
    transaksi: p('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 10h18"/>'),
    laporan: p('<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>'),
    fasilitas: p('<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M10 21v-4h4v4"/>'),
    pengaturan: p('<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2.2-1.3L14 3h-4l-.4 2.5A7 7 0 0 0 7.4 6.8l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .9.1 1.3l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2.2 1.3L10 21h4l.4-2.5a7 7 0 0 0 2.2-1.3l2.3 1 2-3.4-2-1.5c.1-.4.1-.9.1-1.3z"/>'),
    users: p('<circle cx="9" cy="8" r="3.2"/><circle cx="17" cy="9" r="2.6"/><path d="M3 20c0-3.5 2.7-5.5 6-5.5s6 2 6 5.5M15 15c3 0 6 1.6 6 5"/>'),
    calendarCheck: p('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M9 15l2 2 4-4"/>'),
    wallet: p('<path d="M4 7a2 2 0 0 1 2-2h12v4"/><rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="16.5" cy="13.5" r="1.3" fill="currentColor"/>'),
    star: p('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor"/>'),
    chart: p('<path d="M5 20V11M12 20V5M19 20v-7" stroke-width="3.2"/>'),
    userPlus: p('<circle cx="10" cy="8" r="4"/><path d="M3 21c0-4 3-6.5 7-6.5M18 9v6M15 12h6"/>'),
    dollar: p('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M14.5 8.5c-.5-.8-1.4-1.2-2.5-1.2-1.4 0-2.4.7-2.4 1.8 0 2.5 5 1.2 5 3.8 0 1.1-1 1.9-2.6 1.9-1.1 0-2.1-.5-2.6-1.4M12 6v1.3M12 15.8V17"/>'),
    doc: p('<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5M9 14h6"/>'),
    receipt: p('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>'),
    check: p('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
    trophy: p('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M10 17h4"/>'),
    coin: p('<circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.5c0-1 1.1-1.7 2.5-1.7s2.5.7 2.5 1.7-1.1 1.5-2.5 1.7-2.5.7-2.5 1.7 1.1 1.7 2.5 1.7 2.5-.7 2.5-1.7"/>'),
    swim: p('<circle cx="16" cy="6" r="2"/><path d="m4 12 5-3 4 3 3-3M3 17c2 1.5 3 1.5 4.5 0 1.5-1.5 2.5-1.5 4 0s2.5 1.5 4 0 2.5-1.5 4 0"/>'),
  };
})();
