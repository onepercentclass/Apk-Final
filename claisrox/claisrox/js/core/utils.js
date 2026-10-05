function uid(prefix){ return prefix + '-' + Math.random().toString(36).slice(2,8).toUpperCase(); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function fmtRp(n){ return 'Rp' + Math.round(n||0).toLocaleString('id-ID'); }
function fmtDate(d){ return new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}); }
function genResi(){
  const d = new Date();
  const datePart = String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
  const rand = Math.floor(1000+Math.random()*9000);
  return 'CLSX'+datePart+rand;
}
