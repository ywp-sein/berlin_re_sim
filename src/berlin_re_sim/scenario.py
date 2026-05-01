from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from berlin_re_sim.schemas import (
    Building,
    District,
    HouseholdProfile,
    Neighborhood,
    OwnerKind,
    OwnerProfile,
    Parcel,
    Tenure,
    Unit,
)


class Scenario:
    def __init__(self, data: dict[str, Any]) -> None:
        self.name = data["name"]
        self.tick_length = data["tick_length"]
        self.districts = [District(**item) for item in data["districts"]]
        self.neighborhoods = [Neighborhood(**item) for item in data["neighborhoods"]]
        self.parcels = [Parcel(**item) for item in data["parcels"]]
        self.buildings = [Building(**item) for item in data["buildings"]]
        self.units = [
            Unit(
                **{
                    **item,
                    "tenure": Tenure(item["tenure"]),
                }
            )
            for item in data["units"]
        ]
        self.owners = [
            OwnerProfile(
                **{
                    **item,
                    "kind": OwnerKind(item["kind"]),
                }
            )
            for item in data["owners"]
        ]
        self.households = [HouseholdProfile(**item) for item in data["households"]]

    @classmethod
    def from_file(cls, path: str | Path) -> Scenario:
        with Path(path).open(encoding="utf-8") as file:
            return cls(json.load(file))
