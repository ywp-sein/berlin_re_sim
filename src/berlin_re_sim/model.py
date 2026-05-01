from __future__ import annotations

from pathlib import Path
from statistics import mean, median

from mesa import Model

from berlin_re_sim.agents import HouseholdAgent, OwnerAgent
from berlin_re_sim.scenario import Scenario
from berlin_re_sim.schemas import Building, MarketMetrics, Neighborhood, Parcel, Unit


class BerlinRealEstateModel(Model):
    """Minimal Mesa-compatible model for a Mitte-first real estate game."""

    def __init__(self, scenario: Scenario, seed: int | None = None) -> None:
        super().__init__(seed=seed)
        self.scenario = scenario
        self.tick = 0
        self.metrics: list[MarketMetrics] = []

        self.neighborhoods = {item.id: item for item in scenario.neighborhoods}
        self.parcels = {item.id: item for item in scenario.parcels}
        self.buildings = {item.id: item for item in scenario.buildings}
        self.units = {item.id: item for item in scenario.units}
        self.unit_by_household = {
            unit.household_id: unit for unit in scenario.units if unit.household_id is not None
        }

        self.household_agents = [HouseholdAgent(self, item) for item in scenario.households]
        self.owner_agents = [OwnerAgent(self, item) for item in scenario.owners]
        self.collect_metrics()

    @classmethod
    def from_scenario_file(cls, path: str | Path, seed: int | None = None) -> BerlinRealEstateModel:
        return cls(Scenario.from_file(path), seed=seed)

    def step(self) -> None:
        self.tick += 1
        self._update_demand_pressure()

        for agent in self.owner_agents:
            agent.step()
        for agent in self.household_agents:
            agent.step()

        self.collect_metrics()

    def units_for_owner(self, owner_id: str) -> list[Unit]:
        parcel_ids = {parcel.id for parcel in self.parcels.values() if parcel.owner_id == owner_id}
        building_ids = {
            building.id for building in self.buildings.values() if building.parcel_id in parcel_ids
        }
        return [unit for unit in self.units.values() if unit.building_id in building_ids]

    def neighborhood_for_unit(self, unit_id: str) -> Neighborhood:
        unit = self.units[unit_id]
        building = self.buildings[unit.building_id]
        parcel = self.parcels[building.parcel_id]
        return self.neighborhoods[parcel.neighborhood_id]

    def collect_metrics(self) -> None:
        occupied_or_listed_units = [unit for unit in self.units.values() if unit.sqm > 0]
        vacant_units = [unit for unit in occupied_or_listed_units if unit.vacant]
        household_stress = [agent.profile.displacement_stress for agent in self.household_agents]

        self.metrics.append(
            MarketMetrics(
                tick=self.tick,
                median_rent_per_sqm=median(unit.rent_per_sqm for unit in occupied_or_listed_units),
                median_sale_price_per_sqm=median(
                    unit.sale_price_per_sqm for unit in occupied_or_listed_units
                ),
                vacancy_rate=len(vacant_units) / len(occupied_or_listed_units),
                average_displacement_stress=mean(household_stress) if household_stress else 0.0,
            )
        )

    def _update_demand_pressure(self) -> None:
        district_by_id = {district.id: district for district in self.scenario.districts}
        for neighborhood in self.neighborhoods.values():
            district = district_by_id[neighborhood.district_id]
            pull = (
                district.attractiveness
                + district.transit_access
                + district.job_access
                + district.tourism_pressure
            ) / 4
            neighborhood.demand_pressure = min(
                1.0,
                max(0.0, neighborhood.demand_pressure * 0.995 + pull * 0.005),
            )
