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
  const DISPLAY_BIN_WIDTH = 50_000; // aggregate source $25k bins into $50k buckets for legibility

  const fmtMoney = v => v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
    : `$${Math.round(v / 1000)}k`;

  // Roll source bins (any width) into fixed-width display buckets up to TAIL_CAP,
  // collapsing everything ≥ TAIL_CAP into a single tail bucket.
  function aggregateBins(rows, key = 'property_count') {
    const buckets = new Map();
    let tail = 0;
    for (const r of rows) {
      const count = r[key] ?? r.property_count ?? 0;
      if (r.lower_bound >= TAIL_CAP) {
        tail += count;
        continue;
      }
      const bucketLower = Math.floor(r.lower_bound / DISPLAY_BIN_WIDTH) * DISPLAY_BIN_WIDTH;
      buckets.set(bucketLower, (buckets.get(bucketLower) || 0) + count);
    }
    const out = [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([lower, count]) => ({
        lower,
        upper: lower + DISPLAY_BIN_WIDTH,
        count,
        isTail: false,
      }));
    if (tail > 0) {
      out.push({ lower: TAIL_CAP, upper: null, count: tail, isTail: true });
    }
    return out;
  }

  async function renderValueDistribution() {
    const res = await fetch(`${BUCKET_URL}/configs/tax_year_assessment_bins.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bins = await res.json();

    const latestYear = Math.max(...bins.map(b => b.tax_year));
    const rows = bins.filter(b => b.tax_year === latestYear);

    const aggregated = aggregateBins(rows);
    const tailCount = aggregated.find(b => b.isTail)?.count ?? 0;

    const seriesData = aggregated.map(b => ({
      x: b.lower,
      y: b.count,
      lower: b.lower,
      upper: b.upper,
      isTail: b.isTail,
    }));

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
          columnWidth: '88%',
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
        min: 0,
        max: TAIL_CAP,
        tickAmount: 3,
        labels: {
          formatter: v => {
            const n = Number(v);
            if (tailCount > 0 && n >= TAIL_CAP) return `${fmtMoney(TAIL_CAP)}+`;
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
        text: `Bin width: ${fmtMoney(DISPLAY_BIN_WIDTH)} · Tail: ${fmtMoney(TAIL_CAP)}+`,
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

  // Assessed vs Predicted Comparison (issue #19) — overlays both distributions on
  // the same bins so reviewers can spot where the model diverges from current assessments.
  async function renderComparisonDistribution() {
    const [assessedRes, predictedRes] = await Promise.all([
      fetch(`${BUCKET_URL}/configs/tax_year_assessment_bins.json`),
      fetch(`${BUCKET_URL}/configs/current_assessment_bins.json`),
    ]);
    if (!assessedRes.ok) throw new Error(`assessed HTTP ${assessedRes.status}`);
    if (!predictedRes.ok) throw new Error(`predicted HTTP ${predictedRes.status}`);

    const [assessedRaw, predictedRaw] = await Promise.all([
      assessedRes.json(),
      predictedRes.json(),
    ]);

    if (!Array.isArray(predictedRaw) || predictedRaw.length === 0) {
      throw new Error('empty predicted bins');
    }

    const latestYear = Math.max(...assessedRaw.map(b => b.tax_year));
    const assessed = assessedRaw.filter(b => b.tax_year === latestYear);

    // Aggregate each dataset into shared $50k buckets, then merge by lower bound.
    const assessedBuckets = aggregateBins(assessed);
    const predictedBuckets = aggregateBins(predictedRaw);

    const binMap = new Map();
    function upsert(buckets, key) {
      for (const b of buckets) {
        const existing = binMap.get(b.lower);
        if (existing) {
          existing[key] = b.count;
        } else {
          binMap.set(b.lower, { lower: b.lower, upper: b.upper, isTail: b.isTail, assessed: 0, predicted: 0, [key]: b.count });
        }
      }
    }
    upsert(assessedBuckets, 'assessed');
    upsert(predictedBuckets, 'predicted');

    const sortedBins = [...binMap.values()].sort((a, b) => a.lower - b.lower);
    const assessedSeries = sortedBins.map(b => ({ x: b.lower, y: b.assessed }));
    const predictedSeries = sortedBins.map(b => ({ x: b.lower, y: b.predicted }));

    const container = document.getElementById('chart-container-2');
    container.innerHTML = '<div class="apex-chart-wrap" style="padding:8px 12px;height:100%;"><div id="apex-comparison" style="height:100%;"></div></div>';

    const options = {
      chart: {
        type: 'area',
        height: '100%',
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        animations: { enabled: true, speed: 450, animateGradually: { enabled: false } },
        background: 'transparent',
      },
      series: [
        { name: `Assessed (${latestYear})`, data: assessedSeries },
        { name: 'Predicted (CAMA Model)', data: predictedSeries },
      ],
      dataLabels: { enabled: false },
      stroke: { curve: 'stepline', width: 2 },
      colors: ['#1e40af', '#047857'],
      fill: {
        type: 'solid',
        opacity: [0.18, 0.18],
      },
      markers: { size: 0 },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '11px',
        markers: { width: 10, height: 10 },
        itemMargin: { horizontal: 8, vertical: 0 },
      },
      xaxis: {
        type: 'numeric',
        min: 0,
        max: TAIL_CAP,
        tickAmount: 3,
        labels: {
          formatter: v => {
            const n = Number(v);
            if (n >= TAIL_CAP) return `${fmtMoney(TAIL_CAP)}+`;
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
        shared: true,
        intersect: false,
        x: { show: false },
        custom: ({ dataPointIndex }) => {
          const b = sortedBins[dataPointIndex];
          const range = b.isTail
            ? `${fmtMoney(b.lower)} and above`
            : `${fmtMoney(b.lower)} – ${fmtMoney(b.upper)}`;
          const diff = b.predicted - b.assessed;
          const diffLabel = diff === 0
            ? ''
            : `<div style="font-size:11px;color:${diff > 0 ? '#047857' : '#b91c1c'};margin-top:4px;">
                 ${diff > 0 ? '+' : ''}${diff.toLocaleString()} predicted vs. assessed
               </div>`;
          return `
            <div style="padding:8px 12px;font-family:Inter,sans-serif;min-width:180px;">
              <div style="font-size:11px;color:#64748b;margin-bottom:4px;">${range}</div>
              <div style="font-size:12px;color:#1e40af;display:flex;justify-content:space-between;gap:12px;">
                <span>Assessed (${latestYear})</span>
                <strong>${b.assessed.toLocaleString()}</strong>
              </div>
              <div style="font-size:12px;color:#047857;display:flex;justify-content:space-between;gap:12px;">
                <span>Predicted</span>
                <strong>${b.predicted.toLocaleString()}</strong>
              </div>
              ${diffLabel}
            </div>
          `;
        },
      },
      title: {
        text: 'Assessed vs. Predicted Distribution',
        align: 'left',
        margin: 4,
        style: { fontSize: '14px', fontWeight: 600, color: '#0f172a' },
      },
      subtitle: {
        text: `${latestYear} assessments vs. CAMA predictions · ${fmtMoney(DISPLAY_BIN_WIDTH)} bins · log scale`,
        align: 'left',
        style: { fontSize: '11px', color: '#94a3b8' },
      },
    };

    const chart = new ApexCharts(document.getElementById('apex-comparison'), options);
    chart.render();
  }

  function showComparisonEmptyState(message) {
    const container = document.getElementById('chart-container-2');
    container.innerHTML = `
      <div class="chart-placeholder" style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;color:#94a3b8;">
        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin-bottom:8px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
        <div style="font-size:13px;font-weight:600;color:#475569;">Assessed vs Predicted</div>
        <div style="font-size:11px;margin-top:4px;">${message}</div>
        <small style="margin-top:6px;color:#cbd5e1;">Will populate when <code>configs/current_assessment_bins.json</code> is published</small>
      </div>
    `;
  }

  renderComparisonDistribution().catch(err => {
    console.warn('Comparison distribution unavailable:', err.message);
    showComparisonEmptyState('ML model predictions not available yet');
  });
});