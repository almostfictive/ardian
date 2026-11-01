import assert from "node:assert/strict";
import { test } from "node:test";
const { reloadPage } = await import("./reload.ts");
const { pageOf } = await import("./pageState.ts");
const { webviews } = await import("../../platform/webviews.ts");

test("refresh and force refresh both publish an animation request and reload the page", async () => {
  const calls = [];
  webviews.set("refresh-test", { reload: () => calls.push("reload"), forceReload: () => calls.push("forceReload") });
  try {
    const before = pageOf("refresh-test").refreshSequence;
    await reloadPage("refresh-test");
    assert.equal(pageOf("refresh-test").refreshSequence, before + 1);
    await reloadPage("refresh-test", true);
    assert.equal(pageOf("refresh-test").refreshSequence, before + 2);
    assert.deepEqual(calls, ["reload", "forceReload"]);
  } finally { webviews.delete("refresh-test"); }
});
