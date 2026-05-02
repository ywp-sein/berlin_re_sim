# berlin_re_sim
A game to simulate berlin real estate situation

This repo starts as a minimal Mesa-style agent-based prototype. The first
playable scope is Mitte, with data structures that can later expand to all of
Berlin and support a richer UI.

## Core Idea

The game models one shared physical housing stock with two connected markets:

- rental contracts for households
- purchase offers for apartments, buildings, and land parcels

That split matters because hidden dynamics often appear between the markets:
investor demand can change owner behavior, owner behavior changes rental supply,
rental scarcity changes household displacement pressure, and policy changes can
shift all of those incentives.

## Suggested First Run

Start with synthetic Mitte data in `data/scenarios/mitte_seed.json`, then replace
pieces with real data later.

```bash
python3 -m berlin_re_sim
```

Choose a simulation method:

```bash
python3 -m berlin_re_sim --method agent_based
python3 -m berlin_re_sim --method analytical
python3 -m berlin_re_sim --method markov_chain
python3 -m berlin_re_sim --method mcmc_state
```

For the first browser prototype, open `web/index.html`, or serve it on your
local network for phone testing:

```bash
cd web
python3 -m http.server 8000 --bind 0.0.0.0
```

Then open `http://YOUR_COMPUTER_IP:8000` from a phone on the same Wi-Fi.

The browser prototype also includes `web/compare.html`, which runs the
agent-based, analytical, Markov chain, and MCMC state methods under the same
external policy and influence settings. The compare page has editable
calibration targets, a reproducible random seed, mean target error, error RMSE,
and a button to save the current target vector as JSON.

The static browser app uses a generated scenario bundle from
`data/scenarios/mitte_seed.json`, so the game, comparison page, and Python model
share the same canonical seed.

Validate scenario structure before changing seed data:

```bash
python3 scripts/validate_scenario.py
```

For terminology and implementation notes, open `web/wiki.html`. It includes a
local search over model methods, metrics, calibration terms, policy levers, data
structures, and generated project docs.

For project-wide implementation memory and version tracking, open
`web/notes.html`. It records milestone versions, architecture notes, open gaps,
and the files connected to each area.

For rendered project documentation, open `web/docs.html`. It loads a generated
bundle of `README.md` and categorized markdown files under `docs/`.

For internet access through GitHub Pages, see `docs/operations/deployment.md`.
The included GitHub Actions workflow publishes the static `web/` folder.

## Maintenance Convention

When a change affects behavior, structure, data contracts, deployment, UI, or
known gaps, update `web/notes.js` in the same change so the implementation notes
and version history stay current.

If the phone cannot connect:

- confirm the phone is not on mobile data or a guest Wi-Fi network
- check that the phone IP and computer IP start with the same first three parts,
  for example `192.168.139.x`
- try `http://192.168.139.227:8000` if this machine is still on the same network
- allow incoming connections for Python or port `8000` in the computer firewall
- if this project is running inside WSL, Docker, a VM, or a remote IDE, start the
  server from the host machine instead of the isolated environment

## Project Map

- `docs/modeling/model_design.md` explains the data structure and simulation loop.
- `docs/modeling/current_observations.md` records what the synthetic prototype can currently show.
- `docs/modeling/scenario_schema.md` describes the canonical scenario contract.
- `docs/modeling/visualization_values.md` lists the signals worth showing in the game.
- `docs/data/data_sources.md` maps future real datasets to model variables.
- `docs/data/real_data_readiness.md` is the checklist before importing real data.
- `docs/operations/deployment.md` explains GitHub Pages and custom-domain setup.
- `docs/operations/compute_usage.md` explains runtime and power-use estimates.
- `data/source_registry.json` tracks candidate real-data sources and provenance.
- `data/scenarios/mitte_seed.json` is the first small scenario.
- `data/parameters/default_parameters.json` keeps model coefficients separate.
- `data/targets/mitte_targets.json` stores calibration reference outputs.
- `src/berlin_re_sim/schemas.py` defines the durable domain objects.
- `src/berlin_re_sim/model.py` contains the Mesa-compatible model skeleton.
- `src/berlin_re_sim/methods/` contains selectable simulation methods.
- `scripts/estimate_usage.py` estimates simulation work units and energy usage.
- `scripts/validate_scenario.py` checks scenario IDs, references, ranges, and occupancy.
- `scripts/build_scenario_content.py` bundles the canonical scenario for the web app.
- `web/index.html` is a dependency-free visualization/game prototype.
- `web/wiki.html` is the searchable terminology and implementation dictionary.
- `web/notes.html` is the project implementation and version ledger.
- `web/docs.html` renders README and docs markdown inside the app.
