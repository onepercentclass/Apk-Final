/**
 * N6 modules - owner / komisi
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function teamRoster(){
    const result=[...coachRoster];
    clients.forEach(c=>{if(c.coach&&!result.some(r=>r.name.toLowerCase()===c.coach.toLowerCase()))result.push({id:'client-coach-'+c.coach,name:c.coach});});
    return result;
  }
/*__N6_UNIT__*/  function teamClients(month, coachName){
    const last=month+'-'+String(new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).getDate()).padStart(2,'0');
    return clients.filter(c=>String(c.coach||'').trim().toLowerCase()===String(coachName).trim().toLowerCase() &&
      c.status!=='Selesai' && clientStatus(c)!=='Nonaktif' &&
      (c.joinDate||c.createdAt||'0000-00-00').slice(0,10)<=last &&
      (!(programCache[c.id]||{}).endDate||(programCache[c.id]||{}).endDate>=month+'-01'));
  }
/*__N6_UNIT__*/  function teamKey(month,coach){return month+'|'+coach.id;}
  // Gunakan slot yang benar-benar tersimpan pada halaman Jadwal Coach.
  // Perhitungan dibatasi tanggal aktif klien dan hari libur coach.
/*__N6_UNIT__*/  function teamScheduleBreakdown(month,coach,entries){
    const sched=coachSchedule[coach.id]||{};
    const off=new Set(coachDayOff[coach.id]||[]);
    const [year,mon]=month.split('-').map(Number);
    const last=new Date(year,mon,0).getDate();
    const names=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const counts=Object.fromEntries(entries.map(c=>[String(c.id),0]));
    let total=0;
    const norm=s=>String(s||'').trim().toLocaleLowerCase('id-ID');
    for(let day=1;day<=last;day++){
      const date=month+'-'+String(day).padStart(2,'0');
      if(off.has(date))continue;
      const weekday=names[new Date(year,mon-1,day).getDay()];
      Object.entries(sched).forEach(([key,slot])=>{
        if(!key.startsWith(weekday+'|')||!slot?.client)return;
        if(!Array.isArray(slot.completedDates)||!slot.completedDates.includes(date))return;
        // Slots lama menyimpan satu nama/ID; slot multi-klien lama menyimpan
        // nama dipisahkan koma. Format baru dapat menyimpan clientIds.
        const rawIds=Array.isArray(slot.clientIds)?slot.clientIds:[];
        const tokens=[...rawIds.map(String), ...String(slot.client||'').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean)];
        const matched=new Set();
        entries.forEach(c=>{
          const start=(programCache[c.id]||{}).startDate||c.joinDate||c.createdAt||'0000-00-00';
          const end=(programCache[c.id]||{}).endDate||'9999-12-31';
          const activeOnDate=date>=String(start).slice(0,10)&&date<=String(end).slice(0,10);
          const referenced=tokens.some(token=>norm(token)===norm(c.name)||String(token)===String(c.id));
          if(activeOnDate&&referenced&&!matched.has(String(c.id))){
            counts[String(c.id)]=(counts[String(c.id)]||0)+1; matched.add(String(c.id)); total++;
          }
        });
      });
    }
    return {total,counts};
  }
/*__N6_UNIT__*/  function teamScheduledSessions(month,coach,entries){return teamScheduleBreakdown(month,coach,entries).total;}
/*__N6_UNIT__*/  function teamCommissionRows(month,coach,entries,breakdown){
    return entries.map(c=>{
      const program=catalogById(c.programId);
      const rate=Math.max(0,Number(program?.komisiPerSesi)||0);
      const sessions=breakdown.counts[String(c.id)]||0;
      // Komisi periode mengikuti jadwal bulan tersebut dan tarif Harga & Program.
      return {client:c,program,rate,sessions,amount:rate*sessions};
    });
  }
/*__N6_UNIT__*/  function teamSnapshot(month,coach){
    const entries=teamClients(month,coach.name);
    const breakdown=teamScheduleBreakdown(month,coach,entries);
    const commissionRows=teamCommissionRows(month,coach,entries,breakdown);
    const enrolled=entries.filter(c=>(c.joinDate||c.createdAt||'').slice(0,7)===month);
    return {clients:entries.length,active:entries.length,
      sessions:breakdown.total,
      revenue:enrolled.reduce((n,c)=>n+(Number(c.price)||0),0),
      amount:commissionRows.reduce((n,r)=>n+r.amount,0),
      tickets:tickets.filter(t=>entries.some(c=>c.id===t.clientId)).length};
  }
/*__N6_UNIT__*/  function teamHtmlProgram(){
    const ps=programCatalog.filter(p=>p.komisiPerSesi!=null||p.mode==='configurable'||p.id==='single-session');
    document.getElementById('komisiProgramBody').innerHTML=ps.length?ps.map(p=>`<div class="price-list-item"><div><div class="nm">${escapeHtml(p.label)}</div><div class="ct">Harga ${formatRupiah(programSinglePrice(p))}</div></div><div style="display:flex;align-items:center;gap:10px"><div class="pv">${p.komisiPerSesi?formatRupiah(p.komisiPerSesi)+'/sesi':'Belum diatur'}</div><button class="btn-sm" onclick="openProgramForm('${p.id}')">Atur</button></div></div>`).join(''):'<div class="list-empty">Belum ada program per sesi.</div>';
  }
/*__N6_UNIT__*/  function renderKomisi(){
    const monthInput=document.getElementById('teamMonth');if(!monthInput)return;
    if(!monthInput.value)monthInput.value=teamMonth;
    teamMonth=monthInput.value;
    const coachFilter=document.getElementById('teamCoach');const prev=coachFilter.value;
    coachFilter.innerHTML='<option value="">Semua Coach</option>'+teamRoster().map(c=>`<option value="${escapeHtml(String(c.id))}">${escapeHtml(c.name)}</option>`).join('');
    if([...coachFilter.options].some(o=>o.value===prev))coachFilter.value=prev;
    const roster=teamRoster().filter(c=>!coachFilter.value||String(c.id)===coachFilter.value);
    let total=0,paid=0,unpaid=0,visible=0;
    const rows=roster.map(c=>{
      const record=teamPayments[teamKey(teamMonth,c)];
      const snap=record?.snapshot||teamSnapshot(teamMonth,c);
      const when=record?.paidAt||'';
      visible++;total+=snap.amount;if(record?.paidAt)paid+=snap.amount;else unpaid+=snap.amount;
      const safeId=encodeURIComponent(String(c.id));
      return `<tr><td class="strong">${escapeHtml(c.name)}</td><td>${snap.active}</td><td>${snap.sessions}x</td><td>${formatRupiah(snap.revenue)}</td><td class="strong">${formatRupiah(snap.amount)}</td><td>${snap.tickets}</td><td><span class="badge ${record?.paidAt?'green':'amber'}">${record?.paidAt?'Sudah Dibayar':'Belum Dibayar'}</span></td><td class="muted">${when?new Date(when).toLocaleString('id-ID',{dateStyle:'medium',timeStyle:'short'}):'—'}</td><td style="text-align:right;white-space:nowrap">${record?.paidAt?`<button class="btn-sm" onclick="reviseTeamPayment(decodeURIComponent('${safeId}'))">Koreksi Status</button>`:`<button class="btn-primary" onclick="confirmTeamPayment(decodeURIComponent('${safeId}'))">Dibayar</button>`}</td></tr>`;
    }).filter(Boolean);
    document.getElementById('komisiBody').innerHTML=rows.length?rows.join(''):'<tr><td colspan="9" class="muted" style="text-align:center;padding:22px">Tidak ada data untuk filter ini.</td></tr>';
    document.getElementById('teamTotal').textContent=formatRupiah(total);
    document.getElementById('teamPaid').textContent=formatRupiah(paid);
    document.getElementById('teamUnpaid').textContent=formatRupiah(unpaid);
    document.getElementById('teamCount').textContent=visible;
    const [y,m]=teamMonth.split('-').map(Number);
    document.getElementById('teamPeriodNote').textContent=`Periode ${BULAN_ID[m-1]} ${y} • Data performa dan komisi mengikuti bulan yang dipilih. Status pembayaran tetap tersimpan sebagai rekap.`;
    teamHtmlProgram();
  }
/*__N6_UNIT__*/  function n6PaymentApproval(coach,month,snap){
    return new Promise(resolve=>{
      const overlay=document.getElementById('n6PayModal');
      const details=document.getElementById('n6PayDetails');
      const entries=teamClients(month,coach.name);
      const breakdown=teamScheduleBreakdown(month,coach,entries);
      const programRows=teamCommissionRows(month,coach,entries,breakdown).map(r=>
        `<tr><td>${escapeHtml(r.client.name)}</td><td>${escapeHtml(r.program?.label||r.client.programLabel||'Program')}<br><small>${r.sessions} sesi × ${formatRupiah(r.rate)}</small></td><td style="text-align:right">${formatRupiah(r.amount)}</td></tr>`
      ).join('');
      const [y,m]=month.split('-').map(Number);
      details.innerHTML=`<p style="color:var(--asphalt);margin-bottom:14px">${escapeHtml(coach.name)} • ${BULAN_ID[m-1]} ${y}</p><div class="detail-grid"><div class="detail-item"><div class="l">Klien aktif</div><div class="v">${snap.active}</div></div><div class="detail-item"><div class="l">Sesi terjadwal</div><div class="v">${snap.sessions}</div></div></div><div style="overflow-x:auto"><table style="min-width:0;width:100%;font-size:12px"><thead><tr><th>Klien</th><th>Program</th><th style="text-align:right">Komisi</th></tr></thead><tbody>${programRows||'<tr><td colspan="3">Tidak ada pendaftaran periode ini</td></tr>'}</tbody></table></div><div style="padding:16px;border-radius:9px;background:var(--paper);display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:15px"><strong>Total komisi</strong><strong style="font-size:23px;color:var(--accent)">${formatRupiah(snap.amount)}</strong></div>`;
      const approve=document.getElementById('n6PayApprove'),cancel=document.getElementById('n6PayCancel'),close=document.getElementById('n6PayClose');
      const finish=value=>{overlay.classList.remove('show');approve.disabled=false;approve.removeEventListener('click',yes);cancel.removeEventListener('click',no);close.removeEventListener('click',no);overlay.removeEventListener('click',outside);resolve(value)};
      approve.disabled=snap.amount<=0;approve.title=snap.amount<=0?'Atur nominal komisi di Harga & Program terlebih dahulu':'';
      const yes=()=>finish(true),no=()=>finish(false),outside=e=>{if(e.target===overlay)no()};
      approve.addEventListener('click',yes);cancel.addEventListener('click',no);close.addEventListener('click',no);overlay.addEventListener('click',outside);overlay.classList.add('show');
    });
  }
/*__N6_UNIT__*/  window.confirmTeamPayment=async function(id){
    const coach=teamRoster().find(c=>String(c.id)===String(id));if(!coach)return;
    const month=document.getElementById('teamMonth').value,key=teamKey(month,coach);
    if(teamPayments[key]?.paidAt){showToast('Pembayaran sudah dikonfirmasi');return;}
    const snap=teamSnapshot(month,coach);
    if(!await n6PaymentApproval(coach,month,snap))return;
    if(snap.amount<=0){showToast('Total komisi Rp0. Atur komisi pada Harga & Program dan periksa paket klien sebelum pembayaran.');return;}
    const entry={coachId:coach.id,coachName:coach.name,month,snapshot:snap,paidAt:new Date().toISOString(),history:[...(teamPayments[key]?.history||[]),{action:'Konfirmasi pembayaran',at:new Date().toISOString(),amount:snap.amount}]};
    const next={...teamPayments,[key]:entry};
    if(!await storeSet('teamPayments',JSON.stringify(next))){showToast('Gagal menyimpan pembayaran. Jangan ulangi transfer sebelum memeriksa catatan.');return;}
    teamPayments=next;renderKomisi();showToast('Pembayaran berhasil dicatat dan dikunci');
  };
/*__N6_UNIT__*/  window.reviseTeamPayment=async function(id){
    const coach=teamRoster().find(c=>String(c.id)===String(id));if(!coach)return;
    const month=document.getElementById('teamMonth').value,key=teamKey(month,coach),record=teamPayments[key];
    if(!record?.paidAt)return;
    const reason=prompt(`KOREKSI STATUS PEMBAYARAN\nCoach: ${coach.name}\nPeriode: ${month}\nNominal tercatat: ${formatRupiah(record.snapshot.amount)}\nDibayar: ${new Date(record.paidAt).toLocaleString('id-ID')}\n\nMasukkan alasan koreksi (wajib). Status akan kembali Belum Dibayar, tetapi bukti konfirmasi lama tetap ada di riwayat.`);
    if(reason===null)return;if(!reason.trim()){showToast('Alasan koreksi wajib diisi');return;}
    if(!confirm(`Kembalikan status ${coach.name} periode ${month} menjadi BELUM DIBAYAR? Riwayat pembayaran sebelumnya tetap tersimpan.`))return;
    const updated={...record,paidAt:null,history:[...(record.history||[]),{action:'Pembatalan konfirmasi',at:new Date().toISOString(),reason:reason.trim(),previousPaidAt:record.paidAt,amount:record.snapshot.amount}]};
    const next={...teamPayments,[key]:updated};
    if(!await storeSet('teamPayments',JSON.stringify(next))){showToast('Koreksi gagal disimpan');return;}
    teamPayments=next;renderKomisi();showToast('Status dikoreksi; riwayat tersimpan');
  };
  document.getElementById('teamMonth').addEventListener('change',renderKomisi);
  document.getElementById('teamCoach').addEventListener('change',renderKomisi);
  // Report printer: independent, paginated A4 document with readable columns and audit trail.
/*__N6_UNIT__*/  function printN6Report({type,period,kpis,columns,rows,sections=[],notes=[],filename}){
    const esc=v=>escapeHtml(String(v??'—'));
    const css=`@page{size:A4 portrait;margin:16mm 15mm}*{box-sizing:border-box}html,body{margin:0!important;padding:0!important;width:100%!important;min-width:0!important;max-width:none!important;overflow:visible!important}body{font:9pt/1.55 Arial,Helvetica,sans-serif;color:#1b2b42;background:#fff;padding:0;-webkit-font-smoothing:antialiased}header{display:flex;align-items:flex-end;justify-content:space-between;gap:6mm;border-bottom:2.4pt solid #2159a9;padding-bottom:4mm;margin-bottom:8mm;break-inside:avoid}.header-left{display:flex;flex-direction:column;gap:2mm;min-width:0}.header-right{text-align:right;flex:0 0 auto}.brand{display:flex;align-items:center;gap:3mm;font-weight:800;color:#2159a9;font-size:11pt;letter-spacing:.5pt}.brand-mark{display:inline-flex;align-items:center;justify-content:center;width:16mm;height:14mm;flex:0 0 16mm}.brand-mark img{display:block;max-width:100%;max-height:100%;object-fit:contain}.brand-name{display:flex;flex-direction:column;gap:1mm}.brand-name small{font-size:6.6pt;letter-spacing:1pt;color:#64748b;font-weight:600}.eyebrow{font-size:7.4pt;color:#64748b;text-transform:uppercase;letter-spacing:.4pt}h1{font-size:16pt;margin:0;color:#132743;line-height:1.25}.meta{font-size:8.4pt;color:#5b6b82;margin-top:1.5mm}h2{font-size:10.5pt;color:#204d87;border-bottom:1pt solid #cbd8e9;padding-bottom:2mm;margin:8mm 0 3.5mm;break-after:avoid;letter-spacing:.2pt}.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(38mm,1fr));gap:3mm;margin-bottom:6mm}.kpi{min-width:0;border:1pt solid #d8e2ee;border-left:2.6pt solid #2159a9;border-radius:1.2mm;padding:3mm;break-inside:avoid;background:#fafcff}.kpi .label{font-size:7.2pt;color:#61738b;text-transform:uppercase;letter-spacing:.3pt;margin-bottom:1.4mm}.kpi .value{font-size:12.5pt;font-weight:800;color:#173c73;overflow-wrap:anywhere;line-height:1.2}.section{width:100%;max-width:100%;break-inside:auto}table{width:100%!important;max-width:100%!important;min-width:0!important;table-layout:fixed;border-collapse:collapse;font-size:8pt;margin-bottom:4mm}thead{display:table-header-group}th{background:#204c83;color:white;text-align:left;font-size:7.4pt;letter-spacing:.2pt;padding:2.3mm 1.8mm;overflow-wrap:anywhere}td{padding:2.1mm 1.8mm;border-bottom:0.6pt solid #e3e9f2;vertical-align:top;overflow-wrap:anywhere;word-break:break-word;white-space:normal!important}tr{break-inside:avoid;page-break-inside:avoid}tbody tr:nth-child(even){background:#f4f7fb}.num{text-align:right;font-variant-numeric:tabular-nums}.empty{text-align:center;color:#7a8aa0;padding:5mm}.note{font-size:7.6pt;color:#475569;background:#f2f6fc;border-left:2.4pt solid #2159a9;border-radius:1mm;padding:3mm;margin-top:3.5mm;overflow-wrap:anywhere;line-height:1.5}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:14mm;margin-top:11mm;break-inside:avoid}.signature{text-align:center;font-size:8.4pt;color:#33465e}.signature .line{margin:14mm 0 2mm;border-bottom:0.8pt solid #33465e}.footer{margin-top:8mm;border-top:0.8pt solid #d8e2ed;padding-top:2.6mm;display:flex;justify-content:space-between;gap:4mm;color:#6b7b90;font-size:7.2pt;break-inside:avoid}.section-break{break-before:page}.slot-extra-row{margin-bottom:9px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}table{page-break-inside:auto}thead{display:table-header-group}h2{break-after:avoid}}`;
    const table=(cols,data)=>`<table><colgroup>${cols.map(c=>`<col style="width:${c.width||((100/cols.length).toFixed(4)+'%')}">`).join('')}</colgroup><thead><tr>${cols.map(c=>`<th class="${c.numeric?'num':''}">${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${data.length?data.map(row=>`<tr>${cols.map((c,i)=>`<td class="${c.numeric?'num':''}">${esc(row[i])}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${cols.length}" class="empty">Tidak ada data pada periode ini.</td></tr>`}</tbody></table>`;
    const html=`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Number Six - ${esc(type)}</title><style>${css}</style><style id="n6-requested-polish">#panel-jadwalcoach #coachGuide{line-height:1.7}#panel-beranda .analytics-controls input[type=date]{width:auto;min-width:145px;background:#14243a;color:#f1f6ff;border:1px solid #304660;border-radius:7px;padding:9px}@media(max-width:640px){#panel-beranda .analytics-controls input[type=date]{width:100%;min-width:0}}</style>
</head><body><header><div class="header-left"><div class="brand"><span class="brand-mark"><img src="assets/img/logo-report-a4.png" alt="Logo Number Six"></span><span class="brand-name">NUMBER SIX<small>RUNNING • PERFORMANCE SYSTEM</small></span></div><div class="eyebrow">Laporan operasional • Dokumen internal</div></div><div class="header-right"><h1>${esc(type)}</h1><div class="meta">Periode: ${esc(period)}</div></div></header><div class="kpis">${kpis.map(([k,v])=>`<div class="kpi"><div class="label">${esc(k)}</div><div class="value">${esc(v)}</div></div>`).join('')}</div><section class="section"><h2>01 / Rincian utama</h2>${table(columns,rows)}</section>${sections.map((sec,i)=>`<section class="section ${sec.newPage?'section-break':''}"><h2>${String(i+2).padStart(2,'0')} / ${esc(sec.title)}</h2>${table(sec.columns,sec.rows)}</section>`).join('')}${notes.map(n=>`<div class="note">${esc(n)}</div>`).join('')}<div class="signatures"><div class="signature"><div>Diperiksa oleh</div><div class="line"></div>Administrasi / Keuangan</div><div class="signature"><div>Disetujui oleh</div><div class="line"></div>Owner</div></div><div class="footer"><span>NUMBER SIX RUNNING • Arsip internal • Lampirkan bukti transaksi asli</span><span>Dicetak: ${esc(nowPrintLabel().tanggal)} • ${esc(nowPrintLabel().jam)}</span></div></body></html>`;
    const w=window.open('','_blank');if(!w){showToast('Izinkan pop-up untuk mencetak PDF');return;}
    w.document.open();w.document.write(html);w.document.close();w.addEventListener('load',()=>{w.focus();setTimeout(()=>w.print(),350)},{once:true});
  }
  document.getElementById('teamPrintPdf').addEventListener('click',()=>{
    const month=document.getElementById('teamMonth').value,filter=document.getElementById('teamCoach').value;
    const roster=teamRoster().filter(c=>!filter||String(c.id)===filter);
    const data=roster.map(coach=>{const record=teamPayments[teamKey(month,coach)];return {coach:coach.name,...(record?.snapshot||teamSnapshot(month,coach)),paidAt:record?.paidAt||null,history:record?.history||[]};});
    const [y,m]=month.split('-').map(Number),period=`${BULAN_ID[m-1]} ${y}`,total=data.reduce((n,r)=>n+r.amount,0),paid=data.filter(r=>r.paidAt).reduce((n,r)=>n+r.amount,0);
    const audit=data.flatMap(r=>r.history.map(h=>[r.coach,h.action,new Date(h.at).toLocaleString('id-ID'),formatRupiah(h.amount||0),h.reason||'—']));
    printN6Report({type:'Laporan Performa & Komisi Coach',period:period+(filter?' • '+document.getElementById('teamCoach').selectedOptions[0]?.text:''),filename:'komisi-'+month,
      kpis:[['Total komisi',formatRupiah(total)],['Sudah dibayar',formatRupiah(paid)],['Belum dibayar',formatRupiah(total-paid)],['Jumlah coach',String(data.length)]],
      columns:[{label:'Coach',width:'21%'},{label:'Klien aktif',width:'11%',numeric:true},{label:'Sesi jadwal',width:'12%',numeric:true},{label:'Pendapatan',width:'18%',numeric:true},{label:'Komisi',width:'18%',numeric:true},{label:'Status',width:'20%'}],
      rows:data.map(r=>[r.coach,r.active,r.sessions,formatRupiah(r.revenue),formatRupiah(r.amount),r.paidAt?'Sudah dibayar':'Belum dibayar']),
      sections:[{title:'Bukti konfirmasi pembayaran',columns:[{label:'Coach',width:'28%'},{label:'Nominal',width:'22%',numeric:true},{label:'Waktu konfirmasi',width:'30%'},{label:'Status',width:'20%'}],rows:data.map(r=>[r.coach,formatRupiah(r.amount),r.paidAt?new Date(r.paidAt).toLocaleString('id-ID'):'—',r.paidAt?'Sudah dibayar':'Belum dibayar'])},{title:'Jejak perubahan status',columns:[{label:'Coach',width:'19%'},{label:'Aktivitas',width:'22%'},{label:'Waktu',width:'22%'},{label:'Nominal',width:'17%',numeric:true},{label:'Alasan',width:'20%'}],rows:audit}],
      notes:['Komisi final mengikuti sesi yang ditandai selesai pada bulan tersebut dan tarif komisi per sesi Harga & Program. Sesi adalah jadwal terencana, bukan verifikasi kehadiran. Pembayaran yang sudah dikonfirmasi menggunakan snapshot nominal tersimpan.','Laporan berasal dari data yang tersedia pada perangkat ini. Cocokkan dengan bukti transfer sebelum ditandatangani.']});
  });
  document.getElementById('finPrintPdf').addEventListener('click',()=>{
    const cs=financeFilteredClients(),es=financeFilteredExpenses(),cat=['Online','Offline','Kerja Sama'];
    const cats=cat.map(name=>{const ids=new Set(programCatalog.filter(p=>p.category===name).map(p=>p.id));const list=cs.filter(c=>ids.has(c.programId));return [name,String(list.length),formatRupiah(list.reduce((n,c)=>n+(Number(c.price)||0),0))];});
    const unknown=cs.filter(c=>!programCatalog.some(p=>p.id===c.programId));if(unknown.length)cats.push(['Program lainnya / arsip',String(unknown.length),formatRupiah(unknown.reduce((n,c)=>n+(Number(c.price)||0),0))]);
    const month=finFilterMode==='month'?finSelectedMonth:todayISO().slice(0,7);
    printN6Report({type:'Laporan Keuangan',period:financePeriodLabel(),filename:'keuangan-'+month,
      kpis:[['Total pendapatan',formatRupiah(financeRevenue())],['Komisi coach',formatRupiah(financeCommission())],['Pengeluaran lain',formatRupiah(financeExpenseTotal())],['Estimasi laba bersih',formatRupiah(financeProfit())]],
      columns:[{label:'Kategori program',width:'45%'},{label:'Jumlah klien',width:'20%',numeric:true},{label:'Total pendapatan',width:'35%',numeric:true}],rows:cats,
      sections:[{title:'Rincian pengeluaran lain',columns:[{label:'Tanggal',width:'20%'},{label:'Kategori',width:'24%'},{label:'Keterangan',width:'34%'},{label:'Nominal',width:'22%',numeric:true}],rows:es.map(e=>[formatDateID(e.date),e.category,e.desc,formatRupiah(e.amount)])},{title:'Rincian komisi berdasarkan jadwal coach',columns:[{label:'Coach',width:'28%'},{label:'Dasar perhitungan',width:'29%'},{label:'Periode',width:'19%'},{label:'Komisi final',width:'24%',numeric:true}],rows:financeCommissionRows().map(r=>[r.coach,'Komisi sesi selesai',r.month,formatRupiah(r.amount)])}],
      notes:['Estimasi laba bersih = pendapatan - estimasi komisi - pengeluaran lain. Nilai komisi mengikuti sesi selesai pada halaman Komisi Coach; pembayaran terkonfirmasi memakai snapshot tersimpan.','Laporan ini bukan laporan akuntansi teraudit. Periksa tanggal pendaftaran, transaksi, dan bukti pengeluaran sebelum pengesahan.']});
  });
  /* ================= RENDER: KEUANGAN ================= */
