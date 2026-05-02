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

## Method Used Now

The current prototype combines two simple methods:

- **Agent-based model (ABM):** households, owners, and units are represented as
  separate entities. Owners update rents and sale prices; households update
  displacement stress.
- **Discrete-time system dynamics:** the model advances in monthly ticks. Market
  pressure, rent, sale price, and stress are updated by recurrence equations.

In short, the current method is:

$$
\text{synthetic monthly ABM} + \text{rule-based state updates}
$$

This is useful for early gameplay and intuition. It is not yet a statistically
estimated model.

### Sets And Indices

- neighborhoods: $n \in N$
- units: $u \in U$
- owners: $o \in O$
- households: $h \in H$
- ticks/months: $t = 0, 1, 2, \ldots$

Each unit belongs to one neighborhood and one owner. Some units are occupied by
one household.

### Main State Variables

Neighborhood state:

- $D_n(t)$: demand pressure in neighborhood $n$, between $0$ and $1$

Unit state:

- $R_u(t)$: monthly rent for unit $u$
- $P_u(t)$: estimated sale price for unit $u$
- $A_u$: unit area in square meters
- $V_u(t)$: vacancy flag, $1$ if vacant and $0$ if occupied
- $G_u$: regulation flag, $1$ if regulated and $0$ otherwise

Owner state:

- $q_o$: owner risk tolerance, between $0$ and $1$
- $m_o$: owner social mission, between $0$ and $1$

Household state:

- $Y_h$: monthly household income
- $S_h$: household size
- $B_h$: rent burden tolerance
- $X_h(t)$: displacement stress, between $0$ and $1$

Policy/game lever state in the web prototype:

- $C$: rent regulation intensity, between $0$ and $1$
- $E$: vacancy enforcement intensity, between $0$ and $1$
- $A$: public acquisition/protection intensity, between $0$ and $1$
- $I$: investor pressure, between $0$ and $1$

The clamp function is:

$$
\operatorname{clamp}(x, a, b) = \min(b, \max(a, x))
$$

### Demand Pressure Update

In the Python Mesa prototype, neighborhood demand pressure moves slowly toward a
district-level pull factor:

$$
\operatorname{pull}_d =
\frac{
  \operatorname{attractiveness}_d
  + \operatorname{transit}_d
  + \operatorname{jobs}_d
  + \operatorname{tourism}_d
}{4}
$$

$$
D_n(t+1) =
\operatorname{clamp}
\left(
  0.995D_n(t) + 0.005\operatorname{pull}_d,
  0,
  1
\right)
$$

In the browser game prototype, demand pressure is controlled by policy and
investor pressure:

$$
D_n(t+1) =
\operatorname{clamp}
\left(
  D_n(t) + 0.006I - 0.003A,
  0.25,
  1
\right)
$$

Interpretation:

- investor pressure increases demand pressure
- public acquisition/protection reduces demand pressure
- $\operatorname{clamp}$ keeps the value inside a realistic gameplay range

### Area-To-Area Influence

It makes sense to model each area as influencing nearby or connected areas. In
the UI this appears as directed weighted edges on the map. Each edge means that
pressure in one area can spill into another area.

Let $W_{ij}$ be the influence weight from area $i$ to area $j$. A future demand
pressure update can include neighborhood spillover:

$$
\operatorname{spillover}_j(t)
=
\sum_{i \in N}
W_{ij}D_i(t)
$$

$$
D_j(t+1)
=
\operatorname{clamp}
\left(
  \lambda D_j(t)
  + (1-\lambda)\operatorname{pull}_j(t)
  + \beta \operatorname{spillover}_j(t),
  0,
  1
\right)
$$

where:

- $W_{ij}$ is higher when areas are close, transit-connected, or economically
  linked
- $\lambda$ controls inertia
- $\beta$ controls how strongly spillovers affect demand
- positive edges can represent rent, purchase, office, tourism, or displacement
  pressure
- negative or dampening edges can represent public ownership or cooperative
  stabilization

### Rent Update

In the Python Mesa prototype, owners increase rent according to local demand and
their risk tolerance:

$$
g^R_u(t) = 1 + 0.006D_n(t)q_o
$$

If a unit is regulated, monthly rent growth is capped:

$$
g^R_u(t) = \min(g^R_u(t), 1.002)
\quad \text{if } G_u = 1
$$

Then:

$$
R_u(t+1) = R_u(t)g^R_u(t)
$$

In the web game prototype, regulation is represented as a continuous policy
lever:

$$
\rho_u =
\begin{cases}
C, & G_u = 1 \\
0.25C, & G_u = 0
\end{cases}
$$

$$
\gamma^R_u(t) = 0.012D_n(t)q_o
$$

$$
\tilde{\gamma}^R_u(t) =
\gamma^R_u(t)(1 - 0.78\rho_u)
$$

$$
R_u(t+1) =
R_u(t)
\left(
  1 + \max(0.001, \tilde{\gamma}^R_u(t))
\right)
$$

Interpretation:

- high demand and high owner risk tolerance increase rents
- regulation slows rent growth
- the web prototype keeps a small positive minimum growth for gameplay motion

### Sale Price Update

The Python Mesa prototype updates estimated sale price from demand pressure and
the owner's social mission:

$$
g^P_u(t) = 1 + 0.004D_n(t)(1 - m_o)
$$

$$
P_u(t+1) = P_u(t)g^P_u(t)
$$

The web game prototype also includes investor pressure:

$$
g^P_u(t) = 1 + 0.011D_n(t)(1 - m_o)I
$$

$$
P_u(t+1) = P_u(t)g^P_u(t)
$$

Interpretation:

- profit-oriented owners have lower $m_o$, so sale prices respond more strongly
- public/cooperative ownership has high $m_o$, which dampens speculative growth
- investor pressure amplifies sale-price growth

### Household Rent Burden And Stress

For an occupied unit, household rent burden is:

$$
b_h(t) = \frac{R_u(t)}{Y_h}
$$

Stress changes when burden is above or below tolerance:

$$
X_h(t+1) =
\operatorname{clamp}
\left(
  X_h(t) + 0.2(b_h(t) - B_h),
  0,
  1
\right)
$$

The web prototype uses $0.22$ instead of $0.2$:

$$
X_h(t+1) =
\operatorname{clamp}
\left(
  X_h(t) + 0.22(b_h(t) - B_h),
  0,
  1
\right)
$$

Interpretation:

- if rent burden is above tolerance, displacement stress rises
- if rent burden is below tolerance, stress can fall
- stress is bounded between $0$ and $1$

### Vacancy Enforcement

The web prototype models enforcement as a probability that a vacant unit returns
to rental supply:

$$
\Pr(V_u(t+1) = 0 \mid V_u(t) = 1) = 0.08E
$$

When enforcement succeeds, a new household is assigned with:

$$
Y_h = \frac{R_u(t)}{0.34}
$$

$$
B_h = 0.34
$$

$$
X_h = 0.08
$$

This means the new household begins at roughly $34\%$ rent burden.

### Rental-To-Sale Conversion Pressure

The web prototype includes a simple conversion rule for unregulated units:

$$
K_u(t) =
D_n(t)q_oI - 0.22C - 0.3m_o
$$

If:

$$
K_u(t) > 0.55
$$

then the unit shifts toward the purchase market and receives a one-time sale
price increase:

$$
P_u(t+1) \leftarrow 1.035P_u(t+1)
$$

Interpretation:

- high demand, high investor pressure, and high owner risk tolerance encourage
  conversion
- rent regulation and social mission discourage conversion

### Displacement Event

The web prototype includes a stochastic displacement event:

$$
\Pr(\text{displacement at } t+1 \mid X_h(t) > 0.82) = 0.08
$$

When displacement occurs, the unit becomes vacant and the household is removed
from that unit.

### Indicators

The model records indicators after each tick.

Market price indicators:

$$
\operatorname{median\_rent\_per\_sqm}(t)
=
\operatorname{median}_{u \in U}
\left(
  \frac{R_u(t)}{A_u}
\right)
$$

$$
\operatorname{median\_sale\_price\_per\_sqm}(t)
=
\operatorname{median}_{u \in U}
\left(
  \frac{P_u(t)}{A_u}
\right)
$$

Vacancy:

$$
\operatorname{vacancy\_rate}(t)
=
\frac{\sum_{u \in U} \mathbf{1}[V_u(t)=1]}{|U|}
$$

Stress:

$$
\operatorname{average\_displacement\_stress}(t)
=
\frac{1}{|H|}
\sum_{h \in H} X_h(t)
$$

Income:

$$
\operatorname{average\_household\_income}
=
\frac{1}{|H|}
\sum_{h \in H} Y_h
$$

$$
\operatorname{average\_individual\_income}
=
\frac{1}{|H|}
\sum_{h \in H}
\frac{Y_h}{S_h}
$$

Affordability:

$$
\operatorname{average\_rent\_burden}(t)
=
\frac{1}{|H|}
\sum_{h \in H}
\frac{R_{u(h)}(t)}{Y_h}
$$

Here $u(h)$ is the unit occupied by household $h$.

$$
\operatorname{purchase\_price\_to\_income\_years}(t)
=
\frac{
  \operatorname{median}_{u \in U}(P_u(t))
}{
  12 \cdot \operatorname{average\_individual\_income}
}
$$

Regulation:

$$
\operatorname{regulated\_unit\_share}
=
\frac{\sum_{u \in U} \mathbf{1}[G_u=1]}{|U|}
$$

## Model Switching Roadmap

The project should eventually support multiple simulation methods behind the
same scenario data. A useful interface would be:

```text
Scenario data -> Model adapter -> Simulation result -> UI indicators
```

Current code structure:

- `src/berlin_re_sim/methods/base.py`: method enum and common protocol
- `src/berlin_re_sim/methods/abm.py`: Mesa-backed agent-based method
- `src/berlin_re_sim/methods/analytical.py`: deterministic aggregate baseline
- `src/berlin_re_sim/methods/markov.py`: time-independent Markov state method
- `src/berlin_re_sim/methods/mcmc.py`: Metropolis-Hastings state sampler
- `src/berlin_re_sim/methods/factory.py`: method selection entry point
- `web/game.js`: browser method selector for the playable prototype

Candidate model types:

- **Agent-based model:** best for heterogeneous actors, behavioral rules, and
  visible individual decisions.
- **System dynamics model:** best for aggregate feedback loops when individual
  units are less important.
- **Markov chain model:** best for state-machine analysis, where the focus is
  transition probability between market states.
- **MCMC / Bayesian model:** best for exploring plausible state distributions or
  estimating uncertain parameters from data.
- **Hybrid model:** ABM for local behavior, Markov or Bayesian layer for
  uncertainty and long-run regime probabilities.

## Time-Independent Markov / MCMC State Model

A time-independent model treats the scenario as a state machine rather than a
calendar process. The transition probabilities do not depend on month $t$
directly. They depend only on the current state:

$$
\Pr(Z_{k+1}=j \mid Z_k=i, Z_{k-1}, \ldots, Z_0)
=
\Pr(Z_{k+1}=j \mid Z_k=i)
=
T_{ij}
$$

Here:

- $Z_k$ is the scenario state at Markov step $k$
- $i$ and $j$ are discrete scenario states
- $T$ is the transition matrix
- $T_{ij}$ is the probability of moving from state $i$ to state $j$

Example state categories:

- `stable_affordable`
- `rent_pressure`
- `purchase_pressure`
- `vacancy_pressure`
- `displacement_pressure`
- `speculative_conversion`
- `public_stabilized`

A simple state vector could be:

$$
z =
\left[
  \operatorname{rent\_level},
  \operatorname{sale\_level},
  \operatorname{vacancy\_level},
  \operatorname{stress\_level},
  \operatorname{ownership\_mix}
\right]
$$

Each component can be discretized into bins, for example `low`, `medium`, and
`high`. This creates a finite state space that can be investigated as a Markov
chain.

### Markov Chain Analysis

If the transition matrix $T$ is known or assumed, the state distribution evolves
as:

$$
\pi_{k+1} = \pi_k T
$$

The long-run stationary distribution $\pi^\*$ satisfies:

$$
\pi^\* = \pi^\* T
$$

This is useful for questions like:

- What long-run state is the scenario most likely to enter?
- Does strong rent regulation lead to `public_stabilized` or
  `speculative_conversion` under the assumed transition rules?
- Which states are absorbing or nearly absorbing?
- How often does the system visit displacement-heavy states?

### MCMC Interpretation

MCMC can be used when the transition matrix or model parameters are uncertain.
Instead of simulating calendar time, it samples plausible states or plausible
parameters.

Let $\theta$ be unknown parameters, such as:

$$
\theta =
\left[
  \alpha_R,
  \alpha_P,
  \alpha_V,
  \alpha_X,
  \alpha_C
\right]
$$

where:

- $\alpha_R$ controls rent pressure
- $\alpha_P$ controls purchase-price pressure
- $\alpha_V$ controls vacancy behavior
- $\alpha_X$ controls displacement stress
- $\alpha_C$ controls conversion pressure

The target distribution could be:

$$
p(\theta \mid y)
\propto
p(y \mid \theta)p(\theta)
$$

where:

- $y$ is observed or desired scenario evidence
- $p(y \mid \theta)$ is the likelihood
- $p(\theta)$ is the prior
- $p(\theta \mid y)$ is the posterior distribution

With Metropolis-Hastings:

$$
\theta' \sim q(\theta' \mid \theta)
$$

$$
a =
\min
\left(
  1,
  \frac{
    p(y \mid \theta')p(\theta')q(\theta \mid \theta')
  }{
    p(y \mid \theta)p(\theta)q(\theta' \mid \theta)
  }
\right)
$$

Accept $\theta'$ with probability $a$.

This would let the project ask:

- Which parameter combinations make displacement pressure likely?
- Which hidden states explain a scenario with high sale prices but moderate
  rent?
- Under uncertainty, how often does the scenario fall into each market regime?
- How sensitive are outcomes to regulation, investor pressure, and ownership
  mix?

### How MCMC Fits This Project

The current ABM answers:

$$
\text{Given rules and initial state, what happens over monthly ticks?}
$$

The Markov/MCMC model would answer:

$$
\text{Given uncertain state transitions, what regimes are plausible?}
$$

So the two approaches are complementary:

- use ABM for interactive gameplay and causal storytelling
- use Markov chains for state-machine structure and long-run regime analysis
- use MCMC for uncertainty, posterior sampling, and parameter exploration

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
