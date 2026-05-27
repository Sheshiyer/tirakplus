#!/usr/bin/env bash
# install-git-hooks.sh — wire the tracked hooks in scripts/git-hooks/
# into .git/hooks/ as symlinks.
#
# Run once per fresh clone of tirakplus.git:
#   bash scripts/install-git-hooks.sh
#
# Idempotent. Re-running just refreshes the symlinks.

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
hooks_src="$repo_root/scripts/git-hooks"
hooks_dst="$repo_root/.git/hooks"

if [ ! -d "$hooks_src" ]; then
  echo "✗ Missing $hooks_src — nothing to install."
  exit 1
fi

mkdir -p "$hooks_dst"

count=0
for hook in "$hooks_src"/*; do
  name="$(basename "$hook")"
  # Skip non-hook files
  case "$name" in
    *.md|*.txt|README*) continue ;;
  esac
  target="$hooks_dst/$name"
  # Remove any prior file/symlink before linking
  rm -f "$target"
  ln -s "../../scripts/git-hooks/$name" "$target"
  chmod +x "$hook"
  count=$((count + 1))
  echo "✓ Linked $name → scripts/git-hooks/$name"
done

printf "\nInstalled %d hook(s). They live in scripts/git-hooks/ and are\n" "$count"
echo  "tracked by git — edit there, not in .git/hooks/."
