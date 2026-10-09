/* ============================= SIMPLE SVG CHARTS ============================= */
function barLineChart(months,rev,exp,profit,w=760,h=250){
  const max=Math.max(1,...rev,...exp,...profit.map(Math.abs));
  const pad={l:0,r:0,t:14,b:24};const cw=w-pad.l-pad.r,ch=h-pad.t-pad.b;
  const n=months.length;const bw=cw/n*0.28;const gap=cw/n;
  const y0=pad.t+ch;
  let bars='';let linePts=[];
  months.forEach((m,i)=>{
    const x=pad.l+gap*i+gap*0.5;
    const rh=(rev[i]/max)*ch, eh=(exp[i]/max)*ch;
    bars+=`<rect x="${x-bw-2}" y="${y0-rh}" width="${bw}" height="${rh}" rx="2" fill="var(--pos)" opacity="0.85"/>`;
    bars+=`<rect x="${x+2}" y="${y0-eh}" width="${bw}" height="${eh}" rx="2" fill="var(--neg)" opacity="0.75"/>`;
    const py=y0-((profit[i]+max)/(max*2))*ch;
    linePts.push([x,y0-(profit[i]/max)*ch*(profit[i]>=0?1:1)]);
    bars+=`<text x="${x}" y="${h-6}" text-anchor="middle" font-size="10" fill="var(--text-3)" font-family="var(--font-b)">${m}</text>`;
  });
  const line=linePts.map((p,i)=>(i===0?'M':'L')+p[0].toFixed(1)+','+Math.max(pad.t,p[1]).toFixed(1)).join(' ');
  const dots=linePts.map(p=>`<circle cx="${p[0]}" cy="${Math.max(pad.t,p[1]).toFixed(1)}" r="2.6" fill="var(--accent-2)"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="xMidYMid meet">
    <line x1="0" y1="${y0}" x2="${w}" y2="${y0}" stroke="var(--border)" stroke-width="1"/>
    ${bars}<path d="${line}" fill="none" stroke="var(--accent-2)" stroke-width="2"/>${dots}
  </svg>`;
}
function donutChart(data,size=168,stroke=26){
  const total=data.reduce((s,d)=>s+d.value,0)||1;
  const r=(size-stroke)/2;const c=size/2;const circ=2*Math.PI*r;
  let off=0;let segs='';
  data.forEach(d=>{
    const frac=d.value/total;const len=frac*circ;
    segs+=`<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${d.color}" stroke-width="${stroke}" stroke-dasharray="${len} ${circ-len}" stroke-dashoffset="${-off}" transform="rotate(-90 ${c} ${c})"/>`;
    off+=len;
  });
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${segs}</svg>`;
}
function miniBarChart(vals,colors,w=300,h=110){
  const max=Math.max(1,...vals.map(v=>Math.abs(v)));
  const bw=w/vals.length*0.5;const gap=w/vals.length;const y0=h-16;
  let bars='';
  vals.forEach((v,i)=>{
    const x=gap*i+gap*0.5-bw/2;const bh=(Math.abs(v)/max)*(h-24);
    bars+=`<rect x="${x}" y="${y0-bh}" width="${bw}" height="${bh}" rx="2" fill="${colors[i%colors.length]}"/>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">${bars}<line x1="0" y1="${y0}" x2="${w}" y2="${y0}" stroke="var(--border)"/></svg>`;
}

