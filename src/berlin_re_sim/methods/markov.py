from __future__ import annotations

import random
from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from statistics import mean, median

from berlin_re_sim.methods.base import SimulationMethod, load_scenario
from berlin_re_sim.scenario import Scenario
from berlin_re_sim.schemas import MarketMetrics


class MarketState(StrEnum):
    STABLE_AFFORDABLE = "stable_affordable"
    RENT_PRESSURE = "rent_pressure"
    PURCHASE_PRESSURE = "purchase_pressure"
    VACANCY_PRESSURE = "vacancy_pressure"
    DISPLACEMENT_PRESSURE = "displacement_pressure"
    SPECULATIVE_CONVERSION = "speculative_conversion"
    PUBLIC_STABILIZED = "public_stabilized"


@dataclass(frozen=True, slots=True)
class StateEffect:
    rent_multiplier: float
    sale_multiplier: float
    vacancy_rate: float
    stress: float


STATE_EFFECTS: dict[MarketState, StateEffect] = {
    MarketState.STABLE_AFFORDABLE: StateEffect(1.00, 1.00, 0.06, 0.12),
    MarketState.RENT_PRESSURE: StateEffect(1.18, 1.08, 0.04, 0.35),
    MarketState.PURCHASE_PRESSURE: StateEffect(1.08, 1.24, 0.05, 0.22),
    MarketState.VACANCY_PRESSURE: StateEffect(1.10, 1.16, 0.18, 0.26),
    MarketState.DISPLACEMENT_PRESSURE: StateEffect(1.28, 1.18, 0.09, 0.68),
    MarketState.SPECULATIVE_CONVERSION: StateEffect(1.14, 1.38, 0.14, 0.48),
    MarketState.PUBLIC_STABILIZED: StateEffect(0.92, 0.88, 0.03, 0.08),
}


TRANSITIONS: dict[MarketState, list[tuple[MarketState, float]]] = {
    MarketState.STABLE_AFFORDABLE: [
        (MarketState.STABLE_AFFORDABLE, 0.46),
        (MarketState.RENT_PRESSURE, 0.18),
        (MarketState.PURCHASE_PRESSURE, 0.16),
        (MarketState.PUBLIC_STABILIZED, 0.20),
    ],
    MarketState.RENT_PRESSURE: [
        (MarketState.RENT_PRESSURE, 0.38),
        (MarketState.DISPLACEMENT_PRESSURE, 0.24),
        (MarketState.SPECULATIVE_CONVERSION, 0.18),
        (MarketState.PUBLIC_STABILIZED, 0.20),
    ],
    MarketState.PURCHASE_PRESSURE: [
        (MarketState.PURCHASE_PRESSURE, 0.40),
        (MarketState.SPECULATIVE_CONVERSION, 0.28),
        (MarketState.RENT_PRESSURE, 0.16),
        (MarketState.STABLE_AFFORDABLE, 0.16),
    ],
    MarketState.VACANCY_PRESSURE: [
        (MarketState.VACANCY_PRESSURE, 0.36),
        (MarketState.RENT_PRESSURE, 0.20),
        (MarketState.SPECULATIVE_CONVERSION, 0.22),
        (MarketState.PUBLIC_STABILIZED, 0.22),
    ],
    MarketState.DISPLACEMENT_PRESSURE: [
        (MarketState.DISPLACEMENT_PRESSURE, 0.42),
        (MarketState.VACANCY_PRESSURE, 0.18),
        (MarketState.PUBLIC_STABILIZED, 0.24),
        (MarketState.RENT_PRESSURE, 0.16),
    ],
    MarketState.SPECULATIVE_CONVERSION: [
        (MarketState.SPECULATIVE_CONVERSION, 0.44),
        (MarketState.PURCHASE_PRESSURE, 0.22),
        (MarketState.DISPLACEMENT_PRESSURE, 0.18),
        (MarketState.PUBLIC_STABILIZED, 0.16),
    ],
    MarketState.PUBLIC_STABILIZED: [
        (MarketState.PUBLIC_STABILIZED, 0.50),
        (MarketState.STABLE_AFFORDABLE, 0.24),
        (MarketState.RENT_PRESSURE, 0.14),
        (MarketState.PURCHASE_PRESSURE, 0.12),
    ],
}


class MarkovChainSimulation:
    """Time-independent state-machine simulation over market regimes."""

    method = SimulationMethod.MARKOV_CHAIN

    def __init__(
        self,
        scenario: Scenario,
        seed: int | None = None,
        initial_state: MarketState = MarketState.STABLE_AFFORDABLE,
    ) -> None:
        self.scenario = scenario
        self.random = random.Random(seed)
        self.tick = 0
        self.current_state = initial_state
        self.state_history: list[MarketState] = [initial_state]
        self.metrics: list[MarketMetrics] = []
        self.collect_metrics()

    @classmethod
    def from_scenario_file(
        cls, path: str | Path, seed: int | None = None
    ) -> MarkovChainSimulation:
        return cls(load_scenario(path), seed=seed)

    @classmethod
    def from_scenario(
        cls, scenario: Scenario, seed: int | None = None
    ) -> MarkovChainSimulation:
        return cls(scenario, seed=seed)

    def step(self) -> None:
        self.tick += 1
        self.current_state = self._sample_next_state()
        self.state_history.append(self.current_state)
        self.collect_metrics()

    def collect_metrics(self) -> None:
        effect = STATE_EFFECTS[self.current_state]
        units = [unit for unit in self.scenario.units if unit.sqm > 0]
        households = self.scenario.households
        average_household_income = mean(household.income_monthly for household in households)
        average_individual_income = mean(
            household.income_monthly / max(household.size, 1) for household in households
        )
        base_burdens = [
            unit.monthly_rent / max(household.income_monthly, 1)
            for unit in units
            for household in households
            if unit.household_id == household.id
        ]

        self.metrics.append(
            MarketMetrics(
                tick=self.tick,
                median_rent_per_sqm=median(unit.rent_per_sqm for unit in units)
                * effect.rent_multiplier,
                median_sale_price_per_sqm=median(unit.sale_price_per_sqm for unit in units)
                * effect.sale_multiplier,
                vacancy_rate=effect.vacancy_rate,
                average_displacement_stress=effect.stress,
                average_household_income_monthly=average_household_income,
                average_individual_income_monthly=average_individual_income,
                average_rent_burden=(mean(base_burdens) if base_burdens else 0.0)
                * effect.rent_multiplier,
                purchase_price_to_income_years=(
                    median(unit.estimated_sale_price for unit in units) * effect.sale_multiplier
                )
                / max(average_individual_income * 12, 1),
                regulated_unit_share=len([unit for unit in units if unit.regulated]) / len(units),
            )
        )

    def _sample_next_state(self) -> MarketState:
        draw = self.random.random()
        cumulative = 0.0
        for next_state, probability in TRANSITIONS[self.current_state]:
            cumulative += probability
            if draw <= cumulative:
                return next_state
        return TRANSITIONS[self.current_state][-1][0]
