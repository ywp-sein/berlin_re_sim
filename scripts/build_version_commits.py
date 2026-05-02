"""Build a deployed version-to-commit map for the Notes page.

The source notes ledger is edited before a commit exists, so commit links cannot
be written into `web/notes.js` directly. This script runs after checkout in CI,
looks through git history for commits that introduced each version string, and
writes `web/version-commits.json` into the static Pages artifact.
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
NOTES_JS = ROOT / "web" / "notes.js"
OUTPUT = ROOT / "web" / "version-commits.json"
REMOTE_FALLBACK = "https://github.com/ywp-sein/berlin_re_sim"


def run_git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def versions() -> list[str]:
    text = NOTES_JS.read_text(encoding="utf-8")
    return list(dict.fromkeys(re.findall(r'version:\s*"([^"]+)"', text)))


def github_base_url() -> str:
    try:
        remote = run_git("remote", "get-url", "origin")
    except subprocess.CalledProcessError:
        return REMOTE_FALLBACK
    if remote.startswith("git@github.com:"):
        repo = remote.removeprefix("git@github.com:").removesuffix(".git")
        return f"https://github.com/{repo}"
    if remote.startswith("https://github.com/"):
        return remote.removesuffix(".git")
    return REMOTE_FALLBACK


def commit_for_version(version: str) -> str:
    patterns = [f'version: "{version}"', f"Prototype {version}"]
    for pattern in patterns:
        try:
            commit = run_git("log", "--all", "--fixed-strings", "-G", pattern, "--format=%H", "-n", "1", "--", "web/notes.js")
        except subprocess.CalledProcessError:
            continue
        if commit:
            return commit
    return run_git("rev-parse", "HEAD")


def main() -> None:
    base_url = github_base_url()
    data = {}
    for version in versions():
        commit = commit_for_version(version)
        data[version] = {
            "hash": commit,
            "short": commit[:7],
            "url": f"{base_url}/commit/{commit}",
        }
    OUTPUT.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
