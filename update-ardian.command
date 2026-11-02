#!/bin/bash
set -eo pipefail
REPO="almostfictive/Ardian"
APP="/Applications/Ardian.app"
STATE="$HOME/.ardian-update-state"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

echo "Checking for the latest Ardian release..."
LATEST_JSON="$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest")"
TAG="$(printf '%s' "$LATEST_JSON" | python3 -c 'import sys, json; print(json.load(sys.stdin)["tag_name"])')"
URL="$(printf '%s' "$LATEST_JSON" | python3 -c 'import sys, json; d=json.load(sys.stdin); print([a["browser_download_url"] for a in d["assets"] if a["name"].startswith("Ardian-") and a["name"].endswith(".zip")][0])')"
echo "Latest release: $TAG"

if [ -f "$STATE" ] && [ "$(cat "$STATE")" = "$TAG" ] && [ -x "$APP/Contents/MacOS/Ardian" ]; then
  echo "You already have $TAG. Nothing to do."
  exit 0
fi

echo "Downloading $TAG..."
curl -fL -o "$TMPDIR/Ardian.zip" "$URL"
echo "Installing..."
if pgrep -x Ardian >/dev/null 2>&1; then
  echo "Quitting Ardian first..."
  osascript -e 'tell application "Ardian" to quit' 2>/dev/null || true
  sleep 2
fi
if pgrep -x Ardian >/dev/null 2>&1; then
  echo "Ardian is still running. Your installed copy was left alone." >&2
  exit 1
fi
ditto -x -k "$TMPDIR/Ardian.zip" "$TMPDIR"
if [ ! -x "$TMPDIR/Ardian.app/Contents/MacOS/Ardian" ] || [ "$(/usr/libexec/PlistBuddy -c 'Print CFBundleIdentifier' "$TMPDIR/Ardian.app/Contents/Info.plist" 2>/dev/null)" != "com.almostfictive.ardian" ]; then
  echo "The download did not contain a valid Ardian.app. Your installed copy was left alone." >&2
  exit 1
fi
if [ -d "$APP" ]; then
  echo "Moving the old Ardian to Trash..."
  osascript -e 'tell application "Finder" to delete POSIX file "/Applications/Ardian.app"' 2>/dev/null || rm -rf "$APP"
fi
ditto "$TMPDIR/Ardian.app" "$APP"
if [ ! -x "$APP/Contents/MacOS/Ardian" ]; then
  echo "The new app did not install. This version was not recorded." >&2
  exit 1
fi
xattr -dr com.apple.quarantine "$APP" 2>/dev/null || true
printf '%s' "$TAG" > "$STATE"
echo "Done. Ardian $TAG is now in Applications."
echo "You can open Ardian normally now."
