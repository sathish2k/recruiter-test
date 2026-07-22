import type { AccessRule } from "@recruit/sdk";
import type { ReactNode } from "react";
import type { ExportConfig } from "../export";
import type { FilterConfig } from "../filters";
import type { JsonSchema } from "../forms";
import type {
  ActionItem,
  EmptyStateConfig,
  GenericRendererConfig,
  LinkRendererConfig,
} from "../renderers";

export type Row = Record<string, unknown>;
export type SortState = { key: string; dir: "asc" | "desc" } | null;

/** A one-off cell whose `type` is a key into the table's `cells` map (any
 * `type` not handled by a built-in GenericRenderer type). */
export interface CustomCellConfig {
  type: string;
}

/** A column/footer cell: a built-in GenericRenderer config, or a custom cell
 * resolved by its `type` from the table's `cells` map. */
export type CellConfig = GenericRendererConfig | CustomCellConfig;

/** One-off cell renderers passed to TableRenderer via `cells`, keyed by a
 * custom cell's `type`; each receives the row and returns the cell content. */
export type Cells = Record<string, (row: Row) => ReactNode>;
/** The translation function returned by useTranslation(id). */
export type TFunc = (key: string, fallback?: string | Record<string, unknown>) => string;

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
  /** Cell config: a built-in GenericRenderer type, or a custom `type` resolved
   * from the table's `cells` map. */
  value: CellConfig;
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
  /** First-run empty state (icon tile + heading + subtext + CTAs) shown when
   * there are zero rows AND no active filter/search. A filter/search that
   * empties the list keeps the plain `emptyLabel` "no results" treatment. */
  emptyState?: EmptyStateConfig;
  /** Client-side pagination; omit to render every row. */
  pagination?: { pageSize: number };
  /** Optional totals row rendered after the body. One cell config per column
   * (aligned to `columns`); rendered against the `footerData` row. */
  footer?: { cells: CellConfig[] };
}

/** A toolbar call-to-action button (e.g. "Add"). */
export interface TableCta {
  label: ColumnLabel;
  /** ICON_REGISTRY name; the toolbar sizes it consistently. */
  icon?: string;
  /** Navigate to this route id on click. */
  routeId?: string;
  /** Emit this action key to the component's onCta handler on click. */
  action?: string;
  variant?: "primary" | "secondary";
  /** Access rule verified + stripped by the engine before render. */
  access?: AccessRule;
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
