# Ardian

A fork of Ardia.

## Build

Engine: prebuilt Chromium framework, about 110 MB, Apple Silicon only.

Requirements: Xcode 26+, CocoaPods, Node 22.13+, pnpm 11.

```bash
pnpm install
pnpm pods
pnpm dev
pnpm macos
```

If the main branch engine is newer than the last prebuilt engine, work
from a release tag instead.

## Release

GitHub Actions workflow: .github/workflows/release-ardian.yml
Trigger: tag vX.Y.Z, or manual run with a version.
Output: Release app zip in GitHub Releases.
Signing: ad-hoc only.
Update: manual download from GitHub Releases. No automatic in-app update.

## Patches

Bundle identifier: com.almostfictive.ardian
Toolbar band: GlassFill
Toolbar: floating glass pill
