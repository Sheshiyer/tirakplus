#!/usr/bin/env bash
# agent-preflight.sh — assert the cwd is the canonical tirakplus repo.
#
# Run at the start of any agent session, or before any destructive op.
# Exits 0 if everything looks right, 1 if anything is off (with a clear
# message). The pre-commit hook (install via scripts/install-git-hooks.sh)
# wraps this same check so a misaligned commit can't accidentally land.
#
# Background: two `tirakplus` directories exist on this machine:
#   1) Tirak/standalone-repos/tirakplus/   ← this repo, tirakplus.git
#   2) Tirak/tirakplus/                    ← stale sibling inside the
#                                            vault (kkv2-astro-wiki.git)
# A zoxide config quirk has been observed resetting bare `cd` calls to
# directory #2 mid-session. This preflight catches that before any
# write or commit goes to the wrong place.

set -euo pipefail

EXPECTED_REMOTE_FRAGMENT="Sheshiyer/tirakplus.git"
EXPECTED_PATH_FRAGMENT="standalone-repos/tirakplus"

CWD="$(pwd)"
REMOTE="$(git remote get-url origin 2>/dev/null || echo "<no remote>")"

red()   { printf "\033[31m%s\033[0m\n" "$*"; }
green() { printf "\033[32m%s\033[0m\n" "$*"; }
yellow(){ printf "\033[33m%s\033[0m\n" "$*"; }

fail=0

if ! echo "$CWD" | grep -q "$EXPECTED_PATH_FRAGMENT"; then
  red "✗ Wrong working directory."
  echo  "   cwd:      $CWD"
  echo  "   expected: …/$EXPECTED_PATH_FRAGMENT/"
  fail=1
fi

if ! echo "$REMOTE" | grep -q "$EXPECTED_REMOTE_FRAGMENT"; then
  red "✗ Wrong git remote."
  echo  "   origin:   $REMOTE"
  echo  "   expected: …$EXPECTED_REMOTE_FRAGMENT"
  fail=1
fi

if [ "$fail" -eq 1 ]; then
  red ""
  red "STOP — you are NOT in the tirakplus repo."
  yellow "Recover with:"
  echo  "    cd /Volumes/madara/2026/Projects/thoughtseed/tirak/standalone-repos/tirakplus"
  exit 1
fi

green "✓ tirakplus preflight OK"
echo  "   cwd:    $CWD"
echo  "   origin: $REMOTE"
exit 0
