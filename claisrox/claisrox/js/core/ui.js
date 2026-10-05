function toast(msg, type){
  const wrap = document.getElementById('toastWrap');
  const t = document.createElement('div');
  t.className = 'toast' + (type==='success' ? ' success' : '');
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}

function showModal(){ document.getElementById('overlay').classList.add('show'); }
function closeModal(){
  document.getElementById('overlay').classList.remove('show');
  document.getElementById('modalBody').className = 'modal';
}
document.getElementById('overlay').addEventListener('click',(e)=>{ if(e.target.id==='overlay') closeModal(); });
