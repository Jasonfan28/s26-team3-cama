document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Map
    const map = L.map('map').setView([39.9526, -75.1652], 13); // Centered on Philly
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // Add a sample marker (Sesame St example from wireframe)
    const marker = L.marker([39.9526, -75.1652]).addTo(map);
    marker.bindPopup(`
        <strong>1234 Sesame St</strong><br>
        Current: $275,400<br>
        2023: $225,200<br>
        Change: ↑ 22.3%
    `).openPopup();

    // Interaction: Clicking the marker opens the detail modal
    marker.on('click', () => {
        document.getElementById('detailModal').style.display = 'block';
        initValuationChart();
    });

    // 2. Initialize Sidebar Distribution Charts
    const commonOptions = {
        plugins: { legend: { display: false } },
        scales: { y: { display: false }, x: { grid: { display: false } } },
        elements: { line: { tension: 0.4 }, point: { radius: 0 } }
    };

    // Assessment Value Distribution
    new Chart(document.getElementById('distChart'), {
        type: 'line',
        data: {
            labels: [0, 1, 2, 3, 4, 5],
            datasets: [{
                data: [5, 40, 60, 45, 20, 5],
                fill: true,
                backgroundColor: 'rgba(200, 200, 200, 0.5)',
                borderColor: '#888'
            }]
        },
        options: commonOptions
    });

    // Percent Change Distribution
    new Chart(document.getElementById('changeChart'), {
        type: 'line',
        data: {
            labels: [-50, 0, 50, 100, 150, 200],
            datasets: [{
                data: [2, 10, 70, 40, 15, 5],
                fill: true,
                backgroundColor: 'rgba(200, 200, 200, 0.5)',
                borderColor: '#888'
            }]
        },
        options: commonOptions
    });

    // 3. Modal Functionality
    const modal = document.getElementById('detailModal');
    document.querySelector('.close-btn').onclick = () => modal.style.display = 'none';
    window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };

    // 4. Property Detail Line Chart (Image 2)
    function initValuationChart() {
        const ctx = document.getElementById('valuationLineChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['2022', '', '2023', '', '2024'],
                datasets: [{
                    label: 'Valuation',
                    data: [46000, 55000, 152000, 160000, 180000],
                    borderColor: '#4a90e2',
                    fill: false,
                    borderDash: [5, 5], // Example of projected dashed line
                    segment: {
                        borderDash: ctx => ctx.p0.parsed.x >= 2 ? [5, 5] : undefined
                    }
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: false } }
            }
        });
    }
});
