# Berlin Real Estate Simulation Design

## Goal

Build a small game-like simulation that reveals hidden dynamics in Berlin real
estate. The first map is Mitte. Later, the same model can expand to other
districts and expose results through a more realistic UI.

## Main Design Choice

Do not model "rent" as the whole real estate market. Model the physical asset
first, then attach rent and purchase markets to it.

Recommended object hierarchy:

```text
District
  Neighborhood
    Parcel / Ground
      Building
        Unit
          RentalContract
          SaleListing
```

This lets the simulation represent:

- land ownership and redevelopment pressure
- apartment ownership and resale prices
- rental contracts and tenant security
- vacant units, owner-occupied units, and speculative holding
- conversion between rental and sale supply

## Core Entities

### District

Represents Mitte first, then other Berlin districts later. It stores macro
conditions such as attractiveness, transit quality, job access, tourism pressure,
and policy intensity.

### Parcel

Represents ground or land. A parcel has a zoning capacity, current use, land
value, owner type, and redevelopment friction.

### Building

Represents the structure on a parcel. It stores age, condition, energy quality,
number of units, renovation state, and operating costs.

### Unit

Represents an apartment or commercial unit. It stores size, rooms, tenure mode,
rent contract, possible sale price, vacancy state, and whether it is regulated.

### Household

Represents renters, buyers, or owner-occupiers. It stores income, savings,
household size, location preference, commute preference, rent burden tolerance,
and displacement stress.

### Owner

Represents private landlords, housing companies, public housing, cooperatives,
and small owner-occupiers. Owners choose whether to rent, sell, renovate, hold
vacant, or redevelop.

### Investor

Represents capital looking for yield or appreciation. Investors bid on buildings,
apartments, or land, and may change owner strategy after acquisition.

### Developer

Represents actors who convert land or buildings into new supply when expected
profit beats risk and policy friction.

### Policy

Represents rent regulation, public acquisition, zoning changes, social housing
quotas, vacancy enforcement, subsidy programs, and transaction taxes.

## Hidden Dynamics To Reveal

The first prototype should make these visible:

- rent pressure versus purchase price pressure
- displacement risk by household income group
- vacancy as an owner strategy
- renovation as both quality improvement and rent pressure
- land value growth creating redevelopment incentives
- public/cooperative ownership dampening price feedback
- policy lag: interventions can help slowly while market pressure moves quickly

## Indicator Examples

Indicators should sit between raw simulation state and the UI. They are useful
because they turn many agent-level values into readable signals.

Good first indicators:

- average household income: mean monthly income across households
- average individual income: household monthly income divided by household size
- average rent burden: rent divided by monthly household income
- purchase affordability years: median unit sale price divided by annual average
  individual income
- regulated unit share: regulated units divided by all units
- vacancy rate: vacant units divided by all units
- displacement stress: average stress across households

Average individual income is a useful reference value because affordability
changes when the same household income supports one person versus several people.

## Mathematical Model

This prototype is an agent-based simulation with monthly discrete-time updates.
It is not calibrated to real Berlin data yet. The current method is a synthetic
system dynamics prototype: agents update prices, stress, and demand pressure from
simple behavioral rules. The purpose is to make feedback loops visible before
adding richer data or econometric calibration.

### Sets And Indices

- neighborhoods: `n in N`
- units: `u in U`
- owners: `o in O`
- households: `h in H`
- ticks/months: `t = 0, 1, 2, ...`

Each unit belongs to one neighborhood and one owner. Some units are occupied by
one household.

### Main State Variables

Neighborhood state:

- `D_n(t)`: demand pressure in neighborhood `n`, between `0` and `1`

Unit state:

- `R_u(t)`: monthly rent for unit `u`
- `P_u(t)`: estimated sale price for unit `u`
- `A_u`: unit area in square meters
- `V_u(t)`: vacancy flag, `1` if vacant and `0` if occupied
- `G_u`: regulation flag, `1` if regulated and `0` otherwise

Owner state:

- `q_o`: owner risk tolerance, between `0` and `1`
- `m_o`: owner social mission, between `0` and `1`

Household state:

- `Y_h`: monthly household income
- `S_h`: household size
- `B_h`: rent burden tolerance
- `X_h(t)`: displacement stress, between `0` and `1`

Policy/game lever state in the web prototype:

- `C`: rent regulation intensity, between `0` and `1`
- `E`: vacancy enforcement intensity, between `0` and `1`
- `A`: public acquisition/protection intensity, between `0` and `1`
- `I`: investor pressure, between `0` and `1`

### Demand Pressure Update

In the Python Mesa prototype, neighborhood demand pressure moves slowly toward a
district-level pull factor:

```text
pull_d = (attractiveness_d + transit_access_d + job_access_d + tourism_pressure_d) / 4

D_n(t + 1) = clamp(D_n(t) * 0.995 + pull_d * 0.005, 0, 1)
```

In the browser game prototype, demand pressure is controlled by policy and
investor pressure:

```text
D_n(t + 1) = clamp(D_n(t) + 0.006 * I - 0.003 * A, 0.25, 1)
```

Interpretation:

- investor pressure increases demand pressure
- public acquisition/protection reduces demand pressure
- `clamp` keeps the value inside a realistic gameplay range

### Rent Update

In the Python Mesa prototype, owners increase rent according to local demand and
their risk tolerance:

```text
growth_rent_u = 1 + D_n(t) * q_o * 0.006
```

If a unit is regulated, monthly rent growth is capped:

```text
growth_rent_u = min(growth_rent_u, 1.002)
```

Then:

```text
R_u(t + 1) = R_u(t) * growth_rent_u
```

In the web game prototype, regulation is represented as a continuous policy
lever:

```text
regulation_effect_u = C                 if G_u = 1
regulation_effect_u = 0.25 * C          if G_u = 0

market_growth_u = D_n(t) * q_o * 0.012
allowed_growth_u = market_growth_u * (1 - 0.78 * regulation_effect_u)

R_u(t + 1) = R_u(t) * (1 + max(0.001, allowed_growth_u))
```

Interpretation:

- high demand and high owner risk tolerance increase rents
- regulation slows rent growth
- the web prototype keeps a small positive minimum growth for gameplay motion

### Sale Price Update

The Python Mesa prototype updates estimated sale price from demand pressure and
the owner's social mission:

```text
growth_sale_u = 1 + D_n(t) * (1 - m_o) * 0.004

P_u(t + 1) = P_u(t) * growth_sale_u
```

The web game prototype also includes investor pressure:

```text
growth_sale_u = 1 + D_n(t) * (1 - m_o) * I * 0.011

P_u(t + 1) = P_u(t) * growth_sale_u
```

Interpretation:

- profit-oriented owners have lower `m_o`, so sale prices respond more strongly
- public/cooperative ownership has high `m_o`, which dampens speculative growth
- investor pressure amplifies sale-price growth

### Household Rent Burden And Stress

For an occupied unit, household rent burden is:

```text
burden_h(t) = R_u(t) / Y_h
```

Stress changes when burden is above or below tolerance:

```text
X_h(t + 1) = clamp(X_h(t) + 0.2 * (burden_h(t) - B_h), 0, 1)
```

The web prototype uses `0.22` instead of `0.2`:

```text
X_h(t + 1) = clamp(X_h(t) + 0.22 * (burden_h(t) - B_h), 0, 1)
```

Interpretation:

- if rent burden is above tolerance, displacement stress rises
- if rent burden is below tolerance, stress can fall
- stress is bounded between `0` and `1`

### Vacancy Enforcement

The web prototype models enforcement as a probability that a vacant unit returns
to rental supply:

```text
Pr(vacant unit returns to supply) = 0.08 * E
```

When enforcement succeeds, a new household is assigned with:

```text
Y_h = R_u(t) / 0.34
B_h = 0.34
X_h = 0.08
```

This means the new household begins at roughly `34%` rent burden.

### Rental-To-Sale Conversion Pressure

The web prototype includes a simple conversion rule for unregulated units:

```text
conversion_pressure_u =
  D_n(t) * q_o * I
  - 0.22 * C
  - 0.3 * m_o
```

If:

```text
conversion_pressure_u > 0.55
```

then the unit shifts toward the purchase market and receives a one-time sale
price increase:

```text
P_u(t + 1) = P_u(t + 1) * 1.035
```

Interpretation:

- high demand, high investor pressure, and high owner risk tolerance encourage
  conversion
- rent regulation and social mission discourage conversion

### Displacement Event

The web prototype includes a stochastic displacement event:

```text
if X_h(t) > 0.82:
  Pr(displacement) = 0.08 per month
```

When displacement occurs, the unit becomes vacant and the household is removed
from that unit.

### Indicators

The model records indicators after each tick.

Market price indicators:

```text
median_rent_per_sqm(t) = median(R_u(t) / A_u)
median_sale_price_per_sqm(t) = median(P_u(t) / A_u)
```

Vacancy:

```text
vacancy_rate(t) = count(V_u(t) = 1) / count(U)
```

Stress:

```text
average_displacement_stress(t) = mean(X_h(t))
```

Income:

```text
average_household_income_monthly = mean(Y_h)
average_individual_income_monthly = mean(Y_h / S_h)
```

Affordability:

```text
average_rent_burden(t) = mean(R_u(t) / Y_h)
purchase_price_to_income_years(t) =
  median(P_u(t)) / (12 * average_individual_income_monthly)
```

Regulation:

```text
regulated_unit_share = count(G_u = 1) / count(U)
```

### Current Method Limitations

- Values are synthetic and not calibrated to official Berlin datasets.
- Household search, moving chains, mortgage access, taxes, construction costs,
  and legal details are simplified or not yet implemented.
- The current model uses simple linear update rules. Later versions can replace
  them with calibrated functions, empirical distributions, or estimated
  parameters.
- The web prototype and Python prototype share the same concepts but not every
  coefficient. The browser version includes additional gameplay levers.

## Minimal Tick Loop

One tick can represent one month.

1. Update district demand pressure.
2. Households receive income, pay rent, and update stress.
3. Owners update expected rent, sale value, and holding costs.
4. Owners decide whether to list units for rent, list assets for sale, renovate,
   hold vacant, or redevelop.
5. Households search rentals or purchases if stressed, displaced, or moving.
6. Investors and developers bid on eligible assets.
7. Policy agent applies rules, subsidies, taxes, and enforcement.
8. Metrics are collected for the UI.

## Data Shape

Use JSON for early scenarios because it is easy to edit by hand and later replace
with GeoJSON or database-backed data.

Stable IDs matter. Every object should keep an ID:

- `district_id`
- `neighborhood_id`
- `parcel_id`
- `building_id`
- `unit_id`
- `owner_id`
- `household_id`

## Mitte-First Scenario

The Mitte seed should include a small number of representative neighborhoods
rather than a complete map:

- central high-demand area
- mixed residential area
- lower-income pressure area
- office/tourism-heavy area

The goal is not exact realism yet. The goal is a playable system where changing
rules makes surprising consequences visible.

## UI Later

Keep the model independent from UI. The future UI can read:

- current map cells or parcels
- household stress by area
- rent and sale price distributions
- owner decisions
- policy levers
- event log explaining why prices or displacement changed

Mesa can provide the prototype interface first. Later, a web UI can call the same
model through a small API.
