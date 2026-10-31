# Local Ardian preview

This workflow builds on this Mac. It does not require a GitHub push or GitHub Actions.

## Open the preview

After a successful build, double-click `preview-ardian.command` in the repository folder. It opens the Release app using a separate profile under `apps/browser/build-local-preview/manual-profile`. Keep its Terminal window open while using it; quit Ardian normally when finished.

The app contains its JavaScript bundle, so Metro is not needed. It is ad-hoc signed for local use and is not installed in Applications. Use the launcher to keep preview data isolated.

## Try the changes

On first launch, walk through setup and confirm it stays silent. The new tab should have no logo and no feedback, telemetry or release-note card. Its bookmarks bar should be absent while the bookmark folder is empty. Open a web page and use the camera button in the address field to save a screenshot to Downloads. Use the WhatsApp, Slack and Telegram buttons at the left of the sidebar footer; each should open in a resizable panel beside the page without adding a tab. Try the other sidebar shortcuts, their right-click menu, Command-held tab numbers and the text-field Settings menus. The web-page context-menu limitation below still applies.

## Rebuild after changes

From the repository folder:

```sh
scripts/ardian-local build --base-engine
```

Quit the preview before rebuilding, then run the launcher again. Changes are bundled when building; this Release preview does not reload edited source automatically.

For initial setup or after dependency changes:

```sh
scripts/ardian-local setup --base-engine
```

This installs the locked JavaScript and CocoaPods dependencies and downloads the engine pinned by `packages/ardiacore/prebuilt-engines.tsv`. The engine archive is checked against its SHA-256 checksum before extraction. The local build targets Apple Silicon. Generated engine and build files live in `~/Library/Caches/ArdianLocal/<checkout-key>`, linked from the repository, to keep Desktop file-provider metadata from breaking code signing. Setup removes Finder and resource-fork metadata from the downloaded framework before signing.

## Published engine limitation

`--base-engine` explicitly uses the engine published for the committed engine tree. Uncommitted engine changes are excluded and saved to `apps/browser/build-local-preview/excluded-engine.patch` after building. In this batch, the excluded change adds Settings to additional Chromium web-page context menus. The remaining JavaScript and native app changes are compiled into the preview.

A full preview of that context-menu change requires an incremental Chromium source build containing the engine edits. This machine does not have that Chromium build tree.

## Background diagnostics

For an agent's hidden, isolated instance:

```sh
scripts/ardian-local run
scripts/ardian-local stop
```

This uses a different profile at `apps/browser/build-local-preview/profile`, records ownership through `scripts/agent/ac`, and uses debugging port 9357. It does not bring windows forward. `stop` signals only the recorded preview process.

Print build and profile locations with:

```sh
scripts/ardian-local status
```
