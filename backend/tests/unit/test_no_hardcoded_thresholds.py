"""Unit tests for the no-hardcoded-thresholds lint script.

Per Design Foundations R4.2: every tab intelligence layer rule reads
green / amber / red boundaries from threshold_calibration_register at
request time, never from a numeric literal in code.

The lint script lives at scripts/check_no_hardcoded_thresholds.sh and
scans backend/app/intelligence/rules/*.py by default. These tests pass
the script a temp directory containing fixture files so the rule can be
exercised without polluting the real rules directory.
"""

from __future__ import annotations

import subprocess
from pathlib import Path

import pytest


_LINT_SCRIPT = (
    Path(__file__).resolve().parents[3]  # backend/tests/unit -> project root
    / "scripts"
    / "check_no_hardcoded_thresholds.sh"
)


def _run_lint(target_dir: Path) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [str(_LINT_SCRIPT), str(target_dir)],
        capture_output=True,
        text=True,
    )


def test_lint_script_exists_and_executable() -> None:
    """Sanity guard: the lint script is in place and runnable."""
    assert _LINT_SCRIPT.exists(), f"missing {_LINT_SCRIPT}"
    import os
    assert os.access(_LINT_SCRIPT, os.X_OK), f"not executable: {_LINT_SCRIPT}"


def test_lint_passes_on_empty_directory(tmp_path: Path) -> None:
    """Empty rules directory is a no-op; rule does not fire."""
    result = _run_lint(tmp_path)
    assert result.returncode == 0, (
        f"expected rc 0 on empty dir, got rc={result.returncode}\n"
        f"stdout: {result.stdout}\nstderr: {result.stderr}"
    )


@pytest.mark.parametrize(
    "literal_pattern",
    [
        "if value > 28.0:",
        "if value >= 25:",
        "if value < 0.95:",
        "if value <= 100:",
        "if value == 0:",
        "if value != 1:",
        "return value > 0.5",
    ],
)
def test_lint_blocks_literal_threshold(tmp_path: Path, literal_pattern: str) -> None:
    """A tab module that compares against a numeric literal must fail the lint."""
    bad = tmp_path / "tab_test_lint_bad.py"
    bad.write_text(f"def colour(value):\n    {literal_pattern}\n        return 'green'\n")

    result = _run_lint(tmp_path)
    assert result.returncode != 0, (
        f"expected lint to fail on `{literal_pattern}`, got rc=0\n"
        f"stdout: {result.stdout}\nstderr: {result.stderr}"
    )


def test_lint_passes_on_register_lookup(tmp_path: Path) -> None:
    """A tab module that compares against a register-sourced variable passes."""
    good = tmp_path / "tab_test_lint_good.py"
    good.write_text(
        "def colour(value, register):\n"
        "    threshold = register.lookup('portfolio_margin_pct').green_threshold\n"
        "    if value > threshold:\n"
        "        return 'green'\n"
        "    return 'red'\n"
    )

    result = _run_lint(tmp_path)
    assert result.returncode == 0, (
        f"expected rc 0 on register-lookup form, got rc={result.returncode}\n"
        f"stdout: {result.stdout}\nstderr: {result.stderr}"
    )


def test_lint_passes_on_assignment_with_literal(tmp_path: Path) -> None:
    """Plain assignment (=) is not a comparison; module constants are allowed."""
    f = tmp_path / "tab_test_lint_const.py"
    f.write_text("__version__ = 1\nMAX_RETRIES = 5\n")

    result = _run_lint(tmp_path)
    assert result.returncode == 0, (
        f"expected rc 0 on assignment-only file, got rc={result.returncode}\n"
        f"stdout: {result.stdout}\nstderr: {result.stderr}"
    )


def test_lint_passes_on_noqa_comment(tmp_path: Path) -> None:
    """Opt-out via `noqa: no-hardcoded-thresholds` is honoured."""
    f = tmp_path / "tab_test_lint_noqa.py"
    f.write_text(
        "def colour(value):\n"
        "    if value > 28.0:  # noqa: no-hardcoded-thresholds\n"
        "        return 'green'\n"
    )

    result = _run_lint(tmp_path)
    assert result.returncode == 0, (
        f"expected rc 0 with noqa, got rc={result.returncode}\n"
        f"stdout: {result.stdout}\nstderr: {result.stderr}"
    )


def test_lint_skips_comment_only_lines(tmp_path: Path) -> None:
    """A comment that mentions `value > 28.0` does not fire the rule."""
    f = tmp_path / "tab_test_lint_comment.py"
    f.write_text("# Future: replace value > 28.0 with register lookup\n")

    result = _run_lint(tmp_path)
    assert result.returncode == 0, (
        f"expected rc 0 on comment-only mention, got rc={result.returncode}\n"
        f"stdout: {result.stdout}\nstderr: {result.stderr}"
    )


def test_lint_skips_init_files(tmp_path: Path) -> None:
    """__init__.py files are not scanned (re-exports only, no rules)."""
    init = tmp_path / "__init__.py"
    init.write_text("VERSION_NUMBER = 1\nif True > 0:\n    pass\n")

    result = _run_lint(tmp_path)
    assert result.returncode == 0, (
        f"expected rc 0 on __init__.py, got rc={result.returncode}\n"
        f"stdout: {result.stdout}\nstderr: {result.stderr}"
    )


def test_lint_runs_against_real_rules_dir() -> None:
    """The default invocation scans backend/app/intelligence/rules and
    must pass at slice 2.3 close (no tab modules implemented yet)."""
    result = subprocess.run(
        [str(_LINT_SCRIPT)],
        capture_output=True,
        text=True,
        cwd=str(_LINT_SCRIPT.parent.parent),
    )
    assert result.returncode == 0, (
        f"real rules dir lint failed at slice 2.3 close: rc={result.returncode}\n"
        f"stdout: {result.stdout}\nstderr: {result.stderr}"
    )
