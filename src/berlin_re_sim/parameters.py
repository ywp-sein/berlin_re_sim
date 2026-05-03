from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PARAMETER_PATH = ROOT / "data" / "parameters" / "default_parameters.json"


ParameterSource = dict[str, Any] | str | Path | None


def load_parameters(source: ParameterSource = None) -> dict[str, Any]:
    """Load model parameters, merging optional overrides onto the default set."""
    defaults = _read_json(DEFAULT_PARAMETER_PATH)
    if source is None:
        return defaults
    if isinstance(source, dict):
        overrides = source
    else:
        overrides = _read_json(Path(source))
    return _deep_merge(defaults, overrides)


def method_parameters(parameters: dict[str, Any], method: str) -> dict[str, Any]:
    return parameters.get(method, {})


def _read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _deep_merge(base: dict[str, Any], overrides: dict[str, Any]) -> dict[str, Any]:
    merged = deepcopy(base)
    for key, value in overrides.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = _deep_merge(merged[key], value)
        else:
            merged[key] = deepcopy(value)
    return merged
