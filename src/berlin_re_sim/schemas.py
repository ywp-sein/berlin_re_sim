from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum


class Tenure(StrEnum):
    RENTAL = "rental"
    OWNER_OCCUPIED = "owner_occupied"
    VACANT = "vacant"


class OwnerKind(StrEnum):
    PRIVATE_LANDLORD = "private_landlord"
    HOUSING_COMPANY = "housing_company"
    PUBLIC = "public"
    COOPERATIVE = "cooperative"
    OWNER_OCCUPIER = "owner_occupier"
    INVESTOR = "investor"


@dataclass(slots=True)
class District:
    id: str
    name: str
    attractiveness: float
    transit_access: float
    job_access: float
    tourism_pressure: float
    policy_intensity: float


@dataclass(slots=True)
class Neighborhood:
    id: str
    district_id: str
    name: str
    demand_pressure: float
    income_mix: str


@dataclass(slots=True)
class Parcel:
    id: str
    neighborhood_id: str
    land_value: float
    zoning_capacity: int
    redevelopment_friction: float
    owner_id: str


@dataclass(slots=True)
class Building:
    id: str
    parcel_id: str
    built_year: int
    condition: float
    energy_quality: float
    renovation_level: float
    operating_cost_per_sqm: float


@dataclass(slots=True)
class Unit:
    id: str
    building_id: str
    sqm: float
    rooms: int
    tenure: Tenure
    monthly_rent: float
    estimated_sale_price: float
    regulated: bool
    vacant: bool
    household_id: str | None

    @property
    def rent_per_sqm(self) -> float:
        return self.monthly_rent / self.sqm

    @property
    def sale_price_per_sqm(self) -> float:
        return self.estimated_sale_price / self.sqm


@dataclass(slots=True)
class OwnerProfile:
    id: str
    kind: OwnerKind
    liquidity: float
    risk_tolerance: float
    social_mission: float


@dataclass(slots=True)
class HouseholdProfile:
    id: str
    income_monthly: float
    savings: float
    size: int
    rent_burden_tolerance: float
    buying_interest: float
    neighborhood_preference: str
    displacement_stress: float = 0.0


@dataclass(slots=True)
class MarketMetrics:
    tick: int
    median_rent_per_sqm: float
    median_sale_price_per_sqm: float
    vacancy_rate: float
    average_displacement_stress: float
    average_household_income_monthly: float
    average_individual_income_monthly: float
    average_rent_burden: float
    purchase_price_to_income_years: float
    regulated_unit_share: float
