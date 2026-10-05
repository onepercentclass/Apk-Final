/* Utilitas jendela cetak. Stylesheet cetak ada di css/print/. */
const LOGO_URL = new URL(APP_CONFIG.logoPath, document.baseURI).href;
const PRINT_ON_LOAD = ' onload="window.print()"';
function printStylesheet(name){
  const href = new URL('css/print/' + name + '.css', document.baseURI).href;
  return `<link rel="stylesheet" href="${href}">`;
}
function periodLabelFor(start, end){
  if(!start && !end) return 'Seluruh periode · Dicetak: '+fmtDate(todayISO());
  if(start && end) return 'Periode: '+fmtDate(start)+' — '+fmtDate(end)+' · Dicetak: '+fmtDate(todayISO());
  if(start) return 'Sejak: '+fmtDate(start)+' · Dicetak: '+fmtDate(todayISO());
  return 'Sampai: '+fmtDate(end)+' · Dicetak: '+fmtDate(todayISO());
}
function openPrintReport(title, periodLabel, bodyHTML){
  const w = window.open('', '_blank', 'width=900,height=1000');
  if(!w){ toast('Izinkan pop-up untuk mencetak'); return; }
  w.document.write(`<html><head><title>${title}</title>${printStylesheet('report')}</head><body${PRINT_ON_LOAD}>
    <div class="rp-head">
      <div class="rp-logo"><img src="${LOGO_URL}" alt="Claisrox"></div>
      <div class="rp-title"><h1>${title}</h1><div class="muted">${periodLabel}</div></div>
    </div>
    ${bodyHTML}
    <div class="rp-foot">Claisrox — Dokumen ini dicetak otomatis dari sistem manajemen bisnis.</div>
    </body></html>`);
  w.document.close();
}
