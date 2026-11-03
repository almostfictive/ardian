import assert from "node:assert/strict";
import { test } from "node:test";
import { colorRoles } from "./tokens.ts";

test("the active tab tint is lighter than the dark sidebar and darker in light appearance", () => {
  const dark = colorRoles.dark.tabSelected;
  const light = colorRoles.light.tabSelected;
  assert.match(dark, /rgba\(255,255,255,0\.14\)/);
  assert.match(light, /rgba\(0,0,0,0\.07\)/);
});
