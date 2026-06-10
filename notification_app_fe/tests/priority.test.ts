import assert from "node:assert/strict";
import test from "node:test";

import { rankNotifications } from "../src/features/notifications/priority.ts";
import type { Notification } from "../src/features/notifications/types.ts";

function item(
  id: string,
  type: Notification["type"],
  timestamp: string,
): Notification {
  return { id, type, timestamp, message: id };
}

test("ranks by category and then recency", () => {
  const ranked = rankNotifications(
    [
      item("event-new", "Event", "2026-06-10T10:00:00.000Z"),
      item("result-old", "Result", "2026-01-01T10:00:00.000Z"),
      item("placement", "Placement", "2025-01-01T10:00:00.000Z"),
      item("result-new", "Result", "2026-06-10T09:00:00.000Z"),
    ],
    3,
  );

  assert.deepEqual(
    ranked.map(({ id }) => id),
    ["placement", "result-new", "result-old"],
  );
});

test("places unread notifications before viewed items", () => {
  const ranked = rankNotifications(
    [
      item("viewed-placement", "Placement", "2026-06-10T10:00:00.000Z"),
      item("unread-result", "Result", "2026-06-10T09:00:00.000Z"),
    ],
    2,
    new Set(["viewed-placement"]),
  );

  assert.deepEqual(
    ranked.map(({ id }) => id),
    ["unread-result", "viewed-placement"],
  );
});
