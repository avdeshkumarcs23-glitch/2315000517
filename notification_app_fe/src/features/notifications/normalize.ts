import type { Notification, NotificationType } from "./types";

const SUPPORTED_TYPES = new Set<NotificationType>([
  "Event",
  "Result",
  "Placement",
]);

function valueOf(record: Record<string, unknown>, name: string): unknown {
  return Object.entries(record).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  )?.[1];
}

export function normalizeNotification(value: unknown): Notification | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const id = valueOf(record, "id");
  const type = valueOf(record, "type");
  const message = valueOf(record, "message");
  const rawTimestamp = valueOf(record, "timestamp");

  if (
    typeof id !== "string" ||
    typeof type !== "string" ||
    !SUPPORTED_TYPES.has(type as NotificationType) ||
    typeof message !== "string" ||
    typeof rawTimestamp !== "string"
  ) {
    return null;
  }

  const parsed = new Date(rawTimestamp.replace(" ", "T") + "Z");
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    id,
    type: type as NotificationType,
    message,
    timestamp: parsed.toISOString(),
  };
}

export function normalizeNotifications(payload: unknown): Notification[] {
  if (!payload || typeof payload !== "object") return [];
  const notifications = valueOf(
    payload as Record<string, unknown>,
    "notifications",
  );
  if (!Array.isArray(notifications)) return [];
  return notifications
    .map(normalizeNotification)
    .filter((item): item is Notification => item !== null);
}
