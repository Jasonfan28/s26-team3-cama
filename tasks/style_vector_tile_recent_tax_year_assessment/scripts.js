/* eslint-disable no-undef */

const TAX_YEAR_BINS_URL = 'https://storage.googleapis.com/musa5090s26-team3-public/configs/tax_year_assessment_bins.json';
const TILE_URL = 'https://storage.googleapis.com/musa5090s26-team3-public/tiles/{z}/{x}/{y}.pbf';
const LAYER_NAME = 'property_tile_info';

// Color ramp: light yellow → dark red (low → high value)
const COLORS = ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];

const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      'carto-light': {
        type: 'raster',
        tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '© OpenStreetMap contributors, © CARTO',
      },
    },
    layers: [{ id: 'carto-light-layer', type: 'raster', source: 'carto-light' }],
  },
  center: [-75.1652, 39.9526],
  zoom: 13,
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');

async function loadTiles() {
  // Load bins to find most recent year's breakpoints dynamically
  const res = await fetch(TAX_YEAR_BINS_URL);
  const bins = await res.json();

  // Get max tax year
  const maxYear = Math.max(...bins.map(b => b.tax_year));
  const yearBins = bins.filter(b => b.tax_year === maxYear);

  // Compute cumulative property counts to find quintile breakpoints
  const total = yearBins.reduce((sum, b) => sum + b.property_count, 0);
  let cumulative = 0;
  const quintiles = [0.2, 0.4, 0.6, 0.8];
  const breakpoints = [0];
  let qi = 0;
  for (const bin of yearBins) {
    cumulative += bin.property_count;
    if (qi < quintiles.length && cumulative / total >= quintiles[qi]) {
      breakpoints.push(bin.upper_bound);
      qi++;
    }
  }

  const colorExpression = [
    'step',
    ['get', 'tax_year_assessed_value'],
    COLORS[0],
    breakpoints[1], COLORS[1],
    breakpoints[2], COLORS[2],
    breakpoints[3], COLORS[3],
    breakpoints[4] || 500000, COLORS[4],
  ];

  map.addSource('properties', {
    type: 'vector',
    tiles: [TILE_URL],
    minzoom: 12,
    maxzoom: 18,
  });

  map.addLayer({
    id: 'properties-layer',
    type: 'fill',
    source: 'properties',
    'source-layer': LAYER_NAME,
    paint: {
      'fill-color': colorExpression,
      'fill-opacity': 0.7,
      'fill-outline-color': '#333',
    },
  });

  // Popup on click
  map.on('click', 'properties-layer', (e) => {
    const props = e.features[0].properties;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <strong>${props.address || 'No address'}</strong><br/>
        <b>Tax Year Assessment:</b> $${Number(props.tax_year_assessed_value || 0).toLocaleString()}<br/>
        <b>Current Assessment:</b> $${Number(props.current_assessed_value || 0).toLocaleString()}
      `)
      .addTo(map);
  });

  map.on('mouseenter', 'properties-layer', () => map.getCanvas().style.cursor = 'pointer');
  map.on('mouseleave', 'properties-layer', () => map.getCanvas().style.cursor = '');

  // Build legend
  const legendItems = document.getElementById('legend-items');
  const labels = [
    '< $' + breakpoints[1]?.toLocaleString(),
    '$' + breakpoints[1]?.toLocaleString(),
    '$' + breakpoints[2]?.toLocaleString(),
    '$' + breakpoints[3]?.toLocaleString(),
    '$' + (breakpoints[4] || 500000).toLocaleString() + '+',
  ];
  COLORS.forEach((color, i) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<div class="legend-swatch" style="background:${color}"></div><span>${labels[i]}</span>`;
    legendItems.appendChild(item);
  });
}

map.on('load', loadTiles);