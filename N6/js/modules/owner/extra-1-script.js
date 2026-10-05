/**
 * N6 modules - owner / extra script #1
 *
 * Standalone IIFE that already ran after the role bundle in owner.html.
 * Keep as its own file: it is loaded verbatim, in file-name order, after
 * js/dist/owner.js
 */


(function(){
 const KEY='n6-dashboard-theme';
 function setTheme(mode){
  const theme=mode==='light'?'light':'dark';document.body.dataset.theme=theme;
  document.getElementById('themeDark').setAttribute('aria-pressed',String(theme==='dark'));
  document.getElementById('themeLight').setAttribute('aria-pressed',String(theme==='light'));
  try{localStorage.setItem(KEY,theme)}catch(e){}
  if(typeof renderAnalytics==='function')try{renderAnalytics()}catch(e){}
 }
 document.getElementById('themeDark').addEventListener('click',()=>setTheme('dark'));
 document.getElementById('themeLight').addEventListener('click',()=>setTheme('light'));
 let saved='dark';try{saved=localStorage.getItem(KEY)||'dark'}catch(e){}setTheme(saved);
})();
