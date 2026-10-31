#!/bin/bash
set -euo pipefail
root=$(cd "$(dirname "$0")" && pwd)
app="$root/apps/browser/build-local-preview/Build/Products/Release/Ardian.app"
profile="$root/apps/browser/build-local-preview/manual-profile"
if [[ ! -x "$app/Contents/MacOS/Ardian" ]]; then
  echo "Build the preview first: scripts/ardian-local build --base-engine" >&2
  exit 1
fi
if [[ -f "$root/apps/browser/build-local-preview/excluded-engine.patch" ]]; then
  echo "Limited preview: the engine-side web-page Settings menu change is excluded."
fi
mkdir -p "$profile"
echo "Opening the local preview with its own profile at $profile"
export ARDIA_DATA_DIR="$profile"
export ARDIA_BACKGROUND=0
exec "$app/Contents/MacOS/Ardian"
