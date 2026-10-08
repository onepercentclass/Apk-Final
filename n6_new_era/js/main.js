/* N6 New Era — titik masuk aplikasi.
   Alur boot sesuai design_vnpc.md bagian 3.
   Implementasi penuh menyusul di Phase 3. */
const bootEl = document.getElementById('n6-boot');
const appEl = document.getElementById('app');

// Phase 3: init logger, cek sesi via core/auth.js, serahkan ke core/router.js.
bootEl.textContent = 'N6 New Era — fondasi siap. Phase 3 menyusul.';
appEl.hidden = false;
