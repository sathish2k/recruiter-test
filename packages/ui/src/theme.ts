"use client";

import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import { createTheme, type Theme } from "@mui/material/styles";
import { createElement } from "react";

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
  bar: "linear-gradient(90deg,#FF8A3C,#E4560F)",
  meter: "linear-gradient(90deg,#FF8A3C,#E4560F)",
  planCard: "linear-gradient(150deg,rgba(242,106,27,.28),rgba(28,28,27,.7)),#1C1C1B",
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
    pill: true;
  }
}
declare module "@mui/material/Tabs" {
  interface TabsPropsVariantOverrides {
    segmented: true;
  }
}
declare module "@mui/material/Alert" {
  interface AlertPropsVariantOverrides {
    accent: true;
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
    compact: true;
    promo: true;
    spotlight: true;
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

// The design's inline summary pill: 4/11 padding, 11.5px, a 6px icon gap and
// slightly lighter fills than `soft`. Geometry lives here so components never
// re-derive it in `sx`.
const PILL = {
  primary: { bg: "rgba(242,106,27,0.10)", border: "rgba(242,106,27,0.30)", fg: "#F0B27C" },
  warning: { bg: "rgba(214,155,60,0.10)", border: "rgba(214,155,60,0.35)", fg: "#F0C27C" },
  success: { bg: "rgba(78,168,116,0.10)", border: "rgba(78,168,116,0.25)", fg: "#8FD6AC" },
  info: { bg: "rgba(90,130,180,0.10)", border: "rgba(90,130,180,0.30)", fg: "#9BB8D9" },
  error: { bg: "rgba(200,80,80,0.10)", border: "rgba(200,80,80,0.30)", fg: "#E89A9A" },
  default: { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.10)", fg: "#C9C5BD" },
} as const;

const pillChip = Object.entries(PILL).map(([color, t]) => ({
  props: { variant: "pill" as const, color: color as "primary" },
  style: {
    color: t.fg,
    backgroundColor: t.bg,
    border: `1px solid ${t.border}`,
    height: "auto",
    padding: "4px 11px",
    fontSize: 11.5,
    fontWeight: 600,
    borderRadius: 999,
    "& .MuiChip-label": { padding: 0 },
    "& .MuiChip-icon": { margin: "0 6px 0 0", fontSize: 13, color: "inherit" },
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
  /** The design's form-control outline — lighter than `border`. */
  controlBorder: string;
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
  /** Muted tan for the small tracking-wide kicker above a feature card title. */
  kicker: string;
  /** Faintest text tone — stat card sub-lines sit below `textDisabled`. */
  textFaint: string;
  /** Selected segment in a pill toggle — heavier than `tint`, lighter than a fill. */
  pillActive: string;
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
  /** Text on a soft-warning surface (the design amber #F0C27C). */
  warningSoftFg: string;
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
      controlBorder: "rgba(0,0,0,0.1)",
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
      kicker: "#8A6A4E",
      textFaint: "#A9A49B",
      pillActive: "rgba(0,0,0,0.08)",
      controlOutline: "rgba(0,0,0,0.28)",
      hoverSubtle: "rgba(0,0,0,0.035)",
      track: "rgba(0,0,0,0.10)",
      focusRing: "rgba(242,106,27,0.5)",
      warningSoftBg: "rgba(214,155,60,0.16)",
      warningSoftFg: "#8A6415",
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
    controlBorder: "rgba(255,255,255,0.1)",
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
    kicker: "#D9B79A",
    textFaint: "#55534E",
    pillActive: "rgba(255,255,255,0.10)",
    controlOutline: "rgba(255,255,255,0.3)",
    hoverSubtle: "rgba(255,255,255,0.05)",
    track: "rgba(255,255,255,0.18)",
    focusRing: "rgba(242,106,27,0.5)",
    warningSoftBg: "rgba(214,155,60,0.14)",
    warningSoftFg: "#F0C27C",
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
  controlBorder: "var(--mui-palette-surface-controlBorder)",
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
  kicker: "var(--mui-palette-surface-kicker)",
  textFaint: "var(--mui-palette-surface-textFaint)",
  pillActive: "var(--mui-palette-surface-pillActive)",
  controlOutline: "var(--mui-palette-surface-controlOutline)",
  hoverSubtle: "var(--mui-palette-surface-hoverSubtle)",
  track: "var(--mui-palette-surface-track)",
  focusRing: "var(--mui-palette-surface-focusRing)",
  warningSoftBg: "var(--mui-palette-surface-warningSoftBg)",
  warningSoftFg: "var(--mui-palette-surface-warningSoftFg)",
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
            width: 29,
            height: 29,
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
        variants: [...softChip, ...pillChip],
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
            padding: "20px 22px",
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
            // The sidenav's upgrade promo — a stronger orange wash than
            // `accent`, on an orange border.
            props: { variant: "promo" },
            style: {
              background: "linear-gradient(160deg,rgba(242,106,27,.35),rgba(242,106,27,.06))",
              border: "1px solid rgba(242,106,27,.3)",
              borderRadius: 14,
              padding: 16,
            },
          },
          {
            // Accent wash on an accent border — the AI recommendation card.
            props: { variant: "spotlight" },
            style: {
              background: `linear-gradient(130deg,rgba(242,106,27,.14),rgba(28,28,27,.6)),${v.paper}`,
              border: "1px solid rgba(242,106,27,.3)",
              borderRadius: 16,
              padding: "16px 18px",
            },
          },
          {
            props: { variant: "feature" },
            style: {
              background: `radial-gradient(120% 140% at 85% 0%,rgba(242,106,27,.4),${v.paper} 65%),${v.paper}`,
              border: `1px solid ${v.border}`,
              borderRadius: 16,
              padding: 20,
            },
          },
          {
            // Compact card — the design's 16/18 tiles (SLA status).
            props: { variant: "compact" },
            style: {
              background: v.paper,
              border: `1px solid ${v.divider}`,
              borderRadius: 16,
              padding: "16px 18px",
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
          root: {
            borderRadius: formTokens.controlRadius,
            background: v.inset,
            fontSize: 13.5,
          },
          // Two deviations from MUI's defaults, both to land on the design's
          // 40.5px control: it pins the input to `height: 1.4375em` (~1px too
          // tall), and it paints the outline on an absolutely-positioned
          // fieldset, so — unlike the design's bordered <input> — that 1px edge
          // adds no layout height. Hence the +1px on each side.
          input: {
            paddingBlock: `calc(${formTokens.controlPadY} + 1px)`,
            lineHeight: "normal",
            height: "auto",
          },
          notchedOutline: { borderColor: v.controlBorder },
        },
      },
      // Both of these re-pad the outlined input for their own affordances, which
      // makes a select or type-ahead taller than a text field. The design draws
      // every control at the same height, so they're normalised back onto it.
      MuiSelect: {
        // The design's dropdowns end in a thin chevron, not MUI's filled
        // triangle, sat on the control's own right padding.
        defaultProps: { IconComponent: ExpandMoreRounded },
        styleOverrides: {
          select: { minHeight: "auto" },
          icon: { fontSize: 17, color: v.textDisabled, right: formTokens.controlPadX },
        },
      },
      MuiAutocomplete: {
        defaultProps: { popupIcon: createElement(ExpandMoreRounded) },
        styleOverrides: {
          // The type-ahead popover, matched to the plain Select menu (and the
          // design's dropdowns): elevated surface, soft border, rounded, padded.
          paper: {
            backgroundImage: "none",
            background: v.elevated,
            border: `1px solid ${v.border}`,
            borderRadius: 13,
            boxShadow: v.menuShadow,
          },
          listbox: { padding: 6, maxHeight: 230 },
          inputRoot: {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: formTokens.controlPadX,
            // Nested so it outranks Autocomplete's own `.MuiAutocomplete-input`
            // padding, which is written at that same depth.
            "& .MuiAutocomplete-input": {
              paddingTop: `calc(${formTokens.controlPadY} + 1px)`,
              paddingBottom: `calc(${formTokens.controlPadY} + 1px)`,
              paddingLeft: 0,
            },
          },
          endAdornment: { right: formTokens.controlPadX },
          // The indicators are IconButtons, which this theme gives a bordered
          // circle; inside a field the design draws a bare glyph.
          popupIndicator: {
            border: "none",
            background: "none",
            padding: 0,
            color: v.textDisabled,
            "& .MuiSvgIcon-root": { fontSize: 17 },
            "&:hover": { background: "none" },
          },
          clearIndicator: {
            border: "none",
            background: "none",
            padding: 0,
            color: v.textDisabled,
            "& .MuiSvgIcon-root": { fontSize: 15 },
            "&:hover": { background: "none" },
          },
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
            // MUI pads both slots (icon 7px 0, message 8px 0) and dims the icon
            // to .9 — that stacks on the root padding and makes the strip taller
            // and greyer than the design. Flatten them; the row is a plain flex.
            "& .MuiAlert-icon": {
              color: "inherit",
              fontSize: 18,
              opacity: 1,
              padding: 0,
              marginRight: 11,
            },
            "& .MuiAlert-message": { padding: 0, minWidth: 0, overflow: "visible" },
          },
        },
        variants: [
          {
            // The design's orange insight strip — MUI has no primary severity.
            // Lighter than `primarySoft*`: the strip is a whisper, not a chip.
            props: { variant: "accent" },
            style: {
              background: "rgba(242,106,27,.08)",
              borderColor: "rgba(242,106,27,.28)",
              borderRadius: 13,
              padding: "11px 16px",
              fontSize: 12.5,
              color: v.primarySoftFg,
            },
          },
          {
            props: { severity: "info", variant: "standard" },
            style: {
              background: "rgba(90,130,180,.1)",
              borderColor: "rgba(90,130,180,.3)",
              color: v.infoFg,
            },
          },
          {
            props: { severity: "success", variant: "standard" },
            style: {
              background: "rgba(78,168,116,.1)",
              borderColor: "rgba(78,168,116,.3)",
              color: v.successFg,
            },
          },
          {
            props: { severity: "warning", variant: "standard" },
            style: {
              background: "rgba(214,155,60,.08)",
              borderColor: "rgba(214,155,60,.25)",
              color: v.warningFg,
            },
          },
          {
            props: { severity: "error", variant: "standard" },
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
        variants: [
          {
            // The in-form segmented picker: a full pill on the inset surface
            // with a raised pill for the selected option (matches the design).
            props: { variant: "segmented" },
            style: {
              width: "100%",
              background: v.inset,
              border: `1px solid ${v.controlBorder}`,
              borderRadius: 999,
              padding: 4,
              "& .MuiTabs-indicator": { display: "none" },
              "& .MuiTabs-list": { width: "100%", gap: "4px" },
              "& .MuiTab-root": {
                flex: 1,
                // Override MUI's default 160px tab min-width so equal-flex tabs
                // share the track and don't overflow/clip when there are many.
                minWidth: 0,
                borderRadius: 999,
                padding: "8px 6px",
                fontSize: 12.5,
                fontWeight: 600,
                color: v.textSecondary,
                "&.Mui-selected": {
                  color: v.textPrimary,
                  background: v.elevated,
                  boxShadow: `0 0 0 1px ${v.controlBorder}, 0 2px 4px rgba(0,0,0,.3)`,
                },
              },
            },
          },
        ],
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
            transition: "background .18s ease, color .18s ease",
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
          root: { width: 44, height: 26, padding: 0 },
          switchBase: {
            padding: 3,
            "&.Mui-checked": {
              transform: "translateX(18px)",
              color: "#fff",
              "& + .MuiSwitch-track": { backgroundColor: "#F26A1B", opacity: 1 },
            },
          },
          thumb: { width: 20, height: 20, boxShadow: "none", color: "#fff" },
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
            width: 29,
            height: 29,
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
            padding: "20px 22px",
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
          // The designs draw the row rule a shade lighter than `divider`.
          body: { borderBottom: "1px solid rgba(255,255,255,0.05)" },
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
