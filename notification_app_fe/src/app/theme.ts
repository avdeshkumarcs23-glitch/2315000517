import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3157D5",
      light: "#A8B8F4",
      dark: "#183798",
      50: "#EEF2FF",
    },
    secondary: {
      main: "#8B3FD6",
    },
    success: {
      main: "#138A68",
    },
    background: {
      default: "#F6F7FB",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#171A2B",
      secondary: "#656B7C",
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: {
      fontWeight: 800,
      fontSize: "clamp(2rem, 5vw, 3rem)",
      letterSpacing: "-0.04em",
    },
    h5: { fontWeight: 750 },
    h6: { fontWeight: 750 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
  },
});
