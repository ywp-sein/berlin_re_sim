# Parameter Schema

Model parameters live in `data/parameters/`. They describe behavioral
assumptions, not the starting state of Mitte.

Current default parameter file:

- `data/parameters/default_parameters.json`

Schema reference:

- `data/schema/parameters.schema.json`

## Why Parameters Are Separate

Use separate parameter files so one scenario can be tested under different
behavioral assumptions:

- conservative owner behavior
- higher investor pressure
- stronger regulation
- different Markov transition probabilities
- different MCMC target regime weights

This keeps three concepts apart:

- scenario: what exists at tick `0`
- parameters: how the model changes state
- targets: what outputs the model is compared against

## Agent-Based Parameters

- `demand_inertia`: how much neighborhood pressure keeps its previous value.
- `demand_pull_weight`: how strongly district attractiveness, transit, jobs,
  and tourism pull neighborhood demand.
- `household_unassigned_stress_delta`: stress added when a household has no
  unit.
- `household_stress_coefficient`: how strongly rent burden above tolerance
  changes displacement stress.
- `owner_rent_growth_coefficient`: rent growth response to demand pressure and
  owner risk tolerance.
- `owner_sale_growth_coefficient`: sale-price growth response to demand pressure
  and owner profit orientation.
- `regulated_rent_growth_cap`: maximum one-step rent multiplier for regulated
  units.

## Analytical Parameters

- `demand_inertia`: smoothing factor for aggregate demand pressure.
- `demand_pull`: long-run demand pressure that the analytical model moves
  toward.
- `rent_growth_coefficient`: rent multiplier response to demand pressure.
- `sale_growth_coefficient`: sale-price multiplier response to demand pressure.
- `vacancy_inertia`: smoothing factor for aggregate vacancy.
- `vacancy_demand_coefficient`: vacancy target response to demand pressure.
- `vacancy_min` and `vacancy_max`: lower and upper bounds for vacancy.
- `stress_inertia`: smoothing factor for aggregate displacement stress.

## State-Model Parameters

The Markov chain and MCMC methods share named market regimes:

- `stable_affordable`
- `rent_pressure`
- `purchase_pressure`
- `vacancy_pressure`
- `displacement_pressure`
- `speculative_conversion`
- `public_stabilized`

`state_effects` maps each regime to visible market outputs:

- `rent_multiplier`
- `sale_multiplier`
- `vacancy_rate`
- `stress`

`transitions` is the Markov transition matrix. Each row must sum to `1.0`.

`mcmc_target_weights` describes the target regime distribution used by the
Metropolis-Hastings sampler. Higher weights make a proposed regime more likely
to be accepted.

## Running With A Parameter File

The baseline report accepts an explicit parameter file:

```bash
python3 scripts/build_baseline_report.py --parameters data/parameters/default_parameters.json
```

In Python, pass a parameter file or an override dictionary:

```python
from berlin_re_sim.methods import SimulationMethod, create_simulation

model = create_simulation(
    SimulationMethod.ANALYTICAL,
    "data/scenarios/mitte_seed.json",
    parameters="data/parameters/default_parameters.json",
)
```
