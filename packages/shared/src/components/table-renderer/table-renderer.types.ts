import type { ExportConfig } from "../export";
import type { FilterConfig } from "../filters";
import type { JsonSchema } from "../form-renderer";
import type {
  ActionItem,
  GenericRendererConfig,
  LinkRendererConfig,
} from "../renderers";

export type Row = Record<string, unknown>;
export type SortState = { key: string; dir: "asc" | "desc" } | null;
/** The translation function returned by useTranslation(id). */
export type TFunc = (
  key: string,
  fallback?: string | Record<string, unknown>,
) => string;

export interface ColumnLabel {
  /** Translation key resolved via useTranslation(id). */
  name: string;
}

export interface ColumnSort {
  /** Data path to sort rows by when the header is clicked (client-side). */
  key: string;
}

export interface TableColumnConfig {
  label: ColumnLabel;
  /** Cell renderer config, dispatched by GenericRenderer (type + path + …). */
  value: GenericRendererConfig;
  align?: "left" | "center" | "right";
  width?: number | string;
  sort?: ColumnSort;
}

/** Optional titled header rendered inside the table card, above the columns. */
export interface TableHeaderConfig {
  /** Leading icon-tile name (see ICON_REGISTRY). */
  icon?: string;
  /** Title translation key. */
  title?: string;
  /** Subtitle translation key — interpolated with the fetch `meta` (e.g.
   * "{{addedThisWeek}} added this week · {{interviewing}} interviewing"). */
  subtitle?: string;
  /** Trailing link (e.g. "View all") — a plain link-renderer config. */
  action?: LinkRendererConfig;
  /** Trailing icon shown after the action text (see ICON_REGISTRY). */
  actionIcon?: string;
}

export interface TableRendererConfig {
  columns: TableColumnConfig[];
  /** Titled header rendered inside the card, above the column header. */
  header?: TableHeaderConfig;
  /** Trailing actions column — rendered as a per-row kebab (⋮) menu. Each item
   * is a link (routeId/href) or a custom action dispatched via actionHandler. */
  actions?: ActionItem[];
  /** Translation key for the actions column header (default "actions"). */
  actionsLabel?: ColumnLabel;
  /** Navigate to this route id when a row is clicked. */
  rowRouteId?: string;
  /** Translation key shown when there are no rows (default "noData"). */
  emptyLabel?: string;
  /** Client-side pagination; omit to render every row. */
  pagination?: { pageSize: number };
}

/** A toolbar call-to-action button (e.g. "Add"). */
export interface TableCta {
  label: ColumnLabel;
  icon?: "add" | "download" | "upload";
  /** Navigate to this route id on click. */
  routeId?: string;
  /** Emit this action key to the component's onCta handler on click. */
  action?: string;
  variant?: "primary" | "secondary";
}

/** TableRenderer + a toolbar of filters, CTAs and an export button. */
export interface TableFilterExportConfig extends TableRendererConfig {
  filters?: FilterConfig[];
  export?: ExportConfig;
  ctas?: TableCta[];
  /** Filename base for exports (default the component id). */
  exportFilename?: string;
  /** JSON-schema for the "add" CTA's FormModal (opened by the host component). */
  addForm?: JsonSchema;
}
