/**
 * N6 modules - owner / extra script #2
 *
 * Standalone IIFE that already ran after the role bundle in owner.html.
 * Keep as its own file: it is loaded verbatim, in file-name order, after
 * js/dist/owner.js
 */


(function(){
 const modal=document.getElementById('mobileAccountModal');
 const btn=document.getElementById('mobileAccountBtn');
 const form=document.getElementById('accountDemoLogin');
 const logout=document.getElementById('accountDemoLogout');
 const display=document.getElementById('accountDisplayName');
 const status=document.getElementById('accountStatus');
 const input=document.getElementById('accountNameInput');
 const password=document.getElementById('accountPasswordInput');
 const toggle=document.getElementById('accountPasswordToggle');
 toggle.addEventListener('click',()=>{const show=password.type==='password';password.type=show?'text':'password';toggle.textContent=show?'Sembunyikan':'Lihat';toggle.setAttribute('aria-label',show?'Sembunyikan password':'Tampilkan password')});
 const key='n6_preview_account_name';
 function read(){try{return sessionStorage.getItem(key)||''}catch(e){return ''}}
 function render(){const name=read();display.textContent=name||'Owner';status.textContent=name?'Masuk · sesi pratinjau':'Belum masuk';form.hidden=!!name;logout.hidden=!name;}
 function close(){modal.classList.remove('show');btn.classList.remove('account-open');btn.setAttribute('aria-expanded','false')}
 btn.setAttribute('aria-expanded','false');
 btn.addEventListener('click',()=>{render();modal.classList.add('show');btn.classList.add('account-open');btn.setAttribute('aria-expanded','true')});
 document.getElementById('closeAccountModal').addEventListener('click',close);
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 form.addEventListener('submit',e=>{e.preventDefault();const name=input.value.trim();if(!name||password.value.length<6)return;try{sessionStorage.setItem(key,name)}catch(e){}password.value='';password.type='password';toggle.textContent='Lihat';render()});
 logout.addEventListener('click',()=>{try{sessionStorage.removeItem(key)}catch(e){}input.value='';password.value='';render()});
 render();
})();
