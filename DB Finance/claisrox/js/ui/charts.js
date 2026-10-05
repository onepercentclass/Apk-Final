/** Grafik SVG (batang, garis, donat) beserta penyiapan data grafiknya. */

import { inMonth, sum } from '../core/calc.js';
import { MONTHS, MSHORT, TODAY, TODAY_S, compact, esc, fmt, pad } from '../core/utils.js';

/** Mengosongkan registry grafik sebelum halaman dirender ulang. */
export function resetCharts() {
  CH = {};
}

function ticks(mx) {
  const raw = mx / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
  const st = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  return { st, top: Math.max(st, Math.ceil(mx / st) * st) };
}

/** Grafik batang pemasukan vs pengeluaran. */
export function barChart(items, W, H) {
  W = Math.max(W, 260);
  const pl = 44, pr = 6, pt = 10, pb = 24, iw = W - pl - pr, ih = H - pt - pb;
  const mx = Math.max(1, ...items.flatMap(i => [i.a, i.b])), { st, top } = ticks(mx);
  let g = '';
  for (let v = 0; v <= top; v += st) {
    const y = pt + ih - (v / top) * ih;
    g += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" class="gl"/><text x="${pl - 8}" y="${y + 3.5}" text-anchor="end" class="ax">${v ? compact(v) : '0'}</text>`;
  }
  const n = items.length, gw = iw / n, bw = Math.max(3, Math.min(13, gw * .32));
  items.forEach((it, i) => {
    const cx = pl + gw * i + gw / 2, ha = it.a / top * ih, hb = it.b / top * ih;
    g += `<rect x="${cx - bw - 1}" y="${pt + ih - ha}" width="${bw}" height="${ha}" rx="3" class="b-in"/><rect x="${cx + 1}" y="${pt + ih - hb}" width="${bw}" height="${hb}" rx="3" class="b-out"/>`;
    g += `<text x="${cx}" y="${H - 7}" text-anchor="middle" class="ax">${gw < 27 ? it.label[0] : it.label}</text>`;
    g += `<rect x="${pl + gw * i}" y="${pt}" width="${gw}" height="${ih}" fill="transparent" data-tip="${esc(it.tip)}"/>`;
  });
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`;
}

/** Grafik garis kumulatif harian. */
export function lineChart(d, W, H) {
  W = Math.max(W, 260);
  const pl = 44, pr = 10, pt = 10, pb = 24, iw = W - pl - pr, ih = H - pt - pb, { dim, last, ci, co } = d;
  const mx = Math.max(1, ci[last], co[last]), { st, top } = ticks(mx);
  const x = i => pl + (i - 1) / (dim - 1) * iw, y = v => pt + ih - v / top * ih;
  let g = '';
  g += `<defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--gr);stop-opacity:.28"/><stop offset="1" style="stop-color:var(--gr);stop-opacity:0"/></linearGradient><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--rd);stop-opacity:.25"/><stop offset="1" style="stop-color:var(--rd);stop-opacity:0"/></linearGradient></defs>`;
  for (let v = 0; v <= top; v += st) {
    const yy = y(v);
    g += `<line x1="${pl}" x2="${W - pr}" y1="${yy}" y2="${yy}" class="gl"/><text x="${pl - 8}" y="${yy + 3.5}" text-anchor="end" class="ax">${v ? compact(v) : '0'}</text>`;
  }
  const path = arr => {
    let p = '';
    for (let i = 1; i <= last; i++) {
      p += (i === 1 ? 'M' : 'L') + x(i).toFixed(1) + ' ' + y(arr[i]).toFixed(1);
    }
    return p;
  };
  const area = arr => path(arr) + `L${x(last).toFixed(1)} ${y(0)}L${x(1)} ${y(0)}Z`;
  g += `<path d="${area(ci)}" fill="url(#ga)"/><path d="${area(co)}" fill="url(#gb)"/>`;
  g += `<path d="${path(ci)}" fill="none" style="stroke:var(--gr)" stroke-width="2.2" stroke-linejoin="round"/><path d="${path(co)}" fill="none" style="stroke:var(--rd)" stroke-width="2.2" stroke-linejoin="round"/>`;
  [1, 5, 10, 15, 20, 25, 30].filter(v => v <= dim).forEach(v => g += `<text x="${x(v)}" y="${H - 7}" text-anchor="middle" class="ax">${v}</text>`);
  const cw = iw / dim;
  for (let i = 1; i <= dim; i++) {
    g += `<rect x="${x(i) - cw / 2}" y="${pt}" width="${cw}" height="${ih}" fill="transparent" data-tip="${esc(i + ' ' + MSHORT[+d.mk.slice(5, 7) - 1] + '|Pemasukan: ' + fmt(ci[Math.min(i, last)]) + '|Pengeluaran: ' + fmt(co[Math.min(i, last)]))}"/>`;
  }
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g}</svg>`;
}

/** Grafik donat dengan teks di tengah. */
export function donut(items, size = 150, th = 18, center = '') {
  const r = (size - th) / 2, C = 2 * Math.PI * r, tot = items.reduce((a, i) => a + i.v, 0);
  let off = 0, seg = '';
  const h = size / 2;
  if (!tot) {
    seg = `<circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="var(--bd)" stroke-width="${th}"/>`;
  }
  items.forEach(i => {
    if (i.v <= 0) {
      return;
    }
    const len = i.v / tot * C, gap = items.length > 1 ? 2 : 0;
    seg += `<circle cx="${h}" cy="${h}" r="${r}" fill="none" ${i.c.startsWith('var') ? `style="stroke:${i.c}"` : `stroke="${i.c}"`} stroke-width="${th}" stroke-dasharray="${Math.max(len - gap, 0)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 ${h} ${h})"${i.tip ? ` data-tip="${esc(i.tip)}"` : ''}/>`;
    off += len;
  });
  return `<div class="donut" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${seg}</svg><div class="dc">${center}</div></div>`;
}

let CH = {};

export const chart = (fn, h = 220) => {
  const k = 'c' + Object.keys(CH).length;
  CH[k] = fn;
  return `<div class="chart" data-c="${k}" style="height:${h}px"></div>`;
};

export function drawCharts() {
  document.querySelectorAll('[data-c]').forEach(el => {
    const fn = CH[el.dataset.c];
    if (fn && el.clientWidth) {
      el.innerHTML = fn(el.clientWidth, el.clientHeight);
    }
  });
}

/** Data 12 bulan untuk grafik batang. */
export const yearData = y => MSHORT.map((l, i) => {
  const mk = y + '-' + pad(i + 1), a = inMonth(mk), I = sum(a, 'in'), O = sum(a, 'out');
  return { label: l, a: I, b: O, tip: MONTHS[i] + ' ' + y + '|Pemasukan: ' + fmt(I) + '|Pengeluaran: ' + fmt(O) };
});

/** Data kumulatif harian untuk grafik garis. */
export function dailyData(mk) {
  const [y, m] = mk.split('-').map(Number), dim = new Date(y, m, 0).getDate(), last = mk === TODAY_S.slice(0, 7) ? TODAY.getDate() : dim;
  const ai = Array(dim + 1).fill(0), ao = Array(dim + 1).fill(0);
  inMonth(mk).forEach(t => {
    const d = +t.date.slice(8, 10);
    if (t.type === 'in') {
      ai[d] += t.amount;
    }
    else if (t.type === 'out') {
      ao[d] += t.amount;
    }
  });
  for (let i = 1; i <= dim; i++) {
    ai[i] += ai[i - 1];
    ao[i] += ao[i - 1];
  }
  return { mk, dim, last, ci: ai, co: ao };
}
