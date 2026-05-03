from __future__ import annotations

import random
from dataclasses import dataclass
from enum import StrEnum
from pathlib import Path
from statistics import mean, median

from berlin_re_sim.methods.base import SimulationMethod, load_scenario
from berlin_re_sim.parameters import ParameterSource, load_parameters
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


class MarkovChainSimulation:
    """Time-independent state-machine simulation over market regimes."""

    method = SimulationMethod.MARKOV_CHAIN

    def __init__(
        self,
        scenario: Scenario,
        seed: int | None = None,
        initial_state: MarketState | str | None = None,
        parameters: ParameterSource = None,
    ) -> None:
        self.scenario = scenario
        self.parameters = load_parameters(parameters)["state_models"]
        self.state_effects = parse_state_effects(self.parameters["state_effects"])
        self.transitions = parse_transitions(self.parameters["transitions"])
        self.random = random.Random(seed)
        self.tick = 0
        if initial_state is None:
            initial_state = self.parameters["initial_state"]
        initial_state = MarketState(initial_state)
        self.current_state = initial_state
        self.state_history: list[MarketState] = [initial_state]
        self.metrics: list[MarketMetrics] = []
        self.collect_metrics()

    @classmethod
    def from_scenario_file(
        cls, path: str | Path, seed: int | None = None, parameters: ParameterSource = None
    ) -> MarkovChainSimulation:
        return cls(load_scenario(path), seed=seed, parameters=parameters)

    @classmethod
    def from_scenario(
        cls, scenario: Scenario, seed: int | None = None, parameters: ParameterSource = None
    ) -> MarkovChainSimulation:
        return cls(scenario, seed=seed, parameters=parameters)

    def step(self) -> None:
        self.tick += 1
        self.current_state = self._sample_next_state()
        self.state_history.append(self.current_state)
        self.collect_metrics()

    def collect_metrics(self) -> None:
        effect = self.state_effects[self.current_state]
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
        for next_state, probability in self.transitions[self.current_state]:
            cumulative += probability
            if draw <= cumulative:
                return next_state
        return self.transitions[self.current_state][-1][0]


def parse_state_effects(data: dict[str, dict[str, float]]) -> dict[MarketState, StateEffect]:
    return {
        MarketState(state): StateEffect(
            rent_multiplier=effect["rent_multiplier"],
            sale_multiplier=effect["sale_multiplier"],
            vacancy_rate=effect["vacancy_rate"],
            stress=effect["stress"],
        )
        for state, effect in data.items()
    }


def parse_transitions(
    data: dict[str, dict[str, float]],
) -> dict[MarketState, list[tuple[MarketState, float]]]:
    transitions = {
        MarketState(state): [
            (MarketState(next_state), probability) for next_state, probability in row.items()
        ]
        for state, row in data.items()
    }
    for state, row in transitions.items():
        probability_sum = sum(probability for _, probability in row)
        if abs(probability_sum - 1.0) > 0.000001:
            raise ValueError(
                f"Transition probabilities for {state.value} must sum to 1.0, "
                f"got {probability_sum:.6f}"
            )
    return transitions
