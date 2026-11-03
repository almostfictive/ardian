import assert from "node:assert/strict";
import { test } from "node:test";

const { miniAppBoxHeight, miniAppBoxWidth, miniAppRows } = await import("./miniAppLayout.ts");

test("mini-app boxes divide each row equally and wrap after four", () => {
  const widths = [1, 2, 3, 4, 5].map((count) => miniAppRows(count).map((row) => Array.from({ length: row.length }, () => miniAppBoxWidth(240, row.length, 4))));
  assert.deepEqual(widths, [[[240]], [[118, 118]], [[77.33333333333333, 77.33333333333333, 77.33333333333333]], [[57, 57, 57, 57]], [[57, 57, 57, 57], [240]]]);
  assert.deepEqual([1, 2, 3, 4, 5].map(miniAppRows), [[[0]], [[0, 1]], [[0, 1, 2]], [[0, 1, 2, 3]], [[0, 1, 2, 3], [4]]]);
});

test("mini-app boxes never exceed 32 pixels in height", () => {
  assert.equal(miniAppBoxHeight(40), 32);
  assert.equal(miniAppBoxHeight(28), 28);
});
