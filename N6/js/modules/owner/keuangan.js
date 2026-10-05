/**
 * N6 modules - owner / keuangan
 * menu label : Keuangan
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
  function printN6Report({type,period,kpis,columns,rows,sections=[],notes=[],filename}){
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
/*__N6_UNIT__*/  function financeFilteredExpenses(){ return expenses.filter(e => inFinanceRange(e.date)); }
/*__N6_UNIT__*/  function financeExpenseTotal(){ return financeFilteredExpenses().reduce((s,e) => s + (Number(e.amount)||0), 0); }
/*__N6_UNIT__*/  function financeProfit(){ return financeRevenue() - financeCommission() - financeExpenseTotal(); }
/*__N6_UNIT__*/  function renderKeuangan(){
    document.getElementById('finPeriodLabel').textContent = financePeriodLabel();
    document.getElementById('revenueCategoryPeriod').textContent = financePeriodLabel();
    document.getElementById('finRevenue').textContent = formatRupiah(financeRevenue());
    document.getElementById('finCommission').textContent = formatRupiah(financeCommission());
    document.getElementById('finExpense').textContent = formatRupiah(financeExpenseTotal());
    document.getElementById('finProfit').textContent = formatRupiah(financeProfit());

    const periodClients = financeFilteredClients();
    const cats = ['Online','Offline','Kerja Sama'];
    document.getElementById('revenueByCategoryBody').innerHTML = cats.map(cat => {
      const catProgramIds = new Set(programCatalog.filter(p => p.category === cat).map(p => p.id));
      const revenue = periodClients.filter(c => catProgramIds.has(c.programId)).reduce((s,c) => s + (Number(c.price)||0), 0);
      const count = periodClients.filter(c => catProgramIds.has(c.programId)).length;
      return `<div class="price-list-item">
        <div><div class="nm">${cat}</div><div class="ct">${count} klien</div></div>
        <div class="pv">${formatRupiah(revenue)}</div>
      </div>`;
    }).join('');

    const rows = [...financeFilteredExpenses()].sort((a,b) => (b.date||'').localeCompare(a.date||''));
    document.getElementById('expenseBody').innerHTML = rows.length ? rows.map(e => `
      <tr>
        <td>${formatDateID(e.date)}</td>
        <td class="muted">${escapeHtml(e.category)}</td>
        <td>${escapeHtml(e.desc)}</td>
        <td class="right strong">${formatRupiah(e.amount)}</td>
        <td class="right"><button class="btn-danger-sm" onclick="deleteExpense('${e.id}')">Hapus</button></td>
      </tr>`).join('') : `<tr><td colspan="5" class="muted" style="text-align:center; padding:16px 0;">Belum ada pengeluaran pada periode ini.</td></tr>`;
  }
  window.openExpenseForm = function(){
    document.getElementById('exDate').value = todayISO();
    document.getElementById('exCategory').value = 'Operasional';
    document.getElementById('exDesc').value = '';
    document.getElementById('exAmount').value = '';
    document.getElementById('expenseFormModal').classList.add('show');
  };
  window.closeExpenseForm = function(){ document.getElementById('expenseFormModal').classList.remove('show'); };
/*__N6_UNIT__*/  async function saveExpenseForm(){
    const desc = document.getElementById('exDesc').value.trim();
    const amount = parseInt(document.getElementById('exAmount').value, 10) || 0;
    if (!desc || !amount){ showToast('Lengkapi deskripsi dan nominal pengeluaran'); return; }
    expenses.push({ id:'ex-' + Date.now(), date: document.getElementById('exDate').value || todayISO(), category: document.getElementById('exCategory').value, desc, amount });
    await persistExpenses();
    closeExpenseForm();
    showToast('Pengeluaran dicatat');
    renderAll();
  }
  window.deleteExpense = function(id){
    expenses = expenses.filter(e => e.id !== id);
    persistExpenses().then(() => { showToast('Pengeluaran dihapus'); renderAll(); });
  };

  /* ================= RENDER: PERFORMA TIM ================= */
