import { useCallback, useEffect, useState } from "react";

import { fetchNotifications, logFrontendEvent } from "../api";
import type {
  Notification,
  NotificationFilter,
} from "../types";

interface Options {
  limit: number;
  page?: number;
  type?: NotificationFilter;
}

export function useNotifications({ limit, page = 1, type = "All" }: Options) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchNotifications({ limit, page, type, signal: controller.signal })
      .then((items) => {
        setNotifications(items);
        void logFrontendEvent("info", "Notifications loaded");
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(
          reason instanceof Error ? reason.message : "Unable to load notifications",
        );
        void logFrontendEvent("error", "Notification load failed");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [limit, page, type, refreshKey]);

  const retry = useCallback(() => setRefreshKey((value) => value + 1), []);
  return { notifications, isLoading, error, retry };
}
