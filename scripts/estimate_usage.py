"""Estimate compute and energy usage for scenario runs.

This is an order-of-magnitude planning tool, not a hardware power meter. It
estimates how work scales with scenario size and then converts estimated runtime
to watt-hours using user-provided watt assumptions.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path


METHOD_FACTORS = {
    "agent_based": {"unit": 12, "household": 5, "owner": 3, "area": 4, "edge": 2, "state": 0},
    "analytical": {"unit": 6, "household": 1, "owner": 1, "area": 5, "edge": 1, "state": 0},
    "markov_chain": {"unit": 3, "household": 1, "owner": 1, "area": 2, "edge": 0, "state": 6},
    "mcmc_state": {"unit": 3, "household": 1, "owner": 1, "area": 2, "edge": 0, "state": 8},
}


@dataclass(frozen=True)
class ScenarioSize:
    districts: int
    neighborhoods: int
    parcels: int
    buildings: int
    units: int
    owners: int
    households: int
    influence_edges: int
    states: int


def load_size(path: Path) -> ScenarioSize:
    data = json.loads(path.read_text(encoding="utf-8"))
    return ScenarioSize(
        districts=len(data.get("districts", [])),
        neighborhoods=len(data.get("neighborhoods", [])),
        parcels=len(data.get("parcels", [])),
        buildings=len(data.get("buildings", [])),
        units=len(data.get("units", [])),
        owners=len(data.get("owners", [])),
        households=len(data.get("households", [])),
        influence_edges=len(data.get("area_influences", [])),
        states=len(data.get("market_states", [])) or 7,
    )


def scaled_size(size: ScenarioSize, scale: float) -> ScenarioSize:
    def scaled(value: int) -> int:
        return max(1, round(value * scale))

    return ScenarioSize(
        districts=size.districts,
        neighborhoods=scaled(size.neighborhoods),
        parcels=scaled(size.parcels),
        buildings=scaled(size.buildings),
        units=scaled(size.units),
        owners=scaled(size.owners),
        households=scaled(size.households),
        influence_edges=scaled(size.influence_edges) if size.influence_edges else round(scaled(size.neighborhoods) * 1.5),
        states=size.states,
    )


def work_units(size: ScenarioSize, method: str, steps: int) -> int:
    factors = METHOD_FACTORS[method]
    per_step = (
        size.units * factors["unit"]
        + size.households * factors["household"]
        + size.owners * factors["owner"]
        + size.neighborhoods * factors["area"]
        + size.influence_edges * factors["edge"]
        + size.states * factors["state"]
    )
    metrics_pass = size.units * 4 + size.households * 2 + size.neighborhoods
    return steps * (per_step + metrics_pass)


def estimate(size: ScenarioSize, method: str, steps: int, throughput: float, compute_watts: float) -> dict[str, float]:
    units = work_units(size, method, steps)
    runtime_seconds = units / throughput
    compute_wh = compute_watts * runtime_seconds / 3600
    return {
        "work_units": units,
        "runtime_seconds": runtime_seconds,
        "compute_wh": compute_wh,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Estimate simulation compute and power usage.")
    parser.add_argument("--scenario", default="data/scenarios/mitte_seed.json")
    parser.add_argument("--steps", type=int, default=120)
    parser.add_argument("--scale", type=float, default=1.0, help="Scale scenario size for planning larger datasets.")
    parser.add_argument("--throughput", type=float, default=1_000_000, help="Estimated work units per second.")
    parser.add_argument("--compute-watts", type=float, default=15.0, help="Approximate CPU package watts while simulating.")
    parser.add_argument("--session-minutes", type=float, default=5.0, help="Interactive browser/session duration.")
    parser.add_argument("--device-watts", type=float, default=8.0, help="Approximate whole-device watts during session.")
    args = parser.parse_args()

    base_size = load_size(Path(args.scenario))
    size = scaled_size(base_size, args.scale)
    session_wh = args.device_watts * args.session_minutes / 60

    print(f"scenario={args.scenario}")
    print(f"scale={args.scale:g}")
    print(
        "size="
        f"areas:{size.neighborhoods} units:{size.units} households:{size.households} "
        f"owners:{size.owners} edges:{size.influence_edges} states:{size.states}"
    )
    print(f"steps={args.steps}")
    print(f"assumptions=throughput:{args.throughput:g} work_units/s compute:{args.compute_watts:g}W session:{args.device_watts:g}W")
    print()
    print("method,work_units,est_runtime_s,est_compute_Wh,session_Wh")
    for method in METHOD_FACTORS:
        result = estimate(size, method, args.steps, args.throughput, args.compute_watts)
        print(
            f"{method},"
            f"{result['work_units']},"
            f"{result['runtime_seconds']:.6f},"
            f"{result['compute_wh']:.8f},"
            f"{session_wh:.4f}"
        )


if __name__ == "__main__":
    main()
