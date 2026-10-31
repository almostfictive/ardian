# Ardian basic needs implementation

Status: local source implemented; limited Release preview built and runtime checked. Full visual acceptance remains pending.
Date: October 31, 2026.

## Authorized scope

| PRD item | Source changes |
| --- | --- |
| 1 | Setup animation no longer starts music; removed its mute/unmute control. Other app sounds are unchanged. |
| 3 | Existing bookmarks bar sits above the toolbar on empty new tabs. It never shows on loaded or internal pages, including legacy “Always” preferences. New installations default to “On New Tab Only”; an existing explicit “Never” choice is preserved. The existing bar folder, bookmark engine, editing and reordering remain in use. |
| 4 | Symmetric address-field insets, pill shape, centred address with middle truncation, back/forward/reload on the left and screenshot/site-controls/split on the right. Extension toolbar overflow limits its width. Traffic lights remain outside the address field. |
| 6 | Bottom sidebar shortcuts: Home, Extensions, Bookmarks and Downloads. Plus adds missing internal destinations, Settings, History or a website. Right-click a shortcut to remove or move it left/right. Preferences persist through the existing settings store. The row scrolls horizontally when needed. Home defaults to a new tab; its address can be configured from the plus menu. |
| 7 | Holding Command alone for 200 milliseconds shows numbers for the first nine shortcut targets. Release, another key, or losing focus hides them. The same target calculation drives labels and tab selection. Command-9 selects the ninth target rather than the last. Collapsed groups contribute only their visible active entry. Numbers beyond nine and multi-digit selection are out of scope. |
| 8 | Removed the active row background, border and glow from sidebar tab and split rows, and the selected background from horizontal tab rows. Existing multi-selection and drag feedback remain. Top App tiles retain their separate tile design. |
| 9 | Removed the new-tab palette entry. Appearance settings remain. Added Settings through the Chromium context-menu bridge, the new-tab and empty-card menu, and native text editing menus while retaining their editing actions. Dedicated tab, bookmark, folder and other object menus retain their contextual operations. |

## Follow-up batch

| Change | Implementation |
| --- | --- |
| Feedback and promotional pop-ups | Removed the automatic browser check-in, telemetry request and release-note postcard from the new tab. Removed Send Feedback from the command catalog, Help menu and native command table. Explicit release notes remain available from Help. Confirmations for bookmarks, permissions and destructive actions still appear because those actions require a decision. |
| Empty bookmarks bar | Bookmark visibility and all three reserved toolbar offsets now account for the active profile's bookmarks-bar folder. The bar and its import prompt disappear when the folder has no items. With items present, the existing Always and New Tab Only modes remain effective. |
| New tab mark | Removed the coloured Ardian logo and its entrance animation. The new-tab command bar and optional profile power-up remain. |
| Native screenshots | The address-field camera button captures the current Chromium or WebKit page at 1x through the existing native page-capture API, saves a JPEG to Downloads with a collision-safe timestamped filename, and shows a toast with the filename. Sidebar address fields expose the same action on hover. |
| Embedded web apps | Added WhatsApp, Slack and Telegram shortcuts to the sidebar footer. A shortcut opens a resizable web view in a card beside the page instead of creating a tab. The app reuses the current profile's browser context, so sign-ins persist; private windows hide the shortcuts. Apps and extension side panels replace each other in the shared right-side slot. Internal app links stay in the card, while links that intentionally request a new window open through the browser. |

## Deliberate limits

This batch captures the visible page at 1x and saves it directly. It does not include the separate annotation editor from PRD item 5. Items 2 and 10 remain unchanged.

The Yab direction applies to the toolbar address-bar mode. The pre-existing alternate sidebar address-bar preference is retained. Narrow-window appearance, keyboard behavior, persisted settings and menu behavior need a running native build before acceptance.

## Checks and local preview

Browser TypeScript checking passed. Changed Swift files passed parsing and compiled in the native Release build. No automated test suite was added or executed.

The Apple Silicon Release app built successfully with ad-hoc signing through `scripts/ardian-local build --base-engine`. The final incremental build completed in 1 minute 16 seconds. Dependencies are installed, and the published engine archive was verified against its pinned SHA-256 checksum. Generated files live in the local Library cache with links from the repository, avoiding Desktop file-provider metadata that prevented engine helper signing.

A hidden instance launched using its own scratch profile. Its dev harness confirmed Release configuration, native API version 36, an isolated instance, the new settings defaults, one window and one new tab. The startup log contained no JavaScript exception.

The native screenshot path was exercised against `https://example.com` in the hidden instance. Chromium returned a 193,244-byte JPEG with a 1158 x 744 page frame, the shell wrote `Ardian Screenshot 2026-10-31 at 14.10.41.jpg` to Downloads, and the saved file rendered correctly. The toolbar action then saved a second valid JPEG and produced the Screenshot Saved toast with its filename. Opening Telegram set the active mini app without changing the tab count. The bookmarks-bar folder transitioned from zero to one to zero items during the runtime check. The mini-app panel, menu removal and new-tab visual state still need a visible acceptance pass on an unlocked screen.

The published engine matches the committed engine tree and excludes the uncommitted engine-side web-page Settings menu change. The excluded patch is recorded under `apps/browser/build-local-preview/excluded-engine.patch`. A Chromium source build is required to include it.

Double-click `preview-ardian.command` for a visible local preview with a separate manual-test profile. Setup and rebuild instructions are in `docs/local-preview.md`. The diagnostic instance was stopped. Nothing was installed in Applications, released or pushed to GitHub. Existing logo folders and `update-ardian.command` were not edited.
