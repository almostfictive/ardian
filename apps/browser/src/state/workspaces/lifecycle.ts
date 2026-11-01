import { useBrowser } from "../browser/store";
import { useLifecycle } from "../tabs/sleepingTabs";
import { activeWorkspaceId, tabWorkspaceId } from "./model";
import type { BrowserState } from "../browser/store";
import { webviews } from "../../platform/webviews";

export function doNotSleep(url: string, sites: string[]): boolean {
  let parsed: URL;
  try { parsed = new URL(url); } catch { return true; }
  return sites.some((site) => {
    const pattern = site.trim().replace(/^\[\*\.\]/, "").replace(/^\*\./, "");
    try {
      const candidate = new URL(pattern.includes("://") ? pattern : `https://${pattern}`);
      const host = candidate.hostname.toLowerCase();
      const match = parsed.hostname.toLowerCase() === host || parsed.hostname.toLowerCase().endsWith(`.${host}`);
      return match && (!pattern.includes("://") || parsed.protocol === candidate.protocol) && (candidate.pathname === "/" || parsed.pathname.startsWith(candidate.pathname.replace(/\*$/, "")));
    } catch { return false; }
  });
}

export function workspaceFrozen(s: BrowserState, tabId: string): boolean {
  const tab = s.tabs[tabId];
  const window = tab && s.windows[tab.windowId];
  if (!tab || !window || !tab.url || doNotSleep(tab.url, s.settings.keepActiveSites)) return false;
  return tab.profileId !== window.profileId || tabWorkspaceId(tab) !== activeWorkspaceId(window, tab.profileId);
}

export const useWorkspaceFrozen = (tabId: string) => useBrowser((s) => workspaceFrozen(s, tabId));
const revisions = new Map<string, number>();
export function refreshWorkspaceFreeze(tabId: string) { applyWorkspaceFreeze(tabId, workspaceFrozen(useBrowser.getState(), tabId)); }
export function applyWorkspaceFreeze(tabId: string, frozen: boolean) {
  const handle = webviews.get(tabId);
  if (!handle) return;
  const revision = (revisions.get(tabId) ?? 0) + 1;
  revisions.set(tabId, revision);
  void handle.setFrozen(frozen).then(() => {
    if (webviews.get(tabId) !== handle || revisions.get(tabId) !== revision) return;
    useLifecycle.setState((s) => {
      const next = { ...s.frozen };
      if (frozen && !s.discarded[tabId]) next[tabId] = true;
      else delete next[tabId];
      return { frozen: next };
    });
  }).catch((error: unknown) => console.warn("Workspace freeze failed", error));
}

useBrowser.subscribe((s, prev) => {
  if (s.tabs === prev.tabs) return;
  for (const id of revisions.keys()) if (!s.tabs[id]) revisions.delete(id);
});
