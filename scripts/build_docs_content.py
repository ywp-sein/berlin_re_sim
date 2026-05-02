"""Bundle README and categorized docs markdown for the static Docs page."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "web" / "docs-content.json"
JS_OUTPUT = ROOT / "web" / "docs-content.js"

CATEGORY_LABELS = {
    "root": "Project",
    "modeling": "Modeling",
    "data": "Data",
    "operations": "Operations",
}


def title_from_markdown(path: Path, content: str) -> str:
    for line in content.splitlines():
        if line.startswith("# "):
            return line.removeprefix("# ").strip()
    return path.stem.replace("_", " ").title()


def category_for_path(path: Path) -> str:
    if path.name == "README.md":
        return "Project"
    try:
        relative_parts = path.relative_to(ROOT / "docs").parts
    except ValueError:
        return "Project"
    if len(relative_parts) > 1:
        return CATEGORY_LABELS.get(relative_parts[0], relative_parts[0].replace("_", " ").title())
    return "Uncategorized"


def main() -> None:
    paths = [ROOT / "README.md", *sorted((ROOT / "docs").rglob("*.md"))]
    documents = []
    for path in paths:
        content = path.read_text(encoding="utf-8")
        rel_path = path.relative_to(ROOT).as_posix()
        documents.append(
            {
                "path": rel_path,
                "title": title_from_markdown(path, content),
                "category": category_for_path(path),
                "content": content,
            },
        )
    payload = {"documents": documents}
    OUTPUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    JS_OUTPUT.write_text(
        "window.DOCS_CONTENT = "
        + json.dumps(payload, indent=2)
        + ";\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    main()
