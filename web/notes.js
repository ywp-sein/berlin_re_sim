const currentVersion = {
  label: "Prototype 0.5.9",
  summary: "Wiki now explains real-data readiness and implementation terminology.",
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
      "Scenarios store initial state. Parameters store behavioral assumptions. Targets store calibration reference outputs. The source registry tracks real-data provenance before values enter any of those files.",
    files: "data/source_registry.json, data/scenarios/, data/parameters/, data/targets/, data/schema/",
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
      "Short labels stay compact in the interface, while hover/focus tooltips and the dictionary wiki provide deeper explanations, including mathematical notes and real-data implementation terminology.",
    files: "web/wiki.html, web/wiki.js, web/notes.html, web/notes.js",
  },
  {
    area: "Mobile/PWA",
    title: "Offline cache and phone access",
    body:
      "The app can be served over the local network and cached by the service worker. Cache versions are bumped when web assets change, and navigation requests are network-first so deployed pages can refresh while still working offline.",
    files: "web/service-worker.js, web/manifest.webmanifest",
  },
  {
    area: "Deployment",
    title: "GitHub Pages publishes the static web folder",
    body:
      "The repository uses a GitHub Actions Pages workflow to deploy the web/ folder directly. A .nojekyll marker keeps GitHub Pages serving static files directly, and the deploy build generates commit links for the version history.",
    files: ".github/workflows/pages.yml, scripts/build_version_commits.py, web/version-commits.json, web/.nojekyll, docs/deployment.md",
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
    version: "0.5.9",
    date: "2026-05-02",
    title: "Readiness terminology in wiki",
    changes: [
      "Added wiki entries for readiness gate, source registry, provenance, canonical units, geography mapping, quality checks, and stop conditions.",
      "Updated documentation notes to include real-data implementation terminology.",
      "Bumped service-worker cache for the updated wiki.",
    ],
  },
  {
    version: "0.5.8",
    date: "2026-05-02",
    title: "Real-data readiness gate",
    changes: [
      "Added a source registry schema and starter source registry.",
      "Added a real-data readiness checklist with units, import order, quality questions, and stop conditions.",
      "Linked the readiness gate from data source docs and README.",
    ],
  },
  {
    version: "0.5.7",
    date: "2026-05-02",
    title: "Automated version commit links",
    changes: [
      "Added a build script that maps each Notes version to the commit that introduced it.",
      "Updated the GitHub Pages workflow to generate version-commits.json during deployment.",
      "Updated the Notes page to show commit links beside version entries when the generated map is available.",
      "Made the service worker fetch the generated commit map network-first.",
    ],
  },
  {
    version: "0.5.6",
    date: "2026-05-02",
    title: "Deployment and offline-cache polish",
    changes: [
      "Added web/.nojekyll for direct GitHub Pages static serving.",
      "Changed service-worker navigation requests to network-first with cached fallback.",
      "Added skipWaiting and clients.claim so service-worker updates take effect sooner.",
      "Documented Pages and offline-cache behavior in deployment notes.",
    ],
  },
  {
    version: "0.5.5",
    date: "2026-05-02",
    title: "Wiki math parameter legends",
    changes: [
      "Added parameter explanations below each method's LaTeX equations.",
      "Included parameter symbols and descriptions in wiki search.",
      "Styled parameter legends as compact two-column reference tables.",
    ],
  },
  {
    version: "0.5.4",
    date: "2026-05-02",
    title: "LaTeX wiki math display",
    changes: [
      "Converted method math notes from plain code blocks to structured LaTeX equations.",
      "Added MathJax rendering on the wiki page with readable LaTeX fallback.",
      "Improved equation panel styling and mobile horizontal scrolling.",
    ],
  },
  {
    version: "0.5.3",
    date: "2026-05-02",
    title: "Wiki method mathematics",
    changes: [
      "Added formula blocks for agent-based, analytical, Markov chain, and MCMC method entries.",
      "Styled wiki math notes as horizontally scrollable code blocks for mobile readability.",
      "Bumped service-worker cache so deployed clients receive the updated wiki.",
    ],
  },
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
let versionCommits = {};

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
  loadVersionCommits();
}

async function loadVersionCommits() {
  try {
    const response = await fetch("version-commits.json", { cache: "no-store" });
    if (!response.ok) return;
    versionCommits = await response.json();
    renderVersions();
  } catch (error) {
    versionCommits = {};
  }
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
          ${renderCommitLink(item.version)}
          <h2>${item.title}</h2>
          <ul>${item.changes.map((change) => `<li>${change}</li>`).join("")}</ul>
        </article>
      `,
    )
    .join("");
}

function renderCommitLink(version) {
  const commit = versionCommits[version];
  if (!commit?.url || !commit?.short) return "";
  return `<a class="version-commit" href="${commit.url}" target="_blank" rel="noopener">commit ${commit.short}</a>`;
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
