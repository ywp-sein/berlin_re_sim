from __future__ import annotations

from pathlib import Path
from statistics import mean, median

from berlin_re_sim.methods.base import SimulationMethod, load_scenario
from berlin_re_sim.parameters import ParameterSource, load_parameters, method_parameters
from berlin_re_sim.scenario import Scenario
from berlin_re_sim.schemas import MarketMetrics


class AnalyticalSimulation:
    """Deterministic aggregate baseline model."""

    method = SimulationMethod.ANALYTICAL

    def __init__(
        self, scenario: Scenario, seed: int | None = None, parameters: ParameterSource = None
    ) -> None:
        self.scenario = scenario
        self.parameters = method_parameters(load_parameters(parameters), self.method.value)
        self.tick = 0
        self.metrics: list[MarketMetrics] = []
        self.demand = mean(area.demand_pressure for area in scenario.neighborhoods)
        self.rent_multiplier = 1.0
        self.sale_multiplier = 1.0
        self.stress = 0.0
        self.vacancy = len([unit for unit in scenario.units if unit.vacant]) / len(scenario.units)
        self.collect_metrics()

    @classmethod
    def from_scenario_file(
        cls, path: str | Path, seed: int | None = None, parameters: ParameterSource = None
    ) -> AnalyticalSimulation:
        return cls(load_scenario(path), seed=seed, parameters=parameters)

    @classmethod
    def from_scenario(
        cls, scenario: Scenario, seed: int | None = None, parameters: ParameterSource = None
    ) -> AnalyticalSimulation:
        return cls(scenario, seed=seed, parameters=parameters)

    def step(self) -> None:
        self.tick += 1
        demand_inertia = self.parameters["demand_inertia"]
        self.demand = min(
            1.0,
            max(
                0.0,
                self.demand * demand_inertia
                + (1 - demand_inertia) * self.parameters["demand_pull"],
            ),
        )
        self.rent_multiplier *= 1 + self.parameters["rent_growth_coefficient"] * self.demand
        self.sale_multiplier *= 1 + self.parameters["sale_growth_coefficient"] * self.demand
        vacancy_inertia = self.parameters["vacancy_inertia"]
        vacancy_target = self.parameters["vacancy_demand_coefficient"] * self.demand
        self.vacancy = min(
            self.parameters["vacancy_max"],
            max(
                self.parameters["vacancy_min"],
                self.vacancy * vacancy_inertia + (1 - vacancy_inertia) * vacancy_target,
            ),
        )
        stress_inertia = self.parameters["stress_inertia"]
        self.stress = min(
            1.0,
            max(0.0, self.stress * stress_inertia + (1 - stress_inertia) * self.demand),
        )
        self.collect_metrics()

    def collect_metrics(self) -> None:
        units = [unit for unit in self.scenario.units if unit.sqm > 0]
        households = self.scenario.households
        average_household_income = mean(household.income_monthly for household in households)
        average_individual_income = mean(
            household.income_monthly / max(household.size, 1) for household in households
        )
        burdens = [
            unit.monthly_rent * self.rent_multiplier / max(household.income_monthly, 1)
            for unit in units
            for household in households
            if unit.household_id == household.id
        ]

        self.metrics.append(
            MarketMetrics(
                tick=self.tick,
                median_rent_per_sqm=median(unit.rent_per_sqm for unit in units)
                * self.rent_multiplier,
                median_sale_price_per_sqm=median(unit.sale_price_per_sqm for unit in units)
                * self.sale_multiplier,
                vacancy_rate=self.vacancy,
                average_displacement_stress=self.stress,
                average_household_income_monthly=average_household_income,
                average_individual_income_monthly=average_individual_income,
                average_rent_burden=mean(burdens) if burdens else 0.0,
                purchase_price_to_income_years=(
                    median(unit.estimated_sale_price for unit in units) * self.sale_multiplier
                )
                / max(average_individual_income * 12, 1),
                regulated_unit_share=len([unit for unit in units if unit.regulated]) / len(units),
            )
        )
