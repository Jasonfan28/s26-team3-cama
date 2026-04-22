document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn");
  const opaInput = document.getElementById("opa-input");

  const propertyHeader = document.getElementById("property-header");
  const chartSection = document.getElementById("chart-section");
  const tableSection = document.getElementById("table-section");

  const addressEl = document.getElementById("address");
  const metaEl = document.getElementById("meta");
  const currentValueEl = document.getElementById("current-value");
  const tableBody = document.getElementById("table-body");

  let chartInstance = null;

  // MOCK DATA
  const data = {
    "883309000": {
      address: "238 W CLAPIER ST",
      meta: "Philadelphia, PA",
      current: "$185,000",
      history: [
        { year: "2022", value: 98000, land: "$28,000", improve: "$70,000" },
        { year: "2023", value: 152000, land: "$30,400", improve: "$121,600" },
        { year: "2024", value: 185000, land: "$33,000", improve: "$152,000" },
      ],
    },
  };

  function renderChart(history) {
    const ctx = document.getElementById("valuationChart").getContext("2d");

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: history.map(d => d.year),
        datasets: [{
          data: history.map(d => d.value),
          borderColor: "#1e40af",
          borderWidth: 2,
        }],
      },
      options: {
        plugins: { legend: { display: false } },
      },
    });
  }

  function renderTable(history) {
    tableBody.innerHTML = history.map(d => `
      <tr>
        <td>${d.year}</td>
        <td>$${d.value.toLocaleString()}</td>
        <td>${d.land}</td>
        <td>${d.improve}</td>
      </tr>
    `).join("");
  }

  searchBtn.addEventListener("click", () => {
    const opa = opaInput.value.trim();
    const property = data[opa];

    if (!property) {
      alert("No data found for that OPA ID.");
      return;
    }

    // show sections
    propertyHeader.style.display = "block";
    chartSection.style.display = "block";
    tableSection.style.display = "block";

    // populate
    addressEl.textContent = property.address;
    metaEl.textContent = property.meta;
    currentValueEl.textContent = property.current;

    renderChart(property.history);
    renderTable(property.history);
  });
});