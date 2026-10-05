/* ============================= THEME ============================= */
function initTheme(){
  let saved=null;
  try{ saved=localStorage.getItem('dbacc-theme'); }catch(e){}
  S.theme = saved==='light'||saved==='dark' ? saved : 'dark';
  document.documentElement.setAttribute('data-theme',S.theme);
}
function toggleTheme(){
  S.theme = S.theme==='dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme',S.theme);
  try{ localStorage.setItem('dbacc-theme',S.theme); }catch(e){}
  renderAll();
}
initTheme();

