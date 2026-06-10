import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import {
  Alert,
  Box,
  Button,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

export function LoadingGrid() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
        gap: 2,
      }}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton
          key={index}
          variant="rounded"
          height={180}
          sx={{ borderRadius: 3 }}
        />
      ))}
    </Box>
  );
}

export function EmptyState() {
  return (
    <Stack alignItems="center" spacing={1.5} py={9} textAlign="center">
      <InboxRoundedIcon sx={{ fontSize: 48, color: "text.disabled" }} />
      <Typography variant="h5">No notifications found</Typography>
      <Typography color="text.secondary">
        Try another filter or refresh in a moment.
      </Typography>
    </Stack>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Alert
      severity="error"
      icon={<ErrorOutlineRoundedIcon />}
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          Retry
        </Button>
      }
    >
      {message}
    </Alert>
  );
}
