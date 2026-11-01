import { create } from "zustand";
import { useBrowser } from "../browser/store";
import { engineProfile } from "../browser/model";

export const MINI_APPS = {
  whatsapp: { title: "WhatsApp", icon: "bubble.left", url: "https://web.whatsapp.com/" },
  slack: { title: "Slack", icon: "square.stack.3d.up", url: "https://app.slack.com/client" },
  telegram: { title: "Telegram", icon: "arrow.up.forward", url: "https://web.telegram.org/a/" },
  discord: { title: "Discord", icon: "gamecontroller", url: "https://discord.com/app" },
  gmail: { title: "Gmail", icon: "envelope", url: "https://mail.google.com/" },
  calendar: { title: "Calendar", icon: "calendar", url: "https://calendar.google.com/" },
} as const;
export type MiniAppId = keyof typeof MINI_APPS;
export const useMiniApps = create<{ active: Record<string, MiniAppId | undefined>; visited: Record<string, MiniAppId[]> }>()(() => ({ active: {}, visited: {} }));
export const useMiniAppProfile = (profileId: string) => useBrowser((s) => engineProfile(s, profileId));
export const openMiniApp = (windowId: string, app: MiniAppId) => {
  const window = useBrowser.getState().windows[windowId];
  if (!window || window.kind === "private" || !useBrowser.getState().settings.sidebarMiniApps.includes(app)) return;
  const key = `${windowId}|${window.profileId}`;
  useMiniApps.setState((s) => ({ active: { ...s.active, [windowId]: app }, visited: { ...s.visited, [key]: [...new Set([...(s.visited[key] ?? []), app])] } }));
};
export const closeMiniApp = (windowId: string) => useMiniApps.setState((s) => {
  const active = { ...s.active };
  delete active[windowId];
  return { active };
});
useBrowser.subscribe((s, previous) => {
  if (s.windows === previous.windows && s.settings.sidebarMiniApps === previous.settings.sidebarMiniApps) return;
  for (const [windowId, app] of Object.entries(useMiniApps.getState().active)) {
    if (app && (!s.windows[windowId] || s.windows[windowId]?.profileId !== previous.windows[windowId]?.profileId || !s.settings.sidebarMiniApps.includes(app))) closeMiniApp(windowId);
  }
  const visited = useMiniApps.getState().visited;
  const kept = Object.fromEntries(Object.entries(visited).filter(([key]) => !!s.windows[key.split("|")[0]!]));
  if (Object.keys(kept).length !== Object.keys(visited).length) useMiniApps.setState({ visited: kept });
});
