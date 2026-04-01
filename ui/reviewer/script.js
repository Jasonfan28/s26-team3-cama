document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Initialize Map ---
    const mapContainer = document.getElementById('map-container');
    mapContainer.innerHTML = ''; // Clear the SVG placeholder
    
    // Initialize map centered on Philly
    const map = L.map('map-container').setView([39.95238, -75.16362], 11);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors © CARTO'
}).addTo(map);

// Philly boundary outline
fetch('https://raw.githubusercontent.com/Weitzman-MUSA-GeoCloud/s26-team3-cama/refs/heads/main/ui/City_Limits.geojson')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: '#1e40af',
        weight: 2,
        fill: false
      }
    }).addTo(map);
  });

    // Add a sample marker (Matches the 1234 Market St example in the HTML)
    const marker = L.marker([39.95237570893766, -75.16360991301265]).addTo(map);
    marker.bindPopup(`<strong>1400 John F. Kennedy Blvd</strong><br>Click to view details.`).openPopup();

    // --- 2. Interaction: Updating the Sidebar (Replaces Modal logic) ---
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


    // --- 3. Initialize Sidebar Distribution Charts (Right Panel) ---
    const commonOptions = {
        plugins: { legend: { display: false } },
        scales: { y: { display: false }, x: { grid: { display: false } } },
        elements: { line: { tension: 0.4 }, point: { radius: 0 } },
        maintainAspectRatio: false, // Allows chart to fill the flex container
        responsive: true
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
                backgroundColor: 'rgba(30, 64, 175, 0.1)', // Theme blue, transparent
                borderColor: '#1e40af' // Theme blue
            }]
        },
        options: commonOptions
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
                backgroundColor: 'rgba(148, 163, 184, 0.2)', // Slate gray
                borderColor: '#64748b'
            }]
        },
        options: commonOptions
    });


    // --- 4. Property Detail Line Chart (Injected into Left Sidebar) ---
    let valuationChartInstance = null;

    function initValuationChart() {
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
                        borderDash: ctx => ctx.p0.parsed.x >= 2 ? [5, 5] : undefined
                    }
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { 
                    y: { 
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) { return '$' + value / 1000 + 'k'; }
                        }
                    } 
                },
                maintainAspectRatio: false
            }
        });
    }
});