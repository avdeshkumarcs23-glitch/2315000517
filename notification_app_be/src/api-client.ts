import { safeLog } from "../../logging-middleware/src/index.ts";
import { getAccessToken } from "../../logging-middleware/src/token-manager.ts";
import { NOTIFICATION_API_URL } from "./config.ts";

export class NotificationApiError extends Error {}

export async function fetchNotifications(): Promise<unknown[]> {
  await safeLog("backend", "info", "controller", "Notification fetch started");
  let response = await fetch(NOTIFICATION_API_URL, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${await getAccessToken()}`,
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401) {
    response = await fetch(NOTIFICATION_API_URL, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${await getAccessToken(true)}`,
      },
      signal: AbortSignal.timeout(10_000),
    });
  }

  if (!response.ok) {
    await safeLog("backend", "error", "controller", "Notification fetch failed");
    throw new NotificationApiError(
      `Notification API returned HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as unknown;
  const notifications = extractNotifications(payload);
  await safeLog("backend", "info", "controller", "Notification fetch completed");
  return notifications;
}

function extractNotifications(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const entry = Object.entries(payload).find(
      ([key, value]) =>
        key.toLowerCase() === "notifications" && Array.isArray(value),
    );
    if (entry) return entry[1] as unknown[];
  }
  throw new NotificationApiError("Response has no notifications list");
}
