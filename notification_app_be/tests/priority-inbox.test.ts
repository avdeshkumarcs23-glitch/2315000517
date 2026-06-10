import assert from "node:assert/strict";
import test from "node:test";

import { PriorityInbox } from "../src/priority-inbox.ts";

function notification(
  id: string,
  type: "Event" | "Result" | "Placement",
  timestamp: string,
  read = false,
): Record<string, unknown> {
  return { id, type, message: `Message ${id}`, timestamp, read };
}

test("type weight precedes recency", async () => {
  const inbox = new PriorityInbox(3);
  await inbox.addMany([
    notification("event", "Event", "2026-06-10T10:00:00Z"),
    notification("result", "Result", "2026-01-01T10:00:00Z"),
    notification("placement", "Placement", "2025-01-01T10:00:00Z"),
  ]);

  assert.deepEqual(
    inbox.top().map(({ id }) => id),
    ["placement", "result", "event"],
  );
});

test("bounded heap keeps only highest priorities", async () => {
  const inbox = new PriorityInbox(2);
  await inbox.addMany([
    notification("event", "Event", "2026-06-10T10:00:00Z"),
    notification("result-old", "Result", "2026-01-01T10:00:00Z"),
    notification("result-new", "Result", "2026-06-10T10:00:00Z"),
  ]);

  assert.deepEqual(
    inbox.top().map(({ id }) => id),
    ["result-new", "result-old"],
  );
});

test("read and invalid notifications are skipped", async () => {
  const inbox = new PriorityInbox(10);
  await inbox.addMany([
    notification("read", "Placement", "2026-06-10T10:00:00Z", true),
    { id: "invalid", type: "Other" },
  ]);

  assert.deepEqual(inbox.top(), []);
});
