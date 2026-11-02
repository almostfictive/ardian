import { create } from "zustand";
import { useBrowser } from "../browser/store";
import { engineProfile } from "../browser/model";

export const MINI_APPS = {
  whatsapp: { title: "WhatsApp", icon: "bubble.left", url: "https://web.whatsapp.com/" },
  slack: { title: "Slack", icon: "square.stack.3d.up", url: "https://app.slack.com/client" },
  telegram: { title: "Telegram", icon: "paperplane", url: "https://web.telegram.org/a/" },
  discord: { title: "Discord", icon: "gamecontroller", url: "https://discord.com/app" },
  gmail: { title: "Gmail", icon: "envelope", url: "https://mail.google.com/" },
  calendar: { title: "Calendar", icon: "calendar", url: "https://calendar.google.com/" },
} as const;
export type MiniAppId = keyof typeof MINI_APPS;
type MiniAppsState = { active: Record<string, MiniAppId | undefined>; visited: Record<string, MiniAppId[]> };
export const useMiniApps = create<MiniAppsState>()(() => ({ active: {}, visited: {} }));
export const miniAppProfile = (profileId: string) => engineProfile(useBrowser.getState(), profileId);
export function openMiniApp(windowId: string, app: MiniAppId) {
  const window = useBrowser.getState().windows[windowId];
  if (!window || window.kind === "private") return;
  const key = `${windowId}|${window.profileId}`;
  useMiniApps.setState((state) => ({ active: { ...state.active, [windowId]: app }, visited: { ...state.visited, [key]: [...new Set([...(state.visited[key] ?? []), app])] } }));
}
export function closeMiniApp(windowId: string) {
  useMiniApps.setState((state) => {
    const active = { ...state.active };
    delete active[windowId];
    return { active };
  });
}
useBrowser.subscribe((state) => {
  const active = useMiniApps.getState().active;
  for (const windowId of Object.keys(active)) if (!state.windows[windowId] || state.windows[windowId]?.kind === "private") closeMiniApp(windowId);
  const visited = useMiniApps.getState().visited;
  const kept = Object.fromEntries(Object.entries(visited).filter(([key]) => !!state.windows[key.split("|")[0]!]));
  if (Object.keys(kept).length !== Object.keys(visited).length) useMiniApps.setState({ visited: kept });
});
