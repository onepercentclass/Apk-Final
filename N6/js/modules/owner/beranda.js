/**
 * N6 modules - owner / beranda
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function clientStatus(c){
    const p = programCache[c.id] || {};
    if (!p.endDate) return c.status || 'Aktif';
    const diff = daysBetween(todayISO(), p.endDate);
    if (diff < 0) return 'Nonaktif';
    if (diff <= 7) return 'Akan Berakhir';
    return 'Aktif';
  }
/*__N6_UNIT__*/  function statusTone(status){
    if (status === 'Aktif') return 'green';
    if (status === 'Akan Berakhir') return 'amber';
    if (status === 'Nonaktif') return 'neutral';
    return 'neutral';
  }
/*__N6_UNIT__*/  function autoIssues(){
    const out = [];
    for (const c of clients){
      const reports = reportsCache[c.id] || {};
      Object.keys(reports).forEach(date => {
        const r = reports[date];
        if (r && r.issue && r.issue.trim()){
          out.push({ clientId:c.id, clientName:c.name, date, issue:r.issue });
        }
      });
    }
    return out.sort((a,b) => b.date.localeCompare(a.date));
  }
/*__N6_UNIT__*/  function openTicketCount(){
    const manualOpen = tickets.filter(t => t.status !== 'Selesai').length;
    const alreadyLinked = new Set(tickets.map(t => t.autoKey).filter(Boolean));
    const autoOpen = autoIssues().filter(a => !alreadyLinked.has(a.clientId + '|' + a.date)).length;
    return manualOpen + autoOpen;
  }
/*__N6_UNIT__*/  function lastMessage(id){
    const arr = chatCache[id] || [];
    return arr.length ? arr[arr.length-1] : null;
  }
/*__N6_UNIT__*/  function waitingReplyCount(){
    return clients.filter(c => { const m = lastMessage(c.id); return m && m.sender === 'client'; }).length;
  }

  /* ================= RENDER: BERANDA ================= */
/*__N6_UNIT__*/  function renderBeranda(){
    document.getElementById('statTotalRevenue').textContent = formatRupiah(totalRevenue());
    document.getElementById('statProfit').textContent = formatRupiah(netProfit());
    document.getElementById('statTotalKlien').textContent = clients.length;
    const baru7 = clients.filter(c => c.joinDate && daysBetween(c.joinDate, todayISO()) <= 7 && daysBetween(c.joinDate, todayISO()) >= 0).length;
    document.getElementById('statKlienBaru').textContent = baru7;
    document.getElementById('statTiketTerbuka').textContent = openTicketCount();
    document.getElementById('statPesanMenunggu').textContent = waitingReplyCount();

    const attention = [];
    autoIssues().slice(0,5).forEach(a => attention.push({ type:'red', name:a.clientName, desc:'Laporan ' + formatDateID(a.date) + ': ' + a.issue, id:a.clientId }));
    clients.forEach(c => {
      if (clientStatus(c) === 'Akan Berakhir') attention.push({ type:'amber', name:c.name, desc:'Program akan berakhir ' + formatDateID((programCache[c.id]||{}).endDate), id:c.id });
    });
    document.getElementById('attentionList').innerHTML = attention.length ? attention.slice(0,6).map(a => `
      <div class="attention-item">
        <div class="attention-dot ${a.type}"></div>
        <div class="attention-body"><div class="name">${escapeHtml(a.name)}</div><div class="desc">${escapeHtml(a.desc)}</div></div>
      </div>`).join('') : '<div class="attention-empty">Tidak ada hal yang perlu perhatian saat ini.</div>';

    renderCoachKosongToday();
    renderTopPerformer();

    const msgs = clients.map(c => ({ c, m: lastMessage(c.id) })).filter(x => x.m).sort((a,b) => new Date(b.m.at) - new Date(a.m.at)).slice(0,5);
    document.getElementById('recentMessagesList').innerHTML = msgs.length ? msgs.map(x => `
      <div class="client-row" onclick="openChatModal('${x.c.id}')">
        <div>
          <div class="name">${escapeHtml(x.c.name)} ${x.m.sender === 'client' ? '<span class="unread-dot" style="display:inline-block; vertical-align:middle; margin-left:6px;"></span>' : ''}</div>
          <div class="msg-preview">${x.m.sender === 'client' ? 'Klien' : 'Kamu'}: ${escapeHtml(x.m.text)}</div>
        </div>
        <div class="client-tags"><span class="badge neutral">${new Date(x.m.at).toLocaleDateString('id-ID')}</span></div>
      </div>`).join('') : '<div class="list-empty">Belum ada percakapan.</div>';

    const recentClients = [...clients].sort((a,b) => (b.joinDate||'').localeCompare(a.joinDate||'')).slice(0,5);
    document.getElementById('recentClientsList').innerHTML = recentClients.length ? recentClients.map(c => `
      <div class="client-row" onclick="openClientDetail('${c.id}')">
        <div><div class="name">${escapeHtml(c.name)}</div><div class="meta">${escapeHtml(c.programLabel||'-')} — Coach ${escapeHtml(c.coach||'-')}</div></div>
        <div class="client-tags"><span class="badge neutral">${formatDateID(c.joinDate)}</span></div>
      </div>`).join('') : '<div class="list-empty">Belum ada klien terdaftar.</div>';

    const tiketBadge = openTicketCount();
    ['navDotTiket','navDotTiketMobile'].forEach(id => {
      const el = document.getElementById(id);
      if (tiketBadge > 0){ el.style.display='flex'; el.textContent = tiketBadge; } else { el.style.display='none'; }
    });
    const pesanBadge = waitingReplyCount();
    ['navDotPesan','navDotPesanMobile'].forEach(id => {
      const el = document.getElementById(id);
      if (pesanBadge > 0){ el.style.display='flex'; el.textContent = pesanBadge; } else { el.style.display='none'; }
    });
    document.getElementById('bellIcon').classList.toggle('has-alert', (tiketBadge + pesanBadge) > 0);
  }

/*__N6_UNIT__*/  function renderTopPerformer(){
    const box = document.getElementById('topPerformerBox');
    if (!coachRoster.length){ box.innerHTML = '<div class="list-empty">Belum ada coach terdaftar.</div>'; return; }
    const ranked = [...coachRoster].map(c => ({ coach:c, revenue: coachRevenue(c.name), komisi: coachCommissionAmount(c), klien: clients.filter(x=>x.coach===c.name).length }))
      .sort((a,b) => b.revenue - a.revenue);
    const top = ranked[0];
    if (!top || top.revenue === 0){ box.innerHTML = '<div class="list-empty">Belum ada pendapatan tercatat bulan ini.</div>'; return; }
    box.innerHTML = `
      <div class="client-row" style="cursor:default;">
        <div><div class="name">🏆 ${escapeHtml(top.coach.name)}</div><div class="meta">${top.klien} klien aktif — komisi ${formatRupiah(top.komisi)} (${coachSessionCount(top.coach.name)}x sesi)</div></div>
        <div class="client-tags"><span class="badge green">${formatRupiah(top.revenue)}</span></div>
      </div>`;
  }

/*__N6_UNIT__*/  function renderCoachKosongToday(){
    const day = todayDayName();
    const todayStr = todayISO();
    const rows = coachRoster.map(coach => {
      const off = isCoachOff(coach.id, todayStr);
      const sched = coachSchedule[coach.id] || {};
      const freeBlocks = off ? [] : BLOCKS.filter(b => !sched[day + '|' + b.key]);
      return { coach, freeBlocks, off };
    });
    document.getElementById('coachKosongToday').innerHTML = rows.length ? rows.map(r => `
      <div class="attention-item">
        <div class="attention-dot ${r.off ? 'amber' : (r.freeBlocks.length ? 'green' : 'red')}"></div>
        <div class="attention-body">
          <div class="name">${escapeHtml(r.coach.name)} <span style="font-weight:400; color:var(--asphalt); font-size:11.5px;">(${day})</span></div>
          <div class="desc">${r.off ? 'Libur hari ini' : (r.freeBlocks.length ? 'Kosong: ' + r.freeBlocks.map(b => b.label).join(', ') : 'Penuh sepanjang hari')}</div>
        </div>
      </div>`).join('') : '<div class="attention-empty">Belum ada coach terdaftar.</div>';
  }

  /* ================= RENDER: KLIEN ================= */
/*__N6_UNIT__*/  function populateCoachFilters(){
    const sel = document.getElementById('klienFilterCoach');
    sel.innerHTML = '<option value="">Semua Coach</option>' + coachRoster.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');
  }
