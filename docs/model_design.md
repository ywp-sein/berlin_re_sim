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
