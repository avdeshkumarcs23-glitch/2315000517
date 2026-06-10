import { getAccessToken } from "./token-manager.ts";

const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";
const MAX_MESSAGE_LENGTH = 48;

export type LogStack = "backend" | "frontend";
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
export type LogPackage =
  | "cache"
  | "controller"
  | "cron_job"
  | "db"
  | "domain"
  | "auth"
  | "config"
  | "middleware"
  | "utils";

export interface LogResponse {
  logID: string;
  message: string;
}

export class LoggingMiddlewareError extends Error {}

export async function Log(
  stack: LogStack,
  level: LogLevel,
  packageName: LogPackage,
  message: string,
  accessToken?: string,
): Promise<LogResponse> {
  const normalizedMessage = message.trim();
  if (!normalizedMessage) {
    throw new LoggingMiddlewareError("Log message cannot be empty");
  }
  if (normalizedMessage.length > MAX_MESSAGE_LENGTH) {
    throw new LoggingMiddlewareError(
      `Log message cannot exceed ${MAX_MESSAGE_LENGTH} characters`,
    );
  }

  const token = accessToken ?? (await getAccessToken());
  let response = await fetch(LOG_API_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stack,
      level,
      package: packageName,
      message: normalizedMessage,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401 && !accessToken) {
    response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${await getAccessToken(true)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stack,
        level,
        package: packageName,
        message: normalizedMessage,
      }),
      signal: AbortSignal.timeout(10_000),
    });
  }

  const payload = (await response.json().catch(() => null)) as
    | LogResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    const reason = payload?.message ?? `HTTP ${response.status}`;
    throw new LoggingMiddlewareError(`Remote logging failed: ${reason}`);
  }

  return payload as LogResponse;
}

export async function safeLog(
  stack: LogStack,
  level: LogLevel,
  packageName: LogPackage,
  message: string,
): Promise<void> {
  try {
    await Log(stack, level, packageName, message);
  } catch {
    // Logging failures must not interrupt the application workflow.
  }
}
