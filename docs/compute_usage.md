# Compute And Power Usage

The current Mitte dataset is tiny, so the simulation itself uses almost no
energy. In practice, the browser tab, screen, and device idle power dominate.

This project therefore separates two estimates:

- **simulation compute energy:** CPU work needed to advance the model
- **interactive session energy:** whole-device energy while the user keeps the
  app open

## Estimator

Run:

```bash
python3 scripts/estimate_usage.py
```

Useful options:

```bash
python3 scripts/estimate_usage.py --steps 120
python3 scripts/estimate_usage.py --scale 100
python3 scripts/estimate_usage.py --compute-watts 15 --device-watts 8
```

The `--scale` option multiplies the scenario size, so the current tiny seed can
be used to think about larger future datasets.

## Model

The estimator uses approximate work units:

```text
work_units =
steps * (
  unit_count * unit_factor
  + household_count * household_factor
  + owner_count * owner_factor
  + area_count * area_factor
  + influence_edge_count * edge_factor
  + state_count * state_factor
  + metrics_pass
)
```

Then:

```text
runtime_seconds = work_units / throughput
compute_Wh = compute_watts * runtime_seconds / 3600
session_Wh = device_watts * session_minutes / 60
```

The factors are intentionally conservative planning weights, not exact CPU
instruction counts.

## Scaling Expectations

For the current model:

- analytical, Markov, and MCMC methods are very cheap
- agent-based simulation grows mostly with unit and household count
- area influence grows with edge count
- metrics collection can become meaningful because every step scans units and
  households

Expected rough complexity:

- agent-based: \(O(T(U + H + A + E))\)
- analytical: \(O(T(U + A))\)
- Markov chain: \(O(T(S + U))\)
- MCMC state sampler: \(O(T(S + U))\)

where:

- \(T\): steps
- \(U\): units
- \(H\): households
- \(A\): areas
- \(E\): influence edges
- \(S\): market states

## Interpretation

If `compute_Wh` is far smaller than `session_Wh`, optimizing simulation math is
not important yet. Focus instead on:

- avoiding unnecessary animation loops
- keeping charts simple
- not recomputing all history every frame
- loading only data needed for the current view

If future real data grows into thousands of units and many area edges, the next
optimization should be incremental metrics: update changed totals instead of
rescanning every unit after every step.
