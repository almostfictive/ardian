import assert from "node:assert/strict";
import vm from "node:vm";
import { test } from "node:test";

globalThis.__DEV__ = false;
const { fullPageCapture } = await import("./fullPageCapture.ts");
const { useBrowser } = await import("../browser/store.ts");
const { webviews } = await import("../../platform/webviews.ts");
const { captureScreenshot, chooseCapture, captureSelection, closeScreenshot, useScreenshot } = await import("./actions.ts");

function fixture(height = 240) {
  const state = { captures: [], removed: false, behavior: "smooth" };
  const style = {
    getPropertyValue: () => state.behavior,
    getPropertyPriority: () => "",
    setProperty: (_key, value) => { state.behavior = value; },
    set scrollBehavior(value) { state.behavior = value; },
  };
  const context = vm.createContext({
    innerWidth: 80, innerHeight: 100, scrollX: 0, scrollY: 25,
    location: { href: "https://example.com/" },
    document: { documentElement: { scrollHeight: height, style, appendChild: () => {} }, body: { scrollHeight: height }, createElement: () => ({ remove: () => { state.removed = true; } }), querySelectorAll: () => [] },
  });
  context.scrollTo = ({ left, top }) => { context.scrollX = left; context.scrollY = Math.min(top, Math.max(0, height - 100)); };
  const web = {
    evaluate: async (code) => {
      assert.match(code, /^post\("result",/);
      let result;
      context.post = (_kind, json) => { result = JSON.parse(json); };
      vm.runInContext(code, context);
      return result;
    },
    capturePicture: async () => { state.captures.push(context.scrollY); return { data: `tile-${context.scrollY}` }; },
  };
  return { web, state, context };
}

test("full-page capture uses the page bridge, stitches overlapping tiles, and restores scroll and style", async () => {
  const { web, state, context } = fixture();
  const progress = [];
  const image = await fullPageCapture(web, (text) => progress.push(text), () => true);
  assert.deepEqual(state.captures, [0, 100, 140]);
  assert.deepEqual([image.width, image.height], [80, 240]);
  assert.equal(context.scrollY, 25);
  assert.equal(state.behavior, "smooth");
  assert(state.removed);
  assert.equal(Object.keys(context).filter((key) => key.startsWith("__ardiaCapture")).length, 0);
  assert.equal(progress.at(-1), "Stitching screenshot…");
});

test("cancelling a full-page capture restores the page and captures no more tiles", async () => {
  const { web, state, context } = fixture();
  await assert.rejects(fullPageCapture(web, () => {}, () => false), /cancelled/);
  assert.equal(state.captures.length, 0);
  assert.equal(context.scrollY, 25);
  assert(state.removed);
});

test("a page that moves during capture still drops the capture style", async () => {
  const { web, state, context } = fixture();
  const evaluate = web.evaluate;
  let calls = 0;
  web.evaluate = async (code) => {
    calls += 1;
    if (calls === 4) context.location.href = "https://example.com/moved";
    return evaluate(code);
  };
  await assert.rejects(fullPageCapture(web, () => {}, () => true), /changed during capture/);
  assert(state.removed);
});

test("oversized full-page captures fail before changing the page", async () => {
  const { web, state } = fixture(30000);
  await assert.rejects(fullPageCapture(web, () => {}, () => true), /20,000 px or 50 megapixel/);
  assert.equal(state.captures.length, 0);
  assert.equal(state.behavior, "smooth");
});

function captureFixture() {
  useBrowser.getState().hydrate({});
  const window = useBrowser.getState().createWindow();
  const tab = useBrowser.getState().newTab(window, { url: "https://example.com" });
  return { window, tab };
}

test("selected capture opens the selection then automatically opens the annotation editor", async () => {
  const { tab } = captureFixture();
  webviews.set(tab, { capturePicture: async () => ({ data: "picture" }) });
  await captureScreenshot(tab);
  assert.equal(useScreenshot.getState().capture.phase, "menu");
  await chooseCapture("selected");
  assert.equal(useScreenshot.getState().capture.phase, "selection");
  await captureSelection([0.1, 0.1, 0.5, 0.5]);
  assert.equal(useScreenshot.getState().capture.phase, "editor");
  closeScreenshot();
  assert.equal(useScreenshot.getState().capture, null);
  webviews.delete(tab);
});

test("closing capture ignores late native replies and navigation dismisses the editor", async () => {
  const { tab } = captureFixture();
  let finish;
  webviews.set(tab, { capturePicture: () => new Promise((resolve) => { finish = resolve; }) });
  await captureScreenshot(tab);
  const pending = chooseCapture("selected");
  closeScreenshot();
  finish({ data: "picture" });
  await pending;
  assert.equal(useScreenshot.getState().capture, null);
  webviews.set(tab, { capturePicture: async () => ({ data: "picture" }) });
  await captureScreenshot(tab);
  await chooseCapture("selected");
  useBrowser.getState().navigate(tab, "https://example.org");
  assert.equal(useScreenshot.getState().capture, null);
  webviews.delete(tab);
});

test("successful screenshot output closes the editor; cancelled save keeps it open", async () => {
  const { shellNativeModules } = await import("../../test-native/shell.ts");
  const { outputScreenshot } = await import("./actions.ts");
  const app = shellNativeModules.ArdiaApp;
  const original = app.exportScreenshot;
  const { tab } = captureFixture();
  webviews.set(tab, { capturePicture: async () => ({ data: "picture" }) });
  try {
    await captureScreenshot(tab);
    await chooseCapture("selected");
    await captureSelection([0, 0, 1, 1]);
    app.exportScreenshot = async () => null;
    await outputScreenshot("png");
    assert.equal(useScreenshot.getState().capture.phase, "editor");
    app.exportScreenshot = async () => "clipboard";
    await outputScreenshot("clipboard");
    assert.equal(useScreenshot.getState().capture, null);
  } finally {
    app.exportScreenshot = original;
    closeScreenshot();
    webviews.delete(tab);
  }
});
