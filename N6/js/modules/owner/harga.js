/**
 * N6 modules - owner / harga
 * menu label : Harga & Program
 * minimum tier: 1
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/owner/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/owner.js. Concatenating every fragment in manifest
 * order reproduces owner.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__
  function renderPriceList(){
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
    else { const idx = programCatalog.findIndex(x => x.id === id); programCatalog[idx] = data; }
    await persistCatalog();
    closeProgramForm();
    showToast(isNew ? 'Program baru ditambahkan' : 'Harga program diperbarui');
    populateFormSelects(); renderAll();
  }
  window.deleteProgramConfirm = function(){
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
