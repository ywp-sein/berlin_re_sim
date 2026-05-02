const methods = {
  agent_based: { label: "Agent-based", color: "#2f7d5b", step: "month" },
  analytical: { label: "Analytical", color: "#7b5aa6", step: "iteration" },
  markov_chain: { label: "Markov chain", color: "#386d9f", step: "transition" },
  mcmc_state: { label: "MCMC state", color: "#b44435", step: "sample" },
};

const comparisonSeed = {
  neighborhoods: [
    { id: "alexanderplatz", demandPressure: 0.9 },
    { id: "wedding_edge", demandPressure: 0.68 },
    { id: "spree_office", demandPressure: 0.82 },
    { id: "museum_quarter", demandPressure: 0.76 },
    { id: "north_mitte", demandPressure: 0.61 },
    { id: "rosenthaler", demandPressure: 0.86 },
    { id: "tiergarten_edge", demandPressure: 0.7 },
    { id: "public_anchor", demandPressure: 0.58 },
  ],
  owners: [
    { id: "owner_private_001", riskTolerance: 0.62, socialMission: 0.1 },
    { id: "owner_coop_001", riskTolerance: 0.28, socialMission: 0.86 },
    { id: "owner_company_001", riskTolerance: 0.78, socialMission: 0.05 },
    { id: "owner_public_001", riskTolerance: 0.12, socialMission: 0.95 },
  ],
  units: [
    unit("alexanderplatz", "owner_private_001", 62, 1050, 455000, true, false, 4200, 2, 0.34),
    unit("alexanderplatz", "owner_private_001", 88, 1680, 690000, false, true, 0, 1, 0.34),
    unit("wedding_edge", "owner_coop_001", 54, 690, 310000, true, false, 2350, 1, 0.36),
    unit("spree_office", "owner_company_001", 74, 1420, 590000, false, false, 3900, 2, 0.33),
    unit("museum_quarter", "owner_company_001", 44, 980, 405000, false, true, 0, 1, 0.35),
    unit("north_mitte", "owner_private_001", 71, 1010, 430000, true, false, 2950, 2, 0.35),
    unit("rosenthaler", "owner_company_001", 93, 2140, 820000, false, false, 6200, 2, 0.32),
    unit("tiergarten_edge", "owner_private_001", 58, 890, 380000, true, false, 2700, 1, 0.35),
    unit("public_anchor", "owner_public_001", 67, 620, 300000, true, false, 2100, 1, 0.38),
    unit("public_anchor", "owner_public_001", 49, 510, 245000, true, false, 1850, 1, 0.38),
  ],
};

const influences = [
  ["alexanderplatz", "museum_quarter", 0.62, 1],
  ["alexanderplatz", "rosenthaler", 0.58, 1],
  ["rosenthaler", "north_mitte", 0.46, 1],
  ["museum_quarter", "tiergarten_edge", 0.4, 1],
  ["spree_office", "alexanderplatz", 0.54, 1],
  ["spree_office", "public_anchor", 0.35, 1],
  ["public_anchor", "tiergarten_edge", 0.32, -1],
  ["wedding_edge", "north_mitte", 0.36, 1],
];

const regimes = {
  stable_affordable: { rent: 1, sale: 1, vacancy: 0.06, stress: 0.12, demand: 0.52 },
  rent_pressure: { rent: 1.18, sale: 1.08, vacancy: 0.04, stress: 0.35, demand: 0.78 },
  purchase_pressure: { rent: 1.08, sale: 1.24, vacancy: 0.05, stress: 0.22, demand: 0.82 },
  vacancy_pressure: { rent: 1.1, sale: 1.16, vacancy: 0.18, stress: 0.26, demand: 0.7 },
  displacement_pressure: { rent: 1.28, sale: 1.18, vacancy: 0.09, stress: 0.68, demand: 0.9 },
  speculative_conversion: { rent: 1.14, sale: 1.38, vacancy: 0.14, stress: 0.48, demand: 0.86 },
  public_stabilized: { rent: 0.92, sale: 0.88, vacancy: 0.03, stress: 0.08, demand: 0.42 },
};

const transitions = {
  stable_affordable: [["stable_affordable", 0.46], ["rent_pressure", 0.18], ["purchase_pressure", 0.16], ["public_stabilized", 0.2]],
  rent_pressure: [["rent_pressure", 0.38], ["displacement_pressure", 0.24], ["speculative_conversion", 0.18], ["public_stabilized", 0.2]],
  purchase_pressure: [["purchase_pressure", 0.4], ["speculative_conversion", 0.28], ["rent_pressure", 0.16], ["stable_affordable", 0.16]],
  vacancy_pressure: [["vacancy_pressure", 0.36], ["rent_pressure", 0.2], ["speculative_conversion", 0.22], ["public_stabilized", 0.22]],
  displacement_pressure: [["displacement_pressure", 0.42], ["vacancy_pressure", 0.18], ["public_stabilized", 0.24], ["rent_pressure", 0.16]],
  speculative_conversion: [["speculative_conversion", 0.44], ["purchase_pressure", 0.22], ["displacement_pressure", 0.18], ["public_stabilized", 0.16]],
  public_stabilized: [["public_stabilized", 0.5], ["stable_affordable", 0.24], ["rent_pressure", 0.14], ["purchase_pressure", 0.12]],
};

const targetWeights = {
  stable_affordable: 0.16,
  rent_pressure: 0.18,
  purchase_pressure: 0.16,
  vacancy_pressure: 0.1,
  displacement_pressure: 0.14,
  speculative_conversion: 0.14,
  public_stabilized: 0.12,
};

const controls = {
  steps: document.querySelector("#compareStepsControl"),
  seed: document.querySelector("#compareSeedControl"),
  rent: document.querySelector("#compareRentControl"),
  vacancy: document.querySelector("#compareVacancyControl"),
  public: document.querySelector("#comparePublicControl"),
  investor: document.querySelector("#compareInvestorControl"),
  influence: document.querySelector("#compareInfluenceControl"),
};

const targetControls = {
  rent: document.querySelector("#targetRentControl"),
  sale: document.querySelector("#targetSaleControl"),
  vacancy: document.querySelector("#targetVacancyControl"),
  stress: document.querySelector("#targetStressControl"),
  burden: document.querySelector("#targetBurdenControl"),
  buyYears: document.querySelector("#targetBuyYearsControl"),
};

function unit(neighborhoodId, ownerId, sqm, rent, salePrice, regulated, vacant, income, size, tolerance) {
  return {
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
  };
}

function runComparison() {
  renderControlValues();
  const settings = currentSettings();
  const results = Object.keys(methods).map((method) => runMethod(method, settings));
  renderCards(results);
  drawComparisonChart("#compareRentChart", results, (point) => point.rent, true);
  drawComparisonChart("#compareRiskChart", results, (point) => point.stress, false, (point) => point.vacancy);
}

function runMethod(method, settings) {
  const sim = {
    method,
    regime: "stable_affordable",
    random: seededRandom(settings.seed),
    neighborhoods: structuredClone(comparisonSeed.neighborhoods),
    owners: structuredClone(comparisonSeed.owners),
    units: structuredClone(comparisonSeed.units),
    analytical: null,
    history: [],
  };
  collect(sim, 0);
  for (let step = 1; step <= settings.steps; step += 1) {
    if (method === "agent_based") stepAgentBased(sim, settings);
    else if (method === "analytical") stepAnalytical(sim, settings);
    else stepStateModel(sim, settings);
    collect(sim, step);
  }
  return sim;
}

function stepAnalytical(sim, settings) {
  if (!sim.analytical) {
    sim.analytical = {
      demand: average(sim.neighborhoods.map((area) => area.demandPressure)),
      rentMultiplier: 1,
      saleMultiplier: 1,
      vacancy: sim.units.filter((item) => item.vacant).length / sim.units.length,
      stress: 0,
    };
  }
  const influenceBoost = settings.influence ? 1 + settings.investor * 0.08 : 1;
  sim.analytical.demand = clamp(
    sim.analytical.demand * 0.992 + 0.008 * 0.82 * influenceBoost - settings.public * 0.002,
    0,
    1,
  );
  sim.analytical.rentMultiplier *=
    1 + 0.0045 * sim.analytical.demand * (1 - settings.rentControl * 0.12);
  sim.analytical.saleMultiplier *=
    1 + 0.0065 * sim.analytical.demand * (1 + settings.investor * 0.15);
  sim.analytical.vacancy = clamp(
    sim.analytical.vacancy * 0.985 + 0.015 * (0.12 * sim.analytical.demand) - settings.vacancy * 0.002,
    0.02,
    0.22,
  );
  sim.analytical.stress = clamp(sim.analytical.stress * 0.92 + 0.08 * sim.analytical.demand, 0, 1);
  for (const area of sim.neighborhoods) {
    area.demandPressure = clamp(area.demandPressure * 0.8 + sim.analytical.demand * 0.2, 0.25, 1);
  }
  for (const currentUnit of sim.units) {
    currentUnit.rent = currentUnit.baseRent * sim.analytical.rentMultiplier;
    currentUnit.salePrice = currentUnit.baseSalePrice * sim.analytical.saleMultiplier;
    currentUnit.vacant = stableHash(`analytical-${currentUnit.neighborhoodId}-${currentUnit.sqm}`) < sim.analytical.vacancy;
    if (currentUnit.household) currentUnit.household.stress = sim.analytical.stress;
  }
}

function stepAgentBased(sim, settings) {
  const pressures = Object.fromEntries(sim.neighborhoods.map((area) => [area.id, area.demandPressure]));
  const spillovers = Object.fromEntries(sim.neighborhoods.map((area) => [area.id, 0]));
  if (settings.influence) {
    for (const [from, to, weight, direction] of influences) {
      spillovers[to] += direction * pressures[from] * weight * settings.investor * 0.0038;
    }
  }
  for (const area of sim.neighborhoods) {
    area.demandPressure = clamp(
      area.demandPressure + settings.investor * 0.006 - settings.public * 0.003 + spillovers[area.id],
      0.25,
      1,
    );
  }
  for (const currentUnit of sim.units) {
    const owner = sim.owners.find((item) => item.id === currentUnit.ownerId);
    const area = sim.neighborhoods.find((item) => item.id === currentUnit.neighborhoodId);
    const regulation = currentUnit.regulated ? settings.rentControl : settings.rentControl * 0.25;
    const rentGrowth = area.demandPressure * owner.riskTolerance * 0.012 * (1 - regulation * 0.78);
    currentUnit.rent *= 1 + Math.max(0.001, rentGrowth);
    currentUnit.salePrice *= 1 + area.demandPressure * (1 - owner.socialMission) * settings.investor * 0.011;
    if (currentUnit.household) {
      const burden = currentUnit.rent / Math.max(currentUnit.household.income, 1);
      currentUnit.household.stress = clamp(
        currentUnit.household.stress + (burden - currentUnit.household.tolerance) * 0.22,
        0,
        1,
      );
    }
  }
}

function stepStateModel(sim, settings) {
  sim.regime = sim.method === "mcmc_state" ? sampleMCMC(sim.regime, sim.random) : sampleMarkov(sim.regime, sim.random);
  const effect = regimes[sim.regime];
  const influenceBoost = settings.influence ? 1 + settings.investor * 0.08 : 1;
  for (const area of sim.neighborhoods) {
    area.demandPressure = clamp(area.demandPressure * 0.65 + effect.demand * 0.35 * influenceBoost, 0.25, 1);
  }
  for (const currentUnit of sim.units) {
    const owner = sim.owners.find((item) => item.id === currentUnit.ownerId);
    const missionModifier = 1 - owner.socialMission * 0.12;
    const publicModifier = 1 - settings.public * 0.08;
    currentUnit.rent = currentUnit.baseRent * effect.rent * missionModifier * (1 - settings.rentControl * 0.08);
    currentUnit.salePrice = currentUnit.baseSalePrice * effect.sale * missionModifier * publicModifier;
    if (currentUnit.household) currentUnit.household.stress = effect.stress;
  }
}

function collect(sim, step) {
  const occupied = sim.units.filter((item) => item.household && !item.vacant);
  const incomes = occupied.map((item) => item.household.income / Math.max(item.household.size, 1));
  const averageIncome = incomes.length ? average(incomes) : 0;
  const burden = occupied.map((item) => item.rent / Math.max(item.household.income, 1));
  const regime = sim.method === "markov_chain" || sim.method === "mcmc_state" ? regimes[sim.regime] : null;
  const analytical = sim.method === "analytical" ? sim.analytical : null;
  sim.history.push({
    step,
    rent: median(sim.units.map((item) => item.rent / item.sqm)),
    sale: median(sim.units.map((item) => item.salePrice / item.sqm)),
    vacancy: analytical
      ? analytical.vacancy
      : regime
      ? regime.vacancy
      : sim.units.filter((item) => item.vacant).length / sim.units.length,
    stress: analytical
      ? analytical.stress
      : regime
      ? regime.stress
      : average(occupied.map((item) => item.household.stress)),
    burden: burden.length ? average(burden) : 0,
    buyYears: median(sim.units.map((item) => item.salePrice)) / Math.max(averageIncome * 12, 1),
    areaMetrics: collectAreaMetrics(sim),
  });
}

function collectAreaMetrics(sim) {
  return sim.neighborhoods.map((area) => {
    const units = sim.units.filter((item) => item.neighborhoodId === area.id);
    return {
      id: area.id,
      demand: area.demandPressure,
      rent: median(units.map((item) => item.rent / item.sqm)),
      vacancy: units.filter((item) => item.vacant).length / Math.max(units.length, 1),
    };
  });
}

function renderCards(results) {
  const host = document.querySelector("#comparisonCards");
  host.innerHTML = "";
  const targets = currentTargets();
  for (const result of results) {
    const latest = result.history.at(-1);
    const error = calculateError(latest, targets);
    const card = document.createElement("article");
    card.className = "comparison-card";
    card.innerHTML = `
      <h2>${methods[result.method].label}</h2>
      <span>${methods[result.method].step} steps</span>
      <dl>
        <dt>Rent</dt><dd>${euro(latest.rent)}/sqm</dd>
        <dt>Sale</dt><dd>${euro(latest.sale)}/sqm</dd>
        <dt>Vacancy</dt><dd>${percent(latest.vacancy)}</dd>
        <dt>Stress</dt><dd>${percent(latest.stress)}</dd>
        <dt>Buy years</dt><dd>${latest.buyYears.toFixed(1)}y</dd>
        <dt>Mean error</dt><dd>${percent(error.meanRelativeError)}</dd>
        <dt>Error RMSE</dt><dd>${percent(error.rmse)}</dd>
      </dl>
    `;
    host.append(card);
  }
}

function calculateError(point, targets) {
  const relativeErrors = [
    Math.abs(point.rent - targets.median_rent_per_sqm) / Math.max(targets.median_rent_per_sqm, 0.0001),
    Math.abs(point.sale - targets.median_sale_price_per_sqm) / Math.max(targets.median_sale_price_per_sqm, 0.0001),
    Math.abs(point.vacancy - targets.vacancy_rate) / Math.max(targets.vacancy_rate, 0.0001),
    Math.abs(point.stress - targets.average_displacement_stress) / Math.max(targets.average_displacement_stress, 0.0001),
    Math.abs(point.burden - targets.average_rent_burden) / Math.max(targets.average_rent_burden, 0.0001),
    Math.abs(point.buyYears - targets.purchase_price_to_income_years) / Math.max(targets.purchase_price_to_income_years, 0.0001),
  ];
  return {
    meanRelativeError: average(relativeErrors),
    rmse: Math.sqrt(average(relativeErrors.map((value) => value * value))),
  };
}

function drawComparisonChart(selector, results, accessor, normalized, secondAccessor) {
  const canvas = document.querySelector(selector);
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fffefa";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#d9d7ca";
  for (let i = 1; i < 5; i += 1) {
    const y = (height / 5) * i;
    ctx.beginPath();
    ctx.moveTo(36, y);
    ctx.lineTo(width - 12, y);
    ctx.stroke();
  }
  for (const result of results) {
    const values = result.history.map(accessor);
    drawLine(ctx, normalized ? scale(values) : values, methods[result.method].color, width, height);
    if (secondAccessor) {
      drawLine(ctx, result.history.map(secondAccessor), methods[result.method].color, width, height, true);
    }
  }
  drawCompareLegend(ctx, results);
}

function drawLine(ctx, values, color, width, height, dashed = false) {
  const left = 36;
  const right = width - 16;
  const top = 18;
  const bottom = height - 28;
  ctx.strokeStyle = color;
  ctx.lineWidth = dashed ? 2 : 3;
  ctx.setLineDash(dashed ? [6, 5] : []);
  ctx.beginPath();
  values.forEach((value, index) => {
    const x = left + ((right - left) * index) / Math.max(values.length - 1, 1);
    const y = bottom - clamp(value, 0, 1) * (bottom - top);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawCompareLegend(ctx, results) {
  ctx.font = "13px sans-serif";
  results.forEach((result, index) => {
    const x = 42 + index * 138;
    ctx.fillStyle = methods[result.method].color;
    ctx.fillRect(x, 12, 12, 12);
    ctx.fillStyle = "#222826";
    ctx.fillText(methods[result.method].label, x + 18, 23);
  });
}

function sampleMarkov(regime, random) {
  const draw = random();
  let cumulative = 0;
  for (const [next, probability] of transitions[regime]) {
    cumulative += probability;
    if (draw <= cumulative) return next;
  }
  return transitions[regime].at(-1)[0];
}

function sampleMCMC(regime, random) {
  const proposals = transitions[regime].map(([next]) => next);
  const proposal = proposals[Math.floor(random() * proposals.length)];
  const acceptance = Math.min(1, targetWeights[proposal] / Math.max(targetWeights[regime], 0.0001));
  return random() <= acceptance ? proposal : regime;
}

function currentSettings() {
  return {
    steps: Number(controls.steps.value),
    seed: Number(controls.seed.value),
    rentControl: Number(controls.rent.value) / 100,
    vacancy: Number(controls.vacancy.value) / 100,
    public: Number(controls.public.value) / 100,
    investor: Number(controls.investor.value) / 100,
    influence: controls.influence.checked,
  };
}

function currentTargets() {
  return {
    median_rent_per_sqm: Number(targetControls.rent.value),
    median_sale_price_per_sqm: Number(targetControls.sale.value),
    vacancy_rate: Number(targetControls.vacancy.value) / 100,
    average_displacement_stress: Number(targetControls.stress.value) / 100,
    average_rent_burden: Number(targetControls.burden.value) / 100,
    purchase_price_to_income_years: Number(targetControls.buyYears.value),
  };
}

function buildTargetDocument() {
  return {
    name: "Mitte calibration targets",
    schema_version: "0.1",
    metadata: {
      source: "user_adjusted",
      source_url: null,
      source_date: new Date().toISOString().slice(0, 10),
      license: null,
      confidence: "prototype",
      notes: "Saved from web/compare.html target editor.",
    },
    targets: currentTargets(),
  };
}

async function saveTargets() {
  const json = `${JSON.stringify(buildTargetDocument(), null, 2)}\n`;
  try {
    if ("showSaveFilePicker" in window) {
      const handle = await window.showSaveFilePicker({
        suggestedName: "mitte_targets.json",
        types: [
          {
            description: "JSON",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      return;
    }
  } catch (error) {
    if (error.name === "AbortError") return;
  }
  const blob = new Blob([json], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "mitte_targets.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

function renderControlValues() {
  document.querySelector("#compareStepsValue").textContent = controls.steps.value;
  document.querySelector("#compareRentValue").textContent = `${controls.rent.value}%`;
  document.querySelector("#compareVacancyValue").textContent = `${controls.vacancy.value}%`;
  document.querySelector("#comparePublicValue").textContent = `${controls.public.value}%`;
  document.querySelector("#compareInvestorValue").textContent = `${controls.investor.value}%`;
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function stableHash(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1000;
  }
  return hash / 1000;
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function scale(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return values.map(() => 0.5);
  return values.map((value) => (value - min) / (max - min));
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

document.querySelector("#compareRunBtn").addEventListener("click", runComparison);
document.querySelector("#compareResetBtn").addEventListener("click", () => {
  controls.steps.value = 24;
  controls.seed.value = 19;
  controls.rent.value = 55;
  controls.vacancy.value = 40;
  controls.public.value = 20;
  controls.investor.value = 68;
  controls.influence.checked = true;
  targetControls.rent.value = 18.5;
  targetControls.sale.value = 7600;
  targetControls.vacancy.value = 6;
  targetControls.stress.value = 28;
  targetControls.burden.value = 32;
  targetControls.buyYears.value = 18;
  runComparison();
});
document.querySelector("#saveTargetsBtn").addEventListener("click", saveTargets);
for (const control of Object.values(controls)) {
  control.addEventListener("input", runComparison);
  control.addEventListener("change", runComparison);
}
for (const control of Object.values(targetControls)) {
  control.addEventListener("input", runComparison);
  control.addEventListener("change", runComparison);
}

runComparison();
