import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "campus-pulse:viewed-notifications";

function loadViewed(): Set<string> {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

export function useViewedNotifications() {
  const [viewedIds, setViewedIds] = useState<Set<string>>(loadViewed);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...viewedIds]));
  }, [viewedIds]);

  const markViewed = useCallback((id: string) => {
    setViewedIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  }, []);

  return { viewedIds, markViewed };
}
