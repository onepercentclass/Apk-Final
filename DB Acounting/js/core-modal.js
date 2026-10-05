/* ============================= MODAL ============================= */
function openModal(title,bodyHtml,{wide,onMount,footer}={}){
  const root=document.getElementById('modalRoot');
  root.innerHTML=`<div class="modal-overlay" id="ovl">
    <div class="modal ${wide?'wide':''}">
      <div class="modal-head"><h3>${title}</h3><div class="modal-close" onclick="closeModal()">${ic('x',15)}</div></div>
      <div class="modal-body">${bodyHtml}</div>
      ${footer!==false?`<div class="modal-foot" id="modalFoot"></div>`:''}
    </div>
  </div>`;
  document.getElementById('ovl').addEventListener('click',e=>{if(e.target.id==='ovl')closeModal();});
  if(onMount) onMount();
}
function closeModal(){document.getElementById('modalRoot').innerHTML='';}
function modalFooter(html){const f=document.getElementById('modalFoot');if(f)f.innerHTML=html;}

