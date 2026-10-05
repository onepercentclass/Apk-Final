/* ---- KAS & BANK ---- */
PAGES.kasbank=function(){
  const c=co();
  const rows=[...c.cashbank].sort((a,b)=>b.date.localeCompare(a.date));
  const kb=saldoKasBank(c);
  return `
  <div class="row wrap" style="margin-bottom:4px;"><div><div class="page-title">Kas & Bank</div><div class="page-sub">Multi rekening, kas kecil, dan transfer ${esc(c.name)}.</div></div>
    <div class="row" style="margin-left:auto;gap:8px;"><button class="btn-dl" onclick="exportKasbank()">${ic('download',13)}Unduh CSV</button><button class="btn btn-primary" onclick="openCashbankModal()">${ic('plus',14)}Transaksi Baru</button></div></div>
  <div class="grid g4" style="margin-bottom:16px;">
    ${kb.map(k=>`<div class="card stat-card"><div class="stat-label">${esc(k.name)}</div><div class="stat-value">${fmtRp(k.balance)}</div></div>`).join('')}
  </div>
  <div class="card"><div class="table-wrap">
    ${rows.length?`<table><thead><tr><th>No.</th><th>Tanggal</th><th>Rekening</th><th>Jenis</th><th>Keterangan</th><th class="right">Nominal</th></tr></thead><tbody>
      ${rows.map(r=>`<tr><td class="acct-pill">${esc(r.no)}</td><td>${fmtDate(r.date)}</td><td>${esc(c.coa.find(a=>a.code===r.account)?.name||r.account)}</td><td><span class="badge ${r.type==='Masuk'?'b-pos':r.type==='Keluar'?'b-neg':'b-accent'}">${esc(r.type)}</span></td><td>${esc(r.desc)}</td><td class="right num">${fmtRp(r.amount)}</td></tr>`).join('')}
    </tbody></table>`:`<div class="empty">${ic('bank',32)}<div class="et">Belum ada transaksi kas/bank</div><div class="es">Catat penerimaan, pengeluaran, atau transfer antar rekening.</div></div>`}
  </div></div>`;
};
function exportKasbank(){
  const c=co();
  const rows=[...c.cashbank].sort((a,b)=>b.date.localeCompare(a.date));
  downloadCSV('KasBank',['No.','Tanggal','Rekening','Jenis','Keterangan','Nominal'],
    rows.map(r=>[r.no,fmtDate(r.date),(c.coa.find(a=>a.code===r.account)||{}).name||r.account,r.type,r.desc,r.amount]));
}
function openCashbankModal(){
  const c=co();
  const rekOpts=['1-1000','1-1010','1-1020','1-1030'].map(code=>`<option value="${code}">${esc(c.coa.find(a=>a.code===code).name)}</option>`).join('');
  const counterOpts=c.coa.filter(a=>!['1-1000','1-1010','1-1020','1-1030'].includes(a.code)).map(a=>`<option value="${a.code}">${a.code} — ${esc(a.name)}</option>`).join('');
  openModal('Transaksi Kas & Bank Baru',`
    <div class="field-row"><div class="field"><label>Tanggal</label><input type="date" id="k_date" value="${todayStr()}"></div>
    <div class="field"><label>Jenis</label><select id="k_type"><option value="Masuk">Kas Masuk</option><option value="Keluar">Kas Keluar</option><option value="Transfer">Transfer Antar Rekening</option></select></div></div>
    <div class="field-row"><div class="field" id="k_accwrap"><label>Rekening</label><select id="k_acc">${rekOpts}</select></div>
    <div class="field" id="k_counterwrap"><label>Akun Lawan (Kategori)</label><select id="k_counter">${counterOpts}</select></div></div>
    <div class="field"><label>Nominal</label><input type="number" id="k_amount" placeholder="0"></div>
    <div class="field"><label>Keterangan</label><input type="text" id="k_desc" placeholder="Contoh: Bayar listrik toko"></div>
  `,{onMount(){
    const type=document.getElementById('k_type'), counterWrap=document.getElementById('k_counter').parentElement;
    function upd(){
      const t=type.value;
      if(t==='Transfer'){counterWrap.querySelector('label').textContent='Rekening Tujuan';counterWrap.innerHTML='<label>Rekening Tujuan</label><select id="k_counter">'+rekOpts+'</select>';}
      else{counterWrap.innerHTML='<label>Akun Lawan (Kategori)</label><select id="k_counter">'+counterOpts+'</select>';}
    }
    type.addEventListener('change',upd);
  }});
  modalFooter(`<button class="btn" onclick="closeModal()">Batal</button><button class="btn btn-primary" onclick="submitCashbank()">Simpan</button>`);
}
function submitCashbank(){
  const date=document.getElementById('k_date').value, type=document.getElementById('k_type').value;
  const account=document.getElementById('k_acc').value, counter=document.getElementById('k_counter').value;
  const amount=document.getElementById('k_amount').value, desc=document.getElementById('k_desc').value.trim();
  if(!date||!amount||Number(amount)<=0||!desc){toast('Lengkapi semua kolom');return;}
  if(account===counter){toast('Rekening dan akun lawan tidak boleh sama');return;}
  const c=co(); addCashbank(c,{date,type,account,counter,amount,desc}); saveCompany(c.id); closeModal(); toast('Transaksi kas/bank tersimpan'); renderAll();
}

