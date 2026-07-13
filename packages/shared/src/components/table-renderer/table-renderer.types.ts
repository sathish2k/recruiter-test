import type { ExportConfig } from "../export";
import type { FilterConfig } from "../filters";
import type { GenericRendererConfig, LinkRendererConfig } from "../renderers";

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

export interface TableRendererConfig {
  columns: TableColumnConfig[];
  /** Trailing actions column — link-renderer configs resolved per row. */
  actions?: LinkRendererConfig[];
  /** Translation key for the actions column header (default "actions"). */
  actionsLabel?: ColumnLabel;
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
}
