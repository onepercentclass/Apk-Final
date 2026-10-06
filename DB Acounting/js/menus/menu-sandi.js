/* ---- GANTI PASSWORD (semua peran yang sudah login) ---- */
PAGES.sandi=function(){
  if(!ApiClient.enabled()){
    return `<div class="page-title">Ganti Password</div><div class="page-sub">Kelola kata sandi akun Anda.</div>
    <div class="card card-pad" style="max-width:520px;"><p class="muted">Membutuhkan koneksi ke server (mode API).</p></div>`;
  }
  return `<div class="page-title">Ganti Password</div><div class="page-sub">Kelola kata sandi akun Anda.</div>
  <div class="card card-pad" style="max-width:520px;">
    <form autocomplete="off" onsubmit="return submitSandiChange(event)">
      <div class="field"><label>Password saat ini</label><input type="password" id="sandiLama" autocomplete="current-password" required></div>
      <div class="field"><label>Password baru</label><input type="password" id="sandiBaru" autocomplete="new-password" required minlength="8"></div>
      <div class="field"><label>Ulangi password baru</label><input type="password" id="sandiBaru2" autocomplete="new-password" required minlength="8"></div>
      <p id="sandiMsg" class="form-msg"></p>
      <button class="btn btn-primary" type="submit">Simpan Password Baru</button>
    </form>
  </div>`;
};
async function submitSandiChange(e){
  e.preventDefault();
  const msg=document.getElementById('sandiMsg');
  msg.textContent='';
  const lama=document.getElementById('sandiLama').value;
  const baru=document.getElementById('sandiBaru').value;
  if(baru!==document.getElementById('sandiBaru2').value){msg.textContent='Ulangi password baru tidak sama.';return false;}
  try{
    await ApiClient.changePassword(lama,baru);
    msg.textContent='Password berhasil diganti.';
    e.target.reset();
    toast('Password berhasil diganti.');
  }catch(err){msg.textContent='Gagal: '+(err.detail||err.message);}
  return false;
}
