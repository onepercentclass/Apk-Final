/**
 * N6 modules - coach / _core
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__

  /* ================= API CLIENT ================= */
/*__N6_UNIT__*/  function n6ApiCfg(){ return window.N6_API || {}; }
/*__N6_UNIT__*/  function n6ApiBase(){ return String(n6ApiCfg().base || 'https://api.denisbergkam.com/api/n6').replace(/\/+$/, ''); }
/*__N6_UNIT__*/  function n6ApiToken(){
    try { return window.localStorage.getItem(n6ApiCfg().tokenKey || 'n6:api:token'); }
    catch(e){ return null; }
  }
/*__N6_UNIT__*/  function n6ApiUser(){
    try { return JSON.parse(window.localStorage.getItem(n6ApiCfg().userKey || 'n6:api:user') || 'null'); }
    catch(e){ return null; }
  }
/*__N6_UNIT__*/  function n6ApiReady(){ return n6ApiCfg().enabled === true && !!n6ApiToken(); }
/*__N6_UNIT__*/  async function n6Api(path){
    const res = await fetch(n6ApiBase() + '/' + String(path).replace(/^\/+/, ''), {
      headers: { 'Authorization': 'Bearer ' + n6ApiToken() }
    });
    if (!res.ok) throw new Error('API ' + res.status + ' ' + path);
    return res.json();
  }
/*__N6_UNIT__*/  function fmtTanggalID(iso){
    if (!iso) return '-';
    try {
      const d = new Date(String(iso).length <= 10 ? iso + 'T00:00:00' : iso);
      const MON = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
      return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
    } catch(e){ return String(iso); }
  }

  /* ================= DATA (dari API, bukan dummy) ================= */
  // Jadwal hari ini — dari GET /schedules/coach (template mingguan, difilter ke hari ini)
/*__N6_UNIT__*/  let schedule = [];
/*__N6_UNIT__*/  let scheduleSlots = []; // template mingguan penuh (untuk jadwal terdekat & kalender)
  // Urutan hari API: 1=Senin..7=Minggu ; JS getDay(): 0=Minggu..6=Sabtu
/*__N6_UNIT__*/  function apiWeekday(jsDay){ return ((jsDay + 6) % 7) + 1; }
/*__N6_UNIT__*/  async function loadSchedule(){
    const data = await n6Api('schedules/coach');
    const slots = (data && data.slots) || [];
    scheduleSlots = slots.filter(s => s.active !== false);
    const todayWd = apiWeekday(new Date().getDay());
    schedule = scheduleSlots
      .filter(s => s.weekday === todayWd)
      .sort((a,b) => String(a.start_time || '').localeCompare(String(b.start_time || '')))
      .map(s => ({
        time: s.start_time || '--:--',
        client: s.note || s.training_category || '—',
        loc: s.location || '—',
        status: 'Terjadwal',
        attendance: null
      }));
  }

  // Klien binaan — dari GET /clients (backend otomatis memfilter milik coach yang login)
/*__N6_UNIT__*/  let clients = [];
/*__N6_UNIT__*/  let clientsRaw = [];
/*__N6_UNIT__*/  async function loadClients(){
    const page = await n6Api('clients?limit=200');
    const items = (page && page.items) || [];
    clientsRaw = items;
    clients = items.map(c => ({
      id: c.id,
      name: c.name,
      goal: c.notes || '—',
      last: '—',
      type: '—',
      produk: '—',
      status: c.status === 'aktif' ? 'Aktif' : (c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : '—'),
      mulai: c.joined_on ? fmtTanggalID(c.joined_on) : '—',
      selesai: '—'
    }));
  }

  // Progres klien — dari GET /dashboards/coach/me → { progress: [{client_id, name, pct, last_session, note}] }
  // Endpoint agregat dibuat di backend Fase 3; bila belum ada (404) → kosong + empty state, tanpa fallback dummy.
/*__N6_UNIT__*/  let clientProgress = [];
/*__N6_UNIT__*/  let coachDashboard = null;
/*__N6_UNIT__*/  async function loadCoachDashboard(){
    const data = await n6Api('dashboards/coach/me');
    coachDashboard = data || {};
    const goalById = {};
    clients.forEach(c => { if (c.id != null) goalById[c.id] = c.goal; });
    const items = coachDashboard.progress || [];
    clientProgress = items.map(p => ({
      id: p.client_id != null ? p.client_id : null,
      name: p.name || '—',
      goal: goalById[p.client_id] || '—',
      progress: p.pct != null ? Math.max(0, Math.min(100, Math.round(Number(p.pct)))) : 0,
      note: p.note || '—'
    }));
    chartData = buildChartDataFromDashboard(coachDashboard);
  }

  // Statistik home — dari data API (bukan angka hardcoded di HTML).
  // Gagal/kosong → "—", tanpa fallback dummy.
