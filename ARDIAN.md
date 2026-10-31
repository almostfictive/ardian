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

## Patches

Bundle identifier: com.almostfictive.ardian
