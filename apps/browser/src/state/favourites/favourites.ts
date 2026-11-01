import { create } from "zustand";
import { readDocument, writeDocument } from "../../platform/documents";
import { parseSaved, versionedJson, unchanged } from "../../lib/savedDocument";
import { isFields } from "../../lib/decode";
import { useBrowser } from "../browser/store";
import { isIncognitoProfile } from "../browser/model";
import { prompt } from "../../platform/dialogs";
import { chooseFromMenu } from "../app/menuChoice";

type Favourite = { id: string; title: string; url: string };
const DEFAULTS: Favourite[] = [
  { id: "portfolio", title: "Portfolio", url: "https://sebastiancuri.com" },
  { id: "substack", title: "Substack", url: "https://substack.com" },
  { id: "youtube", title: "YouTube", url: "https://youtube.com" },
  { id: "google", title: "Google", url: "https://google.com" },
];
const DOC = "favourites.json";
const raw = parseSaved(readDocument(DOC), 1, { 0: unchanged });
const valid = (value: unknown): value is Favourite[] => Array.isArray(value) && value.every((v) => isFields(v) && typeof v.id === "string" && typeof v.title === "string" && typeof v.url === "string" && /^https?:\/\//i.test(v.url));
const saved = isFields(raw?.profiles) ? Object.fromEntries(Object.entries(raw.profiles).filter(([profile, value]) => !isIncognitoProfile(profile) && valid(value))) as Record<string, Favourite[]> : {};
const useFavourites = create<{ profiles: Record<string, Favourite[]> }>()(() => ({ profiles: saved }));
export const usePageFavourites = (profileId: string) => useFavourites((s) => s.profiles[profileId] ?? DEFAULTS);
const save = (profileId: string, items: Favourite[]) => {
  if (isIncognitoProfile(profileId)) return;
  useFavourites.setState((s) => ({ profiles: { ...s.profiles, [profileId]: items } }));
  writeDocument(DOC, versionedJson({ profiles: useFavourites.getState().profiles }, 1));
};
export const openFavourite = (windowId: string, item: Favourite) => useBrowser.getState().newTab(windowId, { url: item.url });
export async function favouriteMenu(windowId: string, item?: Favourite) {
  const window = useBrowser.getState().windows[windowId];
  if (!window || window.kind === "private") return;
  const items = useFavourites.getState().profiles[window.profileId] ?? DEFAULTS;
  if (item) {
    const choice = await chooseFromMenu([{ id: "open", title: "Open Favorite" }, { id: "remove", title: "Remove Favorite", symbol: "trash" }]);
    if (choice === "open") openFavourite(windowId, item);
    if (choice === "remove") save(window.profileId, items.filter((f) => f.id !== item.id));
    return;
  }
  const url = await prompt({ title: "Add Favorite", placeholder: "https://example.com", confirmTitle: "Add", windowId });
  if (!url?.trim()) return;
  try {
    const parsed = new URL(url.includes("://") ? url.trim() : `https://${url.trim()}`);
    if (!/^https?:$/.test(parsed.protocol)) return;
    save(window.profileId, [...items, { id: `favorite-${Date.now()}`, title: parsed.hostname.replace(/^www\./, ""), url: parsed.href }]);
  } catch { return; }
}
