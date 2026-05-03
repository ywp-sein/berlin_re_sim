# Baseline Report

This report is generated from the current canonical scenario. It records
repeatable synthetic outputs before real data is imported.

These values are not empirical Berlin claims.

## Run Settings

- generated at: `2026-05-03T06:48:09+00:00`
- scenario: `data/scenarios/mitte_seed.json`
- targets: `data/targets/mitte_targets.json`
- parameters: `data/parameters/default_parameters.json`
- steps: `12`
- seed: `7`

## Scenario Size

- districts: 1
- neighborhoods: 8
- parcels: 8
- buildings: 8
- units: 10
- owners: 4
- households: 8
- influence edges: 8

## Method Outputs

| method | status | rent/sqm | sale/sqm | vacancy | stress | income/person | burden | buy years | mean error | RMSE |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| agent_based | unavailable: Missing Python module: mesa | - | - | - | - | - | - | - | - | - |
| analytical | ok | 16.80 | 7358.50 | 18.16% | 0.47 | 2203.12 | 32.47% | 16.7 | 48.58% | 87.41% |
| markov_chain | ok | 18.40 | 9584.40 | 14.00% | 0.48 | 2203.12 | 35.57% | 21.8 | 43.94% | 63.42% |
| mcmc_state | ok | 17.43 | 8612.07 | 5.00% | 0.22 | 2203.12 | 33.69% | 19.6 | 11.88% | 13.25% |

## Target Provenance

| target | value | source | period | geography | unit | confidence |
| --- | ---: | --- | --- | --- | --- | --- |
| `median_rent_per_sqm` | 18.50 | synthetic | pre-real-data synthetic baseline | Mitte proxy areas | EUR per square meter per month | low |
| `median_sale_price_per_sqm` | 7600 | synthetic | pre-real-data synthetic baseline | Mitte proxy areas | EUR per square meter | low |
| `vacancy_rate` | 6.00% | synthetic | pre-real-data synthetic baseline | Mitte proxy areas | decimal share from 0 to 1 | low |
| `average_displacement_stress` | 28.00% | synthetic | pre-real-data synthetic baseline | Mitte proxy households | decimal score from 0 to 1 | low |
| `average_rent_burden` | 32.00% | synthetic | pre-real-data synthetic baseline | Mitte proxy households | rent divided by monthly household income | low |
| `purchase_price_to_income_years` | 18.00 | synthetic | pre-real-data synthetic baseline | Mitte proxy areas | years of average individual income | low |

## Notes

- `agent_based` may be unavailable when Mesa is not installed.
- Mean error and RMSE compare method outputs against the current target file.
- Use this report as a structural baseline before replacing synthetic values.
