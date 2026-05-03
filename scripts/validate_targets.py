"""Validate calibration target values and per-target provenance."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TARGET_PATH = ROOT / "data" / "targets" / "mitte_targets.json"

REQUIRED_TARGETS = {
    "median_rent_per_sqm",
    "median_sale_price_per_sqm",
    "vacancy_rate",
    "average_displacement_stress",
    "average_rent_burden",
    "purchase_price_to_income_years",
}

REQUIRED_PROVENANCE_FIELDS = {
    "source",
    "publisher",
    "period",
    "geography",
    "unit",
    "statistic",
    "method",
    "confidence",
    "notes",
}

RATE_TARGETS = {"vacancy_rate", "average_displacement_stress"}
NON_NEGATIVE_TARGETS = REQUIRED_TARGETS - RATE_TARGETS


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate calibration target files.")
    parser.add_argument("path", nargs="?", default=DEFAULT_TARGET_PATH)
    args = parser.parse_args()

    path = Path(args.path)
    if not path.is_absolute():
        path = ROOT / path
    errors = validate_target_file(path)
    if errors:
        for error in errors:
            print(error)
        raise SystemExit(1)
    print(f"{path.relative_to(ROOT)}: valid")


def validate_target_file(path: Path) -> list[str]:
    errors: list[str] = []
    data = json.loads(path.read_text(encoding="utf-8"))
    targets = data.get("targets")
    provenance = data.get("target_provenance")
    if not isinstance(targets, dict):
        return ["targets must be an object"]
    if not isinstance(provenance, dict):
        return ["target_provenance must be an object"]

    missing_targets = sorted(REQUIRED_TARGETS - set(targets))
    if missing_targets:
        errors.append(f"missing target values: {', '.join(missing_targets)}")

    missing_provenance = sorted(set(targets) - set(provenance))
    if missing_provenance:
        errors.append(f"missing target provenance: {', '.join(missing_provenance)}")

    extra_provenance = sorted(set(provenance) - set(targets))
    if extra_provenance:
        errors.append(f"provenance without matching target: {', '.join(extra_provenance)}")

    for key, value in targets.items():
        errors.extend(validate_target_value(key, value))
    for key, item in provenance.items():
        errors.extend(validate_provenance(key, item))
    return errors


def validate_target_value(key: str, value: Any) -> list[str]:
    if not isinstance(value, int | float):
        return [f"{key} must be numeric"]
    if key in RATE_TARGETS and not 0 <= value <= 1:
        return [f"{key} must be between 0 and 1"]
    if key in NON_NEGATIVE_TARGETS and value < 0:
        return [f"{key} must be non-negative"]
    return []


def validate_provenance(key: str, item: Any) -> list[str]:
    if not isinstance(item, dict):
        return [f"target_provenance.{key} must be an object"]
    errors = []
    for field in sorted(REQUIRED_PROVENANCE_FIELDS):
        value = item.get(field)
        if value is None or value == "":
            errors.append(f"target_provenance.{key}.{field} is required")
    return errors


if __name__ == "__main__":
    main()
