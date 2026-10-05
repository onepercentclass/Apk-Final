function openSettingsModal(){
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  document.getElementById('modalBody').innerHTML = `
    <div class="modal-head"><div class="modal-title">Pengaturan</div><button class="modal-close" onclick="closeModal()">&times;</button></div>
    <div class="form-row">
      <label>Tema Tampilan</label>
      <div style="display:flex; gap:10px; margin-top:6px;">
        <button type="button" class="theme-choice btn ${current==='dark'?'btn-primary':''}" data-theme="dark" onclick="applyTheme('dark')" style="flex:1; justify-content:center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>
          Dark
        </button>
        <button type="button" class="theme-choice btn ${current==='light'?'btn-primary':''}" data-theme="light" onclick="applyTheme('light')" style="flex:1; justify-content:center;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
          Light
        </button>
      </div>
    </div>
    <div class="modal-foot">
      <button type="button" class="btn btn-primary" onclick="closeModal()">Selesai</button>
    </div>`;
  showModal();
}
