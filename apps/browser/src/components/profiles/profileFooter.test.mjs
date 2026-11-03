import assert from "node:assert/strict";
import { test } from "node:test";
const { profileFooterContent } = await import("./profileFooterModel.ts");

test("profile footer uses image URIs and falls back to the first grapheme", () => {
  assert.deepEqual(profileFooterContent("Puneeth", "file:///profile.jpg"), { photo: "file:///profile.jpg", initial: "P" });
  assert.deepEqual(profileFooterContent("  👨‍👩‍👧‍👦 family", null), { photo: null, initial: "👨‍👩‍👧‍👦" });
  assert.deepEqual(profileFooterContent("  ", null), { photo: null, initial: "?" });
});
