/**
 * N6 modules - owner / komisi
 * menu label : Performa & Komisi
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
  const DEFAULT_PROGRAM_CATALOG = [
    { id:'run-start', label:'Run-Start', category:'Online', mode:'fixed', unit:'3 Bulan', price:334000, komisiPerSesi:0 },
    { id:'privat-online', label:'Private Online', category:'Online', mode:'fixed', unit:'1 Bulan', price:800000, komisiPerSesi:0 },
    { id:'single-session', label:'Single Session Training', category:'Offline', mode:'fixed', unit:'1x Pertemuan', price:170000, komisiPerSesi:80000 },
    { id:'running-class', label:'Running Class (5–20 orang)', category:'Offline', mode:'configurable', unit:'per orang', ratePerSesi:65000, defaultMeetings:2, defaultWeeks:4, komisiPerSesi:0 },
    { id:'semi-private', label:'Semi Private (2 orang)', category:'Offline', mode:'configurable', unit:'per paket', ratePerSesi:190000, defaultMeetings:2, defaultWeeks:4, komisiPerSesi:0 },
    { id:'private-offline', label:'Private Offline', category:'Offline', mode:'configurable', unit:'per paket', ratePerSesi:150000, defaultMeetings:2, defaultWeeks:4, komisiPerSesi:0 },
    { id:'korporat', label:'Kerja Sama Korporat (Karyawan)', category:'Kerja Sama', mode:'custom', komisiPerSesi:0 },
    { id:'event-pacer', label:'Kerja Sama Event (Pacer)', category:'Kerja Sama', mode:'custom', komisiPerSesi:0 }
  ];
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
  window.confirmTeamPayment=async function(id){
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
  window.reviseTeamPayment=async function(id){
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
