# Data Sources Plan

This document records real-data candidates for replacing synthetic scenario
values. The goal is to map each dataset to a model variable before importing
anything.

## Calibration Targets

### Rent

Model variables:

- `monthly_rent`
- `rent_per_sqm`
- area-level median rent

Candidate sources:

- Berlin rent index / Mietspiegel
- open rental listing snapshots, if legally available
- district-level housing reports

Use first as:

- initial scenario values
- validation target for median rent per sqm

### Purchase Price

Model variables:

- `estimated_sale_price`
- `sale_price_per_sqm`
- purchase affordability years

Candidate sources:

- official property market reports
- Gutachterausschuss Berlin reports
- public transaction summaries where available

Use first as:

- initial sale price per sqm by area
- validation target for purchase pressure

### Income

Model variables:

- `income_monthly`
- `average_individual_income_monthly`
- `average_rent_burden`

Candidate sources:

- Amt fuer Statistik Berlin-Brandenburg income tables
- district social structure atlas
- census-style household data

Use first as:

- household income distributions by area
- affordability reference

### Housing Stock

Model variables:

- unit count
- `sqm`
- `rooms`
- building age
- regulated share
- public/cooperative ownership share

Candidate sources:

- Berlin-Brandenburg statistical office
- housing stock reports
- social housing datasets
- cooperative/public housing provider reports

Use first as:

- scenario initialization
- ownership mix calibration

### Vacancy

Model variables:

- `vacant`
- `vacancy_rate`
- vacancy enforcement effect

Candidate sources:

- official vacancy estimates
- housing market reports
- enforcement reports where available

Use first as:

- rough validation target, not exact ground truth

### Spatial Influence

Model variables:

- area influence edge weights `W_ij`
- transit/job/tourism spillover

Candidate sources:

- transit connectivity
- commute and workplace density
- tourism/hotel density
- distance between area centroids

Use first as:

- influence matrix construction
- sensitivity testing

## Import Strategy

Use `docs/real_data_readiness.md` as the gate before import, and record every
candidate source in `data/source_registry.json`.

1. Start with manually curated CSV/JSON for Mitte only.
2. Replace synthetic values in `data/scenarios/mitte_seed.json`.
3. Keep raw source files separate from scenario files.
4. Record source name, date, URL, license, and transformation notes.
5. Compare analytical, ABM, Markov, and MCMC outputs from the same initialized
   scenario.

## Validation Questions

- Do all methods move in the same direction under high investor pressure?
- Does analytical baseline converge toward ABM aggregate behavior?
- Which method diverges earliest from real target values?
- Which input variables dominate affordability outcomes?
