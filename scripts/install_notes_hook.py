"""Install an optional git hook that keeps web Notes updated before commits."""

from __future__ import annotations

from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HOOK = ROOT / ".git" / "hooks" / "pre-commit"

HOOK_TEXT = """#!/usr/bin/env sh
set -eu

changed="$(git diff --cached --name-only)"
case "$changed" in
  "")
    exit 0
    ;;
esac

case "$changed" in
  *web/notes.js*|*web/service-worker.js*)
    exit 0
    ;;
esac

python3 scripts/update_notes.py --smart --from-git
python3 scripts/build_docs_content.py
git add web/notes.js web/service-worker.js web/docs-content.json web/docs-content.js README.md 2>/dev/null || true
"""


def main() -> None:
    if not (ROOT / ".git").exists():
        raise SystemExit("This script must be run inside a git checkout.")
    HOOK.parent.mkdir(parents=True, exist_ok=True)
    if HOOK.exists() and "scripts/update_notes.py --smart" not in HOOK.read_text(
        encoding="utf-8", errors="ignore"
    ):
        backup = HOOK.with_suffix(".pre-notes-backup")
        backup.write_text(HOOK.read_text(encoding="utf-8"), encoding="utf-8")
        print(f"backed up existing hook to {backup.relative_to(ROOT)}")
    HOOK.write_text(HOOK_TEXT, encoding="utf-8")
    HOOK.chmod(0o755)
    print(f"installed {HOOK.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
