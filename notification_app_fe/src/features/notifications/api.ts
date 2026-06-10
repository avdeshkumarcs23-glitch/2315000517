import { normalizeNotifications } from "./normalize";
import type {
  Notification,
  NotificationFilter,
} from "./types";

interface FetchOptions {
  limit: number;
  page?: number;
  type?: NotificationFilter;
  signal?: AbortSignal;
}

export async function fetchNotifications({
  limit,
  page = 1,
  type = "All",
  signal,
}: FetchOptions): Promise<Notification[]> {
  const url = new URL("/api/notifications", window.location.origin);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("page", String(page));
  if (type !== "All") url.searchParams.set("notification_type", type);

  const response = await fetch(url, { signal });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(payload?.message ?? "Unable to load notifications");
  }
  return normalizeNotifications(await response.json());
}

export async function logFrontendEvent(
  level: "debug" | "info" | "warn" | "error",
  message: string,
): Promise<void> {
  try {
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, message }),
    });
  } catch {
    // Observability failures should not block user actions.
  }
}
