/**
 * N6 modules - owner / keuangan
 *
 * Dibuat saat Fase C: pecah dari _synced.js menjadi modul granular.
 */
//__N6_BODY__
  let finFilterMode = 'all'; // 'all' = bulan ini | 'month' = custom bulan
/*__N6_UNIT__*/  let finSelectedMonth = todayISO().slice(0,7); // 'YYYY-MM'
/*__N6_UNIT__*/  const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

/*__N6_UNIT__*/  function financeRangeStart(){ return (finFilterMode === 'month' ? finSelectedMonth : todayISO().slice(0,7)) + '-01'; }
/*__N6_UNIT__*/  function financeRangeEnd(){ const selected=finFilterMode==='month'?finSelectedMonth:todayISO().slice(0,7); const [y,m]=selected.split('-').map(Number); return selected+'-'+String(new Date(y,m,0).getDate()).padStart(2,'0'); }
/*__N6_UNIT__*/  function inFinanceRange(dateStr){ return !!dateStr && dateStr >= financeRangeStart() && dateStr <= financeRangeEnd(); }
/*__N6_UNIT__*/  function financeFilteredClients(){ return clients.filter(c => inFinanceRange(c.joinDate)); }
/*__N6_UNIT__*/  function financeFilteredExpenses(){ return expenses.filter(e => inFinanceRange(e.date)); }
/*__N6_UNIT__*/  function financeRevenue(){ return financeFilteredClients().reduce((s,c) => s + (Number(c.price)||0), 0); }
  // Gunakan sumber perhitungan yang sama dengan halaman Komisi Coach:
  // sesi terjadwal pada bulan bersangkutan × nominal komisi per sesi.
  // Pembayaran yang telah dikonfirmasi memakai snapshot nominal terkunci.
/*__N6_UNIT__*/  function financeCommissionRows(){
    const currentMonth = todayISO().slice(0,7);
    const savedMonths = Object.values(teamPayments).map(p => p.month).filter(Boolean);
    const joinedMonths = clients.map(c => (c.joinDate || c.createdAt || '').slice(0,7))
      .filter(m => /^\d{4}-\d{2}$/.test(m));
    const firstMonth = [...savedMonths, ...joinedMonths, currentMonth].sort()[0];
    const start = finFilterMode === 'month' ? finSelectedMonth : currentMonth;
    const end = start;
    const months = [];
    let [y, m] = start.split('-').map(Number);
    const [endY, endM] = end.split('-').map(Number);
    while (y < endY || (y === endY && m <= endM)) {
      months.push(y + '-' + String(m).padStart(2, '0'));
      if (++m > 12) { m = 1; y++; }
    }
    const roster = teamRoster();
    return months.flatMap(month => {
      const coaches = [...roster];
      Object.values(teamPayments).filter(p => p.month === month).forEach(p => {
        if (!coaches.some(c => String(c.id) === String(p.coachId))) {
          coaches.push({id:p.coachId, name:p.coachName || 'Coach arsip'});
        }
      });
      return coaches.map(coach => {
        const record = teamPayments[teamKey(month, coach)];
        const amount = record?.paidAt && record.snapshot
          ? Number(record.snapshot.amount) || 0
          : teamSnapshot(month, coach).amount;
        return {month, coach:coach.name, amount};
      }).filter(row => row.amount > 0);
    });
  }
/*__N6_UNIT__*/  function financeCommission(){
    return financeCommissionRows().reduce((sum, row) => sum + row.amount, 0);
  }
/*__N6_UNIT__*/  function financeExpenseTotal(){ return financeFilteredExpenses().reduce((s,e) => s + (Number(e.amount)||0), 0); }
/*__N6_UNIT__*/  function financeProfit(){ return financeRevenue() - financeCommission() - financeExpenseTotal(); }
/*__N6_UNIT__*/  function financePeriodLabel(){
    const selected = finFilterMode === 'month' ? finSelectedMonth : todayISO().slice(0,7);
    const [y,m] = selected.split('-').map(Number);
    return 'Menampilkan laporan bulan ' + BULAN_ID[m-1] + ' ' + y + '.';
  }

/*__N6_UNIT__*/  function renderKeuangan(){
    document.getElementById('finPeriodLabel').textContent = financePeriodLabel();
    document.getElementById('revenueCategoryPeriod').textContent = financePeriodLabel();
    document.getElementById('finRevenue').textContent = formatRupiah(financeRevenue());
    document.getElementById('finCommission').textContent = formatRupiah(financeCommission());
    document.getElementById('finExpense').textContent = formatRupiah(financeExpenseTotal());
    document.getElementById('finProfit').textContent = formatRupiah(financeProfit());

    const periodClients = financeFilteredClients();
    const cats = ['Online','Offline','Kerja Sama'];
    document.getElementById('revenueByCategoryBody').innerHTML = cats.map(cat => {
      const catProgramIds = new Set(programCatalog.filter(p => p.category === cat).map(p => p.id));
      const revenue = periodClients.filter(c => catProgramIds.has(c.programId)).reduce((s,c) => s + (Number(c.price)||0), 0);
      const count = periodClients.filter(c => catProgramIds.has(c.programId)).length;
      return `<div class="price-list-item">
        <div><div class="nm">${cat}</div><div class="ct">${count} klien</div></div>
        <div class="pv">${formatRupiah(revenue)}</div>
      </div>`;
    }).join('');

    const rows = [...financeFilteredExpenses()].sort((a,b) => (b.date||'').localeCompare(a.date||''));
    document.getElementById('expenseBody').innerHTML = rows.length ? rows.map(e => `
      <tr>
        <td>${formatDateID(e.date)}</td>
        <td class="muted">${escapeHtml(e.category)}</td>
        <td>${escapeHtml(e.desc)}</td>
        <td class="right strong">${formatRupiah(e.amount)}</td>
        <td class="right"><button class="btn-danger-sm" onclick="deleteExpense('${e.id}')">Hapus</button></td>
      </tr>`).join('') : `<tr><td colspan="5" class="muted" style="text-align:center; padding:16px 0;">Belum ada pengeluaran pada periode ini.</td></tr>`;
  }
/*__N6_UNIT__*/  window.openExpenseForm = function(){
    document.getElementById('exDate').value = todayISO();
    document.getElementById('exCategory').value = 'Operasional';
    document.getElementById('exDesc').value = '';
    document.getElementById('exAmount').value = '';
    document.getElementById('expenseFormModal').classList.add('show');
  };
/*__N6_UNIT__*/  window.closeExpenseForm = function(){ document.getElementById('expenseFormModal').classList.remove('show'); };
/*__N6_UNIT__*/  async function saveExpenseForm(){
    const desc = document.getElementById('exDesc').value.trim();
    const amount = parseInt(document.getElementById('exAmount').value, 10) || 0;
    if (!desc || !amount){ showToast('Lengkapi deskripsi dan nominal pengeluaran'); return; }
    expenses.push({ id:'ex-' + Date.now(), date: document.getElementById('exDate').value || todayISO(), category: document.getElementById('exCategory').value, desc, amount });
    await persistExpenses();
    closeExpenseForm();
    showToast('Pengeluaran dicatat');
    renderAll();
  }
/*__N6_UNIT__*/  window.deleteExpense = function(id){
    expenses = expenses.filter(e => e.id !== id);
    persistExpenses().then(() => { showToast('Pengeluaran dihapus'); renderAll(); });
  };

  /* ================= RENDER: PERFORMA TIM ================= */
