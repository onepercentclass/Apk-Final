/**
 * N6 modules - admin / jadwal-klien
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  function renderJadwal(){
    const rows = [...clients].sort((a,b) => ((programCache[a.id]||{}).startDate||'').localeCompare((programCache[b.id]||{}).startDate||''));
    document.getElementById('jadwalBody').innerHTML = rows.length ? rows.map(c => {
      const p = programCache[c.id] || {};
      const st = clientStatus(c);
      return `<tr>
        <td class="strong">${escapeHtml(c.name)}</td>
        <td class="muted">${escapeHtml(c.programLabel || '-')}</td>
        <td class="muted">${escapeHtml(c.coach || '-')}</td>
        <td>${formatDateID(p.startDate)}</td>
        <td>${formatDateID(p.endDate)}</td>
        <td class="muted" style="font-size:12px;">${escapeHtml(c.priceLabel || '-')}</td>
        <td><span class="badge ${statusTone(st)}">${st}</span></td>
      </tr>`;
    }).join('') : `<tr><td colspan="7" class="muted" style="text-align:center; padding:20px 0;">Belum ada klien terjadwal.</td></tr>`;
  }

  /* ================= RENDER: DAFTAR HARGA ================= */
