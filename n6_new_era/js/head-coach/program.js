// N6 New Era — head coach: buat program (wizard 3 langkah).
import { get, post, ApiError } from '../core/api.js';
import { toast } from '../ui/toast.js';
import { caught } from '../core/logger.js';
import { esc } from '../core/utils.js';

const STEPS = ['Identitas & Target', 'Pace & HR', 'Kirim'];

export async function render(container) {
  let step = 0;
  const draft = { client_id: '', target: '', pace: '', hr: '', notes: '' };
  let clients = [];
  try {
    const data = await get('/clients', { limit: 200 });
    clients = (data && data.items) || [];
  } catch (e) { caught(e, 'program clients'); }

  function paint() {
    container.innerHTML = '<h1 class="page-title">Buat Program</h1>' +
      '<div class="wizard-steps">' + STEPS.map((s, i) =>
        '<div class="wizard-step' + (i === step ? ' is-active' : '') + '">' + esc(s) + '</div>'
      ).join('') + '</div><div id="wbody"></div>';
    const body = container.querySelector('#wbody');
    if (step === 0) {
      body.innerHTML =
        '<label class="field"><span>Klien</span><select id="wClient">' +
        clients.map((c) => '<option value="' + c.id + '"' + (String(draft.client_id) === String(c.id) ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('') +
        '</select></label>' +
        '<label class="field"><span>Target</span><input type="text" id="wTarget" value="' + esc(draft.target) + '" placeholder="cth: FM sub-4 jam"></label>' +
        '<button class="btn btn-primary" id="wNext">Lanjut</button>';
      body.querySelector('#wNext').addEventListener('click', () => {
        draft.client_id = body.querySelector('#wClient').value;
        draft.target = body.querySelector('#wTarget').value.trim();
        if (!draft.client_id || !draft.target) { toast('Pilih klien dan isi target.', 'error'); return; }
        step = 1; paint();
      });
    } else if (step === 1) {
      body.innerHTML =
        '<label class="field"><span>Persentase Pace</span><input type="text" id="wPace" value="' + esc(draft.pace) + '" placeholder="cth: 80%"></label>' +
        '<label class="field"><span>Zona HR</span><input type="text" id="wHr" value="' + esc(draft.hr) + '" placeholder="cth: Z2"></label>' +
        '<label class="field"><span>Catatan</span><input type="text" id="wNotes" value="' + esc(draft.notes) + '"></label>' +
        '<div class="page-actions"><button class="btn" id="wBack">Kembali</button>' +
        '<button class="btn btn-primary" id="wNext">Lanjut</button></div>';
      body.querySelector('#wBack').addEventListener('click', () => { step = 0; paint(); });
      body.querySelector('#wNext').addEventListener('click', () => {
        draft.pace = body.querySelector('#wPace').value.trim();
        draft.hr = body.querySelector('#wHr').value.trim();
        draft.notes = body.querySelector('#wNotes').value.trim();
        step = 2; paint();
      });
    } else {
      const cname = (clients.find((c) => String(c.id) === String(draft.client_id)) || {}).name || '-';
      body.innerHTML =
        '<div class="stat-card"><p class="stat-card-label">Klien</p><p class="stat-card-value">' + esc(cname) + '</p></div>' +
        '<p>Target: ' + esc(draft.target) + '</p>' +
        '<p>Pace: ' + esc(draft.pace || '-') + ' · HR: ' + esc(draft.hr || '-') + '</p>' +
        (draft.notes ? '<p>Catatan: ' + esc(draft.notes) + '</p>' : '') +
        '<div class="page-actions"><button class="btn" id="wBack">Kembali</button>' +
        '<button class="btn btn-primary" id="wSend">Kirim Program</button></div>';
      body.querySelector('#wBack').addEventListener('click', () => { step = 1; paint(); });
      body.querySelector('#wSend').addEventListener('click', async (ev) => {
        const btn = ev.target;
        btn.disabled = true;
        try {
          await post('/programs', {
            client_id: Number(draft.client_id), target: draft.target,
            pace: draft.pace, hr_zone: draft.hr, notes: draft.notes,
          });
          toast('Program terkirim.', 'success');
          step = 0;
          draft.client_id = ''; draft.target = ''; draft.pace = ''; draft.hr = ''; draft.notes = '';
          paint();
        } catch (e) {
          caught(e, 'kirim program');
          toast('Gagal: ' + (e instanceof ApiError && e.body && e.body.detail ? e.body.detail : 'terjadi gangguan, coba lagi.'), 'error');
        } finally {
          btn.disabled = false;
        }
      });
    }
  }

  paint();
}
