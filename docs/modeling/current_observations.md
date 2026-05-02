# Current Observations

This document records what can be observed in the current synthetic Mitte
simulation before real data is imported.

These observations are about model behavior and UI signals. They are not
empirical claims about Berlin yet.

## What The Simulation Can Show Now

The current prototype can show:

- rent pressure through median monthly rent per square meter
- purchase pressure through median sale price per square meter
- divergence between rent and purchase markets
- vacancy as either unavailable supply or a transition state
- household affordability through average rent burden
- displacement pressure through average household stress
- local differences between Mitte proxy areas
- area-to-area influence through directed spillover edges
- method disagreement between agent-based, analytical, Markov, and MCMC runs
- calibration distance through mean relative error and relative RMSE

The most useful current reading is not whether a number is realistic. It is
whether a policy lever or method changes the direction and relative strength of
these signals.

## Synthetic Baseline

The canonical scenario is `data/scenarios/mitte_seed.json`.

Current size:

- 8 neighborhoods
- 10 units
- 8 occupied households
- 4 owner profiles
- 8 influence edges

Default scenario features:

- 60 percent of units are regulated
- two units begin vacant
- public and cooperative owners have higher social mission values
- company and private owners have higher rent and sale-price responsiveness
- influence edges include office demand, purchase pressure, tourism spillover,
  displacement pressure, affordability pull, and public stabilization

## Example 12-Step Method Outputs

These command-line outputs were generated from the canonical synthetic scenario
with the non-Mesa methods.

```text
method=analytical
tick=12
median_rent_per_sqm=16.80
median_sale_price_per_sqm=7358.50
vacancy_rate=18.16%
average_displacement_stress=0.47
average_individual_income_monthly=2203.12
average_rent_burden=32.47%
purchase_price_to_income_years=16.7
regulated_unit_share=60.00%
```

```text
method=markov_chain
tick=12
median_rent_per_sqm=14.85
median_sale_price_per_sqm=6111.79
vacancy_rate=3.00%
average_displacement_stress=0.08
average_individual_income_monthly=2203.12
average_rent_burden=28.70%
purchase_price_to_income_years=13.9
regulated_unit_share=60.00%
```

```text
method=mcmc_state
tick=12
median_rent_per_sqm=17.43
median_sale_price_per_sqm=8612.07
vacancy_rate=5.00%
average_displacement_stress=0.22
average_individual_income_monthly=2203.12
average_rent_burden=33.69%
purchase_price_to_income_years=19.6
regulated_unit_share=60.00%
```

Interpretation:

- the analytical method currently produces higher vacancy and stress because it
  uses aggregate recurrence equations
- the Markov method can remain in or move toward lower-pressure regimes,
  producing lower stress and lower purchase years
- the MCMC state sampler explores plausible regimes and can produce higher
  purchase pressure than the Markov path
- all three methods preserve the same income reference and regulated share
  because they read the same canonical scenario

## What The Map Can Show

The map can show local pressure differences and spillovers:

- high-demand areas can push pressure into nearby or connected areas
- public-anchor influence can dampen pressure on connected areas
- office-belt and tourism edges can make non-residential forces visible
- selecting an area reveals local units, income reference, vacancy, rent burden,
  rent per square meter, sale price per square meter, and stress

This is a useful visual form for hidden dynamics because a user can see whether
pressure is local, spreading, or partly dampened by public/cooperative ownership.

## What Is Not Real Yet

Current values are synthetic. The following should not be treated as empirical:

- starting rents and sale prices
- income distributions
- vacancy rates
- owner mix
- influence-edge weights
- transition probabilities
- MCMC target weights
- response coefficients for rent, sale price, stress, and vacancy

The current model is therefore ready for structure testing and sensitivity
testing, but not for real-world conclusions.

## What To Tighten Before Real Data

Before pulling real data, the most useful next implementation steps are:

1. Add scenario validation beyond the permissive JSON schema.
2. Add consistency checks for IDs: unit -> building -> parcel -> neighborhood,
   unit -> household, and parcel -> owner.
3. Move method coefficients and state-machine probabilities into parameter files
   instead of keeping them in code.
4. Add a baseline report script that writes the current method outputs to a JSON
   or markdown file.
5. Add target provenance fields to every calibration target value, not only to
   the target document as a whole.
6. Add a real-data import staging folder for raw and normalized files, even
   before downloading real datasets.
7. Define how real geography will map into the current eight Mitte proxy areas.
8. Add an explicit synthetic-vs-observed badge in the web UI, so prototype
   values are never mistaken for real data.

The best immediate next step is scenario validation and baseline report
automation. That would make real-data import safer because every future import
can be checked against a known structural baseline.
