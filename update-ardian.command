#!/bin/bash
# Ardian updater — one double-click, no GitHub website, no $99 signing.
# What it does, in plain words:
#  1. Asks GitHub what the latest Ardian release is.
#  2. If you already have that version, it stops and tells you.
#  3. If not, it downloads it, quits the old Ardian, replaces it in
#     Applications, and clears the download block so macOS will open it
#     without the "can't verify" warning.
# It only touches Ardian. It never touches Opera or any other browser.
set -e
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

if [ -f "$STATE" ] && [ "$(cat "$STATE")" = "$TAG" ] && [ -d "$APP" ]; then
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
ditto -x -k "$TMPDIR/Ardian.zip" "$TMPDIR"
if [ -d "$APP" ]; then
  echo "Moving the old Ardian to Trash..."
  osascript -e 'tell application "Finder" to delete POSIX file "/Applications/Ardian.app"' 2>/dev/null || rm -rf "$APP"
fi
ditto "$TMPDIR/Ardian.app" "$APP"
xattr -dr com.apple.quarantine "$APP" 2>/dev/null || true
printf '%s' "$TAG" > "$STATE"
echo "Done. Ardian $TAG is now in Applications."
echo "You can open Ardian normally now."
