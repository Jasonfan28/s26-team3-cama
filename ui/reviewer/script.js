document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Initialize Map ---
  const mapContainer = document.getElementById('map-container');
  mapContainer.innerHTML = ''; // Clear the SVG placeholder

  // Initialize map centered on Philly
  const map = L.map('map-container').setView([39.9526, -75.1652], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map);

  // Add a sample marker (Matches the 1234 Market St example in the HTML)
  const marker = L.marker([39.9526, -75.1652]).addTo(map);
  marker.bindPopup(`<strong>1234 Market St</strong><br>Click to view details.`).openPopup();

  // --- 2. Property Detail Line Chart (Injected into Left Sidebar) ---
  let valuationChartInstance = null;

  function initValuationChart() {
    const propertyCard = document.querySelector('.property-card');
    // Check if we've already injected the canvas into the property card
    let canvas = document.getElementById('valuationLineChart');

    if (!canvas) {
      // Create the container and canvas, insert it at the bottom of the card
      const chartHTML = `
        <div class="data-group" style="height: 160px; margin-top: 24px;">
          <label>Valuation History</label>
          <canvas id="valuationLineChart"></canvas>
        </div>
      `;
      propertyCard.insertAdjacentHTML('beforeend', chartHTML);
      canvas = document.getElementById('valuationLineChart');
    }

    const ctx = canvas.getContext('2d');

    // Destroy previous instance to prevent hover/render glitches
    if (valuationChartInstance) {
      valuationChartInstance.destroy();
    }

    valuationChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['2022', '', '2023', '', '2024'],
        datasets: [{
          label: 'Valuation',
          data: [46000, 55000, 152000, 160000, 180000],
          borderColor: '#1e40af',
          backgroundColor: '#1e40af',
          fill: false,
          borderWidth: 2,
          segment: {
            // Project dashed line for recent/future data
            borderDash: ctx => ctx.p0.parsed.x >= 2 ? [5, 5] : undefined,
          },
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) { return '$' + value / 1000 + 'k' },
            },
          },
        },
        maintainAspectRatio: false,
      },
    });
  }

  // --- 3. Interaction: Updating the Sidebar ---
  const detailsPlaceholder = document.getElementById('details-placeholder');
  const propertyCard = document.querySelector('.property-card');
  const searchBtn = document.querySelector('.btn-primary');

  function showPropertyDetails() {
    // Hide placeholder, show card
    detailsPlaceholder.style.display = 'none';
    propertyCard.style.display = 'block';

    // Render the valuation line chart inside the card
    initValuationChart();
  }

  // Trigger details view on marker click or search button click
  marker.on('click', showPropertyDetails);
  searchBtn.addEventListener('click', showPropertyDetails);

  // --- 4. Initialize Sidebar Distribution Charts (Right Panel) ---
  // Assessment Value Distribution — loads real bin data from /configs/
  const BUCKET_URL = 'https://storage.googleapis.com/musa5090s26-team3-public';
  const TAIL_CAP = 1_500_000;

  const fmtMoney = v => v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
    : `$${Math.round(v / 1000)}k`;

  async function renderValueDistribution() {
    const res = await fetch(`${BUCKET_URL}/configs/tax_year_assessment_bins.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bins = await res.json();

    const latestYear = Math.max(...bins.map(b => b.tax_year));
    const rows = bins
      .filter(b => b.tax_year === latestYear)
      .sort((a, b) => a.lower_bound - b.lower_bound);

    const head = rows.filter(r => r.lower_bound < TAIL_CAP);
    const tailCount = rows
      .filter(r => r.lower_bound >= TAIL_CAP)
      .reduce((s, r) => s + r.property_count, 0);

    const seriesData = head.map(r => ({
      x: r.lower_bound,
      y: r.property_count,
      lower: r.lower_bound,
      upper: r.upper_bound,
      isTail: false,
    }));
    if (tailCount > 0) {
      seriesData.push({
        x: TAIL_CAP,
        y: tailCount,
        lower: TAIL_CAP,
        upper: null,
        isTail: true,
      });
    }

    const container = document.getElementById('chart-container-1');
    container.innerHTML = '<div class="apex-chart-wrap" style="padding:8px 12px;height:100%;"><div id="apex-value-dist" style="height:100%;"></div></div>';

    const options = {
      chart: {
        type: 'bar',
        height: '100%',
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        animations: { enabled: true, speed: 450, animateGradually: { enabled: false } },
        background: 'transparent',
      },
      series: [{ name: 'Properties', data: seriesData }],
      plotOptions: {
        bar: {
          columnWidth: '96%',
          borderRadius: 2,
          borderRadiusApplication: 'end',
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: false },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.25,
          gradientToColors: ['#60a5fa'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.85,
          stops: [0, 100],
        },
      },
      colors: ['#1e40af'],
      xaxis: {
        type: 'numeric',
        tickAmount: 8,
        labels: {
          formatter: v => {
            const n = Number(v);
            if (tailCount > 0 && n === TAIL_CAP) return `${fmtMoney(TAIL_CAP)}+`;
            return fmtMoney(n);
          },
          style: { fontSize: '11px', colors: '#64748b' },
          rotate: 0,
          hideOverlappingLabels: true,
        },
        axisBorder: { show: false },
        axisTicks: { color: '#e2e8f0' },
      },
      yaxis: {
        logarithmic: true,
        forceNiceScale: true,
        labels: {
          formatter: v => {
            const n = Math.round(v);
            if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
            return `${n}`;
          },
          style: { fontSize: '11px', colors: '#64748b' },
        },
      },
      grid: {
        borderColor: '#e2e8f0',
        strokeDashArray: 3,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
        padding: { left: 8, right: 8, top: 0, bottom: 0 },
      },
      tooltip: {
        theme: 'light',
        x: { show: false },
        custom: ({ dataPointIndex, w }) => {
          const d = w.config.series[0].data[dataPointIndex];
          const range = d.isTail
            ? `${fmtMoney(d.lower)} and above`
            : `${fmtMoney(d.lower)} – ${fmtMoney(d.upper)}`;
          return `
            <div style="padding:8px 12px;font-family:Inter,sans-serif;">
              <div style="font-size:11px;color:#64748b;margin-bottom:2px;">${range}</div>
              <div style="font-size:13px;font-weight:600;color:#0f172a;">
                ${d.y.toLocaleString()} properties
              </div>
            </div>
          `;
        },
      },
      title: {
        text: `Assessed Value Distribution (${latestYear})`,
        align: 'left',
        margin: 4,
        style: { fontSize: '14px', fontWeight: 600, color: '#0f172a' },
      },
      subtitle: {
        text: `Bin width: $25k · Tail: ${fmtMoney(TAIL_CAP)}+`,
        align: 'left',
        style: { fontSize: '11px', color: '#94a3b8' },
      },
    };

    const chart = new ApexCharts(document.getElementById('apex-value-dist'), options);
    chart.render();
  }

  renderValueDistribution().catch(err => {
    console.error('Failed to load assessment bins:', err);
    const span = document.querySelector('#chart-container-1 span');
    if (span) span.textContent = 'Failed to load distribution';
  });

  // Predicted Value Distribution (issue #19) — depends on ML model output upstream.
  // If the JSON isn't there yet, render a friendly empty state instead of an error.
  async function renderPredictedDistribution() {
    const res = await fetch(`${BUCKET_URL}/configs/current_assessment_bins.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bins = await res.json();

    if (!Array.isArray(bins) || bins.length === 0) {
      throw new Error('empty bins');
    }

    const rows = [...bins].sort((a, b) => a.lower_bound - b.lower_bound);
    const head = rows.filter(r => r.lower_bound < TAIL_CAP);
    const tailCount = rows
      .filter(r => r.lower_bound >= TAIL_CAP)
      .reduce((s, r) => s + r.property_count, 0);

    const seriesData = head.map(r => ({
      x: r.lower_bound,
      y: r.property_count,
      lower: r.lower_bound,
      upper: r.upper_bound,
      isTail: false,
    }));
    if (tailCount > 0) {
      seriesData.push({
        x: TAIL_CAP,
        y: tailCount,
        lower: TAIL_CAP,
        upper: null,
        isTail: true,
      });
    }

    const container = document.getElementById('chart-container-2');
    container.innerHTML = '<div class="apex-chart-wrap" style="padding:8px 12px;height:100%;"><div id="apex-pred-dist" style="height:100%;"></div></div>';

    const options = {
      chart: {
        type: 'bar',
        height: '100%',
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        animations: { enabled: true, speed: 450, animateGradually: { enabled: false } },
        background: 'transparent',
      },
      series: [{ name: 'Properties', data: seriesData }],
      plotOptions: {
        bar: {
          columnWidth: '96%',
          borderRadius: 2,
          borderRadiusApplication: 'end',
        },
      },
      dataLabels: { enabled: false },
      stroke: { show: false },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.25,
          gradientToColors: ['#34d399'],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.85,
          stops: [0, 100],
        },
      },
      colors: ['#047857'],
      xaxis: {
        type: 'numeric',
        tickAmount: 8,
        labels: {
          formatter: v => {
            const n = Number(v);
            if (tailCount > 0 && n === TAIL_CAP) return `${fmtMoney(TAIL_CAP)}+`;
            return fmtMoney(n);
          },
          style: { fontSize: '11px', colors: '#64748b' },
          rotate: 0,
          hideOverlappingLabels: true,
        },
        axisBorder: { show: false },
        axisTicks: { color: '#e2e8f0' },
      },
      yaxis: {
        logarithmic: true,
        forceNiceScale: true,
        labels: {
          formatter: v => {
            const n = Math.round(v);
            if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
            return `${n}`;
          },
          style: { fontSize: '11px', colors: '#64748b' },
        },
      },
      grid: {
        borderColor: '#e2e8f0',
        strokeDashArray: 3,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
        padding: { left: 8, right: 8, top: 0, bottom: 0 },
      },
      tooltip: {
        theme: 'light',
        x: { show: false },
        custom: ({ dataPointIndex, w }) => {
          const d = w.config.series[0].data[dataPointIndex];
          const range = d.isTail
            ? `${fmtMoney(d.lower)} and above`
            : `${fmtMoney(d.lower)} – ${fmtMoney(d.upper)}`;
          return `
            <div style="padding:8px 12px;font-family:Inter,sans-serif;">
              <div style="font-size:11px;color:#64748b;margin-bottom:2px;">${range}</div>
              <div style="font-size:13px;font-weight:600;color:#0f172a;">
                ${d.y.toLocaleString()} properties
              </div>
            </div>
          `;
        },
      },
      title: {
        text: 'Predicted Value Distribution (CAMA Model)',
        align: 'left',
        margin: 4,
        style: { fontSize: '14px', fontWeight: 600, color: '#0f172a' },
      },
      subtitle: {
        text: `Bin width: $25k · Tail: ${fmtMoney(TAIL_CAP)}+`,
        align: 'left',
        style: { fontSize: '11px', color: '#94a3b8' },
      },
    };

    const chart = new ApexCharts(document.getElementById('apex-pred-dist'), options);
    chart.render();
  }

  function showPredictedEmptyState(message) {
    const container = document.getElementById('chart-container-2');
    container.innerHTML = `
      <div class="chart-placeholder" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;color:#94a3b8;">
        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:8px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <div style="font-size:13px;font-weight:600;color:#475569;">Predicted Value Distribution</div>
        <div style="font-size:11px;margin-top:4px;">${message}</div>
        <small style="margin-top:6px;color:#cbd5e1;">Will populate when <code>configs/current_assessment_bins.json</code> is published</small>
      </div>
    `;
  }

  renderPredictedDistribution().catch(err => {
    console.warn('Predicted distribution unavailable:', err.message);
    showPredictedEmptyState('ML model output not available yet');
  });
});