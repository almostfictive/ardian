import assert from "node:assert/strict";
import { test } from "node:test";
const { sidebarTokens, SIDEBAR_FOOTER, TAB_CLOSE_GLYPH } = await import("./tokens.ts");
const { CHROME_BUTTON, TOOLBAR_FADE } = await import("../toolbar/tokens.ts");

test("v6 footer, navigation and utility controls use the measured geometry", () => {
  assert.deepEqual(SIDEBAR_FOOTER, { height: 32, inset: 4, bottom: 13, paddingLeft: 9, paddingRight: 6, profileBox: 28, workspaceBox: 30, gearBox: 28, gearGlyph: 14, gearRadius: 8 });
  assert.deepEqual(CHROME_BUTTON, { box: 28, glyph: 16, radius: 8 });
  assert.deepEqual(TAB_CLOSE_GLYPH, { size: 12, dark: "rgba(255,255,255,0.6)", light: "rgba(0,0,0,0.6)" });
});

test("the address overlay uses a complete linear fade and New Tab keeps the matching light glyph strength", () => {
  assert.deepEqual(TOOLBAR_FADE, { inputRange: [0, 1], outputRange: [1, 0] });
  assert.equal(sidebarTokens({ dark: false }).newTabIcon, "#000000B3");
});
