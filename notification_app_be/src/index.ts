import { safeLog } from "../../logging-middleware/src/index.ts";
import { fetchNotifications, NotificationApiError } from "./api-client.ts";
import { DEFAULT_LIMIT } from "./config.ts";
import { PriorityInbox } from "./priority-inbox.ts";
import type { RankedNotification } from "./types.ts";

function display(notifications: RankedNotification[]): void {
  process.stdout.write(`\nTop ${notifications.length} Priority Notifications\n`);
  process.stdout.write(`${"=".repeat(100)}\n`);
  process.stdout.write(
    `${"Rank".padEnd(6)}${"Type".padEnd(12)}` +
      `${"Timestamp (UTC)".padEnd(24)}${"Message".padEnd(36)}ID\n`,
  );
  process.stdout.write(`${"-".repeat(100)}\n`);

  notifications.forEach((notification, index) => {
    const timestamp = notification.timestamp
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    process.stdout.write(
      `${String(index + 1).padEnd(6)}` +
        `${notification.type.padEnd(12)}` +
        `${timestamp.padEnd(24)}` +
        `${notification.message.slice(0, 33).padEnd(36)}` +
        `${notification.id}\n`,
    );
  });
}

async function main(): Promise<void> {
  await safeLog("backend", "info", "controller", "Stage one execution started");
  const inbox = new PriorityInbox(DEFAULT_LIMIT);
  await inbox.addMany(await fetchNotifications());
  display(inbox.top());
  await safeLog("backend", "info", "controller", "Stage one execution completed");
}

main().catch(async (error: unknown) => {
  const message =
    error instanceof NotificationApiError
      ? error.message
      : "Unexpected application failure";
  await safeLog("backend", "fatal", "controller", "Stage one execution failed");
  process.stderr.write(`Error: ${message}\n`);
  process.exitCode = 1;
});
