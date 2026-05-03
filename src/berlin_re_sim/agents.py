from __future__ import annotations

from mesa import Agent

from berlin_re_sim.schemas import HouseholdProfile, OwnerProfile


class HouseholdAgent(Agent):
    def __init__(self, model, profile: HouseholdProfile) -> None:
        super().__init__(model)
        self.profile = profile

    def step(self) -> None:
        unit = self.model.unit_by_household.get(self.profile.id)
        if unit is None:
            self.profile.displacement_stress = min(
                1.0,
                self.profile.displacement_stress
                + self.model.parameters["household_unassigned_stress_delta"],
            )
            return

        rent_burden = unit.monthly_rent / max(self.profile.income_monthly, 1)
        stress_delta = rent_burden - self.profile.rent_burden_tolerance
        self.profile.displacement_stress = min(
            1.0,
            max(
                0.0,
                self.profile.displacement_stress
                + stress_delta * self.model.parameters["household_stress_coefficient"],
            ),
        )


class OwnerAgent(Agent):
    def __init__(self, model, profile: OwnerProfile) -> None:
        super().__init__(model)
        self.profile = profile

    def step(self) -> None:
        owned_units = self.model.units_for_owner(self.profile.id)
        for unit in owned_units:
            neighborhood = self.model.neighborhood_for_unit(unit.id)
            pressure = neighborhood.demand_pressure

            rent_growth = 1 + (
                pressure
                * self.profile.risk_tolerance
                * self.model.parameters["owner_rent_growth_coefficient"]
            )
            if unit.regulated:
                rent_growth = min(rent_growth, self.model.parameters["regulated_rent_growth_cap"])
            unit.monthly_rent *= rent_growth

            appreciation = 1 + (
                pressure
                * (1 - self.profile.social_mission)
                * self.model.parameters["owner_sale_growth_coefficient"]
            )
            unit.estimated_sale_price *= appreciation
