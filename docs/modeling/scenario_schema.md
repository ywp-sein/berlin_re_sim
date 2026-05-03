# Scenario Schema

The canonical scenario data contract is `data/schema/scenario.schema.json`.
Scenario files should live in `data/scenarios/`.
Calibration targets use `data/schema/targets.schema.json` and should live in
`data/targets/`.

Current canonical prototype scenario:

- `data/scenarios/mitte_seed.json`

The web prototype uses the same canonical scenario. During local builds and
GitHub Pages deployment, `scripts/build_scenario_content.py` bundles
`data/scenarios/mitte_seed.json` into `web/scenario-content.json` and
`web/scenario-content.js`. The browser adapter in `web/scenario.js` translates
the canonical snake_case scenario fields into the camelCase structures expected
by the game and comparison page.

## Required Provenance

Every scenario should include:

- `source`
- `source_url`
- `source_date`
- `license`
- `confidence`
- `notes`

This lets synthetic values, official values, estimates, and manual assumptions
coexist without becoming indistinguishable.

## Separation Of Concerns

Use:

- `data/scenarios/` for initial state
- `data/parameters/` for model behavior coefficients
- `data/targets/` for calibration and validation targets

The default parameter file is `data/parameters/default_parameters.json`.
Its schema reference is `data/schema/parameters.schema.json`, and the readable
guide is `docs/modeling/parameter_schema.md`.

The default target file is `data/targets/mitte_targets.json`. Its schema
reference is `data/schema/targets.schema.json`, and the readable guide is
`docs/modeling/target_schema.md`. Target provenance is stored per target value
under `target_provenance`, not only in document-level metadata.

Influence edges may live in the scenario when they are part of the simulation
state. UI-only geometry, such as SVG map paths and label positions, should stay
in the web layer.

Do not put model coefficients directly into scenario files unless they describe
observed real-world attributes.

## Calibration Targets

Targets are not the scenario itself. They are reference outputs used to compare
whether a method is close to an expected market state. The current target vector
contains:

- median rent per square meter
- median sale price per square meter
- vacancy rate
- average displacement stress
- average rent burden
- purchase-price-to-income years

The comparison page reports mean relative error and relative RMSE against this
target vector. Mean error is easier to read; RMSE punishes one very bad mismatch
more strongly.

Each target value should have a matching `target_provenance` entry. This lets
rent, sale price, vacancy, stress, rent burden, and buy-years targets come from
different sources without losing traceability.
