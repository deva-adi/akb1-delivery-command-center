#!/usr/bin/env bash
# AKB1 Delivery Command Center v1
# Block U+2014 EM DASH from staged source files.
#
# Adi hard rule: no em dashes in any file, commit, tag, filename, or
# comment. Use commas, periods, colons, or "and" instead.
#
# The single legitimate occurrence is the workspace path
# "AKB1 Base [U+2014] Chief of Staff" (per D-006). Lines containing the
# literal workspace path are excluded from the scan; any other em dash
# fails. This source file uses printf with explicit UTF-8 byte escapes
# so the file itself carries no literal em dash byte.
#
# Usage: check_em_dash.sh <file1> <file2> ...
# Pre-commit invokes this with the staged files.

set -e

# Build the U+2014 character (UTF-8 bytes E2 80 94) at runtime so the
# script source stays free of the literal character.
EM_DASH=$(printf '\xe2\x80\x94')

# Real workspace path with U+2014; lines matching this string are the one
# allowed occurrence and are excluded from the scan.
WORKSPACE_PATH="AKB1 Base ${EM_DASH} Chief of Staff"

EXIT=0

for f in "$@"; do
    if [ ! -f "$f" ]; then
        continue
    fi

    OFFENDING=$(grep -n "$EM_DASH" "$f" 2>/dev/null | grep -vF "$WORKSPACE_PATH" || true)

    if [ -n "$OFFENDING" ]; then
        echo "Em dash (U+2014) found in $f:" >&2
        printf '%s\n' "$OFFENDING" >&2
        EXIT=1
    fi
done

exit $EXIT
