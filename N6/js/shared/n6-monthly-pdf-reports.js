/**
 * N6 shared module - n6-monthly-pdf-reports
 *
 * Was duplicated byte for byte in owner and admin.html.
 * Kept once here; both roles load this same file after their bundle.
 *
 * Standalone IIFE, already self-contained, so sharing it changes nothing.
 */

(function(){
 'use strict';
 const KEY='n6:coach:requests:v1', kinds={izin:'Izin Coach',reschedule:'Reschedule Jadwal',cuti:'Izin Cuti Coach'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const fmt=s=>{if(!s)return '—';const d=new Date(s.length===10?s+'T00:00:00':s);return isNaN(d)?s:d.toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',...(s.includes('T')?{hour:'2-digit',minute:'2-digit'}:{})});};
 const monthName=m=>new Date(m+'-01T00:00:00').toLocaleDateString('id-ID',{month:'long',year:'numeric'});
 function load(){try{const a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a:[]}catch(e){return []}}
 function belongs(r,kind,m){if(r.kind!==kind)return false;if(kind==='izin')return (r.tanggal||'').slice(0,7)===m;
 if(kind==='reschedule')return (r.lama||'').slice(0,7)===m;
 return !!r.mulai&&!!r.selesai&&r.mulai.slice(0,7)<=m&&r.selesai.slice(0,7)>=m;}
 const titles={izin:['Tanggal izin','Jam sesi','Klien / sesi'],reschedule:['Jadwal lama','Jadwal baru','Klien / sesi'],cuti:['Mulai cuti','Selesai cuti','Jenis cuti']};
 function values(r,k){return k==='izin'?[fmt(r.tanggal),r.jam||'—',r.klien||'—']:k==='reschedule'?[fmt(r.lama),fmt(r.baru),r.klien||'—']:[fmt(r.mulai),fmt(r.selesai),r.jenis||'—'];}
 function printReport(kind){
  const input=document.querySelector('[data-n6-report-month="'+kind+'"]'),m=input&&input.value;
  if(!m){alert('Pilih bulan laporan terlebih dahulu.');input&&input.focus();return;}
  const rows=load().filter(r=>belongs(r,kind,m)).sort((a,b)=>(a.tanggal||a.lama||a.mulai||'').localeCompare(b.tanggal||b.lama||b.mulai||''));
  const counts={Menunggu:0,Disetujui:0,Ditolak:0};rows.forEach(r=>{const s=r.status||'Menunggu';if(s in counts)counts[s]++});
  const heads=['No.','Nama Coach',...titles[kind],'Alasan','Status','Dibuat','Diputuskan'];
  const logo='assets/img/logo-request-report.png';
  const period=monthName(m);
  const printed=new Date().toLocaleString('id-ID',{dateStyle:'long',timeStyle:'short'});
  const statusClass=s=>s==='Disetujui'?'approved':s==='Ditolak'?'rejected':'pending';
  const trs=rows.map((r,i)=>{
    const data=[i+1,r.coach||'—',...values(r,kind),r.alasan||'—',r.status||'Menunggu',fmt(r.created),fmt(r.decidedAt)];
    return '<tr>'+data.map((v,j)=>'<td'+(j===6?' class="reason"':j===7?' class="status-cell"':'')+'>'+(j===7?'<span class="status '+statusClass(v)+'">'+esc(v)+'</span>':esc(v))+'</td>').join('')+'</tr>';
  }).join('');
  const doc=`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>${esc(kinds[kind])} — ${esc(period)}</title>
  <style>
  @page{size:A4 landscape;margin:9mm 10mm}
  *{box-sizing:border-box}html,body{margin:0;padding:0}
  body{font-family:Arial,Helvetica,sans-serif;color:#202322;font-size:8pt;line-height:1.32;background:#fff}
  .print-button{background:#d62828;color:white;border:0;padding:10px 20px;border-radius:6px;font-weight:700;cursor:pointer;margin:0 0 20px}
  .masthead{display:flex;align-items:center;justify-content:space-between;gap:7mm;padding-bottom:3mm;border-bottom:2.5pt solid #d62828}
  .brand{display:flex;align-items:center;gap:3mm;min-width:0}
  .brand img{width:19mm;height:19mm;object-fit:contain;flex:none}
  .brand-name{font-weight:900;letter-spacing:.6pt;font-size:11pt;color:#181818;line-height:1.15}
  .brand-name small{display:block;color:#d62828;font-size:6pt;letter-spacing:1pt;margin-top:1mm}
  .report-heading{text-align:right;min-width:0}
  .eyebrow{color:#d62828;font-size:7pt;letter-spacing:1.4pt;font-weight:800;text-transform:uppercase;margin-bottom:2mm}
  h1{font-size:13pt;line-height:1.15;letter-spacing:-.3pt;margin:0;color:#191919}
  .period{font-size:8pt;margin-top:1mm;color:#4f5552}
  .meta{display:flex;justify-content:space-between;gap:8mm;padding:2mm 0 0;font-size:7pt;color:#656a67}
  .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:2mm;margin:4mm 0 4mm}
  .metric{border:1px solid #e3e5e3;border-top:2pt solid #252525;border-radius:2mm;padding:2mm 3mm;background:#fafafa;break-inside:avoid}
  .metric .label{font-size:7pt;text-transform:uppercase;letter-spacing:.6pt;color:#686c69}
  .metric strong{display:block;font-size:13pt;line-height:1.1;margin-top:1mm;color:#222}
  .metric.wait{border-top-color:#c18a23}.metric.ok{border-top-color:#24824d}.metric.no{border-top-color:#d62828}
  .section-title{font-size:9pt;font-weight:800;margin:0 0 2mm;display:flex;justify-content:space-between;align-items:center}
  .section-title span{font-size:7.5pt;font-weight:400;color:#747a75}
  table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:6.6pt}
  thead{display:table-header-group}
  th{background:#242624;color:#fff;text-align:left;font-size:6.3pt;padding:1.8mm 1.1mm;letter-spacing:.15pt;overflow-wrap:anywhere}
  td{padding:1.7mm 1.1mm;border-bottom:.6pt solid #e3e5e3;vertical-align:top;overflow-wrap:anywhere;word-break:normal}
  tbody tr:nth-child(even){background:#f6f7f6}
  tr{break-inside:avoid;page-break-inside:avoid}
  th:nth-child(1){width:4%}th:nth-child(2){width:11%}
  th:nth-child(3),th:nth-child(4){width:10%}
  th:nth-child(5){width:12%}th:nth-child(6){width:22%}
  th:nth-child(7){width:9%}th:nth-child(8){width:11%}th:nth-child(9){width:11%}
  .reason{line-height:1.45}
  .status{display:inline-block;font-size:6.2pt;font-weight:800;padding:.7mm 1mm;border-radius:2mm;white-space:nowrap}
  .status.approved{background:#e5f3e9;color:#1b7541}
  .status.rejected{background:#fbe8e8;color:#b72424}
  .status.pending{background:#fff2dc;color:#94600c}
  .empty{text-align:center;padding:13mm 4mm;color:#717772;font-size:9pt}
  .closing{display:grid;grid-template-columns:1.5fr 1fr;gap:8mm;margin-top:5mm;break-inside:avoid}
  .note{background:#f8f8f7;border-left:2pt solid #d62828;padding:3mm 4mm;font-size:7.5pt;color:#5d625e;line-height:1.5}
  .signature{text-align:center;font-size:8pt;color:#414541;padding-top:1mm}
  .signature .line{height:12mm;border-bottom:.8pt solid #8a8d8a;margin-bottom:2mm}
  .footer{margin-top:4mm;border-top:.6pt solid #dedfdd;padding-top:2.5mm;display:flex;justify-content:space-between;gap:8mm;color:#777b78;font-size:7pt}
  @media screen{body{max-width:1200px;padding:25px;margin:auto;background:#fff}.print-button{display:inline-block}}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.print-button{display:none!important}.closing{break-inside:avoid}table{max-width:100%!important}body{width:100%!important;margin:0!important;padding:0!important}}
  </style></head><body>
  <button class="print-button" onclick="window.print()">Cetak / Simpan sebagai PDF</button>
  <header class="masthead"><div class="brand"><img src="${logo}" alt="Logo N6"><div class="brand-name">NUMBER SIX<br>RUNNING<small>OFFICIAL MONTHLY REPORT</small></div></div>
  <div class="report-heading"><div class="eyebrow">Laporan Administrasi Coach</div><h1>${esc(kinds[kind])}</h1><div class="period">Periode ${esc(period)}</div></div></header>
  <div class="meta"><span>Jenis dokumen: Rekap pengajuan bulanan</span><span>Dicetak: ${esc(printed)}</span></div>
  <div class="summary">
  <div class="metric"><div class="label">Total Pengajuan</div><strong>${rows.length}</strong></div>
  <div class="metric wait"><div class="label">Menunggu</div><strong>${counts.Menunggu}</strong></div>
  <div class="metric ok"><div class="label">Disetujui</div><strong>${counts.Disetujui}</strong></div>
  <div class="metric no"><div class="label">Ditolak</div><strong>${counts.Ditolak}</strong></div>
  </div>
  <div class="section-title">Rincian Pengajuan <span>${rows.length} data · ${esc(period)}</span></div>
  <table><thead><tr>${heads.map(h=>'<th>'+esc(h)+'</th>').join('')}</tr></thead><tbody>${trs||'<tr><td colspan="9" class="empty">Tidak ada pengajuan pada periode laporan ini.</td></tr>'}</tbody></table>
  <div class="closing"><div class="note"><b>Catatan laporan</b><br>
  Laporan dibuat berdasarkan data yang tersimpan pada browser saat dicetak. Status mencerminkan catatan terakhir dan bukan tanda tangan elektronik.
  ${kind==='cuti'?'Pengajuan cuti yang beririsan dengan periode laporan turut dicantumkan.':kind==='reschedule'?'Periode laporan mengikuti tanggal jadwal lama. Persetujuan belum otomatis mengubah slot jadwal.':'Periode laporan mengikuti tanggal izin coach.'}
  </div><div class="signature">Diperiksa oleh<div class="line"></div>Nama &amp; tanda tangan penanggung jawab</div></div>
  <footer class="footer"><span>NUMBER SIX RUNNING · Laporan ${esc(kinds[kind])}</span><span>Dokumen administrasi internal</span></footer>
  </body></html>`;
  const w=window.open('','_blank');if(!w){alert('Pop-up diblokir browser. Izinkan pop-up untuk mencetak laporan PDF.');return;}w.document.open();w.document.write(doc);w.document.close();w.focus();
 }
 document.querySelectorAll('[data-n6-report-month]').forEach(i=>{i.value=new Date().toLocaleDateString('en-CA',{year:'numeric',month:'2-digit'}).slice(0,7);});
 document.querySelectorAll('[data-n6-report]').forEach(b=>b.addEventListener('click',()=>printReport(b.dataset.n6Report)));
})();