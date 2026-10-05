/* ============================= CSV EXPORT ============================= */
function csvCell(v){
  v=v==null?'':String(v);
  if(/[",\n;]/.test(v)) v='"'+v.replace(/"/g,'""')+'"';
  return v;
}
function toCSV(headers,rows){
  const lines=[headers.map(csvCell).join(';')];
  rows.forEach(r=>lines.push(r.map(csvCell).join(';')));
  return '\uFEFF'+lines.join('\r\n');
}
async function downloadCSV(filenameBase,headers,rows){
  const c=co();
  const csv=toCSV(headers,rows);
  const filename=filenameBase+'_'+String(c.name).replace(/[^a-zA-Z0-9]+/g,'-')+'_'+todayStr()+'.csv';
  if(!S.downloads){
    try{
      const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
      toast('Laporan diunduh');
    }catch(e){ toast('Unduhan tidak tersedia di tampilan ini'); }
    return;
  }
  try{
    const res=await S.downloads.save({filename,data:csv});
    toast(res.status==='saved' ? 'Laporan berhasil diunduh' : 'Laporan dikirim');
  }catch(e){
    if(e && e.code==='declined') return;
    toast('Gagal mengunduh laporan');
  }
}

