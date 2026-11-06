import { type SettingSection } from "./types";
import type { SettingsPane } from "../../../state/settings/settingsWindows";

export const toolRows = {
  shortcuts: [
    {
      section: "Keyboard Shortcuts",
      rows: {
        undoReopensClosedTab: {
          advanced: true,
          title: "⌘Z reopens closed tabs",
          description: "Outside text fields, as in Arc; press it again for the tab closed before. In a text field ⌘Z still undoes typing.",
          keywords: ["undo", "undo close tab", "reopen", "restore tab", "arc", "cmd z"],
        },
        actions: { title: "Customize keyboard shortcuts", keywords: ["hotkeys", "keybindings", "remap", "menu shortcuts"] },
      },
    },
    { section: "Extensions", rows: { extensionShortcuts: { advanced: true, title: "Extension shortcuts", description: "Shortcuts that extensions add, like opening their popup.", keywords: ["hotkeys"] } } },
  ],
  engines: [
    {
      section: "Default engine",
      rows: {
        defaultEngine: {
          advanced: true,
          title: "Open pages in",
          description: "New pages open in this engine unless a website rule says otherwise.",
          keywords: ["engine", "webkit", "chromium", "safari", "drm", "netflix", "fairplay", "widevine"],
        },
        recommendedDefault: {
          advanced: true,
          title: "Use Recommended Default",
          description: "Chromium runs extensions and the ad blocker. Sites that need protected video can still open in WebKit.",
          keywords: ["reset", "recommended", "chromium"],
        },
        protectedVideo: {
          advanced: true,
          title: "Open streaming sites in WebKit",
          description: "Netflix, Disney+, Max, Prime Video, Hulu, Apple TV+, Spotify and other sites whose video is protected open in WebKit, which plays it. A website rule wins.",
          shown: (s) => s.pageEngine !== "webkit",
          keywords: ["drm", "netflix", "disney", "hbo", "max", "prime video", "hulu", "spotify", "apple tv", "fairplay", "widevine", "streaming", "tencent video", "v.qq.com"],
        },
      },
    },
    {
      section: "Website rules",
      rows: {
        websiteRules: {
          advanced: true,
          title: "Website rules",
          description: "Sites that always open in a chosen engine. Links opened from a page stay on that page's engine.",
          keywords: ["opens in", "site engine", "rule", "webkit", "chromium"],
        },
      },
    },
    {
      section: "How engines differ",
      rows: {
        separateData: {
          advanced: true,
          title: "Separate sign-ins",
          description: "Each engine keeps its own cookies and site data in every profile. Spaces, tabs, history and settings are shared.",
          keywords: ["cookies", "site data", "sign in", "logged out"],
        },
        chromiumOnly: {
          advanced: true,
          title: "Extensions and ad blocking are Chromium only",
          description: "WebKit pages run without extensions or the ad blocker for now.",
          keywords: ["extensions", "ad blocker", "ublock", "content blocker"],
        },
        passkeys: {
          advanced: true,
          title: "Passkeys",
          description: "WebKit pages can't use passkeys until Apple grants Ardian its browser passkey entitlement. Sign in with a passkey in Chromium meanwhile.",
          keywords: ["passkey", "webauthn", "icloud keychain", "passwords app", "security key"],
        },
      },
    },
  ],
  advanced: [
    {
      section: "Browsing",
      rows: {
        showFullUrl: { advanced: true, title: "Show full URL in the address bar", description: "Instead of the site alone.", keywords: ["address", "url", "https"] },
        warnMovingTabs: { advanced: true, title: "Warn before moving tabs between profiles", description: "Some site data doesn't come along.", keywords: ["confirm"] },
        bookmarksImport: { advanced: true, title: "Show the Import bookmarks button", description: "On an empty bookmarks bar.", keywords: ["bookmarks bar"] },
      },
    },
    {
      section: "Performance",
      rows: {
        memorySaver: {
          advanced: true,
          title: "Memory Saver",
          description: "Ardian frees up memory from inactive tabs. This gives active tabs and other apps more computer resources and keeps Ardian fast. Your inactive tabs automatically become active again when you go back to them.",
          keywords: ["sleep", "sleeping tabs", "tab sleeping", "discard", "hibernate", "memory", "ram", "inactive tabs", "unload", "suspend", "performance"],
        },
        memorySaverMode: {
          advanced: true,
          title: "Memory savings",
          shown: (s) => s.memorySaver,
          keywords: ["sleep", "sleeping tabs", "moderate", "balanced", "maximum", "memory", "discard", "hibernate", "inactive tabs"],
        },
        batterySaver: { advanced: true, title: "Battery Saver", keywords: ["energy", "energy saver", "low power mode", "performance", "power"] },
      },
    },
    {
      section: "Always keep these sites active",
      rows: {
        keepActiveSites: {
          advanced: true,
          title: "Always keep these sites active",
          description: "Sites you add will always stay active and memory won't be freed up from them.",
          keywords: ["sleep", "never sleep", "keep awake", "exceptions", "discard", "hibernate", "memory saver", "memory"],
        },
      },
    },
    {
      section: "Data",
      rows: {
        history: { advanced: true, title: "History", description: "Every page you visited, by day.", keywords: ["browsing history"] },
        downloads: { advanced: true, title: "Downloads", description: "Files you downloaded, with where they're saved.", keywords: ["files"] },
      },
    },
    {
      section: "Command line",
      rows: {
        cliControl: { advanced: true, title: "Let the ardia command control Ardian", keywords: ["cli", "terminal", "devtools", "automation", "remote debugging"] },
        cliInstall: { advanced: true, title: "The ardia command", keywords: ["cli", "terminal", "install"] },
      },
    },
    {
      section: "Web engine",
      rows: {
        chromium: { advanced: true, title: "Chromium", keywords: ["engine", "version", "ardiacore"] },
        widevine: { advanced: true, title: "Widevine (protected video)", keywords: ["drm", "netflix", "disney", "spotify"] },
      },
    },
    {
      section: "Source and licenses",
      rows: {
        source: { advanced: true, title: "Source code", description: "Ardian is open source under the Apache License 2.0.", keywords: ["github", "open source"] },
        licenses: { advanced: true, title: "Licenses", description: "Every open-source part of the engine, with its copyright and license.", keywords: ["credits", "legal"] },
      },
    },
  ],
} satisfies Pick<Record<SettingsPane, SettingSection[]>, "shortcuts" | "engines" | "advanced">;
