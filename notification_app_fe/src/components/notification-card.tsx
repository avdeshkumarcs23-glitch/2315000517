import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import {
  Box,
  ButtonBase,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type { Notification } from "../features/notifications/types";

const TYPE_META = {
  Placement: {
    color: "primary" as const,
    icon: <WorkRoundedIcon fontSize="small" />,
  },
  Result: {
    color: "secondary" as const,
    icon: <EmojiEventsRoundedIcon fontSize="small" />,
  },
  Event: {
    color: "success" as const,
    icon: <EventRoundedIcon fontSize="small" />,
  },
};

interface Props {
  notification: Notification;
  isViewed: boolean;
  onView: (id: string) => void;
  rank?: number;
}

export function NotificationCard({
  notification,
  isViewed,
  onView,
  rank,
}: Props) {
  const meta = TYPE_META[notification.type];
  const formattedDate = new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(notification.timestamp));

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        overflow: "hidden",
        border: "1px solid",
        borderColor: isViewed ? "divider" : "primary.light",
        bgcolor: isViewed ? "background.paper" : "primary.50",
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": { transform: "translateY(-2px)", boxShadow: 3 },
      }}
    >
      <ButtonBase
        onClick={() => onView(notification.id)}
        sx={{
          display: "block",
          width: "100%",
          height: "100%",
          p: { xs: 2, sm: 2.5 },
          textAlign: "left",
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              {rank ? (
                <Box
                  sx={{
                    display: "grid",
                    placeItems: "center",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    bgcolor: "text.primary",
                    color: "background.paper",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {rank}
                </Box>
              ) : null}
              <Chip
                icon={meta.icon}
                label={notification.type}
                color={meta.color}
                size="small"
                variant="outlined"
              />
            </Stack>
            {!isViewed ? (
              <Chip label="New" color="primary" size="small" />
            ) : null}
          </Stack>

          <Typography variant="h6" component="h2">
            {notification.message}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
            <CalendarMonthRoundedIcon fontSize="small" />
            <Typography variant="body2">{formattedDate}</Typography>
          </Stack>
        </Stack>
      </ButtonBase>
    </Paper>
  );
}
