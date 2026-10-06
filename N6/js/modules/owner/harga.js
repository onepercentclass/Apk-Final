/**
 * N6 modules - owner / harga
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function programSinglePrice(p){
    if (p.price != null) return Number(p.price) || 0;
    if (p.mode === 'configurable') return (Number(p.ratePerSesi)||0) * (Number(p.defaultMeetings)||2) * (Number(p.defaultWeeks)||4);
    return 0;
  }
/*__N6_UNIT__*/  function renderPriceList(){
    document.getElementById('priceListBody').innerHTML = ['Online','Offline','Kerja Sama'].map(cat => {
      const items = programCatalog.filter(p => p.category === cat);
      if (!items.length) return '';
      const rows = items.map(p => {
        const price = programSinglePrice(p), commission = Number(p.komisiPerSesi)||0;
        return `<div class="price-list-item">
          <div><div class="nm">${escapeHtml(p.label)}</div><div class="ct">${escapeHtml(p.unit || '')}</div><div class="ct">Komisi coach: ${formatRupiah(commission)} / sesi</div></div>
          <div style="display:flex;align-items:center;gap:10px"><div class="pv">${price ? formatRupiah(price) : 'Harga belum diatur'}</div><button class="btn-sm" onclick="openProgramForm('${p.id}')">Edit</button></div>
        </div>`;
      }).join('');
      return `<h3 style="font-size:12px;color:var(--asphalt);text-transform:uppercase;letter-spacing:.03em;margin:14px 0 4px">${cat}</h3>${rows}`;
    }).join('') || '<div class="list-empty">Belum ada program. Tambahkan lewat tombol di atas.</div>';
  }
/*__N6_UNIT__*/  function togglePfFields(){
    document.getElementById('pfFixedWrap').style.display = 'block';
    document.getElementById('pfUnitWrap').style.display = 'block';
  }
/*__N6_UNIT__*/  window.openProgramForm = function(id){
    const p = id ? catalogById(id) : null;
    document.getElementById('programFormTitle').textContent = p ? 'Edit Program' : 'Tambah Program';
    document.getElementById('pfProgramId').value = p ? p.id : '';
    document.getElementById('pfLabel').value = p ? p.label : '';
    document.getElementById('pfCategory').value = p ? p.category : 'Online';
    document.getElementById('pfPrice').value = p ? (programSinglePrice(p) || '') : '';
    document.getElementById('pfUnit').value = p ? (p.unit || '') : '';
    document.getElementById('pfKomisi').value = p && p.komisiPerSesi != null ? p.komisiPerSesi : 0;
    document.getElementById('programFormError').style.display = 'none';
    document.getElementById('btnDeleteProgram').style.display = p ? 'block' : 'none';
    togglePfFields();
    document.getElementById('programFormModal').classList.add('show');
  };
/*__N6_UNIT__*/  window.closeProgramForm = function(){ document.getElementById('programFormModal').classList.remove('show'); };
/*__N6_UNIT__*/  async function saveProgramForm(){
    const label = document.getElementById('pfLabel').value.trim();
    const price = Number(document.getElementById('pfPrice').value);
    const komisi = Number(document.getElementById('pfKomisi').value || 0);
    const error = document.getElementById('programFormError');
    if (!label || !document.getElementById('pfPrice').value || !Number.isFinite(price) || price < 0 || !Number.isFinite(komisi) || komisi < 0 || komisi > price){
      error.style.display = 'block'; return;
    }
    error.style.display = 'none';
    let id = document.getElementById('pfProgramId').value;
    const isNew = !id;
    if (isNew){ let base = slugify(label) || 'program'; id = base; let n = 2; while (catalogById(id)){ id = base + '-' + n; n++; } }
    const data = { id, label, category: document.getElementById('pfCategory').value,
      mode:'fixed', unit:document.getElementById('pfUnit').value.trim(),
      price:Math.round(price), komisiPerSesi:Math.round(komisi) };
    if (isNew) programCatalog.push(data);
    else { const idx = programCatalog.findIndex(x => String(x.id) === String(id)); programCatalog[idx] = data; }
    await persistCatalog();
    closeProgramForm();
    showToast(isNew ? 'Program baru ditambahkan' : 'Harga program diperbarui');
    populateFormSelects(); renderAll();
  }
/*__N6_UNIT__*/  window.deleteProgramConfirm = function(){
    const id = document.getElementById('pfProgramId').value;
    const p = catalogById(id);
    if (!p) return;
    if (!confirm('Hapus program "' + p.label + '"? Klien yang sudah pakai program ini tidak akan berubah datanya, tapi program tidak bisa dipilih lagi untuk klien baru.')) return;
    programCatalog = programCatalog.filter(x => x.id !== id);
    persistCatalog().then(() => {
      closeProgramForm();
      showToast('Program dihapus');
      populateFormSelects();
      renderAll();
    });
  };

  /* ================= RENDER: KOMISI COACH ================= */
  // Rekap pembayaran per bulan; nominal dikunci setelah konfirmasi.
/*__N6_UNIT__*/  let teamPayments = {};
/*__N6_UNIT__*/  let teamMonth = todayISO().slice(0,7);
