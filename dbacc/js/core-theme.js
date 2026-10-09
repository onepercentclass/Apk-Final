/* ============================= THEME ============================= */
function initTheme(){
  let saved=null;
  try{ saved=localStorage.getItem('dbacc-theme'); }catch(e){ if(window.logger) window.logger.caught('theme', e, 'load'); }
  S.theme = saved==='light'||saved==='dark' ? saved : 'dark';
  document.documentElement.setAttribute('data-theme',S.theme);
}
function toggleTheme(){
  S.theme = S.theme==='dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme',S.theme);
  try{ localStorage.setItem('dbacc-theme',S.theme); }catch(e){ if(window.logger) window.logger.caught('theme', e, 'save'); }
  renderAll();
}
initTheme();

