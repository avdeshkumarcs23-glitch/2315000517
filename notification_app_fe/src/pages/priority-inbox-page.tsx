import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { Alert, Box, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";

import { FilterControls } from "../components/filter-controls";
import { NotificationCard } from "../components/notification-card";
import {
  EmptyState,
  ErrorState,
  LoadingGrid,
} from "../components/page-states";
import { logFrontendEvent } from "../features/notifications/api";
import { useNotifications } from "../features/notifications/hooks/use-notifications";
import { useViewedNotifications } from "../features/notifications/hooks/use-viewed-notifications";
import { rankNotifications } from "../features/notifications/priority";
import type { NotificationFilter } from "../features/notifications/types";

export function PriorityInboxPage() {
  const [limit, setLimit] = useState(10);
  const [type, setType] = useState<NotificationFilter>("All");
  const { notifications, isLoading, error, retry } = useNotifications({
    limit: Math.max(20, limit),
    type,
  });
  const { viewedIds, markViewed } = useViewedNotifications();
  const ranked = useMemo(
    () => rankNotifications(notifications, limit, viewedIds),
    [notifications, limit, viewedIds],
  );

  const changeLimit = (value: number) => {
    setLimit(value);
    void logFrontendEvent("info", "Priority limit changed");
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "flex-end" }}
        gap={2}
      >
        <Box>
          {/* <Typography variant="overline" color="secondary.main" fontWeight={800}>
            Focus first
          </Typography> */}
          <Typography variant="h3">Priority inbox</Typography>
          {/* <Typography color="text.secondary" mt={1}>
            Important unread updates ranked by category and recency.
          </Typography> */}
        </Box>
        <FilterControls
          type={type}
          onTypeChange={(value) => {
            setType(value);
            void logFrontendEvent("info", "Priority filter changed");
          }}
          limit={limit}
          onLimitChange={changeLimit}
        />
      </Stack>

      {/* <Alert icon={<AutoAwesomeRoundedIcon />} severity="info">
        Placements rank above results, followed by events. Newer items lead
        within each category.
      </Alert> */}

      {isLoading ? <LoadingGrid /> : null}
      {error ? <ErrorState message={error} onRetry={retry} /> : null}
      {!isLoading && !error && ranked.length === 0 ? <EmptyState /> : null}

      {!isLoading && !error && ranked.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 2,
          }}
        >
          {ranked.map((notification, index) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              isViewed={viewedIds.has(notification.id)}
              onView={markViewed}
              rank={index + 1}
            />
          ))}
        </Box>
      ) : null}
    </Stack>
  );
}
