import type { Notification } from "./types";

const TYPE_WEIGHT = {
  Event: 1,
  Result: 2,
  Placement: 3,
} as const;

export function rankNotifications(
  notifications: Notification[],
  limit: number,
  viewedIds: ReadonlySet<string> = new Set(),
): Notification[] {
  return [...notifications]
    .sort(
      (left, right) =>
        Number(viewedIds.has(left.id)) - Number(viewedIds.has(right.id)) ||
        TYPE_WEIGHT[right.type] - TYPE_WEIGHT[left.type] ||
        Date.parse(right.timestamp) - Date.parse(left.timestamp) ||
        right.id.localeCompare(left.id),
    )
    .slice(0, limit);
}
