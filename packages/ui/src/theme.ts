"use client";

import { createTheme, type Theme } from "@mui/material/styles";

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
    highlight: true;
    dropdown: true;
  }
}

export type ThemeMode = "light" | "dark";

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

// Mode-aware surface tokens. Light values mirror the design's own `hpx-light`
// remapping, so a token flip re-themes every atom below in one place.
interface Surfaces {
  bgDefault: string;
  paper: string;
  elevated: string;
  inset: string;
  hover: string;
  divider: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  textMuted: string;
  neutral: string;
  headBg: string;
  menuShadow: string;
}

function surfaces(mode: ThemeMode): Surfaces {
  if (mode === "light") {
    return {
      bgDefault: "#F4F2ED",
      paper: "#FFFFFF",
      elevated: "#FFFFFF",
      inset: "#EFECE5",
      hover: "rgba(0,0,0,0.05)",
      divider: "rgba(0,0,0,0.09)",
      border: "rgba(0,0,0,0.12)",
      borderStrong: "rgba(0,0,0,0.16)",
      textPrimary: "#23211D",
      textSecondary: "#6E6960",
      textDisabled: "#8B867D",
      textMuted: "#4A463F",
      neutral: "#E4E0D8",
      headBg: "rgba(0,0,0,0.04)",
      menuShadow: "0 18px 50px rgba(0,0,0,.18)",
    };
  }
  return {
    bgDefault: "#131313",
    paper: "#1C1C1B",
    elevated: "#1F1F1E",
    inset: "#141413",
    hover: "rgba(255,255,255,0.06)",
    divider: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    borderStrong: "rgba(255,255,255,0.14)",
    textPrimary: "#ECEAE7",
    textSecondary: "#9A968E",
    textDisabled: "#7C7972",
    textMuted: "#C9C5BD",
    neutral: "#2A2A28",
    headBg: "rgba(255,255,255,0.04)",
    menuShadow: "0 18px 50px rgba(0,0,0,.6)",
  };
}

export function createAppTheme(mode: ThemeMode = "dark"): Theme {
  const c = surfaces(mode);
  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#F26A1B",
        light: "#FF8A3C",
        dark: "#E4560F",
        contrastText: "#FFFFFF",
      },
      secondary: {
        main: mode === "light" ? "#23211D" : "#F5F3F0",
        contrastText: mode === "light" ? "#FFFFFF" : "#1a1a1a",
      },
      success: { main: "#4EA874", light: "#8FD6AC" },
      warning: { main: "#D69B3C", light: "#F0C27C" },
      error: { main: "#C85050", light: "#E89A9A" },
      info: { main: "#5A82B4", light: "#9BB8D9" },
      background: { default: c.bgDefault, paper: c.paper },
      text: {
        primary: c.textPrimary,
        secondary: c.textSecondary,
        disabled: c.textDisabled,
      },
      divider: c.divider,
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: "var(--font-instrument), 'Instrument Sans', system-ui, sans-serif",
      h4: { fontSize: 27, fontWeight: 700, letterSpacing: "-0.01em" },
      h5: { fontSize: 17, fontWeight: 600 },
      subtitle1: { fontSize: 14.5, fontWeight: 600 },
      body1: { fontSize: 13.5 },
      body2: { fontSize: 12.5, color: c.textSecondary },
      overline: { fontSize: 11, letterSpacing: "0.12em", color: c.textDisabled },
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
            lineHeight: 1.45,
            padding: "9px 16px",
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
            props: { variant: "contained", color: "secondary" },
            style: {
              background: mode === "light" ? "#23211D" : "#F5F3F0",
              color: mode === "light" ? "#FFFFFF" : "#1a1a1a",
              fontWeight: 700,
              "&:hover": {
                background: mode === "light" ? "#23211D" : "#F5F3F0",
                filter: "brightness(.92)",
              },
            },
          },
          {
            props: { variant: "outlined" },
            style: {
              borderColor: c.borderStrong,
              color: c.textPrimary,
              "&:hover": {
                borderColor: c.textDisabled,
                background: c.hover,
              },
            },
          },
        ],
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            width: 30,
            height: 30,
            border: `1px solid ${c.border}`,
            color: c.textMuted,
            "&:hover": { background: c.hover, color: c.textPrimary },
            "& svg": { fontSize: 16 },
          },
        },
        variants: [
          {
            props: { color: "primary" },
            style: {
              color: SOFT.primary.fg,
              background: SOFT.primary.bg,
              border: `1px solid ${SOFT.primary.border}`,
              "&:hover": { background: "rgba(242,106,27,0.2)" },
            },
          },
          {
            props: { edge: "end" },
            style: { width: "auto", height: "auto", border: "none" },
          },
        ],
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontSize: 12,
            fontWeight: 600,
            width: 32,
            height: 32,
          },
          rounded: { borderRadius: 10 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: c.elevated,
            border: `1px solid ${c.border}`,
            borderRadius: 12,
            boxShadow: c.menuShadow,
          },
          list: { padding: 6 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontSize: 13,
            color: c.textMuted,
            padding: "9px 11px",
            gap: 10,
            "&:hover": { background: c.hover, color: c.textPrimary },
          },
        },
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
            border: `1px solid ${c.divider}`,
            borderRadius: 14,
          },
        },
        variants: [
          {
            props: { variant: "dropdown" },
            style: {
              background: c.elevated,
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              boxShadow: c.menuShadow,
              padding: 6,
              zIndex: 30,
            },
          },
        ],
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
              background: c.paper,
              border: `1px solid ${c.divider}`,
            },
          },
          {
            props: { variant: "interactive" },
            style: {
              background: c.paper,
              border: `1px solid ${c.divider}`,
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
              background: `linear-gradient(180deg,rgba(242,106,27,.14),${c.paper} 60%),${c.paper}`,
              border: `1px solid ${c.border}`,
            },
          },
          {
            props: { variant: "feature" },
            style: {
              background: `radial-gradient(120% 140% at 85% 0%,rgba(242,106,27,.4),${c.paper} 65%),${c.paper}`,
              border: `1px solid ${c.border}`,
            },
          },
          {
            props: { variant: "ghost" },
            style: {
              background: "transparent",
              border: `1.5px dashed ${c.borderStrong}`,
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
              background: c.inset,
              border: `1px solid ${c.divider}`,
              borderRadius: 11,
              padding: "11px 13px",
            },
          },
          {
            props: { variant: "highlight" },
            style: {
              background: c.paper,
              border: "1px solid rgba(242,106,27,0.35)",
            },
          },
        ],
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 12, background: c.inset, fontSize: 13.5 },
          input: { paddingBlock: 13 },
          notchedOutline: { borderColor: c.border },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20, border: `1px solid ${c.border}` },
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
              color: mode === "light" ? "#3C5E8C" : "#9BB8D9",
            },
          },
          {
            props: { severity: "success" },
            style: {
              background: "rgba(78,168,116,.1)",
              borderColor: "rgba(78,168,116,.3)",
              color: mode === "light" ? "#2C7A50" : "#8FD6AC",
            },
          },
          {
            props: { severity: "warning" },
            style: {
              background: "rgba(214,155,60,.08)",
              borderColor: "rgba(214,155,60,.25)",
              color: mode === "light" ? "#8A6415" : "#E8D4A6",
            },
          },
          {
            props: { severity: "error" },
            style: {
              background: "rgba(200,80,80,.1)",
              borderColor: "rgba(200,80,80,.3)",
              color: mode === "light" ? "#A03A3A" : "#E89A9A",
            },
          },
        ],
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: "auto",
            width: "fit-content",
            background: c.paper,
            border: `1px solid ${c.divider}`,
            borderRadius: 999,
            padding: 4,
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
            padding: "7px 14px",
            fontSize: 12.5,
            fontWeight: 400,
            color: c.textSecondary,
            "&.Mui-selected": {
              color: c.textPrimary,
              fontWeight: 600,
              background: c.hover,
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: { width: 40, height: 23, padding: 0 },
          switchBase: {
            padding: 2.5,
            "&.Mui-checked": {
              transform: "translateX(17px)",
              color: "#fff",
              "& + .MuiSwitch-track": { backgroundColor: "#F26A1B", opacity: 1 },
            },
          },
          thumb: { width: 18, height: 18, boxShadow: "none", color: "#fff" },
          track: { borderRadius: 999, backgroundColor: c.neutral, opacity: 1 },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: c.textDisabled,
            "&.Mui-checked": { color: "#FF9D57" },
          },
        },
      },
      MuiStepConnector: {
        styleOverrides: { line: { borderColor: c.border } },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: {
            color: c.border,
            "&.Mui-active": { color: "#F26A1B" },
            "&.Mui-completed": { color: "#4EA874" },
          },
          text: { fill: c.textPrimary, fontSize: 11 },
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
            color: c.textSecondary,
            borderRadius: 999,
            "&:hover": { background: c.hover },
            "&.Mui-selected": {
              background: c.hover,
              color: c.textPrimary,
              borderColor: "transparent",
            },
          },
          page: { border: `1px solid ${c.divider}` },
          previousNext: {
            border: `1px solid ${c.border}`,
            color: c.textPrimary,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            background: c.paper,
            border: `1px solid ${c.divider}`,
            borderRadius: 16,
            padding: "18px 20px",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: { "&:hover": { background: c.hover } },
          head: { "&:hover": { background: "transparent" } },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: "none",
            padding: "13px 14px",
            fontSize: 13,
            color: c.textPrimary,
          },
          head: {
            color: c.textSecondary,
            fontSize: 12,
            fontWeight: 400,
            background: c.headBg,
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
          body: { borderBottom: `1px solid ${c.divider}` },
        },
      },
      MuiTableSortLabel: {
        styleOverrides: {
          root: { "&.Mui-active": { color: c.textPrimary } },
          icon: { fontSize: 14, color: "#FF9D57 !important" },
        },
      },
    },
  });
}

// Default dark theme (back-compat for direct `theme` imports).
export const theme = createAppTheme("dark");
