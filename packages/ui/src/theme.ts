"use client";

import { createTheme, type Theme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    /** Mode-aware surface tokens, reachable from `sx` as `surface.*`. */
    surface: Surfaces;
  }
  interface PaletteOptions {
    surface?: Surfaces;
  }
  interface Theme {
    /** Shared form metrics, so widgets don't hardcode spacing/radii. */
    form: FormTokens;
    /** Brand gradients — one definition per look, referenced everywhere. */
    gradients: GradientTokens;
  }
  interface ThemeOptions {
    form?: FormTokens;
    gradients?: GradientTokens;
  }
}

/** Metrics the form widgets share. Values come from the design; they're not on
 * an 8px grid, which is why they live here rather than in `theme.spacing`. */
export interface FormTokens {
  /** Label → control, and control → helper. */
  fieldGap: string;
  /** Between inline items: chips, day toggles, button pairs. */
  inlineGap: string;
  /** Between fields in a stack. */
  rowGap: string;
  controlRadius: string;
  controlPadX: string;
  controlPadY: string;
  pillRadius: string;
  badgeRadius: string;
  badgePadX: string;
  badgePadY: string;
}

export interface GradientTokens {
  /** Primary CTA fill. */
  primary: string;
  /** Progress/score bars. */
  bar: string;
  /** Softer meter fill (usage, seats). */
  meter: string;
  /** Tinted panel behind the current-plan card. */
  planCard: string;
}

const gradientTokens: GradientTokens = {
  primary: "linear-gradient(135deg,#FF8A3C,#E4560F)",
  bar: "linear-gradient(90deg,#FF8A3C,#C24509)",
  meter: "linear-gradient(90deg,#F0894A,#F0C27C)",
  planCard: "linear-gradient(135deg,rgba(240,137,74,.22),rgba(240,194,124,.07))",
};

const formTokens: FormTokens = {
  fieldGap: "7px",
  inlineGap: "8px",
  rowGap: "16px",
  controlRadius: "11px",
  controlPadX: "14px",
  controlPadY: "11px",
  pillRadius: "999px",
  badgeRadius: "5px",
  badgePadX: "5px",
  badgePadY: "2px",
};

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

// Mode-aware surface tokens: flipping them re-themes every atom below in one
// place.
//
// The dark values come from the Claude Design source. The light ones do NOT —
// the design wires up an `html.hpx-light` class but never styles it (no CSS for
// that selector, no custom properties, no prefers-color-scheme), so toggling
// the theme there only swaps the button icon. The light palette below is ours,
// derived to keep the dark contrast relationships. Replace it wholesale if the
// design ever ships a real light mode.
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
  /** Subtle fill for inline chips/badges sitting on a control. */
  tint: string;
  /** Soft-primary trio: selected day toggles, quick-picks, accent chips. */
  primarySoftBg: string;
  primarySoftBorder: string;
  primarySoftFg: string;
  /** Alert/severity foregrounds — readable against each mode's background. */
  infoFg: string;
  successFg: string;
  warningFg: string;
  errorFg: string;
  /** Brighter orange for inline highlights (match scores, check ticks). */
  accentBright: string;
  /** Outline of an unchecked checkbox/radio — must read on either background. */
  controlOutline: string;
  /** Lighter than `hover`, for rows that only need a hint of separation. */
  hoverSubtle: string;
  /** Track behind a progress/score bar. */
  track: string;
  /** Ring shown while a control has focus. */
  focusRing: string;
  /** Soft warning tone (Enterprise badges, "action needed" banners). */
  warningSoftBg: string;
  warningSoftBorder: string;
  /** Soft success tone (toasts, healthy states). */
  successSoftBg: string;
  successSoftBorder: string;
  /** Soft info tone. */
  infoSoftBg: string;
  infoSoftBorder: string;
  /** Scrim behind a modal. */
  backdrop: string;
  /** Translucent fill for sticky bars that overlay scrolling content. */
  scrim: string;
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
      tint: "rgba(0,0,0,0.06)",
      primarySoftBg: "rgba(242,106,27,0.12)",
      primarySoftBorder: "rgba(242,106,27,0.30)",
      primarySoftFg: "#C2521A",
      infoFg: "#3C5E8C",
      successFg: "#2C7A50",
      warningFg: "#8A6415",
      errorFg: "#A03A3A",
      accentBright: "#C24509",
      controlOutline: "rgba(0,0,0,0.28)",
      hoverSubtle: "rgba(0,0,0,0.035)",
      track: "rgba(0,0,0,0.10)",
      focusRing: "rgba(242,106,27,0.5)",
      warningSoftBg: "rgba(214,155,60,0.16)",
      warningSoftBorder: "rgba(214,155,60,0.40)",
      successSoftBg: "rgba(78,168,116,0.12)",
      successSoftBorder: "rgba(78,168,116,0.40)",
      infoSoftBg: "rgba(90,130,180,0.12)",
      infoSoftBorder: "rgba(90,130,180,0.30)",
      backdrop: "rgba(0,0,0,0.35)",
      scrim: "rgba(255,255,255,0.94)",
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
    tint: "rgba(255,255,255,0.07)",
    primarySoftBg: "rgba(242,106,27,0.14)",
    primarySoftBorder: "rgba(242,106,27,0.35)",
    primarySoftFg: "#F0B27C",
    infoFg: "#9BB8D9",
    successFg: "#8FD6AC",
    warningFg: "#E8D4A6",
    errorFg: "#E89A9A",
    accentBright: "#FF9D57",
    controlOutline: "rgba(255,255,255,0.3)",
    hoverSubtle: "rgba(255,255,255,0.05)",
    track: "rgba(255,255,255,0.18)",
    focusRing: "rgba(242,106,27,0.5)",
    warningSoftBg: "rgba(214,155,60,0.14)",
    warningSoftBorder: "rgba(214,155,60,0.35)",
    successSoftBg: "rgba(78,168,116,0.12)",
    successSoftBorder: "rgba(78,168,116,0.40)",
    infoSoftBg: "rgba(122,162,247,0.10)",
    infoSoftBorder: "rgba(122,162,247,0.24)",
    backdrop: "rgba(0,0,0,0.6)",
    scrim: "rgba(19,19,19,0.94)",
  };
}

/**
 * CSS-variable references for the surface tokens. Component styleOverrides use
 * these instead of literal colours so a single theme serves both schemes — the
 * browser resolves the var per `data-theme`, no React re-render involved.
 */
const v: Surfaces = {
  bgDefault: "var(--mui-palette-surface-bgDefault)",
  paper: "var(--mui-palette-surface-paper)",
  elevated: "var(--mui-palette-surface-elevated)",
  inset: "var(--mui-palette-surface-inset)",
  hover: "var(--mui-palette-surface-hover)",
  divider: "var(--mui-palette-surface-divider)",
  border: "var(--mui-palette-surface-border)",
  borderStrong: "var(--mui-palette-surface-borderStrong)",
  textPrimary: "var(--mui-palette-surface-textPrimary)",
  textSecondary: "var(--mui-palette-surface-textSecondary)",
  textDisabled: "var(--mui-palette-surface-textDisabled)",
  textMuted: "var(--mui-palette-surface-textMuted)",
  neutral: "var(--mui-palette-surface-neutral)",
  headBg: "var(--mui-palette-surface-headBg)",
  menuShadow: "var(--mui-palette-surface-menuShadow)",
  tint: "var(--mui-palette-surface-tint)",
  primarySoftBg: "var(--mui-palette-surface-primarySoftBg)",
  primarySoftBorder: "var(--mui-palette-surface-primarySoftBorder)",
  primarySoftFg: "var(--mui-palette-surface-primarySoftFg)",
  infoFg: "var(--mui-palette-surface-infoFg)",
  successFg: "var(--mui-palette-surface-successFg)",
  warningFg: "var(--mui-palette-surface-warningFg)",
  errorFg: "var(--mui-palette-surface-errorFg)",
  accentBright: "var(--mui-palette-surface-accentBright)",
  controlOutline: "var(--mui-palette-surface-controlOutline)",
  hoverSubtle: "var(--mui-palette-surface-hoverSubtle)",
  track: "var(--mui-palette-surface-track)",
  focusRing: "var(--mui-palette-surface-focusRing)",
  warningSoftBg: "var(--mui-palette-surface-warningSoftBg)",
  warningSoftBorder: "var(--mui-palette-surface-warningSoftBorder)",
  successSoftBg: "var(--mui-palette-surface-successSoftBg)",
  successSoftBorder: "var(--mui-palette-surface-successSoftBorder)",
  infoSoftBg: "var(--mui-palette-surface-infoSoftBg)",
  infoSoftBorder: "var(--mui-palette-surface-infoSoftBorder)",
  backdrop: "var(--mui-palette-surface-backdrop)",
  scrim: "var(--mui-palette-surface-scrim)",
};

/** Real values per scheme — MUI needs literals here to emit the variables. */
function paletteFor(mode: ThemeMode) {
  const c = surfaces(mode);
  return {
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
    surface: c,
  };
}

export function createAppTheme(): Theme {
  return createTheme({
    // One theme, two schemes. Every palette token becomes a CSS custom property
    // scoped by `data-theme`, so switching modes is an attribute flip on <html>
    // — no theme object swap, and no flash before hydration.
    cssVariables: { colorSchemeSelector: "data-theme" },
    defaultColorScheme: "dark",
    colorSchemes: {
      light: { palette: paletteFor("light") },
      dark: { palette: paletteFor("dark") },
    },
    form: formTokens,
    gradients: gradientTokens,
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: "var(--font-instrument), 'Instrument Sans', system-ui, sans-serif",
      h4: { fontSize: 27, fontWeight: 700, letterSpacing: "-0.01em" },
      h5: { fontSize: 17, fontWeight: 600 },
      subtitle1: { fontSize: 14.5, fontWeight: 600 },
      body1: { fontSize: 13.5 },
      body2: { fontSize: 12.5, color: v.textSecondary },
      overline: { fontSize: 11, letterSpacing: "0.12em", color: v.textDisabled },
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
              background: gradientTokens.primary,
              "&:hover": { filter: "brightness(1.08)" },
            },
          },
          {
            props: { variant: "contained", color: "secondary" },
            style: {
              background: "var(--mui-palette-secondary-main)",
              color: "var(--mui-palette-secondary-contrastText)",
              fontWeight: 700,
              "&:hover": {
                background: "var(--mui-palette-secondary-main)",
                filter: "brightness(.92)",
              },
            },
          },
          {
            props: { variant: "outlined" },
            style: {
              borderColor: v.borderStrong,
              color: v.textPrimary,
              "&:hover": {
                borderColor: v.textDisabled,
                background: v.hover,
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
            border: `1px solid ${v.border}`,
            color: v.textMuted,
            "&:hover": { background: v.hover, color: v.textPrimary },
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
            background: v.elevated,
            border: `1px solid ${v.border}`,
            borderRadius: 12,
            boxShadow: v.menuShadow,
          },
          list: { padding: 6 },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontSize: 13,
            color: v.textMuted,
            padding: "9px 11px",
            gap: 10,
            "&:hover": { background: v.hover, color: v.textPrimary },
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
            border: `1px solid ${v.divider}`,
            borderRadius: 14,
          },
        },
        variants: [
          {
            props: { variant: "dropdown" },
            style: {
              background: v.elevated,
              border: `1px solid ${v.border}`,
              borderRadius: 12,
              boxShadow: v.menuShadow,
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
              background: v.paper,
              border: `1px solid ${v.divider}`,
            },
          },
          {
            props: { variant: "interactive" },
            style: {
              background: v.paper,
              border: `1px solid ${v.divider}`,
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
              background: `linear-gradient(180deg,rgba(242,106,27,.14),${v.paper} 60%),${v.paper}`,
              border: `1px solid ${v.border}`,
            },
          },
          {
            props: { variant: "feature" },
            style: {
              background: `radial-gradient(120% 140% at 85% 0%,rgba(242,106,27,.4),${v.paper} 65%),${v.paper}`,
              border: `1px solid ${v.border}`,
            },
          },
          {
            props: { variant: "ghost" },
            style: {
              background: "transparent",
              border: `1.5px dashed ${v.borderStrong}`,
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
              background: v.inset,
              border: `1px solid ${v.divider}`,
              borderRadius: 11,
              padding: "11px 13px",
            },
          },
          {
            props: { variant: "highlight" },
            style: {
              background: v.paper,
              border: "1px solid rgba(242,106,27,0.35)",
            },
          },
        ],
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 12, background: v.inset, fontSize: 13.5 },
          input: { paddingBlock: 13 },
          notchedOutline: { borderColor: v.border },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20, border: `1px solid ${v.border}` },
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
              color: v.infoFg,
            },
          },
          {
            props: { severity: "success" },
            style: {
              background: "rgba(78,168,116,.1)",
              borderColor: "rgba(78,168,116,.3)",
              color: v.successFg,
            },
          },
          {
            props: { severity: "warning" },
            style: {
              background: "rgba(214,155,60,.08)",
              borderColor: "rgba(214,155,60,.25)",
              color: v.warningFg,
            },
          },
          {
            props: { severity: "error" },
            style: {
              background: "rgba(200,80,80,.1)",
              borderColor: "rgba(200,80,80,.3)",
              color: v.errorFg,
            },
          },
        ],
      },
      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: "auto",
            width: "fit-content",
            background: v.paper,
            border: `1px solid ${v.divider}`,
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
            color: v.textSecondary,
            "&.Mui-selected": {
              color: v.textPrimary,
              fontWeight: 600,
              background: v.hover,
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
          track: { borderRadius: 999, backgroundColor: v.neutral, opacity: 1 },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: v.textDisabled,
            "&.Mui-checked": { color: "#FF9D57" },
          },
        },
      },
      MuiStepConnector: {
        styleOverrides: { line: { borderColor: v.border } },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: {
            color: v.border,
            "&.Mui-active": { color: "#F26A1B" },
            "&.Mui-completed": { color: "#4EA874" },
          },
          text: { fill: v.textPrimary, fontSize: 11 },
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
            color: v.textSecondary,
            borderRadius: 999,
            "&:hover": { background: v.hover },
            "&.Mui-selected": {
              background: v.hover,
              color: v.textPrimary,
              borderColor: "transparent",
            },
          },
          page: { border: `1px solid ${v.divider}` },
          previousNext: {
            border: `1px solid ${v.border}`,
            color: v.textPrimary,
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            background: v.paper,
            border: `1px solid ${v.divider}`,
            borderRadius: 16,
            padding: "18px 20px",
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: { "&:hover": { background: v.hover } },
          head: { "&:hover": { background: "transparent" } },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: "none",
            padding: "13px 14px",
            fontSize: 13,
            color: v.textPrimary,
          },
          head: {
            color: v.textSecondary,
            fontSize: 12,
            fontWeight: 400,
            background: v.headBg,
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
          body: { borderBottom: `1px solid ${v.divider}` },
        },
      },
      MuiTableSortLabel: {
        styleOverrides: {
          root: { "&.Mui-active": { color: v.textPrimary } },
          icon: { fontSize: 14, color: "#FF9D57 !important" },
        },
      },
    },
  });
}

// Default dark theme (back-compat for direct `theme` imports).
export const theme = createAppTheme();
