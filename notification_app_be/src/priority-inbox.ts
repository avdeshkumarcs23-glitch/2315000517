import { safeLog } from "../../logging-middleware/src/index.ts";
import {
  InvalidNotificationError,
  parseNotification,
} from "./notification.ts";
import type { RankedNotification } from "./types.ts";

function comparePriority(
  left: RankedNotification,
  right: RankedNotification,
): number {
  return (
    left.typeWeight - right.typeWeight ||
    left.timestamp.getTime() - right.timestamp.getTime() ||
    left.id.localeCompare(right.id)
  );
}

export class PriorityInbox {
  readonly #heap: RankedNotification[] = [];
  readonly limit: number;

  constructor(limit: number) {
    if (!Number.isInteger(limit) || limit <= 0) {
      throw new RangeError("Limit must be a positive integer");
    }
    this.limit = limit;
  }

  async add(rawNotification: unknown): Promise<boolean> {
    let notification: RankedNotification;
    try {
      notification = parseNotification(rawNotification);
    } catch (error) {
      if (error instanceof InvalidNotificationError) {
        await safeLog("backend", "warn", "domain", "Invalid notification skipped");
        return false;
      }
      throw error;
    }

    if (notification.isRead) {
      await safeLog("backend", "debug", "domain", "Read notification skipped");
      return false;
    }

    if (this.#heap.length < this.limit) {
      this.#heap.push(notification);
      this.#siftUp(this.#heap.length - 1);
      return true;
    }

    if (comparePriority(notification, this.#heap[0]) <= 0) {
      return false;
    }

    this.#heap[0] = notification;
    this.#siftDown(0);
    return true;
  }

  async addMany(rawNotifications: unknown[]): Promise<void> {
    await safeLog("backend", "info", "controller", "Priority ranking started");
    for (const notification of rawNotifications) {
      await this.add(notification);
    }
    await safeLog("backend", "info", "controller", "Priority ranking completed");
  }

  top(): RankedNotification[] {
    return [...this.#heap].sort((left, right) =>
      comparePriority(right, left),
    );
  }

  #siftUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (comparePriority(this.#heap[parent], this.#heap[index]) <= 0) break;
      [this.#heap[parent], this.#heap[index]] = [
        this.#heap[index],
        this.#heap[parent],
      ];
      index = parent;
    }
  }

  #siftDown(index: number): void {
    while (true) {
      const left = index * 2 + 1;
      const right = left + 1;
      let smallest = index;

      if (
        left < this.#heap.length &&
        comparePriority(this.#heap[left], this.#heap[smallest]) < 0
      ) {
        smallest = left;
      }
      if (
        right < this.#heap.length &&
        comparePriority(this.#heap[right], this.#heap[smallest]) < 0
      ) {
        smallest = right;
      }
      if (smallest === index) break;

      [this.#heap[index], this.#heap[smallest]] = [
        this.#heap[smallest],
        this.#heap[index],
      ];
      index = smallest;
    }
  }
}
