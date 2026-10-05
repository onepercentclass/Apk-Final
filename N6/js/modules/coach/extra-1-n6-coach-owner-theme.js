/**
 * N6 modules - coach / extra script #1
 *
 * Standalone IIFE that already ran after the role bundle in coach.html.
 * Keep as its own file: it is loaded verbatim, in file-name order, after
 * js/dist/coach.js
 */


(function(){
 const key='n6:shared-theme';
 const ids={dark:['coachThemeDark','coachAccountDark'],light:['coachThemeLight','coachAccountLight']};
 function setTheme(theme){theme=theme==='light'?'light':'dark';document.body.dataset.theme=theme;try{localStorage.setItem(key,theme)}catch(e){}Object.entries(ids).forEach(([t,arr])=>arr.forEach(id=>{const el=document.getElementById(id);if(el){el.classList.toggle('active',t===theme);el.setAttribute('aria-pressed',String(t===theme))}}));try{if(typeof Chart!=='undefined'&&Chart.instances){Object.values(Chart.instances).forEach(ch=>{const text=theme==='dark'?'#c5dfd3':'#627590';const grid=theme==='dark'?'#2c4a40':'#e0e9f5';if(ch.options.scales){Object.values(ch.options.scales).forEach(axis=>{if(axis.ticks)axis.ticks.color=text;if(axis.grid)axis.grid.color=grid})}if(ch.options.plugins?.legend?.labels)ch.options.plugins.legend.labels.color=text;ch.update()})}}catch(e){} }
 for(const [theme,arr] of Object.entries(ids))arr.forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTheme(theme)));
 let saved='dark';try{saved=localStorage.getItem(key)||localStorage.getItem('n6Owner:theme')||'dark'}catch(e){}setTheme(saved);
 document.querySelectorAll('[data-go]').forEach(el=>el.addEventListener('click',()=>document.querySelector('.side-nav [data-panel="'+el.dataset.go+'"]')?.click()));
 window.addEventListener('storage',e=>{if(e.key===key)setTheme(e.newValue)});
})();
