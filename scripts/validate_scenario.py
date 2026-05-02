"""Validate scenario structure and internal ID references."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


REQUIRED_TOP_LEVEL = [
    "name",
    "schema_version",
    "metadata",
    "tick_length",
    "districts",
    "neighborhoods",
    "parcels",
    "buildings",
    "units",
    "owners",
    "households",
]

REQUIRED_FIELDS = {
    "districts": ["id", "name"],
    "neighborhoods": ["id", "district_id", "name", "demand_pressure", "income_mix"],
    "parcels": ["id", "neighborhood_id", "owner_id", "land_value"],
    "buildings": ["id", "parcel_id", "built_year"],
    "units": ["id", "building_id", "sqm", "monthly_rent", "estimated_sale_price", "vacant"],
    "owners": ["id", "kind", "risk_tolerance", "social_mission"],
    "households": ["id", "income_monthly", "size", "rent_burden_tolerance"],
}

RATE_FIELDS = {
    "neighborhoods": ["demand_pressure"],
    "parcels": ["redevelopment_friction"],
    "buildings": ["condition", "energy_quality", "renovation_level"],
    "owners": ["risk_tolerance", "social_mission"],
    "households": ["rent_burden_tolerance", "buying_interest", "displacement_stress"],
}

POSITIVE_FIELDS = {
    "parcels": ["land_value", "zoning_capacity"],
    "buildings": ["operating_cost_per_sqm"],
    "units": ["sqm", "monthly_rent", "estimated_sale_price"],
    "owners": ["liquidity"],
    "households": ["income_monthly", "size"],
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate a Berlin real estate scenario.")
    parser.add_argument("scenario", nargs="?", default="data/scenarios/mitte_seed.json")
    args = parser.parse_args()

    errors = validate_scenario(json.loads(Path(args.scenario).read_text(encoding="utf-8")))
    if errors:
        print(f"{args.scenario}: invalid")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)

    print(f"{args.scenario}: valid")


def validate_scenario(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    errors.extend(validate_top_level(data))
    if errors:
        return errors

    ids = {
        name: collect_ids(data, name, errors)
        for name in ["districts", "neighborhoods", "parcels", "buildings", "units", "owners", "households"]
    }

    for collection, fields in REQUIRED_FIELDS.items():
        for item in data[collection]:
            for field in fields:
                if field not in item:
                    errors.append(f"{collection}.{item.get('id', '<missing id>')} missing {field}")

    validate_ranges(data, errors)
    validate_references(data, ids, errors)
    validate_influence_edges(data, ids, errors)
    validate_household_occupancy(data, errors)
    return errors


def validate_top_level(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    for field in REQUIRED_TOP_LEVEL:
        if field not in data:
            errors.append(f"missing top-level field {field}")
    for collection in REQUIRED_TOP_LEVEL:
        if collection in {"name", "schema_version", "metadata", "tick_length"}:
            continue
        if collection in data and not isinstance(data[collection], list):
            errors.append(f"{collection} must be a list")
    return errors


def collect_ids(data: dict[str, Any], collection: str, errors: list[str]) -> set[str]:
    seen: set[str] = set()
    for index, item in enumerate(data[collection]):
        item_id = item.get("id")
        if not item_id:
            errors.append(f"{collection}[{index}] missing id")
            continue
        if item_id in seen:
            errors.append(f"{collection} has duplicate id {item_id}")
        seen.add(item_id)
    return seen


def validate_ranges(data: dict[str, Any], errors: list[str]) -> None:
    for collection, fields in RATE_FIELDS.items():
        for item in data[collection]:
            for field in fields:
                if field in item and not 0 <= item[field] <= 1:
                    errors.append(f"{collection}.{item.get('id')}.{field} must be between 0 and 1")

    for collection, fields in POSITIVE_FIELDS.items():
        for item in data[collection]:
            for field in fields:
                if field in item and item[field] < 0:
                    errors.append(f"{collection}.{item.get('id')}.{field} must be non-negative")


def validate_references(data: dict[str, Any], ids: dict[str, set[str]], errors: list[str]) -> None:
    for neighborhood in data["neighborhoods"]:
        require_reference(neighborhood, "district_id", ids["districts"], "neighborhoods", errors)
    for parcel in data["parcels"]:
        require_reference(parcel, "neighborhood_id", ids["neighborhoods"], "parcels", errors)
        require_reference(parcel, "owner_id", ids["owners"], "parcels", errors)
    for building in data["buildings"]:
        require_reference(building, "parcel_id", ids["parcels"], "buildings", errors)
    for unit in data["units"]:
        require_reference(unit, "building_id", ids["buildings"], "units", errors)
        household_id = unit.get("household_id")
        if household_id is not None and household_id not in ids["households"]:
            errors.append(f"units.{unit.get('id')}.household_id references unknown household {household_id}")
    for household in data["households"]:
        preference = household.get("neighborhood_preference")
        if preference and preference not in ids["neighborhoods"]:
            errors.append(
                f"households.{household.get('id')}.neighborhood_preference references unknown neighborhood {preference}",
            )


def validate_influence_edges(data: dict[str, Any], ids: dict[str, set[str]], errors: list[str]) -> None:
    for index, edge in enumerate(data.get("influence_edges", [])):
        label = f"influence_edges[{index}]"
        for field in ["from", "to", "weight", "kind"]:
            if field not in edge:
                errors.append(f"{label} missing {field}")
        if edge.get("from") not in ids["neighborhoods"]:
            errors.append(f"{label}.from references unknown neighborhood {edge.get('from')}")
        if edge.get("to") not in ids["neighborhoods"]:
            errors.append(f"{label}.to references unknown neighborhood {edge.get('to')}")
        if "weight" in edge and not 0 <= edge["weight"] <= 1:
            errors.append(f"{label}.weight must be between 0 and 1")


def validate_household_occupancy(data: dict[str, Any], errors: list[str]) -> None:
    occupied_households = [
        unit["household_id"]
        for unit in data["units"]
        if unit.get("household_id") is not None
    ]
    duplicate_households = sorted(
        {household_id for household_id in occupied_households if occupied_households.count(household_id) > 1},
    )
    for household_id in duplicate_households:
        errors.append(f"household {household_id} is assigned to multiple units")

    for unit in data["units"]:
        if unit.get("vacant") and unit.get("household_id") is not None:
            errors.append(f"units.{unit.get('id')} is vacant but has household_id")
        if not unit.get("vacant") and unit.get("household_id") is None:
            errors.append(f"units.{unit.get('id')} is occupied but has no household_id")


def require_reference(
    item: dict[str, Any],
    field: str,
    valid_ids: set[str],
    collection: str,
    errors: list[str],
) -> None:
    value = item.get(field)
    if value not in valid_ids:
        errors.append(f"{collection}.{item.get('id')}.{field} references unknown id {value}")


if __name__ == "__main__":
    main()
