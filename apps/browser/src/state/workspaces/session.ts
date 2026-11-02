import { isFields, isString } from "../../lib/decode";
import type { BrowserWindow, Tab, Workspace } from "../browser/types";
import { activeWorkspaceId, defaultWorkspaceId, tabWorkspaceId, workspacesOf } from "./model";

const displays: Workspace["display"][] = ["name", "icon", "emoji", "picture", "none"];
const stringMap = (value: unknown): Record<string, string> => isFields(value) ? Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => isString(entry[1]))) : {};

export function workspaceWindowFromDisk(window: BrowserWindow): BrowserWindow {
  const workspaces: Workspace[] = [];
  const seen = new Set<string>();
  for (const value of Array.isArray(window.workspaces) ? window.workspaces : []) {
    if (!isFields(value) || !isString(value.id) || !isString(value.profileId) || !isString(value.name) || !value.name.trim() || !displays.includes(value.display as Workspace["display"]) || seen.has(value.id)) continue;
    seen.add(value.id);
    workspaces.push({ id: value.id, profileId: value.profileId, name: value.name.trim(), icon: isString(value.icon) ? value.icon : null, display: value.display as Workspace["display"] });
  }
  return { ...window, workspaces, activeWorkspaceIds: stringMap(window.activeWorkspaceIds), workspaceActiveTabIds: stringMap(window.workspaceActiveTabIds) };
}

export function restoreWindowWorkspaces(window: BrowserWindow, tabs: Record<string, Tab>): BrowserWindow {
  const activeWorkspaceIds: Record<string, string> = {};
  const activeTabIds: Record<string, string> = {};
  const workspaceActiveTabIds: Record<string, string> = {};
  const members = window.tabIds.map((id) => tabs[id]!).filter(Boolean);
  for (const profileId of new Set(members.map((tab) => tab.profileId))) {
    const valid = workspacesOf(window, profileId);
    for (const tab of members.filter((t) => t.profileId === profileId)) {
      if (!valid.some((workspace) => workspace.id === tabWorkspaceId(tab))) tabs[tab.id] = { ...tab, workspaceId: defaultWorkspaceId(profileId) };
    }
    const inProfile = members.filter((t) => t.profileId === profileId).map((t) => tabs[t.id]!);
    const remembered = inProfile.find((t) => t.id === window.activeTabIds[profileId]) ?? inProfile[0]!;
    const requested = activeWorkspaceId(window, profileId);
    const selected = inProfile.some((t) => tabWorkspaceId(t) === requested) ? requested : tabWorkspaceId(remembered);
    const active = inProfile.find((t) => t.id === window.workspaceActiveTabIds?.[selected] && tabWorkspaceId(t) === selected) ?? inProfile.find((t) => t.id === remembered.id && tabWorkspaceId(t) === selected) ?? inProfile.find((t) => tabWorkspaceId(t) === selected)!;
    activeWorkspaceIds[profileId] = selected;
    activeTabIds[profileId] = active.id;
    for (const workspace of valid) {
      const kept = inProfile.find((t) => t.id === window.workspaceActiveTabIds?.[workspace.id] && tabWorkspaceId(t) === workspace.id) ?? inProfile.find((t) => tabWorkspaceId(t) === workspace.id);
      if (kept) workspaceActiveTabIds[workspace.id] = kept.id;
    }
    workspaceActiveTabIds[selected] = active.id;
  }
  return { ...window, activeWorkspaceIds, activeTabIds, workspaceActiveTabIds };
}
