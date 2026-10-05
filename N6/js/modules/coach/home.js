/**
 * N6 modules - coach / home
 * menu label : Beranda
 * minimum tier: 3
 *
 * Source-fragment. These files are concatenated in the order declared by
 * js/modules/coach/manifest.js and wrapped in the role's original IIFE by
 * tools/build.ps1 -> js/dist/coach.js. Concatenating every fragment in manifest
 * order reproduces coach.html's main script byte for byte.
 *
 * Do not reorder or edit by hand: run tools/build.ps1 after any change.
 */
//__N6_BODY__
  function renderUpcoming(){
    document.getElementById('upcomingBody').innerHTML = upcomingSchedule.map(u => `
      <tr>
        <td class="strong">${u.date}</td>
        <td class="muted">${u.time}</td>
        <td class="strong">${u.client}</td>
        <td class="muted right">${u.loc}</td>
      </tr>
    `).join('');
  }

  /* ================= RENDER: PRESTASI CHARTS ================= */
/*__N6_UNIT__*/  function renderCharts(){
    new Chart(document.getElementById('chartPencapaian'), buildChartConfig('pencapaian'));
    new Chart(document.getElementById('chartPerforma'), buildChartConfig('performa'));
    new Chart(document.getElementById('chartStatusKlien'), buildChartConfig('statusKlien'));
    new Chart(document.getElementById('chartProfesional'), buildChartConfig('profesional'));
    new Chart(document.getElementById('chartRatingTren'), buildChartConfig('ratingTren'));

    // Star rating
    const rating = chartData.ratingTren[chartData.ratingTren.length-1];
    const full = Math.floor(rating);
    const starsHtml = Array.from({length:5}, (_, i) => {
      const cls = i < full ? 'filled' : 'empty';
      return `<svg class="${cls}" viewBox="0 0 24 24" stroke-width="1.5"><polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 16.8 5.5 21 7.5 13.5 2 9 9 9"/></svg>`;
    }).join('');
    document.getElementById('coachStars').innerHTML = starsHtml;
  }

  /* ================= MODAL: POPUP GRAFIK (untuk tampilan mobile) ================= */
