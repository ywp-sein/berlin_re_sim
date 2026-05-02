"""Bundle the canonical scenario for the static browser app."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCENARIO = ROOT / "data" / "scenarios" / "mitte_seed.json"
OUTPUT = ROOT / "web" / "scenario-content.json"
JS_OUTPUT = ROOT / "web" / "scenario-content.js"


def main() -> None:
    scenario = json.loads(SCENARIO.read_text(encoding="utf-8"))
    payload = {
        "source_path": SCENARIO.relative_to(ROOT).as_posix(),
        "scenario": scenario,
    }
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    JS_OUTPUT.write_text(
        "window.SCENARIO_CONTENT = " + json.dumps(payload, indent=2) + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
