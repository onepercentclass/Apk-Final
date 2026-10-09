/* ---- JURNAL UMUM ---- */
PAGES.jurnal=function(){
  const c=co();
  const rows=[...c.journal].sort((a,b)=>b.date.localeCompare(a.date));
  return `
  <div class="row wrap" style="margin-bottom:4px;"><div><div class="page-title">Jurnal Umum</div><div class="page-sub">Seluruh entri jurnal ${esc(c.name)} (otomatis &amp; manual).</div></div>
    <div class="row" style="margin-left:auto;gap:8px;"><button class="btn-dl" onclick="exportJurnal()">${ic('download',13)}Unduh CSV</button><button class="btn btn-primary" onclick="openJournalModal()">${ic('plus',14)}Jurnal Manual</button></div></div>
  <div class="card"><div class="table-wrap">
    ${rows.length?`<table><thead><tr><th>No. Jurnal</th><th>Tanggal</th><th>Sumber</th><th>Keterangan</th><th>Akun</th><th class="right">Debit</th><th class="right">Kredit</th></tr></thead><tbody>
      ${rows.map(j=>j.lines.map((l,i)=>`<tr><td class="acct-pill">${i===0?esc(j.no):''}</td><td>${i===0?fmtDate(j.date):''}</td><td>${i===0?`<span class="badge b-neu">${esc(j.source)}</span>`:''}</td><td>${i===0?esc(j.desc):''}</td><td class="acct-pill">${acctLabel(c,l.account)}</td><td class="right num">${l.debit?fmtRp(l.debit):''}</td><td class="right num">${l.credit?fmtRp(l.credit):''}</td></tr>`).join('')).join('')}
    </tbody></table>`:`<div class="empty">${ic('journal',32)}<div class="et">Belum ada entri jurnal</div><div class="es">Jurnal akan otomatis dibuat dari transaksi Penjualan, Pembelian, dan Kas & Bank.</div></div>`}
  </div></div>`;
};
function exportJurnal(){
  const c=co();
  const rows=[...c.journal].sort((a,b)=>b.date.localeCompare(a.date));
  const out=[];
  rows.forEach(j=>j.lines.forEach((l,i)=>out.push([i===0?j.no:'',i===0?fmtDate(j.date):'',i===0?j.source:'',i===0?j.desc:'',acctLabel(c,l.account),l.debit||'',l.credit||''])));
  downloadCSV('JurnalUmum',['No. Jurnal','Tanggal','Sumber','Keterangan','Akun','Debit','Kredit'],out);
}
function openJournalModal(){
  const c=co();
  const acctOpts=c.coa.map(a=>`<option value="${a.code}">${a.code} — ${esc(a.name)}</option>`).join('');
  openModal('Jurnal Umum — Entri Manual',`
    <div class="field-row"><div class="field"><label>Tanggal</label><input type="date" id="j_date" value="${todayStr()}"></div>
    <div class="field"><label>Keterangan</label><input type="text" id="j_desc" placeholder="Deskripsi transaksi"></div></div>
    <div id="j_lines"></div>
    <button class="btn btn-sm" onclick="addJLine()">${ic('plus',13)}Tambah Baris</button>
    <div class="jline-total"><span>Debit: <b class="num" id="j_totd">Rp0</b></span><span>Kredit: <b class="num" id="j_totc">Rp0</b></span></div>
  `,{onMount(){window._jlineAcct=acctOpts;window._jlines=0;addJLine();addJLine();}});
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="submitJournal()">Posting Jurnal</button>`);
}
function addJLine(){
  const wrap=document.getElementById('j_lines'); const idx=window._jlines++;
  const div=document.createElement('div'); div.className='linebox'; div.dataset.idx=idx;
  div.innerHTML=`<div class="lrow">
    <div><label>Akun</label><select class="jl-acct">${window._jlineAcct}</select></div>
    <div><label>Debit</label><input type="number" class="jl-debit" placeholder="0" oninput="calcJTotals()"></div>
    <div><label>Kredit</label><input type="number" class="jl-credit" placeholder="0" oninput="calcJTotals()"></div>
    <div><button class="btn btn-sm btn-ghost" onclick="this.closest('.linebox').remove();calcJTotals();">${ic('trash',14)}</button></div>
  </div>`;
  wrap.appendChild(div);
}
function calcJTotals(){
  let d=0,c=0;
  document.querySelectorAll('.jl-debit').forEach(i=>d+=Number(i.value)||0);
  document.querySelectorAll('.jl-credit').forEach(i=>c+=Number(i.value)||0);
  document.getElementById('j_totd').textContent=fmtRp(d);
  document.getElementById('j_totc').textContent=fmtRp(c);
}
function submitJournal(){
  const date=document.getElementById('j_date').value, desc=document.getElementById('j_desc').value.trim();
  const lines=[];
  document.querySelectorAll('#j_lines .linebox').forEach(box=>{
    const account=box.querySelector('.jl-acct').value;
    const debit=Number(box.querySelector('.jl-debit').value)||0;
    const credit=Number(box.querySelector('.jl-credit').value)||0;
    if(debit>0||credit>0) lines.push({account,debit,credit});
  });
  const totD=lines.reduce((s,l)=>s+l.debit,0), totC=lines.reduce((s,l)=>s+l.credit,0);
  if(!date||!desc){toast('Isi tanggal dan keterangan');return;}
  if(lines.length<2){toast('Minimal 2 baris jurnal diperlukan');return;}
  if(Math.abs(totD-totC)>0.5||totD===0){toast('Total debit dan kredit harus sama dan lebih dari 0');return;}
  const c=co(); addManualJournal(c,{date,desc,lines}); saveCompany(c.id); closeModal(); toast('Jurnal berhasil diposting'); renderAll();
}

