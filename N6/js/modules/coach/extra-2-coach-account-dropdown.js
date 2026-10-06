/**
 * N6 modules - coach / extra script #2
 *
 * Standalone IIFE that already ran after the role bundle in coach.html.
 * Keep as its own file: it is loaded verbatim, in file-name order, after
 * js/dist/coach.js
 */

(function(){const btn=document.getElementById('coachAccountBtn'),menu=document.getElementById('coachAccountMenu');if(!btn||!menu)return;function close(){menu.hidden=true;btn.setAttribute('aria-expanded','false')}btn.addEventListener('click',e=>{e.stopPropagation();const show=menu.hidden;menu.hidden=!show;btn.setAttribute('aria-expanded',String(show))});document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!btn.contains(e.target))close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});const logoutBtn=document.getElementById('coachLogoutBtn');if(logoutBtn)logoutBtn.addEventListener('click',()=>{try{const cfg=window.N6_API||{};window.localStorage.removeItem(cfg.tokenKey||'n6:api:token');window.localStorage.removeItem(cfg.refreshKey||'n6:api:refresh');window.localStorage.removeItem(cfg.userKey||'n6:api:user');}catch(err){}window.location.replace(window.location.pathname);});})();