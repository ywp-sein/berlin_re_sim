# Target Schema

Calibration targets live in `data/targets/`. They are reference outputs used to
judge how close a simulation method is to an expected market state.

Current default target file:

- `data/targets/mitte_targets.json`

Schema reference:

- `data/schema/targets.schema.json`

## Target Values

The `targets` object stores the numeric vector used by error calculations:

- `median_rent_per_sqm`
- `median_sale_price_per_sqm`
- `vacancy_rate`
- `average_displacement_stress`
- `average_rent_burden`
- `purchase_price_to_income_years`

The baseline report and comparison page use these values for mean relative error
and relative RMSE.

## Per-Target Provenance

The `target_provenance` object uses the same keys as `targets`. Each target value
should explain where it came from and what it means.

Each entry should include:

- `source`: synthetic, official, listing, estimate, model, or user-adjusted
- `source_id`: optional reference to `data/source_registry.json`
- `source_url`: URL if public or stable
- `publisher`: source publisher or producer
- `source_date`: publication date or collection date
- `period`: period the value describes
- `geography`: area covered by the value
- `unit`: canonical unit used by the model
- `statistic`: median, mean, rate, ratio, index, or other statistic type
- `method`: how the value was produced or transformed
- `license`: reuse note or license
- `confidence`: low, medium, high, prototype, or source-specific quality label
- `notes`: human-readable caveats

This prevents one target from silently borrowing provenance from another target.
For example, rent might come from a rent index while sale price comes from a
property market report, and stress may remain synthetic until a proxy is chosen.

## Real-Data Rule

Before a target is treated as real, its provenance should name its source,
period, geography, unit, statistic, license, and transformation method. If those
are unknown, keep the target as synthetic or candidate data.
