import { createTheme, PaletteOptions } from "@mui/material";

const palette: PaletteOptions = {
  mode: "dark",
  primary: {
    main: "#FFCD00",
    light: "#FFE066",
    dark: "#FFB300",
    contrastText: "#242526",
  },
  secondary: {
    main: "#2196F3",
    light: "#64B5F6",
    dark: "#1976D2",
    contrastText: "#FFFFFF",
  },
  error: {
    main: "#FF5252",
    contrastText: "#FFFFFF",
  },
  warning: {
    main: "#FFC107",
    contrastText: "#242526",
  },
  success: {
    main: "#4CAF50",
    contrastText: "#FFFFFF",
  },
  background: {
    default: "#242526",
    paper: "#2A2B2D",
  },
  text: {
    primary: "#E4E6EB",
    secondary: "#B0B3B8",
  },
};

const theme = createTheme({
  palette,
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: palette.background?.paper,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8, // Mantém o espaçamento base de 8px
});

export default theme;