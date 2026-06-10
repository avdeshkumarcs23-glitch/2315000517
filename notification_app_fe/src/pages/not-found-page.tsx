import { Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Stack alignItems="center" spacing={2} py={10} textAlign="center">
      <Typography variant="h1">404</Typography>
      <Typography variant="h5">This page does not exist.</Typography>
      <Button component={Link} to="/" variant="contained">
        Return to notifications
      </Button>
    </Stack>
  );
}
