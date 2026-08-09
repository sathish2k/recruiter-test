/**
 * The one tone ramp. Twelve components used to declare their own copy of this
 * map, which is how eleven of them ended up with a hardcoded error tint that
 * only matched the token on light.
 *
 * Two notations, same values: `sx` paths for anything that goes through MUI's
 * system prop, and CSS custom properties for `style`/`background` strings.
 */
export type Tone =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "violet"
  | "muted";

export const TONE_FG: Record<Tone, string> = {
  primary: "surface.primarySoftFg",
  // The amber pilot dot — the one thing in motion on a screen.
  secondary: "surface.accentBright",
  success: "surface.successFg",
  warning: "surface.warningFg",
  error: "surface.errorFg",
  info: "surface.infoFg",
  violet: "surface.violetFg",
  muted: "text.secondary",
};

export const TONE_BG: Record<Tone, string> = {
  primary: "surface.primarySoftBg",
  secondary: "surface.warningSoftBg",
  success: "surface.successSoftBg",
  warning: "surface.warningSoftBg",
  error: "surface.errorSoftBg",
  info: "surface.infoSoftBg",
  violet: "surface.violetSoftBg",
  muted: "surface.tint",
};

export const TONE_BORDER: Record<Tone, string> = {
  primary: "surface.primarySoftBorder",
  secondary: "surface.warningSoftBorder",
  success: "surface.successSoftBorder",
  warning: "surface.warningSoftBorder",
  error: "surface.errorSoftBorder",
  info: "surface.infoSoftBorder",
  violet: "surface.violetSoftBg",
  muted: "surface.border",
};

const cssVar = (map: Record<Tone, string>): Record<Tone, string> =>
  Object.fromEntries(
    Object.entries(map).map(([tone, path]) => [
      tone,
      `var(--mui-palette-${path.replace(/\./g, "-")})`,
    ]),
  ) as Record<Tone, string>;

/** The same ramps as CSS custom properties, for `style` and gradient strings. */
export const TONE_FG_VAR = cssVar(TONE_FG);
export const TONE_BG_VAR = cssVar(TONE_BG);
export const TONE_BORDER_VAR = cssVar(TONE_BORDER);
