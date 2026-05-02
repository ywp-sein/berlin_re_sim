const entries = [
  {
    term: "Agent-based model",
    category: "Method",
    summary: "A simulation where individual units, owners, and households follow local rules.",
    details:
      "The agent-based method is useful when hidden dynamics come from many small decisions: owners raising rent, households becoming stressed, vacant units returning to supply, or areas influencing neighbors. In this prototype it is the most concrete method, but it needs Mesa on the Python side.",
    implementation: "Python: methods/abm.py and model.py. Browser: the agent_based branch in game.js and compare.js.",
    tags: ["ABM", "Mesa", "households", "owners", "units"],
  },
  {
    term: "Analytical baseline",
    category: "Method",
    summary: "A deterministic aggregate model used as a simple reference curve.",
    details:
      "The analytical method compresses the market into aggregate equations for demand, rent, sale price, vacancy, and stress. It is less realistic than an agent-based model, but helpful because it is stable, explainable, and easy to compare against.",
    implementation: "Python: methods/analytical.py. Browser: stepAnalytical in game.js and compare.js.",
    tags: ["deterministic", "aggregate", "baseline", "equation"],
  },
  {
    term: "Markov chain",
    category: "Method",
    summary: "A model that moves between named market states using transition probabilities.",
    details:
      "A Markov chain does not track every household. It asks which market regime comes next, given the current regime. For example, a stable market can transition into rent pressure, purchase pressure, or public stabilization.",
    implementation: "Python: methods/markov.py. Browser: sampleMarkov and stepStateModel in game.js and compare.js.",
    tags: ["state machine", "transition", "regime", "probability"],
  },
  {
    term: "MCMC state sampler",
    category: "Method",
    summary: "A sampler for exploring likely market states rather than a literal month-by-month process.",
    details:
      "MCMC means Markov chain Monte Carlo. In this prototype it proposes a nearby market state and accepts it using target-state weights. It is useful for investigating which scenario states are likely under assumptions, even if the samples are not literal calendar months.",
    implementation: "Python: methods/mcmc.py. Browser: sampleMCMC and stepStateModel in game.js and compare.js.",
    tags: ["MCMC", "sampling", "state likelihood", "Metropolis"],
  },
  {
    term: "Step",
    category: "Simulation",
    summary: "The shared comparison axis used by all methods.",
    details:
      "A step means different things depending on the method. In the agent-based model it can be read as a simulated month. In Markov chain it is a state transition. In MCMC it is a sample. Keeping the label as step makes methods comparable without pretending they all share the same time meaning.",
    implementation: "Shown in the main metrics and comparison page controls.",
    tags: ["time", "month", "iteration", "transition", "sample"],
  },
  {
    term: "Median rent per sqm",
    category: "Metric",
    summary: "The middle monthly rent per square meter across simulated units.",
    details:
      "Median is used because one unusually expensive or cheap unit should not dominate the signal. Rent per square meter also makes small and large apartments comparable.",
    implementation: "Collected as median(unit.rent / unit.sqm).",
    tags: ["rent", "median", "sqm", "metric"],
  },
  {
    term: "Median sale per sqm",
    category: "Metric",
    summary: "The middle purchase price per square meter across simulated units.",
    details:
      "This tracks the ownership and investment side of the market. A neighborhood can look stable in rent while sale prices rise, which can later change owner incentives and rental supply.",
    implementation: "Collected as median(unit.salePrice / unit.sqm).",
    tags: ["purchase", "sale", "ownership", "sqm"],
  },
  {
    term: "Vacancy rate",
    category: "Metric",
    summary: "The share of units treated as empty or unavailable to occupied households.",
    details:
      "Vacancy can mean normal turnover, enforcement gaps, speculative withholding, renovation transition, or supply that exists physically but is not actually available to residents.",
    implementation: "Collected as vacant units divided by all units, or from the aggregate state model regime.",
    tags: ["vacancy", "empty units", "supply"],
  },
  {
    term: "Displacement stress",
    category: "Metric",
    summary: "A household pressure score from stable to severe stress.",
    details:
      "Stress rises when rent burden exceeds a household's tolerance. It is not a direct real-world statistic yet; it is a synthetic internal signal for displacement pressure.",
    implementation: "Stored on household.stress and averaged across occupied units.",
    tags: ["stress", "displacement", "household", "pressure"],
  },
  {
    term: "Average income per person",
    category: "Metric",
    summary: "Household monthly income divided by household size, averaged across occupied units.",
    details:
      "This gives the model an affordability reference. It should later be replaced or calibrated with real income distributions by area, household type, and tenure.",
    implementation: "Collected as average(household.income / household.size).",
    tags: ["income", "affordability", "household"],
  },
  {
    term: "Rent burden",
    category: "Metric",
    summary: "Monthly rent divided by monthly household income.",
    details:
      "Rent burden is one of the clearest affordability signals. In the prototype it feeds displacement stress and is also used as a calibration target.",
    implementation: "Collected as average(unit.rent / household.income) for occupied units.",
    tags: ["affordability", "rent", "income", "burden"],
  },
  {
    term: "Buy years",
    category: "Metric",
    summary: "Median purchase price compared with annual average individual income.",
    details:
      "Buy years approximates how unreachable ownership is becoming. Higher values mean the purchase market is separating from local income capacity.",
    implementation: "Collected as median(unit.salePrice) / (averageIncomePerPerson * 12).",
    tags: ["purchase", "income", "ownership", "affordability"],
  },
  {
    term: "Mean relative error",
    category: "Calibration",
    summary: "The average percentage distance between model outputs and target values.",
    details:
      "Mean error is easy to read because every target contributes equally after being normalized by its target value. Lower is better, but it can hide a single very bad mismatch if other metrics are close.",
    implementation: "compare.js: calculateError returns meanRelativeError.",
    tags: ["error", "target", "calibration", "comparison"],
  },
  {
    term: "Error RMSE",
    category: "Calibration",
    summary: "Root mean square relative error across the calibration target vector.",
    details:
      "RMSE squares each relative error before averaging, then takes the square root. This makes one large mismatch hurt more strongly than in the mean error. It is useful when you want to notice a method that matches most targets but badly misses one important dimension.",
    implementation: "compare.js: calculateError returns rmse.",
    tags: ["RMSE", "error", "target", "calibration"],
  },
  {
    term: "Calibration target",
    category: "Calibration",
    summary: "A reference output value used to judge whether a method is close to an expected market state.",
    details:
      "Targets are separate from scenarios. A scenario describes the initial world; targets describe expected outputs such as rent, sale price, vacancy, stress, rent burden, and buy years. This separation makes real-data calibration cleaner later.",
    implementation: "Stored in data/targets/mitte_targets.json and editable in compare.html.",
    tags: ["targets", "validation", "real data", "JSON"],
  },
  {
    term: "Scenario",
    category: "Data",
    summary: "The initial state of the simulated world.",
    details:
      "A scenario contains neighborhoods, units, households, ownership, and metadata. It should not contain method coefficients unless those values describe observed real-world attributes.",
    implementation: "Stored in data/scenarios/mitte_seed.json and described by data/schema/scenario.schema.json.",
    tags: ["JSON", "initial state", "schema", "Mitte"],
  },
  {
    term: "Parameter file",
    category: "Data",
    summary: "A place for model behavior coefficients that should not live inside the scenario.",
    details:
      "Separating parameters from scenarios lets you run the same Mitte state under different behavioral assumptions. This will matter when testing analytical, ABM, Markov, and MCMC variants against the same data.",
    implementation: "Stored in data/parameters/default_parameters.json.",
    tags: ["parameters", "coefficients", "model assumptions"],
  },
  {
    term: "Area influence",
    category: "Mechanism",
    summary: "A directed spillover from one area to another.",
    details:
      "Area influence represents hidden geography: office belts, tourist centers, public anchors, transport access, or high-demand neighborhoods changing pressure nearby. On the map, arrows show direction and relative strength.",
    implementation: "Defined as influence edges in game.js and compare.js, then used to modify demand pressure.",
    tags: ["map", "spillover", "office belt", "neighborhood"],
  },
  {
    term: "Demand pressure",
    category: "Mechanism",
    summary: "A local pressure score that pushes rents, sale prices, and stress upward.",
    details:
      "Demand pressure is a synthetic internal state. It condenses factors like centrality, investor demand, office/tourism pressure, and spillovers from nearby areas.",
    implementation: "Stored on neighborhoods as demandPressure.",
    tags: ["demand", "pressure", "area", "hidden dynamics"],
  },
  {
    term: "Public acquisition",
    category: "Policy",
    summary: "A policy lever representing expansion of public or social ownership.",
    details:
      "In the model, higher public acquisition softens speculative sale-price growth and can lower local pressure. It is a broad prototype lever, not a precise legal instrument yet.",
    implementation: "A range input in game.html and compare.html; used by model step functions.",
    tags: ["policy", "public ownership", "stabilization"],
  },
  {
    term: "Rent regulation",
    category: "Policy",
    summary: "A policy lever that slows rent increases.",
    details:
      "Higher rent regulation reduces rent growth, especially for regulated units. The prototype can later distinguish different legal regimes more carefully.",
    implementation: "A range input affecting rent growth in agent-based and aggregate methods.",
    tags: ["policy", "rent", "regulation"],
  },
  {
    term: "Vacancy enforcement",
    category: "Policy",
    summary: "A policy lever against units remaining empty or unavailable.",
    details:
      "Higher vacancy enforcement represents stronger pressure to return units to usable supply. In real data this would need a careful definition because vacancy can have several causes.",
    implementation: "A range input affecting vacancy behavior in the simulation.",
    tags: ["policy", "vacancy", "supply"],
  },
  {
    term: "Investor pressure",
    category: "Policy",
    summary: "External demand for purchase, conversion, redevelopment, or asset appreciation.",
    details:
      "Investor pressure raises sale-price growth and can make rental-to-sale conversion more attractive. It also strengthens area spillovers in the prototype.",
    implementation: "A range input used in sale price, demand, and influence calculations.",
    tags: ["investment", "purchase", "speculation", "policy lever"],
  },
];

const searchInput = document.querySelector("#wikiSearch");
const categorySelect = document.querySelector("#wikiCategory");
const resultsHost = document.querySelector("#wikiResults");
const countLabel = document.querySelector("#wikiCount");
const activeFilter = document.querySelector("#wikiActiveFilter");

function initializeWiki() {
  const categories = ["all", ...new Set(entries.map((entry) => entry.category).sort())];
  categorySelect.innerHTML = categories
    .map((category) => `<option value="${category}">${category === "all" ? "All categories" : category}</option>`)
    .join("");
  searchInput.addEventListener("input", renderEntries);
  categorySelect.addEventListener("change", renderEntries);
  renderEntries();
}

function renderEntries() {
  const query = normalize(searchInput.value);
  const category = categorySelect.value;
  const filtered = entries.filter((entry) => matchesEntry(entry, query, category));
  countLabel.textContent = `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"}`;
  activeFilter.textContent = buildFilterLabel(query, category);
  resultsHost.innerHTML = filtered.length
    ? filtered.map((entry) => renderEntry(entry)).join("")
    : `<article class="wiki-entry empty-state"><h2>No entries found</h2><p>Try a broader word like rent, target, state, or pressure.</p></article>`;
}

function matchesEntry(entry, query, category) {
  if (category !== "all" && entry.category !== category) return false;
  if (!query) return true;
  return searchableText(entry).includes(query);
}

function searchableText(entry) {
  return normalize(
    [entry.term, entry.category, entry.summary, entry.details, entry.implementation, entry.tags.join(" ")].join(" "),
  );
}

function buildFilterLabel(query, category) {
  if (!query && category === "all") return "all concepts";
  const parts = [];
  if (category !== "all") parts.push(category);
  if (query) parts.push(`matching "${searchInput.value.trim()}"`);
  return parts.join(", ");
}

function renderEntry(entry) {
  return `
    <article class="wiki-entry">
      <div class="wiki-entry-head">
        <div>
          <span class="wiki-category">${entry.category}</span>
          <h2>${entry.term}</h2>
        </div>
      </div>
      <p>${entry.summary}</p>
      <details>
        <summary>Read implementation note</summary>
        <p>${entry.details}</p>
        <p><strong>Implementation:</strong> ${entry.implementation}</p>
      </details>
      <div class="wiki-tags">${entry.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
    </article>
  `;
}

function normalize(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

initializeWiki();
