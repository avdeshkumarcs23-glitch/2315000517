import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";

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
import type { NotificationFilter } from "../features/notifications/types";

const PAGE_SIZE = 10;

export function AllNotificationsPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<NotificationFilter>("All");
  const { notifications, isLoading, error, retry } = useNotifications({
    limit: PAGE_SIZE,
    page,
    type,
  });
  const { viewedIds, markViewed } = useViewedNotifications();

  const changeType = (value: NotificationFilter) => {
    setType(value);
    setPage(1);
    void logFrontendEvent("info", "Notification filter changed");
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
         
          <Typography variant="h3">All notifications</Typography>
         
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterControls type={type} onTypeChange={changeType} />
          <Tooltip title="Refresh">
            <IconButton onClick={retry} aria-label="Refresh notifications">
              <RefreshRoundedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {isLoading ? <LoadingGrid /> : null}
      {error ? <ErrorState message={error} onRetry={retry} /> : null}
      {!isLoading && !error && notifications.length === 0 ? <EmptyState /> : null}

      {!isLoading && !error && notifications.length > 0 ? (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                isViewed={viewedIds.has(notification.id)}
                onView={markViewed}
              />
            ))}
          </Box>

          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            <Button
              startIcon={<NavigateBeforeRoundedIcon />}
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Typography variant="body2" fontWeight={700}>
              Page {page}
            </Typography>
            <Button
              endIcon={<NavigateNextRoundedIcon />}
              disabled={notifications.length < PAGE_SIZE}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </Stack>
        </>
      ) : null}
    </Stack>
  );
}
