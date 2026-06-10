import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { label: "All notifications", path: "/", icon: <InboxRoundedIcon /> },
  {
    label: "Priority inbox",
    path: "/priority",
    icon: <WorkspacePremiumRoundedIcon />,
  },
];

export function AppShell() {
  return (
    <Box minHeight="100vh">
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, sm: 72 } }}>
            <Stack direction="row" alignItems="center" spacing={1} flexGrow={1}>
             
              <Typography variant="h6" fontWeight={800}>
                Campus Pulse
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  end={item.path === "/"}
                  startIcon={item.icon}
                  sx={{
                    px: { xs: 1, sm: 2 },
                    minWidth: { xs: 42, sm: "auto" },
                    "& .MuiButton-startIcon": {
                      mr: { xs: 0, sm: 1 },
                    },
                    "&.active": { bgcolor: "primary.50", color: "primary.main" },
                  }}
                >
                  <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                    {item.label}
                  </Box>
                </Button>
              ))}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
