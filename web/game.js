const scenarioSeed = {
  neighborhoods: [
    { id: "alexanderplatz", name: "Alexanderplatz", demandPressure: 0.9, incomeMix: "high" },
    { id: "wedding_edge", name: "Wedding edge", demandPressure: 0.68, incomeMix: "mixed" },
    { id: "spree_office", name: "Spree office belt", demandPressure: 0.82, incomeMix: "high" },
    { id: "museum_quarter", name: "Museum quarter", demandPressure: 0.76, incomeMix: "tourism" },
    { id: "north_mitte", name: "North Mitte", demandPressure: 0.61, incomeMix: "mixed" },
    { id: "rosenthaler", name: "Rosenthaler edge", demandPressure: 0.86, incomeMix: "high" },
    { id: "tiergarten_edge", name: "Tiergarten edge", demandPressure: 0.7, incomeMix: "mixed" },
    { id: "public_anchor", name: "Public anchor", demandPressure: 0.58, incomeMix: "protected" },
  ],
  owners: [
    { id: "owner_private_001", kind: "private", riskTolerance: 0.62, socialMission: 0.1 },
    { id: "owner_coop_001", kind: "cooperative", riskTolerance: 0.28, socialMission: 0.86 },
    { id: "owner_company_001", kind: "company", riskTolerance: 0.78, socialMission: 0.05 },
    { id: "owner_public_001", kind: "public", riskTolerance: 0.12, socialMission: 0.95 },
  ],
  units: [
    unit("unit_001", "alexanderplatz", "owner_private_001", 62, 1050, 455000, true, false, 4200, 2, 0.34),
    unit("unit_002", "alexanderplatz", "owner_private_001", 88, 1680, 690000, false, true, 0, 1, 0.34),
    unit("unit_003", "wedding_edge", "owner_coop_001", 54, 690, 310000, true, false, 2350, 1, 0.36),
    unit("unit_004", "spree_office", "owner_company_001", 74, 1420, 590000, false, false, 3900, 2, 0.33),
    unit("unit_005", "museum_quarter", "owner_company_001", 44, 980, 405000, false, true, 0, 1, 0.35),
    unit("unit_006", "north_mitte", "owner_private_001", 71, 1010, 430000, true, false, 2950, 2, 0.35),
    unit("unit_007", "rosenthaler", "owner_company_001", 93, 2140, 820000, false, false, 6200, 2, 0.32),
    unit("unit_008", "tiergarten_edge", "owner_private_001", 58, 890, 380000, true, false, 2700, 1, 0.35),
    unit("unit_009", "public_anchor", "owner_public_001", 67, 620, 300000, true, false, 2100, 1, 0.38),
    unit("unit_010", "public_anchor", "owner_public_001", 49, 510, 245000, true, false, 1850, 1, 0.38),
  ],
};

const mapShapes = {
  north_mitte: {
    label: "North Mitte",
    path: "M210 38 L350 54 L384 126 L332 188 L202 168 L162 92 Z",
    labelX: 272,
    labelY: 108,
  },
  wedding_edge: {
    label: "Wedding edge",
    path: "M76 112 L162 92 L202 168 L172 276 L72 264 L38 182 Z",
    labelX: 122,
    labelY: 192,
  },
  rosenthaler: {
    label: "Rosenthaler edge",
    path: "M384 126 L506 104 L580 166 L548 254 L430 242 L332 188 Z",
    labelX: 472,
    labelY: 182,
  },
  museum_quarter: {
    label: "Museum quarter",
    path: "M202 168 L332 188 L430 242 L398 330 L262 348 L172 276 Z",
    labelX: 304,
    labelY: 260,
  },
  alexanderplatz: {
    label: "Alexanderplatz",
    path: "M430 242 L548 254 L610 346 L546 432 L406 410 L398 330 Z",
    labelX: 493,
    labelY: 334,
  },
  tiergarten_edge: {
    label: "Tiergarten edge",
    path: "M72 264 L172 276 L262 348 L220 448 L92 430 L36 340 Z",
    labelX: 148,
    labelY: 354,
  },
  public_anchor: {
    label: "Public anchor",
    path: "M262 348 L398 330 L406 410 L344 496 L218 474 L220 448 Z",
    labelX: 312,
    labelY: 416,
  },
  spree_office: {
    label: "Spree office belt",
    path: "M344 496 L406 410 L546 432 L648 508 L586 580 L430 572 Z",
    labelX: 494,
    labelY: 506,
  },
};

const simulationMethods = {
  agent_based: {
    label: "Agent-based",
    description: "Heterogeneous units, owners, and households update every month from local rules.",
  },
  markov_chain: {
    label: "Markov chain",
    description: "A time-independent state machine samples market regimes from transition probabilities.",
  },
  mcmc_state: {
    label: "MCMC state sampler",
    description: "A Metropolis-Hastings sampler explores plausible market regimes from target weights.",
  },
};

const marketRegimeEffects = {
  stable_affordable: {
    label: "Stable affordable",
    demand: 0.52,
    rentMultiplier: 1.0,
    saleMultiplier: 1.0,
    vacancy: 0.06,
    stress: 0.12,
  },
  rent_pressure: {
    label: "Rent pressure",
    demand: 0.78,
    rentMultiplier: 1.18,
    saleMultiplier: 1.08,
    vacancy: 0.04,
    stress: 0.35,
  },
  purchase_pressure: {
    label: "Purchase pressure",
    demand: 0.82,
    rentMultiplier: 1.08,
    saleMultiplier: 1.24,
    vacancy: 0.05,
    stress: 0.22,
  },
  vacancy_pressure: {
    label: "Vacancy pressure",
    demand: 0.7,
    rentMultiplier: 1.1,
    saleMultiplier: 1.16,
    vacancy: 0.18,
    stress: 0.26,
  },
  displacement_pressure: {
    label: "Displacement pressure",
    demand: 0.9,
    rentMultiplier: 1.28,
    saleMultiplier: 1.18,
    vacancy: 0.09,
    stress: 0.68,
  },
  speculative_conversion: {
    label: "Speculative conversion",
    demand: 0.86,
    rentMultiplier: 1.14,
    saleMultiplier: 1.38,
    vacancy: 0.14,
    stress: 0.48,
  },
  public_stabilized: {
    label: "Public stabilized",
    demand: 0.42,
    rentMultiplier: 0.92,
    saleMultiplier: 0.88,
    vacancy: 0.03,
    stress: 0.08,
  },
};

const markovTransitions = {
  stable_affordable: [
    ["stable_affordable", 0.46],
    ["rent_pressure", 0.18],
    ["purchase_pressure", 0.16],
    ["public_stabilized", 0.2],
  ],
  rent_pressure: [
    ["rent_pressure", 0.38],
    ["displacement_pressure", 0.24],
    ["speculative_conversion", 0.18],
    ["public_stabilized", 0.2],
  ],
  purchase_pressure: [
    ["purchase_pressure", 0.4],
    ["speculative_conversion", 0.28],
    ["rent_pressure", 0.16],
    ["stable_affordable", 0.16],
  ],
  vacancy_pressure: [
    ["vacancy_pressure", 0.36],
    ["rent_pressure", 0.2],
    ["speculative_conversion", 0.22],
    ["public_stabilized", 0.22],
  ],
  displacement_pressure: [
    ["displacement_pressure", 0.42],
    ["vacancy_pressure", 0.18],
    ["public_stabilized", 0.24],
    ["rent_pressure", 0.16],
  ],
  speculative_conversion: [
    ["speculative_conversion", 0.44],
    ["purchase_pressure", 0.22],
    ["displacement_pressure", 0.18],
    ["public_stabilized", 0.16],
  ],
  public_stabilized: [
    ["public_stabilized", 0.5],
    ["stable_affordable", 0.24],
    ["rent_pressure", 0.14],
    ["purchase_pressure", 0.12],
  ],
};

const mcmcTargetWeights = {
  stable_affordable: 0.16,
  rent_pressure: 0.18,
  purchase_pressure: 0.16,
  vacancy_pressure: 0.1,
  displacement_pressure: 0.14,
  speculative_conversion: 0.14,
  public_stabilized: 0.12,
};

const state = {
  month: 0,
  method: "agent_based",
  marketRegime: "stable_affordable",
  chartMode: "overall",
  selectedNeighborhood: "alexanderplatz",
  playing: false,
  timer: null,
  events: [],
  history: [],
  policy: {
    rentControl: 0.55,
    vacancyEnforcement: 0.4,
    publicAcquisition: 0.2,
    investorPressure: 0.68,
  },
  neighborhoods: [],
  owners: [],
  units: [],
};

const controls = {
  methodControl: document.querySelector("#methodControl"),
  chartModeControl: document.querySelector("#chartModeControl"),
  rentControl: document.querySelector("#rentControl"),
  vacancyControl: document.querySelector("#vacancyControl"),
  publicControl: document.querySelector("#publicControl"),
  investorControl: document.querySelector("#investorControl"),
};

function unit(id, neighborhoodId, ownerId, sqm, rent, salePrice, regulated, vacant, income, size, tolerance) {
  return {
    id,
    neighborhoodId,
    ownerId,
    sqm,
    rent,
    baseRent: rent,
    salePrice,
    baseSalePrice: salePrice,
    regulated,
    vacant,
    household: income > 0 ? { income, size, tolerance, stress: 0 } : null,
    convertedToSale: false,
  };
}

function resetGame() {
  state.month = 0;
  state.marketRegime = "stable_affordable";
  state.events = [];
  state.history = [];
  state.neighborhoods = structuredClone(scenarioSeed.neighborhoods);
  state.owners = structuredClone(scenarioSeed.owners);
  state.units = structuredClone(scenarioSeed.units);
  collectMetrics();
  render();
}

function stepGame() {
  state.month += 1;
  if (state.method === "agent_based") {
    updateDemand();
    updateOwnersAndUnits();
    updateHouseholds();
  } else {
    updateStateMachine();
  }
  collectMetrics();
  render();
}

function updateStateMachine() {
  state.marketRegime =
    state.method === "mcmc_state"
      ? sampleMCMCRegime(state.marketRegime)
      : sampleMarkovRegime(state.marketRegime);
  const effect = marketRegimeEffects[state.marketRegime];
  for (const area of state.neighborhoods) {
    area.demandPressure = clamp(area.demandPressure * 0.65 + effect.demand * 0.35, 0.25, 1);
  }
  for (const currentUnit of state.units) {
    const owner = state.owners.find((item) => item.id === currentUnit.ownerId);
    const missionModifier = 1 - owner.socialMission * 0.12;
    currentUnit.rent = currentUnit.baseRent * effect.rentMultiplier * missionModifier;
    currentUnit.salePrice = currentUnit.baseSalePrice * effect.saleMultiplier * missionModifier;
    currentUnit.vacant = stableHash(`${state.marketRegime}-${currentUnit.id}`) < effect.vacancy;
    if (currentUnit.household) {
      currentUnit.household.stress = effect.stress;
    }
  }
  pushEvent(`${simulationMethods[state.method].label} regime: ${effect.label}.`);
}

function sampleMarkovRegime(currentRegime) {
  const draw = Math.random();
  let cumulative = 0;
  for (const [nextRegime, probability] of markovTransitions[currentRegime]) {
    cumulative += probability;
    if (draw <= cumulative) return nextRegime;
  }
  return markovTransitions[currentRegime].at(-1)[0];
}

function sampleMCMCRegime(currentRegime) {
  const proposals = markovTransitions[currentRegime].map(([regime]) => regime);
  const proposal = proposals[Math.floor(Math.random() * proposals.length)];
  const acceptance = Math.min(
    1,
    mcmcTargetWeights[proposal] / Math.max(mcmcTargetWeights[currentRegime], 0.0001),
  );
  return Math.random() <= acceptance ? proposal : currentRegime;
}

function updateDemand() {
  for (const area of state.neighborhoods) {
    const investorPull = state.policy.investorPressure * 0.006;
    const protection = state.policy.publicAcquisition * 0.003;
    area.demandPressure = clamp(area.demandPressure + investorPull - protection, 0.25, 1);
  }
}

function updateOwnersAndUnits() {
  for (const currentUnit of state.units) {
    const owner = state.owners.find((item) => item.id === currentUnit.ownerId);
    const area = getNeighborhood(currentUnit.neighborhoodId);
    const regulation = currentUnit.regulated ? state.policy.rentControl : state.policy.rentControl * 0.25;
    const marketRentGrowth = area.demandPressure * owner.riskTolerance * 0.012;
    const allowedRentGrowth = marketRentGrowth * (1 - regulation * 0.78);

    currentUnit.rent *= 1 + Math.max(0.001, allowedRentGrowth);
    currentUnit.salePrice *= 1 + area.demandPressure * (1 - owner.socialMission) * state.policy.investorPressure * 0.011;

    const vacancyReleaseChance = state.policy.vacancyEnforcement * 0.08;
    if (currentUnit.vacant && Math.random() < vacancyReleaseChance) {
      currentUnit.vacant = false;
      currentUnit.household = {
        income: currentUnit.rent / 0.34,
        size: 1,
        tolerance: 0.34,
        stress: 0.08,
      };
      pushEvent(`${area.name}: vacancy enforcement returned ${currentUnit.id} to rental supply.`);
    }

    const conversionPressure =
      area.demandPressure * owner.riskTolerance * state.policy.investorPressure -
      state.policy.rentControl * 0.22 -
      owner.socialMission * 0.3;
    if (!currentUnit.convertedToSale && !currentUnit.regulated && conversionPressure > 0.55) {
      currentUnit.convertedToSale = true;
      currentUnit.salePrice *= 1.035;
      pushEvent(`${area.name}: ${currentUnit.id} shifted toward the purchase market.`);
    }
  }
}

function updateHouseholds() {
  for (const currentUnit of state.units) {
    if (!currentUnit.household) continue;
    const burden = currentUnit.rent / Math.max(currentUnit.household.income, 1);
    const stressDelta = (burden - currentUnit.household.tolerance) * 0.22;
    currentUnit.household.stress = clamp(currentUnit.household.stress + stressDelta, 0, 1);

    if (currentUnit.household.stress > 0.82 && Math.random() < 0.08) {
      currentUnit.vacant = true;
      currentUnit.household = null;
      pushEvent(`${getNeighborhood(currentUnit.neighborhoodId).name}: a household was displaced.`);
    }
  }
}

function collectMetrics() {
  const rents = state.units.map((item) => item.rent / item.sqm);
  const sales = state.units.map((item) => item.salePrice / item.sqm);
  const occupiedUnits = state.units.filter((item) => item.household && !item.vacant);
  const households = occupiedUnits.map((item) => item.household);
  const stresses = households.map((item) => item.stress);
  const individualIncomes = households.map((item) => item.income / Math.max(item.size, 1));
  const rentBurdens = occupiedUnits.map((item) => item.rent / Math.max(item.household.income, 1));
  const averageIndividualIncome = individualIncomes.length ? average(individualIncomes) : 0;
  const regimeEffect =
    state.method === "markov_chain" || state.method === "mcmc_state"
      ? marketRegimeEffects[state.marketRegime]
      : null;
  state.history.push({
    month: state.month,
    rent: median(rents),
    sale: median(sales),
    vacancy: regimeEffect
      ? regimeEffect.vacancy
      : state.units.filter((item) => item.vacant).length / state.units.length,
    stress: regimeEffect ? regimeEffect.stress : stresses.length ? average(stresses) : 0,
    averageIndividualIncome,
    rentBurden: rentBurdens.length ? average(rentBurdens) : 0,
    buyYears: median(state.units.map((item) => item.salePrice)) / Math.max(averageIndividualIncome * 12, 1),
    regulatedShare: state.units.filter((item) => item.regulated).length / state.units.length,
    method: state.method,
    regime: state.marketRegime,
  });
}

function render() {
  const latest = state.history[state.history.length - 1];
  document.querySelector("#monthMetric").textContent = latest.month;
  document.querySelector("#rentMetric").textContent = euro(latest.rent) + "/sqm";
  document.querySelector("#saleMetric").textContent = euro(latest.sale) + "/sqm";
  document.querySelector("#vacancyMetric").textContent = percent(latest.vacancy);
  document.querySelector("#stressMetric").textContent = percent(latest.stress);
  document.querySelector("#incomeMetric").textContent = euro(latest.averageIndividualIncome);
  document.querySelector("#burdenMetric").textContent = percent(latest.rentBurden);
  document.querySelector("#buyYearsMetric").textContent = `${latest.buyYears.toFixed(1)}y`;
  document.querySelector("#eventCount").textContent = state.events.length;
  document.querySelector("#selectedName").textContent =
    state.method === "markov_chain" || state.method === "mcmc_state"
      ? `${getNeighborhood(state.selectedNeighborhood).name} · ${marketRegimeEffects[state.marketRegime].label}`
      : getNeighborhood(state.selectedNeighborhood).name;

  renderControls();
  renderMap();
  renderDetails();
  renderEvents();
  drawChart();
}

function renderControls() {
  controls.methodControl.value = state.method;
  controls.chartModeControl.value = state.chartMode;
  document.querySelector("#methodDescription").textContent =
    state.method === "markov_chain" || state.method === "mcmc_state"
      ? `${simulationMethods[state.method].description} Current regime: ${marketRegimeEffects[state.marketRegime].label}.`
      : simulationMethods[state.method].description;
  const pairs = [
    ["rentControl", "rentControlValue"],
    ["vacancyControl", "vacancyControlValue"],
    ["publicControl", "publicControlValue"],
    ["investorControl", "investorControlValue"],
  ];
  for (const [controlId, outputId] of pairs) {
    document.querySelector(`#${outputId}`).textContent = `${document.querySelector(`#${controlId}`).value}%`;
  }
}

function renderMap() {
  const mapGrid = document.querySelector("#mapGrid");
  mapGrid.innerHTML = "";
  mapGrid.className = "map-canvas";
  const areas = state.neighborhoods
    .map((area) => {
      const shape = mapShapes[area.id];
      const selected = area.id === state.selectedNeighborhood;
      const fill = demandColor(area.demandPressure);
      return `
        <g
          class="map-area ${selected ? "selected" : ""}"
          data-id="${area.id}"
          tabindex="0"
          role="button"
          aria-label="${shape.label}, ${percent(area.demandPressure)} demand"
        >
          <title>${shape.label}: ${percent(area.demandPressure)} demand pressure. Click to inspect local units.</title>
          <path d="${shape.path}" fill="${fill}"></path>
          <text x="${shape.labelX}" y="${shape.labelY}" text-anchor="middle">
            <tspan x="${shape.labelX}" dy="0">${shape.label}</tspan>
            <tspan x="${shape.labelX}" dy="18">${percent(area.demandPressure)} demand</tspan>
          </text>
        </g>
      `;
    })
    .join("");

  mapGrid.innerHTML = `
    <svg class="mitte-map" viewBox="0 0 690 620" role="img" aria-label="Stylized Mitte real estate simulation map">
      <rect class="map-water" x="30" y="476" width="640" height="42" rx="21"></rect>
      <path class="map-river" d="M42 500 C154 452 238 520 342 482 C446 444 520 464 652 522"></path>
      <path class="map-ring" d="M72 112 L210 38 L350 54 L506 104 L610 346 L648 508 L586 580 L430 572 L218 474 L92 430 L36 340 L38 182 Z"></path>
      ${areas}
      <g class="map-place-labels" aria-hidden="true">
        <text x="84" y="92">north-west edge</text>
        <text x="594" y="132">east edge</text>
        <text x="590" y="548">Spree / office belt</text>
      </g>
    </svg>
    <div class="map-legend" aria-label="map legend">
      <span><i class="low"></i>Lower demand</span>
      <span><i class="high"></i>Higher demand</span>
      <span><i class="line"></i>Spree corridor</span>
    </div>
  `;

  for (const areaShape of mapGrid.querySelectorAll(".map-area")) {
    areaShape.addEventListener("click", () => selectNeighborhood(areaShape.dataset.id));
    areaShape.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectNeighborhood(areaShape.dataset.id);
      }
    });
  }
}

function selectNeighborhood(id) {
  state.selectedNeighborhood = id;
  render();
}

function demandColor(value) {
  const lightness = 89 - value * 32;
  const saturation = 38 + value * 32;
  return `hsl(8 ${saturation}% ${lightness}%)`;
}

function renderDetails() {
  const area = getNeighborhood(state.selectedNeighborhood);
  const units = state.units.filter((item) => item.neighborhoodId === area.id);
  const rents = units.map((item) => item.rent / item.sqm);
  const sales = units.map((item) => item.salePrice / item.sqm);
  const occupiedUnits = units.filter((item) => item.household && !item.vacant);
  const stress = occupiedUnits.map((item) => item.household.stress);
  const individualIncomes = units
    .filter((item) => item.household && !item.vacant)
    .map((item) => item.household.income / Math.max(item.household.size, 1));
  const rentBurdens = units
    .filter((item) => item.household && !item.vacant)
    .map((item) => item.rent / Math.max(item.household.income, 1));
  const details = document.querySelector("#areaDetails");
  details.innerHTML = `
    <dt>Method</dt><dd>${simulationMethods[state.method].label}</dd>
    <dt>Regime</dt><dd>${state.method === "agent_based" ? "monthly rules" : marketRegimeEffects[state.marketRegime].label}</dd>
    <dt>Demand pressure</dt><dd>${percent(area.demandPressure)}</dd>
    <dt>Income mix</dt><dd>${area.incomeMix}</dd>
    <dt>Avg income/person</dt><dd>${euro(individualIncomes.length ? average(individualIncomes) : 0)}</dd>
    <dt>Avg rent burden</dt><dd>${percent(rentBurdens.length ? average(rentBurdens) : 0)}</dd>
    <dt>Median rent</dt><dd>${euro(median(rents))}/sqm</dd>
    <dt>Median sale</dt><dd>${euro(median(sales))}/sqm</dd>
    <dt>Vacant units</dt><dd>${units.filter((item) => item.vacant).length}/${units.length}</dd>
    <dt>Local stress</dt><dd>${percent(stress.length ? average(stress) : 0)}</dd>
  `;

  const list = document.querySelector("#unitList");
  list.innerHTML = "";
  for (const currentUnit of units) {
    const row = document.createElement("div");
    row.className = "unit-row";
    row.innerHTML = `
      <strong>${currentUnit.id} · ${currentUnit.sqm} sqm</strong>
      <span class="tag">${currentUnit.vacant ? "vacant" : currentUnit.regulated ? "regulated" : "market"}</span>
      <span>${euro(currentUnit.rent)} rent</span>
      <span>${euro(currentUnit.salePrice / currentUnit.sqm)}/sqm sale</span>
      <span>${currentUnit.household && !currentUnit.vacant ? euro(currentUnit.household.income / Math.max(currentUnit.household.size, 1)) : "-"} income/person</span>
    `;
    list.append(row);
  }
}

function renderEvents() {
  const eventLog = document.querySelector("#eventLog");
  eventLog.innerHTML = "";
  for (const event of state.events.slice(-12).reverse()) {
    const item = document.createElement("li");
    item.textContent = event;
    eventLog.append(item);
  }
}

function drawChart() {
  const canvas = document.querySelector("#marketChart");
  const viewport = document.querySelector("#chartViewport");
  const previousScrollLeft = viewport.scrollLeft;
  const wasAtEnd =
    viewport.scrollWidth <= viewport.clientWidth ||
    viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 4;
  const isTimeSeries = state.chartMode === "time_series";
  const chartWidth =
    isTimeSeries
      ? Math.max(900, 100 + Math.max(state.history.length - 1, 1) * 48)
      : 900;
  canvas.width = chartWidth;
  viewport.classList.toggle("scrollable", isTimeSeries);
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fffefa";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#d9d7ca";
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i += 1) {
    const y = (height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(36, y);
    ctx.lineTo(width - 12, y);
    ctx.stroke();
  }

  drawSeries(ctx, "rent", "#2f7d5b", scaleValues(state.history.map((item) => item.rent)), width, height);
  drawSeries(ctx, "sale", "#386d9f", scaleValues(state.history.map((item) => item.sale)), width, height);
  drawSeries(ctx, "vacancy", "#b98321", state.history.map((item) => item.vacancy), width, height);
  drawSeries(ctx, "stress", "#b44435", state.history.map((item) => item.stress), width, height);
  drawSeries(ctx, "burden", "#7b5aa6", state.history.map((item) => item.rentBurden), width, height);
  if (isTimeSeries) {
    drawTimeAxis(ctx, width, height);
  }
  drawLegend(ctx);

  if (isTimeSeries) {
    viewport.scrollLeft = wasAtEnd ? viewport.scrollWidth : previousScrollLeft;
  } else {
    viewport.scrollLeft = 0;
  }
}

function drawSeries(ctx, label, color, values, width, height) {
  if (values.length < 2) return;
  const left = 36;
  const right = width - 16;
  const top = 18;
  const bottom = height - 28;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = left + ((right - left) * index) / Math.max(values.length - 1, 1);
    const y = bottom - clamp(value, 0, 1) * (bottom - top);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

function drawTimeAxis(ctx, width, height) {
  const left = 36;
  const right = width - 16;
  const bottom = height - 28;
  const step = Math.max(1, Math.ceil(state.history.length / 12));
  ctx.strokeStyle = "#d9d7ca";
  ctx.fillStyle = "#66716b";
  ctx.font = "12px sans-serif";
  state.history.forEach((point, index) => {
    if (index % step !== 0 && index !== state.history.length - 1) return;
    const x = left + ((right - left) * index) / Math.max(state.history.length - 1, 1);
    ctx.beginPath();
    ctx.moveTo(x, bottom + 4);
    ctx.lineTo(x, bottom + 10);
    ctx.stroke();
    ctx.fillText(`M${point.month}`, x - 10, bottom + 24);
  });
}

function drawLegend(ctx) {
  const items = [
    ["rent", "#2f7d5b"],
    ["sale", "#386d9f"],
    ["vacancy", "#b98321"],
    ["stress", "#b44435"],
    ["burden", "#7b5aa6"],
  ];
  ctx.font = "13px sans-serif";
  items.forEach(([label, color], index) => {
    const x = 42 + index * 82;
    ctx.fillStyle = color;
    ctx.fillRect(x, 12, 12, 12);
    ctx.fillStyle = "#222826";
    ctx.fillText(label, x + 18, 23);
  });
}

function scaleValues(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0.5);
  return values.map((value) => (value - min) / (max - min));
}

function getNeighborhood(id) {
  return state.neighborhoods.find((item) => item.id === id);
}

function pushEvent(text) {
  state.events.push(`Month ${state.month}: ${text}`);
}

function stableHash(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1000;
  }
  return hash / 1000;
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function euro(value) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: value > 100 ? 0 : 2,
  }).format(value);
}

function percent(value) {
  return `${Math.round(value * 100)}%`;
}

document.querySelector("#stepBtn").addEventListener("click", stepGame);
document.querySelector("#playBtn").addEventListener("click", () => {
  state.playing = !state.playing;
  document.querySelector("#playBtn").textContent = state.playing ? "Pause" : "Play";
  if (state.playing) {
    state.timer = window.setInterval(stepGame, 700);
  } else {
    window.clearInterval(state.timer);
  }
});
document.querySelector("#resetBtn").addEventListener("click", () => {
  state.playing = false;
  window.clearInterval(state.timer);
  document.querySelector("#playBtn").textContent = "Play";
  resetGame();
});

controls.methodControl.addEventListener("change", (event) => {
  state.method = event.target.value;
  resetGame();
  pushEvent(`Simulation method switched to ${simulationMethods[state.method].label}.`);
  render();
});

controls.chartModeControl.addEventListener("change", (event) => {
  state.chartMode = event.target.value;
  render();
});

controls.rentControl.addEventListener("input", (event) => {
  state.policy.rentControl = Number(event.target.value) / 100;
  render();
});
controls.vacancyControl.addEventListener("input", (event) => {
  state.policy.vacancyEnforcement = Number(event.target.value) / 100;
  render();
});
controls.publicControl.addEventListener("input", (event) => {
  state.policy.publicAcquisition = Number(event.target.value) / 100;
  render();
});
controls.investorControl.addEventListener("input", (event) => {
  state.policy.investorPressure = Number(event.target.value) / 100;
  render();
});

resetGame();
