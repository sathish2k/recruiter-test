"use client";

import { createTheme } from "@mui/material/styles";

declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    soft: true;
  }
}
declare module "@mui/material/Paper" {
  interface PaperPropsVariantOverrides {
    base: true;
    interactive: true;
    accent: true;
    feature: true;
    ghost: true;
    inset: true;
  }
}

const SOFT = {
  primary: {
    bg: "rgba(242,106,27,0.14)",
    border: "rgba(242,106,27,0.35)",
    fg: "#F0B27C",
  },
  success: {
    bg: "rgba(78,168,116,0.14)",
    border: "rgba(78,168,116,0.35)",
    fg: "#8FD6AC",
  },
  warning: {
    bg: "rgba(214,155,60,0.14)",
    border: "rgba(214,155,60,0.35)",
    fg: "#F0C27C",
  },
  error: {
    bg: "rgba(200,80,80,0.14)",
    border: "rgba(200,80,80,0.35)",
    fg: "#E89A9A",
  },
  info: {
    bg: "rgba(90,130,180,0.14)",
    border: "rgba(90,130,180,0.35)",
    fg: "#9BB8D9",
  },
  default: {
    bg: "rgba(255,255,255,0.07)",
    border: "rgba(255,255,255,0.14)",
    fg: "#C9C5BD",
  },
} as const;

const softChip = Object.entries(SOFT).map(([color, t]) => ({
  props: { variant: "soft" as const, color: color as "primary" },
  style: {
    color: t.fg,
    backgroundColor: t.bg,
    border: `1px solid ${t.border}`,
  },
}));

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#F26A1B",
      light: "#FF8A3C",
      dark: "#E4560F",
      contrastText: "#FFFFFF",
    },
    success: { main: "#4EA874", light: "#8FD6AC" },
    warning: { main: "#D69B3C", light: "#F0C27C" },
    error: { main: "#C85050", light: "#E89A9A" },
    info: { main: "#5A82B4", light: "#9BB8D9" },
    background: { default: "#131313", paper: "#1C1C1B" },
    text: { primary: "#ECEAE7", secondary: "#9A968E", disabled: "#7C7972" },
    divider: "rgba(255,255,255,0.06)",
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      "var(--font-instrument), 'Instrument Sans', system-ui, sans-serif",
    h4: { fontSize: 27, fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontSize: 17, fontWeight: 600 },
    subtitle1: { fontSize: 14.5, fontWeight: 600 },
    body1: { fontSize: 13.5 },
    body2: { fontSize: 12.5, color: "#9A968E" },
    overline: { fontSize: 11, letterSpacing: "0.12em", color: "#7C7972" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 13,
          paddingInline: 16,
        },
      },
      variants: [
        {
          props: { variant: "contained", color: "primary" },
          style: {
            background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
            "&:hover": { filter: "brightness(1.08)" },
          },
        },
        {
          props: { variant: "outlined" },
          style: {
            borderColor: "rgba(255,255,255,0.14)",
            color: "#ECEAE7",
            "&:hover": {
              borderColor: "rgba(255,255,255,0.24)",
              background: "rgba(255,255,255,0.06)",
            },
          },
        },
      ],
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 600, fontSize: 12 },
      },
      variants: softChip,
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 14,
        },
      },
    },
    MuiCard: {
      defaultProps: { variant: "base" },
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderRadius: 16,
          padding: "18px 20px",
        },
      },
      variants: [
        {
          props: { variant: "base" },
          style: {
            background: "#1C1C1B",
            border: "1px solid rgba(255,255,255,0.06)",
          },
        },
        {
          props: { variant: "interactive" },
          style: {
            background: "#1C1C1B",
            border: "1px solid rgba(255,255,255,0.06)",
            cursor: "pointer",
            transition: "border-color .15s, transform .15s",
            "&:hover": {
              borderColor: "rgba(242,106,27,0.45)",
              transform: "translateY(-2px)",
            },
          },
        },
        {
          props: { variant: "accent" },
          style: {
            background:
              "linear-gradient(150deg,rgba(242,106,27,.32),rgba(28,28,27,.7)),#1C1C1B",
            border: "1px solid rgba(242,106,27,0.3)",
          },
        },
        {
          props: { variant: "feature" },
          style: {
            background:
              "radial-gradient(120% 140% at 85% 0%,rgba(242,106,27,.4),rgba(28,28,27,.9) 55%),#1C1C1B",
            border: "1px solid rgba(255,255,255,0.09)",
          },
        },
        {
          props: { variant: "ghost" },
          style: {
            background: "transparent",
            border: "1.5px dashed rgba(255,255,255,0.16)",
            cursor: "pointer",
            textAlign: "center",
            transition: "border-color .15s, background .15s",
            "&:hover": {
              borderColor: "rgba(242,106,27,0.4)",
              background: "rgba(242,106,27,0.04)",
            },
          },
        },
        {
          props: { variant: "inset" },
          style: {
            background: "#141413",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 11,
            padding: "11px 13px",
          },
        },
      ],
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12, background: "#141413", fontSize: 13.5 },
        notchedOutline: { borderColor: "rgba(255,255,255,0.10)" },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 20, border: "1px solid rgba(255,255,255,0.10)" },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: "1px solid",
          fontSize: 12,
          alignItems: "center",
          "& .MuiAlert-icon": { color: "inherit", fontSize: 18 },
        },
      },
      variants: [
        {
          props: { severity: "info" },
          style: {
            background: "rgba(90,130,180,.1)",
            borderColor: "rgba(90,130,180,.3)",
            color: "#9BB8D9",
          },
        },
        {
          props: { severity: "success" },
          style: {
            background: "rgba(78,168,116,.1)",
            borderColor: "rgba(78,168,116,.3)",
            color: "#8FD6AC",
          },
        },
        {
          props: { severity: "warning" },
          style: {
            background: "rgba(214,155,60,.08)",
            borderColor: "rgba(214,155,60,.25)",
            color: "#E8D4A6",
          },
        },
        {
          props: { severity: "error" },
          style: {
            background: "rgba(200,80,80,.1)",
            borderColor: "rgba(200,80,80,.3)",
            color: "#E89A9A",
          },
        },
      ],
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: "auto",
          width: "fit-content",
          background: "#141413",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 999,
          padding: 3,
        },
        indicator: { display: "none" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: "auto",
          textTransform: "none",
          borderRadius: 999,
          padding: "7px 15px",
          fontSize: 12,
          fontWeight: 600,
          color: "#7C7972",
          "&.Mui-selected": {
            color: "#ECEAE7",
            background: "rgba(255,255,255,0.1)",
          },
        },
      },
    },
    MuiStepConnector: {
      styleOverrides: { line: { borderColor: "rgba(255,255,255,0.1)" } },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: "rgba(255,255,255,0.15)",
          "&.Mui-active": { color: "#F26A1B" },
          "&.Mui-completed": { color: "#4EA874" },
        },
        text: { fill: "#ECEAE7", fontSize: 11 },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          width: 30,
          height: 30,
          minWidth: 30,
          margin: "0 3px",
          fontSize: 12.5,
          fontWeight: 600,
          color: "#9A968E",
          borderRadius: 999,
          "&:hover": { background: "rgba(255,255,255,0.06)" },
          "&.Mui-selected": {
            background: "rgba(255,255,255,0.08)",
            color: "#ECEAE7",
            borderColor: "transparent",
          },
        },
        page: { border: "1px solid rgba(255,255,255,0.06)" },
        previousNext: {
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#ECEAE7",
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          background: "#1C1C1B",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: "18px 20px",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { "&:hover": { background: "rgba(255,255,255,0.03)" } },
        head: { "&:hover": { background: "transparent" } },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "none",
          padding: "13px 14px",
          fontSize: 13,
          color: "#ECEAE7",
        },
        head: {
          color: "#9A968E",
          fontSize: 12,
          fontWeight: 400,
          background: "rgba(255,255,255,0.04)",
          padding: "10px 14px",
          "&:first-of-type": {
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
          },
          "&:last-of-type": {
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
          },
        },
        body: { borderBottom: "1px solid rgba(255,255,255,0.05)" },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: { "&.Mui-active": { color: "#ECEAE7" } },
        icon: { fontSize: 16, color: "#FF9D57 !important" },
      },
    },
  },
});
