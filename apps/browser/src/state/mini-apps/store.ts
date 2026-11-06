import { create } from "zustand";
import { useBrowser } from "../browser/store";
import { engineProfile } from "../browser/model";

import { isMiniAppId, type MiniAppId } from "./model";
export { MINI_APPS, isMiniAppId, miniAppDefinition, type MiniAppId } from "./model";
type MiniAppsState = { active: Record<string, MiniAppId | undefined>; visited: Record<string, MiniAppId[]> };
export const useMiniApps = create<MiniAppsState>()(() => ({ active: {}, visited: {} }));
export const miniAppProfile = (profileId: string) => engineProfile(useBrowser.getState(), profileId);
export function openMiniApp(windowId: string, app: MiniAppId) {
  const window = useBrowser.getState().windows[windowId];
  if (!isMiniAppId(app) || !window || window.kind === "private" || !useBrowser.getState().settings.sidebarMiniApps.includes(app)) return;
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
useBrowser.subscribe((state, previous) => {
  const active = useMiniApps.getState().active;
  for (const [windowId, app] of Object.entries(active)) if (!state.windows[windowId] || state.windows[windowId]?.kind === "private" || state.windows[windowId]?.profileId !== previous.windows[windowId]?.profileId || (app && !state.settings.sidebarMiniApps.includes(app))) closeMiniApp(windowId);
  const visited = useMiniApps.getState().visited;
  const kept = Object.fromEntries(Object.entries(visited).filter(([key]) => !!state.windows[key.split("|")[0]!]));
  if (Object.keys(kept).length !== Object.keys(visited).length) useMiniApps.setState({ visited: kept });
});
