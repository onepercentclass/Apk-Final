/**
 * N6 modules - owner / jadwalcoach
 * menu label : Jadwal Coach
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
  function teamScheduleBreakdown(month,coach,entries){
    const sched=coachSchedule[coach.id]||{};
    const off=new Set(coachDayOff[coach.id]||[]);
    const [year,mon]=month.split('-').map(Number);
    const last=new Date(year,mon,0).getDate();
    const names=['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const counts=Object.fromEntries(entries.map(c=>[String(c.id),0]));
    let total=0;
    const norm=s=>String(s||'').trim().toLocaleLowerCase('id-ID');
    for(let day=1;day<=last;day++){
      const date=month+'-'+String(day).padStart(2,'0');
      if(off.has(date))continue;
      const weekday=names[new Date(year,mon-1,day).getDay()];
      Object.entries(sched).forEach(([key,slot])=>{
        if(!key.startsWith(weekday+'|')||!slot?.client)return;
        if(!Array.isArray(slot.completedDates)||!slot.completedDates.includes(date))return;
        // Slots lama menyimpan satu nama/ID; slot multi-klien lama menyimpan
        // nama dipisahkan koma. Format baru dapat menyimpan clientIds.
        const rawIds=Array.isArray(slot.clientIds)?slot.clientIds:[];
        const tokens=[...rawIds.map(String), ...String(slot.client||'').split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean)];
        const matched=new Set();
        entries.forEach(c=>{
          const start=(programCache[c.id]||{}).startDate||c.joinDate||c.createdAt||'0000-00-00';
          const end=(programCache[c.id]||{}).endDate||'9999-12-31';
          const activeOnDate=date>=String(start).slice(0,10)&&date<=String(end).slice(0,10);
          const referenced=tokens.some(token=>norm(token)===norm(c.name)||String(token)===String(c.id));
          if(activeOnDate&&referenced&&!matched.has(String(c.id))){
            counts[String(c.id)]=(counts[String(c.id)]||0)+1; matched.add(String(c.id)); total++;
          }
        });
      });
    }
    return {total,counts};
  }
/*__N6_UNIT__*/  function renderShareCoachOptions(){
    const sel=document.getElementById('shareScheduleCoach');if(!sel)return;
    const current=sel.value;
    sel.innerHTML='<option value="">Pilih coach...</option>'+coachRoster.map(c=>'<option value="'+escapeHtml(c.id)+'">'+escapeHtml(c.name)+'</option>').join('');
    if(coachRoster.some(c=>c.id===current))sel.value=current;
    else if(coachRoster.length)sel.value=coachRoster[0].id;
  }
  /* ================= JADWAL COACH — UNDUH SEBAGAI GAMBAR (JPG) UNTUK CALON KLIEN ================= */
  window.downloadCoachScheduleImage = async function(coachId, startStr){
    const coach = coachById(coachId);
    if (!coach){ showToast('Pilih coach terlebih dahulu'); return; }

    const startDate = startStr ? new Date(startStr + 'T00:00:00') : new Date(new Date().setHours(0,0,0,0));
    if (isNaN(startDate.getTime())){ showToast('Tanggal mulai tidak valid'); return; }

    const schedCheck = coachSchedule[coachId] || {};
    const offCheck = coachDayOff[coachId] || [];
    const noDataYet = !Object.keys(schedCheck).length && !offCheck.length;

    const logoImg = new Image();
    await new Promise((resolve) => { logoImg.onload = resolve; logoImg.onerror = resolve; logoImg.src = LOGO_DATA; });

    const MONTH_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const DOW_SHORT = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    const totalDays = 30;
    const jsStartDay = startDate.getDay();
    const startWd = jsStartDay === 0 ? 6 : jsStartDay - 1; // 0 = Senin
    const rows = Math.ceil((startWd + totalDays) / 7);

    // ===== KANVAS RASIO A4 POTRAIT (210:297mm ≈ 1:1.4142), resolusi cetak layak (150dpi) =====
    const W = 1240, H = 1754, marginX = 60;
    const headerH = 130, stripH = 6;
    const nameY = 195, subtitleY = nameY + 27, rangeY = subtitleY + 21;
    const dividerY = rangeY + 32;
    const dowY = dividerY + 42;
    const gridTop = dowY + 20;

    // Sisa tinggi di bawah grid (jarak + legenda 2 baris + footer 2 baris) dihitung tetap,
    // lalu tinggi tiap sel kalender dibagi rata supaya grid selalu pas mengisi satu halaman A4 penuh.
    const bottomFixed = 40 + 30 + 38 + 30 + 24 + 40; // gap+legend2baris+gap+footer2baris+padding bawah
    const cellH = (H - gridTop - bottomFixed) / rows;
    const gridBottom = gridTop + rows * cellH;
    const legendTop = gridBottom + 40;
    const footerDividerY = legendTop + 30 + 38;
    const footerLine1Y = footerDividerY + 30;
    const footerLine2Y = footerLine1Y + 24;

    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H);

    // ===== HEADER (konsisten dgn Laporan Keuangan Coach & Invoice) =====
    ctx.fillStyle = '#111110'; ctx.fillRect(0, 0, W, headerH);
    const logoW = 132, logoH = logoW * (168 / 325);
    const logoX = marginX, logoY = (headerH - logoH) / 2;
    if(logoImg.complete && logoImg.naturalWidth)ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
    const textX = logoX + logoW + 20;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF'; ctx.font = '800 34px Arial';
    ctx.fillText('NUMBER SIX RUNNING', textX, 62);
    ctx.fillStyle = '#C9C7BE'; ctx.font = '400 17px Arial';
    ctx.fillText('Jadwal Latihan Coach', textX, 88);
    ctx.fillStyle = '#D62828'; ctx.fillRect(0, headerH, W, stripH);

    // ===== IDENTITAS COACH & RENTANG TANGGAL =====
    const endDate = new Date(startDate); endDate.setDate(endDate.getDate() + totalDays - 1);
    ctx.fillStyle = '#111110'; ctx.font = '800 28px Arial';
    ctx.fillText(coach.name, marginX, nameY);
    ctx.fillStyle = '#6E6C64'; ctx.font = '400 16px Arial';
    ctx.fillText('Jadwal Latihan — 30 Hari ke Depan', marginX, subtitleY);
    ctx.fillText(formatDateID(dateStrOf(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())) + ' – ' + formatDateID(dateStrOf(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())), marginX, rangeY);

    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(marginX, dividerY); ctx.lineTo(W - marginX, dividerY); ctx.stroke();

    // ===== HEADER HARI (SEN—MIN) =====
    const colW = (W - marginX * 2) / 7;
    ctx.fillStyle = '#6E6C64'; ctx.font = '700 14px Arial'; ctx.textAlign = 'center';
    DOW_SHORT.forEach((d, i) => ctx.fillText(d.toUpperCase(), marginX + i * colW + colW / 2, dowY));
    ctx.textAlign = 'left';

    // ===== GRID 30 HARI (tinggi sel otomatis mengisi penuh sisa halaman A4) =====
    const sched = coachSchedule[coachId] || {};
    const todayStr = todayISO();

    // ukuran pil zona waktu dihitung dinamis dari cellH supaya selalu proporsional & terbaca jelas
    const pillAreaTop = 52, pillBottomPad = 16, pillGapV = 10, pillGapH = 10, pillSidePad = 14;
    const pillAreaH = cellH - pillAreaTop - pillBottomPad;
    const pillH = Math.max(28, (pillAreaH - pillGapV) / 2);
    const pillW = (colW - pillSidePad * 2 - pillGapH) / 2;

    for (let i = 0; i < rows * 7; i++){
      const col = i % 7, row = Math.floor(i / 7);
      const cx = marginX + col * colW, cy = gridTop + row * cellH;
      ctx.strokeStyle = '#E7E4DB'; ctx.lineWidth = 1;
      ctx.strokeRect(cx, cy, colW, cellH);

      const dayOffset = i - startWd;
      if (dayOffset < 0 || dayOffset >= totalDays) continue;

      const d = new Date(startDate); d.setDate(d.getDate() + dayOffset);
      const dateStr = dateStrOf(d.getFullYear(), d.getMonth(), d.getDate());
      const weekday = DAYS[col];
      const isToday = dateStr === todayStr;
      const off = isCoachOff(coachId, dateStr);

      if (isToday){
        ctx.fillStyle = '#F5F3EE'; ctx.fillRect(cx + 1, cy + 1, colW - 2, cellH - 2);
        ctx.lineWidth = 2.5; ctx.strokeStyle = '#111110'; ctx.strokeRect(cx + 1.5, cy + 1.5, colW - 3, cellH - 3);
      }

      ctx.fillStyle = '#111110'; ctx.font = (isToday ? '800' : '700') + ' 18px Arial';
      const dateLabel = String(d.getDate()) + (d.getDate() === 1 || dayOffset === 0 ? ' ' + MONTH_SHORT[d.getMonth()] : '');
      ctx.fillText(dateLabel, cx + pillSidePad, cy + 30);

      if (off){
        // Libur: blok warna hijau solid
        ctx.fillStyle = '#1E8E3E'; ctx.fillRect(cx + 2, cy + 2, colW - 4, cellH - 4);
        ctx.fillStyle = '#FFFFFF'; ctx.font = '800 16px Arial'; ctx.textAlign = 'center';
        ctx.fillText('LIBUR', cx + colW / 2, cy + cellH / 2 + 6);
        ctx.textAlign = 'left';
        continue;
      }

      const px0 = cx + pillSidePad, py0 = cy + pillAreaTop;
      BLOCKS.forEach((b, bi) => {
        const bc = bi % 2, br = Math.floor(bi / 2);
        const px = px0 + bc * (pillW + pillGapH), py = py0 + br * (pillH + pillGapV);
        const slot = sched[weekday + '|' + b.key];
        const filled = !!slot;
        const timeLabel = (filled && slot.timeStart && slot.timeEnd) ? (slot.timeStart + '–' + slot.timeEnd) : b.time;

        // Blok warna solid: putih = tersedia, merah = terisi/penuh
        ctx.fillStyle = filled ? '#D62828' : '#FFFFFF';
        roundRectPath(ctx, px, py, pillW, pillH, 5);
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = filled ? '#D62828' : '#C9C7BE';
        roundRectPath(ctx, px, py, pillW, pillH, 5);
        ctx.stroke();

        const textColor = filled ? '#FFFFFF' : '#111110';
        ctx.fillStyle = textColor; ctx.textAlign = 'center';
        ctx.font = '800 12px Arial';
        ctx.fillText(b.label.toUpperCase(), px + pillW / 2, py + pillH * 0.38);
        ctx.font = '700 10.5px Arial';
        ctx.fillText(filled ? 'TERISI' : 'TERSEDIA', px + pillW / 2, py + pillH * 0.62);
        ctx.font = '400 10px Arial';
        ctx.fillText(timeLabel, px + pillW / 2, py + pillH * 0.84);
        ctx.textAlign = 'left';
      });
    }

    // ===== LEGENDA =====
    function legendSwatch(x, yy, mode, label){
      const s = 26, sy = yy - 19;
      const bg = mode === 'off' ? '#1E8E3E' : mode === 'filled' ? '#D62828' : '#FFFFFF';
      const border = mode === 'off' ? '#1E8E3E' : mode === 'filled' ? '#D62828' : '#C9C7BE';
      ctx.fillStyle = bg; roundRectPath(ctx, x, sy, s, s, 4); ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = border; roundRectPath(ctx, x, sy, s, s, 4); ctx.stroke();
      ctx.fillStyle = '#3B3A36'; ctx.font = '400 14.5px Arial'; ctx.textAlign = 'left';
      ctx.fillText(label, x + s + 12, yy);
    }
    legendSwatch(marginX, legendTop, 'empty', 'Putih — Tersedia, bisa dipesan');
    legendSwatch(marginX + 340, legendTop, 'filled', 'Merah — Terisi / penuh');
    legendSwatch(marginX + 600, legendTop, 'off', 'Hijau — Coach libur sepanjang hari');
    ctx.fillStyle = '#8C8A82'; ctx.font = '400 13.5px Arial';
    ctx.fillText('Jam pada tiap sesi mengikuti jadwal yang sudah ditentukan Admin CS.', marginX, legendTop + 30);

    // ===== FOOTER =====
    const printLabel = nowPrintLabel();
    ctx.strokeStyle = '#E7E4DB'; ctx.beginPath(); ctx.moveTo(marginX, footerDividerY); ctx.lineTo(W - marginX, footerDividerY); ctx.stroke();
    ctx.fillStyle = '#3B3A36'; ctx.font = '600 15px Arial';
    ctx.fillText('Tertarik ikut sesi latihan? Hubungi Admin CS N6 via WhatsApp 0851-4726-7786.', marginX, footerLine1Y);
    ctx.fillStyle = '#8C8A82'; ctx.font = '400 12.5px Arial';
    ctx.fillText('Dicetak otomatis oleh sistem pada ' + printLabel.tanggal + ', pukul ' + printLabel.jam, marginX, footerLine2Y);
    ctx.fillStyle = '#111110'; ctx.font = '700 13px Arial'; ctx.textAlign = 'right';
    ctx.fillText('NUMBER SIX RUNNING', W - marginX, footerLine2Y);
    ctx.textAlign = 'left';

    const link = document.createElement('a');
    link.download = 'Jadwal-' + slugify(coach.name) + '-30hari-' + todayISO() + '.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.92);
    link.click();
    showToast(noDataYet
      ? coach.name + ' belum punya jadwal tersimpan — semua sesi tampil Kosong. Tandai slot di tab "Pola Mingguan", klik Simpan, baru unduh lagi.'
      : 'Jadwal ' + coach.name + ' berhasil diunduh');
  };


  /* ================= JADWAL COACH (ROSTER + KETERSEDIAAN) ================= */
/*__N6_UNIT__*/  function renderCoachRoster(){
    document.getElementById('coachRosterList').innerHTML = coachRoster.length ? coachRoster.map(c => `
      <div class="coach-roster-item">
        <div><div class="name" style="font-weight:600; font-size:13.5px;">${escapeHtml(c.name)}</div><div class="meta" style="font-size:12px; color:var(--asphalt);">${escapeHtml(c.phone || '-')}</div></div>
        <div style="display:flex; gap:8px;">
          <button class="btn-sm" onclick="editCoach('${c.id}')">Edit</button>
          <button class="btn-danger-sm" onclick="deleteCoach('${c.id}')">Hapus</button>
        </div>
      </div>`).join('') : '<div class="list-empty">Belum ada coach terdaftar.</div>';
  }
/*__N6_UNIT__*/  function renderDayTabs(){
    document.getElementById('dayTabs').innerHTML = DAYS.map(d => `<button type="button" class="subtab-btn ${d===activeDay?'active':''}" data-day="${d}">${d}${d===todayDayName() ? ' (Hari ini)' : ''}</button>`).join('');
    document.querySelectorAll('#dayTabs .subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => { activeDay = btn.dataset.day; renderDayTabs(); renderSchedTable(); });
    });
  }
/*__N6_UNIT__*/  function renderSchedTable(){
    const table = document.getElementById('schedTable');
    let thead = '<thead><tr><th style="text-align:left;">Coach</th>' + BLOCKS.map(b => `<th>${b.label}<br><span style="font-weight:400; text-transform:none;">${b.time}</span></th>`).join('') + '</tr></thead>';
    let rows = coachRoster.map(coach => {
      const sched = coachSchedule[coach.id] || {};
      const cells = BLOCKS.map(b => {
        const slot = sched[activeDay + '|' + b.key];
        if (slot){
          const slotNames = Array.isArray(slot.clients) && slot.clients.length ? slot.clients : String((slot.clientId && clients.find(c => c.id === slot.clientId)?.name) || slot.client || '').split(',').map(x=>x.trim()).filter(Boolean);
          const categoryLabels={'single-session':'Single Session Training','group-training':'Group Training','semi-private':'Semi Privat Training','private-training':'Privat Training'};
          return `<td><button type="button" class="slot-btn terisi" onclick="openSlotModal('${coach.id}','${activeDay}','${b.key}')">Terisi<span class="cn">${escapeHtml(categoryLabels[slot.trainingCategory]||'Single Session Training')}</span>${slotNames.map(name=>`<span class="cn">${escapeHtml(name)}</span>`).join('')}${slot.location ? `<span class="loc">${escapeHtml(slot.location)}</span>` : ''}</button></td>`;
        }
        return `<td><button type="button" class="slot-btn kosong" onclick="openSlotModal('${coach.id}','${activeDay}','${b.key}')">Kosong</button></td>`;
      }).join('');
      return `<tr><td class="coach-name-cell">${escapeHtml(coach.name)}</td>${cells}</tr>`;
    }).join('');
    if (!coachRoster.length) rows = `<tr><td colspan="${BLOCKS.length+1}" class="muted" style="text-align:center; padding:16px 0;">Tambahkan coach dulu untuk mengatur jadwal.</td></tr>`;
    table.innerHTML = thead + '<tbody>' + rows + '</tbody>';
  }

  /* ================= KALENDER 30 HARI COACH (REAL-TIME) ================= */
/*__N6_UNIT__*/  function renderCoachCalendar(){
    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    document.getElementById('coachCalRange').textContent = monthNames[calMonth] + ' ' + calYear;
    const dowLabels = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    let html = dowLabels.map(d => `<div class="cal-dow">${d}</div>`).join('');

    const firstDay = new Date(calYear, calMonth, 1);
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const prevDaysInMonth = new Date(calYear, calMonth, 0).getDate();
    const todayStr = todayISO();

    for (let i = startOffset; i > 0; i--){
      html += `<div class="cal-cell outside"><span class="num">${prevDaysInMonth - i + 1}</span></div>`;
    }
    for (let d = 1; d <= daysInMonth; d++){
      const dateStr = dateStrOf(calYear, calMonth, d);
      const weekday = weekdayNameOf(calYear, calMonth, d);
      const { kosong, anyOff } = daySummary(dateStr, weekday);
      let cls = 'cal-cell';
      if (dateStr === todayStr) cls += ' today';
      if (dateStr === selectedCalDate) cls += ' selected';
      const cntCls = kosong > 0 ? 'green' : 'red';
      const cntLabel = coachRoster.length ? (kosong > 0 ? kosong + ' kosong' : 'Penuh') : '-';
      html += `<div class="${cls}" data-date="${dateStr}">
        <span class="num">${d}</span>
        <span class="cnt ${cntCls}">${cntLabel}</span>
        ${anyOff ? '<span class="off-dot" title="Ada coach libur"></span>' : ''}
      </div>`;
    }
    const totalCells = startOffset + daysInMonth;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let d = 1; d <= trailing; d++){
      html += `<div class="cal-cell outside"><span class="num">${d}</span></div>`;
    }

    document.getElementById('coachCalGrid').innerHTML = html;
    document.querySelectorAll('#coachCalGrid .cal-cell[data-date]').forEach(cell => {
      cell.addEventListener('click', () => { selectedCalDate = cell.dataset.date; renderCoachCalendar(); renderCoachCalDetail(); });
    });
  }

/*__N6_UNIT__*/  function renderCoachCalDetail(){
    const box = document.getElementById('coachCalDetail');
    if (!selectedCalDate){ box.innerHTML = '<p class="modal-empty">Klik salah satu tanggal untuk lihat detail ketersediaan tiap coach.</p>'; return; }
    if (!coachRoster.length){ box.innerHTML = '<p class="modal-empty">Belum ada coach terdaftar.</p>'; return; }
    const weekday = selectedCalDate.split('-').map(Number);
    const wd = weekdayNameOf(weekday[0], weekday[1]-1, weekday[2]);
    box.innerHTML = `<h4>${formatDateID(selectedCalDate)} — ${wd}</h4>` + coachRoster.map(coach => {
      const off = isCoachOff(coach.id, selectedCalDate);
      const sched = coachSchedule[coach.id] || {};
      const chips = BLOCKS.map(b => {
        const slot = sched[wd + '|' + b.key];
        if (!slot) return `<span class="cal-slot-chip kosong">${b.label}: Kosong</span>`;
        const slotNames = Array.isArray(slot.clients) && slot.clients.length ? slot.clients : String((slot.clientId && clients.find(c => c.id === slot.clientId)?.name) || slot.client || 'Terisi').split(',').map(x=>x.trim()).filter(Boolean);
        const categoryLabels={'single-session':'Single Session','group-training':'Group Training','semi-private':'Semi Privat','private-training':'Privat Training'};
        return slotNames.map((name,index)=>`<span class="cal-slot-chip terisi">${b.label}${slotNames.length>1?' • '+(index+1):''}: ${escapeHtml(name)} <small>(${escapeHtml(categoryLabels[slot.trainingCategory]||'Single Session')})</small>${slot.location ? ' 📍'+escapeHtml(slot.location) : ''}</span>`).join('');
      }).join('');
      return `<div class="cal-coach-block">
        <div class="cal-coach-block-top">
          <div class="nm">${escapeHtml(coach.name)} ${off ? '<span class="badge amber" style="margin-left:6px;">Libur</span>' : ''}</div>
          <button type="button" class="btn-sm" onclick="toggleCoachDayOff('${coach.id}','${selectedCalDate}')">${off ? 'Batalkan Libur' : 'Tandai Libur Hari Ini'}</button>
        </div>
        ${off ? '<div class="ct" style="font-size:11.5px; color:var(--asphalt); margin-top:4px;">Coach tidak tersedia sepanjang hari ini (pola mingguan diabaikan untuk tanggal ini).</div>' : `<div class="cal-slots-row">${chips}</div>`}
      </div>`;
    }).join('');
  }

  window.toggleCoachDayOff = function(coachId, dateStr){
    if (!coachDayOff[coachId]) coachDayOff[coachId] = [];
    const idx = coachDayOff[coachId].indexOf(dateStr);
    if (idx >= 0) coachDayOff[coachId].splice(idx, 1);
    else coachDayOff[coachId].push(dateStr);
    persistCoachDayOff().then(() => {
      showToast(idx >= 0 ? 'Libur dibatalkan' : 'Coach ditandai libur tanggal ini');
      renderCoachCalendar();
      renderCoachCalDetail();
      renderBeranda();
    });
  };

  window.openSlotModal = function(coachId, day, blockKey){
    activeSlot = { coachId, day, blockKey, addingClient:false };
    const coach = coachById(coachId);
    const block = BLOCKS.find(b => b.key === blockKey);
    const slot = (coachSchedule[coachId] || {})[day + '|' + blockKey];
    document.getElementById('slotModalTitle').textContent = coach.name + ' — ' + day + ' ' + block.label + ' (' + block.time + ')';
    document.getElementById('slotClientSelect').innerHTML = '<option value="">— Isi manual di bawah —</option>' + clients.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join('');
    document.getElementById('slotClientSelect').value = slot && slot.clientId ? slot.clientId : '';
    document.getElementById('slotAddClientAction').style.display = slot ? 'block' : 'none';
    document.getElementById('btnSaveSlot').textContent = slot ? 'Simpan Perubahan' : 'Tandai Terisi';
    const linkedSlotClient = slot && slot.clientId ? clients.find(c => c.id === slot.clientId) : null;
    const existingName = slot ? (linkedSlotClient?.name || (Array.isArray(slot.clients) ? slot.clients[0] : '') || String(slot.client || '').split(',')[0].trim()) : '';
    document.getElementById('slotClientName').value = existingName;
    document.getElementById('slotTrainingCategory').value = slot?.trainingCategory || 'single-session';
    document.getElementById('slotClientName').placeholder = slot ? 'Nama klien atau keterangan sesi' : "mis. Dimas Prasetyo atau 'Sesi Trial'";
    document.getElementById('slotLocation').value = slot ? (slot.location || '') : '';
    document.getElementById('slotNote').value = slot ? (slot.note || '') : '';
    const occurrenceDate=document.getElementById('slotOccurrenceDate'); occurrenceDate.value=todayISO();
    document.getElementById('slotOccurrenceDone').checked=!!(slot?.completedDates||[]).includes(todayISO());
    refreshLocationSuggestions();
    document.getElementById('slotModal').classList.add('show');
  };
/*__N6_UNIT__*/  function refreshLocationSuggestions(){
    const locs = new Set();
    Object.values(coachSchedule).forEach(sched => Object.values(sched || {}).forEach(slot => { if (slot && slot.location) locs.add(slot.location); }));
    document.getElementById('slotLocationList').innerHTML = [...locs].map(l => `<option value="${escapeHtml(l)}">`).join('');
  }
  window.beginAddSlotClient = function(){ if(!activeSlot) return; activeSlot.addingClient=true; document.getElementById('slotClientSelect').value=''; document.getElementById('slotClientName').value=''; document.getElementById('slotClientName').placeholder='Pilih/tulis klien tambahan'; document.getElementById('slotAddClientAction').style.display='none'; document.getElementById('btnSaveSlot').textContent='Tambahkan ke Sesi'; };
  window.closeSlotModal = function(){ document.getElementById('slotModal').classList.remove('show'); activeSlot = null; };
/*__N6_UNIT__*/  async function clearSlot(){
    if (!activeSlot) return;
    const { coachId, day, blockKey } = activeSlot;
    if (coachSchedule[coachId]) delete coachSchedule[coachId][day + '|' + blockKey];
    await persistCoachSchedule();
    closeSlotModal();
    showToast('Slot dikosongkan');
    renderAll();
  }

  window.openCoachForm = function(){
    document.getElementById('coachFormTitle').textContent = 'Tambah Coach';
    document.getElementById('cfCoachId').value = '';
    document.getElementById('cfName').value = '';
    document.getElementById('cfPhone').value = '';
    document.getElementById('coachFormModal').classList.add('show');
  };
  window.editCoach = function(id){
    const c = coachById(id);
    if (!c) return;
    document.getElementById('coachFormTitle').textContent = 'Edit Coach';
    document.getElementById('cfCoachId').value = c.id;
    document.getElementById('cfName').value = c.name;
    document.getElementById('cfPhone').value = c.phone || '';
    document.getElementById('coachFormModal').classList.add('show');
  };
  window.closeCoachForm = function(){ document.getElementById('coachFormModal').classList.remove('show'); };
/*__N6_UNIT__*/  async function saveCoachForm(){
    const name = document.getElementById('cfName').value.trim();
    if (!name){ showToast('Nama coach wajib diisi'); return; }
    let id = document.getElementById('cfCoachId').value;
    const isNew = !id;
    if (isNew){
      let base = slugify(name) || 'coach'; id = base; let n = 2;
      while (coachRoster.some(c => c.id === id)){ id = base + '-' + n; n++; }
    }
    const data = { id, name, phone: document.getElementById('cfPhone').value.trim() };
    if (isNew) coachRoster.push(data);
    else { const idx = coachRoster.findIndex(c => c.id === id); coachRoster[idx] = data; }
    await persistCoachRoster();
    closeCoachForm();
    showToast(isNew ? 'Coach baru ditambahkan' : 'Data coach diperbarui');
    populateCoachFilters();
    populateFormSelects();
    renderAll();
  }
  window.deleteCoach = function(id){
    const c = coachById(id);
    if (!c) return;
    if (!confirm('Hapus coach "' + c.name + '" dari roster? Jadwal ketersediaannya juga akan dihapus.')) return;
    coachRoster = coachRoster.filter(x => x.id !== id);
    delete coachSchedule[id];
    Promise.all([persistCoachRoster(), persistCoachSchedule()]).then(() => {
      showToast('Coach dihapus');
      populateCoachFilters();
      populateFormSelects();
      renderAll();
    });
  };

  /* ================= RENDER ALL ================= */
/*__N6_UNIT__*/  async function refreshSharedCoachSchedule(){
    const read = (key,fallback) => {try{const raw=localStorage.getItem(N6_ADMIN_PREFIX+key);return raw===null?fallback:JSON.parse(raw)}catch(e){return fallback}};
    const newRoster=read('coachRoster',coachRoster),newSchedule=read('coachSchedule',coachSchedule),newOff=read('coachDayOff',coachDayOff);
    if(Array.isArray(newRoster))coachRoster=newRoster;
    if(newSchedule && typeof newSchedule==='object' && !Array.isArray(newSchedule))coachSchedule=newSchedule;
    if(newOff && typeof newOff==='object' && !Array.isArray(newOff))coachDayOff=newOff;
    populateCoachFilters();populateFormSelects();renderAll();
    const status=document.getElementById('n6SyncStatus');
    if(status)status.textContent='Terakhir diperbarui: '+new Date().toLocaleTimeString('id-ID')+' · '+coachRoster.length+' coach · sinkronisasi satu browser & alamat situs.';
  }
  document.getElementById('n6SyncRefresh')?.addEventListener('click',refreshSharedCoachSchedule);
  window.addEventListener('storage',e=>{if(e.key && N6_SHARED_COACH_KEYS.has(e.key.slice(N6_ADMIN_PREFIX.length)) && e.key.startsWith(N6_ADMIN_PREFIX))refreshSharedCoachSchedule();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshSharedCoachSchedule();});
  /* ================= INIT ================= */
  document.getElementById('btnDownloadCoachSchedule').addEventListener('click', async ()=>{
    const btn=document.getElementById('btnDownloadCoachSchedule');
    const coachId=document.getElementById('shareScheduleCoach').value;
    if(!coachId){showToast('Pilih coach terlebih dahulu');return;}
    btn.disabled=true;
    try{await downloadCoachScheduleImage(coachId,document.getElementById('shareScheduleStart').value);}
    catch(err){console.error('Gagal mengunduh jadwal:',err);showToast('Gagal membuat JPG jadwal. Silakan coba lagi.');}
    finally{btn.disabled=false;}
  });
  document.getElementById('shareScheduleStart').value=todayISO();
  (async function init(){
    await loadAllData();
    await refreshSharedCoachSchedule();
    populateCoachFilters();
    populateFormSelects();
    renderAll();
    if (pendingArchiveNotice > 0){
      showToast(pendingArchiveNotice + ' klien nonaktif >10 hari otomatis dipindah ke Arsip');
    }
  })();
