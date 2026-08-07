import type { CardProps } from "@mui/material/Card";
import type { SxProps, Theme } from "@mui/material/styles";
import type { GenericRendererConfig } from "../renderers/generic-renderer";
import type { IconRendererConfig } from "../renderers/icon-renderer";
import type { LinkRendererConfig } from "../renderers/link-renderer";

/** The translation function from useTranslation(id). */
export type T = (key: string, vars?: Record<string, unknown>) => string;

/** Kicker looks. `feature` is the wide-tracked tan label over a feature card;
 * `accent` is the tighter orange one with a leading icon. */
export type CardKickerVariant = "feature" | "accent" | "title";

export interface CardHeaderConfig {
  /** Small label on the left. `name` is a translation key. */
  kicker?: { name: string; icon?: string; variant?: CardKickerVariant };
  /** Right-hand value — any GenericRenderer config (a countdown string, a date,
   * a status chip). */
  aside?: GenericRendererConfig;
}

/**
 * One row of card content. Everything a row can show is a **GenericRenderer**
 * config — `entity`, `static-translation`, `ai-match`, `pill`, `status`, … — so
 * cards reuse the same value vocabulary as tables and stat cards. The card only
 * owns the row layout: an optional leading icon, spacing, and the hairline.
 */
export type CardBodyRow =
  | { divider: true; sx?: SxProps<Theme> }
  | {
      divider?: false;
      icon?: IconRendererConfig;
      value: GenericRendererConfig;
      sx?: SxProps<Theme>;
    };

/** A pill in the footer. `link` navigates; `action` emits an actionHandler key. */
export interface CardActionConfig {
  label: { name: string };
  icon?: string;
  /** `primary` is the solid pill, `outlined` the bordered one, `ghost` the
   * translucent fill used on tinted cards. */
  variant?: "primary" | "outlined" | "ghost";
  action?: string;
  link?: LinkRendererConfig;
}

export interface CardFooterConfig {
  actions?: CardActionConfig[];
  /** Right-aligned circular icon link. */
  trailingAction?: { icon: string; link: LinkRendererConfig };
}

export interface CardRendererConfig {
  /** Theme Card variant — it owns the chrome AND the padding: `feature` (radial
   * accent glow, 20px), `spotlight` (accent wash, 16/18), `compact` (16/18),
   * `base` (20/22). Never set padding from config. */
  variant?: CardProps["variant"];
  header?: CardHeaderConfig;
  body?: CardBodyRow[];
  footer?: CardFooterConfig;
  /** Wraps the whole card in a link. */
  link?: LinkRendererConfig;
  /** Render only when this data path resolves truthy and non-zero — so a card
   * about a thing that does not exist disappears instead of showing blanks. */
  showPath?: string;
}
