const currentVersion = {
  label: "Prototype 0.5.2",
  summary: "Maintenance rule: meaningful project updates should update this notes ledger too.",
};

const implementationNotes = [
  {
    area: "Domain model",
    title: "Shared housing stock",
    body:
      "The project treats rental and purchase markets as two views of the same physical units. This keeps rent, sale price, vacancy, household stress, and owner incentives connected.",
    files: "src/berlin_re_sim/schemas.py, src/berlin_re_sim/model.py",
  },
  {
    area: "Simulation methods",
    title: "Selectable method layer",
    body:
      "Methods are separated behind a factory so agent-based, analytical, Markov chain, and MCMC state simulations can be compared without changing the scenario contract.",
    files: "src/berlin_re_sim/methods/",
  },
  {
    area: "Data",
    title: "Scenario, parameters, and targets are separate",
    body:
      "Scenarios store initial state. Parameters store behavioral assumptions. Targets store calibration reference outputs. This separation prepares the project for real-data import and model convergence checks.",
    files: "data/scenarios/, data/parameters/, data/targets/, data/schema/",
  },
  {
    area: "Calibration",
    title: "Target vector with error metrics",
    body:
      "The compare page measures mean relative error and relative RMSE against editable targets. Mean error gives readable overall closeness; RMSE makes one bad miss more visible.",
    files: "web/compare.html, web/compare.js, data/targets/mitte_targets.json",
  },
  {
    area: "Visualization",
    title: "Game-first static web prototype",
    body:
      "The web app is dependency-free and mobile-friendly. It shows policy levers, market metrics, a stylized Mitte map, area influences, time-series signals, and event logs.",
    files: "web/index.html, web/game.js, web/styles.css",
  },
  {
    area: "Comparison UI",
    title: "Same external influences across methods",
    body:
      "The comparison page gives all methods the same step count, seed, policy levers, and influence toggle. This makes method differences easier to read.",
    files: "web/compare.html, web/compare.js",
  },
  {
    area: "Documentation UI",
    title: "Tooltips, dictionary, and project notes",
    body:
      "Short labels stay compact in the interface, while hover/focus tooltips and the dictionary wiki provide deeper explanations when needed.",
    files: "web/wiki.html, web/wiki.js, web/notes.html, web/notes.js",
  },
  {
    area: "Mobile/PWA",
    title: "Offline cache and phone access",
    body:
      "The app can be served over the local network and cached by the service worker. Cache versions are bumped when web assets change so phones do not hold stale pages.",
    files: "web/service-worker.js, web/manifest.webmanifest",
  },
  {
    area: "Deployment",
    title: "GitHub Pages publishes the static web folder",
    body:
      "The repository uses a GitHub Actions Pages workflow to deploy the web/ folder directly. This avoids moving the static app into the repository root or docs/ folder.",
    files: ".github/workflows/pages.yml, docs/deployment.md",
  },
  {
    area: "Maintenance",
    title: "Update notes with meaningful changes",
    body:
      "Whenever the project changes in a way that affects behavior, structure, data contracts, deployment, UI, or known gaps, update this notes page in the same change.",
    files: "web/notes.js, README.md",
  },
];

const versions = [
  {
    version: "0.5.2",
    date: "2026-05-02",
    title: "Notes maintenance convention",
    changes: [
      "Recorded the rule that meaningful project updates should also update the implementation notes.",
      "Added Maintenance as an implementation area.",
    ],
  },
  {
    version: "0.5.1",
    date: "2026-05-02",
    title: "GitHub Pages deployment",
    changes: [
      "Added GitHub Actions workflow that deploys web/ to GitHub Pages.",
      "Added deployment notes for default Pages URL and custom domain binding.",
      "Recorded deployment as an implementation area.",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-05-02",
    title: "Documentation and project memory",
    changes: [
      "Added searchable terminology wiki.",
      "Added implementation notes and version tracking page.",
      "Expanded hover explanations on comparison metrics.",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-05-02",
    title: "Data readiness before real import",
    changes: [
      "Added canonical scenario schema and target schema.",
      "Separated scenario, parameters, and calibration targets.",
      "Added editable target UI, save-to-JSON flow, seed control, mean error, and RMSE.",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-05-02",
    title: "Method comparison",
    changes: [
      "Added analytical baseline, Markov chain, and MCMC state sampler.",
      "Added comparison page for running methods under shared external influences.",
      "Clarified step semantics across time-dependent and time-independent methods.",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-05-02",
    title: "Playable web prototype",
    changes: [
      "Added mobile-friendly static web game.",
      "Added stylized Mitte map, area labels, office-belt style influence arrows, market charts, and event log.",
      "Added PWA manifest and service worker for local phone use.",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-05-02",
    title: "Core simulation skeleton",
    changes: [
      "Created Mesa-style domain model and synthetic Mitte seed scenario.",
      "Added basic agents, scenario loading, CLI entry point, and smoke tests.",
      "Recorded initial mathematical model notes in docs/model_design.md.",
    ],
  },
];

const openGaps = [
  {
    area: "Dependencies",
    title: "Mesa and pytest are local environment gaps",
    body:
      "The non-Mesa methods run in the current environment, but the agent-based Python path needs Mesa installed and the test suite needs pytest installed.",
    files: "Python environment",
  },
  {
    area: "Data",
    title: "Current values are synthetic",
    body:
      "The Mitte seed and targets are useful for structure and UI testing, but should not be interpreted as empirical results until real sources are imported and provenance is recorded.",
    files: "data/scenarios/mitte_seed.json, data/targets/mitte_targets.json",
  },
  {
    area: "Web data",
    title: "Browser seed is still hand-written",
    body:
      "The web app currently keeps a lightweight in-browser seed for static use. A later step should load generated scenario JSON so Python and browser runs use the same source of truth.",
    files: "web/game.js, web/compare.js",
  },
  {
    area: "Calibration",
    title: "No optimizer yet",
    body:
      "The compare page reports error, but it does not yet fit parameters automatically. A future calibration loop can search parameter sets and compare convergence across methods.",
    files: "web/compare.js, src/berlin_re_sim/methods/",
  },
];

const filterSelect = document.querySelector("#notesFilter");
const implementationHost = document.querySelector("#implementationNotes");
const versionHost = document.querySelector("#versionHistory");
const gapsHost = document.querySelector("#openGaps");
const activeFilter = document.querySelector("#notesActiveFilter");

function initializeNotes() {
  document.querySelector("#currentVersion").textContent = currentVersion.label;
  document.querySelector("#currentVersionSummary").textContent = currentVersion.summary;
  const areas = ["all", ...new Set(implementationNotes.map((note) => note.area).sort())];
  filterSelect.innerHTML = areas
    .map((area) => `<option value="${area}">${area === "all" ? "All areas" : area}</option>`)
    .join("");
  filterSelect.addEventListener("change", renderNotes);
  renderVersions();
  renderNotes();
}

function renderNotes() {
  const area = filterSelect.value;
  activeFilter.textContent = area === "all" ? "all areas" : area;
  const notes = implementationNotes.filter((note) => area === "all" || note.area === area);
  implementationHost.innerHTML = notes.map(renderNoteCard).join("");
  const gaps = openGaps.filter((gap) => area === "all" || gap.area === area);
  gapsHost.innerHTML = gaps.length
    ? gaps.map(renderNoteCard).join("")
    : `<article class="note-card"><span>No open gaps recorded for this area.</span></article>`;
}

function renderVersions() {
  versionHost.innerHTML = versions
    .map(
      (item) => `
        <article class="version-card">
          <div>
            <strong>${item.version}</strong>
            <span>${item.date}</span>
          </div>
          <h2>${item.title}</h2>
          <ul>${item.changes.map((change) => `<li>${change}</li>`).join("")}</ul>
        </article>
      `,
    )
    .join("");
}

function renderNoteCard(note) {
  return `
    <article class="note-card">
      <span>${note.area}</span>
      <h2>${note.title}</h2>
      <p>${note.body}</p>
      <code>${note.files}</code>
    </article>
  `;
}

initializeNotes();
