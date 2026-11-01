import { useShallow } from "zustand/react/shallow";
import { useBrowser } from "../browser/store";
import { newId } from "../browser/model";
import { activated, apply, withNewTab } from "../tabs/tabs";
import type { Workspace } from "../browser/types";
import { activeWorkspaceId, tabWorkspaceId, workspacesOf } from "./model";
import { leaveGroups } from "../groups/groups";

export const useWorkspaces = (windowId: string) => useBrowser(useShallow((s) => s.windows[windowId] ? workspacesOf(s.windows[windowId]!) : []));
export const useActiveWorkspace = (windowId: string) => useBrowser((s) => s.windows[windowId] ? activeWorkspaceId(s.windows[windowId]!) : "");

export function switchWorkspace(windowId: string, workspaceId: string) {
  let s = useBrowser.getState();
  const window = s.windows[windowId];
  if (!window || !workspacesOf(window).some((w) => w.id === workspaceId) || activeWorkspaceId(window) === workspaceId) return;
  const previous = window.activeTabIds[window.profileId];
  const updated = { ...window, activeWorkspaceIds: { ...window.activeWorkspaceIds, [window.profileId]: workspaceId }, workspaceActiveTabIds: { ...window.workspaceActiveTabIds, ...(previous ? { [activeWorkspaceId(window)]: previous } : {}) } };
  s = { ...s, windows: { ...s.windows, [windowId]: updated } };
  const remembered = updated.workspaceActiveTabIds?.[workspaceId];
  const belongs = (id: string) => s.tabs[id]?.windowId === windowId && s.tabs[id]?.profileId === window.profileId && tabWorkspaceId(s.tabs[id]!) === workspaceId;
  let target = remembered && belongs(remembered) ? remembered : window.tabIds.find(belongs);
  if (!target) [s, target] = withNewTab(s, windowId, { background: true });
  useBrowser.setState(apply(s, activated(s, target)));
}

export async function createWorkspace(windowId: string) {
  const s = useBrowser.getState();
  const window = s.windows[windowId];
  if (!window) return;
  const workspace: Workspace = { id: newId("workspace"), profileId: window.profileId, name: `Workspace ${workspacesOf(window).length + 1}`, icon: null, display: "none" };
  useBrowser.setState({ windows: { ...s.windows, [windowId]: { ...window, workspaces: [...workspacesOf(window), workspace] } } });
  switchWorkspace(windowId, workspace.id);
}

export function updateWorkspace(windowId: string, id: string, patch: Partial<Pick<Workspace, "name" | "icon" | "display">>) {
  const s = useBrowser.getState();
  const window = s.windows[windowId];
  if (!window || !workspacesOf(window).some((w) => w.id === id)) return;
  useBrowser.setState({ windows: { ...s.windows, [windowId]: { ...window, workspaces: workspacesOf(window).map((w) => w.id === id ? { ...w, ...patch, name: patch.name?.trim() || w.name } : w).concat(window.workspaces?.filter((w) => w.profileId !== window.profileId) ?? []) } } });
}

export function moveTabsToWorkspace(ids: string[], workspaceId: string) {
  let s = useBrowser.getState();
  const first = s.tabs[ids[0] ?? ""];
  const window = first && s.windows[first.windowId];
  if (!first || !window || !workspacesOf(window, first.profileId).some((w) => w.id === workspaceId)) return;
  const moving = ids.filter((id) => s.tabs[id]?.windowId === window.id && s.tabs[id]?.profileId === first.profileId);
  if (!moving.length) return;
  const tabs = { ...s.tabs };
  for (const id of moving) tabs[id] = { ...tabs[id]!, workspaceId };
  const wholeGroups = Object.values(s.groups).filter((g) => g.windowId === window.id && g.profileId === first.profileId && g.tabIds.length > 0 && g.tabIds.every((id) => moving.includes(id)));
  const groups = { ...leaveGroups(s.groups, new Set(moving)) };
  for (const group of wholeGroups) {
    const { parentId, ...root } = group;
    groups[group.id] = parentId && wholeGroups.some((g) => g.id === parentId) ? group : root;
  }
  const splits = Object.fromEntries(Object.entries(s.splits).filter(([, split]) => (() => { const ids = split.slots.flatMap((slot) => "tabId" in slot ? [slot.tabId] : slot.stack); return !ids.some((id) => moving.includes(id)) || ids.every((id) => moving.includes(id)); })()));
  s = { ...s, tabs, groups, splits, selection: {} };
  if (moving.includes(window.activeTabIds[window.profileId] ?? "") && workspaceId !== activeWorkspaceId(window)) {
    let replacement = window.tabIds.find((id) => tabs[id]?.profileId === window.profileId && tabWorkspaceId(tabs[id]!) === activeWorkspaceId(window));
    if (!replacement) [s, replacement] = withNewTab(s, window.id, { background: true });
    s = apply(s, activated(s, replacement));
  }
  useBrowser.setState(s);
}
