/* Login gate: ditampilkan bila api.enabled dan belum ada token valid.
   Memakai class CSS yang sudah ada (.overlay/.modal/.form-row/.input/.btn). */
let loginGateShown = false;

function showLoginGate(){
  if(loginGateShown) return;
  loginGateShown = true;
  const body = document.getElementById('modalBody');
  body.className = 'modal';
  body.innerHTML =
    '<div class="modal-head"><div class="modal-title">Masuk Claisrox</div></div>' +
    '<form id="loginForm">' +
      '<div class="form-row"><label>Username</label>' +
        '<input class="input" id="loginUser" autocomplete="username"></div>' +
      '<div class="form-row"><label>Password</label>' +
        '<input class="input" id="loginPass" type="password" autocomplete="current-password"></div>' +
      '<div class="form-row" id="loginError" style="display:none;color:var(--red);font-size:12.5px;"></div>' +
      '<div class="modal-foot"><button class="btn btn-primary" type="submit" id="loginBtn">Masuk</button></div>' +
    '</form>';
  document.getElementById('overlay').classList.add('show');
  document.getElementById('loginUser').focus();
  document.getElementById('loginForm').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const err = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');
    err.style.display = 'none';
    btn.disabled = true;
    btn.textContent = 'Memeriksa...';
    try{
      await api.login(
        document.getElementById('loginUser').value.trim(),
        document.getElementById('loginPass').value
      );
      loginGateShown = false;
      closeModal();
      bootstrap();
    }catch(ex){
      err.textContent = 'Username atau password salah.';
      err.style.display = 'block';
    }finally{
      btn.disabled = false;
      btn.textContent = 'Masuk';
    }
  });
}

// Jangan biarkan login gate ditutup lewat klik di luar modal (belum ada sesi).
document.getElementById('overlay').addEventListener('click', (e)=>{
  if(loginGateShown && e.target.id === 'overlay') e.stopPropagation();
}, true);

api.onUnauthorized = ()=>{ showLoginGate(); };

function renderAll(){
  renderStatCards();
  renderTrendChart();
  renderCategoryChart();
  renderTopProducts();
  renderFinanceSummary();
  renderActivity();
  renderStockInfo();
  renderProfitChart();
  fillCategoryFilter();
  renderProdukTable();
  renderMaterialTable();
  renderSupplierTable();
  renderCustomerTable();
  renderSalesTable();
  renderPurchasesTable();
  renderRecipeTable();
  renderProductionTable();
  renderOnlineOrdersTable();
  renderLaporan();
}

async function bootstrap(){
  try{
    if(APP_CONFIG.api.enabled && !api.token()){
      showLoginGate();
      return;
    }
    await Access.init();
    if(APP_CONFIG.api.enabled) await pullRemoteData();
  }catch(e){
    console.error(e);
    // Token kedaluwarsa/invalid: api.request sudah membersihkan token dan
    // menampilkan login gate lewat onUnauthorized — tidak perlu toast lagi.
    if(APP_CONFIG.api.enabled && !api.token()) return;
    toast('Gagal memuat sesi dari server');
    return;
  }
  renderNav();
  goTo(Access.firstAllowed());
}
bootstrap();
