"use client";

import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import { createTheme, type Theme } from "@mui/material/styles";
// Type-only: teaches `components` about the MUI X picker slots below.
import type {} from "@mui/x-date-pickers/themeAugmentation";
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
    /** Brand washes — one definition per look, referenced everywhere. */
    gradients: GradientTokens;
    /** Component type scale, so widgets don't hardcode font sizes. */
    type: TypeTokens;
    /** Durations and easings. One curve for state, faster exits.
     * (`theme.motion` is MUI's own reduced-motion config, set below.) */
    timing: TimingTokens;
  }
  interface ThemeOptions {
    form?: FormTokens;
    gradients?: GradientTokens;
    type?: TypeTokens;
    timing?: TimingTokens;
  }
}

/** Metrics the form widgets share. Values are the design's control heights,
 * which are deliberately off the 8px grid (54 field / 36 control), so they
 * live here rather than in `theme.spacing`. */
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
  controlFontSize: string;
  pillRadius: string;
  badgeRadius: string;
  badgePadX: string;
  badgePadY: string;
}

/**
 * The design's component type tokens (`tokens/typography.css` → `--type-*`),
 * resolved to the sizes the product screens actually draw. Widgets read these
 * instead of writing a number into `sx`, so the scale has one source.
 */
export interface TypeTokens {
  navItem: number;
  navMini: number;
  navSubheader: number;
  tableHead: number;
  chip: number;
  label: number;
  avatar: number;
  inputLabel: number;
  inputValue: number;
  buttonLg: number;
  buttonMd: number;
  buttonSm: number;
  /** The screens' three dense body steps, below `body2`. */
  bodyDense: number;
  bodyDenser: number;
  micro: number;
}

/** Durations and easings from `tokens/motion.css`. Exits are faster than
 * entrances; `prefers-reduced-motion` zeroes them in `MuiCssBaseline`. */
export interface TimingTokens {
  durInstant: string;
  durFast: string;
  durBase: string;
  durSlow: string;
  durSlower: string;
  easeStandard: string;
  easeDecelerate: string;
  easeAccelerate: string;
  easeEmphasized: string;
  /** Ready-made compositions — prefer these over re-declaring the parts. */
  state: string;
  enter: string;
  exit: string;
}

export interface GradientTokens {
  /** Primary CTA fill. Flat in this design — the system has no CTA gradient. */
  primary: string;
  /** Progress/score bars. */
  bar: string;
  /** Softer meter fill (usage, seats). */
  meter: string;
  /** Tinted panel behind the current-plan card. */
  planCard: string;
}

const formTokens: FormTokens = {
  fieldGap: "6px",
  inlineGap: "8px",
  rowGap: "16px",
  controlRadius: "var(--recruit-control-radius, 8px)",
  controlPadX: "var(--recruit-control-pad-x, 16px)",
  controlPadY: "var(--recruit-control-pad-y, 16px)",
  controlFontSize: "var(--recruit-control-font, 15px)",
  pillRadius: "999px",
  badgeRadius: "6px",
  badgePadX: "6px",
  badgePadY: "2px",
};

const typeTokens: TypeTokens = {
  navItem: 14,
  navMini: 10,
  navSubheader: 11,
  tableHead: 11,
  chip: 13,
  label: 12,
  avatar: 12,
  inputLabel: 12,
  inputValue: 15,
  buttonLg: 15,
  buttonMd: 14,
  buttonSm: 13,
  bodyDense: 12.5,
  bodyDenser: 11.5,
  micro: 10.5,
};

const timingTokens: TimingTokens = {
  durInstant: "0ms",
  durFast: "120ms",
  durBase: "200ms",
  durSlow: "250ms",
  durSlower: "300ms",
  easeStandard: "cubic-bezier(.4,0,.2,1)",
  easeDecelerate: "cubic-bezier(0,0,.2,1)",
  easeAccelerate: "cubic-bezier(.4,0,1,1)",
  easeEmphasized: "cubic-bezier(.2,0,0,1)",
  state:
    "color 200ms cubic-bezier(.4,0,.2,1),background-color 200ms cubic-bezier(.4,0,.2,1),border-color 200ms cubic-bezier(.4,0,.2,1),box-shadow 200ms cubic-bezier(.4,0,.2,1)",
  enter: "opacity 250ms cubic-bezier(0,0,.2,1),transform 250ms cubic-bezier(0,0,.2,1)",
  exit: "opacity 120ms cubic-bezier(.4,0,1,1),transform 120ms cubic-bezier(.4,0,1,1)",
};

declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides {
    /** Primary-tinted action button — the design's row-level call to action. */
    soft: true;
  }
}

declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides {
    soft: true;
    pill: true;
    /** Micro badge beside a name (PRIMARY, status). */
    badge: true;
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
    selectable: true;
  }
}

export type ThemeMode = "light" | "dark";

/**
 * Mode-aware surface tokens: flipping them re-themes every atom below in one
 * place. Values are transcribed from the HirePilotX design screens, which
 * declare a `:root` (dark) and an `html.hpx-light` block of the same keys.
 */
interface Surfaces {
  bgDefault: string;
  paper: string;
  elevated: string;
  inset: string;
  hover: string;
  divider: string;
  border: string;
  /** The design's form-control outline. */
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
  /** Accent hero strip — a stronger wash than `primarySoftBg`, with its own
   * border, for a full-width call to action. */
  heroTint: string;
  heroBorder: string;
  /** Field dropdown panel. */
  dropdownPanel: string;
  primarySoftBg: string;
  /** Selected row inside a dropdown — a touch stronger than `primarySoftBg`. */
  optionSelectedBg: string;
  primarySoftBorder: string;
  primarySoftFg: string;
  /** Alert/severity foregrounds — readable against each mode's background. */
  infoFg: string;
  successFg: string;
  warningFg: string;
  errorFg: string;
  /** The amber pilot dot — the one thing in motion on a screen. */
  accentBright: string;
  /** Muted tone for the small tracking-wide kicker above a section title. */
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
  /** The focus colour. The design gives focus the action colour, so this is
   * the navy — not a neutral outline. */
  focusRing: string;
  /** Soft warning tone (badges, "action needed" banners). */
  warningSoftBg: string;
  warningSoftFg: string;
  warningSoftBorder: string;
  /** Soft success tone (toasts, healthy states). */
  successSoftBg: string;
  successSoftBorder: string;
  /** Soft error tone (destructive bands, refusal notices). */
  errorSoftBg: string;
  errorSoftBorder: string;
  /** Soft info tone. */
  infoSoftBg: string;
  infoSoftBorder: string;
  /** Scrim behind a modal. */
  backdrop: string;
  /** Translucent fill for sticky bars that overlay scrolling content. */
  scrim: string;

  /* ---- added by the HirePilotX design ---- */
  /** Side rail. Darker than the canvas on dark, white on light. */
  rail: string;
  /** Form-field ground. Sits below `inset` on dark, white on light. */
  field: string;
  /** Card elevation. This design separates cards with shadow, not a border. */
  cardShadow: string;
  /** Shadow under a filled primary CTA. */
  primaryShadow: string;
  /** The elevation ramp's top step — a dialog casts further than a menu. */
  dialogShadow: string;
  /** Categorical chart series. Three steps of the brand navy plus one warm
   * neutral: cool-versus-warm is the axis every red-green deficiency
   * preserves, so the set is colour-vision safe by construction. Four is the
   * ceiling — beyond that the answer is small multiples, not more hues. */
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  /** Sequential ramp, light → dark, for magnitude. */
  chartSeq1: string;
  chartSeq2: string;
  chartSeq3: string;
  chartSeq4: string;
  chartSeq5: string;
  /** Diverging triple, for signed change. */
  chartDivNeg: string;
  chartDivMid: string;
  chartDivPos: string;
  chartGrid: string;
  chartAxis: string;
  /** The inverted ground — a snackbar, the one surface that must not read as
   * part of the page it reports on. Flips with the scheme, unlike `slab`. */
  inverse: string;
  inverseFg: string;
  /** The brand navy slab (auth panel, promo card) and its on-slab tones. */
  slab: string;
  slabFg: string;
  slabFgMuted: string;
  slabLine: string;
  /** Violet — the sixth semantic, used for AI/automation states. */
  violetFg: string;
  violetSoftBg: string;
  /** Nav/link foreground: the navy lifts on dark so it stays legible. */
  linkFg: string;
}

function surfaces(mode: ThemeMode): Surfaces {
  if (mode === "light") {
    return {
      bgDefault: "#F4F6F8",
      paper: "#FFFFFF",
      elevated: "#FFFFFF",
      inset: "#F4F6F8",
      hover: "rgba(99,115,129,0.09)",
      divider: "rgba(145,158,171,0.20)",
      border: "rgba(145,158,171,0.24)",
      controlBorder: "rgba(145,158,171,0.24)",
      borderStrong: "rgba(145,158,171,0.32)",
      textPrimary: "#1C252E",
      textSecondary: "#495667",
      textDisabled: "#919EAB",
      textMuted: "#353F4A",
      neutral: "#DFE3E8",
      headBg: "#F4F6F8",
      menuShadow: "-20px 20px 40px -4px rgba(145,158,171,0.28)",
      tint: "rgba(145,158,171,0.12)",
      heroTint: "rgba(14,46,92,0.10)",
      heroBorder: "rgba(14,46,92,0.22)",
      dropdownPanel: "#FFFFFF",
      primarySoftBg: "rgba(14,46,92,0.10)",
      optionSelectedBg: "rgba(14,46,92,0.14)",
      primarySoftBorder: "rgba(14,46,92,0.22)",
      primarySoftFg: "#0E2E5C",
      infoFg: "#006C9C",
      successFg: "#065E49",
      warningFg: "#7A4100",
      errorFg: "#B71D18",
      accentBright: "#B45309",
      kicker: "#495667",
      textFaint: "#62707E",
      pillActive: "rgba(99,115,129,0.14)",
      controlOutline: "rgba(145,158,171,0.48)",
      hoverSubtle: "rgba(99,115,129,0.05)",
      track: "rgba(145,158,171,0.24)",
      focusRing: "#0E2E5C",
      warningSoftBg: "rgba(255,171,0,0.16)",
      warningSoftFg: "#7A4100",
      warningSoftBorder: "rgba(255,171,0,0.32)",
      successSoftBg: "rgba(34,197,94,0.16)",
      successSoftBorder: "rgba(34,197,94,0.32)",
      errorSoftBg: "rgba(255,86,48,0.16)",
      errorSoftBorder: "rgba(255,86,48,0.32)",
      infoSoftBg: "rgba(0,184,217,0.16)",
      infoSoftBorder: "rgba(0,184,217,0.32)",
      backdrop: "rgba(28,37,46,0.55)",
      scrim: "rgba(255,255,255,0.94)",

      rail: "#FFFFFF",
      field: "#FFFFFF",
      cardShadow: "0 0 2px rgba(145,158,171,0.2),0 12px 24px -4px rgba(145,158,171,0.16)",
      primaryShadow: "0 8px 16px rgba(14,46,92,0.24)",
      dialogShadow: "-40px 40px 80px -8px rgba(145,158,171,0.24)",
      chart1: "#0E2E5C",
      chart2: "#35608F",
      chart3: "#7A6A55",
      chart4: "#6E93C7",
      chartSeq1: "#E3ECF7",
      chartSeq2: "#B9CFE9",
      chartSeq3: "#7FAAEA",
      chartSeq4: "#3E6BA8",
      chartSeq5: "#0E2E5C",
      chartDivNeg: "#B71D18",
      chartDivMid: "#62707E",
      chartDivPos: "#065E49",
      chartGrid: "rgba(99,115,129,0.14)",
      chartAxis: "#62707E",
      inverse: "#1C252E",
      inverseFg: "#F4F6F8",
      slab: "#0E2E5C",
      slabFg: "#EAF0F8",
      slabFgMuted: "#A9C0DE",
      slabLine: "rgba(255,255,255,0.16)",
      violetFg: "#5B21B6",
      violetSoftBg: "rgba(142,51,255,0.13)",
      linkFg: "#0E2E5C",
    };
  }
  return {
    bgDefault: "#000000",
    paper: "#17181B",
    elevated: "#17181B",
    inset: "#1F2024",
    hover: "rgba(255,255,255,0.08)",
    divider: "rgba(145,158,171,0.16)",
    border: "rgba(145,158,171,0.24)",
    controlBorder: "rgba(145,158,171,0.24)",
    borderStrong: "rgba(145,158,171,0.32)",
    textPrimary: "#E6E8EB",
    textSecondary: "#97A2AD",
    textDisabled: "#637381",
    textMuted: "#B8C0C9",
    neutral: "rgba(145,158,171,0.24)",
    headBg: "rgba(145,158,171,0.08)",
    menuShadow: "0 20px 50px rgba(0,0,0,0.7)",
    tint: "rgba(145,158,171,0.12)",
    heroTint: "rgba(101,146,204,0.22)",
    heroBorder: "rgba(101,146,204,0.35)",
    dropdownPanel: "#17181B",
    primarySoftBg: "rgba(101,146,204,0.22)",
    optionSelectedBg: "rgba(101,146,204,0.28)",
    primarySoftBorder: "rgba(101,146,204,0.35)",
    primarySoftFg: "#6592CC",
    infoFg: "#61F3F3",
    successFg: "#77ED8B",
    warningFg: "#FFD666",
    errorFg: "#FF8A80",
    accentBright: "#F59E0B",
    kicker: "#97A2AD",
    textFaint: "#808C99",
    pillActive: "rgba(255,255,255,0.12)",
    controlOutline: "rgba(145,158,171,0.48)",
    hoverSubtle: "rgba(255,255,255,0.05)",
    track: "rgba(145,158,171,0.24)",
    focusRing: "#4372AF",
    warningSoftBg: "rgba(255,171,0,0.22)",
    warningSoftFg: "#FFD666",
    warningSoftBorder: "rgba(255,171,0,0.35)",
    successSoftBg: "rgba(34,197,94,0.22)",
    successSoftBorder: "rgba(34,197,94,0.35)",
    errorSoftBg: "rgba(255,86,48,0.22)",
    errorSoftBorder: "rgba(255,86,48,0.35)",
    infoSoftBg: "rgba(0,184,217,0.22)",
    infoSoftBorder: "rgba(0,184,217,0.35)",
    backdrop: "rgba(0,0,0,0.68)",
    scrim: "rgba(0,0,0,0.94)",

    rail: "#0B0C0E",
    field: "#101113",
    cardShadow: "inset 0 0 0 1px rgba(255,255,255,0.06),0 12px 30px rgba(0,0,0,0.6)",
    primaryShadow: "0 8px 16px rgba(26,78,150,0.24)",
    dialogShadow: "-40px 40px 80px -8px rgba(0,0,0,0.7)",
    chart1: "#3A6AA6",
    chart2: "#6E93C7",
    chart3: "#B9A88A",
    chart4: "#A8C4E4",
    chartSeq1: "#12233B",
    chartSeq2: "#1D3D66",
    chartSeq3: "#2F5C93",
    chartSeq4: "#4C7AB8",
    chartSeq5: "#7FAAEA",
    chartDivNeg: "#FF8A80",
    chartDivMid: "#808C99",
    chartDivPos: "#77ED8B",
    chartGrid: "rgba(145,158,171,0.16)",
    chartAxis: "#808C99",
    inverse: "#E6E8EB",
    inverseFg: "#1C252E",
    slab: "#0E2E5C",
    slabFg: "#EAF0F8",
    slabFgMuted: "#A9C0DE",
    slabLine: "rgba(255,255,255,0.16)",
    violetFg: "#C684FF",
    violetSoftBg: "rgba(142,51,255,0.24)",
    linkFg: "#6592CC",
  };
}

/**
 * CSS-variable references for the surface tokens. Component styleOverrides use
 * these instead of literal colours so a single theme serves both schemes — the
 * browser resolves the var per `data-theme`, no React re-render involved.
 */
const v = Object.fromEntries(
  (Object.keys(surfaces("dark")) as (keyof Surfaces)[]).map((k) => [
    k,
    `var(--mui-palette-surface-${k})`,
  ]),
) as unknown as Surfaces;

/** Flat washes. This design has no CTA gradient — the tokens stay so callers
 * keep one name per look, but they resolve to the primary fill. */
const gradientTokens: GradientTokens = {
  primary: "var(--mui-palette-primary-main)",
  bar: "var(--mui-palette-primary-main)",
  meter: "var(--mui-palette-primary-main)",
  planCard: `linear-gradient(150deg,${v.heroTint},${v.paper} 70%),${v.paper}`,
};

const SOFT_KEYS = [
  "primary",
  "secondary",
  "success",
  "warning",
  "error",
  "info",
  "default",
] as const;

/** Soft fills, one per severity, expressed in surface tokens so both schemes
 * resolve from a single rule set. */
const SOFT: Record<(typeof SOFT_KEYS)[number], { bg: string; border: string; fg: string }> = {
  primary: { bg: v.primarySoftBg, border: v.primarySoftBorder, fg: v.primarySoftFg },
  success: { bg: v.successSoftBg, border: v.successSoftBorder, fg: v.successFg },
  warning: { bg: v.warningSoftBg, border: v.warningSoftBorder, fg: v.warningFg },
  error: { bg: v.errorSoftBg, border: v.errorSoftBorder, fg: v.errorFg },
  info: { bg: v.infoSoftBg, border: v.infoSoftBorder, fg: v.infoFg },
  default: { bg: v.tint, border: v.border, fg: v.textMuted },
  // Violet, the sixth semantic: AI/automation, and anything the agency itself
  // made (a custom role) rather than something that shipped.
  secondary: { bg: v.violetSoftBg, border: v.violetSoftBg, fg: v.violetFg },
};

const softChip = SOFT_KEYS.map((color) => ({
  props: { variant: "soft" as const, color: color as "primary" },
  style: {
    color: SOFT[color].fg,
    backgroundColor: SOFT[color].bg,
    border: `1px solid ${SOFT[color].border}`,
  },
}));

/**
 * The design's micro badge beside a name — 10px uppercase in a 2/6 tag. Small
 * enough that a row can carry two of them without the name truncating.
 */
const badgeChip = SOFT_KEYS.map((color) => ({
  props: { variant: "badge" as const, color: color as "primary" },
  style: {
    color: SOFT[color].fg,
    backgroundColor: SOFT[color].bg,
    border: `1px solid ${SOFT[color].border}`,
    height: "auto",
    borderRadius: 6,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: ".05em",
    padding: "2px 6px",
    "& .MuiChip-label": { padding: 0 },
  },
}));

/** The design's toolbar pill: 24–28px tall, borderless tint, 11px label. */
const pillChip = SOFT_KEYS.map((color) => ({
  props: { variant: "pill" as const, color: color as "primary" },
  style: {
    color: SOFT[color].fg,
    backgroundColor: SOFT[color].bg,
    border: `1px solid ${SOFT[color].border}`,
    height: "auto",
    padding: "4px 11px",
    fontSize: 11.5,
    fontWeight: 700,
    borderRadius: 999,
    "& .MuiChip-label": { padding: 0 },
    "& .MuiChip-icon": { margin: "0 6px 0 0", fontSize: 14, color: "inherit" },
  },
}));

/** Real values per scheme — MUI needs literals here to emit the variables. */
function paletteFor(mode: ThemeMode) {
  const c = surfaces(mode);
  const light = mode === "light";
  return {
    // The action colour is the Rotate mark's navy. On dark it lifts two steps
    // so it keeps AA against the near-black canvas.
    primary: {
      main: light ? "#0E2E5C" : "#4372AF",
      light: "#4C7AB8",
      dark: light ? "#0A2244" : "#4776B2",
      contrastText: "#FFFFFF",
    },
    // The mark's amber pilot dot. Never a semantic state — it marks the one
    // thing in motion on a screen.
    secondary: {
      main: light ? "#B45309" : "#F59E0B",
      light: "#FBBF24",
      dark: light ? "#78350F" : "#B45309",
      contrastText: light ? "#FFFFFF" : "#1C252E",
    },
    success: { main: "#22C55E", light: c.successFg },
    warning: { main: "#FFAB00", light: c.warningFg },
    error: { main: "#FF5630", light: c.errorFg },
    info: { main: "#00B8D9", light: c.infoFg },
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
    defaultColorScheme: "light",
    colorSchemes: {
      light: { palette: paletteFor("light") },
      dark: { palette: paletteFor("dark") },
    },
    form: formTokens,
    gradients: gradientTokens,
    type: typeTokens,
    timing: timingTokens,
    // MUI's own reduced-motion switch: it drops its transition components to
    // zero when the OS asks. The CssBaseline block below covers our own CSS.
    motion: { reducedMotion: "system" },
    // Containers are 16; interactive controls opt down to 8 individually.
    shape: { borderRadius: 16 },
    typography: {
      // Manrope carries all UI — it is the face the brand lockup is set in.
      fontFamily: "var(--font-manrope), 'Manrope', system-ui, sans-serif",
      // Space Grotesk carries display: page titles and figures. Sizes are the
      // kit's display scale — without them MUI's own defaults apply, which are
      // 96/60/48px at weight 300, nothing like this design.
      h1: {
        fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
        fontSize: 64,
        lineHeight: "80px",
        fontWeight: 800,
        letterSpacing: "-0.02em",
      },
      h2: {
        fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
        fontSize: 48,
        lineHeight: "64px",
        fontWeight: 800,
        letterSpacing: "-0.02em",
      },
      h3: {
        fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
        fontSize: 32,
        lineHeight: "48px",
        fontWeight: 700,
        letterSpacing: "-0.01em",
      },
      h4: {
        fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
        fontSize: 24,
        lineHeight: "36px",
        fontWeight: 700,
        letterSpacing: "-0.01em",
      },
      h5: { fontSize: 20, lineHeight: "30px", fontWeight: 700 },
      h6: { fontSize: 18, lineHeight: "28px", fontWeight: 600 },
      subtitle1: { fontSize: 16, lineHeight: "24px", fontWeight: 600 },
      subtitle2: { fontSize: 14, lineHeight: "22px", fontWeight: 600 },
      body1: { fontSize: 14, lineHeight: "22px" },
      body2: { fontSize: 13, lineHeight: "20px", color: v.textSecondary },
      caption: { fontSize: 12, lineHeight: "18px" },
      overline: {
        fontSize: 11,
        lineHeight: "18px",
        fontWeight: 700,
        letterSpacing: "0.09em",
        color: v.textSecondary,
      },
      button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // The design sets the link colour globally; the navy lifts on dark.
          a: { color: v.linkFg, textDecoration: "none" },
          // Foundations F10 / Principle 04: focus is always visible, and it is
          // the action colour on a 2px ring offset 2px clear of the control.
          // Written as one `:where()` rule so it costs no specificity and any
          // component override still wins.
          ":where(a,button,[role='button'],input,select,textarea,[tabindex]):focus-visible": {
            outline: "2px solid var(--mui-palette-primary-main)",
            outlineOffset: 2,
          },
          // Density is a root attribute, set once per user. It changes vertical
          // rhythm only (F03) — the table reads these two vars, nothing else.
          ":root": {
            "--recruit-row-px": "13px",
            "--recruit-cell-px": "16px",
            // The motion compositions, as vars, so a component's `sx` can use
            // them as a plain string without reaching for a theme callback.
            "--recruit-motion-state": timingTokens.state,
            "--recruit-motion-enter": timingTokens.enter,
            "--recruit-motion-exit": timingTokens.exit,
          },
          ":root[data-density='comfortable']": { "--recruit-row-px": "17px" },
          ":root[data-density='compact']": { "--recruit-row-px": "13px" },
          ":root[data-density='dense']": {
            "--recruit-row-px": "9px",
            "--recruit-cell-px": "12px",
          },
          "@media (prefers-reduced-motion: reduce)": {
            "*, *::before, *::after": {
              animationDuration: "0.01ms !important",
              animationIterationCount: "1 !important",
              transitionDuration: "0.01ms !important",
              scrollBehavior: "auto !important",
            },
          },
        },
      },
      MuiLink: {
        styleOverrides: {
          root: { color: v.linkFg, textDecorationColor: "currentColor" },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            // Foundations F05: buttons, alerts and fields take the 8px step.
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 14,
            lineHeight: "24px",
            minHeight: 36,
            padding: "6px 16px",
            // MUI pulls icons 4px outward (marginLeft/-Right: -4px), which eats
            // into the 16px padding. The design is a plain 8px gap inside it.
            "& .MuiButton-startIcon": { marginLeft: 0, marginRight: "8px" },
            "& .MuiButton-endIcon": { marginRight: 0, marginLeft: "8px" },
          },
          sizeSmall: { minHeight: 30, fontSize: 13, lineHeight: "22px", padding: "4px 12px" },
          sizeLarge: { minHeight: 48, fontSize: 15, lineHeight: "26px", padding: "10px 20px" },
        },
        variants: [
          {
            props: { variant: "contained", color: "primary" },
            style: {
              background: "var(--mui-palette-primary-main)",
              boxShadow: v.primaryShadow,
              "&:hover": { background: "var(--mui-palette-primary-dark)" },
            },
          },
          {
            props: { variant: "contained", color: "secondary" },
            style: {
              background: "var(--mui-palette-secondary-main)",
              color: "var(--mui-palette-secondary-contrastText)",
              "&:hover": { background: "var(--mui-palette-secondary-dark)" },
            },
          },
          {
            props: { variant: "outlined" },
            style: {
              borderColor: v.border,
              color: v.textPrimary,
              "&:hover": { borderColor: v.borderStrong, background: v.hover },
            },
          },
          {
            props: { variant: "soft" },
            style: {
              background: v.primarySoftBg,
              border: `1px solid ${v.primarySoftBorder}`,
              color: v.primarySoftFg,
              "&:hover": { background: v.optionSelectedBg, borderColor: v.primarySoftFg },
            },
          },
        ],
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            width: 36,
            height: 36,
            borderRadius: 999,
            border: `1px solid ${v.border}`,
            color: v.textSecondary,
            "&:hover": { background: v.hover, color: v.textPrimary },
            "& svg": { fontSize: 18 },
          },
          sizeSmall: { width: 30, height: 30, "& svg": { fontSize: 16 } },
        },
        variants: [
          {
            props: { color: "primary" },
            style: {
              color: v.primarySoftFg,
              background: v.primarySoftBg,
              border: `1px solid ${v.primarySoftBorder}`,
              "&:hover": { background: v.optionSelectedBg },
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
          root: { fontSize: 12, fontWeight: 700, width: 34, height: 34 },
          // F05: avatars are rounded 12; the circular variant stays circular.
          rounded: { borderRadius: 12 },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            background: v.dropdownPanel,
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
            fontSize: 13.5,
            color: v.textMuted,
            padding: "9px 11px",
            gap: 10,
            "&:hover": { background: v.hover, color: v.textPrimary },
            // The design tints the chosen row with the action colour rather
            // than MUI's grey `action.selected`.
            "&.Mui-selected": { background: v.primarySoftBg, color: v.textPrimary },
            "&.Mui-selected:hover": { background: v.optionSelectedBg, color: v.textPrimary },
            "&.Mui-selected.Mui-focusVisible": { background: v.optionSelectedBg },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          // F05: chips take the 10px step.
          root: { borderRadius: 10, fontWeight: 700, fontSize: 13, height: 28 },
          sizeSmall: { height: 24, fontSize: 12, borderRadius: 8 },
        },
        variants: [...softChip, ...pillChip, ...badgeChip],
      },
      MuiPaper: {
        styleOverrides: {
          // Separation comes from shadow, not a border — a card never carries
          // both. Overlay surfaces re-add the hairline in their own variant.
          root: { backgroundImage: "none", borderRadius: 16 },
        },
        variants: [
          {
            props: { variant: "dropdown" },
            style: {
              background: v.dropdownPanel,
              border: `1px solid ${v.border}`,
              borderRadius: 12,
              boxShadow: v.menuShadow,
              padding: 6,
              // Above the modal layer, so a dropdown opened inside a dialog is
              // not occluded by it. F06 keeps the scale identical to MUI's.
              zIndex: 1301,
            },
          },
        ],
      },
      MuiCard: {
        defaultProps: { variant: "base" },
        styleOverrides: {
          root: { borderRadius: 16, padding: 20 },
        },
        variants: [
          {
            props: { variant: "base" },
            style: { background: v.paper, boxShadow: v.cardShadow },
          },
          {
            // The design's 14/18 and 16/18 tiles (SLA status, summary strips).
            props: { variant: "compact" },
            style: { background: v.paper, boxShadow: v.cardShadow, padding: "18px 20px" },
          },
          {
            props: { variant: "interactive" },
            style: {
              background: v.paper,
              boxShadow: v.cardShadow,
              cursor: "pointer",
              transition: `box-shadow ${timingTokens.durBase} ${timingTokens.easeStandard}`,
              "&:hover": { boxShadow: v.menuShadow },
            },
          },
          {
            props: { variant: "accent" },
            style: {
              background: `linear-gradient(180deg,${v.heroTint},${v.paper} 60%),${v.paper}`,
              boxShadow: v.cardShadow,
            },
          },
          {
            // The sidenav's upgrade promo — the brand navy slab.
            props: { variant: "promo" },
            style: {
              background: v.slab,
              color: v.slabFg,
              borderRadius: 12,
              padding: 16,
            },
          },
          {
            // The AI recommendation card: the action tint on its own border.
            props: { variant: "spotlight" },
            style: {
              background: v.heroTint,
              border: `1px solid ${v.heroBorder}`,
              borderRadius: 16,
              padding: "16px 18px",
            },
          },
          {
            props: { variant: "feature" },
            style: {
              background: `radial-gradient(120% 140% at 85% 0%,${v.heroTint},${v.paper} 65%),${v.paper}`,
              boxShadow: v.cardShadow,
              padding: 20,
            },
          },
          {
            props: { variant: "ghost" },
            style: {
              background: "transparent",
              // The dashed rule is the kit's signature; it also marks drop zones.
              border: `1.5px dashed ${v.border}`,
              boxShadow: "none",
              cursor: "pointer",
              textAlign: "center",
              transition: `border-color ${timingTokens.durBase} ${timingTokens.easeStandard},background ${timingTokens.durBase} ${timingTokens.easeStandard}`,
              "&:hover": { borderColor: v.primarySoftFg, background: v.primarySoftBg },
            },
          },
          {
            // A well inside a card: no second shadow, F06.
            props: { variant: "inset" },
            style: {
              background: v.inset,
              boxShadow: "none",
              borderRadius: 12,
              padding: "12px 14px",
            },
          },
          {
            // A tile you pick one of: role cards, the "start from" presets.
            // Selection is the action tint on its own border, set through
            // `data-selected` so the caller stays declarative.
            props: { variant: "selectable" },
            style: {
              background: "transparent",
              border: `1px solid ${v.border}`,
              boxShadow: "none",
              borderRadius: 12,
              padding: "15px 16px",
              cursor: "pointer",
              transition: `background ${timingTokens.durBase} ${timingTokens.easeStandard},border-color ${timingTokens.durBase} ${timingTokens.easeStandard}`,
              "&:hover": { background: v.hover },
              "&[data-selected='true']": {
                borderColor: v.primarySoftFg,
                background: v.primarySoftBg,
              },
            },
          },
          {
            // "The one thing in motion" — the amber edge, used once per screen.
            props: { variant: "highlight" },
            style: {
              background: v.paper,
              boxShadow: v.cardShadow,
              border: `1px solid ${v.accentBright}`,
            },
          },
        ],
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: formTokens.controlRadius,
            background: v.field,
            fontSize: formTokens.controlFontSize,
          },
          // Two deviations from MUI's defaults, both to land on the design's
          // 54px field: it pins the input to `height: 1.4375em` (~1px too
          // tall), and it paints the outline on an absolutely-positioned
          // fieldset, so — unlike the design's bordered <input> — that 1px edge
          // adds no layout height. Hence the +1px on each side.
          input: {
            paddingBlock: `calc(${formTokens.controlPadY} - 5px)`,
            paddingInline: formTokens.controlPadX,
            lineHeight: "22px",
            height: "auto",
          },
          notchedOutline: { borderColor: v.controlBorder },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          // The design labels a field above it at 12/20 bold, not as a notch.
          root: { fontSize: 12, lineHeight: "20px", fontWeight: 700, color: v.textMuted },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: { fontSize: 12, lineHeight: "18px", marginLeft: 0, marginTop: 6 },
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
          icon: { fontSize: 20, color: v.textSecondary, right: formTokens.controlPadX },
        },
      },
      MuiAutocomplete: {
        defaultProps: { popupIcon: createElement(ExpandMoreRounded) },
        styleOverrides: {
          // The type-ahead popover, matched to the plain Select menu.
          paper: {
            backgroundImage: "none",
            background: v.dropdownPanel,
            border: `1px solid ${v.border}`,
            borderRadius: 12,
            boxShadow: v.menuShadow,
          },
          listbox: { padding: 6, maxHeight: 260 },
          inputRoot: {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: formTokens.controlPadX,
            // Nested so it outranks Autocomplete's own `.MuiAutocomplete-input`
            // padding, which is written at that same depth.
            "& .MuiAutocomplete-input": {
              paddingTop: `calc(${formTokens.controlPadY} - 5px)`,
              paddingBottom: `calc(${formTokens.controlPadY} - 5px)`,
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
            color: v.textSecondary,
            "& .MuiSvgIcon-root": { fontSize: 20 },
            "&:hover": { background: "none" },
          },
          clearIndicator: {
            border: "none",
            background: "none",
            padding: 0,
            color: v.textSecondary,
            "& .MuiSvgIcon-root": { fontSize: 16 },
            "&:hover": { background: "none" },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: v.paper,
            borderRadius: 16,
            // F07: higher casts further, not darker — a dialog is the top step
            // of the ramp and must not share the dropdown's throw.
            boxShadow: v.dialogShadow,
            backgroundImage: "none",
          },
        },
      },
      MuiBackdrop: {
        styleOverrides: { root: { backgroundColor: v.backdrop } },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: "11px 13px",
            fontSize: 12.5,
            fontWeight: 600,
            lineHeight: 1.5,
            alignItems: "flex-start",
            // MUI pads both slots (icon 7px 0, message 8px 0) and dims the icon
            // to .9 — that stacks on the root padding and makes the strip taller
            // and greyer than the design. Flatten them; the row is a plain flex.
            "& .MuiAlert-icon": {
              color: "inherit",
              fontSize: 17,
              opacity: 1,
              padding: 0,
              marginRight: 9,
            },
            "& .MuiAlert-message": { padding: 0, minWidth: 0, overflow: "visible" },
          },
        },
        variants: [
          {
            // The action-tinted insight strip — MUI has no primary severity.
            props: { variant: "accent" },
            style: {
              background: v.primarySoftBg,
              color: v.primarySoftFg,
            },
          },
          {
            props: { severity: "info", variant: "standard" },
            style: { background: v.infoSoftBg, color: v.infoFg },
          },
          {
            props: { severity: "success", variant: "standard" },
            style: { background: v.successSoftBg, color: v.successFg },
          },
          {
            props: { severity: "warning", variant: "standard" },
            style: { background: v.warningSoftBg, color: v.warningFg },
          },
          {
            props: { severity: "error", variant: "standard" },
            style: { background: v.errorSoftBg, color: v.errorFg },
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
            // with a raised pill for the selected option.
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
                minHeight: 0,
                fontSize: 13,
                fontWeight: 700,
                color: v.textSecondary,
                "&.Mui-selected": { color: v.textPrimary, background: v.pillActive },
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
            fontSize: 13,
            fontWeight: 600,
            color: v.textSecondary,
            transition: `background ${timingTokens.durBase} ${timingTokens.easeStandard},color ${timingTokens.durBase} ${timingTokens.easeStandard}`,
            "&.Mui-selected": { color: v.textPrimary, fontWeight: 700, background: v.pillActive },
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
              "& + .MuiSwitch-track": {
                backgroundColor: "var(--mui-palette-primary-main)",
                opacity: 1,
              },
            },
          },
          thumb: { width: 20, height: 20, boxShadow: "none", color: "#fff" },
          track: { borderRadius: 999, backgroundColor: v.neutral, opacity: 1 },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: v.controlOutline,
            "&.Mui-checked": { color: "var(--mui-palette-primary-main)" },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: v.controlOutline,
            "&.Mui-checked": { color: "var(--mui-palette-primary-main)" },
          },
        },
      },
      // The numeric family of Badge — the count overlaid on an icon. The
      // inline status-label family is `Chip variant="badge"`, not this.
      MuiBadge: {
        defaultProps: { max: 99 },
        styleOverrides: {
          badge: {
            fontSize: 10,
            fontWeight: 700,
            lineHeight: "16px",
            minWidth: 16,
            height: 16,
            padding: "0 4px",
            borderRadius: 999,
          },
          dot: { minWidth: 7, height: 7, padding: 0 },
        },
      },
      // The one place amber earns its keep in a form: a rating is a live
      // figure, which is exactly what `secondary` marks.
      MuiRating: {
        styleOverrides: {
          root: { color: "var(--mui-palette-secondary-main)", fontSize: 20, gap: "2px" },
          iconEmpty: { color: v.controlOutline },
          iconFilled: { color: "var(--mui-palette-secondary-main)" },
          iconHover: { color: "var(--mui-palette-secondary-light)" },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 999, backgroundColor: v.track },
          bar: { borderRadius: 999 },
        },
      },
      MuiStepConnector: {
        // Stepper connectors are dashed, like every other divide in the kit.
        styleOverrides: { line: { borderColor: v.border, borderStyle: "dashed" } },
      },
      MuiStepIcon: {
        styleOverrides: {
          root: {
            color: v.neutral,
            "&.Mui-active": { color: "var(--mui-palette-primary-main)" },
            "&.Mui-completed": { color: "var(--mui-palette-success-main)" },
          },
          text: { fill: "#FFFFFF", fontSize: 11 },
        },
      },
      MuiPaginationItem: {
        styleOverrides: {
          root: {
            width: 30,
            height: 30,
            minWidth: 30,
            margin: "0 3px",
            fontSize: 13,
            fontWeight: 700,
            color: v.textSecondary,
            borderRadius: 999,
            "&:hover": { background: v.hover },
            "&.Mui-selected": {
              background: v.primarySoftBg,
              color: v.primarySoftFg,
              borderColor: "transparent",
            },
          },
          page: { border: `1px solid ${v.divider}` },
          previousNext: { border: `1px solid ${v.border}`, color: v.textPrimary },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            background: v.paper,
            boxShadow: v.cardShadow,
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
            // Vertical step follows `data-density`; the horizontal cell gutter
            // is the design's 16px (12 when dense).
            padding: "var(--recruit-row-px, 13px) var(--recruit-cell-px, 16px)",
            fontSize: 13.5,
            color: v.textPrimary,
          },
          head: {
            color: v.textSecondary,
            fontSize: typeTokens.tableHead,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            background: v.headBg,
            padding: "10px var(--recruit-cell-px, 16px)",
            "&:first-of-type": { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
            "&:last-of-type": { borderTopRightRadius: 8, borderBottomRightRadius: 8 },
          },
          // The kit's most recognisable signature: row rules are dashed.
          body: { borderBottom: `1px dashed ${v.divider}` },
        },
      },
      MuiTableSortLabel: {
        styleOverrides: {
          root: { "&.Mui-active": { color: v.textPrimary } },
          icon: { fontSize: 15, color: `${v.primarySoftFg} !important` },
        },
      },
      // ---- MUI X pickers ------------------------------------------------
      // The calendar and clock ship with their own chrome; these pull them
      // onto the kit's surfaces so a date field looks like every other field.
      MuiPickerPopper: {
        styleOverrides: {
          paper: {
            background: v.dropdownPanel,
            backgroundImage: "none",
            border: `1px solid ${v.border}`,
            borderRadius: 12,
            boxShadow: v.menuShadow,
          },
        },
      },
      MuiDateCalendar: {
        styleOverrides: {
          root: { color: v.textPrimary },
        },
      },
      MuiPickersCalendarHeader: {
        styleOverrides: {
          label: { fontSize: 13, fontWeight: 700 },
        },
      },
      MuiDayCalendar: {
        styleOverrides: {
          weekDayLabel: {
            fontSize: typeTokens.micro,
            fontWeight: 700,
            letterSpacing: ".06em",
            color: v.textDisabled,
            textTransform: "uppercase",
          },
        },
      },
      MuiPickerDay: {
        styleOverrides: {
          root: {
            fontSize: typeTokens.bodyDense,
            fontWeight: 500,
            // F05: a day cell is interactive, so it takes the 8px step.
            borderRadius: 8,
            "&:hover": { background: v.hover },
            "&.Mui-selected": {
              fontWeight: 700,
              background: "var(--mui-palette-primary-main)",
              color: "var(--mui-palette-primary-contrastText)",
            },
            // Today is a ring, not a fill — a fill would compete with the
            // selection sitting beside it.
            "&.MuiPickersDay-today:not(.Mui-selected)": {
              borderColor: v.primarySoftBorder,
            },
          },
        },
      },
      MuiYearCalendar: {
        styleOverrides: {
          root: { "& .MuiPickersYear-yearButton": { fontSize: typeTokens.bodyDense } },
        },
      },
      MuiMonthCalendar: {
        styleOverrides: {
          root: { "& .MuiPickersMonth-monthButton": { fontSize: typeTokens.bodyDense } },
        },
      },
      MuiMultiSectionDigitalClock: {
        styleOverrides: {
          root: { border: "none" },
        },
      },
      MuiMultiSectionDigitalClockSection: {
        styleOverrides: {
          root: { borderColor: v.divider },
          item: {
            fontSize: typeTokens.bodyDense,
            borderRadius: 8,
            "&.Mui-selected": {
              background: "var(--mui-palette-primary-main)",
              color: "var(--mui-palette-primary-contrastText)",
            },
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: v.inset,
            color: v.textPrimary,
            border: `1px solid ${v.border}`,
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            padding: "6px 10px",
            boxShadow: v.menuShadow,
          },
          arrow: { color: v.inset },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: v.divider } },
      },
    },
  });
}

// Default theme (back-compat for direct `theme` imports).
export const theme = createAppTheme();

/**
 * The design draws two field sizes — 54px in the form column and 40px in a
 * side rail (or any equally dense panel). Spread these vars onto a container
 * and every control inside it — themed inputs and the type-ahead alike — picks
 * the smaller metrics up.
 */
export const denseFormVars = {
  "--recruit-control-pad-x": "14px",
  "--recruit-control-pad-y": "14px",
  "--recruit-control-font": "14px",
} as const;

export const linkSx = {
  accent: {
    fontSize: 13,
    fontWeight: 600,
    color: "surface.linkFg",
    textDecoration: "none",
    "&:hover": { textDecoration: "underline" },
  },
  accentSoft: {
    fontWeight: 600,
    color: "surface.primarySoftFg",
    textDecoration: "none",
    "&:hover": { color: "primary.light" },
  },
  inline: {
    fontSize: "inherit",
    fontWeight: 700,
    color: "surface.linkFg",
    textDecoration: "none",
    "&:hover": { textDecoration: "underline" },
  },
} as const;
