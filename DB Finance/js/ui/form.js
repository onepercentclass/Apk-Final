/** Formulir generik di dalam modal. */

import { registerActions } from '../core/actions.js';
import { commit } from '../core/nav.js';
import { $, esc, money } from '../core/utils.js';
import { closeModal, openModal, shH } from './modal.js';

let FORM = null;

function fieldHTML(f) {
  const id = 'ff-' + f.k;
  let inner;
  if (f.t === 'money') {
    inner = `<div class="inp"><span>Rp</span><input id="${id}" data-money inputmode="numeric" value="${money(f.v)}" placeholder="0" autocomplete="off"></div>`;
  }
  else if (f.t === 'select') {
    inner = `<select id="${id}">${f.o.map(o => `<option value="${o[0]}" ${o[0] === f.v ? 'selected' : ''}>${o[1]}</option>`).join('')}</select>`;
  }
  else {
    inner = `<input id="${id}" type="${f.t === 'date' ? 'date' : f.t === 'num' ? 'number' : 'text'}" ${f.t === 'num' ? 'step="0.1" inputmode="decimal"' : ''} value="${esc(f.v ?? '')}" placeholder="${esc(f.p || '')}">`;
  }
  return `<label for="${id}">${f.l}</label>${inner}`;
}

/** Membuka formulir generik dari daftar field. */
export function openForm(title, fields, label, onOk) {
  FORM = { fields, onOk };
  openModal(`${shH(title)}${fields.map(fieldHTML).join('')}<div class="acts"><button class="btn pri" data-act="form-ok">${label}</button></div>`);
  if (matchMedia('(hover:hover)').matches) {
    setTimeout(() => {
      const f = $('#modal input');
      f && f.focus();
    }, 60);
  }
}

function formVals() {
  const o = {};
  FORM.fields.forEach(f => {
    const el = $('#ff-' + f.k);
    let v = el.value;
    if (f.t === 'money') {
      v = Number(v.replace(/\D/g, '')) || 0;
    }
    else if (f.t === 'num') {
      v = parseFloat(v) || 0;
    }
    else {
      v = v.trim();
    }
    o[f.k] = v;
  });
  return o;
}

registerActions({
  'form-ok': () => {
    const v = formVals();
    const r = FORM.onOk(v);
    if (r === false) {
      return;
    }
    closeModal();
    commit();
  },
});
