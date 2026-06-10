import { TYPE_WEIGHTS } from "./config.ts";
import type {
  Notification,
  NotificationType,
  RankedNotification,
} from "./types.ts";

export class InvalidNotificationError extends Error {}

function findValue(
  record: Record<string, unknown>,
  names: string[],
): unknown {
  const entries = Object.entries(record).map(
    ([key, value]) => [key.trim().toLowerCase(), value] as const,
  );
  const normalized = new Map(entries);
  return names
    .map((name) => normalized.get(name.toLowerCase()))
    .find((value) => value !== undefined);
}

function parseReadStatus(record: Record<string, unknown>): boolean {
  const value = findValue(record, ["read", "isRead", "is_read"]);
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return ["true", "1", "yes", "read"].includes(value.trim().toLowerCase());
  }
  return value === undefined ? false : Boolean(value);
}

export function parseNotification(value: unknown): RankedNotification {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InvalidNotificationError("Notification must be an object");
  }

  const record = value as Record<string, unknown>;
  const id = findValue(record, ["id", "notificationId", "notification_id"]);
  const type = findValue(record, ["type", "notificationType"]);
  const message = findValue(record, ["message"]);
  const rawTimestamp = findValue(record, [
    "timestamp",
    "createdAt",
    "created_at",
  ]);

  if (typeof id !== "string" || !id.trim()) {
    throw new InvalidNotificationError("Notification ID is missing");
  }
  if (
    typeof type !== "string" ||
    !(type.trim() in TYPE_WEIGHTS)
  ) {
    throw new InvalidNotificationError("Notification type is unsupported");
  }
  if (typeof message !== "string" || !message.trim()) {
    throw new InvalidNotificationError("Notification message is missing");
  }
  if (typeof rawTimestamp !== "string") {
    throw new InvalidNotificationError("Notification timestamp is missing");
  }

  const timestamp = new Date(rawTimestamp);
  if (Number.isNaN(timestamp.getTime())) {
    throw new InvalidNotificationError("Notification timestamp is invalid");
  }

  const notificationType = type.trim() as NotificationType;
  const notification: Notification = {
    id: id.trim(),
    type: notificationType,
    message: message.trim(),
    timestamp,
    isRead: parseReadStatus(record),
  };

  return {
    ...notification,
    typeWeight: TYPE_WEIGHTS[notificationType],
  };
}
