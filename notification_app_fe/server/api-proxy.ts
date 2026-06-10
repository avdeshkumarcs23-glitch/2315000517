import type { IncomingMessage, ServerResponse } from "node:http";

import { getAccessToken } from "../../logging-middleware/src/token-manager";

const API_ROOT = "http://4.224.186.213/evaluation-service";
const ALLOWED_TYPES = new Set(["Event", "Result", "Placement"]);
const ALLOWED_LEVELS = new Set(["debug", "info", "warn", "error", "fatal"]);

function json(response: ServerResponse, status: number, payload: unknown): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

async function authorizedFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  let token = await getAccessToken();
  let response = await fetch(url, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (response.status === 401) {
    token = await getAccessToken(true);
    response = await fetch(url, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
  }
  return response;
}

async function readBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return null;
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function proxyNotifications(
  requestUrl: URL,
  response: ServerResponse,
): Promise<void> {
  const limit = Math.min(
    20,
    Math.max(5, Number(requestUrl.searchParams.get("limit")) || 10),
  );
  const page = Math.max(1, Number(requestUrl.searchParams.get("page")) || 1);
  const type = requestUrl.searchParams.get("notification_type");

  const batchSize = 10;
  const batchCount = Math.ceil(limit / batchSize);
  const firstUpstreamPage = (page - 1) * batchCount + 1;

  const batches = await Promise.all(
    Array.from({ length: batchCount }, async (_, index) => {
      const upstreamUrl = new URL(`${API_ROOT}/notifications`);
      upstreamUrl.searchParams.set("limit", String(batchSize));
      upstreamUrl.searchParams.set("page", String(firstUpstreamPage + index));
      if (type && ALLOWED_TYPES.has(type)) {
        upstreamUrl.searchParams.set("notification_type", type);
      }

      const upstream = await authorizedFetch(upstreamUrl.toString(), {
        headers: { Accept: "application/json" },
      });
      const payload = (await upstream.json().catch(() => null)) as {
        notifications?: unknown[];
        message?: string;
      } | null;

      if (!upstream.ok) {
        throw new Error(payload?.message ?? `Upstream HTTP ${upstream.status}`);
      }
      return Array.isArray(payload?.notifications)
        ? payload.notifications
        : [];
    }),
  );

  json(response, 200, {
    notifications: batches.flat().slice(0, limit),
  });
}

async function proxyLog(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const body = (await readBody(request)) as {
    level?: string;
    message?: string;
  } | null;
  const level = body?.level ?? "info";
  const message = body?.message?.trim() ?? "";

  if (!ALLOWED_LEVELS.has(level) || !message || message.length > 48) {
    json(response, 400, { message: "Invalid log payload" });
    return;
  }

  const upstream = await authorizedFetch(`${API_ROOT}/logs`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      stack: "frontend",
      level,
      package: "utils",
      message,
    }),
  });
  const payload = await upstream.json().catch(() => ({
    message: "Invalid upstream response",
  }));
  json(response, upstream.status, payload);
}

export async function handleApiRequest(
  request: IncomingMessage,
  response: ServerResponse,
): Promise<boolean> {
  const requestUrl = new URL(request.url ?? "/", "http://localhost");
  if (!requestUrl.pathname.startsWith("/api/")) return false;

  try {
    if (
      request.method === "GET" &&
      requestUrl.pathname === "/api/notifications"
    ) {
      await proxyNotifications(requestUrl, response);
      return true;
    }
    if (request.method === "POST" && requestUrl.pathname === "/api/logs") {
      await proxyLog(request, response);
      return true;
    }
    json(response, 404, { message: "API route not found" });
  } catch {
    json(response, 502, { message: "Test server is currently unavailable" });
  }
  return true;
}
