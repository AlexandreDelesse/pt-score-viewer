import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1e3a5f",
      light: "#2e5491",
      dark: "#122440",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#455a7a",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f0f4f8",
      paper: "#ffffff",
    },
    success: {
      main: "#2e7d32",
    },
    text: {
      primary: "#1a2638",
      secondary: "#4a5c72",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
    h2: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*, *::before, *::after": {
          boxSizing: "border-box",
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderBottom: "1px solid rgba(255,255,255,0.12)",
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: "1px solid #e0e7ef",
          boxShadow: "0 1px 4px 0 rgba(30,58,95,0.07)",
          transition: "box-shadow 0.2s ease",
          "&:hover": {
            boxShadow: "0 4px 12px 0 rgba(30,58,95,0.13)",
          },
        },
      },
    },
    MuiAccordion: {
      defaultProps: {
        elevation: 0,
        disableGutters: true,
      },
      styleOverrides: {
        root: {
          border: "1px solid #e0e7ef",
          borderRadius: "8px !important",
          "&:before": {
            display: "none",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        containedPrimary: {
          boxShadow: "0 2px 6px 0 rgba(30,58,95,0.25)",
          "&:hover": {
            boxShadow: "0 4px 10px 0 rgba(30,58,95,0.35)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
