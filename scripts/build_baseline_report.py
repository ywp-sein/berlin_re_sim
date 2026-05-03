"""Generate repeatable baseline reports for the current scenario."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src"
if str(SRC) not in sys.path:
    sys.path.insert(0, str(SRC))

from berlin_re_sim.methods import SimulationMethod, create_simulation  # noqa: E402
from berlin_re_sim.parameters import DEFAULT_PARAMETER_PATH  # noqa: E402


DEFAULT_METHODS = [
    SimulationMethod.AGENT_BASED,
    SimulationMethod.ANALYTICAL,
    SimulationMethod.MARKOV_CHAIN,
    SimulationMethod.MCMC_STATE,
]

METRIC_KEYS = [
    "median_rent_per_sqm",
    "median_sale_price_per_sqm",
    "vacancy_rate",
    "average_displacement_stress",
    "average_individual_income_monthly",
    "average_rent_burden",
    "purchase_price_to_income_years",
    "regulated_unit_share",
]

TARGET_KEYS = [
    "median_rent_per_sqm",
    "median_sale_price_per_sqm",
    "vacancy_rate",
    "average_displacement_stress",
    "average_rent_burden",
    "purchase_price_to_income_years",
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Build baseline simulation reports.")
    parser.add_argument("--scenario", default="data/scenarios/mitte_seed.json")
    parser.add_argument("--targets", default="data/targets/mitte_targets.json")
    parser.add_argument("--parameters", default="data/parameters/default_parameters.json")
    parser.add_argument("--steps", type=int, default=12)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--json-output", default="data/baselines/latest_baseline.json")
    parser.add_argument("--markdown-output", default="docs/generated/baseline_report.md")
    args = parser.parse_args()

    scenario_path = ROOT / args.scenario
    target_path = ROOT / args.targets
    payload = build_report(
        scenario_path=scenario_path,
        target_path=target_path,
        parameter_path=ROOT / args.parameters,
        steps=args.steps,
        seed=args.seed,
    )

    json_output = ROOT / args.json_output
    markdown_output = ROOT / args.markdown_output
    json_output.parent.mkdir(parents=True, exist_ok=True)
    markdown_output.parent.mkdir(parents=True, exist_ok=True)
    json_output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    markdown_output.write_text(render_markdown(payload), encoding="utf-8")

    print(f"wrote {json_output.relative_to(ROOT)}")
    print(f"wrote {markdown_output.relative_to(ROOT)}")


def build_report(
    scenario_path: Path, target_path: Path, parameter_path: Path, steps: int, seed: int
) -> dict[str, Any]:
    scenario = json.loads(scenario_path.read_text(encoding="utf-8"))
    targets = load_targets(target_path)
    methods = [
        run_method(method, scenario_path, parameter_path, steps, seed, targets)
        for method in DEFAULT_METHODS
    ]
    return {
        "generated_at": datetime.now(UTC).isoformat(timespec="seconds"),
        "scenario_path": scenario_path.relative_to(ROOT).as_posix(),
        "target_path": target_path.relative_to(ROOT).as_posix() if target_path.exists() else None,
        "parameter_path": parameter_path.relative_to(ROOT).as_posix()
        if parameter_path.exists()
        else DEFAULT_PARAMETER_PATH.relative_to(ROOT).as_posix(),
        "steps": steps,
        "seed": seed,
        "scenario_size": {
            "districts": len(scenario.get("districts", [])),
            "neighborhoods": len(scenario.get("neighborhoods", [])),
            "parcels": len(scenario.get("parcels", [])),
            "buildings": len(scenario.get("buildings", [])),
            "units": len(scenario.get("units", [])),
            "owners": len(scenario.get("owners", [])),
            "households": len(scenario.get("households", [])),
            "influence_edges": len(scenario.get("influence_edges", [])),
        },
        "targets": targets,
        "methods": methods,
    }


def load_targets(path: Path) -> dict[str, float]:
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    return data.get("targets", {})


def run_method(
    method: SimulationMethod,
    scenario_path: Path,
    parameter_path: Path,
    steps: int,
    seed: int,
    targets: dict[str, float],
) -> dict[str, Any]:
    try:
        simulation = create_simulation(method, scenario_path, seed=seed, parameters=parameter_path)
        for _ in range(steps):
            simulation.step()
        latest = simulation.metrics[-1]
        metrics = {key: round(float(getattr(latest, key)), 6) for key in METRIC_KEYS}
        return {
            "method": method.value,
            "status": "ok",
            "tick": latest.tick,
            "metrics": metrics,
            "error": calculate_error(metrics, targets),
        }
    except ModuleNotFoundError as error:
        return {
            "method": method.value,
            "status": "unavailable",
            "reason": f"Missing Python module: {error.name}",
        }


def calculate_error(metrics: dict[str, float], targets: dict[str, float]) -> dict[str, float] | None:
    if not targets:
        return None
    relative_errors = [
        abs(metrics[key] - targets[key]) / max(abs(targets[key]), 0.0001)
        for key in TARGET_KEYS
        if key in metrics and key in targets
    ]
    if not relative_errors:
        return None
    mean_relative_error = sum(relative_errors) / len(relative_errors)
    rmse = (sum(value * value for value in relative_errors) / len(relative_errors)) ** 0.5
    return {
        "mean_relative_error": round(mean_relative_error, 6),
        "rmse": round(rmse, 6),
    }


def render_markdown(report: dict[str, Any]) -> str:
    size = report["scenario_size"]
    lines = [
        "# Baseline Report",
        "",
        "This report is generated from the current canonical scenario. It records",
        "repeatable synthetic outputs before real data is imported.",
        "",
        "These values are not empirical Berlin claims.",
        "",
        "## Run Settings",
        "",
        f"- generated at: `{report['generated_at']}`",
        f"- scenario: `{report['scenario_path']}`",
        f"- targets: `{report['target_path']}`",
        f"- parameters: `{report['parameter_path']}`",
        f"- steps: `{report['steps']}`",
        f"- seed: `{report['seed']}`",
        "",
        "## Scenario Size",
        "",
        f"- districts: {size['districts']}",
        f"- neighborhoods: {size['neighborhoods']}",
        f"- parcels: {size['parcels']}",
        f"- buildings: {size['buildings']}",
        f"- units: {size['units']}",
        f"- owners: {size['owners']}",
        f"- households: {size['households']}",
        f"- influence edges: {size['influence_edges']}",
        "",
        "## Method Outputs",
        "",
        "| method | status | rent/sqm | sale/sqm | vacancy | stress | income/person | burden | buy years | mean error | RMSE |",
        "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
    ]
    for method in report["methods"]:
        lines.append(render_method_row(method))
    lines.extend(
        [
            "",
            "## Notes",
            "",
            "- `agent_based` may be unavailable when Mesa is not installed.",
            "- Mean error and RMSE compare method outputs against the current target file.",
            "- Use this report as a structural baseline before replacing synthetic values.",
            "",
        ],
    )
    return "\n".join(lines)


def render_method_row(method: dict[str, Any]) -> str:
    if method["status"] != "ok":
        return f"| {method['method']} | {method['status']}: {method['reason']} | - | - | - | - | - | - | - | - | - |"
    metrics = method["metrics"]
    error = method.get("error") or {}
    return (
        f"| {method['method']} | ok "
        f"| {metrics['median_rent_per_sqm']:.2f} "
        f"| {metrics['median_sale_price_per_sqm']:.2f} "
        f"| {metrics['vacancy_rate']:.2%} "
        f"| {metrics['average_displacement_stress']:.2f} "
        f"| {metrics['average_individual_income_monthly']:.2f} "
        f"| {metrics['average_rent_burden']:.2%} "
        f"| {metrics['purchase_price_to_income_years']:.1f} "
        f"| {format_error(error.get('mean_relative_error'))} "
        f"| {format_error(error.get('rmse'))} |"
    )


def format_error(value: float | None) -> str:
    return "-" if value is None else f"{value:.2%}"


if __name__ == "__main__":
    main()
