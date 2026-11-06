import type { BrowserWindow, Tab, Workspace } from "../browser/types";

export const defaultWorkspaceId = (profileId: string) => `workspace:${profileId}`;
export const MAX_WORKSPACES = 3;
export const activeWorkspaceId = (window: BrowserWindow, profileId = window.profileId) => window.activeWorkspaceIds?.[profileId] ?? defaultWorkspaceId(profileId);
export const tabWorkspaceId = (tab: Tab) => tab.workspaceId ?? defaultWorkspaceId(tab.profileId);
const cache = new WeakMap<BrowserWindow, Map<string, Workspace[]>>();
export function workspacesOf(window: BrowserWindow, profileId = window.profileId): Workspace[] {
  let profiles = cache.get(window);
  if (!profiles) { profiles = new Map(); cache.set(window, profiles); }
  const found = profiles.get(profileId);
  if (found) return found;
  const saved = window.workspaces?.filter((workspace) => workspace.profileId === profileId) ?? [];
  const initial: Workspace = { id: defaultWorkspaceId(profileId), profileId, name: "Home", icon: "house", display: "icon" };
  const result = (saved.some((workspace) => workspace.id === initial.id) ? saved : [initial, ...saved]).slice(0, MAX_WORKSPACES);
  for (let slot = 2; result.length < MAX_WORKSPACES; slot++) {
    const id = `${initial.id}:${slot}`;
    if (!result.some((workspace) => workspace.id === id)) result.push({ id, profileId, name: `Workspace ${slot}`, icon: "briefcase", display: "icon" });
  }
  profiles.set(profileId, result);
  return result;
}
