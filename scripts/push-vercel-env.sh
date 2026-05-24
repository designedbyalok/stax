#!/usr/bin/env bash
# Pushes every env var in .env.local to Vercel's production environment.
# Skips comments, empty lines, and the local-only INNGEST_DEV flag.
#
# Run AFTER `vercel link` so .vercel/project.json exists.
#
# Usage:
#   scripts/push-vercel-env.sh [environment]
#     environment defaults to "production"; can also be "preview" or "development"

set -euo pipefail

ENV_FILE="${ENV_FILE:-.env.local}"
TARGET_ENV="${1:-production}"

if [ ! -f "$ENV_FILE" ]; then
  echo "✗ $ENV_FILE not found" >&2
  exit 1
fi

if [ ! -f .vercel/project.json ] && [ ! -f .vercel/repo.json ]; then
  echo "✗ project not linked — run \`vercel link\` first" >&2
  exit 1
fi

# Vars we never push to Vercel:
#   - INNGEST_DEV (local-only dev flag; prod uses cloud keys)
#   - AUTH_URL (Vercel sets VERCEL_URL automatically; AUTH_URL is set
#     once manually because it should be the canonical prod domain)
SKIP_KEYS=(
  "INNGEST_DEV"
  # AUTH_URL must point to the prod domain. .env.local has localhost — set
  # the prod value directly via `vercel env add AUTH_URL production`.
  "AUTH_URL"
)

is_skip() {
  for k in "${SKIP_KEYS[@]}"; do
    [ "$1" = "$k" ] && return 0
  done
  return 1
}

pushed=0
skipped=0

while IFS= read -r line || [ -n "$line" ]; do
  # Trim leading whitespace
  trimmed="${line#"${line%%[![:space:]]*}"}"

  # Skip blanks + comments
  [ -z "$trimmed" ] && continue
  [[ "$trimmed" == \#* ]] && continue

  # Match KEY=VALUE (value may be quoted)
  if [[ "$trimmed" =~ ^([A-Z_][A-Z0-9_]*)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    val="${BASH_REMATCH[2]}"
    # Strip surrounding double quotes
    if [[ "$val" =~ ^\"(.*)\"$ ]]; then
      val="${BASH_REMATCH[1]}"
    fi

    if is_skip "$key"; then
      echo "↷ skip   $key"
      skipped=$((skipped + 1))
      continue
    fi

    if [ -z "$val" ]; then
      echo "↷ empty  $key (not pushing)"
      skipped=$((skipped + 1))
      continue
    fi

    # Remove first so we always set the latest value (vercel CLI errors if it exists).
    vercel env rm "$key" "$TARGET_ENV" --yes >/dev/null 2>&1 || true

    printf "%s" "$val" | vercel env add "$key" "$TARGET_ENV" >/dev/null 2>&1
    echo "✓ pushed $key"
    pushed=$((pushed + 1))
  fi
done < "$ENV_FILE"

echo
echo "Done — $pushed pushed, $skipped skipped to $TARGET_ENV."
echo "Trigger a redeploy with:  vercel --prod"
