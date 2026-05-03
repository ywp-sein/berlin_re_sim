# Real Data Readiness

Before importing real data, use this as the gate. The goal is not to slow the
project down; it is to keep real numbers from becoming untraceable assumptions.

## Minimum Gate

Every source should have:

- registry entry in `data/source_registry.json`
- source URL or access note
- publisher
- source date or collection period
- license or reuse note
- raw unit and canonical unit
- geography mapping
- model fields it is allowed to update
- quality checks
- import notes

If any of those are unknown, keep the source as `candidate`.

## Canonical Units

Use these units inside scenarios and targets:

- rent: EUR per square meter per month
- sale price: EUR per square meter
- household income: EUR per month
- individual income reference: EUR per person per month
- vacancy, stress, burden, ownership share: decimal rates from `0` to `1`
- area influence: normalized directed edge weight from `0` to `1`

## Import Order

1. Fill `data/source_registry.json`.
2. Run `python3 scripts/validate_scenario.py` on the current synthetic scenario
   so the pre-import baseline is structurally clean.
   Run `python3 scripts/validate_targets.py` before and after target edits.
3. Store raw files outside scenario files.
4. Convert raw units into canonical units.
5. Map geography into Mitte area proxies.
6. Write calibration targets first, with per-target provenance for every value.
7. Run `python3 scripts/build_baseline_report.py` to compare all simulation
   methods against the same targets.
8. Only then replace scenario initialization values and run the scenario
   validator again.
9. Regenerate the baseline report after import and compare it with the
   pre-import report.

This order keeps the synthetic scenario useful while real targets are being
tested.

## Quality Questions

- Is the value observed, estimated, listed, appraised, or modeled?
- Is it a mean, median, percentile, count, or rate?
- Does it describe all of Mitte or only a submarket?
- Does the source mix residential, commercial, land, and apartment values?
- Does the source period match the period used by other targets?
- Does each target value carry its own source, period, geography, unit, and statistic?
- Can the license be used in a public GitHub Pages app?

## Stop Conditions

Do not import a source yet if:

- the license is unknown
- the unit cannot be converted
- the geography cannot be mapped
- the source mixes incompatible markets without separation
- the value would overwrite synthetic assumptions without provenance
- a target file has numeric values without matching `target_provenance` entries
