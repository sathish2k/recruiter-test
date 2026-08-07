export type GraphRow = Record<string, unknown>;

/** The translation function from useTranslation(id). */
export type TFuncLike = (key: string, fallback?: string) => string;

export type GraphType = "bar" | "line" | "area" | "pie" | "donut";

export interface GraphSeries {
  /** Series name — translation key resolved via useTranslation(id). */
  label: string;
  /** Path into each row for this series' numeric value. */
  path: string;
  color?: string;
}

export interface GraphHeader {
  /** Title translation key. */
  title?: string;
  /** Subtitle translation key. */
  subtitle?: string;
}

export interface GraphRendererConfig {
  type: GraphType;
  header?: GraphHeader;
  /** Cartesian (bar/line/area): path into each row for the x-axis category. */
  categoryPath?: string;
  /** Translate each category: the row value is a key appended to this prefix
   * (e.g. `"stage."` + `"screening"`), mirroring FunnelRenderer's
   * `stageLabelPrefix`. Omit to plot the raw value. */
  categoryLabelPrefix?: string;
  /** `datetime` lets ApexCharts format an ISO-date category axis itself. */
  categoryType?: "category" | "datetime";
  /** Cartesian: one entry per plotted series. */
  series?: GraphSeries[];
  /** Circular (pie/donut): path for the slice label. */
  labelPath?: string;
  /** Circular: path for the slice value. */
  valuePath?: string;
  stacked?: boolean;
  height?: number;
  /** Palette override (per series / per slice). */
  colors?: string[];
  legend?: boolean;
  /** Number formatting for axis + tooltip values. */
  valueType?: "number" | "currency" | "percentage";
  /**
   * Segmented metric picker above the chart. Each entry names the series it
   * plots, so one card serves the design's Revenue / Placements / Submissions
   * toggle without a component per metric. The first is selected on mount.
   */
  metrics?: {
    label: string;
    series: GraphSeries[];
    valueType?: GraphRendererConfig["valueType"];
  }[];
  /** First-run overlay shown over a faint axis frame when there are no rows.
   * `icon`/`title`/`description` are an ICON_REGISTRY name + translation keys. */
  emptyOverlay?: { icon: string; title: string; description: string };
}

/** Client-side filter dropdown over a row field. */
export interface GraphFilter {
  /** Path into each row to filter on. */
  key: string;
  /** Label translation key. */
  label: string;
  options: { value: string; label: string }[];
}

/** GraphRenderer + client-side filters and category pagination. */
export interface GraphFilterConfig extends GraphRendererConfig {
  filters?: GraphFilter[];
  /** Categories/slices shown per page (client-side). Omit for no pagination. */
  pageSize?: number;
}
