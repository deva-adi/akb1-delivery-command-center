#!/usr/bin/env bash
# AKB1 Delivery Command Center v1
# No-hardcoded-thresholds lint per Design Foundations R4.2.
#
# Every tab intelligence layer rule reads green / amber / red boundaries
# from threshold_calibration_register at request time, never from a
# numeric literal in code. This rule scans the tab module directory for
# numeric-literal comparison patterns that would indicate a hardcoded
# threshold.
#
# Slice 2.7 ships the rule before the tab modules exist. The directory is
# the empty backend/app/intelligence/rules. Once tab rule files land in
# slice 6+, this lint enforces the design rule on every commit and on CI.
#
# Usage: check_no_hardcoded_thresholds.sh
# CI runs this as part of the lint stage. Exit non-zero on any match.

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Optional path arg overrides the default scan target. Used by the lint
# unit tests in backend/tests/unit/test_no_hardcoded_thresholds.py to
# point the rule at a temp directory of fixture files.
INTELLIGENCE_DIR="${1:-${REPO_ROOT}/backend/app/intelligence/rules}"

if [ ! -d "$INTELLIGENCE_DIR" ]; then
    echo "no-hardcoded-thresholds: no rules directory at $INTELLIGENCE_DIR; skipping"
    exit 0
fi

# Files to scan: only Python modules in the rules directory. Exclude
# __init__.py and tests.
TARGET_FILES=$(find "$INTELLIGENCE_DIR" -type f -name '*.py' \
    -not -name '__init__.py' \
    -not -path '*/tests/*' 2>/dev/null || true)

if [ -z "$TARGET_FILES" ]; then
    echo "no-hardcoded-thresholds: no rule modules to scan yet; rule is in place for future slices"
    exit 0
fi

# Pattern: Python comparison operator followed by a numeric literal.
#   value > 28.0
#   value >= 25
#   value <= 0.95
#   value == 100
#   value != 0
# Plain assignment (=) is intentionally excluded so module-level constants
# like `__version__ = 1` do not trip the rule. False positives are tolerated;
# the rule is conservative and meant to flag obvious hardcoding so reviewers
# ask "why not the register".
PATTERN='(>=|<=|==|!=|>|<)[[:space:]]*[+-]?[0-9]+(\.[0-9]+)?\b'

OFFENDING=""
for f in $TARGET_FILES; do
    # grep -n on a single file emits LINENO:CONTENT (no filename prefix).
    # Skip lines that are pure comments or carry the noqa opt-out.
    HITS=$(grep -nE "$PATTERN" "$f" 2>/dev/null \
        | grep -vE '^[0-9]+:[[:space:]]*#' \
        | grep -vE 'noqa: no-hardcoded-thresholds' \
        || true)
    if [ -n "$HITS" ]; then
        OFFENDING="${OFFENDING}${f}:\n${HITS}\n"
    fi
done

if [ -n "$OFFENDING" ]; then
    echo "Hardcoded threshold literals found in tab intelligence modules:" >&2
    printf '%b\n' "$OFFENDING" >&2
    echo "" >&2
    echo "Per Design Foundations R4.2 every threshold must read from" >&2
    echo "threshold_calibration_register. Add 'noqa: no-hardcoded-thresholds'" >&2
    echo "to a line only if the literal is intentional and not a register value." >&2
    exit 1
fi

exit 0
