/**
 * N6 modules - headcoach / extra script #3
 *
 * Standalone IIFE that already ran after the role bundle in headcoach.html.
 * Keep as its own file: it is loaded verbatim, in file-name order, after
 * js/dist/headcoach.js
 */

(function(){'use strict';
const $=id=>document.getElementById(id), form=$('hcProgramForm');if(!form)return;
const evalCard=$('hcLogForm')?.closest('.card');if(evalCard)evalCard.remove();
$('hcpDailyPlan')?.closest('label')?.style.setProperty('display','none');
const oldActions=$('hcpCreatePdf')?.closest('.hc-hub-actions');if(oldActions)oldActions.style.display='none';
const next=document.createElement('div');next.className='wide';next.innerHTML='<button type="button" class="btn-primary" id="n6NextToWeeks" style="width:100%;padding:15px">Lanjut: Susun Program Mingguan →</button><p class="hc-muted" style="margin-top:9px">Lengkapi data acuan, lalu pilih Minggu 1–5. Hanya minggu yang terisi yang diekspor.</p>';form.appendChild(next);
const calcPanel=document.createElement('section');calcPanel.className='card n6-intensity-embedded';calcPanel.id='hcIntensityEmbedded';calcPanel.innerHTML=`<div class="hc-hub-head"><div><h1>Kalkulator Intensitas · Buat Program</h1><p>Perkiraan target pace dan waktu berdasarkan PB, jarak, serta persentase kecepatan.</p></div></div><div class="card n6-program-card"><div class="card-head"><h3>Target Lari & Persentase Intensitas</h3></div><div class="card-body"><div class="n6-calc-fields"><label>Jarak target<select id="n6CalcDistance"><option value="1.5">1.500 m</option><option value="3">3.000 m</option><option value="5" selected>5K</option><option value="10">10K</option><option value="21.0975">Half Marathon</option><option value="42.195">Marathon</option></select></label><label>Target waktu (MM:SS atau HH:MM:SS)<input id="n6CalcTime" placeholder="Contoh: 25:00"></label><label>Umur (tahun)<input id="n6CalcAge" type="number" min="10" max="100" placeholder="Contoh: 25"></label><button type="button" class="btn-primary" id="n6CalcRun">Hitung Intensitas</button></div><div id="n6CalcResult" class="n6-calc-result" aria-live="polite"></div><p class="hc-muted">100% adalah kecepatan rata-rata target. Pada 80%, kecepatan menjadi 80% dari target sehingga waktu lebih lama. HR dihitung dari estimasi HR maks = 220 − umur, bukan ambang laktat atau rekomendasi medis.</p></div></div>`;
$('panel-hcprogram').append(calcPanel);
const panel=document.createElement('section');panel.className='panel';panel.id='panel-hcweekly';panel.innerHTML=`<div class="hc-hub-head"><div><h1>Susun Program Mingguan</h1><p>Atur jenis latihan, tambah atau ubah pilihan dropdown, lalu ekspor minggu yang telah diisi.</p></div><button type="button" class="btn-outline" id="n6BackToReference">← Data Acuan</button></div><div class="hc-banner" id="n6AthleteReference"></div><div class="card n6-program-card"><div class="card-head"><h3>Rencana Latihan · Minggu 1–5</h3></div><div class="card-body"><div class="n6-week-tabs" id="n6WeekTabs" role="group" aria-label="Pilih minggu"></div><div class="n6-week-summary" id="n6WeekSummary"></div><details class="n6-custom-types"><summary>Kelola pilihan jenis latihan <span>Tambah / Ubah / Hapus</span></summary><div class="n6-type-tools"><input id="n6NewType" type="text" placeholder="Contoh: Aerobic Threshold" maxlength="70" aria-label="Nama jenis latihan baru"><button type="button" class="btn-primary" id="n6AddType">+ Tambah</button></div><div id="n6TypeList"></div><p class="hc-muted">Perubahan pilihan tersimpan pada browser ini dan berlaku untuk seluruh minggu.</p></details><p class="hc-muted" style="margin:12px 0">Saat jenis latihan dipilih, HR dan pace terisi otomatis dari umur, jarak PB dan waktu PB sekarang. Ini perkiraan latihan, bukan zona individual hasil tes; Head Coach dapat mengubahnya.</p><div id="n6DayEditor"></div><div class="hc-hub-actions n6-export-actions"><button class="btn-outline" type="button" id="n6PrevWeek">← Minggu Sebelumnya</button><button class="btn-outline" type="button" id="n6NextWeek">Minggu Berikutnya →</button><button class="btn-primary" type="button" id="n6SaveJpg">Simpan & Unduh JPG</button><button class="btn-outline" type="button" id="n6SavePdf">Simpan & Unduh PDF</button></div><p class="hc-muted" style="margin-top:12px">Minggu tanpa latihan atau rincian tidak disertakan. PDF dibuat per minggu pada halaman A4 terpisah; JPG hanya memuat minggu yang terisi.</p></div></div>`;
$('panel-hcprogram').after(panel);
const distField=document.createElement('label');distField.className='wide';distField.innerHTML='Jarak acuan PB <select id="n6PbDistance"><option value="1.5">1.500 m</option><option value="3">3.000 m</option><option value="5" selected>5K</option><option value="10">10K</option><option value="21.0975">Half Marathon</option><option value="42.195">Marathon</option></select><small class="hc-muted">Pilih jarak PB sekarang agar pace otomatis akurat.</small>';form.insertBefore(distField,next);
const days=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];const defaults=['Istirahat / Recovery','Easy Run','Long Run','Tempo Run','Interval','Fartlek','Recovery Run','Strength Training','Cross Training','Hill Repeats','Race Pace','Time Trial','Kompetisi / Simulasi','Lainnya'];
const typeKey='n6hc:customTrainingTypes:v1';let types;try{const v=JSON.parse(localStorage.getItem(typeKey));types=Array.isArray(v)&&v.length?v.filter(x=>typeof x==='string'&&x.trim()).slice(0,70):[...defaults]}catch(e){types=[...defaults]}if(!types.includes('Istirahat / Recovery'))types.unshift('Istirahat / Recovery');
let current=0;const schedule=Array.from({length:5},()=>days.map(()=>({type:'',detail:'',hrMin:'',hrNormal:'',hrMax:'',pace:''})));
function parseRaceTime(raw){const parts=String(raw||'').trim().split(':').map(Number);if(!parts.length||parts.length>3||parts.some(x=>!Number.isFinite(x)||x<0))return NaN;if(parts.length===1)return NaN;if(parts.slice(1).some(x=>x>=60))return NaN;return parts.reduce((a,b)=>a*60+b,0)}
function paceText(seconds){if(!Number.isFinite(seconds)||seconds<=0)return '—';const n=Math.round(seconds);return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')+'/km'}
function timeText(seconds){const n=Math.round(seconds);if(!Number.isFinite(n)||n<0)return '—';const h=Math.floor(n/3600),m=Math.floor(n%3600/60),sec=n%60;return h?h+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'):m+':'+String(sec).padStart(2,'0')}
function paceDefaults(type){const t=String(type||'').toLowerCase(),pb=parseRaceTime($('hcpPbCurrent').value),distance=Number($('n6PbDistance').value);if(!Number.isFinite(pb)||!distance||!t||/istirahat|strength/.test(t))return '';const ratio=/interval|hill|race pace|time trial|kompetisi|simulasi/.test(t)?1:/tempo|fartlek/.test(t)?.90:/recovery|easy|cross/.test(t)?.72:/long/.test(t)?.78:.80;return paceText(pb/distance/ratio)}
function calcIntensity(){const dist=Number($('n6CalcDistance').value),sec=parseRaceTime($('n6CalcTime').value),age=Number($('n6CalcAge').value),out=$('n6CalcResult');if(!Number.isFinite(sec)||sec<=0){out.textContent='Isi target waktu, misalnya 25:00 atau 1:35:00.';return}const hr=age>=10&&age<=100?220-age:null;const percentages=[100,95,90,85,80,75,70,65,60,55,50,45,40];out.innerHTML='<table><thead><tr><th>Intensitas</th><th>Target waktu</th><th>Pace</th><th>HR estimasi</th></tr></thead><tbody>'+percentages.map(n=>'<tr><td><strong>'+n+'%</strong></td><td>'+timeText(sec/(n/100))+'</td><td>'+paceText(sec/dist/(n/100))+'</td><td>'+(hr?Math.round(hr*n/100)+' bpm':'Isi umur')+'</td></tr>').join('')+'</tbody></table>'}
$('n6CalcRun').onclick=calcIntensity;
const jpgButton=document.createElement('button');jpgButton.type='button';jpgButton.className='btn-outline';jpgButton.id='n6CalcJpg';jpgButton.textContent='↓ Cetak Hasil JPG';jpgButton.disabled=true;
$('n6CalcRun').parentNode.append(jpgButton);
const oldCalc=calcIntensity;
$('n6CalcRun').onclick=function(){oldCalc();jpgButton.disabled=!$('n6CalcResult').querySelector('table')};
jpgButton.onclick=async()=>{
 const table=$('n6CalcResult').querySelector('table');if(!table)return alert('Hitung intensitas terlebih dahulu.');
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 const rows=[...table.querySelectorAll('tr')].map(tr=>[...tr.querySelectorAll('th,td')].map(c=>c.textContent.trim()));
 const W=1200,margin=64,colW=(W-margin*2)/Math.max(1,rows[0].length),rowH=56,top=350;
 canvas.width=W;canvas.height=Math.max(720,top+rows.length*rowH+150);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,canvas.height);
 ctx.fillStyle='#102b24';ctx.fillRect(0,0,W,220);ctx.fillStyle='#1eb682';ctx.fillRect(0,214,W,6);
 const brandImage=document.querySelector('.side-brand .brand-logo img');if(brandImage&&brandImage.complete&&brandImage.naturalWidth){try{const ratio=brandImage.naturalWidth/brandImage.naturalHeight;const h=95;ctx.drawImage(brandImage,margin,34,h*ratio,h)}catch(e){}}
 ctx.fillStyle='#fff';ctx.font='bold 37px Inter,Arial,sans-serif';ctx.fillText('NUMBER SIX RUNNING',margin,163);
 ctx.font='20px Inter,Arial,sans-serif';ctx.fillStyle='#bce9d7';ctx.fillText('HEAD COACH  /  LAPORAN INTENSITAS LATIHAN',margin,195);
 ctx.fillStyle='#14243c';ctx.font='bold 29px Inter,Arial,sans-serif';ctx.fillText('HASIL PERHITUNGAN INTENSITAS',margin,277);
 ctx.font='18px Inter,Arial,sans-serif';ctx.fillStyle='#536579';
 const dist=$('n6CalcDistance'),distance=dist.options[dist.selectedIndex]?.text||'-';
 ctx.fillText('Jarak: '+distance+'   |   Target waktu: '+$('n6CalcTime').value+'   |   Umur: '+($('n6CalcAge').value||'-')+' tahun',margin,316);
 rows.forEach((r,i)=>{const y=top+i*rowH;ctx.fillStyle=i===0?'#e7f2ed':i%2?'#fff':'#f5f8f7';ctx.fillRect(margin,y,W-margin*2,rowH);ctx.font=(i===0?'bold ':'')+'18px Inter,Arial,sans-serif';ctx.fillStyle='#172e28';r.forEach((v,j)=>ctx.fillText(v,margin+15+j*colW,y+35,colW-22))});
 ctx.fillStyle='#667a72';ctx.font='16px Inter,Arial,sans-serif';ctx.fillText('HR merupakan estimasi (220 − umur); bukan rekomendasi medis.',margin,canvas.height-85);
 ctx.fillText('Dibuat oleh Head Coach • '+new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}),margin,canvas.height-51);
 const a=document.createElement('a');a.download='number-six-hasil-intensitas-'+new Date().toISOString().slice(0,10)+'.jpg';a.href=canvas.toDataURL('image/jpeg',.94);a.click();
};
$('n6CalcTime').value=$('hcpPbTarget').value||'';$('n6CalcAge').value=$('hcpAge').value||'';
document.querySelectorAll('[data-panel="hcintensity"]').forEach(b=>b.addEventListener('click',()=>{setTimeout(()=>{if($('panel-hcprogram').classList.contains('active')){$('n6CalcTime').value=$('hcpPbTarget').value||$('n6CalcTime').value;$('n6CalcAge').value=$('hcpAge').value||$('n6CalcAge').value;$('n6CalcDistance').value=$('n6PbDistance').value;calcIntensity()}},0)}));
function hrDefaults(type){const age=Number($('hcpAge').value);if(!age||age<10||age>100||!type||type==='Istirahat / Recovery')return null;const t=type.toLowerCase();let range=/interval|hill|race pace|time trial|kompetisi|simulasi/.test(t)?[.76,.84,.94]:/tempo|fartlek/.test(t)?[.70,.79,.88]:/recovery|easy|cross|strength/.test(t)?[.55,.65,.75]:[.60,.72,.83];const max=220-age;return range.map(v=>String(Math.round(max*v)))}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function saveTypes(){try{localStorage.setItem(typeKey,JSON.stringify(types))}catch(e){console.warn('Pilihan latihan tidak tersimpan',e)}}
function populated(d){return Boolean(d.detail.trim()||(d.type&&d.type!=='Istirahat / Recovery'))}
function filledWeeks(){return schedule.map((days,i)=>({days,i})).filter(w=>w.days.some(populated))}
function showPanel(which){document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===which));document.querySelectorAll('[data-panel]').forEach(b=>b.classList.toggle('active',b.dataset.panel==='hcprogram'));$('pageTitle').textContent=which==='panel-hcweekly'?'Susun Program Mingguan':'Buat Program';window.scrollTo({top:0,behavior:'smooth'})}
function reference(){const c=$('hcpClient');return [c.options[c.selectedIndex]?.text||'Klien',$('hcpAge').value+' tahun',$('hcpPbCurrent').value+' → '+$('hcpPbTarget').value,$('hcpPhase').value].join(' · ')}
function renderTypes(){$('n6TypeList').innerHTML=types.map((t,i)=>'<div class="n6-type-row"><span>'+esc(t)+'</span><div><button type="button" data-rename="'+i+'">Ubah</button><button type="button" data-delete="'+i+'" '+(t==='Istirahat / Recovery'?'disabled':'')+'>Hapus</button></div></div>').join('')}
function render(){ $('n6AthleteReference').textContent=reference();$('n6WeekTabs').innerHTML=schedule.map((w,i)=>'<button type="button" data-week="'+i+'" class="'+(i===current?'active':'')+'" aria-pressed="'+(i===current)+'">Minggu '+(i+1)+(w.some(populated)?' <span class="n6-filled-dot" aria-label="Sudah diisi"></span>':'')+'</button>').join('');$('n6WeekSummary').textContent='Minggu '+(current+1)+' dari 5 · '+schedule[current].filter(populated).length+' hari terisi · '+filledWeeks().length+' minggu akan diekspor';$('n6DayEditor').innerHTML=schedule[current].map((d,i)=>'<div class="n6-day"><strong>'+days[i]+'</strong><label>Program hari ini<select data-day="'+i+'" data-field="type"><option value="">— Belum diisi —</option>'+types.map(t=>'<option value="'+esc(t)+'" '+(t===d.type?'selected':'')+'>'+esc(t)+'</option>').join('')+'</select></label><div class="n6-hr-grid"><label>HR Minimal (bpm)<input type="number" min="35" max="240" data-day="'+i+'" data-field="hrMin" value="'+esc(d.hrMin||'')+'" placeholder="Min"></label><label>HR Maksimal (bpm)<input type="number" min="35" max="240" data-day="'+i+'" data-field="hrMax" value="'+esc(d.hrMax||'')+'" placeholder="Maks"></label></div><label>Target Pace (otomatis, dapat diubah)<input class="n6-pace-input" data-day="'+i+'" data-field="pace" value="'+esc(d.pace||'')+'" placeholder="Contoh: 5:30/km"></label><label class="n6-detail-field">Rincian latihan (opsional)<textarea data-day="'+i+'" data-field="detail" placeholder="Contoh:\nPemanasan: 2 km easy\nLatihan inti: 5 × 800 m @ pace 4:30/km\nRecovery: 2 menit jog\nPendinginan: 1 km"></textarea></label></div>').join('');$('n6DayEditor').querySelectorAll('textarea').forEach(el=>el.value=schedule[current][+el.dataset.day].detail);$('n6PrevWeek').disabled=current===0;$('n6NextWeek').disabled=current===4;renderTypes()}
$('n6AddType').onclick=()=>{const value=$('n6NewType').value.trim();if(!value)return alert('Masukkan nama jenis latihan.');if(types.some(t=>t.toLowerCase()===value.toLowerCase()))return alert('Jenis latihan sudah tersedia.');types.push(value);saveTypes();$('n6NewType').value='';render()};$('n6NewType').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('n6AddType').click()}};
$('n6TypeList').onclick=e=>{const rename=e.target.closest('[data-rename]'),del=e.target.closest('[data-delete]');if(rename){const i=+rename.dataset.rename,old=types[i],value=prompt('Ubah nama jenis latihan:',old);if(value===null)return;const v=value.trim();if(!v)return alert('Nama tidak boleh kosong.');if(types.some((t,j)=>j!==i&&t.toLowerCase()===v.toLowerCase()))return alert('Jenis latihan sudah tersedia.');types[i]=v;schedule.flat().forEach(d=>{if(d.type===old)d.type=v});saveTypes();render()}if(del){const i=+del.dataset.delete,old=types[i];if(old==='Istirahat / Recovery')return;if(!confirm('Hapus pilihan '+old+'? Jadwal yang sudah memakai pilihan ini tetap tersimpan.'))return;types.splice(i,1);saveTypes();render()}};
$('n6NextToWeeks').onclick=()=>{if(!form.reportValidity())return;showPanel('panel-hcweekly');render()};$('n6BackToReference').onclick=()=>showPanel('panel-hcprogram');$('n6WeekTabs').onclick=e=>{const b=e.target.closest('[data-week]');if(b){current=+b.dataset.week;render()}};
$('n6DayEditor').addEventListener('change',e=>{const el=e.target;if(el.dataset.field!=='type')return;const d=schedule[current][+el.dataset.day];d.type=el.value;const suggested=hrDefaults(d.type);if(suggested){d.hrMin=suggested[0];d.hrMax=suggested[2]}else{d.hrMin=d.hrMax=''}d.pace=paceDefaults(d.type);render()});
$('n6DayEditor').addEventListener('input',e=>{const el=e.target;if(!el.dataset.field)return;schedule[current][+el.dataset.day][el.dataset.field]=el.value;$('n6WeekSummary').textContent='Minggu '+(current+1)+' dari 5 · '+schedule[current].filter(populated).length+' hari terisi · '+filledWeeks().length+' minggu akan diekspor';$('n6WeekTabs').querySelectorAll('[data-week]').forEach((b,i)=>{const has=schedule[i].some(populated),dot=b.querySelector('.n6-filled-dot');if(has&&!dot)b.insertAdjacentHTML('beforeend',' <span class="n6-filled-dot" aria-label="Sudah diisi"></span>');if(!has&&dot)dot.remove()})});$('n6PrevWeek').onclick=()=>{if(current>0){current--;render()}};$('n6NextWeek').onclick=()=>{if(current<4){current++;render()}};
function serialize(){return filledWeeks().map(({days:week,i})=>'MINGGU '+(i+1)+'\n'+week.map((d,j)=>days[j]+': '+(d.type||'—')+([d.hrMin,d.hrMax].some(Boolean)?' | HR '+[d.hrMin||'—',d.hrMax||'—'].join('–')+' bpm':'')+(d.detail?' — '+d.detail:'')).join('\n')).join('\n\n')}
function prepare(){if(!form.reportValidity()){showPanel('panel-hcprogram');return false}if(!filledWeeks().length){alert('Isi setidaknya satu hari pada satu minggu sebelum mengekspor.');return false}$('hcpDailyPlan').value=serialize();$('hcpWeeks').value=String(filledWeeks().length);return true}
function wrap(ctx,value,width){const lines=[];String(value||'—').split(/\n/).forEach(par=>{let line='';for(const word of par.split(/\s+/)){const test=line?line+' '+word:word;if(ctx.measureText(test).width>width&&line){lines.push(line);line=word}else line=test}lines.push(line)});return lines}
const N6_PRINT_LOGO=new Image();N6_PRINT_LOGO.src='assets/img/logo-print-hc.png';
function drawWeek(w){
 const cv=document.createElement('canvas');cv.width=1240;cv.height=1754;const x=cv.getContext('2d');
 const ink='#192620',muted='#63736a',green='#cf242e',line='#dce5df',soft='#f4f8f5';
 const left=66,right=1174,W=right-left;
 x.fillStyle='#fff';x.fillRect(0,0,1240,1754);
 const txt=(s,xx,yy,font='20px Inter,Arial',color=ink)=>{x.font=font;x.fillStyle=color;x.fillText(String(s),xx,yy)};
 const rule=(y)=>{x.strokeStyle=line;x.lineWidth=1;x.beginPath();x.moveTo(left,y);x.lineTo(right,y);x.stroke()};
 // Compact, balanced header.
 if(N6_PRINT_LOGO.complete&&N6_PRINT_LOGO.naturalWidth)x.drawImage(N6_PRINT_LOGO,left,54,94,94);
 else{ x.fillStyle='#121a17';x.fillRect(left,54,94,94);txt('N6',left+13,117,'italic 900 47px Arial','#fff') }
 txt('NUMBER SIX RUNNING',181,94,'800 32px Inter,Arial');txt('PROGRAM LATIHAN  /  MINGGU '+(w.i+1),183,133,'600 19px Inter,Arial',muted);
 x.fillStyle=green;x.fillRect(left,166,W,3);
 const c=$('hcpClient'),athlete=c.options[c.selectedIndex]?.text||'Klien',phase=$('hcpPhase').value||'—';
 const fields=[['NAMA KLIEN',athlete],['UMUR',($('hcpAge').value||'—')+' tahun'],['PB SEKARANG',$('hcpPbCurrent').value||'—'],['PB TARGET',$('hcpPbTarget').value||'—']];
 x.fillStyle=soft;x.fillRect(left,189,W,185);x.strokeStyle=line;x.strokeRect(left+.5,189.5,W-1,184);
 const widths=[525,520],starts=[90,653];
 fields.forEach((f,i)=>{const col=i%2,row=Math.floor(i/2),xx=starts[col],yy=220+row*71;
 txt(f[0],xx,yy,'700 14px Inter,Arial',muted);x.font='700 22px Inter,Arial';let value=String(f[1]);while(x.measureText(value).width>widths[col]&&value.length>3)value=value.slice(0,-2)+'…';txt(value,xx,yy+30,'700 22px Inter,Arial')});
 txt('Program: '+phase,left,410,'700 23px Inter,Arial');x.textAlign='right';txt('Mulai: '+($('hcpStart').value||'—'),right,410,'18px Inter,Arial',muted);x.textAlign='left';
 // Seven consistent day cards. Detail is word-wrapped and never overlaps HR.
 const top=438,rowH=155,dayW=167,hrW=218,detailW=W-dayW-hrW;
 x.fillStyle='#1b3028';x.fillRect(left,top,W,50);
 txt('HARI',left+18,top+32,'700 18px Inter,Arial','#fff');txt('JENIS & RINCIAN LATIHAN',left+dayW+19,top+32,'700 18px Inter,Arial','#fff');txt('TARGET HR',right-hrW+16,top+32,'700 18px Inter,Arial','#fff');
 let y=top+50;
 w.days.forEach((d,j)=>{x.fillStyle=j%2?soft:'#fff';x.fillRect(left,y,W,rowH);x.strokeStyle=line;x.strokeRect(left+.5,y+.5,W-1,rowH);
 x.beginPath();x.moveTo(left+dayW,y);x.lineTo(left+dayW,y+rowH);x.moveTo(right-hrW,y);x.lineTo(right-hrW,y+rowH);x.stroke();
 txt(days[j].toUpperCase(),left+16,y+34,'800 20px Inter,Arial');
 x.font='700 19px Inter,Arial';const type=wrap(x,d.type||'—',detailW-45).slice(0,2);
 type.forEach((t,k)=>txt(t,left+dayW+19,y+30+k*24,'700 19px Inter,Arial'));
 if(d.pace)txt('PACE  '+d.pace,left+dayW+19,y+43+type.length*24,'700 16px Inter,Arial',green);const dy=y+38+type.length*24+(d.pace?22:0);
 x.font='17px Inter,Arial';const lines=String(d.detail||'').trim()?wrap(x,d.detail,detailW-46):[];
 const available=Math.max(0,Math.floor((rowH-(dy-y)-13)/21));
 lines.slice(0,available).forEach((t,k)=>txt(t,left+dayW+19,dy+k*21,'17px Inter,Arial',muted));
 if(lines.length>available)txt('… (rincian selengkapnya di PDF)',left+dayW+19,y+rowH-12,'italic 14px Inter,Arial',green);
 const hx=right-hrW+17;
 if(d.hrMin||d.hrMax){txt('MIN  '+(d.hrMin||'—')+' bpm',hx,y+42,'700 18px Inter,Arial');txt('MAX  '+(d.hrMax||'—')+' bpm',hx,y+76,'700 18px Inter,Arial')}
 else txt('—',hx,y+43,'19px Inter,Arial',muted);
 y+=rowH});
 const notes=$('hcpNotes').value.trim();if(notes){txt('CATATAN COACH',left,1651,'700 16px Inter,Arial',green);x.font='15px Inter,Arial';wrap(x,notes,W).slice(0,2).forEach((t,i)=>txt(t,left,1676+i*19,'15px Inter,Arial',ink))}
 rule(1710);txt('NUMBER SIX RUNNING',left,1737,'700 14px Inter,Arial',muted);x.textAlign='right';txt('MINGGU '+(w.i+1),right,1737,'700 14px Inter,Arial',muted);x.textAlign='left';
 return cv
}
function filename(ext){const c=$('hcpClient');const athlete=(c.options[c.selectedIndex]?.text||'klien').replace(/[^a-z0-9-]/gi,'-');return 'N6-program-'+athlete+'-'+filledWeeks().map(w=>'M'+(w.i+1)).join('-')+'.'+ext}
function jpg(){const pages=filledWeeks().map(drawWeek),cv=document.createElement('canvas');cv.width=1240;cv.height=1754*pages.length;const ctx=cv.getContext('2d');pages.forEach((p,i)=>ctx.drawImage(p,0,i*1754));cv.toBlob(blob=>{if(!blob)return alert('JPG gagal dibuat.');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename('jpg');a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)},'image/jpeg',0.93)}
function pdf(){
 const weeks=filledWeeks();if(!window.jspdf?.jsPDF){const pages=weeks.map(drawWeek),win=window.open('','_blank');if(!win)return alert('Izinkan pop-up untuk mencetak PDF.');win.document.write('<!doctype html><html><head><title>Program NUMBER SIX</title><style>@page{size:A4;margin:0}body{margin:0}img{width:210mm;height:297mm;display:block;page-break-after:always}</style></head><body>'+pages.map(p=>'<img src="'+p.toDataURL('image/jpeg',0.92)+'">').join('')+'<script>window.onload=()=>window.print()<\/script></body></html>');win.document.close();return}
 const doc=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
 const ink=[25,38,32],muted=[96,112,103],green=[207,36,46],margin=13,content=184;
 const c=$('hcpClient'),name=c.options[c.selectedIndex]?.text||'Klien';
 function label(s,x,y){doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...muted);doc.text(s,x,y)}
 function value(s,x,y,max){doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(...ink);doc.text(doc.splitTextToSize(String(s||'—'),max).slice(0,2),x,y)}
 function pageHeader(week,continuation){
 doc.setFillColor(255,255,255);doc.rect(0,0,210,297,'F');
 // Real logo at modest size, with simple brand heading.
 doc.setFillColor(0,0,0);doc.rect(margin,11,18,18,'F');try{if(N6_PRINT_LOGO.complete&&N6_PRINT_LOGO.naturalWidth)doc.addImage(N6_PRINT_LOGO,'PNG',margin+1,12,16,16)}catch(e){}
 doc.setFont('helvetica','bold');doc.setFontSize(17);doc.setTextColor(...ink);doc.text('NUMBER SIX RUNNING',33,19);
 doc.setFontSize(10);doc.setTextColor(...green);doc.text('MINGGU '+(week+1)+(continuation?'  /  LANJUTAN':''),33,25);
 doc.setDrawColor(...green);doc.setLineWidth(.5);doc.line(margin,32,197,32);
 doc.setFillColor(246,249,247);doc.roundedRect(margin,37,content,43,2,2,'F');
 label('NAMA KLIEN',17,44);value(name,17,50,84);
 label('UMUR',112,44);value(($('hcpAge').value||'—')+' tahun',112,50,38);
 label('PB SEKARANG',17,60);value($('hcpPbCurrent').value,17,67,84);
 label('PB TARGET',112,60);value($('hcpPbTarget').value,112,67,75);
 doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...ink);doc.text('Program: '+($('hcpPhase').value||'—'),margin,88);
 doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...muted);doc.text('Mulai: '+($('hcpStart').value||'—'),197,88,{align:'right'});
 doc.setFillColor(27,48,40);doc.rect(margin,94,content,11,'F');doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(255,255,255);doc.text('HARI',16,101);doc.text('JENIS & RINCIAN LATIHAN',45,101);doc.text('TARGET HR',163,101);
 doc.setDrawColor(222,230,224);doc.setLineWidth(.25);
 }
 weeks.forEach((w,wi)=>{
 if(wi)doc.addPage();pageHeader(w.i,false);let y=105;
 w.days.forEach((d,j)=>{
 const type=String(d.type||'—');const detail=String(d.detail||'').trim();
 doc.setFont('helvetica','bold');doc.setFontSize(9.5);const typeLines=doc.splitTextToSize(type,109);
 doc.setFont('helvetica','normal');doc.setFontSize(9);const detailLines=detail?detail.split(/\n/).flatMap(p=>doc.splitTextToSize(p||' ',109)):[];
 // No clipped text: split very long detail across continued A4 pages.
 let segments=[];const perSegment=22;for(let i=0;i<detailLines.length;i+=perSegment)segments.push(detailLines.slice(i,i+perSegment));if(!segments.length)segments=[[]];
 segments.forEach((part,seg)=>{
 const heading=seg===0?typeLines:[type+' (lanjutan)'];
 const h=Math.max(18,7+heading.length*4.5+part.length*4.1+(seg===0&&d.pace?5:0));
 if(y+h>279){doc.addPage();pageHeader(w.i,true);y=105}
 if(j%2){doc.setFillColor(246,249,247);doc.rect(margin,y,content,h,'F')}
 doc.setDrawColor(222,230,224);doc.rect(margin,y,content,h);
 doc.line(42,y,42,y+h);doc.line(159,y,159,y+h);
 doc.setTextColor(...ink);doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.text(days[j].toUpperCase(),16,y+7);
 doc.text(heading,45,y+7);
 doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...muted);
 if(seg===0&&d.pace){doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(...green);doc.text('PACE '+d.pace,45,y+7+heading.length*4.5)}doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...muted);if(part.length)doc.text(part,45,y+7+heading.length*4.5+(seg===0&&d.pace?5:0));
 if(seg===0){doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...ink);doc.text('MIN '+(d.hrMin||'—')+' bpm',162,y+7);doc.text('MAX '+(d.hrMax||'—')+' bpm',162,y+13)}
 y+=h;
 });
 });
 const notes=$('hcpNotes').value.trim();if(notes){doc.setFont('helvetica','normal');doc.setFontSize(9);const lines=doc.splitTextToSize(notes,content);const h=12+lines.length*4;if(y+h>279){doc.addPage();pageHeader(w.i,true);y=105}doc.setFont('helvetica','bold');doc.setTextColor(...green);doc.text('CATATAN COACH',margin,y+7);doc.setFont('helvetica','normal');doc.setTextColor(...ink);doc.text(lines,margin,y+13)}
 });
 const total=doc.internal.getNumberOfPages();for(let i=1;i<=total;i++){doc.setPage(i);doc.setDrawColor(222,230,224);doc.line(margin,287,197,287);doc.setFontSize(8);doc.setTextColor(...muted);doc.text('NUMBER SIX RUNNING',margin,291);doc.text(i+' / '+total,197,291,{align:'right'})}
 doc.save(filename('pdf'));
}
function saveAndExport(format){if(!prepare())return;window.n6WeeklyExportActive=true;try{form.requestSubmit()}finally{window.n6WeeklyExportActive=false}if(format==='jpg')jpg();else pdf();render()}
$('n6SaveJpg').onclick=()=>saveAndExport('jpg');$('n6SavePdf').onclick=()=>saveAndExport('pdf');
document.querySelectorAll('[data-panel="hcprogram"]').forEach(b=>b.addEventListener('click',()=>{if($('panel-hcweekly').classList.contains('active'))showPanel('panel-hcprogram')}));
})();