import assert from "node:assert/strict";
import { test } from "node:test";
const { customMiniAppUrl, isMiniAppId, miniAppDefinition } = await import("./model.ts");

test("custom mini-app URLs normalize safe HTTP addresses", () => {
  assert.equal(customMiniAppUrl("example.com"), "https://example.com/");
  assert.equal(customMiniAppUrl(" http://example.com/app "), "http://example.com/app");
  assert.equal(customMiniAppUrl("https://example.com:443"), "https://example.com/");
});

test("custom mini-app URLs reject schemes, credentials, whitespace and missing hosts", () => {
  for (const value of ["", "   ", "javascript:alert(1)", "file:///etc/passwd", "data:text/html,hi", "https://user:pass@example.com", "https://", "example.com app"]) {
    assert.equal(customMiniAppUrl(value), null, value);
  }
});

test("mini-app identities accept built-ins and canonical custom URLs only", () => {
  assert.equal(isMiniAppId("whatsapp"), true);
  assert.equal(isMiniAppId("constructor"), false);
  assert.equal(isMiniAppId("https://example.com/"), true);
  assert.equal(isMiniAppId("https://example.com"), false);
  assert.deepEqual(miniAppDefinition("https://example.com/app"), { title: "example.com", url: "https://example.com/app" });
});
