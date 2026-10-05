let profitChartInst=null;
function financeHTML(){
  const kas = totalSales() - totalPurchases() + Number(DATA.finance.modal||0);
  const rows = [
    {label:'Kas & Bank', val:kas, icon:'coin', color:'var(--teal)', bg:'rgba(43,183,166,.14)'},
    {label:'Piutang', val:DATA.finance.piutang||0, icon:'users', color:'var(--amber)', bg:'rgba(232,163,57,.14)'},
    {label:'Hutang', val:DATA.finance.hutang||0, icon:'bag', color:'var(--red)', bg:'rgba(226,38,59,.14)'},
    {label:'Modal', val:DATA.finance.modal||0, icon:'box', color:'var(--violet)', bg:'rgba(139,111,232,.14)'},
  ];
  return rows.map(r=>`
    <div class="finance-row">
      <div class="finance-left">
        <div class="finance-ic" style="background:${r.bg}; color:${r.color};">${iconSvg(r.icon)}</div>
        <div class="finance-label">${r.label}</div>
      </div>
      <div class="finance-val">${fmtRp(r.val)}</div>
    </div>`).join('');
}
function renderFinanceSummary(){
  document.getElementById('financeSummary').innerHTML = financeHTML();
  const f2 = document.getElementById('financeSummary2');
  if(f2) f2.innerHTML = financeHTML();
}
function renderProfitChart(){
  const canvas = document.getElementById('profitChart');
  if(!canvas) return;
  const map = {};
  allSalesRecords().forEach(s=>{
    const key = s.date.slice(0,7);
    map[key] = (map[key]||0) + (s.total - cogsFor(s));
  });
  const keys = Object.keys(map).sort();
  const labels = keys.map(k=>{ const [y,m]=k.split('-'); return new Date(y,m-1).toLocaleDateString('id-ID',{month:'short',year:'2-digit'}); });
  const data = keys.map(k=>map[k]);
  if(profitChartInst) profitChartInst.destroy();
  if(data.length===0){ canvas.parentElement.innerHTML='<div class="empty">Belum ada data laba</div>'; return; }
  profitChartInst = new Chart(canvas, {
    type:'line',
    data:{labels, datasets:[{data, borderColor:'#e2263b', backgroundColor:'rgba(226,38,59,.12)', fill:true, tension:.35, pointRadius:3, pointBackgroundColor:'#e2263b'}]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ x:{ticks:{color:cssVar('--muted')}, grid:{display:false}}, y:{ticks:{color:cssVar('--muted'), callback:(v)=> v>=1000000?(v/1000000)+'jt':v}, grid:{color:cssVar('--line')}} } }
  });
}

function openFinanceModal(){
  const f = DATA.finance;
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">Atur Keuangan</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <form id="financeForm">
      <div class="form-row"><label>Modal</label><input class="input" type="number" name="modal" value="${f.modal||0}"></div>
      <div class="form-row"><label>Piutang</label><input class="input" type="number" name="piutang" value="${f.piutang||0}"></div>
      <div class="form-row"><label>Hutang</label><input class="input" type="number" name="hutang" value="${f.hutang||0}"></div>
      <div class="modal-foot">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Batal</button>
        <button type="submit" class="btn btn-primary">Simpan</button>
      </div>
    </form>`;
  document.getElementById('financeForm').addEventListener('submit',(e)=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    DATA.finance = {modal:Number(fd.get('modal')), piutang:Number(fd.get('piutang')), hutang:Number(fd.get('hutang'))};
    save(); closeModal(); renderAll(); toast('Data keuangan diperbarui','success');
  });
  showModal();
}
