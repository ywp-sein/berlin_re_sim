const currentVersion = {
  label: "Prototype 0.5.16",
  summary: "Canonical scenario now feeds the browser game and comparison page.",
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
      "Methods are separated behind a factory so agent-based, analytical, Markov chain, and MCMC state simulations can be compared without changing the scenario contract. Usage estimates track how each method scales with units, households, areas, edges, states, and steps.",
    files: "src/berlin_re_sim/methods/, scripts/estimate_usage.py, docs/operations/compute_usage.md",
  },
  {
    area: "Data",
    title: "Scenario, parameters, and targets are separate",
    body:
      "Scenarios store initial state. Parameters store behavioral assumptions. Targets store calibration reference outputs. The web app consumes a generated scenario bundle from the canonical scenario, and the source registry tracks real-data provenance before values enter any of those files.",
    files: "data/source_registry.json, data/scenarios/, data/parameters/, data/targets/, data/schema/, scripts/build_scenario_content.py, web/scenario.js",
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
      "Short labels stay compact in the interface, while hover/focus tooltips, dictionary wiki, project notes, and generated docs page provide deeper explanations.",
    files: "web/wiki.html, web/wiki.js, web/notes.html, web/notes.js, web/docs.html, web/docs.js",
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
    files: ".github/workflows/pages.yml, scripts/build_version_commits.py, web/version-commits.json, web/.nojekyll, docs/operations/deployment.md",
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
    version: "0.5.16",
    date: "2026-05-02",
    title: "Canonical scenario web bundle",
    changes: [
      "Expanded data/scenarios/mitte_seed.json to contain the full playable browser seed.",
      "Added a scenario-content build script and static browser bundle.",
      "Added a browser scenario adapter so game.js and compare.js use the canonical scenario instead of hand-written seeds.",
      "Moved simulation influence edges into the scenario while keeping SVG map geometry in the web layer.",
      "Updated deployment, docs, README, notes, and service-worker cache for the generated scenario bundle.",
    ],
  },
  {
    version: "0.5.15",
    date: "2026-05-02",
    title: "Docs integrated into wiki",
    changes: [
      "Loaded the generated docs bundle into the Dictionary Wiki.",
      "Added searchable docs entries beside terminology entries, grouped by docs category.",
      "Linked wiki doc results to the full rendered document in the Docs page.",
      "Added hash-based document selection to docs.html and bumped the service-worker cache.",
    ],
  },
  {
    version: "0.5.14",
    date: "2026-05-02",
    title: "Categorized project docs",
    changes: [
      "Moved markdown docs into modeling, data, and operations folders.",
      "Updated the docs bundler to read nested docs directories and attach category metadata.",
      "Grouped the web Docs navigation by category and included categories in search.",
      "Updated references, generated docs content, wiki paths, and service-worker cache for the new structure.",
    ],
  },
  {
    version: "0.5.13",
    date: "2026-05-02",
    title: "Docs layout width polish",
    changes: [
      "Adjusted the docs grid so the sidebar narrows more smoothly before the mobile breakpoint.",
      "Added wrapping for long doc paths, navigation labels, paragraphs, and list content.",
      "Kept code blocks, MathJax, images, and SVGs inside the docs reader instead of widening the page.",
      "Bumped service-worker cache for the updated docs styles.",
    ],
  },
  {
    version: "0.5.12",
    date: "2026-05-02",
    title: "Compute and power usage estimator",
    changes: [
      "Added scripts/estimate_usage.py for work-unit, runtime, compute Wh, and session Wh estimates.",
      "Added docs/operations/compute_usage.md with scaling assumptions and interpretation guidance.",
      "Linked the compute usage doc and estimator from README.",
    ],
  },
  {
    version: "0.5.11",
    date: "2026-05-02",
    title: "Docs bundle fallback",
    changes: [
      "Generated docs-content.js alongside docs-content.json.",
      "Loaded docs-content.js before docs.js so direct file access can still render docs.",
      "Updated docs.js to fall back to the embedded bundle when JSON fetch fails or is empty.",
      "Bumped service-worker cache for the docs fix.",
    ],
  },
  {
    version: "0.5.10",
    date: "2026-05-02",
    title: "Rendered docs page",
    changes: [
      "Added a Docs subpage for README and markdown docs.",
      "Added a build script that bundles README.md and markdown docs into web/docs-content.json.",
      "Updated GitHub Pages deployment, navigation, service-worker cache, and README for the docs page.",
    ],
  },
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
      "Recorded initial mathematical model notes in docs/modeling/model_design.md.",
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
