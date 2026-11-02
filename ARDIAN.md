# Ardian

A personal fork of Ardia, with its upstream interface and behaviour.

## Identity

The app is named Ardian, uses the bird icon, and has bundle identifier `com.almostfictive.ardian`.
First launch skips onboarding. What’s New, Video Tour and Release Notes are hidden.
Upstream’s Glass/Classic preference and all browser layouts remain unchanged.

## Build and release

Requirements: Xcode 26+, CocoaPods, Node 22.13+, pnpm 11; Apple Silicon.
Run `scripts/ardian-local setup --base-engine`, then `scripts/ardian-local build --base-engine`.
The checksum-verified published engine matching this checkout is preferred; `--base-engine` permits the nearest published ancestor when needed.
The ad-hoc release workflow is `.github/workflows/release-ardian.yml`, triggered by a version tag or manually.
Updates are manual downloads from GitHub Releases; `update-ardian.command` checks the download before replacing the installed app.
Deploy publish jobs skip when the Hexclave key is absent. Dependabot checks dependencies weekly.

## Syncing with Ardia
Run `scripts/ardian-sync` from a clean checkout after pushing `main`.
It fetches both remotes and pushes `sync/ardia-YYYY-MM-DD` for review.
List section branches, one per line, in `scripts/ardian-sections.txt`; each gets `sync/<branch>-YYYY-MM-DD`.
A conflict aborts that merge and stops; resolve it on a separate branch. Existing dated branches are never overwritten.
