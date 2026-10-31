import { chooseFromMenu } from "../app/menuChoice";
import { prompt } from "../../platform/dialogs";
import { currentSettings } from "../browser/current";
import { useBrowser } from "../browser/store";
import { runCommand } from "../commands/commands";
import { updateSettings } from "../settings/actions";

export const FOOTER_HEIGHT = 42;
export const FOOTER_ITEMS = {
  home: { title: "Home", icon: "house" },
  extensions: { title: "Extensions", icon: "puzzlepiece.extension" },
  bookmarks: { title: "Bookmarks", icon: "book" },
  downloads: { title: "Downloads", icon: "arrow.down.circle" },
  history: { title: "History", icon: "clock" },
  settings: { title: "Settings", icon: "gearshape" },
} as const;

type FooterId = keyof typeof FOOTER_ITEMS;
const known = (id: string): id is FooterId => Object.hasOwn(FOOTER_ITEMS, id);
export function footerItem(id: string) {
  if (known(id)) return FOOTER_ITEMS[id];
  try { return { title: new URL(id).hostname, icon: "globe" }; }
  catch { return { title: id, icon: "globe" }; }
}

export function openFooterItem(windowId: string, id: string) {
  if (id === "home" || !known(id)) {
    const url = id === "home" ? currentSettings().homePage : id;
    useBrowser.getState().newTab(windowId, { url });
    return;
  }
  const commands = { extensions: "manageExtensions", bookmarks: "manageBookmarks", downloads: "downloads", history: "showHistory", settings: "openSettings" } as const;
  runCommand({ command: commands[id as Exclude<FooterId, "home">], arg: null, windowId });
}

export async function addFooterItem() {
  const items = currentSettings().sidebarShortcuts;
  const choice = await chooseFromMenu([
    ...Object.entries(FOOTER_ITEMS).filter(([id]) => !items.includes(id)).map(([id, item]) => ({ id, title: item.title, symbol: item.icon })),
    { id: "custom", title: "Add Website…", symbol: "link" },
    { id: "homePage", title: "Set Home Page…", symbol: "house" },
  ]);
  if (!choice) return;
  if (choice === "homePage" || choice === "custom") {
    const url = await askForUrl(choice === "homePage" ? "Home Page" : "Website Shortcut", choice === "homePage" ? currentSettings().homePage : "");
    if (url === null) return;
    if (choice === "homePage") return updateSettings({ homePage: url });
    if (!url) return;
    const latest = currentSettings().sidebarShortcuts;
    if (!latest.includes(url)) updateSettings({ sidebarShortcuts: [...latest, url] });
    return;
  }
  const latest = currentSettings().sidebarShortcuts;
  if (!latest.includes(choice)) updateSettings({ sidebarShortcuts: [...latest, choice] });
}

export async function editFooterItem(id: string) {
  const items = currentSettings().sidebarShortcuts;
  const index = items.indexOf(id);
  const choice = await chooseFromMenu([
    { id: "left", title: "Move Left", enabled: index > 0 },
    { id: "right", title: "Move Right", enabled: index >= 0 && index < items.length - 1 },
    { id: "remove", title: "Remove Shortcut" },
  ]);
  const latest = [...currentSettings().sidebarShortcuts];
  const at = latest.indexOf(id);
  if (!choice || at < 0) return;
  if (choice === "remove") latest.splice(at, 1);
  else {
    const to = at + (choice === "left" ? -1 : 1);
    if (to < 0 || to >= latest.length) return;
    [latest[at], latest[to]] = [latest[to]!, latest[at]!];
  }
  updateSettings({ sidebarShortcuts: latest });
}

async function askForUrl(title: string, value: string): Promise<string | null> {
  const input = await prompt({ title, message: "Enter a website address. Leave Home empty to open a new tab.", value });
  if (input === null) return null;
  const text = input.trim();
  if (!text) return "";
  try {
    const url = new URL(text.includes("://") ? text : `https://${text}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch { return null; }
}
