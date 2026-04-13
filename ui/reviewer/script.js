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
  const commonOptions = {
    plugins: { legend: { display: false } },
    scales: { y: { display: false }, x: { grid: { display: false } } },
    elements: { line: { tension: 0.4 }, point: { radius: 0 } },
    maintainAspectRatio: false,
    responsive: true,
  };

  // Helper to replace the HTML placeholder with a canvas element
  function setupCanvas(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div style="position: relative; height: 100%; width: 100%; padding: 16px;"><canvas></canvas></div>';
    return container.querySelector('canvas').getContext('2d');
  }

  // Assessment Value Distribution
  const ctxDist = setupCanvas('chart-container-1');
  new Chart(ctxDist, {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [{
        data: [5, 40, 60, 45, 20, 5],
        fill: true,
        backgroundColor: 'rgba(30, 64, 175, 0.1)',
        borderColor: '#1e40af',
      }],
    },
    options: commonOptions,
  });

  // Percent Change Distribution
  const ctxChange = setupCanvas('chart-container-2');
  new Chart(ctxChange, {
    type: 'line',
    data: {
      labels: [-50, 0, 50, 100, 150, 200],
      datasets: [{
        data: [2, 10, 70, 40, 15, 5],
        fill: true,
        backgroundColor: 'rgba(148, 163, 184, 0.2)',
        borderColor: '#64748b',
      }],
    },
    options: commonOptions,
  });
});