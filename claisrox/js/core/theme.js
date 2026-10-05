function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function applyTheme(theme){
  document.documentElement.setAttribute('data-theme', theme==='light' ? 'light' : 'dark');
  try{ localStorage.setItem(THEME_KEY, theme); }catch(e){}
  const btns = document.querySelectorAll('.theme-choice');
  btns.forEach(b=> b.classList.toggle('active', b.dataset.theme===theme));
  if(typeof renderAll === 'function' && typeof DATA !== 'undefined'){ renderAll(); }
}
function loadTheme(){
  let theme = 'dark';
  try{ theme = localStorage.getItem(THEME_KEY) || 'dark'; }catch(e){}
  document.documentElement.setAttribute('data-theme', theme==='light' ? 'light' : 'dark');
  return theme;
}
loadTheme();
