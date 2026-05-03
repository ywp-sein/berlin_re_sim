"""Update the web Notes ledger from command-line or git-derived metadata."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import urllib.request
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
NOTES_JS = ROOT / "web" / "notes.js"
SERVICE_WORKER = ROOT / "web" / "service-worker.js"


def main() -> None:
    parser = argparse.ArgumentParser(description="Update web/notes.js and cache metadata.")
    parser.add_argument("--title", help="Version entry title.")
    parser.add_argument("--summary", help="Current version summary.")
    parser.add_argument("--version", help="Explicit version number. Defaults to patch bump.")
    parser.add_argument("--date", default=date.today().isoformat(), help="Version date.")
    parser.add_argument("--change", action="append", default=[], help="Version change bullet.")
    parser.add_argument(
        "--smart",
        action="store_true",
        help="Draft title, summary, changes, and gap updates from git changes.",
    )
    parser.add_argument(
        "--openai",
        action="store_true",
        help="Use OpenAI to draft smart notes. Requires OPENAI_API_KEY and network access.",
    )
    parser.add_argument(
        "--model",
        default=os.environ.get("OPENAI_NOTES_MODEL", "gpt-5.1-mini"),
        help="OpenAI model for --openai smart drafting.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned notes payload without editing files.",
    )
    parser.add_argument(
        "--from-git",
        action="store_true",
        help="Add generic change bullets based on currently changed file paths.",
    )
    parser.add_argument(
        "--complete-gap",
        action="append",
        default=[],
        help="Remove an open gap by exact title.",
    )
    parser.add_argument(
        "--add-gap",
        action="append",
        default=[],
        metavar="AREA|TITLE|BODY|FILES",
        help="Add an open gap from pipe-separated fields.",
    )
    parser.add_argument(
        "--no-cache-bump",
        action="store_true",
        help="Do not bump web/service-worker.js cache version.",
    )
    args = parser.parse_args()

    notes = NOTES_JS.read_text(encoding="utf-8")
    version = args.version or bump_patch(current_version(notes))
    draft = draft_notes(args, notes)
    title = args.title or draft["title"]
    summary = args.summary or draft["summary"]
    complete_gaps = args.complete_gap + draft["complete_gaps"]
    add_gaps = args.add_gap + [
        gap_to_arg(gap) for gap in draft["add_gaps"]
    ]
    changes = args.change + draft["changes"] + (git_change_bullets() if args.from_git else [])
    if not changes:
        changes = ["Updated project notes automation."]

    if not title or not summary:
        raise SystemExit("--title and --summary are required unless --smart is used")

    if args.dry_run:
        print(
            json.dumps(
                {
                    "version": version,
                    "title": title,
                    "summary": summary,
                    "changes": unique(changes),
                    "complete_gaps": complete_gaps,
                    "add_gaps": [parse_gap(gap) for gap in add_gaps],
                    "cache_bump": not args.no_cache_bump,
                },
                indent=2,
            )
        )
        return

    notes = replace_current_version(notes, version, summary)
    notes = insert_version_entry(notes, version, args.date, title, unique(changes))
    for gap_title in complete_gaps:
        notes = remove_open_gap(notes, gap_title)
    for gap in add_gaps:
        notes = add_open_gap(notes, parse_gap(gap))
    NOTES_JS.write_text(notes, encoding="utf-8")

    if not args.no_cache_bump:
        bump_service_worker_cache()

    print(f"updated web/notes.js to Prototype {version}")


def draft_notes(args: argparse.Namespace, notes: str) -> dict[str, Any]:
    empty = {"title": "", "summary": "", "changes": [], "complete_gaps": [], "add_gaps": []}
    if not args.smart and not args.openai:
        return empty
    context = notes_context(notes)
    if args.openai:
        try:
            return normalize_draft(openai_draft(context, args.model))
        except Exception as error:
            if os.environ.get("NOTES_OPENAI_STRICT") == "1":
                raise
            print(f"OpenAI notes draft unavailable, using local smart draft: {error}")
    return heuristic_draft(context)


def notes_context(notes: str) -> dict[str, Any]:
    return {
        "changed_paths": changed_paths(),
        "diff_summary": git_diff_summary(),
        "diff_excerpt": git_diff_excerpt(),
        "open_gaps": current_open_gaps(notes),
    }


def heuristic_draft(context: dict[str, Any]) -> dict[str, Any]:
    paths = context["changed_paths"]
    title = heuristic_title(paths)
    summary = heuristic_summary(paths)
    changes = git_change_bullets()
    if not changes:
        changes = ["Updated project files."]
    complete_gaps = []
    if any(path.startswith(("data/raw/", "data/normalized/", "data/imported/")) for path in paths):
        complete_gaps.append("No raw or normalized data staging folders yet")
    if any("geography" in path or "mapping" in path for path in paths):
        complete_gaps.append("Mitte proxy geography mapping is still manual")
    return {
        "title": title,
        "summary": summary,
        "changes": changes,
        "complete_gaps": complete_gaps,
        "add_gaps": [],
    }


def heuristic_title(paths: list[str]) -> str:
    if any(path.startswith("scripts/") for path in paths):
        return "Automation update"
    if any(path.startswith("web/") for path in paths):
        return "Web UI update"
    if any(path.startswith("data/") for path in paths):
        return "Data contract update"
    if any(path.startswith("docs/") for path in paths):
        return "Documentation update"
    if any(path.startswith("src/") for path in paths):
        return "Simulation code update"
    return "Project update"


def heuristic_summary(paths: list[str]) -> str:
    touched = []
    if any(path.startswith("scripts/") for path in paths):
        touched.append("automation")
    if any(path.startswith("web/") for path in paths):
        touched.append("web UI")
    if any(path.startswith("data/") for path in paths):
        touched.append("data files")
    if any(path.startswith("docs/") for path in paths):
        touched.append("docs")
    if any(path.startswith("src/") for path in paths):
        touched.append("simulation code")
    if not touched:
        return "Updated project files."
    return f"Updated {', '.join(touched)}."


def openai_draft(context: dict[str, Any], model: str) -> dict[str, Any]:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set")
    request_body = {
        "model": model,
        "instructions": (
            "You update a project Notes ledger for a Berlin real estate simulation. "
            "Return only strict JSON with keys: title, summary, changes, complete_gaps, add_gaps. "
            "changes must be 2-5 concise strings. complete_gaps must contain exact existing gap "
            "titles only when the diff clearly resolves them. add_gaps must be objects with "
            "area, title, body, files. Do not invent completed work."
        ),
        "input": json.dumps(context, indent=2),
    }
    request = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(request_body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        payload = json.loads(response.read().decode("utf-8"))
    text = extract_response_text(payload)
    return json.loads(text)


def extract_response_text(payload: dict[str, Any]) -> str:
    if isinstance(payload.get("output_text"), str):
        return payload["output_text"]
    for item in payload.get("output", []):
        for content in item.get("content", []):
            if content.get("type") == "output_text":
                return content.get("text", "")
    raise RuntimeError("OpenAI response did not contain output_text")


def normalize_draft(draft: dict[str, Any]) -> dict[str, Any]:
    return {
        "title": str(draft.get("title", "")).strip(),
        "summary": str(draft.get("summary", "")).strip(),
        "changes": [str(item).strip() for item in draft.get("changes", []) if str(item).strip()],
        "complete_gaps": [
            str(item).strip() for item in draft.get("complete_gaps", []) if str(item).strip()
        ],
        "add_gaps": [
            {
                "area": str(item.get("area", "")).strip(),
                "title": str(item.get("title", "")).strip(),
                "body": str(item.get("body", "")).strip(),
                "files": str(item.get("files", "")).strip(),
            }
            for item in draft.get("add_gaps", [])
            if isinstance(item, dict)
        ],
    }


def current_open_gaps(notes: str) -> list[dict[str, str]]:
    start, end = open_gaps_span(notes)
    gaps = []
    for _, _, object_text in top_level_objects(notes[start:end]):
        gaps.append(
            {
                "area": first_js_string(object_text, "area"),
                "title": first_js_string(object_text, "title"),
                "body": first_js_string(object_text, "body"),
                "files": first_js_string(object_text, "files"),
            }
        )
    return gaps


def first_js_string(text: str, key: str) -> str:
    match = re.search(rf'{key}:\s*(?:"([^"]*)"|\n\s*"([^"]*)")', text)
    return (match.group(1) or match.group(2)) if match else ""


def current_version(notes: str) -> str:
    match = re.search(r'label:\s*"Prototype\s+(\d+\.\d+\.\d+)"', notes)
    if not match:
        raise SystemExit("Could not find current Prototype version in web/notes.js")
    return match.group(1)


def bump_patch(version: str) -> str:
    major, minor, patch = (int(part) for part in version.split("."))
    return f"{major}.{minor}.{patch + 1}"


def replace_current_version(notes: str, version: str, summary: str) -> str:
    block = (
        "const currentVersion = {\n"
        f'  label: "Prototype {escape_js(version)}",\n'
        f'  summary: "{escape_js(summary)}",\n'
        "};"
    )
    return re.sub(r"const currentVersion = \{.*?\};", block, notes, count=1, flags=re.S)


def insert_version_entry(
    notes: str, version: str, version_date: str, title: str, changes: list[str]
) -> str:
    if re.search(rf'version:\s*"{re.escape(version)}"', notes):
        raise SystemExit(f"Version {version} already exists in web/notes.js")
    change_lines = "\n".join(f'      "{escape_js(change)}",' for change in changes)
    entry = (
        "  {\n"
        f'    version: "{escape_js(version)}",\n'
        f'    date: "{escape_js(version_date)}",\n'
        f'    title: "{escape_js(title)}",\n'
        "    changes: [\n"
        f"{change_lines}\n"
        "    ],\n"
        "  },\n"
    )
    marker = "const versions = [\n"
    if marker not in notes:
        raise SystemExit("Could not find versions array in web/notes.js")
    return notes.replace(marker, marker + entry, 1)


def remove_open_gap(notes: str, title: str) -> str:
    start, end = open_gaps_span(notes)
    section = notes[start:end]
    objects = top_level_objects(section)
    for object_start, object_end, object_text in objects:
        match = re.search(r'title:\s*"([^"]+)"', object_text)
        if match and match.group(1) == title:
            return notes[: start + object_start] + notes[start + object_end :]  # includes comma
    raise SystemExit(f'Open gap titled "{title}" was not found')


def add_open_gap(notes: str, gap: dict[str, str]) -> str:
    start, end = open_gaps_span(notes)
    section = notes[start:end]
    if re.search(rf'title:\s*"{re.escape(gap["title"])}"', section):
        raise SystemExit(f'Open gap titled "{gap["title"]}" already exists')
    entry = (
        "  {\n"
        f'    area: "{escape_js(gap["area"])}",\n'
        f'    title: "{escape_js(gap["title"])}",\n'
        "    body:\n"
        f'      "{escape_js(gap["body"])}",\n'
        f'    files: "{escape_js(gap["files"])}",\n'
        "  },\n"
    )
    return notes[:end] + entry + notes[end:]


def open_gaps_span(notes: str) -> tuple[int, int]:
    match = re.search(r"const openGaps = \[\n", notes)
    if not match:
        raise SystemExit("Could not find openGaps array in web/notes.js")
    start = match.end()
    end = notes.find("];", start)
    if end == -1:
        raise SystemExit("Could not find end of openGaps array")
    return start, end


def top_level_objects(section: str) -> list[tuple[int, int, str]]:
    objects = []
    depth = 0
    object_start: int | None = None
    in_string = False
    escaped = False
    for index, char in enumerate(section):
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char == "{":
            if depth == 0:
                object_start = index
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0 and object_start is not None:
                end = index + 1
                while end < len(section) and section[end] in {",", "\n"}:
                    end += 1
                objects.append((object_start, end, section[object_start:end]))
                object_start = None
    return objects


def parse_gap(value: str) -> dict[str, str]:
    parts = value.split("|", 3)
    if len(parts) != 4:
        raise SystemExit("--add-gap must use AREA|TITLE|BODY|FILES")
    area, title, body, files = (part.strip() for part in parts)
    if not all([area, title, body, files]):
        raise SystemExit("--add-gap fields cannot be empty")
    return {"area": area, "title": title, "body": body, "files": files}


def gap_to_arg(gap: dict[str, str]) -> str:
    return f"{gap['area']}|{gap['title']}|{gap['body']}|{gap['files']}"


def git_change_bullets() -> list[str]:
    paths = changed_paths()
    bullets = []
    groups = [
        ("web/", "Updated web UI assets."),
        ("docs/", "Updated project documentation."),
        ("data/", "Updated project data files."),
        ("src/", "Updated Python simulation code."),
        ("scripts/", "Updated project automation scripts."),
    ]
    for prefix, message in groups:
        if any(path.startswith(prefix) for path in paths):
            bullets.append(message)
    if any(path == "README.md" for path in paths):
        bullets.append("Updated README guidance.")
    return bullets


def changed_paths() -> list[str]:
    output = subprocess.check_output(
        ["git", "status", "--short"], cwd=ROOT, text=True
    ).splitlines()
    paths = []
    for line in output:
        path = line[3:].strip()
        if " -> " in path:
            path = path.split(" -> ", 1)[1]
        if path:
            paths.append(path)
    return paths


def git_diff_summary() -> str:
    return subprocess.check_output(["git", "diff", "--stat"], cwd=ROOT, text=True).strip()


def git_diff_excerpt() -> str:
    output = subprocess.check_output(
        ["git", "diff", "--", ":!web/docs-content.js", ":!web/docs-content.json"],
        cwd=ROOT,
        text=True,
    )
    return output[:12000]


def bump_service_worker_cache() -> None:
    text = SERVICE_WORKER.read_text(encoding="utf-8")
    match = re.search(r'const CACHE_NAME = "berlin-re-sim-v(\d+)";', text)
    if not match:
        raise SystemExit("Could not find service-worker cache version")
    next_version = int(match.group(1)) + 1
    text = re.sub(
        r'const CACHE_NAME = "berlin-re-sim-v\d+";',
        f'const CACHE_NAME = "berlin-re-sim-v{next_version}";',
        text,
        count=1,
    )
    SERVICE_WORKER.write_text(text, encoding="utf-8")


def unique(values: list[str]) -> list[str]:
    return list(dict.fromkeys(values))


def escape_js(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


if __name__ == "__main__":
    main()
