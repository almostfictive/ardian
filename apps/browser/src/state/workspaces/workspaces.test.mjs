import assert from "node:assert/strict";
import { test } from "node:test";

globalThis.__DEV__ = false;
const { useBrowser } = await import("../browser/store.ts");
const { switchWorkspace, moveTabsToWorkspace } = await import("./actions.ts");
const { defaultWorkspaceId, activeWorkspaceId } = await import("./model.ts");
const { doNotSleep, workspaceFrozen, applyWorkspaceFreeze } = await import("./lifecycle.ts");
const { numberedTabs } = await import("../sidebar/entries.ts");
const { webviews } = await import("../../platform/webviews.ts");
const { useLifecycle } = await import("../tabs/sleepingTabs.ts");
const { parseSession } = await import("../session/persist.ts");
const s = () => useBrowser.getState();
function setup() {
  s().hydrate({});
  const windowId = s().createWindow();
  const window = s().windows[windowId];
  const home = defaultWorkspaceId(window.profileId);
  const other = "workspace:other";
  useBrowser.setState({ windows: { ...s().windows, [windowId]: { ...window, workspaces: [{ id: home, profileId: window.profileId, name: "Home", icon: "house", display: "icon" }, { id: other, profileId: window.profileId, name: "Other", icon: "briefcase", display: "icon" }] } } });
  return { windowId, home, other, profileId: window.profileId };
}

test("workspace switches preserve pages and remember each active tab", () => {
  const { windowId, home, other } = setup();
  const first = s().newTab(windowId, { url: "https://example.com/first" });
  const page = s().tabs[first].page;
  switchWorkspace(windowId, other);
  const second = s().newTab(windowId, { url: "https://example.com/second" });
  assert(!numberedTabs(s(), windowId).includes(first));
  assert(numberedTabs(s(), windowId).includes(second));
  assert(workspaceFrozen(s(), first));
  switchWorkspace(windowId, home);
  assert.equal(s().windows[windowId].activeTabIds[s().windows[windowId].profileId], first);
  assert.equal(s().tabs[first].page, page);
  assert(!workspaceFrozen(s(), first));
  assert(workspaceFrozen(s(), second));
});

test("moving multiple tabs keeps the source workspace selected and preserves pages", () => {
  const { windowId, home, other } = setup();
  const first = s().newTab(windowId, { url: "https://example.com/one" });
  const second = s().newTab(windowId, { url: "https://example.com/two" });
  const page = s().tabs[second].page;
  moveTabsToWorkspace([first, second], other);
  assert.equal(activeWorkspaceId(s().windows[windowId]), home);
  assert.equal(s().tabs[first].workspaceId, other);
  assert.equal(s().tabs[second].page, page);
  assert(!numberedTabs(s(), windowId).includes(first));
  switchWorkspace(windowId, other);
  assert(numberedTabs(s(), windowId).includes(first));
  assert(numberedTabs(s(), windowId).includes(second));
});

test("closing the active tab stays inside its workspace", () => {
  const { windowId, home, other } = setup();
  const first = s().newTab(windowId, { url: "https://example.com/one" });
  switchWorkspace(windowId, other);
  s().newTab(windowId, { url: "https://example.com/two" });
  switchWorkspace(windowId, home);
  s().closeTab(first);
  assert.equal(activeWorkspaceId(s().windows[windowId]), home);
  const active = s().tabs[s().windows[windowId].activeTabIds[s().windows[windowId].profileId]];
  assert.equal(active.workspaceId, home);
});

test("normal and private windows start with fresh tabs and workspaces", () => {
  const { windowId, other, profileId } = setup();
  const tab = s().newTab(windowId, { url: "https://example.com", pinned: true });
  switchWorkspace(windowId, other);
  for (const kind of ["main", "private"]) {
    const id = s().createWindow({ kind, profileId });
    assert.deepEqual(s().windows[id].workspaces ?? [], []);
    assert(!s().windows[id].tabIds.includes(tab));
    assert.equal(s().windows[id].tabIds.length, 1);
    assert.equal(s().tabs[s().windows[id].tabIds[0]].url, "");
  }
});

test("profiles have separate identities and workspace moves cannot cross profiles", () => {
  const { windowId, other, profileId } = setup();
  const tab = s().newTab(windowId, { url: "https://example.com" });
  const next = s().createProfile({ name: "Work", shareWith: profileId });
  assert.equal(s().profiles[next].dataId, undefined);
  s().switchProfile(windowId, next);
  const work = s().newTab(windowId, { url: "https://work.example.com" });
  moveTabsToWorkspace([work], other);
  assert.equal(s().tabs[work].workspaceId, defaultWorkspaceId(next));
  s().moveTabToProfile(tab, next);
  assert.equal(s().tabs[tab].profileId, profileId);
});

test("do-not-sleep URLs stay live and discarded pages are never marked frozen", async () => {
  const { windowId, other } = setup();
  const tab = s().newTab(windowId, { url: "https://music.example.com/player" });
  switchWorkspace(windowId, other);
  s().updateSettings({ keepActiveSites: ["[*.]example.com"] });
  assert(!workspaceFrozen(s(), tab));
  assert(doNotSleep("https://music.example.com/player", ["example.com"]));
  assert(!doNotSleep("https://badexample.com/", ["example.com"]));
  let done;
  webviews.set(tab, { setFrozen: () => new Promise((resolve) => { done = resolve; }) });
  applyWorkspaceFreeze(tab, true);
  useLifecycle.setState({ discarded: { [tab]: true }, frozen: {} });
  done();
  await Promise.resolve();
  assert(!useLifecycle.getState().frozen[tab]);
  webviews.delete(tab);
});

test("sessions restore workspace selections and validate malformed fields", () => {
  const { windowId, home, other } = setup();
  const first = s().newTab(windowId, { url: "https://example.com/first" });
  switchWorkspace(windowId, other);
  const second = s().newTab(windowId, { url: "https://example.com/second" });
  const state = s();
  const saved = parseSession(JSON.stringify({ version: 10, profiles: state.profiles, profileOrder: state.profileOrder, windows: Object.values(state.windows), tabs: Object.values(state.tabs), groups: [], splits: [] }));
  assert(saved);
  s().hydrate(saved);
  assert.equal(activeWorkspaceId(s().windows[windowId]), other);
  assert.equal(s().windows[windowId].activeTabIds[state.windows[windowId].profileId], second);
  switchWorkspace(windowId, home);
  assert.equal(s().windows[windowId].activeTabIds[state.windows[windowId].profileId], first);
  const malformed = parseSession(JSON.stringify({ version: 10, windows: [{ ...state.windows[windowId], workspaces: "invalid", activeWorkspaceIds: 123 }] }));
  assert.deepEqual(malformed.windows[windowId].workspaces, []);
});
