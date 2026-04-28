const BUCKET_BASE = 'https://storage.googleapis.com/musa5090s26-team3-public';
const MAX_VALUE = 1000000;

document.addEventListener('DOMContentLoaded', async () => {
  // --- 1. Initialize Map ---
  const mapContainer = document.getElementById('map-container');
  mapContainer.innerHTML = '';

  const map = L.map('map-container').setView([39.9526, -75.1652], 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
  }).addTo(map);

  // --- 2. Property Vector Tiles ---
  function getValueColor(value) {
    if (!value || value <= 0) return '#e2e8f0';
    if (value < 50000) return '#fff7ed';
    if (value < 100000) return '#fdba74';
    if (value < 200000) return '#f97316';
    if (value < 350000) return '#ea580c';
    if (value < 600000) return '#c2410c';
    return '#7c2d12';
  }

  const tileUrl = 'https://storage.googleapis.com/musa5090s26-team3-public/tiles/{z}/{x}/{y}.pbf';

  let selectedFeatureId = null;

  const tileLayer = L.vectorGrid.protobuf(tileUrl, {
    vectorTileLayerStyles: {
      'property_tile_info': (properties) => ({
        fillColor: getValueColor(properties.market_value_2025),
        fillOpacity: 0.8,
        stroke: true,
        color: '#ffffff',
        weight: 0.3,
        opacity: 0.5,
        fill: true,
      }),
    },
    interactive: true,
    maxNativeZoom: 18,
    maxZoom: 18,
    getFeatureId: (f) => f.properties.id,
  });

  tileLayer.on('click', (e) => {
    const props = e.layer.properties;

    // Reset previous highlight
    if (selectedFeatureId !== null) {
      tileLayer.resetFeatureStyle(selectedFeatureId);
    }

    // Highlight selected property
    selectedFeatureId = props.id;
    tileLayer.setFeatureStyle(props.id, {
      fillColor: '#facc15',
      fillOpacity: 1,
      stroke: true,
      color: '#1e40af',
      weight: 2,
      opacity: 1,
      fill: true,
    });

    document.getElementById('prop-address').textContent = props.address || '—';
    document.getElementById('prop-parcel').textContent = props.parcel_id || '—';
    document.getElementById('prop-assessed').textContent =
      props.market_value_2025 ? '$' + props.market_value_2025.toLocaleString() : '—';
    document.getElementById('prop-assessed-2024').textContent =
      props.market_value_2024 ? '$' + props.market_value_2024.toLocaleString() : '—';
    document.getElementById('prop-predicted').textContent =
      props.pred_value ? '$' + props.pred_value.toLocaleString() : '—';

    document.getElementById('details-placeholder').style.display = 'none';
    document.querySelector('.property-card').style.display = 'block';
  });

  tileLayer.addTo(map);

  // --- 3. Property Search ---
  const detailsPlaceholder = document.getElementById('details-placeholder');
  const propertyCard = document.querySelector('.property-card');
  const searchBtn = document.querySelector('.btn-primary');

  // --- 3. Valuation History Chart (Property Card) ---
  let valuationChartInstance = null;

  function initValuationChart() {
    let canvas = document.getElementById('valuationLineChart');

    if (!canvas) {
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

    if (valuationChartInstance) {
      valuationChartInstance.destroy();
    }

    valuationChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['2022', '2023', '2024'],
        datasets: [{
          label: 'Valuation',
          data: [46000, 152000, 180000],
          borderColor: '#1e40af',
          backgroundColor: '#1e40af',
          fill: false,
          borderWidth: 2,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => '$' + value / 1000 + 'k',
            },
          },
        },
        maintainAspectRatio: false,
      },
    });
  }

  function showPropertyDetails() {
    detailsPlaceholder.style.display = 'none';
    propertyCard.style.display = 'block';
    initValuationChart();
  }

  searchBtn.addEventListener('click', showPropertyDetails);

  // --- 4. Shared chart helpers ---
  function formatDollar(val) {
    if (val >= 1000000) return '$' + (val / 1000000) + 'M';
    if (val >= 1000) return '$' + (val / 1000) + 'k';
    return '$' + val;
  }

  function setupCanvas(containerId, canvasId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<div style="position:relative;height:100%;width:100%;padding:16px;"><canvas id="${canvasId}"></canvas></div>`;
    return document.getElementById(canvasId).getContext('2d');
  }

  function buildChartOptions(labels) {
    return {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const i = items[0].dataIndex;
              const lower = labels[i];
              const upper = lower + 25000;
              return `${formatDollar(lower)} – ${formatDollar(upper)}`;
            },
            label: (item) => `${item.raw.toLocaleString()} properties`,
          },
        },
      },
      scales: {
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            callback: (val) => val.toLocaleString(),
          },
        },
        x: {
          grid: { display: false },
          ticks: {
            callback: (val, i) => {
              const total = labels.length;
              const step = Math.max(1, Math.floor(total / 4));
              if (i === 0 || i === total - 1 || i % step === 0) {
                return formatDollar(labels[i]);
              }
              return '';
            },
            maxRotation: 0,
            autoSkip: false,
          },
        },
      },
      maintainAspectRatio: false,
      responsive: true,
    };
  }

  // --- 5. Tax Year Distribution Chart ---
  let taxYearChartInstance = null;
  let taxYearData = [];

  try {
    const res = await fetch(`${BUCKET_BASE}/configs/tax_year_assessment_bins.json`);
    taxYearData = await res.json();

    const years = [...new Set(taxYearData.map((d) => d.tax_year))].sort();

    const yearSelect = document.getElementById('year-select');
    years.forEach((y) => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    });
    yearSelect.value = years[years.length - 1];

    function renderTaxYearChart(year) {
      const yearData = taxYearData
        .filter((d) => d.tax_year === year && d.lower_bound <= MAX_VALUE);
      const labels = yearData.map((d) => d.lower_bound);
      const counts = yearData.map((d) => d.property_count);

      const ctx = setupCanvas('chart-container-1', 'taxYearCanvas');

      if (taxYearChartInstance) taxYearChartInstance.destroy();

      taxYearChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: counts,
            backgroundColor: 'rgba(30, 64, 175, 0.7)',
            borderColor: '#1e40af',
            borderWidth: 1,
            borderRadius: 2,
          }],
        },
        options: buildChartOptions(labels),
      });
    }

    renderTaxYearChart(years[years.length - 1]);

    yearSelect.addEventListener('change', (e) => {
      renderTaxYearChart(parseInt(e.target.value));
    });

  } catch (e) {
    console.error('Failed to load tax year data:', e);
    document.getElementById('chart-container-1').innerHTML =
      '<p style="padding:16px;color:#94a3b8;">Could not load distribution data.</p>';
  }

  // --- 6. Current Model Assessment Distribution Chart ---
  try {
    const res = await fetch(`${BUCKET_BASE}/configs/current_assessment_bins.json`);
    const currentData = await res.json();

    const filtered = currentData.filter((d) => d.lower_bound <= MAX_VALUE);
    const labels = filtered.map((d) => d.lower_bound);
    const counts = filtered.map((d) => d.property_count);

    const ctx = setupCanvas('chart-container-2', 'currentCanvas');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: 'rgba(100, 116, 139, 0.7)',
          borderColor: '#64748b',
          borderWidth: 1,
          borderRadius: 2,
        }],
      },
      options: buildChartOptions(labels),
    });

  } catch (e) {
    console.error('Failed to load current assessment data:', e);
    document.getElementById('chart-container-2').innerHTML =
      '<p style="padding:16px;color:#94a3b8;">Could not load distribution data.</p>';
  }
});
