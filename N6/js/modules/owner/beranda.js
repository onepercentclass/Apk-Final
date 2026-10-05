/**
 * N6 modules - owner / beranda
 * menu label : Beranda
 * minimum tier: 0
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/owner/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/owner.js. Concatenating every fragment in manifest
 * order reproduces owner.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__
  function renderBeranda(){
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
/*__N6_UNIT__*/  function aSvg(values,labels,kind){const w=700,h=245,L=55,R=12,T=20,B=36,plotW=w-L-R,plotH=h-T-B,max=Math.max(1,...values)*1.16;let out=`<svg class="analytics-chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Grafik ${kind==='bar'?'jumlah klien':'pendapatan'} per bulan">`;
    for(let i=0;i<=4;i++){let y=T+plotH*i/4;out+=`<line x1="${L}" x2="${w-R}" y1="${y}" y2="${y}" stroke="var(--chart-grid)" stroke-dasharray="3 5"/><text x="${L-8}" y="${y+4}" text-anchor="end">${aShort(max*(4-i)/4)}</text>`;}
    if(kind==='bar'){const step=plotW/values.length;values.forEach((v,i)=>{const bh=v/max*plotH,x=L+i*step+step*.18,y=T+plotH-bh;out+=`<rect x="${x}" y="${y}" width="${step*.64}" height="${bh}" rx="4" fill="var(--chart-fill)"><title>${aEsc(labels[i])}: ${v} klien</title></rect>`;});}
    else{const pts=values.map((v,i)=>[L+(values.length===1?plotW/2:i*plotW/(values.length-1)),T+plotH-v/max*plotH]);const path=pts.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ');const area=path+` L${pts.at(-1)[0]} ${T+plotH} L${pts[0][0]} ${T+plotH} Z`;out+=`<defs><linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="var(--chart-fill)" stop-opacity=".43"/><stop offset="1" stop-color="var(--chart-fill)" stop-opacity="0"/></linearGradient></defs><path d="${area}" fill="url(#revenueFill)"/><path d="${path}" fill="none" stroke="var(--chart-fill)" stroke-width="3" stroke-linejoin="round"/>`;pts.forEach((p,i)=>out+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="var(--chart-point)"><title>${aEsc(labels[i])}: ${aMoney(values[i])}</title></circle>`);}
    labels.forEach((label,i)=>{const x=L+(kind==='bar'?(i+.5)*plotW/labels.length:labels.length===1?plotW/2:i*plotW/(labels.length-1));out+=`<text x="${x}" y="${h-9}" text-anchor="middle">${aEsc(label)}</text>`;});return out+'</svg>';}
/*__N6_UNIT__*/  function renderAnalytics(){
    const root=document.getElementById('analyticsPeriod');if(!root)return;
    const coachSelect=document.getElementById('analyticsCoach'),old=coachSelect.value;
    coachSelect.innerHTML='<option value="">Semua Coach</option>'+coachRoster.map(c=>`<option value="${aEsc(c.name)}">${aEsc(c.name)}</option>`).join('');coachSelect.value=old;
    const coach=coachSelect.value,today=todayISO();let from=today.slice(0,8)+'01',to=today;
    if(root.value==='custom'){from=document.getElementById('analyticsFrom').value||from;to=document.getElementById('analyticsTo').value||today;if(from>to){const t=from;from=to;to=t;}}
    document.getElementById('analyticsFrom').style.display=root.value==='custom'?'inline-block':'none';document.getElementById('analyticsTo').style.display=root.value==='custom'?'inline-block':'none';
    const historyMap=new Map();[...archivedClients,...clients].forEach(c=>{if(c&&c.id!=null)historyMap.set(String(c.id),c)});const history=[...historyMap.values()];
    const selected=history.filter(c=>{const d=String(c.joinDate||'').slice(0,10);return(!coach||c.coach===coach)&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&d>=from&&d<=to;});
    const months=[];let [yy,mm]=from.slice(0,7).split('-').map(Number),[ey,em]=to.slice(0,7).split('-').map(Number);while(yy<ey||(yy===ey&&mm<=em)){months.push({key:yy+'-'+String(mm).padStart(2,'0'),label:new Date(yy,mm-1,1).toLocaleDateString('id-ID',{month:'short',year:'2-digit'})});if(++mm>12){mm=1;yy++;}}
    const revenues=months.map(m=>selected.filter(c=>c.joinDate.slice(0,7)===m.key).reduce((s,c)=>s+(Number(c.price)||0),0)),counts=months.map(m=>selected.filter(c=>c.joinDate.slice(0,7)===m.key).length),sum=revenues.reduce((a,b)=>a+b,0);
    document.getElementById('analyticsRevenueTotal').textContent=aMoney(sum);document.getElementById('analyticsClientTotal').textContent=selected.length+' pendaftaran';
    document.getElementById('revenueChart').innerHTML=sum?aSvg(revenues,months.map(m=>m.label),'line')+'<p class="mini-note">Pendapatan per bulan dalam rentang yang dipilih.</p>':'<div class="analytics-empty">Belum ada pendapatan pada rentang ini.</div>';
    document.getElementById('growthChart').innerHTML=selected.length?aSvg(counts,months.map(m=>m.label),'bar')+'<p class="mini-note">Pendaftaran baru per bulan dalam rentang yang dipilih.</p>':'<div class="analytics-empty">Belum ada pendaftaran pada rentang ini.</div>';
    const cats=[...new Set(programCatalog.map(p=>p.category).filter(Boolean))],groups=cats.map(cat=>{const ids=new Set(programCatalog.filter(p=>p.category===cat).map(p=>p.id));return{label:cat,value:selected.filter(c=>ids.has(c.programId)).reduce((s,c)=>s+(Number(c.price)||0),0)}});const known=new Set(programCatalog.map(p=>p.id)),other=selected.filter(c=>!known.has(c.programId)).reduce((s,c)=>s+(Number(c.price)||0),0);if(other)groups.push({label:'Lainnya',value:other});const positive=groups.filter(g=>g.value>0);let cumulative=0;const gradient=positive.map((g,i)=>{let st=cumulative/sum*100;cumulative+=g.value;return`${ANALYTICS_COLORS[i%ANALYTICS_COLORS.length]} ${st}% ${cumulative/sum*100}%`}).join(',');
    document.getElementById('analyticsPrograms').innerHTML=sum?`<div class="donut-layout"><div class="donut-graphic" style="background:conic-gradient(${gradient})"><div class="donut-hole">${aShort(sum)}<small>Total pendapatan</small></div></div><div class="donut-legend">${positive.map((g,i)=>`<div><span><i class="legend-dot" style="background:${ANALYTICS_COLORS[i%ANALYTICS_COLORS.length]}"></i>${aEsc(g.label)}</span><strong>${(g.value/sum*100).toFixed(1)}%</strong></div>`).join('')}</div></div>`:'<div class="analytics-empty">Belum ada pendapatan pada rentang ini.</div>';
    const coaches=(coach?coachRoster.filter(c=>c.name===coach):coachRoster).map(c=>({name:c.name,count:selected.filter(x=>x.coach===c.name).length})).sort((a,b)=>b.count-a.count),maxCoach=Math.max(1,...coaches.map(c=>c.count));document.getElementById('analyticsCoaches').innerHTML=coaches.length?`<div class="analytics-progress">${coaches.map((c,i)=>aProgress(c.name,c.count,maxCoach,c.count+' klien',ANALYTICS_COLORS[i%ANALYTICS_COLORS.length])).join('')}</div>`:'<div class="analytics-empty">Belum ada coach terdaftar.</div>';
    const commission=selected.reduce((s,c)=>s+clientCommissionAmount(c),0),periodExpenses=expenses.filter(e=>e.date&&e.date>=from&&e.date<=to),exp=coach?null:periodExpenses.reduce((s,e)=>s+(Number(e.amount)||0),0),net=coach?null:sum-commission-exp;
    document.getElementById('analyticsFinance').innerHTML=`<div class="analytics-progress">${aProgress('Pendapatan',sum,Math.max(sum,commission,exp||0,1),aMoney(sum),'var(--chart-fill)')}${aProgress('Komisi final coach',commission,Math.max(sum,commission,exp||0,1),aMoney(commission),'#7869ff')}${coach?'<p class="mini-note">Pengeluaran umum dan laba bersih hanya ditampilkan pada filter Semua Coach agar tidak salah dialokasikan.</p>':aProgress('Pengeluaran lainnya',exp,Math.max(sum,commission,exp||0,1),aMoney(exp),'#f5b957')+`<div class="analytics-kpi"><small>Estimasi laba bersih periode ini</small><strong>${aMoney(net)}</strong></div>`}</div>`;
    const allSelected=clients.filter(c=>!coach||c.coach===coach),active=allSelected.filter(c=>clientStatus(c)==='Aktif').length,ending=allSelected.filter(c=>clientStatus(c)==='Akan Berakhir').length,total=allSelected.length,open=tickets.filter(t=>t.status!=='Selesai').length,done=tickets.filter(t=>t.status==='Selesai').length;
    document.getElementById('analyticsOperations').innerHTML=`<div class="analytics-progress">${aProgress('Klien aktif',active,total,active+' / '+total,'#3ed3a0')}${aProgress('Program akan berakhir',ending,total,ending+' klien','#f5b957')}${aProgress('Tiket selesai',done,open+done,done+' / '+(open+done),'#328bff')}${aProgress('Pesan menunggu balasan',waitingReplyCount(),Math.max(1,clients.length),waitingReplyCount()+' pesan','#a389ff')}</div><p class="mini-note">Operasional menggunakan kondisi terkini dashboard.</p>`;
    if(typeof window.renderBusinessHealth==='function')window.renderBusinessHealth({sum,newClients:selected.length,commission,active,ending,open,waiting:waitingReplyCount(),coach});
  }
  window.n6RefreshAnalytics=renderAnalytics;
  document.getElementById('analyticsPeriod').addEventListener('change',()=>{if(document.getElementById('analyticsPeriod').value==='custom'){const t=todayISO(),d=new Date(),f=new Date(d.getFullYear(),d.getMonth(),1);document.getElementById('analyticsFrom').value=document.getElementById('analyticsFrom').value||f.toISOString().slice(0,10);document.getElementById('analyticsTo').value=document.getElementById('analyticsTo').value||t;}renderAnalytics();});
  document.getElementById('analyticsFrom').addEventListener('change',renderAnalytics);document.getElementById('analyticsTo').addEventListener('change',renderAnalytics);
  document.getElementById('analyticsCoach').addEventListener('change',renderAnalytics);
  document.getElementById('analyticsExport').addEventListener('click',()=>{const mode=document.getElementById('analyticsPeriod').value,today=todayISO();let from=mode==='current'?today.slice(0,8)+'01':document.getElementById('analyticsFrom').value,to=mode==='current'?today:document.getElementById('analyticsTo').value;if(!from||!to){showToast('Tentukan rentang tanggal terlebih dahulu');return;}if(from>to){const t=from;from=to;to=t;}const coach=document.getElementById('analyticsCoach').value,history=new Map();[...archivedClients,...clients].forEach(c=>{if(c&&c.id!=null)history.set(String(c.id),c)});const rows=[['Tanggal','Bulan','Coach','Pendaftaran','Pendapatan','Estimasi Komisi']];[...history.values()].filter(c=>(!coach||c.coach===coach)&&c.joinDate>=from&&c.joinDate<=to).forEach(c=>rows.push([c.joinDate,c.joinDate.slice(0,7),coach||c.coach||'—',1,Number(c.price)||0,clientCommissionAmount(c)]));const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const link=document.createElement('a');link.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));link.download='number-six-analytics.csv';link.click();URL.revokeObjectURL(link.href);});
/*__N6_UNIT__*/  const originalRenderBeranda=renderBeranda;renderBeranda=function(){originalRenderBeranda();renderAnalytics();};

  // Refresh from Admin CS after edits in another tab; never replace Owner client data.
